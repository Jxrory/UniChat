import hashlib
import hmac
import json
from datetime import datetime, timezone
from typing import Any, AsyncGenerator
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI
from httpx import ASGITransport

from src.bus import (
    get_incoming_bus,
    get_out_coming_bus,
    get_webhook_incoming_bus,
    init_buses,
)
from src.config import AppConfig, InboxConfig, ServerConfig
from src.db import create_all, dispose_engine, get_session, init_db
from src.models import Contact, ContactInbox, Conversation, Message

_WEB_INBOX = InboxConfig(
    id="web",
    name="Web Widget",
    channel_type="web",
    config={"embed_key": "test-embed-key", "hmac_secret": "test-hmac-secret"},
)
_TEST_INBOXES = [
    _WEB_INBOX,
    InboxConfig(
        id="test",
        name="Test Channel",
        channel_type="test",
        config={
            "webhook_secret": "test-test-secret",
            "agentbot_url": "http://localhost:9999",
            "agentbot_token": "test-agentbot-token",
        },
    ),
]
_TEST_SERVER = ServerConfig(
    host="0.0.0.0",
    port=8000,
    admin_token="test-admin-token",
    env="test",
)
_TEST_CONFIG = AppConfig(inboxes=_TEST_INBOXES, server=_TEST_SERVER, database_url="sqlite://")


@pytest.fixture(autouse=True)
def _db() -> Any:
    init_db("sqlite://")
    create_all()
    yield
    dispose_engine()


@pytest.fixture(autouse=True)
def _buses() -> Any:
    init_buses()
    yield


def _subscribe_ingest() -> None:
    from src.services.ingest import IngestService

    svc = IngestService()
    bus = get_webhook_incoming_bus()
    bus.subscribe("WebhookIncoming", svc._handle)


def _subscribe_sender(config: AppConfig | None = None) -> None:
    from src.services.sender import ChannelSender

    if config is None:
        config = _TEST_CONFIG
    svc = ChannelSender(config)
    bus = get_out_coming_bus()
    bus.subscribe("OutComing", svc._handle)


async def _drain_bus(name: str = "WebhookIncoming") -> None:
    bus_map = {
        "WebhookIncoming": get_webhook_incoming_bus(),
        "Incoming": get_incoming_bus(),
        "OutComing": get_out_coming_bus(),
    }
    bus = bus_map[name]
    while not bus._queue.empty():
        event = await bus._queue.get()
        await bus._dispatch(event)


async def _drain_all_buses() -> None:
    for name in ("WebhookIncoming", "Incoming", "OutComing"):
        await _drain_bus(name)


@pytest.fixture
def app() -> FastAPI:
    from src.adapters.web import register as register_web
    from src.adapters.test import register as register_test
    from src.routes.widget import router as widget_router
    from src.routes.reply import router as reply_router

    register_web()
    register_test()

    app = FastAPI()
    app.state.config = _TEST_CONFIG
    app.include_router(widget_router)
    app.include_router(reply_router)
    return app


@pytest.fixture
async def client(app: FastAPI) -> AsyncGenerator[httpx.AsyncClient, Any]:
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.fixture
def app_with_sse() -> FastAPI:
    from src.adapters.web import register as register_web
    from src.adapters.test import register as register_test
    from src.routes.widget import router as widget_router
    from src.routes.reply import router as reply_router

    register_web()
    register_test()

    app = FastAPI()
    app.state.config = _TEST_CONFIG
    app.include_router(widget_router)
    app.include_router(reply_router)

    from src.services.web_session_registry import init_web_session_registry

    reg = init_web_session_registry()
    app.state.web_session_registry = reg
    return app


class TestWebAdapter:
    async def test_send_message_returns_ok(self) -> None:
        from src.adapters.web.adapter import WebAdapter

        adapter = WebAdapter("web", {})
        result = await adapter.send_message("conv-1", "target-1", "hello")
        assert result.ok
        assert result.platform_message_id is not None

    def test_verify_webhook_always_true(self) -> None:
        from src.adapters.web.adapter import WebAdapter

        adapter = WebAdapter("web", {})
        assert adapter.verify_webhook({}, {}, b"") is True
        assert adapter.verify_webhook({"a": "b"}, {"x": "y"}, b"anything") is True

    def test_parse_webhook_always_none(self) -> None:
        from src.adapters.web.adapter import WebAdapter

        adapter = WebAdapter("web", {})
        assert adapter.parse_webhook({}, b"") is None
        assert adapter.parse_webhook({"x": "y"}, b'{"test": true}') is None


class TestWidgetMessageRoute:
    async def test_wrong_embed_key_returns_401(self, client: httpx.AsyncClient) -> None:
        resp = await client.post(
            "/widget/web/messages",
            json={"embed_key": "wrong-key", "content": "hello"},
        )
        assert resp.status_code == 401
        assert resp.json()["error"] == "unauthorized"

    async def test_without_source_id_generates_uuid(self, client: httpx.AsyncClient) -> None:
        resp = await client.post(
            "/widget/web/messages",
            json={"embed_key": "test-embed-key", "content": "hello"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["ok"] is True
        assert data["source_id"] is not None
        assert data["conversation_id"] is not None

        session = get_session()
        try:
            contact = (
                session.query(Contact)
                .filter(Contact.source_id == data["source_id"])
                .first()
            )
            assert contact is not None
        finally:
            session.close()

    async def test_with_source_id_uses_provided(self, client: httpx.AsyncClient) -> None:
        source_id = uuid4().hex
        resp = await client.post(
            "/widget/web/messages",
            json={
                "embed_key": "test-embed-key",
                "source_id": source_id,
                "content": "hello",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["source_id"] == source_id

        session = get_session()
        try:
            contact = (
                session.query(Contact)
                .filter(Contact.source_id == source_id)
                .first()
            )
            assert contact is not None
        finally:
            session.close()

    async def test_same_contact_reuses_conversation(self, client: httpx.AsyncClient) -> None:
        source_id = uuid4().hex
        resp1 = await client.post(
            "/widget/web/messages",
            json={
                "embed_key": "test-embed-key",
                "source_id": source_id,
                "content": "first",
            },
        )
        assert resp1.status_code == 200
        conv_id_1 = resp1.json()["conversation_id"]

        resp2 = await client.post(
            "/widget/web/messages",
            json={
                "embed_key": "test-embed-key",
                "source_id": source_id,
                "content": "second",
            },
        )
        assert resp2.status_code == 200
        conv_id_2 = resp2.json()["conversation_id"]

        assert conv_id_1 == conv_id_2

    async def test_unknown_inbox_returns_404(self, client: httpx.AsyncClient) -> None:
        resp = await client.post(
            "/widget/unknown/messages",
            json={"embed_key": "test", "content": "hello"},
        )
        assert resp.status_code == 404

    async def test_message_creates_records_through_ingest(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_ingest()

        resp = await client.post(
            "/widget/web/messages",
            json={
                "embed_key": "test-embed-key",
                "content": "hello world",
                "client_msg_id": "msg-001",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        conv_id = data["conversation_id"]
        source_id = data["source_id"]

        await _drain_all_buses()

        session = get_session()
        try:
            contact = (
                session.query(Contact)
                .filter(Contact.source_id == source_id)
                .first()
            )
            assert contact is not None

            conversation = (
                session.query(Conversation)
                .filter(Conversation.id == conv_id)
                .first()
            )
            assert conversation is not None
            assert conversation.contact_id == contact.id

            messages = (
                session.query(Message)
                .filter(Message.conversation_id == conv_id)
                .all()
            )
            assert len(messages) == 1
            assert messages[0].content == "hello world"
            assert messages[0].sender_type == "contact"
            assert messages[0].message_type == "incoming"
            assert messages[0].source_id == "msg-001"
        finally:
            session.close()

    async def test_duplicate_client_msg_id_deduplicates(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_ingest()

        payload = {
            "embed_key": "test-embed-key",
            "content": "hello",
            "client_msg_id": "duplicate-msg",
        }

        resp1 = await client.post("/widget/web/messages", json=payload)
        assert resp1.status_code == 200
        await _drain_all_buses()

        resp2 = await client.post("/widget/web/messages", json=payload)
        assert resp2.status_code == 200
        await _drain_all_buses()

        session = get_session()
        try:
            messages = session.query(Message).all()
            assert len(messages) == 1
        finally:
            session.close()


class TestWidgetIdentify:
    async def test_identify_wrong_embed_key_returns_401(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.post(
            "/widget/web/identify",
            json={"embed_key": "wrong-key", "new_user_id": "user-123", "user_hash": "abc"},
        )
        assert resp.status_code == 401
        assert resp.json()["error"] == "unauthorized"

    async def test_identify_wrong_user_hash_returns_401(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.post(
            "/widget/web/identify",
            json={
                "embed_key": "test-embed-key",
                "new_user_id": "user-123",
                "user_hash": "wrong-hash",
            },
        )
        assert resp.status_code == 401
        assert resp.json()["error"] == "unauthorized"

    async def test_identify_no_hmac_secret_returns_401(
        self, client: httpx.AsyncClient
    ) -> None:
        from src.config import InboxConfig, AppConfig, ServerConfig

        no_hmac_config = AppConfig(
            inboxes=[
                InboxConfig(
                    id="no-hmac",
                    name="No HMAC",
                    channel_type="web",
                    config={"embed_key": "test-embed-key"},
                )
            ],
            server=ServerConfig(host="0.0.0.0", port=8000, admin_token="x", env="test"),
            database_url="sqlite://",
        )
        from src.routes.widget import router as widget_router
        from fastapi import FastAPI

        app = FastAPI()
        app.state.config = no_hmac_config
        app.include_router(widget_router)
        transport = ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as c:
            resp = await c.post(
                "/widget/no-hmac/identify",
                json={
                    "embed_key": "test-embed-key",
                    "new_user_id": "user-123",
                    "user_hash": "abc",
                },
            )
        assert resp.status_code == 401
        assert resp.json()["error"] == "unauthorized"

    async def test_identify_resolves_old_conversation(
        self, client: httpx.AsyncClient
    ) -> None:
        old_source_id = uuid4().hex
        new_user_id = "user-456"

        session = get_session()
        try:
            contact = Contact(source_id=old_source_id, name="Old Visitor")
            session.add(contact)
            session.flush()
            ci = ContactInbox(
                contact_id=contact.id, inbox_id="web", source_id=old_source_id
            )
            session.add(ci)
            session.flush()
            old_conv = Conversation(
                inbox_id="web", contact_id=contact.id, status="active"
            )
            session.add(old_conv)
            session.flush()
            old_conv_id = old_conv.id
            session.commit()
        finally:
            session.close()

        user_hash = hmac.new(
            "test-hmac-secret".encode("utf-8"),
            new_user_id.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        resp = await client.post(
            "/widget/web/identify",
            json={
                "embed_key": "test-embed-key",
                "source_id": old_source_id,
                "new_user_id": new_user_id,
                "user_hash": user_hash,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["ok"] is True
        assert data["source_id"] == new_user_id
        new_conv_id = data["conversation_id"]
        assert new_conv_id is not None
        assert new_conv_id != old_conv_id

        session = get_session()
        try:
            old_conv = session.query(Conversation).filter(Conversation.id == old_conv_id).first()
            assert old_conv is not None
            assert old_conv.status == "resolved"

            new_ci = (
                session.query(ContactInbox)
                .filter(
                    ContactInbox.inbox_id == "web",
                    ContactInbox.source_id == new_user_id,
                )
                .first()
            )
            assert new_ci is not None

            new_conv = (
                session.query(Conversation)
                .filter(Conversation.id == new_conv_id)
                .first()
            )
            assert new_conv is not None
            assert new_conv.status == "active"
            assert new_conv.contact_id == new_ci.contact_id
        finally:
            session.close()

    async def test_identify_same_user_id_is_idempotent(
        self, client: httpx.AsyncClient
    ) -> None:
        source_id = "user-same"
        user_hash = hmac.new(
            "test-hmac-secret".encode("utf-8"),
            source_id.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        resp = await client.post(
            "/widget/web/identify",
            json={
                "embed_key": "test-embed-key",
                "source_id": source_id,
                "new_user_id": source_id,
                "user_hash": user_hash,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["ok"] is True
        first_conv_id = data["conversation_id"]

        resp2 = await client.post(
            "/widget/web/identify",
            json={
                "embed_key": "test-embed-key",
                "source_id": source_id,
                "new_user_id": source_id,
                "user_hash": user_hash,
            },
        )
        assert resp2.status_code == 200
        data2 = resp2.json()
        assert data2["conversation_id"] == first_conv_id

    async def test_identify_without_old_source_id(
        self, client: httpx.AsyncClient
    ) -> None:
        new_user_id = "user-no-old"
        user_hash = hmac.new(
            "test-hmac-secret".encode("utf-8"),
            new_user_id.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        resp = await client.post(
            "/widget/web/identify",
            json={
                "embed_key": "test-embed-key",
                "new_user_id": new_user_id,
                "user_hash": user_hash,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["ok"] is True
        assert data["source_id"] == new_user_id
        assert data["conversation_id"] is not None

        session = get_session()
        try:
            ci = (
                session.query(ContactInbox)
                .filter(
                    ContactInbox.inbox_id == "web",
                    ContactInbox.source_id == new_user_id,
                )
                .first()
            )
            assert ci is not None
            contact = ci.contact
            assert contact.source_id == new_user_id
        finally:
            session.close()


class TestWidgetSSE:
    async def test_wrong_embed_key_returns_401(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(source_id="sse-test-src", name="SSE Test")
            session.add(contact)
            session.flush()
            ci = ContactInbox(
                contact_id=contact.id,
                inbox_id="web",
                source_id="sse-test-src",
            )
            session.add(ci)
            session.flush()
            conversation = Conversation(
                inbox_id="web",
                contact_id=contact.id,
                status="active",
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id
            session.commit()
        finally:
            session.close()

        resp = await client.get(
            f"/widget/conversations/{conv_id}/sse",
            params={"embed_key": "wrong-key"},
        )
        assert resp.status_code == 401

    async def test_nonexistent_conversation_returns_404(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.get(
            "/widget/conversations/nonexistent/sse",
            params={"embed_key": "test-embed-key"},
        )
        assert resp.status_code == 404


class TestWebSessionRegistry:
    async def test_get_queue_creates_new(self) -> None:
        from src.services.web_session_registry import WebSessionRegistry

        reg = WebSessionRegistry()
        q = reg.get_queue("conv-1")
        assert q is not None
        assert q is reg.get_queue("conv-1")

    async def test_remove_queue_cleans_up(self) -> None:
        from src.services.web_session_registry import WebSessionRegistry

        reg = WebSessionRegistry()
        reg.get_queue("conv-1")
        assert "conv-1" in reg._queues
        reg.remove_queue("conv-1")
        assert "conv-1" not in reg._queues

    async def test_pushes_outgoing_message_to_queue(self) -> None:
        from src.services.web_session_registry import init_web_session_registry

        reg = init_web_session_registry()
        await reg.start()

        session = get_session()
        try:
            contact = Contact(source_id="test-src", name="Test")
            session.add(contact)
            session.flush()

            conversation = Conversation(
                inbox_id="web",
                contact_id=contact.id,
                status="active",
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id

            msg = Message(
                conversation_id=conv_id,
                inbox_id="web",
                sender_type="agentbot",
                message_type="outgoing",
                content="Bot reply",
                status="pending",
            )
            session.add(msg)
            session.commit()
            msg_id = msg.id
        finally:
            session.close()

        # Register queue with the actual conversation ID
        queue = reg.get_queue(conv_id)

        # Publish to OutComing bus
        out_bus = get_out_coming_bus()
        await out_bus.publish("OutComing", msg_id)
        ev = await out_bus._queue.get()
        await out_bus._dispatch(ev)

        # Check the queue
        import asyncio

        try:
            data = await asyncio.wait_for(queue.get(), timeout=1.0)
            msg_data = json.loads(data)
            assert msg_data["event"] == "message.created"
            assert msg_data["conversation_id"] == conv_id
            assert msg_data["content"] == "Bot reply"
            assert msg_data["sender_type"] == "agentbot"
            assert msg_data["message_type"] == "outgoing"
            assert msg_data["content_type"] == "text"
        except asyncio.TimeoutError:
            pytest.fail("SSE queue timed out waiting for message")
        finally:
            reg.remove_queue(conv_id)

    async def test_skips_handoff_messages(self) -> None:
        from src.services.web_session_registry import init_web_session_registry

        reg = init_web_session_registry()
        await reg.start()
        reg.get_queue("conv-handoff")

        session = get_session()
        try:
            contact = Contact(source_id="handoff-src", name="Test")
            session.add(contact)
            session.flush()

            conversation = Conversation(
                inbox_id="web",
                contact_id=contact.id,
                status="active",
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id

            msg = Message(
                conversation_id=conv_id,
                inbox_id="web",
                sender_type="agentbot",
                message_type="outgoing",
                content="Handoff",
                handoff=True,
                status="pending",
            )
            session.add(msg)
            session.commit()
            msg_id = msg.id
        finally:
            session.close()

        out_bus = get_out_coming_bus()
        await out_bus.publish("OutComing", msg_id)
        ev = await out_bus._queue.get()
        await out_bus._dispatch(ev)

        import asyncio

        queue = reg.get_queue(conv_id)
        with pytest.raises(asyncio.TimeoutError):
            await asyncio.wait_for(queue.get(), timeout=0.1)

    async def test_skips_unrelated_conversations(self) -> None:
        from src.services.web_session_registry import init_web_session_registry

        reg = init_web_session_registry()
        await reg.start()
        reg.get_queue("tracked-conv")

        session = get_session()
        try:
            contact = Contact(source_id="other-src", name="Other")
            session.add(contact)
            session.flush()

            conversation = Conversation(
                inbox_id="web",
                contact_id=contact.id,
                status="active",
            )
            session.add(conversation)
            session.flush()

            msg = Message(
                conversation_id=conversation.id,
                inbox_id="web",
                sender_type="agentbot",
                message_type="outgoing",
                content="For untracked conversation",
                status="pending",
            )
            session.add(msg)
            session.commit()
            msg_id = msg.id
        finally:
            session.close()

        out_bus = get_out_coming_bus()
        await out_bus.publish("OutComing", msg_id)
        ev = await out_bus._queue.get()
        await out_bus._dispatch(ev)

        import asyncio

        tracked_queue = reg.get_queue("tracked-conv")
        with pytest.raises(asyncio.TimeoutError):
            await asyncio.wait_for(tracked_queue.get(), timeout=0.1)


class TestWidgetMessagesHistory:
    async def test_wrong_embed_key_returns_401(self, client: httpx.AsyncClient) -> None:
        session = get_session()
        try:
            contact = Contact(source_id="hist-401-src", name="Test")
            session.add(contact)
            session.flush()
            ci = ContactInbox(
                contact_id=contact.id, inbox_id="web", source_id="hist-401-src"
            )
            session.add(ci)
            session.flush()
            conversation = Conversation(
                inbox_id="web", contact_id=contact.id, status="active"
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id
            session.commit()
        finally:
            session.close()

        resp = await client.get(
            f"/widget/conversations/{conv_id}/messages",
            params={"embed_key": "wrong-key"},
        )
        assert resp.status_code == 401

    async def test_nonexistent_conversation_returns_404(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.get(
            "/widget/conversations/nonexistent/messages",
            params={"embed_key": "test-embed-key"},
        )
        assert resp.status_code == 404

    async def test_returns_messages_in_asc_order(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(source_id="hist-src", name="History Test")
            session.add(contact)
            session.flush()
            ci = ContactInbox(
                contact_id=contact.id, inbox_id="web", source_id="hist-src"
            )
            session.add(ci)
            session.flush()
            conversation = Conversation(
                inbox_id="web", contact_id=contact.id, status="active"
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id

            msg1 = Message(
                conversation_id=conv_id,
                inbox_id="web",
                sender_type="contact",
                message_type="incoming",
                content="first",
                status="sent",
            )
            msg2 = Message(
                conversation_id=conv_id,
                inbox_id="web",
                sender_type="agentbot",
                message_type="outgoing",
                content="second",
                status="sent",
            )
            session.add_all([msg1, msg2])
            session.commit()
        finally:
            session.close()

        resp = await client.get(
            f"/widget/conversations/{conv_id}/messages",
            params={"embed_key": "test-embed-key"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["messages"]) == 2
        assert data["messages"][0]["content"] == "first"
        assert data["messages"][1]["content"] == "second"

    async def test_cannot_access_other_inbox_messages(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(source_id="other-hist-src", name="Other")
            session.add(contact)
            session.flush()
            ci = ContactInbox(
                contact_id=contact.id,
                inbox_id="test",
                source_id="other-hist-src",
            )
            session.add(ci)
            session.flush()
            conversation = Conversation(
                inbox_id="test", contact_id=contact.id, status="active"
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id

            msg = Message(
                conversation_id=conv_id,
                inbox_id="test",
                sender_type="contact",
                message_type="incoming",
                content="test inbox msg",
                status="sent",
            )
            session.add(msg)
            session.commit()
        finally:
            session.close()

        # Try accessing test inbox conversation via widget (uses web embed_key)
        resp = await client.get(
            f"/widget/conversations/{conv_id}/messages",
            params={"embed_key": "test-embed-key"},
        )
        assert resp.status_code == 401


class TestWidgetFullFlow:
    async def test_widget_message_to_sse(
        self, app_with_sse: FastAPI
    ) -> None:
        from src.services.web_session_registry import get_web_session_registry

        transport = ASGITransport(app=app_with_sse)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            reg = get_web_session_registry()
            await reg.start()

            _subscribe_ingest()
            _subscribe_sender()

            resp = await client.post(
                "/widget/web/messages",
                json={
                    "embed_key": "test-embed-key",
                    "content": "Hello from widget",
                    "client_msg_id": "flow-msg-1",
                },
            )
            assert resp.status_code == 200
            data = resp.json()
            conv_id = data["conversation_id"]
            source_id = data["source_id"]

            await _drain_all_buses()

            reg.get_queue(conv_id)

            session = get_session()
            try:
                contact = (
                    session.query(Contact)
                    .filter(Contact.source_id == source_id)
                    .first()
                )
                assert contact is not None

                conversation = (
                    session.query(Conversation)
                    .filter(Conversation.id == conv_id)
                    .first()
                )
                assert conversation is not None

                incoming = (
                    session.query(Message)
                    .filter(
                        Message.conversation_id == conv_id,
                        Message.message_type == "incoming",
                    )
                    .first()
                )
                assert incoming is not None
                assert incoming.content == "Hello from widget"
                assert incoming.sender_type == "contact"
            finally:
                session.close()

            # Simulate AgentBot reply
            reply_resp = await client.post(
                "/api/v1/agentbot/reply",
                json={
                    "conversation_id": conv_id,
                    "content": "Hello from bot",
                    "handoff": False,
                },
                headers={"Authorization": "Bearer test-admin-token"},
            )
            assert reply_resp.status_code == 200
            reply_data = reply_resp.json()
            outgoing_msg_id = reply_data["message_id"]

            await _drain_bus("OutComing")

            import asyncio

            queue = reg.get_queue(conv_id)
            try:
                sse_data = await asyncio.wait_for(queue.get(), timeout=1.0)
                msg_data = json.loads(sse_data)
                assert msg_data["event"] == "message.created"
                assert msg_data["conversation_id"] == conv_id
                assert msg_data["content"] == "Hello from bot"
                assert msg_data["sender_type"] == "agentbot"
                assert msg_data["message_type"] == "outgoing"
                assert msg_data["message_id"] == outgoing_msg_id
            except asyncio.TimeoutError:
                pytest.fail("SSE queue timed out")
            finally:
                reg.remove_queue(conv_id)


class TestIdleSweep:
    async def test_resolves_stale_web_conversations(self) -> None:
        from datetime import timedelta
        from src.services.idle_sweep import _sweep_once

        session = get_session()
        try:
            now = datetime.now(timezone.utc)
            contact = Contact(source_id="stale-src", name="Stale")
            session.add(contact)
            session.flush()
            ci = ContactInbox(
                contact_id=contact.id, inbox_id="web", source_id="stale-src"
            )
            session.add(ci)
            session.flush()
            stale_conv = Conversation(
                inbox_id="web",
                contact_id=contact.id,
                status="active",
                last_activity_at=now - timedelta(hours=48),
            )
            session.add(stale_conv)
            session.flush()
            fresh_conv = Conversation(
                inbox_id="web",
                contact_id=contact.id,
                status="active",
                last_activity_at=now - timedelta(hours=1),
            )
            session.add(fresh_conv)
            session.commit()
            stale_id = stale_conv.id
            fresh_id = fresh_conv.id
        finally:
            session.close()

        await _sweep_once(_TEST_CONFIG)

        session = get_session()
        try:
            stale = session.query(Conversation).filter(Conversation.id == stale_id).first()
            assert stale is not None
            assert stale.status == "resolved"

            fresh = session.query(Conversation).filter(Conversation.id == fresh_id).first()
            assert fresh is not None
            assert fresh.status == "active"
        finally:
            session.close()

    async def test_does_not_touch_non_web_inboxes(self) -> None:
        from datetime import timedelta
        from src.services.idle_sweep import _sweep_once

        session = get_session()
        try:
            now = datetime.now(timezone.utc)
            contact = Contact(source_id="tg-stale-src", name="TG Stale")
            session.add(contact)
            session.flush()
            ci = ContactInbox(
                contact_id=contact.id,
                inbox_id="test",
                source_id="tg-stale-src",
            )
            session.add(ci)
            session.flush()
            conv = Conversation(
                inbox_id="test",
                contact_id=contact.id,
                status="active",
                last_activity_at=now - timedelta(days=30),
            )
            session.add(conv)
            session.commit()
            conv_id = conv.id
        finally:
            session.close()

        await _sweep_once(_TEST_CONFIG)

        session = get_session()
        try:
            result = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert result is not None
            assert result.status == "active"
        finally:
            session.close()

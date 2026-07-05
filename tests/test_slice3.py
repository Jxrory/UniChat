from typing import Any, AsyncGenerator
from unittest.mock import AsyncMock, patch

import httpx
import pytest
from fastapi import FastAPI
from httpx import ASGITransport

from src.adapters.base import SendResult
from src.bus import (
    get_incoming_bus,
    get_out_coming_bus,
    get_webhook_incoming_bus,
    init_buses,
)
from src.config import AppConfig, InboxConfig, ServerConfig
from src.db import create_all, dispose_engine, get_session, init_db
from src.models import Contact, Conversation, Message
from src.services.state_machine import VALID_TRANSITIONS, validate_transition

_TEST_INBOXES = [
    InboxConfig(
        id="tg",
        name="Test",
        channel_type="telegram",
        config={
            "token": "test-token",
            "webhook_secret": "test-secret",
            "agentbot_url": "http://localhost:9999",
            "agentbot_token": "test-agentbot-token",
            "allowed_senders": ["*"],
        },
    )
]
_TEST_SERVER = ServerConfig(host="0.0.0.0", port=8000, admin_token="test-admin-token")
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
    from src.adapters.telegram import register as register_telegram
    from src.routes.webhook import router as webhook_router
    from src.routes.reply import router as reply_router

    register_telegram()

    app = FastAPI()
    app.state.config = _TEST_CONFIG
    app.include_router(webhook_router)
    app.include_router(reply_router)
    return app


@pytest.fixture
async def client(app: FastAPI) -> AsyncGenerator[httpx.AsyncClient, Any]:
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


async def _create_active_conversation(session: Any) -> tuple[str, str]:
    contact = Contact(inbox_id="tg", source_id="12345", name="Test")
    session.add(contact)
    session.flush()

    conversation = Conversation(
        inbox_id="tg",
        contact_id=contact.id,
        status="active",
    )
    session.add(conversation)
    session.flush()
    conv_id = conversation.id
    session.commit()
    return conv_id, contact.id


# ── State Machine ──────────────────────────────────────────────────────────


class TestStateMachine:
    def test_valid_transitions_from_active(self) -> None:
        assert validate_transition("active", "pending_human") is True
        assert validate_transition("active", "resolved") is True
        assert validate_transition("active", "active") is False

    def test_valid_transitions_from_pending_human(self) -> None:
        assert validate_transition("pending_human", "active") is True
        assert validate_transition("pending_human", "resolved") is True
        assert validate_transition("pending_human", "pending_human") is False

    def test_valid_transitions_from_resolved(self) -> None:
        assert validate_transition("resolved", "active") is True
        assert validate_transition("resolved", "pending_human") is False
        assert validate_transition("resolved", "resolved") is False

    def test_valid_transitions_unknown_status(self) -> None:
        assert validate_transition("bogus", "active") is False
        assert validate_transition("bogus", "resolved") is False

    def test_valid_transitions_structure(self) -> None:
        assert set(VALID_TRANSITIONS.keys()) == {"active", "pending_human", "resolved"}


# ── Manual Reply ───────────────────────────────────────────────────────────


class TestManualReply:
    async def test_reply_creates_outgoing_message(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        resp = await client.post(
            f"/api/v1/conversations/{conv_id}/reply",
            json={"content": "Hello from human"},
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["ok"] is True

        session = get_session()
        try:
            msg = session.query(Message).filter(Message.id == data["message_id"]).first()
            assert msg is not None
            assert msg.sender_type == "user"
            assert msg.message_type == "outgoing"
            assert msg.content == "Hello from human"
            assert msg.handoff is False
            assert msg.status == "pending"
        finally:
            session.close()

    async def test_reply_enqueues_out_coming_bus(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_sender()

        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        resp = await client.post(
            f"/api/v1/conversations/{conv_id}/reply",
            json={"content": "Hello from human"},
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 200
        data = resp.json()

        out_bus = get_out_coming_bus()
        events = []
        while not out_bus._queue.empty():
            ev = await out_bus._queue.get()
            events.append(ev)

        assert len(events) == 1
        assert events[0].payload == data["message_id"]

    async def test_reply_conversation_stays_active(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        await client.post(
            f"/api/v1/conversations/{conv_id}/reply",
            json={"content": "First"},
            headers={"Authorization": "Bearer test-admin-token"},
        )

        session = get_session()
        try:
            conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert conv is not None
            assert conv.status == "active"
        finally:
            session.close()

    async def test_reply_on_pending_human_stays_pending_human(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(inbox_id="tg", source_id="12345", name="Test")
            session.add(contact)
            session.flush()
            conversation = Conversation(
                inbox_id="tg", contact_id=contact.id, status="pending_human"
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id
            session.commit()
        finally:
            session.close()

        await client.post(
            f"/api/v1/conversations/{conv_id}/reply",
            json={"content": "Human reply"},
            headers={"Authorization": "Bearer test-admin-token"},
        )

        session = get_session()
        try:
            conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert conv is not None
            assert conv.status == "pending_human"
        finally:
            session.close()

    async def test_reply_without_token_returns_401(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        resp = await client.post(
            f"/api/v1/conversations/{conv_id}/reply",
            json={"content": "test"},
        )
        assert resp.status_code == 401

    async def test_reply_wrong_token_returns_401(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        resp = await client.post(
            f"/api/v1/conversations/{conv_id}/reply",
            json={"content": "test"},
            headers={"Authorization": "Bearer wrong-token"},
        )
        assert resp.status_code == 401

    async def test_reply_nonexistent_conversation_returns_404(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.post(
            "/api/v1/conversations/nonexistent-id/reply",
            json={"content": "test"},
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 404

    async def test_reply_missing_content_returns_400(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        resp = await client.post(
            f"/api/v1/conversations/{conv_id}/reply",
            json={},
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 400


# ── Resolve ────────────────────────────────────────────────────────────────


class TestResolve:
    async def test_resolve_active_conversation(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        resp = await client.post(
            f"/api/v1/conversations/{conv_id}/resolve",
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["ok"] is True

        session = get_session()
        try:
            conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert conv is not None
            assert conv.status == "resolved"
        finally:
            session.close()

    async def test_resolve_pending_human_conversation(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(inbox_id="tg", source_id="12345", name="Test")
            session.add(contact)
            session.flush()
            conversation = Conversation(
                inbox_id="tg", contact_id=contact.id, status="pending_human"
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id
            session.commit()
        finally:
            session.close()

        resp = await client.post(
            f"/api/v1/conversations/{conv_id}/resolve",
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 200

        session = get_session()
        try:
            conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert conv is not None
            assert conv.status == "resolved"
        finally:
            session.close()

    async def test_resolve_already_resolved_returns_409(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(inbox_id="tg", source_id="12345", name="Test")
            session.add(contact)
            session.flush()
            conversation = Conversation(
                inbox_id="tg", contact_id=contact.id, status="resolved"
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id
            session.commit()
        finally:
            session.close()

        resp = await client.post(
            f"/api/v1/conversations/{conv_id}/resolve",
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 409

    async def test_resolve_without_token_returns_401(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        resp = await client.post(
            f"/api/v1/conversations/{conv_id}/resolve",
        )
        assert resp.status_code == 401

    async def test_resolve_wrong_token_returns_401(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        resp = await client.post(
            f"/api/v1/conversations/{conv_id}/resolve",
            headers={"Authorization": "Bearer wrong-token"},
        )
        assert resp.status_code == 401

    async def test_resolve_nonexistent_conversation_returns_404(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.post(
            "/api/v1/conversations/nonexistent-id/resolve",
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 404


# ── Messages History ───────────────────────────────────────────────────────


class TestMessagesHistory:
    async def test_returns_all_messages_ordered_by_created_at(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(inbox_id="tg", source_id="12345", name="Test")
            session.add(contact)
            session.flush()
            conversation = Conversation(
                inbox_id="tg", contact_id=contact.id, status="active"
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id

            from datetime import datetime, timezone, timedelta

            base = datetime.now(timezone.utc)
            for i in range(3):
                msg = Message(
                    conversation_id=conv_id,
                    inbox_id="tg",
                    sender_type="contact",
                    message_type="incoming",
                    content=f"msg-{i}",
                    status="sent",
                    created_at=base + timedelta(seconds=i),
                )
                session.add(msg)
            session.commit()
        finally:
            session.close()

        resp = await client.get(
            f"/api/v1/conversations/{conv_id}/messages",
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "messages" in data
        messages = data["messages"]
        assert len(messages) == 3
        assert messages[0]["content"] == "msg-0"
        assert messages[1]["content"] == "msg-1"
        assert messages[2]["content"] == "msg-2"

    async def test_empty_conversation_returns_empty_list(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        resp = await client.get(
            f"/api/v1/conversations/{conv_id}/messages",
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["messages"] == []

    async def test_without_token_returns_401(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        resp = await client.get(
            f"/api/v1/conversations/{conv_id}/messages",
        )
        assert resp.status_code == 401

    async def test_wrong_token_returns_401(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        resp = await client.get(
            f"/api/v1/conversations/{conv_id}/messages",
            headers={"Authorization": "Bearer wrong-token"},
        )
        assert resp.status_code == 401

    async def test_nonexistent_conversation_returns_404(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.get(
            "/api/v1/conversations/nonexistent-id/messages",
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 404


# ── Reopen on Inbound ──────────────────────────────────────────────────────


class TestReopen:
    async def _create_conversation_with_status(
        self, status: str
    ) -> tuple[str, str, str]:
        session = get_session()
        try:
            contact = Contact(inbox_id="tg", source_id="12345", name="Test")
            session.add(contact)
            session.flush()

            conversation = Conversation(
                inbox_id="tg", contact_id=contact.id, status=status
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id

            msg = Message(
                conversation_id=conv_id,
                inbox_id="tg",
                sender_type="contact",
                message_type="incoming",
                content="previous msg",
                status="sent",
            )
            session.add(msg)
            session.commit()
            return conv_id, contact.id, msg.id
        finally:
            session.close()

    async def test_inbound_webhook_reopens_pending_human(
        self, client: httpx.AsyncClient
    ) -> None:
        from src.services.ingest import IngestService

        conv_id, contact_id, _ = await self._create_conversation_with_status("pending_human")

        svc = IngestService()
        await svc.start()

        import json

        payload = json.dumps({
            "update_id": 100,
            "message": {
                "message_id": 10,
                "from": {"id": 67890, "is_bot": False, "first_name": "T"},
                "chat": {"id": 12345, "type": "private", "first_name": "T"},
                "date": 1700000000,
                "text": "new message from contact",
            },
        }).encode()

        resp = await client.post(
            "/webhooks/telegram/tg",
            content=payload,
            headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
        )
        assert resp.status_code == 200
        await _drain_bus()

        session = get_session()
        try:
            conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert conv is not None
            assert conv.status == "active"

            messages = (
                session.query(Message)
                .filter(Message.conversation_id == conv_id)
                .order_by(Message.created_at.asc())
                .all()
            )
            assert len(messages) == 2
        finally:
            session.close()

    async def test_inbound_webhook_reopens_resolved(
        self, client: httpx.AsyncClient
    ) -> None:
        from src.services.ingest import IngestService

        conv_id, contact_id, _ = await self._create_conversation_with_status("resolved")

        svc = IngestService()
        await svc.start()

        import json

        payload = json.dumps({
            "update_id": 200,
            "message": {
                "message_id": 20,
                "from": {"id": 67890, "is_bot": False, "first_name": "T"},
                "chat": {"id": 12345, "type": "private", "first_name": "T"},
                "date": 1700000000,
                "text": "wake up",
            },
        }).encode()

        resp = await client.post(
            "/webhooks/telegram/tg",
            content=payload,
            headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
        )
        assert resp.status_code == 200
        await _drain_bus()

        session = get_session()
        try:
            conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert conv is not None
            assert conv.status == "active"

            messages = (
                session.query(Message)
                .filter(Message.conversation_id == conv_id)
                .order_by(Message.created_at.asc())
                .all()
            )
            assert len(messages) == 2
        finally:
            session.close()

    async def test_inbound_webhook_active_stays_active(
        self, client: httpx.AsyncClient
    ) -> None:
        from src.services.ingest import IngestService

        conv_id, contact_id, _ = await self._create_conversation_with_status("active")

        svc = IngestService()
        await svc.start()

        import json

        payload = json.dumps({
            "update_id": 300,
            "message": {
                "message_id": 30,
                "from": {"id": 67890, "is_bot": False, "first_name": "T"},
                "chat": {"id": 12345, "type": "private", "first_name": "T"},
                "date": 1700000000,
                "text": "another message",
            },
        }).encode()

        resp = await client.post(
            "/webhooks/telegram/tg",
            content=payload,
            headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
        )
        assert resp.status_code == 200
        await _drain_bus()

        session = get_session()
        try:
            conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert conv is not None
            assert conv.status == "active"

            messages = (
                session.query(Message)
                .filter(Message.conversation_id == conv_id)
                .order_by(Message.created_at.asc())
                .all()
            )
            assert len(messages) == 2
        finally:
            session.close()


# ── Handoff State Validation ───────────────────────────────────────────────


class TestHandoffValidation:
    async def test_handoff_on_resolved_conversation_returns_409(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(inbox_id="tg", source_id="12345", name="Test")
            session.add(contact)
            session.flush()
            conversation = Conversation(
                inbox_id="tg", contact_id=contact.id, status="resolved"
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id
            session.commit()
        finally:
            session.close()

        resp = await client.post(
            "/api/v1/agentbot/reply",
            json={
                "conversation_id": conv_id,
                "content": "Handoff attempt on resolved",
                "handoff": True,
            },
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 409

        session = get_session()
        try:
            conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert conv is not None
            assert conv.status == "resolved"
        finally:
            session.close()

    async def test_handoff_on_pending_human_conversation_returns_409(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(inbox_id="tg", source_id="12345", name="Test")
            session.add(contact)
            session.flush()
            conversation = Conversation(
                inbox_id="tg", contact_id=contact.id, status="pending_human"
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id
            session.commit()
        finally:
            session.close()

        resp = await client.post(
            "/api/v1/agentbot/reply",
            json={
                "conversation_id": conv_id,
                "content": "Another handoff attempt",
                "handoff": True,
            },
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 409

        session = get_session()
        try:
            conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert conv is not None
            assert conv.status == "pending_human"
        finally:
            session.close()

    async def test_handoff_on_active_conversation_succeeds(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            conv_id, _ = await _create_active_conversation(session)
        finally:
            session.close()

        resp = await client.post(
            "/api/v1/agentbot/reply",
            json={
                "conversation_id": conv_id,
                "content": "Valid handoff",
                "handoff": True,
            },
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 200

        session = get_session()
        try:
            conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert conv is not None
            assert conv.status == "pending_human"
        finally:
            session.close()


# ── Full Handoff → Takeover → Resolve → Reopen Flow ──────────────────────


class TestFullHandoffFlow:
    async def test_handoff_takeover_resolve_reopen_flow(
        self, client: httpx.AsyncClient
    ) -> None:
        from src.adapters.telegram.adapter import TelegramAdapter
        from src.services.ingest import IngestService

        _subscribe_sender()

        session = get_session()
        try:
            contact = Contact(inbox_id="tg", source_id="12345", name="Test")
            session.add(contact)
            session.flush()
            conversation = Conversation(
                inbox_id="tg", contact_id=contact.id, status="active"
            )
            session.add(conversation)
            session.flush()
            conv_id = conversation.id
            session.commit()
        finally:
            session.close()

        svc = IngestService()
        await svc.start()

        send_mock = AsyncMock(return_value=SendResult(ok=True, platform_message_id="tg-msg-999"))
        with patch.object(TelegramAdapter, "send_message", send_mock):
            # Step 1: AgentBot sends handoff → pending_human
            handoff_resp = await client.post(
                "/api/v1/agentbot/reply",
                json={
                    "conversation_id": conv_id,
                    "content": "Handing off to human",
                    "handoff": True,
                },
                headers={"Authorization": "Bearer test-admin-token"},
            )
            assert handoff_resp.status_code == 200

            session = get_session()
            try:
                conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
                assert conv is not None
                assert conv.status == "pending_human"
            finally:
                session.close()

            # Step 2: Human replies → message sent via OutComing
            reply_resp = await client.post(
                f"/api/v1/conversations/{conv_id}/reply",
                json={"content": "Human here, I got this"},
                headers={"Authorization": "Bearer test-admin-token"},
            )
            assert reply_resp.status_code == 200
            reply_data = reply_resp.json()

            ev = await get_out_coming_bus()._queue.get()
            await get_out_coming_bus()._dispatch(ev)

            session = get_session()
            try:
                user_msg = session.query(Message).filter(Message.id == reply_data["message_id"]).first()
                assert user_msg is not None
                assert user_msg.sender_type == "user"
                assert user_msg.status == "sent"

                conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
                assert conv is not None
                assert conv.status == "pending_human"
            finally:
                session.close()

            # Step 3: Resolve
            resolve_resp = await client.post(
                f"/api/v1/conversations/{conv_id}/resolve",
                headers={"Authorization": "Bearer test-admin-token"},
            )
            assert resolve_resp.status_code == 200

            session = get_session()
            try:
                conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
                assert conv is not None
                assert conv.status == "resolved"
            finally:
                session.close()

            # Step 4: Contact sends new inbound → reopen to active
            import json

            inbound_payload = json.dumps({
                "update_id": 999,
                "message": {
                    "message_id": 99,
                    "from": {"id": 67890, "is_bot": False, "first_name": "T"},
                    "chat": {"id": 12345, "type": "private", "first_name": "T"},
                    "date": 1700000000,
                    "text": "Hello again",
                },
            }).encode()

            inbound_resp = await client.post(
                "/webhooks/telegram/tg",
                content=inbound_payload,
                headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
            )
            assert inbound_resp.status_code == 200
            await _drain_all_buses()

            session = get_session()
            try:
                conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
                assert conv is not None
                assert conv.status == "active"

                messages = (
                    session.query(Message)
                    .filter(Message.conversation_id == conv_id)
                    .order_by(Message.created_at.asc())
                    .all()
                )
                assert len(messages) >= 2
            finally:
                session.close()

import json
import os
from pathlib import Path
from typing import Any, AsyncGenerator
from unittest.mock import AsyncMock, patch

import httpx
import pytest
from fastapi import FastAPI
from httpx import ASGITransport

from src.adapters.base import SendResult, WebhookEvent
from src.adapters.registry import registry
from src.bus import (
    Event,
    get_incoming_bus,
    get_out_coming_bus,
    get_webhook_incoming_bus,
    init_buses,
)
from src.config import AppConfig, InboxConfig, ServerConfig
from src.db import create_all, dispose_engine, get_session, init_db
from src.models import Contact, Conversation, Message

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


def _subscribe_ingest() -> None:
    from src.services.ingest import IngestService
    svc = IngestService()
    bus = get_webhook_incoming_bus()
    bus.subscribe("WebhookIncoming", svc._handle)


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


def _subscribe_notifier(config: AppConfig | None = None) -> None:
    from src.services.notifier import AgentBotNotifier

    if config is None:
        config = _TEST_CONFIG
    svc = AgentBotNotifier(config)
    bus = get_incoming_bus()
    bus.subscribe("Incoming", svc._handle)


def _make_httpx_response(is_success: bool = True, status_code: int = 200, text: str = "") -> AsyncMock:
    response = AsyncMock()
    response.is_success = is_success
    response.status_code = status_code
    response.text = text
    return response


def _make_httpx_post_mock(response: AsyncMock | None = None, side_effect: Exception | None = None) -> AsyncMock:
    client_mock = AsyncMock(spec=httpx.AsyncClient)
    if side_effect:
        client_mock.post.side_effect = side_effect
    elif response:
        client_mock.post.return_value = response
    return client_mock


def _subscribe_sender(config: AppConfig | None = None) -> None:
    from src.services.sender import ChannelSender

    if config is None:
        config = _TEST_CONFIG
    svc = ChannelSender(config)
    bus = get_out_coming_bus()
    bus.subscribe("OutComing", svc._handle)


@pytest.fixture
def app() -> FastAPI:
    from src.adapters.telegram import register as register_telegram
    from src.routes.webhook import router as webhook_router

    register_telegram()

    app = FastAPI()
    app.state.config = _TEST_CONFIG
    app.include_router(webhook_router)
    return app


@pytest.fixture
async def client(app: FastAPI) -> AsyncGenerator[httpx.AsyncClient, Any]:
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


def _tg_payload(update_id: int = 1, chat_id: int = 12345, user_id: int = 67890, text: str = "hello") -> bytes:
    return json.dumps({
        "update_id": update_id,
        "message": {
            "message_id": 100,
            "from": {
                "id": user_id,
                "is_bot": False,
                "first_name": "Test",
                "last_name": "User",
                "language_code": "en",
            },
            "chat": {
                "id": chat_id,
                "first_name": "Test",
                "last_name": "User",
                "type": "private",
            },
            "date": 1700000000,
            "text": text,
        },
    }).encode()


class TestWebhookRoute:
    async def test_valid_message_creates_contact_conversation_and_message(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_ingest()

        resp = await client.post(
            "/webhooks/telegram/tg",
            content=_tg_payload(),
            headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["ok"] is True

        await _drain_bus()

        session = get_session()
        try:
            contacts = session.query(Contact).all()
            assert len(contacts) == 1
            assert contacts[0].inbox_id == "tg"
            assert contacts[0].source_id == "12345"

            conversations = session.query(Conversation).all()
            assert len(conversations) == 1
            assert conversations[0].contact_id == contacts[0].id
            assert conversations[0].status == "active"

            messages = session.query(Message).all()
            assert len(messages) == 1
            assert messages[0].conversation_id == conversations[0].id
            assert messages[0].sender_type == "contact"
            assert messages[0].message_type == "incoming"
            assert messages[0].content == "hello"
            assert messages[0].source_id == "1"
        finally:
            session.close()

    async def test_duplicate_update_id_creates_only_one_message(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_ingest()

        payload = _tg_payload(update_id=42)
        headers = {"X-Telegram-Bot-Api-Secret-Token": "test-secret"}

        resp1 = await client.post("/webhooks/telegram/tg", content=payload, headers=headers)
        assert resp1.status_code == 200
        await _drain_bus()

        resp2 = await client.post("/webhooks/telegram/tg", content=payload, headers=headers)
        assert resp2.status_code == 200
        await _drain_bus()

        session = get_session()
        try:
            messages = session.query(Message).all()
            assert len(messages) == 1
        finally:
            session.close()

    async def test_wrong_secret_returns_401(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.post(
            "/webhooks/telegram/tg",
            content=_tg_payload(),
            headers={"X-Telegram-Bot-Api-Secret-Token": "wrong-secret"},
        )
        assert resp.status_code == 401

        session = get_session()
        try:
            assert session.query(Message).count() == 0
        finally:
            session.close()

    async def test_missing_secret_returns_401(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.post(
            "/webhooks/telegram/tg",
            content=_tg_payload(),
        )
        assert resp.status_code == 401

    async def test_non_private_chat_returns_200_and_skips(
        self, client: httpx.AsyncClient
    ) -> None:
        payload = json.dumps({
            "update_id": 1,
            "message": {
                "message_id": 100,
                "from": {"id": 1, "is_bot": False, "first_name": "T"},
                "chat": {"id": -100, "type": "group", "title": "Group"},
                "date": 1700000000,
                "text": "hi",
            },
        }).encode()
        resp = await client.post(
            "/webhooks/telegram/tg",
            content=payload,
            headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("skipped") is True

        session = get_session()
        try:
            assert session.query(Message).count() == 0
        finally:
            session.close()

    async def test_non_text_update_returns_200_and_skips(
        self, client: httpx.AsyncClient
    ) -> None:
        payload = json.dumps({
            "update_id": 1,
            "message": {
                "message_id": 100,
                "from": {"id": 1, "is_bot": False, "first_name": "T"},
                "chat": {"id": 1, "type": "private", "first_name": "T"},
                "date": 1700000000,
                "sticker": {"file_id": "abc123", "emoji": "😀"},
            },
        }).encode()
        resp = await client.post(
            "/webhooks/telegram/tg",
            content=payload,
            headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("skipped") is True

        session = get_session()
        try:
            assert session.query(Message).count() == 0
        finally:
            session.close()

    async def test_unknown_inbox_returns_404(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.post(
            "/webhooks/telegram/unknown",
            content=_tg_payload(),
            headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
        )
        assert resp.status_code == 404

    async def test_same_contact_reuses_active_conversation(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_ingest()

        headers = {"X-Telegram-Bot-Api-Secret-Token": "test-secret"}

        await client.post("/webhooks/telegram/tg", content=_tg_payload(update_id=1), headers=headers)
        await _drain_bus()
        await client.post("/webhooks/telegram/tg", content=_tg_payload(update_id=2, text="second"), headers=headers)
        await _drain_bus()

        session = get_session()
        try:
            contacts = session.query(Contact).all()
            assert len(contacts) == 1

            conversations = session.query(Conversation).all()
            assert len(conversations) == 1

            messages = session.query(Message).all()
            assert len(messages) == 2
            for msg in messages:
                assert msg.conversation_id == conversations[0].id
        finally:
            session.close()


class TestConfig:
    def test_env_substitution(self, tmp_path: Path) -> None:
        os.environ["TEST_BOT_TOKEN"] = "env-token-123"
        os.environ["TEST_SECRET"] = "env-secret-456"

        yaml_content = """
inboxes:
  - id: tg
    name: Test
    channel_type: telegram
    config:
      token: "${TEST_BOT_TOKEN}"
      webhook_secret: "${TEST_SECRET}"

server:
  host: "0.0.0.0"
  port: 8000
  admin_token: "${TEST_SECRET}"

database:
  url: "sqlite:///./test.db"
"""
        cfg_path = tmp_path / "test_config.yaml"
        cfg_path.write_text(yaml_content)

        from src.config import load_config

        config = load_config(str(cfg_path))
        assert config.inboxes[0].config["token"] == "env-token-123"
        assert config.inboxes[0].config["webhook_secret"] == "env-secret-456"
        assert config.server.admin_token == "env-secret-456"

    def test_missing_env_var_raises_error(self, tmp_path: Path) -> None:
        yaml_content = """
inboxes:
  - id: tg
    name: Test
    channel_type: telegram
    config:
      token: "${MISSING_VAR}"

server:
  host: "0.0.0.0"
  port: 8000
  admin_token: "admin"

database:
  url: "sqlite:///./test.db"
"""
        cfg_path = tmp_path / "test_config_bad.yaml"
        cfg_path.write_text(yaml_content)

        from src.config import load_config

        with pytest.raises(ValueError, match="MISSING_VAR"):
            load_config(str(cfg_path))

    def test_database_url_override(self, tmp_path: Path) -> None:
        os.environ["DATABASE_URL"] = "sqlite:///override.db"
        yaml_content = """
inboxes:
  - id: tg
    name: Test
    channel_type: telegram
    config:
      token: "${TEST_BOT_TOKEN}"
      webhook_secret: "secret"

server:
  host: "0.0.0.0"
  port: 8000
  admin_token: "admin"

database:
  url: "sqlite:///./test.db"
"""
        os.environ["TEST_BOT_TOKEN"] = "tok"
        cfg_path = tmp_path / "test_config_override.yaml"
        cfg_path.write_text(yaml_content)

        from src.config import load_config

        config = load_config(str(cfg_path))
        assert config.database_url == "sqlite:///override.db"


class TestBus:
    async def test_publish_and_subscribe(self) -> None:
        init_buses()
        bus = get_webhook_incoming_bus()
        received: list[Event] = []

        async def handler(event: Event) -> None:
            received.append(event)

        bus.subscribe("test-event", handler)
        await bus.publish("test-event", "hello-payload")
        await bus.publish("test-event", "second-payload")

        await bus._dispatch(await bus._queue.get())
        await bus._dispatch(await bus._queue.get())

        assert len(received) == 2
        assert received[0].name == "test-event"
        assert received[0].payload == "hello-payload"
        assert received[1].payload == "second-payload"

    async def test_no_subscribers_does_not_crash(self) -> None:
        init_buses()
        bus = get_webhook_incoming_bus()
        await bus.publish("unsubscribed-event")
        await bus._dispatch(await bus._queue.get())


class TestTelegramAdapter:
    def test_verify_webhook_valid(self) -> None:
        from src.adapters.telegram.adapter import TelegramAdapter

        adapter = TelegramAdapter(
            inbox_id="tg",
            config={"webhook_secret": "my-secret", "token": "tok"},
        )

        assert adapter.verify_webhook(
            {"X-Telegram-Bot-Api-Secret-Token": "my-secret"}, b"{}"
        )

    def test_verify_webhook_invalid(self) -> None:
        from src.adapters.telegram.adapter import TelegramAdapter

        adapter = TelegramAdapter(
            inbox_id="tg",
            config={"webhook_secret": "my-secret", "token": "tok"},
        )

        assert not adapter.verify_webhook(
            {"X-Telegram-Bot-Api-Secret-Token": "wrong"}, b"{}"
        )

    def test_verify_webhook_missing_header(self) -> None:
        from src.adapters.telegram.adapter import TelegramAdapter

        adapter = TelegramAdapter(
            inbox_id="tg",
            config={"webhook_secret": "my-secret", "token": "tok"},
        )

        assert not adapter.verify_webhook({}, b"{}")

    def test_parse_webhook_valid_private_text(self) -> None:
        from src.adapters.telegram.adapter import TelegramAdapter

        adapter = TelegramAdapter(inbox_id="tg", config={"webhook_secret": "s"})
        body = json.dumps({
            "update_id": 42,
            "message": {
                "message_id": 1,
                "from": {"id": 100, "is_bot": False, "first_name": "Alice"},
                "chat": {"id": 200, "type": "private", "first_name": "Alice"},
                "date": 1700000000,
                "text": "Hello Bot",
            },
        }).encode()

        event = adapter.parse_webhook({}, body)
        assert event is not None
        assert event.source_id == "200"
        assert event.sender_source_id == "100"
        assert event.content == "Hello Bot"
        assert event.content_type == "text"
        assert event.raw["update_id"] == 42

    def test_parse_webhook_group_chat_returns_none(self) -> None:
        from src.adapters.telegram.adapter import TelegramAdapter

        adapter = TelegramAdapter(inbox_id="tg", config={"webhook_secret": "s"})
        body = json.dumps({
            "update_id": 1,
            "message": {
                "message_id": 1,
                "from": {"id": 1, "is_bot": False, "first_name": "A"},
                "chat": {"id": -100, "type": "group", "title": "Group"},
                "date": 1700000000,
                "text": "hi",
            },
        }).encode()

        event = adapter.parse_webhook({}, body)
        assert event is None

    def test_parse_webhook_non_text_returns_none(self) -> None:
        from src.adapters.telegram.adapter import TelegramAdapter

        adapter = TelegramAdapter(inbox_id="tg", config={"webhook_secret": "s"})
        body = json.dumps({
            "update_id": 1,
            "message": {
                "message_id": 1,
                "from": {"id": 1, "is_bot": False, "first_name": "A"},
                "chat": {"id": 1, "type": "private", "first_name": "A"},
                "date": 1700000000,
                "sticker": {"file_id": "abc"},
            },
        }).encode()

        event = adapter.parse_webhook({}, body)
        assert event is None

    def test_parse_webhook_no_message_returns_none(self) -> None:
        from src.adapters.telegram.adapter import TelegramAdapter

        adapter = TelegramAdapter(inbox_id="tg", config={"webhook_secret": "s"})
        body = json.dumps({"update_id": 1}).encode()

        event = adapter.parse_webhook({}, body)
        assert event is None


class TestRegistry:
    def test_register_and_create(self) -> None:
        from src.adapters.telegram.adapter import TelegramAdapter

        registry.register("telegram", TelegramAdapter)
        adapter = registry.create("tg", "telegram", {"token": "x"})
        assert isinstance(adapter, TelegramAdapter)
        assert adapter.inbox_id == "tg"
        assert adapter.config["token"] == "x"

    def test_unknown_channel_raises(self) -> None:
        with pytest.raises(ValueError, match="Unknown channel type"):
            registry.create("x", "nonexistent", {})


class TestIngestService:
    async def test_incoming_bus_receives_message_id(self) -> None:
        from src.services.ingest import IngestService

        service = IngestService()
        await service.start()

        received_ids: list[str] = []

        async def capture(event: Event) -> None:
            received_ids.append(event.payload)

        incoming_bus = get_incoming_bus()
        incoming_bus.subscribe("Incoming", capture)

        webhook_bus = get_webhook_incoming_bus()
        await webhook_bus.publish(
            "WebhookIncoming",
            WebhookEvent(
                inbox_id="tg",
                source_id="123",
                sender_source_id="456",
                content="hello",
                content_type="text",
                raw={"update_id": 1},
            ),
        )

        event_obj = await webhook_bus._queue.get()
        await webhook_bus._dispatch(event_obj)

        incoming_event = await incoming_bus._queue.get()
        await incoming_bus._dispatch(incoming_event)

        assert len(received_ids) == 1
        msg_id = received_ids[0]
        assert msg_id is not None

        session = get_session()
        try:
            msg = session.query(Message).filter(Message.id == msg_id).first()
            assert msg is not None
            assert msg.content == "hello"
        finally:
            session.close()


class TestAgentBotNotifier:
    async def test_notifier_posts_to_agentbot_url(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_ingest()
        _subscribe_notifier()

        response = _make_httpx_response(is_success=True, status_code=200)
        client_mock = _make_httpx_post_mock(response=response)

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = client_mock

            resp = await client.post(
                "/webhooks/telegram/tg",
                content=_tg_payload(update_id=1),
                headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
            )
            assert resp.status_code == 200
            await _drain_all_buses()

            client_mock.post.assert_called_once()
            args, kwargs = client_mock.post.call_args
            assert args[0] == "http://localhost:9999"
            assert "Authorization" in kwargs["headers"]
            assert kwargs["headers"]["Authorization"] == "Bearer test-agentbot-token"

    async def test_notifier_sets_external_error_on_failure(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_ingest()
        _subscribe_notifier()

        response = _make_httpx_response(is_success=False, status_code=500, text="Internal Server Error")
        client_mock = _make_httpx_post_mock(response=response)

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = client_mock

            resp = await client.post(
                "/webhooks/telegram/tg",
                content=_tg_payload(update_id=1),
                headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
            )
            assert resp.status_code == 200
            await _drain_all_buses()

            session = get_session()
            try:
                msg = session.query(Message).first()
                assert msg is not None
                assert msg.external_error is not None
                assert "AgentBot returned 500" in msg.external_error
            finally:
                session.close()

    async def test_notifier_sets_external_error_on_network_failure(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_ingest()
        _subscribe_notifier()

        client_mock = _make_httpx_post_mock(side_effect=Exception("Connection refused"))

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = client_mock

            resp = await client.post(
                "/webhooks/telegram/tg",
                content=_tg_payload(update_id=1),
                headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
            )
            assert resp.status_code == 200
            await _drain_all_buses()

            session = get_session()
            try:
                msg = session.query(Message).first()
                assert msg is not None
                assert msg.external_error is not None
                assert "Connection refused" in msg.external_error
            finally:
                session.close()

    async def test_notifier_skips_when_conversation_not_active(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_ingest()
        _subscribe_notifier()

        response = _make_httpx_response(is_success=True, status_code=200)
        client_mock = _make_httpx_post_mock(response=response)

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = client_mock

            resp = await client.post(
                "/webhooks/telegram/tg",
                content=_tg_payload(update_id=1),
                headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
            )
            assert resp.status_code == 200
            await _drain_all_buses()

            client_mock.post.reset_mock()

            session = get_session()
            try:
                conv = session.query(Conversation).first()
                assert conv is not None
                conv.status = "pending_human"
                msg = (
                    session.query(Message)
                    .filter(Message.conversation_id == conv.id)
                    .first()
                )
                assert msg is not None
                msg_id = msg.id
                session.commit()
            finally:
                session.close()

            incoming_bus = get_incoming_bus()
            await incoming_bus.publish("Incoming", msg_id)
            await _drain_bus("Incoming")

            client_mock.post.assert_not_called()


@pytest.fixture
def app_with_reply() -> FastAPI:
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
async def client_with_reply(
    app_with_reply: FastAPI,
) -> AsyncGenerator[httpx.AsyncClient, Any]:
    transport = ASGITransport(app=app_with_reply)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


class TestReplyRoute:
    async def test_reply_creates_outgoing_message_and_enqueues(
        self, client_with_reply: httpx.AsyncClient
    ) -> None:
        _subscribe_sender()

        session = get_session()
        try:
            contact = Contact(
                inbox_id="tg", source_id="12345", name="Test"
            )
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
        finally:
            session.close()

        resp = await client_with_reply.post(
            "/api/v1/agentbot/reply",
            json={
                "conversation_id": conv_id,
                "content": "Hello from bot",
                "handoff": False,
                "source_id": "agentbot-msg-1",
            },
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["ok"] is True

        session = get_session()
        try:
            msg = session.query(Message).filter(Message.id == data["message_id"]).first()
            assert msg is not None
            assert msg.sender_type == "agentbot"
            assert msg.message_type == "outgoing"
            assert msg.content == "Hello from bot"
            assert msg.handoff is False
            assert msg.status == "pending"

            events = []
            out_bus = get_out_coming_bus()
            while not out_bus._queue.empty():
                ev = await out_bus._queue.get()
                events.append(ev)

            assert len(events) == 1
            assert events[0].payload == msg.id
        finally:
            session.close()

    async def test_reply_with_handoff_transitions_conversation(
        self, client_with_reply: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(
                inbox_id="tg", source_id="12345", name="Test"
            )
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
        finally:
            session.close()

        resp = await client_with_reply.post(
            "/api/v1/agentbot/reply",
            json={
                "conversation_id": conv_id,
                "content": "Handing off to human",
                "handoff": True,
            },
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 200

        session = get_session()
        try:
            conv_row = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert conv_row is not None
            assert conv_row.status == "pending_human"

            msg = (
                session.query(Message)
                .filter(Message.conversation_id == conv_id)
                .first()
            )
            assert msg is not None
            assert msg.handoff is True

            out_bus = get_out_coming_bus()
            assert out_bus._queue.empty()
        finally:
            session.close()

    async def test_duplicate_source_id_returns_409(
        self, client_with_reply: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(
                inbox_id="tg", source_id="12345", name="Test"
            )
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
        finally:
            session.close()

        resp1 = await client_with_reply.post(
            "/api/v1/agentbot/reply",
            json={
                "conversation_id": conv_id,
                "content": "First reply",
                "source_id": "dup-key",
            },
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp1.status_code == 200

        resp2 = await client_with_reply.post(
            "/api/v1/agentbot/reply",
            json={
                "conversation_id": conv_id,
                "content": "Second reply",
                "source_id": "dup-key",
            },
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp2.status_code == 409

        session = get_session()
        try:
            messages = (
                session.query(Message)
                .filter(Message.conversation_id == conv_id)
                .all()
            )
            assert len(messages) == 1
        finally:
            session.close()

    async def test_wrong_token_returns_401(
        self, client_with_reply: httpx.AsyncClient
    ) -> None:
        resp = await client_with_reply.post(
            "/api/v1/agentbot/reply",
            json={"conversation_id": "x", "content": "test"},
            headers={"Authorization": "Bearer wrong-token"},
        )
        assert resp.status_code == 401

    async def test_missing_token_returns_401(
        self, client_with_reply: httpx.AsyncClient
    ) -> None:
        resp = await client_with_reply.post(
            "/api/v1/agentbot/reply",
            json={"conversation_id": "x", "content": "test"},
        )
        assert resp.status_code == 401

    async def test_missing_fields_returns_400(
        self, client_with_reply: httpx.AsyncClient
    ) -> None:
        resp = await client_with_reply.post(
            "/api/v1/agentbot/reply",
            json={},
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 400

        resp = await client_with_reply.post(
            "/api/v1/agentbot/reply",
            json={"conversation_id": "x"},
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 400

    async def test_nonexistent_conversation_returns_404(
        self, client_with_reply: httpx.AsyncClient
    ) -> None:
        resp = await client_with_reply.post(
            "/api/v1/agentbot/reply",
            json={
                "conversation_id": "nonexistent-id",
                "content": "test",
            },
            headers={"Authorization": "Bearer test-admin-token"},
        )
        assert resp.status_code == 404


class TestChannelSender:
    async def test_sender_calls_adapter_and_updates_message(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_sender()

        session = get_session()
        try:
            contact = Contact(
                inbox_id="tg", source_id="12345", name="Test"
            )
            session.add(contact)
            session.flush()

            conversation = Conversation(
                inbox_id="tg",
                contact_id=contact.id,
                status="active",
            )
            session.add(conversation)
            session.flush()

            msg = Message(
                conversation_id=conversation.id,
                inbox_id="tg",
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

        from src.adapters.telegram.adapter import TelegramAdapter

        mock_send = AsyncMock(return_value=SendResult(ok=True, platform_message_id="tg-msg-123"))
        with patch.object(TelegramAdapter, "send_message", mock_send):
            out_bus = get_out_coming_bus()
            await out_bus.publish("OutComing", msg_id)

            ev = await out_bus._queue.get()
            await out_bus._dispatch(ev)

        session = get_session()
        try:
            updated = session.query(Message).filter(Message.id == msg_id).first()
            assert updated is not None
            assert updated.status == "sent"
            assert updated.source_id == "tg-msg-123"
        finally:
            session.close()

    async def test_sender_marks_failed_on_adapter_error(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_sender()

        session = get_session()
        try:
            contact = Contact(
                inbox_id="tg", source_id="12345", name="Test"
            )
            session.add(contact)
            session.flush()

            conversation = Conversation(
                inbox_id="tg",
                contact_id=contact.id,
                status="active",
            )
            session.add(conversation)
            session.flush()

            msg = Message(
                conversation_id=conversation.id,
                inbox_id="tg",
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

        from src.adapters.telegram.adapter import TelegramAdapter

        mock_send = AsyncMock(return_value=SendResult(ok=False, error="Telegram API timeout"))
        with patch.object(TelegramAdapter, "send_message", mock_send):
            out_bus = get_out_coming_bus()
            await out_bus.publish("OutComing", msg_id)

            ev = await out_bus._queue.get()
            await out_bus._dispatch(ev)

        session = get_session()
        try:
            updated = session.query(Message).filter(Message.id == msg_id).first()
            assert updated is not None
            assert updated.status == "failed"
            assert updated.external_error == "Telegram API timeout"
        finally:
            session.close()

    async def test_sender_skips_handoff_messages(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_sender()

        session = get_session()
        try:
            contact = Contact(
                inbox_id="tg", source_id="12345", name="Test"
            )
            session.add(contact)
            session.flush()

            conversation = Conversation(
                inbox_id="tg",
                contact_id=contact.id,
                status="active",
            )
            session.add(conversation)
            session.flush()

            msg = Message(
                conversation_id=conversation.id,
                inbox_id="tg",
                sender_type="agentbot",
                message_type="outgoing",
                content="Handoff signal",
                handoff=True,
                status="pending",
            )
            session.add(msg)
            session.commit()
            msg_id = msg.id
        finally:
            session.close()

        from src.adapters.telegram.adapter import TelegramAdapter

        send_mock = AsyncMock()
        with patch.object(TelegramAdapter, "send_message", send_mock):
            out_bus = get_out_coming_bus()
            await out_bus.publish("OutComing", msg_id)

            ev = await out_bus._queue.get()
            await out_bus._dispatch(ev)

            send_mock.assert_not_called()


class TestEchoPrevention:
    async def test_echo_update_is_skipped(
        self, client: httpx.AsyncClient
    ) -> None:
        _subscribe_ingest()

        session = get_session()
        try:
            contact = Contact(
                inbox_id="tg", source_id="12345", name="Test"
            )
            session.add(contact)
            session.flush()

            conversation = Conversation(
                inbox_id="tg",
                contact_id=contact.id,
                status="active",
            )
            session.add(conversation)
            session.flush()

            msg = Message(
                conversation_id=conversation.id,
                inbox_id="tg",
                sender_type="agentbot",
                message_type="outgoing",
                content="Bot reply",
                status="sent",
                source_id="123",
            )
            session.add(msg)
            session.commit()
        finally:
            session.close()

        session = get_session()
        try:
            existing_count = session.query(Message).count()
        finally:
            session.close()

        resp = await client.post(
            "/webhooks/telegram/tg",
            content=_tg_payload(update_id=123),
            headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
        )
        assert resp.status_code == 200
        await _drain_bus()

        session = get_session()
        try:
            count = session.query(Message).count()
            assert count == existing_count
        finally:
            session.close()


class TestFullRoundTrip:
    async def test_inbound_to_outbound_round_trip(
        self, client_with_reply: httpx.AsyncClient
    ) -> None:
        _subscribe_ingest()
        _subscribe_notifier()
        _subscribe_sender()
        from src.adapters.telegram.adapter import TelegramAdapter

        httpx_response = _make_httpx_response(is_success=True, status_code=200)
        httpx_client = _make_httpx_post_mock(response=httpx_response)
        send_mock = AsyncMock(return_value=SendResult(ok=True, platform_message_id="tg-msg-456"))

        with patch("httpx.AsyncClient") as mock_cls:
            mock_cls.return_value.__aenter__.return_value = httpx_client
            with patch.object(TelegramAdapter, "send_message", send_mock):
                resp = await client_with_reply.post(
                    "/webhooks/telegram/tg",
                    content=_tg_payload(update_id=1, text="Hello bot"),
                    headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
                )
                assert resp.status_code == 200
                await _drain_all_buses()

                httpx_client.post.assert_called_once()

                session = get_session()
                try:
                    inbound_msg = (
                        session.query(Message)
                        .filter(Message.message_type == "incoming")
                        .first()
                    )
                    assert inbound_msg is not None
                    conv_id = inbound_msg.conversation_id
                finally:
                    session.close()

                reply_resp = await client_with_reply.post(
                    "/api/v1/agentbot/reply",
                    json={
                        "conversation_id": conv_id,
                        "content": "I am a bot",
                        "source_id": "bot-reply-1",
                    },
                    headers={"Authorization": "Bearer test-admin-token"},
                )
                assert reply_resp.status_code == 200
                reply_data = reply_resp.json()

                out_bus = get_out_coming_bus()
                ev = await out_bus._queue.get()
                await out_bus._dispatch(ev)

                session = get_session()
                try:
                    outgoing = (
                        session.query(Message)
                        .filter(Message.id == reply_data["message_id"])
                        .first()
                    )
                    assert outgoing is not None
                    assert outgoing.status == "sent"
                    assert outgoing.source_id == "tg-msg-456"
                finally:
                    session.close()

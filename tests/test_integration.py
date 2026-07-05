import json
import os
from pathlib import Path
from typing import Any, AsyncGenerator

import httpx
import pytest
from fastapi import FastAPI
from httpx import ASGITransport

from src.adapters.base import WebhookEvent
from src.adapters.registry import registry
from src.bus import (
    Event,
    get_incoming_bus,
    get_webhook_incoming_bus,
    init_buses,
)
from src.config import AppConfig, InboxConfig, ServerConfig
from src.db import create_all, dispose_engine, get_session, init_db
from src.models import Contact, Conversation, Message


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


async def _drain_bus() -> None:
    bus = get_webhook_incoming_bus()
    while not bus._queue.empty():
        event = await bus._queue.get()
        await bus._dispatch(event)


@pytest.fixture
def app() -> FastAPI:
    from src.adapters.telegram import register as register_telegram
    from src.routes.webhook import router as webhook_router

    register_telegram()

    config = AppConfig(
        inboxes=[
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
        ],
        server=ServerConfig(host="0.0.0.0", port=8000, admin_token="test-admin-token"),
        database_url="sqlite://",
    )

    app = FastAPI()
    app.state.config = config
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

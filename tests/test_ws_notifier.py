from typing import Any
from unittest.mock import AsyncMock

import pytest
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from starlette.testclient import TestClient

from src.bus import get_incoming_bus, get_out_coming_bus, init_buses
from src.config import AppConfig, InboxConfig, ServerConfig
from src.db import create_all, dispose_engine, get_session, init_db
from src.models import Contact, Conversation, Message
from src.routes.ws import router as ws_router
from src.routes.ws import setup_ws_router
from src.services.ws_notifier import WSNotifier

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
    ),
    InboxConfig(
        id="wa",
        name="WhatsApp Test",
        channel_type="whatsapp",
        config={
            "webhook_secret": "test-wa-secret",
            "phone_number_id": "123456789",
            "token": "test-wa-token",
            "agentbot_url": "http://localhost:9999",
            "agentbot_token": "test-agentbot-token",
        },
    ),
]
_TEST_SERVER = ServerConfig(host="0.0.0.0", port=8000, admin_token="test-admin-token")
_TEST_CONFIG = AppConfig(inboxes=_TEST_INBOXES, server=_TEST_SERVER, database_url="sqlite://")

_ADMIN_TOKEN = _TEST_CONFIG.server.admin_token


@pytest.fixture(autouse=True)
def _db(tmp_path: Any) -> Any:
    db_path = tmp_path / "test.db"
    init_db(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
    )
    create_all()
    yield
    dispose_engine()


@pytest.fixture(autouse=True)
def _buses() -> Any:
    init_buses()
    yield


@pytest.fixture
def ws_notifier() -> WSNotifier:
    return WSNotifier()


@pytest.fixture
def app(ws_notifier: WSNotifier) -> FastAPI:
    app = FastAPI()
    app.state.config = _TEST_CONFIG
    app.state.ws_notifier = ws_notifier
    setup_ws_router(ws_notifier, _ADMIN_TOKEN)
    app.include_router(ws_router)
    return app


@pytest.fixture
def client(app: FastAPI) -> TestClient:
    return TestClient(app)


# ── WS Route Tests ──────────────────────────────────────────────────────


class TestWSRoute:
    def test_successful_connection(self, client: TestClient, ws_notifier: WSNotifier) -> None:
        with client.websocket_connect(f"/ws/notifications?token={_ADMIN_TOKEN}&inboxes=tg") as ws:
            data = ws.receive_json()
            assert data["event"] == "connected"
            assert data["inboxes"] == ["tg"]
            data2 = ws.receive_json()
            assert data2["event"] == "conversation.summary"
            assert data2["conversations"] == []

    def test_missing_token_returns_403(self, client: TestClient) -> None:
        with client.websocket_connect("/ws/notifications?inboxes=tg") as ws:
            with pytest.raises(WebSocketDisconnect) as exc:
                ws.receive_json()
        assert exc.value.code == 403

    def test_invalid_token_returns_403(self, client: TestClient) -> None:
        with client.websocket_connect("/ws/notifications?token=wrong&inboxes=tg") as ws:
            with pytest.raises(WebSocketDisconnect) as exc:
                ws.receive_json()
        assert exc.value.code == 403

    def test_missing_inboxes_returns_400(self, client: TestClient) -> None:
        with client.websocket_connect(f"/ws/notifications?token={_ADMIN_TOKEN}") as ws:
            with pytest.raises(WebSocketDisconnect) as exc:
                ws.receive_json()
        assert exc.value.code == 400

    def test_empty_inboxes_returns_400(self, client: TestClient) -> None:
        with client.websocket_connect(f"/ws/notifications?token={_ADMIN_TOKEN}&inboxes=") as ws:
            with pytest.raises(WebSocketDisconnect) as exc:
                ws.receive_json()
        assert exc.value.code == 400

    def test_multiple_inboxes_parsed_correctly(self, client: TestClient) -> None:
        with client.websocket_connect(f"/ws/notifications?token={_ADMIN_TOKEN}&inboxes=tg,wa") as ws:
            data = ws.receive_json()
            assert data["event"] == "connected"
            assert data["inboxes"] == ["tg", "wa"]

    def test_disconnect_cleanup_removes_from_pool(self, client: TestClient, ws_notifier: WSNotifier) -> None:
        assert len(ws_notifier._pools.get("tg", set())) == 0

        with client.websocket_connect(f"/ws/notifications?token={_ADMIN_TOKEN}&inboxes=tg") as ws:
            ws.receive_json()
            assert len(ws_notifier._pools["tg"]) == 1

        assert len(ws_notifier._pools.get("tg", set())) == 0


# ── WSNotifier Service Tests ────────────────────────────────────────────


class TestWSNotifierService:
    async def test_register_unregister(self) -> None:
        notifier = WSNotifier()
        mock_ws = AsyncMock(spec=WebSocket)

        notifier.register(["tg"], mock_ws)
        assert len(notifier._pools["tg"]) == 1

        notifier.unregister(mock_ws)
        assert "tg" not in notifier._pools

    async def test_register_multiple_inboxes(self) -> None:
        notifier = WSNotifier()
        mock_ws = AsyncMock(spec=WebSocket)

        notifier.register(["tg", "wa"], mock_ws)
        assert len(notifier._pools["tg"]) == 1
        assert len(notifier._pools["wa"]) == 1

        notifier.unregister(mock_ws)
        assert "tg" not in notifier._pools
        assert "wa" not in notifier._pools

    async def test_register_multiple_connections_same_inbox(self) -> None:
        notifier = WSNotifier()
        ws1 = AsyncMock(spec=WebSocket)
        ws2 = AsyncMock(spec=WebSocket)

        notifier.register(["tg"], ws1)
        notifier.register(["tg"], ws2)
        assert len(notifier._pools["tg"]) == 2

        notifier.unregister(ws1)
        assert len(notifier._pools["tg"]) == 1

        notifier.unregister(ws2)
        assert "tg" not in notifier._pools

    async def test_send_json_success(self) -> None:
        notifier = WSNotifier()
        mock_ws = AsyncMock(spec=WebSocket)
        mock_ws.send_json.return_value = None

        result = await notifier._send_json(mock_ws, {"test": True})
        assert result is True
        mock_ws.send_json.assert_awaited_once_with({"test": True})

    async def test_send_json_failure_removes_connection(self) -> None:
        notifier = WSNotifier()
        mock_ws = AsyncMock(spec=WebSocket)
        mock_ws.send_json.side_effect = Exception("Send failed")

        notifier.register(["tg"], mock_ws)
        assert len(notifier._pools["tg"]) == 1

        result = await notifier._send_json(mock_ws, {"test": True})
        assert result is False
        assert "tg" not in notifier._pools

    async def test_register_unregister_unknown_ws(self) -> None:
        notifier = WSNotifier()
        mock_ws = AsyncMock(spec=WebSocket)

        notifier.unregister(mock_ws)
        assert len(notifier._pools) == 0

    async def test_stop_clears_all_pools(self) -> None:
        notifier = WSNotifier()
        mock_ws = AsyncMock(spec=WebSocket)

        notifier.register(["tg"], mock_ws)
        notifier.register(["wa"], mock_ws)
        assert len(notifier._pools) == 2

        await notifier.stop()
        assert len(notifier._pools) == 0


# ── Initial Sync Tests ───────────────────────────────────────────────────


class TestWSNotifierInitialSync:
    async def test_initial_sync_pushes_pending_human_summaries(self) -> None:
        notifier = WSNotifier()

        session = get_session()
        try:
            contact1 = Contact(source_id="c1", name="Contact One")
            session.add(contact1)
            session.flush()
            conv1 = Conversation(inbox_id="tg", contact_id=contact1.id, status="pending_human")
            session.add(conv1)
            session.flush()
            msg1 = Message(
                conversation_id=conv1.id, inbox_id="tg", sender_type="contact",
                sender_id=contact1.id, content="Hello from one", content_type="text",
                message_type="incoming", status="sent",
            )
            session.add(msg1)

            contact2 = Contact(source_id="c2", name="Contact Two")
            session.add(contact2)
            session.flush()
            conv2 = Conversation(inbox_id="tg", contact_id=contact2.id, status="pending_human")
            session.add(conv2)
            session.flush()
            msg2 = Message(
                conversation_id=conv2.id, inbox_id="tg", sender_type="contact",
                sender_id=contact2.id, content="Hello from two", content_type="text",
                message_type="incoming", status="sent",
            )
            session.add(msg2)
            session.commit()
            conv1_id, conv2_id = conv1.id, conv2.id
            contact1_id, contact2_id = contact1.id, contact2.id
        finally:
            session.close()

        mock_ws = AsyncMock(spec=WebSocket)
        await notifier.send_initial_sync(mock_ws, ["tg"])

        mock_ws.send_json.assert_awaited_once()
        args, _ = mock_ws.send_json.call_args
        payload = args[0]
        assert payload["event"] == "conversation.summary"
        assert len(payload["conversations"]) == 2
        conv_ids = {c["conversation_id"] for c in payload["conversations"]}
        assert conv_ids == {conv1_id, conv2_id}
        contact_ids = {c["contact"]["id"] for c in payload["conversations"]}
        assert contact_ids == {contact1_id, contact2_id}

    async def test_initial_sync_filters_by_inbox(self) -> None:
        notifier = WSNotifier()

        session = get_session()
        try:
            contact = Contact(source_id="filter_test", name="Filter Test")
            session.add(contact)
            session.flush()
            conv_tg = Conversation(inbox_id="tg", contact_id=contact.id, status="pending_human")
            session.add(conv_tg)
            conv_wa = Conversation(inbox_id="wa", contact_id=contact.id, status="pending_human")
            session.add(conv_wa)
            session.commit()
            conv_tg_id = conv_tg.id
        finally:
            session.close()

        mock_ws = AsyncMock(spec=WebSocket)
        await notifier.send_initial_sync(mock_ws, ["tg"])

        mock_ws.send_json.assert_awaited_once()
        args, _ = mock_ws.send_json.call_args
        payload = args[0]
        assert len(payload["conversations"]) == 1
        assert payload["conversations"][0]["conversation_id"] == conv_tg_id
        assert payload["conversations"][0]["inbox_id"] == "tg"

    async def test_initial_sync_empty_when_no_pending_human(self) -> None:
        notifier = WSNotifier()

        session = get_session()
        try:
            contact = Contact(source_id="active_test", name="Active Test")
            session.add(contact)
            session.flush()
            conv = Conversation(inbox_id="tg", contact_id=contact.id, status="active")
            session.add(conv)
            session.commit()
        finally:
            session.close()

        mock_ws = AsyncMock(spec=WebSocket)
        await notifier.send_initial_sync(mock_ws, ["tg"])

        mock_ws.send_json.assert_awaited_once()
        args, _ = mock_ws.send_json.call_args
        payload = args[0]
        assert payload["event"] == "conversation.summary"
        assert payload["conversations"] == []

    async def test_initial_sync_sorts_by_last_activity_at_desc(self) -> None:
        notifier = WSNotifier()
        from datetime import datetime, timezone

        session = get_session()
        try:
            contact = Contact(source_id="sort_test", name="Sort Test")
            session.add(contact)
            session.flush()
            conv_old = Conversation(
                inbox_id="tg", contact_id=contact.id, status="pending_human",
                last_activity_at=datetime(2026, 6, 1, tzinfo=timezone.utc),
            )
            session.add(conv_old)
            conv_new = Conversation(
                inbox_id="tg", contact_id=contact.id, status="pending_human",
                last_activity_at=datetime(2026, 7, 1, tzinfo=timezone.utc),
            )
            session.add(conv_new)
            session.commit()
            conv_new_id = conv_new.id
            conv_old_id = conv_old.id
        finally:
            session.close()

        mock_ws = AsyncMock(spec=WebSocket)
        await notifier.send_initial_sync(mock_ws, ["tg"])

        mock_ws.send_json.assert_awaited_once()
        args, _ = mock_ws.send_json.call_args
        payload = args[0]
        assert len(payload["conversations"]) == 2
        assert payload["conversations"][0]["conversation_id"] == conv_new_id
        assert payload["conversations"][1]["conversation_id"] == conv_old_id

    async def test_initial_sync_truncates_last_message(self) -> None:
        notifier = WSNotifier()

        session = get_session()
        try:
            contact = Contact(source_id="trunc_test", name="Trunc Test")
            session.add(contact)
            session.flush()
            conv = Conversation(inbox_id="tg", contact_id=contact.id, status="pending_human")
            session.add(conv)
            session.flush()
            long_content = "A" * 150
            msg = Message(
                conversation_id=conv.id, inbox_id="tg", sender_type="contact",
                sender_id=contact.id, content=long_content, content_type="text",
                message_type="incoming", status="sent",
            )
            session.add(msg)
            session.commit()
        finally:
            session.close()

        mock_ws = AsyncMock(spec=WebSocket)
        await notifier.send_initial_sync(mock_ws, ["tg"])

        mock_ws.send_json.assert_awaited_once()
        args, _ = mock_ws.send_json.call_args
        payload = args[0]
        assert len(payload["conversations"]) == 1
        assert payload["conversations"][0]["last_message"] == "A" * 100
        assert len(payload["conversations"][0]["last_message"]) == 100

    async def test_initial_sync_includes_unread_count(self) -> None:
        notifier = WSNotifier()

        session = get_session()
        try:
            contact = Contact(source_id="unread_test", name="Unread Test")
            session.add(contact)
            session.flush()
            conv = Conversation(inbox_id="tg", contact_id=contact.id, status="pending_human")
            session.add(conv)
            session.flush()
            for i in range(3):
                msg = Message(
                    conversation_id=conv.id, inbox_id="tg", sender_type="contact",
                    sender_id=contact.id, content=f"Unread msg {i}", content_type="text",
                    message_type="incoming", status="sent",
                )
                session.add(msg)
            session.add(Message(
                conversation_id=conv.id, inbox_id="tg", sender_type="contact",
                sender_id=contact.id, content="Failed msg", content_type="text",
                message_type="incoming", status="failed",
            ))
            session.add(Message(
                conversation_id=conv.id, inbox_id="tg", sender_type="agentbot",
                sender_id=None, content="Bot reply", content_type="text",
                message_type="outgoing", status="sent",
            ))
            session.commit()
        finally:
            session.close()

        mock_ws = AsyncMock(spec=WebSocket)
        await notifier.send_initial_sync(mock_ws, ["tg"])

        mock_ws.send_json.assert_awaited_once()
        args, _ = mock_ws.send_json.call_args
        payload = args[0]
        assert len(payload["conversations"]) == 1
        assert payload["conversations"][0]["unread_count"] == 3

    def test_initial_sync_integration(self, client: TestClient) -> None:
        session = get_session()
        try:
            contact = Contact(source_id="int_test", name="Integration")
            session.add(contact)
            session.flush()
            conv = Conversation(inbox_id="tg", contact_id=contact.id, status="pending_human")
            session.add(conv)
            session.flush()
            msg = Message(
                conversation_id=conv.id, inbox_id="tg", sender_type="contact",
                sender_id=contact.id, content="Integration test message", content_type="text",
                message_type="incoming", status="sent",
            )
            session.add(msg)
            session.commit()
            conv_id = conv.id
            contact_id = contact.id
        finally:
            session.close()

        with client.websocket_connect(f"/ws/notifications?token={_ADMIN_TOKEN}&inboxes=tg") as ws:
            data1 = ws.receive_json()
            assert data1["event"] == "connected"

            data2 = ws.receive_json()
            assert data2["event"] == "conversation.summary"
            assert len(data2["conversations"]) == 1
            conv_data = data2["conversations"][0]
            assert conv_data["conversation_id"] == conv_id
            assert conv_data["inbox_id"] == "tg"
            assert conv_data["contact"]["id"] == contact_id
            assert conv_data["contact"]["name"] == "Integration"
            assert conv_data["contact"]["source_id"] == "int_test"
            assert conv_data["last_message"] == "Integration test message"
            assert "last_message_at" in conv_data
            assert conv_data["unread_count"] == 1


# ── Bus Subscription Tests ────────────────────────────────────────────────


async def _drain_bus(name: str) -> None:
    bus_map = {
        "Incoming": get_incoming_bus(),
        "OutComing": get_out_coming_bus(),
    }
    bus = bus_map[name]
    while not bus._queue.empty():
        event = await bus._queue.get()
        await bus._dispatch(event)


class TestWSNotifierBus:
    async def test_subscribes_to_incoming_on_start(self) -> None:
        notifier = WSNotifier()
        await notifier.start()
        incoming_bus = get_incoming_bus()
        assert "Incoming" in incoming_bus._subscribers
        assert len(incoming_bus._subscribers["Incoming"]) > 0

    async def test_subscribes_to_outcoming_on_start(self) -> None:
        notifier = WSNotifier()
        await notifier.start()
        out_coming_bus = get_out_coming_bus()
        assert "OutComing" in out_coming_bus._subscribers
        assert len(out_coming_bus._subscribers["OutComing"]) > 0

    async def test_incoming_event_pushes_to_connection(self) -> None:
        notifier = WSNotifier()
        await notifier.start()

        session = get_session()
        try:
            contact = Contact(source_id="12345", name="Test Contact")
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
                sender_type="contact",
                message_type="incoming",
                content="Hello world",
                status="sent",
            )
            session.add(msg)
            session.commit()
            msg_id = msg.id
            conv_id = conversation.id
            contact_id = contact.id
        finally:
            session.close()

        mock_ws = AsyncMock(spec=WebSocket)
        notifier.register(["tg"], mock_ws)

        incoming_bus = get_incoming_bus()
        await incoming_bus.publish("Incoming", msg_id)
        await _drain_bus("Incoming")

        mock_ws.send_json.assert_awaited_once()
        args, _ = mock_ws.send_json.call_args
        payload = args[0]
        assert payload["event"] == "message.created"
        assert payload["message_id"] == msg_id
        assert payload["conversation_id"] == conv_id
        assert payload["inbox_id"] == "tg"
        assert payload["contact"]["id"] == contact_id
        assert payload["contact"]["name"] == "Test Contact"
        assert payload["contact"]["source_id"] == "12345"
        assert payload["content"] == "Hello world"
        assert payload["content_type"] == "text"
        assert payload["message_type"] == "incoming"
        assert "created_at" in payload

    async def test_outgoing_event_pushes_to_connection(self) -> None:
        notifier = WSNotifier()
        await notifier.start()

        session = get_session()
        try:
            contact = Contact(source_id="67890", name="Outgoing Contact")
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

        mock_ws = AsyncMock(spec=WebSocket)
        notifier.register(["tg"], mock_ws)

        out_coming_bus = get_out_coming_bus()
        await out_coming_bus.publish("OutComing", msg_id)
        await _drain_bus("OutComing")

        mock_ws.send_json.assert_awaited_once()
        args, _ = mock_ws.send_json.call_args
        payload = args[0]
        assert payload["message_type"] == "outgoing"

    async def test_filters_by_inbox(self) -> None:
        notifier = WSNotifier()
        await notifier.start()

        session = get_session()
        try:
            contact = Contact(source_id="11111", name="Filter Test")
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
                sender_type="contact",
                message_type="incoming",
                content="Filter test",
                status="sent",
            )
            session.add(msg)
            session.commit()
            msg_id = msg.id
        finally:
            session.close()

        mock_ws_tg = AsyncMock(spec=WebSocket)
        mock_ws_wa = AsyncMock(spec=WebSocket)
        notifier.register(["tg"], mock_ws_tg)
        notifier.register(["wa"], mock_ws_wa)

        incoming_bus = get_incoming_bus()
        await incoming_bus.publish("Incoming", msg_id)
        await _drain_bus("Incoming")

        mock_ws_tg.send_json.assert_awaited_once()
        mock_ws_wa.send_json.assert_not_called()

    async def test_skips_resolved_conversation(self) -> None:
        notifier = WSNotifier()
        await notifier.start()

        session = get_session()
        try:
            contact = Contact(source_id="22222", name="Resolved Test")
            session.add(contact)
            session.flush()
            conversation = Conversation(
                inbox_id="tg",
                contact_id=contact.id,
                status="resolved",
            )
            session.add(conversation)
            session.flush()
            msg = Message(
                conversation_id=conversation.id,
                inbox_id="tg",
                sender_type="contact",
                message_type="incoming",
                content="Should not push",
                status="sent",
            )
            session.add(msg)
            session.commit()
            msg_id = msg.id
        finally:
            session.close()

        mock_ws = AsyncMock(spec=WebSocket)
        notifier.register(["tg"], mock_ws)

        incoming_bus = get_incoming_bus()
        await incoming_bus.publish("Incoming", msg_id)
        await _drain_bus("Incoming")

        mock_ws.send_json.assert_not_called()

    async def test_skips_handoff_message(self) -> None:
        notifier = WSNotifier()
        await notifier.start()

        session = get_session()
        try:
            contact = Contact(source_id="33333", name="Handoff Test")
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

        mock_ws = AsyncMock(spec=WebSocket)
        notifier.register(["tg"], mock_ws)

        incoming_bus = get_incoming_bus()
        await incoming_bus.publish("Incoming", msg_id)
        await _drain_bus("Incoming")

        mock_ws.send_json.assert_not_called()

    async def test_removes_connection_on_push_failure(self) -> None:
        notifier = WSNotifier()
        await notifier.start()

        session = get_session()
        try:
            contact = Contact(source_id="44444", name="Fail Test")
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
                sender_type="contact",
                message_type="incoming",
                content="Fail push",
                status="sent",
            )
            session.add(msg)
            session.commit()
            msg_id = msg.id
        finally:
            session.close()

        mock_ws = AsyncMock(spec=WebSocket)
        mock_ws.send_json.side_effect = Exception("WS gone")
        notifier.register(["tg"], mock_ws)
        assert "tg" in notifier._pools
        assert len(notifier._pools["tg"]) == 1

        incoming_bus = get_incoming_bus()
        await incoming_bus.publish("Incoming", msg_id)
        await _drain_bus("Incoming")

        assert "tg" not in notifier._pools

    async def test_message_not_found(self) -> None:
        notifier = WSNotifier()
        await notifier.start()

        mock_ws = AsyncMock(spec=WebSocket)
        notifier.register(["tg"], mock_ws)

        incoming_bus = get_incoming_bus()
        await incoming_bus.publish("Incoming", "nonexistent-id")
        await _drain_bus("Incoming")

        mock_ws.send_json.assert_not_called()

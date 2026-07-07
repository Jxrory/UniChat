from typing import Any, AsyncGenerator

import httpx
import pytest
from fastapi import FastAPI
from httpx import ASGITransport
from starlette.middleware.sessions import SessionMiddleware

from src.config import AppConfig, InboxConfig, ServerConfig
from src.db import create_all, dispose_engine, get_session, init_db
from src.models import Contact, ContactInbox, Conversation, Message

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
    from src.bus import init_buses
    init_buses()
    yield


@pytest.fixture
def app() -> FastAPI:
    from src.adapters.telegram import register as register_telegram
    from src.routes.admin import router as admin_router
    from src.routes.webhook import router as webhook_router
    from src.routes.reply import router as reply_router

    register_telegram()

    app = FastAPI()
    app.state.config = _TEST_CONFIG
    app.add_middleware(SessionMiddleware, secret_key=_TEST_CONFIG.server.admin_token)
    app.include_router(webhook_router)
    app.include_router(reply_router)
    app.include_router(admin_router)
    return app


@pytest.fixture
async def client(app: FastAPI) -> AsyncGenerator[httpx.AsyncClient, Any]:
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


class TestAdminAuth:
    async def test_get_admin_without_cookie_redirects_to_login(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.get("/admin", follow_redirects=False)
        assert resp.status_code == 302
        assert resp.headers.get("location") == "/admin/login"

    async def test_login_page_returns_form(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.get("/admin/login")
        assert resp.status_code == 200
        assert b"Token" in resp.content
        assert "登录" in resp.text

    async def test_login_with_correct_token_sets_cookie_and_redirects(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.post(
            "/admin/login",
            data={"token": "test-admin-token"},
            follow_redirects=False,
        )
        assert resp.status_code == 302
        assert resp.headers.get("location") == "/admin"
        assert "session" in resp.cookies or "set-cookie" in resp.headers

    async def test_login_with_wrong_token_shows_error(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.post(
            "/admin/login",
            data={"token": "wrong-token"},
        )
        assert resp.status_code == 200
        assert b"Token" in resp.content
        assert "不正确" in resp.text

    async def test_login_then_access_admin(
        self, client: httpx.AsyncClient
    ) -> None:
        await client.post("/admin/login", data={"token": "test-admin-token"})

        resp = await client.get("/admin")
        assert resp.status_code == 200
        assert "暂无对话" in resp.text or "选择左侧对话" in resp.text

    async def test_logout_clears_session(
        self, client: httpx.AsyncClient
    ) -> None:
        await client.post("/admin/login", data={"token": "test-admin-token"})

        admin_resp = await client.get("/admin")
        assert admin_resp.status_code == 200

        logout_resp = await client.get("/admin/logout", follow_redirects=False)
        assert logout_resp.status_code == 302
        assert logout_resp.headers.get("location") == "/admin/login"

        resp2 = await client.get("/admin", follow_redirects=False)
        assert resp2.status_code == 302


class TestAdminConversationList:
    async def test_conversation_list_shows_contacts(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(source_id="12345", name="Test User")
            session.add(contact)
            session.flush()
            ci = ContactInbox(contact_id=contact.id, inbox_id="tg", source_id="12345")
            session.add(ci)
            session.flush()
            conv = Conversation(inbox_id="tg", contact_id=contact.id, status="active")
            session.add(conv)
            session.flush()
            msg = Message(
                conversation_id=conv.id,
                inbox_id="tg",
                sender_type="contact",
                message_type="incoming",
                content="Hello!",
                status="sent",
            )
            session.add(msg)
            session.commit()
        finally:
            session.close()

        await client.post("/admin/login", data={"token": "test-admin-token"})

        resp = await client.get("/admin")
        assert resp.status_code == 200
        assert b"Test User" in resp.content
        assert b"active" in resp.content
        assert b"Hello!" in resp.content

    async def test_empty_conversation_list(
        self, client: httpx.AsyncClient
    ) -> None:
        await client.post("/admin/login", data={"token": "test-admin-token"})

        resp = await client.get("/admin")
        assert resp.status_code == 200
        assert "暂无对话" in resp.text


class TestAdminMessageTimeline:
    async def test_messages_returned_in_order(
        self, client: httpx.AsyncClient
    ) -> None:
        from datetime import datetime, timezone, timedelta

        session = get_session()
        try:
            contact = Contact(source_id="12345", name="Test")
            session.add(contact)
            session.flush()
            ci = ContactInbox(contact_id=contact.id, inbox_id="tg", source_id="12345")
            session.add(ci)
            session.flush()
            conv = Conversation(inbox_id="tg", contact_id=contact.id, status="active")
            session.add(conv)
            session.flush()
            conv_id = conv.id
            base = datetime.now(timezone.utc)
            for i in range(3):
                session.add(Message(
                    conversation_id=conv_id,
                    inbox_id="tg",
                    sender_type="contact",
                    message_type="incoming",
                    content=f"msg-{i}",
                    status="sent",
                    created_at=base + timedelta(seconds=i),
                ))
            session.commit()
        finally:
            session.close()

        await client.post("/admin/login", data={"token": "test-admin-token"})

        resp = await client.get(f"/admin/conversations/{conv_id}/messages")
        assert resp.status_code == 200
        assert b"msg-0" in resp.content
        assert b"msg-1" in resp.content
        assert b"msg-2" in resp.content

    async def test_messages_requires_auth(
        self, client: httpx.AsyncClient
    ) -> None:
        resp = await client.get(
            "/admin/conversations/nonexistent/messages",
            follow_redirects=False,
        )
        assert resp.status_code == 302


class TestAdminReplyFlow:
    async def test_reply_creates_user_message(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(source_id="12345", name="Test")
            session.add(contact)
            session.flush()
            ci = ContactInbox(contact_id=contact.id, inbox_id="tg", source_id="12345")
            session.add(ci)
            session.flush()
            conv = Conversation(inbox_id="tg", contact_id=contact.id, status="active")
            session.add(conv)
            session.flush()
            conv_id = conv.id
            session.commit()
        finally:
            session.close()

        await client.post("/admin/login", data={"token": "test-admin-token"})

        resp = await client.post(
            f"/admin/conversations/{conv_id}/reply",
            data={"content": "Hello from admin"},
        )
        assert resp.status_code == 200

        session = get_session()
        try:
            msgs = (
                session.query(Message)
                .filter(Message.conversation_id == conv_id)
                .all()
            )
            assert len(msgs) == 1
            assert msgs[0].sender_type == "user"
            assert msgs[0].message_type == "outgoing"
            assert msgs[0].content == "Hello from admin"
            assert msgs[0].handoff is False
        finally:
            session.close()

    async def test_agentbot_message_renders_with_correct_css(
        self, client: httpx.AsyncClient
    ) -> None:
        """AgentBot messages render with msg-bubble-agentbot class and data-sender."""
        session = get_session()
        try:
            contact = Contact(source_id="12345", name="Test")
            session.add(contact)
            session.flush()
            ci = ContactInbox(contact_id=contact.id, inbox_id="tg", source_id="12345")
            session.add(ci)
            session.flush()
            conv = Conversation(inbox_id="tg", contact_id=contact.id, status="active")
            session.add(conv)
            session.flush()
            conv_id = conv.id

            session.add(Message(
                conversation_id=conv_id,
                inbox_id="tg",
                sender_type="contact",
                message_type="incoming",
                content="Hello",
                status="sent",
            ))
            session.add(Message(
                conversation_id=conv_id,
                inbox_id="tg",
                sender_type="agentbot",
                message_type="outgoing",
                content="Bot reply text",
                handoff=False,
                status="pending",
            ))
            session.commit()
        finally:
            session.close()

        await client.post("/admin/login", data={"token": "test-admin-token"})

        resp = await client.get(f"/admin/conversations/{conv_id}/messages")
        assert resp.status_code == 200
        assert b'data-sender="agentbot"' in resp.content
        assert b"msg-bubble-agentbot" in resp.content
        assert b"Bot reply text" in resp.content
        assert b"Bot" in resp.content

    async def test_resolve_conversation(
        self, client: httpx.AsyncClient
    ) -> None:
        session = get_session()
        try:
            contact = Contact(source_id="12345", name="Test")
            session.add(contact)
            session.flush()
            ci = ContactInbox(contact_id=contact.id, inbox_id="tg", source_id="12345")
            session.add(ci)
            session.flush()
            conv = Conversation(inbox_id="tg", contact_id=contact.id, status="active")
            session.add(conv)
            session.flush()
            conv_id = conv.id
            session.commit()
        finally:
            session.close()

        await client.post("/admin/login", data={"token": "test-admin-token"})

        resp = await client.post(
            f"/admin/conversations/{conv_id}/resolve",
        )
        assert resp.status_code == 200

        session = get_session()
        try:
            conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
            assert conv is not None
            assert conv.status == "resolved"
        finally:
            session.close()

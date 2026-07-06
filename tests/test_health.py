import httpx
import pytest
from fastapi import FastAPI
from httpx import ASGITransport

from src.config import AppConfig, InboxConfig, ServerConfig
from src.db import create_all, dispose_engine, init_db

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
]
_TEST_SERVER = ServerConfig(host="0.0.0.0", port=8000, admin_token="test-admin-token")
_TEST_CONFIG = AppConfig(inboxes=_TEST_INBOXES, server=_TEST_SERVER, database_url="sqlite://")


@pytest.fixture(autouse=True)
def _db() -> None:
    init_db("sqlite://")
    create_all()
    yield
    dispose_engine()


@pytest.fixture
def app() -> FastAPI:
    from src.adapters.telegram import register as register_telegram

    register_telegram()

    app = FastAPI()
    app.state.config = _TEST_CONFIG
    from src.routes.health import router as health_router

    app.include_router(health_router)
    return app


@pytest.fixture
async def client(app: FastAPI) -> httpx.AsyncClient:
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


class TestHealth:
    async def test_health_returns_healthy(self, client: httpx.AsyncClient) -> None:
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["checks"]["database"] == "ok"
        assert "timestamp" in data

import logging
import socket
import threading
import time
from collections.abc import Generator
from pathlib import Path

import httpx
import pytest
import uvicorn
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.app import create_app
from src.config import AppConfig, InboxConfig, ServerConfig
from src.db import get_session
from src.models import Base

logger = logging.getLogger("unichat.e2e")

_TEST_INBOXES = [
    InboxConfig(
        id="tg",
        name="E2E Test",
        channel_type="test",
        config={
            "webhook_secret": "e2e-secret",
            "agentbot_url": "",
            "agentbot_token": "",
            "allowed_senders": ["*"],
        },
    ),
]
_TEST_SERVER = ServerConfig(
    host="127.0.0.1",
    port=0,
    admin_token="e2e-token",
    log_level="WARNING",
)


def _find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _clean_tables(session: Session) -> None:
    for table in reversed(Base.metadata.sorted_tables):
        session.execute(text(f"DELETE FROM {table.name}"))
    session.commit()


@pytest.fixture(scope="session")
def e2e_server(tmp_path_factory: pytest.TempPathFactory) -> Generator[str, None, None]:
    port = _find_free_port()
    db_path: Path = tmp_path_factory.mktemp("e2e") / "test.db"
    db_url = f"sqlite:///{db_path}"

    config = AppConfig(
        inboxes=_TEST_INBOXES,
        server=ServerConfig(host="127.0.0.1", port=port, admin_token="e2e-token", log_level="WARNING"),
        database_url=db_url,
    )

    app = create_app(config)
    base_url = f"http://127.0.0.1:{port}"

    t = threading.Thread(
        target=lambda: uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning"),
        daemon=True,
    )
    t.start()

    for attempt in range(30):
        try:
            r = httpx.get(f"{base_url}/health", timeout=2)
            if r.status_code == 200:
                logger.info("E2E server ready at %s (db=%s)", base_url, db_url)
                break
        except Exception:
            pass
        time.sleep(0.5)
    else:
        raise RuntimeError(f"E2E server failed to start at {base_url}")

    yield base_url


@pytest.fixture(autouse=True)
def _clean_db() -> Generator[None, None, None]:
    try:
        session = get_session()
    except RuntimeError:
        yield
        return
    _clean_tables(session)
    session.close()
    yield
    try:
        session = get_session()
    except RuntimeError:
        return
    _clean_tables(session)
    session.close()


def _seed_contact_and_conversation() -> dict:
    ts = "2026-07-07T10:00:00+00:00"
    session = get_session()
    try:
        session.execute(
            text(
                "INSERT INTO contacts (id, source_id, name, last_activity_at, created_at) "
                "VALUES (:id, :sid, :name, :ts, :ts)"
            ),
            {"id": "e2e-contact-1", "sid": "e2e-user-1", "name": "E2E User", "ts": ts},
        )
        session.execute(
            text(
                "INSERT INTO contact_inboxes (id, contact_id, inbox_id, source_id, created_at) "
                "VALUES (:id, :cid, :iid, :sid, :ts)"
            ),
            {"id": "e2e-ci-1", "cid": "e2e-contact-1", "iid": "tg", "sid": "e2e-user-1", "ts": ts},
        )
        session.execute(
            text(
                "INSERT INTO conversations (id, inbox_id, contact_id, status, last_activity_at, created_at) "
                "VALUES (:id, :iid, :cid, :status, :ts, :ts)"
            ),
            {
                "id": "e2e-conv-1",
                "iid": "tg",
                "cid": "e2e-contact-1",
                "status": "active",
                "ts": ts,
            },
        )
        session.execute(
            text(
                "INSERT INTO messages (id, conversation_id, inbox_id, sender_type, message_type, content, content_type, handoff, status, created_at) "
                "VALUES (:id, :cid, :iid, :sender, :mtype, :content, :ctype, :handoff, :status, :ts)"
            ),
            {
                "id": "e2e-msg-1",
                "cid": "e2e-conv-1",
                "iid": "tg",
                "sender": "contact",
                "mtype": "incoming",
                "content": "Hello from E2E test!",
                "ctype": "text",
                "handoff": False,
                "status": "sent",
                "ts": ts,
            },
        )
        session.commit()
        return {"conv_id": "e2e-conv-1", "contact_id": "e2e-contact-1"}
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


@pytest.fixture
def seeded_conversation() -> dict:
    return _seed_contact_and_conversation()

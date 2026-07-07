import asyncio
import logging
from datetime import datetime, timedelta, timezone

from src.config import AppConfig
from src.db import get_session
from src.models import Conversation

logger = logging.getLogger("unichat.idle_sweep")

SWEEP_INTERVAL_SECONDS = 60


async def run_idle_sweep(config: AppConfig) -> None:
    while True:
        try:
            await asyncio.sleep(SWEEP_INTERVAL_SECONDS)
            await _sweep_once(config)
        except asyncio.CancelledError:
            logger.info("Idle sweep cancelled")
            break
        except Exception:
            logger.exception("Idle sweep error")


async def _sweep_once(config: AppConfig) -> None:
    web_inbox_ids = [
        ib.id for ib in config.inboxes if ib.channel_type == "web"
    ]
    if not web_inbox_ids:
        return

    now = datetime.now(timezone.utc)
    session = get_session()
    try:
        for inbox_id in web_inbox_ids:
            inbox = config.find_inbox(inbox_id)
            if inbox is None:
                continue
            idle_hours = int(inbox.config.get("idle_resolve_hours", 24))
            cutoff = now - timedelta(hours=idle_hours)

            stale = (
                session.query(Conversation)
                .filter(
                    Conversation.inbox_id == inbox_id,
                    Conversation.status == "active",
                    Conversation.last_activity_at < cutoff,
                )
                .all()
            )

            for conv in stale:
                conv.status = "resolved"
                logger.info(
                    "Idle resolve: conversation=%s inbox=%s last_activity=%s",
                    conv.id, inbox_id, conv.last_activity_at,
                )
        session.commit()
        if web_inbox_ids:
            logger.debug("Idle sweep completed: inboxes=%s", web_inbox_ids)
    finally:
        session.close()

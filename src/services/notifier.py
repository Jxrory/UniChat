import logging

import httpx

from src.bus import Event, get_incoming_bus
from src.config import AppConfig
from src.db import get_session
from src.models import Conversation, Message

logger = logging.getLogger("unichat.notifier")


class AgentBotNotifier:
    def __init__(self, config: AppConfig) -> None:
        self._config = config

    async def start(self) -> None:
        bus = get_incoming_bus()
        bus.subscribe("Incoming", self._handle)
        logger.debug("AgentBotNotifier subscribed to Incoming")

    async def _handle(self, event: Event) -> None:
        message_id: str = event.payload
        session = get_session()
        try:
            msg = session.query(Message).filter(Message.id == message_id).first()
            if msg is None:
                logger.warning("Message not found: msg_id=%s", message_id)
                return

            conversation = (
                session.query(Conversation)
                .filter(Conversation.id == msg.conversation_id)
                .first()
            )
            if conversation is None or conversation.status != "active":
                logger.debug("Skipping notify: conversation=%s status=%s", msg.conversation_id, conversation.status if conversation else "none")
                return

            inbox = next(
                (ib for ib in self._config.inboxes if ib.id == msg.inbox_id), None
            )
            if inbox is None:
                logger.warning("Inbox not found: inbox_id=%s", msg.inbox_id)
                return

            agentbot_url = inbox.config.get("agentbot_url", "")
            agentbot_token = inbox.config.get("agentbot_token", "")
            if not agentbot_url:
                logger.info("AgentBot disabled for inbox=%s (no url). msg_id=%s content=%s", msg.inbox_id, msg.id, msg.content)
                return
            if not agentbot_token:
                logger.warning("AgentBot not configured (no token) for inbox=%s", msg.inbox_id)
                return

            payload = {
                "event": "message.created",
                "message_id": msg.id,
                "conversation_id": msg.conversation_id,
                "inbox_id": msg.inbox_id,
                "content": msg.content,
                "content_type": "text",
            }
            headers = {
                "Authorization": f"Bearer {agentbot_token}",
                "Content-Type": "application/json",
            }

            logger.info("Notifying AgentBot: msg_id=%s url=%s", msg.id, agentbot_url)
            logger.debug("AgentBot request: url=%s payload=%s", agentbot_url, payload)
            async with httpx.AsyncClient() as client:
                try:
                    resp = await client.post(
                        agentbot_url, json=payload, headers=headers, timeout=10
                    )
                    if resp.is_success:
                        logger.debug("AgentBot response OK: msg_id=%s status=%d body=%s", msg.id, resp.status_code, resp.text)
                    else:
                        logger.warning("AgentBot error: msg_id=%s status=%d body=%s", msg.id, resp.status_code, resp.text)
                        msg.external_error = (
                            f"AgentBot returned {resp.status_code}: {resp.text[:200]}"
                        )
                        session.commit()
                except Exception as e:
                    logger.error("AgentBot request failed: msg_id=%s error=%s", msg.id, e)
                    msg.external_error = str(e)
                    session.commit()
        finally:
            session.close()

import httpx

from src.bus import Event, get_incoming_bus
from src.config import AppConfig
from src.db import get_session
from src.models import Conversation, Message


class AgentBotNotifier:
    def __init__(self, config: AppConfig) -> None:
        self._config = config

    async def start(self) -> None:
        bus = get_incoming_bus()
        bus.subscribe("Incoming", self._handle)

    async def _handle(self, event: Event) -> None:
        message_id: str = event.payload
        session = get_session()
        try:
            msg = session.query(Message).filter(Message.id == message_id).first()
            if msg is None:
                return

            conversation = (
                session.query(Conversation)
                .filter(Conversation.id == msg.conversation_id)
                .first()
            )
            if conversation is None or conversation.status != "active":
                return

            inbox = next(
                (ib for ib in self._config.inboxes if ib.id == msg.inbox_id), None
            )
            if inbox is None:
                return

            agentbot_url = inbox.config.get("agentbot_url")
            agentbot_token = inbox.config.get("agentbot_token")
            if not agentbot_url or not agentbot_token:
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

            async with httpx.AsyncClient() as client:
                try:
                    resp = await client.post(
                        agentbot_url, json=payload, headers=headers, timeout=10
                    )
                    if not resp.is_success:
                        msg.external_error = (
                            f"AgentBot returned {resp.status_code}: {resp.text[:200]}"
                        )
                        session.commit()
                except Exception as e:
                    msg.external_error = str(e)
                    session.commit()
        finally:
            session.close()

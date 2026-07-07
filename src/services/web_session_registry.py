import asyncio
import json
import logging
from datetime import timezone

from src.bus import Event, get_out_coming_bus
from src.db import get_session
from src.models import Message

logger = logging.getLogger("unichat.web_session_registry")


class WebSessionRegistry:
    def __init__(self) -> None:
        self._queues: dict[str, asyncio.Queue[str]] = {}

    def get_queue(self, conversation_id: str) -> asyncio.Queue[str]:
        if conversation_id not in self._queues:
            self._queues[conversation_id] = asyncio.Queue()
        return self._queues[conversation_id]

    def remove_queue(self, conversation_id: str) -> None:
        self._queues.pop(conversation_id, None)

    async def start(self) -> None:
        bus = get_out_coming_bus()
        bus.subscribe("OutComing", self._handle)
        logger.debug("WebSessionRegistry subscribed to OutComing")

    async def _handle(self, event: Event) -> None:
        message_id: str = event.payload
        session = get_session()
        try:
            msg = session.query(Message).filter(Message.id == message_id).first()
            if msg is None:
                logger.warning("Message not found: msg_id=%s", message_id)
                return
            if msg.handoff:
                logger.debug("Skipping handoff message: msg_id=%s", message_id)
                return
            if msg.conversation_id not in self._queues:
                return

            queue = self._queues[msg.conversation_id]
            data = {
                "event": "message.created",
                "message_id": msg.id,
                "conversation_id": msg.conversation_id,
                "content": msg.content,
                "content_type": msg.content_type,
                "sender_type": msg.sender_type,
                "message_type": msg.message_type,
                "created_at": msg.created_at.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S") + "Z",
            }
            await queue.put(json.dumps(data))
            logger.debug("Pushed to SSE queue: conversation=%s msg_id=%s", msg.conversation_id, msg.id)
        finally:
            session.close()


_session_registry: WebSessionRegistry | None = None


def get_web_session_registry() -> WebSessionRegistry:
    if _session_registry is None:
        raise RuntimeError("WebSessionRegistry not initialized")
    return _session_registry


def init_web_session_registry() -> WebSessionRegistry:
    global _session_registry
    _session_registry = WebSessionRegistry()
    return _session_registry

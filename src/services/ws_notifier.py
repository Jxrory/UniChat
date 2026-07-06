import logging
from datetime import timezone
from typing import Any

from src.bus import Event, get_incoming_bus, get_out_coming_bus
from src.db import get_session
from src.models import Conversation, Message

logger = logging.getLogger("unichat.ws_notifier")


class WSNotifier:
    def __init__(self) -> None:
        self._pools: dict[str, set[Any]] = {}

    async def start(self) -> None:
        incoming_bus = get_incoming_bus()
        incoming_bus.subscribe("Incoming", self._handle_incoming)
        out_coming_bus = get_out_coming_bus()
        out_coming_bus.subscribe("OutComing", self._handle_out_coming)
        logger.debug("WSNotifier subscribed to Incoming and OutComing")

    async def stop(self) -> None:
        self._pools.clear()
        logger.debug("WSNotifier stopped")

    def register(self, inboxes: list[str], ws: Any) -> None:
        for inbox_id in inboxes:
            if inbox_id not in self._pools:
                self._pools[inbox_id] = set()
            self._pools[inbox_id].add(ws)
        logger.debug("WS registered for inboxes=%s", inboxes)

    def unregister(self, ws: Any) -> None:
        for inbox_id, pool in list(self._pools.items()):
            pool.discard(ws)
            if not pool:
                del self._pools[inbox_id]
        logger.debug("WS unregistered")

    async def _send_json(self, ws: Any, data: dict) -> bool:
        try:
            await ws.send_json(data)
            return True
        except Exception:
            logger.exception("Failed to send JSON to WS")
            self.unregister(ws)
            return False

    async def send_initial_sync(self, ws: Any, inboxes: list[str]) -> None:
        session = get_session()
        try:
            conversations = (
                session.query(Conversation)
                .filter(
                    Conversation.status == "pending_human",
                    Conversation.inbox_id.in_(inboxes),
                )
                .order_by(Conversation.last_activity_at.desc())
                .all()
            )

            conv_list: list[dict] = []
            for conv in conversations:
                last_msg = (
                    session.query(Message)
                    .filter(Message.conversation_id == conv.id)
                    .order_by(Message.created_at.desc())
                    .first()
                )

                unread_count = (
                    session.query(Message)
                    .filter(
                        Message.conversation_id == conv.id,
                        Message.message_type == "incoming",
                        Message.status != "failed",
                    )
                    .count()
                )

                last_message = last_msg.content[:100] if last_msg else ""
                last_message_at = last_msg.created_at if last_msg else conv.last_activity_at
                dt_str = last_message_at.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S") + "Z"

                contact = conv.contact
                conv_list.append({
                    "conversation_id": conv.id,
                    "inbox_id": conv.inbox_id,
                    "contact": {
                        "id": contact.id,
                        "name": contact.name,
                        "source_id": contact.source_id,
                    },
                    "last_message": last_message,
                    "last_message_at": dt_str,
                    "unread_count": unread_count,
                })

            payload = {
                "event": "conversation.summary",
                "conversations": conv_list,
            }
            await self._send_json(ws, payload)
        finally:
            session.close()

    async def _handle_incoming(self, event: Event) -> None:
        await self._handle_message(event.payload, "incoming")

    async def _handle_out_coming(self, event: Event) -> None:
        await self._handle_message(event.payload, "outgoing")

    async def _handle_message(self, message_id: str, message_type: str) -> None:
        session = get_session()
        try:
            msg = session.query(Message).filter(Message.id == message_id).first()
            if msg is None:
                logger.warning("Message not found: msg_id=%s", message_id)
                return

            conversation = msg.conversation
            if conversation is None:
                logger.warning("Conversation not found for msg_id=%s", message_id)
                return

            if conversation.status == "resolved":
                logger.debug("Skipping WS push: conversation=%s status=resolved", conversation.id)
                return

            if msg.handoff:
                logger.debug("Skipping WS push: msg_id=%s handoff=True", msg.id)
                return

            contact = conversation.contact
            if contact is None:
                logger.warning("Contact not found for msg_id=%s", message_id)
                return

            payload = self._build_payload(msg, conversation, contact, message_type)
            await self._push_to_connections(msg.inbox_id, payload)
        finally:
            session.close()

    def _build_payload(self, message: Message, conversation: Any, contact: Any, message_type: str) -> dict:
        return {
            "event": "message.created",
            "message_id": message.id,
            "conversation_id": conversation.id,
            "inbox_id": message.inbox_id,
            "contact": {
                "id": contact.id,
                "name": contact.name,
                "source_id": contact.source_id,
            },
            "content": message.content,
            "content_type": message.content_type,
            "message_type": message_type,
            "created_at": message.created_at.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S") + "Z",
        }

    async def _push_to_connections(self, inbox_id: str, payload: dict) -> None:
        pool = self._pools.get(inbox_id, set())
        if not pool:
            logger.debug("No WS connections for inbox=%s", inbox_id)
            return
        for ws in list(pool):
            await self._send_json(ws, payload)

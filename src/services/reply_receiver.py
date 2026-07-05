from datetime import datetime, timezone

from src.bus import get_out_coming_bus
from src.db import get_session
from src.models import Conversation, Message


class ReplyReceiver:
    async def handle_reply(
        self,
        conversation_id: str,
        content: str,
        handoff: bool = False,
        source_id: str | None = None,
    ) -> dict[str, str | int | bool]:
        session = get_session()
        try:
            conversation = (
                session.query(Conversation)
                .filter(Conversation.id == conversation_id)
                .first()
            )
            if not conversation:
                return {"error": "conversation not found", "status_code": 404}

            if source_id:
                existing = (
                    session.query(Message)
                    .filter(
                        Message.inbox_id == conversation.inbox_id,
                        Message.source_id == source_id,
                    )
                    .first()
                )
                if existing is not None:
                    return {"error": "duplicate source_id", "status_code": 409}

            msg = Message(
                conversation_id=conversation.id,
                inbox_id=conversation.inbox_id,
                sender_type="agentbot",
                sender_id=None,
                content=content,
                content_type="text",
                message_type="outgoing",
                source_id=source_id,
                handoff=handoff,
                status="pending",
            )
            session.add(msg)
            session.flush()

            now = datetime.now(timezone.utc)
            conversation.last_activity_at = now
            if handoff:
                conversation.status = "pending_human"

            session.commit()

            if not handoff:
                bus = get_out_coming_bus()
                await bus.publish("OutComing", msg.id)

            return {"ok": True, "message_id": msg.id}
        finally:
            session.close()

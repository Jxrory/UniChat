from datetime import datetime, timezone
from typing import Any

from src.adapters.base import WebhookEvent
from src.bus import Event, get_incoming_bus, get_webhook_incoming_bus
from src.db import get_session
from src.models import Contact, Conversation, Message


class IngestService:
    async def start(self) -> None:
        bus = get_webhook_incoming_bus()
        bus.subscribe("WebhookIncoming", self._handle)

    async def _handle(self, event: Event) -> None:
        webhook_event: WebhookEvent = event.payload
        session = get_session()
        try:
            update_id = str(webhook_event.raw.get("update_id", ""))

            existing = (
                session.query(Message)
                .filter(
                    Message.inbox_id == webhook_event.inbox_id,
                    Message.source_id == update_id,
                )
                .first()
            )
            if existing is not None:
                return

            contact = self._find_or_create_contact(session, webhook_event)
            conversation = self._find_or_create_conversation(session, contact, webhook_event)

            msg = Message(
                conversation_id=conversation.id,
                inbox_id=webhook_event.inbox_id,
                sender_type="contact",
                sender_id=contact.id,
                content=webhook_event.content,
                content_type=webhook_event.content_type,
                message_type="incoming",
                source_id=update_id,
                status="sent",
            )
            session.add(msg)
            session.flush()

            now = datetime.now(timezone.utc)
            contact.last_activity_at = now
            conversation.last_activity_at = now

            session.commit()

            incoming_bus = get_incoming_bus()
            await incoming_bus.publish("Incoming", msg.id)
        finally:
            session.close()

    def _find_or_create_contact(
        self, session: Any, webhook_event: WebhookEvent
    ) -> Contact:
        contact: Contact | None = (
            session.query(Contact)
            .filter(
                Contact.inbox_id == webhook_event.inbox_id,
                Contact.source_id == webhook_event.source_id,
            )
            .first()
        )
        if contact is not None:
            return contact

        sender_info = webhook_event.raw.get("message", {}).get("from", {})
        parts = [sender_info.get("first_name"), sender_info.get("last_name")]
        name = " ".join(p for p in parts if p) or None
        avatar_url = sender_info.get("photo_url")

        contact = Contact(
            inbox_id=webhook_event.inbox_id,
            source_id=webhook_event.source_id,
            name=name,
            avatar_url=avatar_url,
            last_activity_at=datetime.now(timezone.utc),
        )
        session.add(contact)
        session.flush()
        return contact

    def _find_or_create_conversation(
        self, session: Any, contact: Contact, webhook_event: WebhookEvent
    ) -> Conversation:
        conversation: Conversation | None = (
            session.query(Conversation)
            .filter(
                Conversation.contact_id == contact.id,
                Conversation.inbox_id == webhook_event.inbox_id,
                Conversation.status == "active",
            )
            .order_by(Conversation.created_at.desc())
            .first()
        )
        if conversation is not None:
            return conversation

        conversation = Conversation(
            inbox_id=webhook_event.inbox_id,
            contact_id=contact.id,
            status="active",
            last_activity_at=datetime.now(timezone.utc),
        )
        session.add(conversation)
        session.flush()
        return conversation

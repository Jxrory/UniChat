import logging
from datetime import datetime, timezone
from typing import Any

from src.adapters.base import WebhookEvent
from src.bus import Event, get_incoming_bus, get_webhook_incoming_bus
from src.db import get_session
from src.models import Contact, Conversation, Message
from src.services.state_machine import validate_transition

logger = logging.getLogger("unichat.ingest")


class IngestService:
    async def start(self) -> None:
        bus = get_webhook_incoming_bus()
        bus.subscribe("WebhookIncoming", self._handle)
        logger.debug("IngestService subscribed to WebhookIncoming")

    async def _handle(self, event: Event) -> None:
        webhook_event: WebhookEvent = event.payload
        session = get_session()
        try:
            update_id = str(webhook_event.raw.get("update_id", ""))
            logger.debug(
                "Ingesting webhook event: inbox=%s update_id=%s content=%.50s",
                webhook_event.inbox_id, update_id, webhook_event.content,
            )

            existing = (
                session.query(Message)
                .filter(
                    Message.inbox_id == webhook_event.inbox_id,
                    Message.source_id == update_id,
                )
                .first()
            )
            if existing is not None:
                logger.debug("Duplicate message skipped: inbox=%s source_id=%s", webhook_event.inbox_id, update_id)
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

            logger.info(
                "Message ingested: msg_id=%s contact_id=%s conversation_id=%s",
                msg.id, contact.id, conversation.id,
            )

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
            logger.debug("Contact found: id=%s name=%s", contact.id, contact.name)
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
        logger.info("Contact created: id=%s inbox=%s source_id=%s name=%s", contact.id, webhook_event.inbox_id, webhook_event.source_id, name)
        return contact

    def _find_or_create_conversation(
        self, session: Any, contact: Contact, webhook_event: WebhookEvent
    ) -> Conversation:
        conversation: Conversation | None = (
            session.query(Conversation)
            .filter(
                Conversation.contact_id == contact.id,
                Conversation.inbox_id == webhook_event.inbox_id,
            )
            .order_by(Conversation.created_at.desc())
            .first()
        )
        if conversation is not None:
            logger.debug("Conversation found: id=%s status=%s", conversation.id, conversation.status)
            if validate_transition(conversation.status, "active"):
                conversation.status = "active"
                conversation.last_activity_at = datetime.now(timezone.utc)
                session.flush()
                logger.debug("Conversation re-activated: id=%s (was %s)", conversation.id, conversation.status)
            return conversation

        conversation = Conversation(
            inbox_id=webhook_event.inbox_id,
            contact_id=contact.id,
            status="active",
            last_activity_at=datetime.now(timezone.utc),
        )
        session.add(conversation)
        session.flush()
        logger.info("Conversation created: id=%s contact_id=%s inbox=%s", conversation.id, contact.id, webhook_event.inbox_id)
        return conversation

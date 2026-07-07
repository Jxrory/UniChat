import logging

from src.adapters.registry import registry
from src.bus import Event, get_out_coming_bus
from src.config import AppConfig
from src.db import get_session
from src.models import Contact, Conversation, Message

logger = logging.getLogger("unichat.sender")


class ChannelSender:
    def __init__(self, config: AppConfig) -> None:
        self._config = config

    async def start(self) -> None:
        bus = get_out_coming_bus()
        bus.subscribe("OutComing", self._handle)
        logger.debug("ChannelSender subscribed to OutComing")

    async def _handle(self, event: Event) -> None:
        message_id: str = event.payload
        session = get_session()
        try:
            msg = session.query(Message).filter(Message.id == message_id).first()
            if msg is None or msg.handoff or msg.message_type == "activity":
                logger.debug("Skipping send: msg=%s handoff=%s message_type=%s", message_id, msg.handoff if msg else "not_found", msg.message_type if msg else "n/a")
                return

            inbox = next(
                (ib for ib in self._config.inboxes if ib.id == msg.inbox_id), None
            )
            if inbox is None:
                logger.warning("Inbox not found for sending: inbox_id=%s", msg.inbox_id)
                return

            conversation = (
                session.query(Conversation)
                .filter(Conversation.id == msg.conversation_id)
                .first()
            )
            if conversation is None:
                logger.warning("Conversation not found: id=%s", msg.conversation_id)
                return
            contact = (
                session.query(Contact)
                .filter(Contact.id == conversation.contact_id)
                .first()
            )
            if contact is None:
                logger.warning("Contact not found: id=%s", conversation.contact_id)
                return

            adapter = registry.create(inbox.id, inbox.channel_type, inbox.config)
            logger.debug("Sending message: msg_id=%s target=%s", msg.id, contact.source_id)
            result = await adapter.send_message(msg.conversation_id, contact.source_id, msg.content)

            if result.ok and result.platform_message_id:
                msg.source_id = result.platform_message_id
                msg.status = "sent"
                logger.info("Message sent: msg_id=%s platform_msg_id=%s", msg.id, result.platform_message_id)
            else:
                msg.status = "failed"
                msg.external_error = result.error
                logger.error("Message send failed: msg_id=%s error=%s", msg.id, result.error)

            session.commit()
        finally:
            session.close()

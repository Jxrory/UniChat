from src.adapters.registry import registry
from src.bus import Event, get_out_coming_bus
from src.config import AppConfig
from src.db import get_session
from src.models import Contact, Conversation, Message


class ChannelSender:
    def __init__(self, config: AppConfig) -> None:
        self._config = config

    async def start(self) -> None:
        bus = get_out_coming_bus()
        bus.subscribe("OutComing", self._handle)

    async def _handle(self, event: Event) -> None:
        message_id: str = event.payload
        session = get_session()
        try:
            msg = session.query(Message).filter(Message.id == message_id).first()
            if msg is None or msg.handoff:
                return

            inbox = next(
                (ib for ib in self._config.inboxes if ib.id == msg.inbox_id), None
            )
            if inbox is None:
                return

            conversation = (
                session.query(Conversation)
                .filter(Conversation.id == msg.conversation_id)
                .first()
            )
            if conversation is None:
                return
            contact = (
                session.query(Contact)
                .filter(Contact.id == conversation.contact_id)
                .first()
            )
            if contact is None:
                return

            adapter = registry.create(inbox.id, inbox.channel_type, inbox.config)
            result = await adapter.send_message(contact.source_id, msg.content)

            if result.ok and result.platform_message_id:
                msg.source_id = result.platform_message_id
                msg.status = "sent"
            else:
                msg.status = "failed"
                msg.external_error = result.error

            session.commit()
        finally:
            session.close()

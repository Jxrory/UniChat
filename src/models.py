import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db import Base


def _uuid() -> str:
    return uuid.uuid4().hex


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    source_id: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    last_activity_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now
    )

    conversations: Mapped[list["Conversation"]] = relationship(back_populates="contact")
    contact_inboxes: Mapped[list["ContactInbox"]] = relationship(back_populates="contact")


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    inbox_id: Mapped[str] = mapped_column(String, nullable=False)
    contact_id: Mapped[str] = mapped_column(
        String, ForeignKey("contacts.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String, nullable=False, default="active"
    )
    last_activity_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now
    )

    contact: Mapped["Contact"] = relationship(back_populates="conversations")
    messages: Mapped[list["Message"]] = relationship(back_populates="conversation")


Index(None, Conversation.contact_id, Conversation.created_at.desc())


class ContactInbox(Base):
    __tablename__ = "contact_inboxes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    contact_id: Mapped[str] = mapped_column(
        String, ForeignKey("contacts.id"), nullable=False
    )
    inbox_id: Mapped[str] = mapped_column(String, nullable=False)
    source_id: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now
    )

    contact: Mapped["Contact"] = relationship(back_populates="contact_inboxes")

    __table_args__ = (
        UniqueConstraint("inbox_id", "source_id", name="uq_contact_inbox_source"),
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    conversation_id: Mapped[str] = mapped_column(
        String, ForeignKey("conversations.id"), nullable=False
    )
    inbox_id: Mapped[str] = mapped_column(String, nullable=False)
    sender_type: Mapped[str] = mapped_column(String, nullable=False)
    sender_id: Mapped[str | None] = mapped_column(String, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_type: Mapped[str] = mapped_column(String, nullable=False, default="text")
    message_type: Mapped[str] = mapped_column(String, nullable=False)
    handoff: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    source_id: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="sent")
    external_error: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now
    )

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")


Index(None, Message.conversation_id, Message.created_at)
Index(None, Message.inbox_id, Message.source_id)

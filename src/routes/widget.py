import asyncio
import hashlib
import hmac
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Request
from starlette.responses import JSONResponse, StreamingResponse

from src.adapters.base import WebhookEvent
from src.bus import get_webhook_incoming_bus
from src.config import AppConfig
from src.db import get_session
from src.models import Contact, ContactInbox, Conversation, Message
from src.services.web_session_registry import get_web_session_registry

logger = logging.getLogger("unichat.widget")
router = APIRouter()


@router.post("/widget/{inbox_id}/messages")
async def widget_message(inbox_id: str, request: Request) -> JSONResponse:
    config: AppConfig = request.app.state.config
    inbox = config.find_inbox(inbox_id)
    if inbox is None:
        return JSONResponse(status_code=404, content={"error": "inbox not found"})

    body: dict[str, Any] = await request.json()

    embed_key = inbox.config.get("embed_key", "")
    if body.get("embed_key") != embed_key:
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    source_id: str = body.get("source_id") or uuid.uuid4().hex
    client_msg_id: str = body.get("client_msg_id") or uuid.uuid4().hex
    content: str = body.get("content", "")
    content_type: str = body.get("content_type", "text")

    now = datetime.now(timezone.utc)

    session = get_session()
    try:
        ci = (
            session.query(ContactInbox)
            .filter(
                ContactInbox.inbox_id == inbox_id,
                ContactInbox.source_id == source_id,
            )
            .first()
        )
        if ci is not None:
            contact = ci.contact
            contact.last_activity_at = now
        else:
            contact = Contact(
                source_id=source_id,
                last_activity_at=now,
            )
            session.add(contact)
            session.flush()

            ci = ContactInbox(
                contact_id=contact.id,
                inbox_id=inbox_id,
                source_id=source_id,
            )
            session.add(ci)
            session.flush()

        conversation = (
            session.query(Conversation)
            .filter(
                Conversation.contact_id == contact.id,
                Conversation.inbox_id == inbox_id,
            )
            .order_by(Conversation.created_at.desc())
            .first()
        )
        if conversation is not None:
            conversation.last_activity_at = now
            if conversation.status != "active":
                from src.services.state_machine import validate_transition
                if validate_transition(conversation.status, "active"):
                    conversation.status = "active"
            session.flush()
        else:
            conversation = Conversation(
                inbox_id=inbox_id,
                contact_id=contact.id,
                status="active",
                last_activity_at=now,
            )
            session.add(conversation)
            session.flush()

        conv_id = conversation.id
        session.commit()
    finally:
        session.close()

    bus = get_webhook_incoming_bus()
    event = WebhookEvent(
        inbox_id=inbox_id,
        source_id=source_id,
        sender_source_id=source_id,
        content=content,
        content_type=content_type,
        raw={"update_id": client_msg_id},
    )
    await bus.publish("WebhookIncoming", event)

    return JSONResponse(
        status_code=200,
        content={
            "ok": True,
            "conversation_id": conv_id,
            "source_id": source_id,
        },
    )


@router.post("/widget/{inbox_id}/identify")
async def widget_identify(inbox_id: str, request: Request) -> JSONResponse:
    config: AppConfig = request.app.state.config
    inbox = config.find_inbox(inbox_id)
    if inbox is None:
        return JSONResponse(status_code=404, content={"error": "inbox not found"})

    body: dict[str, Any] = await request.json()

    embed_key = inbox.config.get("embed_key", "")
    if body.get("embed_key") != embed_key:
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    hmac_secret = inbox.config.get("hmac_secret")
    if not hmac_secret:
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    new_user_id: str = body.get("new_user_id", "")
    if not new_user_id:
        return JSONResponse(status_code=400, content={"error": "new_user_id is required"})

    user_hash: str = body.get("user_hash", "")
    expected_hash = hmac.new(
        hmac_secret.encode("utf-8"),
        new_user_id.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    if user_hash != expected_hash:
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    now = datetime.now(timezone.utc)
    old_source_id: str | None = body.get("source_id")

    session = get_session()
    try:
        if old_source_id and old_source_id != new_user_id:
            old_ci = (
                session.query(ContactInbox)
                .filter(
                    ContactInbox.inbox_id == inbox_id,
                    ContactInbox.source_id == old_source_id,
                )
                .first()
            )
            if old_ci is not None:
                old_conversation = (
                    session.query(Conversation)
                    .filter(
                        Conversation.contact_id == old_ci.contact_id,
                        Conversation.inbox_id == inbox_id,
                        Conversation.status.in_(["active", "pending_human"]),
                    )
                    .order_by(Conversation.created_at.desc())
                    .first()
                )
                if old_conversation is not None:
                    from src.services.state_machine import validate_transition

                    if validate_transition(old_conversation.status, "resolved"):
                        old_conversation.status = "resolved"
                        old_conversation.last_activity_at = now
                        session.flush()

        new_ci = (
            session.query(ContactInbox)
            .filter(
                ContactInbox.inbox_id == inbox_id,
                ContactInbox.source_id == new_user_id,
            )
            .first()
        )
        if new_ci is not None:
            contact = new_ci.contact
            contact.last_activity_at = now
        else:
            contact = Contact(
                source_id=new_user_id,
                last_activity_at=now,
            )
            session.add(contact)
            session.flush()

            new_ci = ContactInbox(
                contact_id=contact.id,
                inbox_id=inbox_id,
                source_id=new_user_id,
            )
            session.add(new_ci)
            session.flush()

        conversation = (
            session.query(Conversation)
            .filter(
                Conversation.contact_id == contact.id,
                Conversation.inbox_id == inbox_id,
                Conversation.status != "resolved",
            )
            .order_by(Conversation.created_at.desc())
            .first()
        )
        if conversation is not None:
            conversation.last_activity_at = now
            if conversation.status != "active":
                from src.services.state_machine import validate_transition

                if validate_transition(conversation.status, "active"):
                    conversation.status = "active"
            session.flush()
        else:
            conversation = Conversation(
                inbox_id=inbox_id,
                contact_id=contact.id,
                status="active",
                last_activity_at=now,
            )
            session.add(conversation)
            session.flush()

        conv_id = conversation.id
        session.commit()
    finally:
        session.close()

    return JSONResponse(
        status_code=200,
        content={
            "ok": True,
            "conversation_id": conv_id,
            "source_id": new_user_id,
        },
    )


@router.get("/widget/conversations/{conv_id}/sse")
async def widget_sse(conv_id: str, request: Request) -> StreamingResponse:
    config: AppConfig = request.app.state.config
    embed_key = request.query_params.get("embed_key", "")

    session = get_session()
    try:
        conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
        if conv is None:
            return JSONResponse(status_code=404, content={"error": "conversation not found"})

        inbox = config.find_inbox(conv.inbox_id)
        if inbox is None:
            return JSONResponse(status_code=404, content={"error": "inbox not found"})

        if embed_key != inbox.config.get("embed_key", ""):
            return JSONResponse(status_code=401, content={"error": "unauthorized"})
    finally:
        session.close()

    registry = get_web_session_registry()
    queue = registry.get_queue(conv_id)

    async def event_stream() -> None:
        try:
            while True:
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {data}\n\n"
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        except asyncio.CancelledError:
            registry.remove_queue(conv_id)
            raise

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/widget/conversations/{conv_id}/messages")
async def widget_messages(conv_id: str, request: Request) -> JSONResponse:
    config: AppConfig = request.app.state.config
    embed_key = request.query_params.get("embed_key", "")

    session = get_session()
    try:
        conv = session.query(Conversation).filter(Conversation.id == conv_id).first()
        if conv is None:
            return JSONResponse(status_code=404, content={"error": "conversation not found"})

        inbox = config.find_inbox(conv.inbox_id)
        if inbox is None:
            return JSONResponse(status_code=404, content={"error": "inbox not found"})

        if embed_key != inbox.config.get("embed_key", ""):
            return JSONResponse(status_code=401, content={"error": "unauthorized"})

        messages = (
            session.query(Message)
            .filter(Message.conversation_id == conv_id)
            .order_by(Message.created_at.asc())
            .all()
        )

        logger.debug("Widget messages fetched: conversation=%s count=%d", conv_id, len(messages))

        return JSONResponse(
            status_code=200,
            content={
                "messages": [
                    {
                        "id": m.id,
                        "sender_type": m.sender_type,
                        "sender_id": m.sender_id,
                        "content": m.content,
                        "content_type": m.content_type,
                        "message_type": m.message_type,
                        "handoff": m.handoff,
                        "status": m.status,
                        "created_at": m.created_at.isoformat(),
                    }
                    for m in messages
                ]
            },
        )
    finally:
        session.close()

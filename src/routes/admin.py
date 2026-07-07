import logging
from pathlib import Path

import jinja2
from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse
from starlette.templating import Jinja2Templates

from src.db import get_session
from src.models import Contact, Conversation, Message
from src.services.state_machine import validate_transition

logger = logging.getLogger("unichat.admin")

router = APIRouter(tags=["admin"])

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=jinja2.select_autoescape(),
    cache_size=0,
)
templates = Jinja2Templates(env=_env)


def _get_admin_token(request: Request) -> str:
    return request.app.state.config.server.admin_token


def _to_dict(obj):
    return {c.key: getattr(obj, c.key) for c in obj.__table__.columns}


def _get_messages_and_conversation(conv_id: str) -> tuple[dict | None, list[dict]]:
    session = get_session()
    try:
        conversation = session.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conversation:
            logger.warning("Conversation not found: conv_id=%s", conv_id)
            return None, []
        messages = (
            session.query(Message)
            .filter(Message.conversation_id == conv_id)
            .order_by(Message.created_at.asc())
            .all()
        )
        logger.debug("Messages loaded: conv_id=%s count=%d", conv_id, len(messages))
        for m in messages:
            logger.debug("  msg: id=%s sender_type=%s message_type=%s content=%.50s", m.id, m.sender_type, m.message_type, m.content)
        return _to_dict(conversation), [_to_dict(m) for m in messages]
    finally:
        session.close()


def _render_messages(
    request: Request,
    conversation: Conversation | None,
    messages: list[Message],
    reply_error: str | None = None,
    resolve_error: str | None = None,
    status_code: int = 200,
):
    return templates.TemplateResponse(
        request,
        "_messages.html",
        {
            "authenticated": True,
            "conversation": conversation,
            "messages": messages,
            "reply_error": reply_error,
            "resolve_error": resolve_error,
        },
        status_code=status_code,
    )


@router.get("/admin/login")
async def login_page(request: Request):
    return templates.TemplateResponse(
        request, "login.html", {"error": None, "authenticated": False}
    )


@router.post("/admin/login")
async def login_submit(request: Request, token: str = Form(...)):
    admin_token = _get_admin_token(request)
    if token == admin_token:
        request.session["authenticated"] = True
        return RedirectResponse(url="/admin", status_code=302)
    return templates.TemplateResponse(
        request, "login.html", {"error": "Token 不正确，请重试", "authenticated": False}
    )


@router.get("/admin/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/admin/login", status_code=302)


@router.get("/admin")
@router.get("/admin/")
async def admin_dashboard(request: Request):
    if not request.session.get("authenticated"):
        return RedirectResponse(url="/admin/login", status_code=302)

    session = get_session()
    try:
        conversations = (
            session.query(
                Conversation.id,
                Conversation.status,
                Conversation.inbox_id,
                Conversation.last_activity_at,
                Contact.name.label("contact_name"),
                Contact.source_id.label("contact_source_id"),
                Message.content.label("last_preview"),
            )
            .join(Contact, Conversation.contact_id == Contact.id)
            .outerjoin(
                Message,
                Message.id
                == (
                    session.query(Message.id)
                    .filter(Message.conversation_id == Conversation.id)
                    .order_by(Message.created_at.desc())
                    .limit(1)
                    .correlate(Conversation)
                    .scalar_subquery()
                ),
            )
            .order_by(Conversation.last_activity_at.desc())
            .all()
        )
    finally:
        session.close()

    inboxes = [inbox.id for inbox in request.app.state.config.inboxes]

    return templates.TemplateResponse(
        request, "admin.html", {"authenticated": True, "conversations": conversations, "inboxes": inboxes}
    )


@router.get("/admin/conversations/list")
async def conversation_list(request: Request):
    """Return just the conv-list partial (no full page, avoids htmx OOB collision)."""
    if not request.session.get("authenticated"):
        return RedirectResponse(url="/admin/login", status_code=302)

    session = get_session()
    try:
        conversations = (
            session.query(
                Conversation.id,
                Conversation.status,
                Conversation.inbox_id,
                Conversation.last_activity_at,
                Contact.name.label("contact_name"),
                Contact.source_id.label("contact_source_id"),
                Message.content.label("last_preview"),
            )
            .join(Contact, Conversation.contact_id == Contact.id)
            .outerjoin(
                Message,
                Message.id
                == (
                    session.query(Message.id)
                    .filter(Message.conversation_id == Conversation.id)
                    .order_by(Message.created_at.desc())
                    .limit(1)
                    .correlate(Conversation)
                    .scalar_subquery()
                ),
            )
            .order_by(Conversation.last_activity_at.desc())
            .all()
        )
    finally:
        session.close()

    return templates.TemplateResponse(
        request, "_conv_list.html", {"authenticated": True, "conversations": conversations}
    )


@router.get("/admin/conversations/{conv_id}/messages")
async def conversation_messages(request: Request, conv_id: str):
    if not request.session.get("authenticated"):
        return RedirectResponse(url="/admin/login", status_code=302)

    conversation, messages = _get_messages_and_conversation(conv_id)
    if not conversation:
        return _render_messages(request, None, [], status_code=404)

    return _render_messages(request, conversation, messages)


@router.post("/admin/conversations/{conv_id}/reply")
async def conversation_reply(request: Request, conv_id: str, content: str = Form(...)):
    if not request.session.get("authenticated"):
        return RedirectResponse(url="/admin/login", status_code=302)

    if not content or not content.strip():
        conversation, messages = _get_messages_and_conversation(conv_id)
        if not conversation:
            return _render_messages(request, None, [], status_code=404)
        return _render_messages(request, conversation, messages, reply_error="回复内容不能为空")

    session = get_session()
    try:
        conversation = session.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conversation:
            return _render_messages(request, None, [], status_code=404)

        inbox_id = conversation.inbox_id
        msg = Message(
            conversation_id=conv_id,
            inbox_id=inbox_id,
            sender_type="user",
            message_type="outgoing",
            content=content.strip(),
            status="pending",
            handoff=False,
        )
        session.add(msg)
        session.commit()
        msg_id = msg.id

        from src.bus import get_out_coming_bus
        bus = get_out_coming_bus()
        await bus.publish("OutComing", msg_id)

        messages = (
            session.query(Message)
            .filter(Message.conversation_id == conv_id)
            .order_by(Message.created_at.asc())
            .all()
        )
        conv_dict = _to_dict(conversation)
        msg_list = [_to_dict(m) for m in messages]
    except Exception as e:
        session.rollback()
        logger.exception("Failed to send admin reply")
        conversation, messages = _get_messages_and_conversation(conv_id)
        return _render_messages(request, conversation, messages, reply_error=f"发送失败：{e}")
    finally:
        session.close()

    return _render_messages(request, conv_dict, msg_list)


@router.post("/admin/conversations/{conv_id}/resolve")
async def conversation_resolve(request: Request, conv_id: str):
    if not request.session.get("authenticated"):
        return RedirectResponse(url="/admin/login", status_code=302)

    session = get_session()
    try:
        conversation = session.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conversation:
            return _render_messages(request, None, [], status_code=404)

        if not validate_transition(conversation.status, "resolved"):
            messages = (
                session.query(Message)
                .filter(Message.conversation_id == conv_id)
                .order_by(Message.created_at.asc())
                .all()
            )
            conv_dict = _to_dict(conversation)
            msg_list = [_to_dict(m) for m in messages]
            return _render_messages(
                request, conv_dict, msg_list,
                resolve_error=f"无法关闭：当前状态为 {conversation.status}",
            )

        conversation.status = "resolved"
        session.commit()
    finally:
        session.close()

    conversation, messages = _get_messages_and_conversation(conv_id)
    return _render_messages(request, conversation, messages)

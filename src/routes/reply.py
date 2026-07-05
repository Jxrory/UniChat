import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Request
from starlette.responses import JSONResponse

from src.config import AppConfig
from src.db import get_session
from src.models import Conversation, Message
from src.services.reply_receiver import ReplyReceiver
from src.services.state_machine import validate_transition

logger = logging.getLogger("unichat.reply")
router = APIRouter()


def _verify_admin_token(request: Request) -> str | None:
    config: AppConfig = request.app.state.config
    expected_token = config.server.admin_token
    auth = request.headers.get("Authorization", "")
    token = auth.removeprefix("Bearer ").strip()
    if not token or token != expected_token:
        return None
    return token


@router.post("/api/v1/agentbot/reply")
async def agentbot_reply(request: Request) -> JSONResponse:
    if _verify_admin_token(request) is None:
        logger.warning("AgentBot reply unauthorized")
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    body = await request.json()
    logger.debug("AgentBot reply request body: %s", body)
    conversation_id = body.get("conversation_id")
    content = body.get("content")
    handoff = body.get("handoff", False)
    source_id = body.get("source_id")

    if not conversation_id or not content:
        return JSONResponse(
            status_code=400, content={"error": "missing required fields"}
        )

    logger.info("AgentBot reply: conversation=%s handoff=%s content=%s", conversation_id, handoff, content)

    receiver = ReplyReceiver()
    result = await receiver.handle_reply(
        conversation_id=conversation_id,
        content=content,
        handoff=handoff,
        source_id=source_id,
    )

    status_code: int = result.get("status_code", 200)  # type: ignore[assignment]
    if status_code != 200:
        logger.warning("AgentBot reply rejected: conversation=%s reason=%s", conversation_id, result.get("error"))
        return JSONResponse(status_code=status_code, content=result)

    logger.info("AgentBot reply handled: message_id=%s", result["message_id"])
    return JSONResponse(status_code=200, content={"ok": True, "message_id": result["message_id"]})


@router.post("/api/v1/conversations/{conversation_id}/reply")
async def user_reply(conversation_id: str, request: Request) -> JSONResponse:
    if _verify_admin_token(request) is None:
        logger.warning("User reply unauthorized: conversation=%s", conversation_id)
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    body = await request.json()
    logger.debug("User reply request body: %s", body)
    content = body.get("content")

    if not content:
        return JSONResponse(
            status_code=400, content={"error": "missing required fields"}
        )

    logger.info("User reply: conversation=%s content=%s", conversation_id, content)

    receiver = ReplyReceiver()
    result = await receiver.handle_reply(
        conversation_id=conversation_id,
        content=content,
        handoff=False,
        source_id=None,
        sender_type="user",
    )

    status_code: int = result.get("status_code", 200)  # type: ignore[assignment]
    if status_code != 200:
        return JSONResponse(status_code=status_code, content=result)

    logger.info("User reply handled: message_id=%s", result["message_id"])
    return JSONResponse(status_code=200, content={"ok": True, "message_id": result["message_id"]})


@router.post("/api/v1/conversations/{conversation_id}/resolve")
async def resolve_conversation(conversation_id: str, request: Request) -> JSONResponse:
    if _verify_admin_token(request) is None:
        logger.warning("Resolve unauthorized: conversation=%s", conversation_id)
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    session = get_session()
    try:
        conversation = (
            session.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .first()
        )
        if not conversation:
            logger.warning("Resolve failed — conversation not found: %s", conversation_id)
            return JSONResponse(status_code=404, content={"error": "conversation not found"})

        # 409 chosen over 200-noop: the caller sent a mutating request that had no
        # effect, so an error status is more honest than a success response.
        # Status is never silently corrupted.
        if not validate_transition(conversation.status, "resolved"):
            logger.warning("Resolve rejected: conversation=%s status=%s", conversation_id, conversation.status)
            return JSONResponse(
                status_code=409,
                content={
                    "error": f"cannot resolve conversation in status '{conversation.status}'"
                },
            )

        conversation.status = "resolved"
        conversation.last_activity_at = datetime.now(timezone.utc)
        session.commit()

        logger.info("Conversation resolved: id=%s", conversation_id)
        return JSONResponse(status_code=200, content={"ok": True})
    finally:
        session.close()


@router.get("/api/v1/conversations/{conversation_id}/messages")
async def get_conversation_messages(conversation_id: str, request: Request) -> JSONResponse:
    if _verify_admin_token(request) is None:
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    session = get_session()
    try:
        conversation = (
            session.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .first()
        )
        if not conversation:
            return JSONResponse(status_code=404, content={"error": "conversation not found"})

        messages = (
            session.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .all()
        )

        logger.debug("Messages fetched: conversation=%s count=%d", conversation_id, len(messages))

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

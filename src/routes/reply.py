from fastapi import APIRouter, Request
from starlette.responses import JSONResponse

from src.config import AppConfig
from src.services.reply_receiver import ReplyReceiver

router = APIRouter()


@router.post("/api/v1/agentbot/reply")
async def agentbot_reply(request: Request) -> JSONResponse:
    config: AppConfig = request.app.state.config
    expected_token = config.server.admin_token

    auth = request.headers.get("Authorization", "")
    token = auth.removeprefix("Bearer ").strip()
    if not token or token != expected_token:
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    body = await request.json()
    conversation_id = body.get("conversation_id")
    content = body.get("content")
    handoff = body.get("handoff", False)
    source_id = body.get("source_id")

    if not conversation_id or not content:
        return JSONResponse(
            status_code=400, content={"error": "missing required fields"}
        )

    receiver = ReplyReceiver()
    result = await receiver.handle_reply(
        conversation_id=conversation_id,
        content=content,
        handoff=handoff,
        source_id=source_id,
    )

    status_code: int = result.get("status_code", 200)  # type: ignore[assignment]
    if status_code != 200:
        return JSONResponse(status_code=status_code, content=result)

    return JSONResponse(status_code=200, content={"ok": True, "message_id": result["message_id"]})

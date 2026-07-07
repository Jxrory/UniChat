import logging

import httpx
from fastapi import APIRouter, Request
from starlette.responses import JSONResponse

from src.config import AppConfig

logger = logging.getLogger("unichat.echo")
router = APIRouter()


def _verify_admin_token(request: Request) -> str | None:
    config: AppConfig = request.app.state.config
    expected = config.server.admin_token
    auth = request.headers.get("Authorization", "")
    token = auth.removeprefix("Bearer ").strip()
    if not token or token != expected:
        return None
    return token


@router.post("/_dev/echo")
async def dev_echo(request: Request) -> JSONResponse:
    if _verify_admin_token(request) is None:
        logger.warning("Echo unauthorized")
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    body = await request.json()
    conversation_id = body.get("conversation_id")
    content = body.get("content", "")

    if not conversation_id:
        return JSONResponse(status_code=400, content={"error": "missing conversation_id"})

    echo_content = f"[echo] {content}"

    config: AppConfig = request.app.state.config
    admin_token = config.server.admin_token
    port = config.server.port
    reply_url = f"http://127.0.0.1:{port}/api/v1/agentbot/reply"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "conversation_id": conversation_id,
        "content": echo_content,
        "handoff": False,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(reply_url, json=payload, headers=headers, timeout=10)

    if resp.is_success:
        logger.info("Echo reply sent: conversation=%s", conversation_id)
        return JSONResponse(status_code=200, content={"ok": True})

    logger.warning("Echo reply failed: status=%d body=%s", resp.status_code, resp.text[:200])
    return JSONResponse(status_code=502, content={"error": "echo reply failed"})

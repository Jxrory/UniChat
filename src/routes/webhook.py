from fastapi import APIRouter, Request, Response
from starlette.responses import JSONResponse

from src.adapters.registry import registry
from src.bus import get_webhook_incoming_bus
from src.config import AppConfig

router = APIRouter()


@router.post("/webhooks/telegram/{inbox_id}")
async def telegram_webhook(inbox_id: str, request: Request) -> Response:
    config: AppConfig = request.app.state.config

    inbox = None
    for ib in config.inboxes:
        if ib.id == inbox_id:
            inbox = ib
            break

    if inbox is None:
        return JSONResponse(status_code=404, content={"error": "inbox not found"})

    adapter = registry.create(inbox.id, inbox.channel_type, inbox.config)

    headers = dict(request.headers)
    body = await request.body()

    if not adapter.verify_webhook(headers, body):
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    event = adapter.parse_webhook(headers, body)
    if event is None:
        return JSONResponse(status_code=200, content={"ok": True, "skipped": True})

    bus = get_webhook_incoming_bus()
    await bus.publish("WebhookIncoming", event)

    return JSONResponse(status_code=200, content={"ok": True})

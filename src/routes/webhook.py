import logging

from fastapi import APIRouter, Request, Response
from starlette.responses import JSONResponse, PlainTextResponse

from src.adapters.registry import registry
from src.bus import get_webhook_incoming_bus
from src.config import AppConfig

logger = logging.getLogger("unichat.webhook")
router = APIRouter()


@router.post("/webhooks/telegram/{inbox_id}")
async def telegram_webhook(inbox_id: str, request: Request) -> Response:
    config: AppConfig = request.app.state.config
    inbox = config.find_inbox(inbox_id)
    if inbox is None:
        logger.warning("Webhook received for unknown inbox: %s", inbox_id)
        return JSONResponse(status_code=404, content={"error": "inbox not found"})

    adapter = registry.create(inbox.id, inbox.channel_type, inbox.config)

    headers = dict(request.headers)
    body = await request.body()
    logger.debug("Webhook raw request: inbox=%s headers=%s body=%s", inbox_id, {k: v for k, v in headers.items() if k.lower() not in ("authorization", "x-telegram-bot-api-secret-token")}, body.decode("utf-8", errors="replace"))

    if not adapter.verify_webhook({}, headers, body):
        logger.warning("Webhook verification failed: inbox=%s", inbox_id)
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    logger.debug("Webhook verified: inbox=%s", inbox_id)

    event = adapter.parse_webhook(headers, body)
    if event is None:
        logger.debug("Webhook skipped (non-message): inbox=%s", inbox_id)
        return JSONResponse(status_code=200, content={"ok": True, "skipped": True})

    logger.info("Webhook received: inbox=%s source_id=%s content=%s", inbox_id, event.source_id, event.content)

    bus = get_webhook_incoming_bus()
    await bus.publish("WebhookIncoming", event)

    return JSONResponse(status_code=200, content={"ok": True})


@router.get("/webhooks/whatsapp/{inbox_id}")
async def whatsapp_webhook_verify(inbox_id: str, request: Request) -> Response:
    config: AppConfig = request.app.state.config
    inbox = config.find_inbox(inbox_id)
    if inbox is None:
        logger.warning("WhatsApp webhook verify for unknown inbox: %s", inbox_id)
        return PlainTextResponse(status_code=404, content="inbox not found")

    adapter = registry.create(inbox.id, inbox.channel_type, inbox.config)
    params = dict(request.query_params)

    if not adapter.verify_webhook(params, {}, b""):
        logger.warning("WhatsApp webhook verify failed: inbox=%s", inbox_id)
        return PlainTextResponse(status_code=401, content="unauthorized")

    challenge = params.get("hub.challenge", "")
    logger.info("WhatsApp webhook verified: inbox=%s", inbox_id)
    return PlainTextResponse(content=challenge)


@router.post("/webhooks/whatsapp/{inbox_id}")
async def whatsapp_webhook(inbox_id: str, request: Request) -> Response:
    config: AppConfig = request.app.state.config
    inbox = config.find_inbox(inbox_id)
    if inbox is None:
        logger.warning("WhatsApp webhook for unknown inbox: %s", inbox_id)
        return JSONResponse(status_code=404, content={"error": "inbox not found"})

    adapter = registry.create(inbox.id, inbox.channel_type, inbox.config)

    headers = dict(request.headers)
    body = await request.body()
    logger.debug("WhatsApp webhook raw request: inbox=%s body=%s", inbox_id, body.decode("utf-8", errors="replace"))

    if not adapter.verify_webhook({}, headers, body):
        logger.warning("WhatsApp webhook verification failed: inbox=%s", inbox_id)
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    event = adapter.parse_webhook(headers, body)
    if event is None:
        logger.debug("WhatsApp webhook skipped (non-message): inbox=%s", inbox_id)
        return JSONResponse(status_code=200, content={"ok": True, "skipped": True})

    logger.info("WhatsApp webhook received: inbox=%s source_id=%s content=%s", inbox_id, event.source_id, event.content)

    bus = get_webhook_incoming_bus()
    await bus.publish("WebhookIncoming", event)

    return JSONResponse(status_code=200, content={"ok": True})

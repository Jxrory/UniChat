import logging
from typing import Any

import httpx

from src.adapters.base import ChannelAdapter, SendResult, WebhookEvent
from src.adapters.telegram.format import (
    _strip_mdv2,
    format_message,
    truncate_message,
    utf16_len,
)

logger = logging.getLogger("unichat.telegram_adapter")


class TelegramAdapter(ChannelAdapter):
    def verify_webhook(self, headers: dict[str, str], body: bytes) -> bool:
        expected: str | None = self.config.get("webhook_secret")
        if not expected:
            logger.warning("webhook_secret not configured for inbox=%s", self.inbox_id)
            return False
        actual: str | None = headers.get("x-telegram-bot-api-secret-token")
        if not actual:
            actual = headers.get("X-Telegram-Bot-Api-Secret-Token")
        result = actual is not None and actual == expected
        logger.debug("Webhook verify: inbox=%s result=%s", self.inbox_id, result)
        return result

    def parse_webhook(self, headers: dict[str, str], body: bytes) -> WebhookEvent | None:
        import json

        logger.debug("Webhook raw body: inbox=%s body=%s", self.inbox_id, body.decode("utf-8", errors="replace"))

        try:
            data: dict[str, Any] = json.loads(body)
        except json.JSONDecodeError:
            logger.warning("Failed to parse webhook body as JSON: inbox=%s", self.inbox_id)
            return None

        update = data.get("message")
        if update is None:
            logger.debug("Webhook skipped (no message field): inbox=%s", self.inbox_id)
            return None

        chat: dict[str, Any] = update.get("chat", {})
        if chat.get("type") != "private":
            logger.debug("Webhook skipped (non-private chat): inbox=%s type=%s", self.inbox_id, chat.get("type"))
            return None

        text = update.get("text")
        if text is None:
            logger.debug("Webhook skipped (no text): inbox=%s", self.inbox_id)
            return None

        logger.debug("Webhook parsed: inbox=%s from=%s chat=%s text=%s", self.inbox_id, update.get("from", {}).get("id"), chat.get("id"), text)
        return WebhookEvent(
            inbox_id=self.inbox_id,
            source_id=str(chat["id"]),
            sender_source_id=str(update["from"]["id"]),
            content=text,
            content_type="text",
            raw=data,
        )

    async def send_message(self, target: str, content: str) -> SendResult:
        token = self.config.get("token")
        if not token:
            logger.error("Token not configured for inbox=%s", self.inbox_id)
            return SendResult(ok=False, error="token not configured")

        url = f"https://api.telegram.org/bot{token}/sendMessage"

        # formatted = format_message(content)
        # chunks = truncate_message(formatted, len_fn=utf16_len)
        # text = chunks[0]
        text = content

        logger.debug("Telegram send request: target=%s", target)

        async with httpx.AsyncClient() as client:
            try:
                payload = {"chat_id": target, "text": text, "parse_mode": "Markdown"}
                logger.debug("Telegram send request: payload.parse_mode=%s", payload["parse_mode"])
                resp = await client.post(url, json=payload, timeout=10)
                if resp.is_success:
                    result: dict[str, Any] = resp.json()
                    msg_id = str(result["result"]["message_id"])
                    logger.debug("Telegram send response: target=%s status=%d", target, resp.status_code)
                    return SendResult(ok=True, platform_message_id=msg_id)

                error_text = resp.text.lower()
                if resp.status_code == 400 and ("parse" in error_text or "markdown" in error_text):
                    logger.warning("MarkdownV2 parse failed, falling back to plain text: target=%s", target)
                    plain = _strip_mdv2(text)
                    payload = {"chat_id": target, "text": plain}
                    resp = await client.post(url, json=payload, timeout=10)
                    if resp.is_success:
                        result = resp.json()
                        msg_id = str(result["result"]["message_id"])
                        return SendResult(ok=True, platform_message_id=msg_id)
                    return SendResult(ok=False, error=resp.text)

                logger.warning("Telegram API error: target=%s status=%s body=%s", target, resp.status_code, resp.text)
                return SendResult(ok=False, error=resp.text)
            except Exception as e:
                logger.error("Telegram API request failed: target=%s error=%s", target, e)
                return SendResult(ok=False, error=str(e))

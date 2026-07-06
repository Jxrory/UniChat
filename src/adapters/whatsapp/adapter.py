import json
import logging
from typing import Any

import httpx

from src.adapters.base import ChannelAdapter, SendResult, WebhookEvent

logger = logging.getLogger("unichat.whatsapp_adapter")

WHATSAPP_MAX_LENGTH = 4096


class WhatsAppAdapter(ChannelAdapter):
    def verify_webhook(self, params: dict[str, str], headers: dict[str, str], body: bytes) -> bool:
        if "hub.mode" in params:
            expected: str | None = self.config.get("webhook_secret")
            result = (
                params.get("hub.mode") == "subscribe"
                and params.get("hub.verify_token") == expected
            )
            logger.debug("Webhook verify GET: inbox=%s result=%s", self.inbox_id, result)
            return result
        logger.debug("Webhook verify POST: inbox=%s returning True", self.inbox_id)
        return True

    def parse_webhook(self, headers: dict[str, str], body: bytes) -> WebhookEvent | None:
        logger.debug("Webhook raw body: inbox=%s body=%s", self.inbox_id, body.decode("utf-8", errors="replace"))

        try:
            data: dict[str, Any] = json.loads(body)
        except json.JSONDecodeError:
            logger.warning("Failed to parse webhook body as JSON: inbox=%s", self.inbox_id)
            return None

        try:
            value = data["entry"][0]["changes"][0]["value"]
        except (KeyError, IndexError):
            logger.debug("Webhook skipped (unexpected structure): inbox=%s", self.inbox_id)
            return None

        if "statuses" in value:
            logger.debug("Webhook skipped (status update): inbox=%s", self.inbox_id)
            return None

        messages = value.get("messages")
        if not messages:
            logger.debug("Webhook skipped (no messages field): inbox=%s", self.inbox_id)
            return None

        msg = messages[0]
        if msg.get("type") != "text":
            logger.debug("Webhook skipped (non-text type=%s): inbox=%s", msg.get("type"), self.inbox_id)
            return None

        from_number = msg["from"]
        text = msg["text"]["body"]
        wa_msg_id = msg["id"]

        data["update_id"] = wa_msg_id

        logger.debug("Webhook parsed: inbox=%s from=%s text=%s", self.inbox_id, from_number, text)
        return WebhookEvent(
            inbox_id=self.inbox_id,
            source_id=from_number,
            sender_source_id=from_number,
            content=text,
            content_type="text",
            raw=data,
        )

    @staticmethod
    def _chunk_text(text: str, max_len: int = WHATSAPP_MAX_LENGTH) -> list[str]:
        if not text:
            return [""]
        return [text[i:i + max_len] for i in range(0, len(text), max_len)]

    async def _send_single(self, target: str, text: str) -> SendResult:
        phone_number_id = self.config.get("phone_number_id")
        if not phone_number_id:
            logger.error("phone_number_id not configured for inbox=%s", self.inbox_id)
            return SendResult(ok=False, error="phone_number_id not configured")

        token = self.config.get("token")
        if not token:
            logger.error("token not configured for inbox=%s", self.inbox_id)
            return SendResult(ok=False, error="token not configured")

        url = f"https://graph.facebook.com/v20.0/{phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": target,
            "type": "text",
            "text": {"body": text},
        }
        logger.debug("WhatsApp send request: target=%s", target)

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(url, json=payload, headers=headers, timeout=10)
                if resp.is_success:
                    result: dict[str, Any] = resp.json()
                    msg_id = str(result["messages"][0]["id"])
                    logger.debug(
                        "WhatsApp send response: target=%s status=%d body=%s",
                        target, resp.status_code, resp.text,
                    )
                    return SendResult(ok=True, platform_message_id=msg_id)
                logger.warning(
                    "WhatsApp API error: target=%s status=%s body=%s",
                    target, resp.status_code, resp.text,
                )
                return SendResult(ok=False, error=resp.text)
            except Exception as e:
                logger.error("WhatsApp API request failed: target=%s error=%s", target, e)
                return SendResult(ok=False, error=str(e))

    async def send_message(self, target: str, content: str) -> SendResult:
        chunks = self._chunk_text(content)
        if len(chunks) == 1:
            return await self._send_single(target, chunks[0])

        first_result: SendResult | None = None
        for chunk in chunks:
            result = await self._send_single(target, chunk)
            if not result.ok:
                return result
            if first_result is None:
                first_result = result
        return first_result  # type: ignore[return-value]

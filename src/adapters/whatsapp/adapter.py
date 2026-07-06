import json
import logging
from typing import Any

from src.adapters.base import ChannelAdapter, SendResult, WebhookEvent

logger = logging.getLogger("unichat.whatsapp_adapter")


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

    async def send_message(self, target: str, content: str) -> SendResult:
        raise NotImplementedError("send_message implemented in issue #20")

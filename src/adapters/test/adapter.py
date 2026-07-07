import json
import logging
from typing import Any
from uuid import uuid4

from src.adapters.base import ChannelAdapter, SendResult, WebhookEvent

logger = logging.getLogger("unichat.test_adapter")


class TestAdapter(ChannelAdapter):
    __test__ = False  # pytest: not a test class
    def verify_webhook(self, params: dict[str, str], headers: dict[str, str], body: bytes) -> bool:
        expected: str | None = self.config.get("webhook_secret")
        if not expected:
            return True
        actual: str | None = None
        for key, value in headers.items():
            if key.lower() == "x-webhook-secret":
                actual = value
                break
        return actual is not None and actual == expected

    def parse_webhook(self, headers: dict[str, str], body: bytes) -> WebhookEvent | None:
        logger.debug("Test webhook raw body: inbox=%s body=%s", self.inbox_id, body.decode("utf-8", errors="replace"))

        if not body:
            logger.debug("Test webhook skipped (empty body): inbox=%s", self.inbox_id)
            return None

        try:
            data: dict[str, Any] = json.loads(body)
        except json.JSONDecodeError:
            logger.warning("Failed to parse test webhook body as JSON: inbox=%s", self.inbox_id)
            return None

        text = data.get("text")
        if not text:
            logger.debug("Test webhook skipped (no text): inbox=%s", self.inbox_id)
            return None

        source_id = str(data.get("source_id", "test-user"))
        sender_source_id = str(data.get("sender_source_id", "test-user"))
        if "update_id" in data:
            update_id = str(data["update_id"])
        elif "msg_id" in data:
            update_id = str(data["msg_id"])
        else:
            update_id = uuid4().hex

        raw: dict[str, Any] = {"update_id": update_id}
        raw.update(data)

        logger.debug(
            "Test webhook parsed: inbox=%s source_id=%s sender_source_id=%s text=%s",
            self.inbox_id, source_id, sender_source_id, text,
        )
        return WebhookEvent(
            inbox_id=self.inbox_id,
            source_id=source_id,
            sender_source_id=sender_source_id,
            content=text,
            content_type="text",
            raw=raw,
        )

    async def send_message(self, target: str, content: str) -> SendResult:
        logger.info("[TestAdapter] Would send to %s: %s", target, content)
        return SendResult(ok=True, platform_message_id=f"test-{uuid4().hex[:8]}")

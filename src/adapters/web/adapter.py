import logging
from uuid import uuid4

from src.adapters.base import ChannelAdapter, SendResult, WebhookEvent

logger = logging.getLogger("unichat.web_adapter")


class WebAdapter(ChannelAdapter):
    def verify_webhook(self, params: dict[str, str], headers: dict[str, str], body: bytes) -> bool:
        return True

    def parse_webhook(self, headers: dict[str, str], body: bytes) -> WebhookEvent | None:
        return None

    async def send_message(self, conversation_id: str, target: str, content: str) -> SendResult:
        logger.info("[WebAdapter] send_message conversation=%s target=%s", conversation_id, target)
        return SendResult(ok=True, platform_message_id=uuid4().hex)

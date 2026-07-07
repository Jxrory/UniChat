import asyncio
import logging
import re
from typing import Any

import httpx

from src.adapters.base import ChannelAdapter, SendResult, WebhookEvent

logger = logging.getLogger("unichat.telegram_adapter")

TELEGRAM_MAX_LENGTH = 4096


class TelegramAdapter(ChannelAdapter):
    RICH_MESSAGE_MAX_CHARS = 32768

    def __init__(self, inbox_id: str, config: dict[str, Any]) -> None:
        super().__init__(inbox_id, config)
        self._rich_send_disabled: bool = False

    def verify_webhook(self, params: dict[str, str], headers: dict[str, str], body: bytes) -> bool:
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

    @staticmethod
    def _needs_rich(content: str) -> bool:
        lines = content.split("\n")

        fence_count = sum(1 for line in lines if re.match(r"^```", line))
        if fence_count >= 2:
            return True

        for line in lines:
            if re.match(r"^#{1,6}\s", line.strip()):
                return True

        for line in lines:
            if re.match(r"^[ \t]*\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)+\|?[ \t]*$", line):
                return True

        return False

    @staticmethod
    def _chunk_text(text: str, max_len: int = TELEGRAM_MAX_LENGTH) -> list[str]:
        if not text:
            return [""]
        return [text[i:i + max_len] for i in range(0, len(text), max_len)]

    async def _send_single(self, target: str, text: str) -> SendResult:
        token = self.config.get("token")
        if not token:
            logger.error("Token not configured for inbox=%s", self.inbox_id)
            return SendResult(ok=False, error="token not configured")

        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {"chat_id": target, "text": text}
        logger.debug("Telegram send request: target=%s payload=%s", target, payload)

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(url, json=payload, timeout=10)
                if resp.is_success:
                    result: dict[str, Any] = resp.json()
                    msg_id = str(result["result"]["message_id"])
                    logger.debug("Telegram send response: target=%s status=%d body=%s", target, resp.status_code, resp.text)
                    return SendResult(ok=True, platform_message_id=msg_id)
                logger.warning("Telegram API error: target=%s status=%s body=%s", target, resp.status_code, resp.text)
                return SendResult(ok=False, error=resp.text)
            except Exception as e:
                logger.error("Telegram API request failed: target=%s error=%s", target, e)
                return SendResult(ok=False, error=str(e))

    async def _send_rich_message(self, target: str, content: str) -> SendResult:
        if self._rich_send_disabled:
            logger.info("Rich send disabled for inbox=%s, skipping", self.inbox_id)
            return SendResult(ok=False, error="rich_send_disabled")

        if len(content.encode("utf-8")) > self.RICH_MESSAGE_MAX_CHARS:
            logger.info("Rich content too long for inbox=%s (%d bytes), sending as plain text", self.inbox_id, len(content.encode("utf-8")))
            return SendResult(ok=False, error="content_too_long")

        token = self.config.get("token")
        if not token:
            logger.error("Token not configured for inbox=%s", self.inbox_id)
            return SendResult(ok=False, error="token not configured")

        url = f"https://api.telegram.org/bot{token}/sendRichMessage"
        payload = {"chat_id": target, "rich_message": {"markdown": content}}
        logger.debug("Telegram sendRichMessage request: target=%s", target)

        max_retries = 1

        for attempt in range(max_retries + 1):
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.post(url, json=payload, timeout=10)

                if resp.is_success:
                    result: dict[str, Any] = resp.json()
                    msg_id = str(result["result"]["message_id"])
                    logger.debug("Telegram sendRichMessage response: target=%s status=%d", target, resp.status_code)
                    return SendResult(ok=True, platform_message_id=msg_id)

                error_text = resp.text
                error_code: int | None = None
                try:
                    error_code = resp.json().get("error_code")
                except Exception:
                    pass

                if resp.status_code == 404 or error_code == 404 or "method not found" in error_text.lower():
                    logger.warning("Telegram sendRichMessage endpoint not found for inbox=%s, latching off", self.inbox_id)
                    self._rich_send_disabled = True
                    return SendResult(ok=False, error=error_text)

                if resp.status_code == 429 and attempt < max_retries:
                    retry_after = 1
                    try:
                        retry_after = int(resp.json().get("parameters", {}).get("retry_after", 1))
                    except Exception:
                        pass
                    logger.warning("Telegram sendRichMessage flood control for inbox=%s, waiting %ds", self.inbox_id, retry_after)
                    await asyncio.sleep(retry_after)
                    continue

                logger.warning("Telegram sendRichMessage API error: target=%s status=%s body=%s", target, resp.status_code, error_text)
                return SendResult(ok=False, error=error_text)

            except httpx.TimeoutException as e:
                if attempt < max_retries:
                    logger.warning("Telegram sendRichMessage timeout for inbox=%s, retrying", self.inbox_id)
                    continue
                logger.warning("Telegram sendRichMessage timeout for inbox=%s, giving up", self.inbox_id)
                return SendResult(ok=False, error=str(e))

            except Exception as e:
                logger.error("Telegram sendRichMessage request failed: target=%s error=%s", target, e)
                return SendResult(ok=False, error=str(e))

        return SendResult(ok=False, error="rich_send_failed")

    async def send_message(self, conversation_id: str, target: str, content: str) -> SendResult:
        if self._needs_rich(content):
            rich_result = await self._send_rich_message(target, content)
            if rich_result.ok:
                return rich_result

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

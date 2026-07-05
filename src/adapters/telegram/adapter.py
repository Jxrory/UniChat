from typing import Any

import httpx

from src.adapters.base import ChannelAdapter, SendResult, WebhookEvent


class TelegramAdapter(ChannelAdapter):
    def verify_webhook(self, headers: dict[str, str], body: bytes) -> bool:
        expected: str | None = self.config.get("webhook_secret")
        if not expected:
            return False
        actual: str | None = headers.get("x-telegram-bot-api-secret-token")
        if not actual:
            actual = headers.get("X-Telegram-Bot-Api-Secret-Token")
        return actual is not None and actual == expected

    def parse_webhook(self, headers: dict[str, str], body: bytes) -> WebhookEvent | None:
        import json

        try:
            data: dict[str, Any] = json.loads(body)
        except json.JSONDecodeError:
            return None

        update = data.get("message")
        if update is None:
            return None

        chat: dict[str, Any] = update.get("chat", {})
        if chat.get("type") != "private":
            return None

        text = update.get("text")
        if text is None:
            return None

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
            return SendResult(ok=False, error="token not configured")

        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {"chat_id": target, "text": content}

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(url, json=payload, timeout=10)
                if resp.is_success:
                    result: dict[str, Any] = resp.json()
                    msg_id = str(result["result"]["message_id"])
                    return SendResult(ok=True, platform_message_id=msg_id)
                return SendResult(ok=False, error=resp.text)
            except Exception as e:
                return SendResult(ok=False, error=str(e))

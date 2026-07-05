from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class WebhookEvent:
    inbox_id: str
    source_id: str
    sender_source_id: str
    content: str
    content_type: str
    raw: dict[str, Any] = field(default_factory=dict)


@dataclass
class SendResult:
    ok: bool
    platform_message_id: str | None = None
    error: str | None = None


class ChannelAdapter(ABC):
    inbox_id: str
    config: dict[str, Any]

    def __init__(self, inbox_id: str, config: dict[str, Any]) -> None:
        self.inbox_id = inbox_id
        self.config = config

    @abstractmethod
    def verify_webhook(self, headers: dict[str, str], body: bytes) -> bool: ...

    @abstractmethod
    def parse_webhook(self, headers: dict[str, str], body: bytes) -> WebhookEvent | None: ...

    @abstractmethod
    async def send_message(self, target: str, content: str) -> SendResult: ...

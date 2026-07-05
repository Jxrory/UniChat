from src.adapters.registry import registry
from src.adapters.telegram.adapter import TelegramAdapter


def register() -> None:
    registry.register("telegram", TelegramAdapter)

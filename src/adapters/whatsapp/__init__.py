from src.adapters.registry import registry
from src.adapters.whatsapp.adapter import WhatsAppAdapter


def register() -> None:
    registry.register("whatsapp", WhatsAppAdapter)

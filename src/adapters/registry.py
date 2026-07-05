from typing import Any

from src.adapters.base import ChannelAdapter


class AdapterRegistry:
    def __init__(self) -> None:
        self._factories: dict[str, type[ChannelAdapter]] = {}

    def register(self, channel_type: str, factory: type[ChannelAdapter]) -> None:
        self._factories[channel_type] = factory

    def create(self, inbox_id: str, channel_type: str, config: dict[str, Any]) -> ChannelAdapter:
        factory = self._factories.get(channel_type)
        if factory is None:
            raise ValueError(f"Unknown channel type: {channel_type}")
        return factory(inbox_id=inbox_id, config=config)


registry = AdapterRegistry()

import logging
from typing import Any

from src.adapters.base import ChannelAdapter

logger = logging.getLogger("unichat.registry")


class AdapterRegistry:
    def __init__(self) -> None:
        self._factories: dict[str, type[ChannelAdapter]] = {}

    def register(self, channel_type: str, factory: type[ChannelAdapter]) -> None:
        self._factories[channel_type] = factory
        logger.debug("Adapter registered: type=%s factory=%s", channel_type, factory.__name__)

    def create(self, inbox_id: str, channel_type: str, config: dict[str, Any]) -> ChannelAdapter:
        factory = self._factories.get(channel_type)
        if factory is None:
            logger.error("Unknown channel type: %s", channel_type)
            raise ValueError(f"Unknown channel type: {channel_type}")
        logger.debug("Adapter created: inbox=%s type=%s", inbox_id, channel_type)
        return factory(inbox_id=inbox_id, config=config)


registry = AdapterRegistry()

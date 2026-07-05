import asyncio
import logging
from collections.abc import Callable, Coroutine
from dataclasses import dataclass
from typing import Any

logger = logging.getLogger("unichat.bus")


@dataclass
class Event:
    name: str
    payload: Any = None


class Bus:
    def __init__(self) -> None:
        self._queue: asyncio.Queue[Event] = asyncio.Queue()
        self._subscribers: dict[str, list[Callable[[Event], Coroutine[Any, Any, None]]]] = {}

    def subscribe(self, event_name: str, handler: Callable[[Event], Coroutine[Any, Any, None]]) -> None:
        self._subscribers.setdefault(event_name, []).append(handler)
        logger.debug("Subscribed handler=%s event=%s", handler.__name__, event_name)

    async def publish(self, event_name: str, payload: Any = None) -> None:
        event = Event(name=event_name, payload=payload)
        await self._queue.put(event)
        logger.debug("Published event=%s payload=%r queue_size=%d", event_name, payload, self._queue.qsize())

    async def _dispatch(self, event: Event) -> None:
        handlers = self._subscribers.get(event.name, [])
        if not handlers:
            logger.debug("No handlers for event=%s", event.name)
            return
        for handler in handlers:
            try:
                await handler(event)
            except Exception:
                logger.exception("Handler '%s' failed on event=%s", handler.__name__, event.name)

    async def run(self) -> None:
        logger.info("Bus event loop started")
        while True:
            event = await self._queue.get()
            logger.debug("Dequeued event=%s payload=%r", event.name, event.payload)
            await self._dispatch(event)


_webhook_incoming_bus: Bus | None = None
_incoming_bus: Bus | None = None
_out_coming_bus: Bus | None = None


def init_buses() -> None:
    global _webhook_incoming_bus, _incoming_bus, _out_coming_bus
    _webhook_incoming_bus = Bus()
    _incoming_bus = Bus()
    _out_coming_bus = Bus()


def get_webhook_incoming_bus() -> Bus:
    if _webhook_incoming_bus is None:
        raise RuntimeError("buses not initialized")
    return _webhook_incoming_bus


def get_incoming_bus() -> Bus:
    if _incoming_bus is None:
        raise RuntimeError("buses not initialized")
    return _incoming_bus


def get_out_coming_bus() -> Bus:
    if _out_coming_bus is None:
        raise RuntimeError("buses not initialized")
    return _out_coming_bus

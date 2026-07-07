from src.adapters.registry import registry
from src.adapters.test.adapter import TestAdapter


def register() -> None:
    registry.register("test", TestAdapter)

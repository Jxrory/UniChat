from src.adapters.registry import registry
from src.adapters.web.adapter import WebAdapter


def register() -> None:
    registry.register("web", WebAdapter)

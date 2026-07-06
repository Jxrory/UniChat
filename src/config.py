import logging
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml

logger = logging.getLogger("unichat.config")

_ENV_VAR_PATTERN = re.compile(r"\$\{([^}]+)\}")


def _substitute_env(value: str) -> str:
    def _replace(m: re.Match[str]) -> str:
        var = m.group(1)
        val = os.environ.get(var)
        if val is None:
            raise ValueError(f"Environment variable {var} is not set")
        return val

    return _ENV_VAR_PATTERN.sub(_replace, value)


def _walk_and_substitute(obj: Any) -> Any:
    if isinstance(obj, str):
        return _substitute_env(obj)
    if isinstance(obj, dict):
        return {k: _walk_and_substitute(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_walk_and_substitute(item) for item in obj]
    return obj


@dataclass
class InboxConfig:
    id: str
    name: str
    channel_type: str
    config: dict[str, Any]


@dataclass
class ServerConfig:
    host: str
    port: int
    admin_token: str
    log_level: str = "DEBUG"


@dataclass
class AppConfig:
    inboxes: list[InboxConfig]
    server: ServerConfig
    database_url: str

    def find_inbox(self, inbox_id: str) -> InboxConfig | None:
        for ib in self.inboxes:
            if ib.id == inbox_id:
                return ib
        return None


def load_config(path: str | Path = "config.yaml") -> AppConfig:
    raw = yaml.safe_load(Path(path).read_text())
    resolved: dict[str, Any] = _walk_and_substitute(raw)

    db_url = os.environ.get("DATABASE_URL")
    if db_url is None:
        db_url = resolved["database"]["url"]

    log_level = os.environ.get("LOG_LEVEL") or resolved["server"].get("log_level", "DEBUG")

    cfg = AppConfig(
        inboxes=[InboxConfig(**ib) for ib in resolved["inboxes"]],
        server=ServerConfig(**resolved["server"]),
        database_url=db_url,
    )
    cfg.server.log_level = log_level
    logger.debug("Config loaded: %d inbox(es), db=%s, log_level=%s", len(cfg.inboxes), cfg.database_url, cfg.server.log_level)
    return cfg

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml

logger = logging.getLogger("unichat.config")


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
    env: str = "development"
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
    raw: dict[str, Any] = yaml.safe_load(Path(path).read_text())

    cfg = AppConfig(
        inboxes=[InboxConfig(**ib) for ib in raw["inboxes"]],
        server=ServerConfig(**raw["server"]),
        database_url=raw["database"]["url"],
    )
    logger.debug("Config loaded: %d inbox(es), db=%s, log_level=%s, env=%s", len(cfg.inboxes), cfg.database_url, cfg.server.log_level, cfg.server.env)
    return cfg

import logging
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

logger = logging.getLogger("unichat.db")

_engine = None
_SessionLocal: sessionmaker[Session] | None = None


class Base(DeclarativeBase):
    pass


def init_db(database_url: str, **engine_kwargs: Any) -> None:
    global _engine, _SessionLocal
    logger.info("Initializing database: %s", database_url)
    _engine = create_engine(database_url, echo=False, **engine_kwargs)
    _SessionLocal = sessionmaker(bind=_engine)
    logger.debug("Database engine created")


def run_migrations() -> None:
    from alembic.command import upgrade
    from alembic.config import Config as AlembicConfig

    cfg = AlembicConfig("alembic.ini")
    upgrade(cfg, "head")
    logger.info("Database migrations up to date")


def get_session() -> Session:
    if _SessionLocal is None:
        raise RuntimeError("init_db() must be called before get_session()")
    return _SessionLocal()


def dispose_engine() -> None:
    global _engine, _SessionLocal
    if _engine is not None:
        _engine.dispose()
        logger.debug("Database engine disposed")
    _engine = None
    _SessionLocal = None

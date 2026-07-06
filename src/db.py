import logging

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

logger = logging.getLogger("unichat.db")

_engine = None
_SessionLocal: sessionmaker[Session] | None = None


class Base(DeclarativeBase):
    pass


def init_db(database_url: str) -> None:
    global _engine, _SessionLocal
    logger.info("Initializing database: %s", database_url)
    _engine = create_engine(database_url, echo=False)
    _SessionLocal = sessionmaker(bind=_engine)
    logger.debug("Database engine created")


def create_all() -> None:
    if _engine is None:
        raise RuntimeError("init_db() must be called before create_all()")
    Base.metadata.create_all(_engine)
    _migrate_contacts_to_contact_inboxes()
    logger.info("Database tables created")


def _migrate_contacts_to_contact_inboxes() -> None:
    if _engine is None:
        return
    session = get_session()
    try:
        from src.models import ContactInbox

        inspector = inspect(_engine)
        cols = {c["name"] for c in inspector.get_columns("contacts")}
        if "inbox_id" not in cols:
            return

        rows = session.execute(
            text(
                "SELECT id, inbox_id, source_id FROM contacts "
                "WHERE id NOT IN (SELECT contact_id FROM contact_inboxes)"
            )
        ).fetchall()

        for row in rows:
            ci = ContactInbox(
                contact_id=row[0],
                inbox_id=row[1],
                source_id=row[2],
            )
            session.add(ci)
        session.commit()
        if rows:
            logger.info("Migrated %d contacts to contact_inboxes", len(rows))
    except Exception:
        session.rollback()
        logger.warning("ContactInbox migration skipped (likely fresh DB)")
    finally:
        session.close()


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

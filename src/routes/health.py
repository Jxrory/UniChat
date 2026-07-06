import logging
from datetime import datetime, timezone

from fastapi import APIRouter
from sqlalchemy import text

from src.db import get_session

logger = logging.getLogger("unichat.health")
router = APIRouter()


@router.get("/health")
async def health():
    db_ok = False
    try:
        session = get_session()
        session.execute(text("SELECT 1"))
        session.close()
        db_ok = True
    except Exception as e:
        logger.warning("Health check DB failed: %s", e)

    status = "healthy" if db_ok else "degraded"

    return {
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": {
            "database": "ok" if db_ok else "failed",
        },
    }

import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from src.adapters.telegram import register as register_telegram
from src.adapters.whatsapp import register as register_whatsapp
from src.bus import init_buses, get_webhook_incoming_bus, get_incoming_bus, get_out_coming_bus
from src.config import AppConfig, load_config
from src.db import create_all, dispose_engine, init_db
from src.log_setup import setup_logging
from src.routes.admin import router as admin_router
from src.routes.health import router as health_router
from src.routes.webhook import router as webhook_router
from src.routes.reply import router as reply_router
from src.routes.ws import router as ws_router
from src.routes.ws import setup_ws_router
from src.services.ingest import IngestService
from src.services.notifier import AgentBotNotifier
from src.services.sender import ChannelSender
from src.services.ws_notifier import WSNotifier

logger = logging.getLogger("unichat.app")

register_telegram()
register_whatsapp()


def create_app(config: AppConfig | None = None) -> FastAPI:
    if config is None:
        config = load_config()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        setup_logging(config.server.log_level)
        logger.info("Starting UniChat — log_level=%s", config.server.log_level)

        init_db(config.database_url)
        create_all()
        init_buses()

        ingest_service = IngestService()
        await ingest_service.start()

        notifier = AgentBotNotifier(config)
        await notifier.start()

        sender = ChannelSender(config)
        await sender.start()

        ws_notifier = WSNotifier()
        await ws_notifier.start()
        app.state.ws_notifier = ws_notifier

        setup_ws_router(ws_notifier, config.server.admin_token)

        webhook_bus = get_webhook_incoming_bus()
        incoming_bus = get_incoming_bus()
        out_coming_bus = get_out_coming_bus()

        bg_task = asyncio.create_task(webhook_bus.run())
        bg_task2 = asyncio.create_task(incoming_bus.run())
        bg_task3 = asyncio.create_task(out_coming_bus.run())

        logger.info("UniChat shutting down")
        yield

        bg_task.cancel()
        bg_task2.cancel()
        bg_task3.cancel()
        try:
            await asyncio.gather(bg_task, bg_task2, bg_task3, return_exceptions=True)
        except Exception:
            pass

        await ws_notifier.stop()
        dispose_engine()

    app = FastAPI(lifespan=lifespan)
    app.state.config = config

    app.add_middleware(SessionMiddleware, secret_key=config.server.admin_token)

    app.include_router(health_router)
    app.include_router(webhook_router)
    app.include_router(reply_router)
    app.include_router(admin_router)
    app.include_router(ws_router)

    return app

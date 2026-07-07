import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from src.adapters.telegram import register as register_telegram
from src.adapters.test import register as register_test
from src.adapters.web import register as register_web
from src.adapters.whatsapp import register as register_whatsapp
from src.bus import init_buses, get_webhook_incoming_bus, get_incoming_bus, get_out_coming_bus
from src.config import AppConfig, load_config
from src.db import create_all, dispose_engine, init_db
from src.log_setup import setup_logging
from src.routes.admin import router as admin_router
from src.routes.health import router as health_router
from src.routes.webhook import router as webhook_router
from src.routes.reply import router as reply_router
from src.routes.widget import router as widget_router
from src.routes.ws import router as ws_router
from src.routes.ws import setup_ws_router
from src.services.idle_sweep import run_idle_sweep
from src.services.ingest import IngestService
from src.services.notifier import AgentBotNotifier
from src.services.sender import ChannelSender
from src.services.web_session_registry import init_web_session_registry
from src.services.ws_notifier import WSNotifier

logger = logging.getLogger("unichat.app")

register_telegram()
register_web()
register_whatsapp()


def create_app(config: AppConfig | None = None) -> FastAPI:
    if config is None:
        config = load_config()

    if config.server.env != "production":
        register_test()

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

        web_session_registry = init_web_session_registry()
        await web_session_registry.start()

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
        bg_sweep = asyncio.create_task(run_idle_sweep(config))

        logger.info("UniChat shutting down")
        yield

        bg_sweep.cancel()
        bg_task.cancel()
        bg_task2.cancel()
        bg_task3.cancel()
        try:
            await asyncio.gather(bg_sweep, bg_task, bg_task2, bg_task3, return_exceptions=True)
        except Exception:
            pass

        await ws_notifier.stop()
        dispose_engine()

    app = FastAPI(lifespan=lifespan)
    app.state.config = config

    static_dir = os.path.join(os.path.dirname(__file__), "static")
    os.makedirs(static_dir, exist_ok=True)
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(SessionMiddleware, secret_key=config.server.admin_token)

    app.include_router(health_router)
    app.include_router(webhook_router)
    app.include_router(reply_router)
    app.include_router(admin_router)
    app.include_router(ws_router)
    app.include_router(widget_router)

    if config.server.env != "production":
        from src.routes.echo import router as echo_router
        app.include_router(echo_router)
        for inbox in config.inboxes:
            if inbox.channel_type != "telegram":
                inbox.config["agentbot_url"] = f"http://127.0.0.1:{config.server.port}/_dev/echo"
                inbox.config["agentbot_token"] = config.server.admin_token

    return app

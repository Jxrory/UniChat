import logging
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("unichat.ws")
router = APIRouter()

_ws_notifier: Any = None
_admin_token: str = ""


def setup_ws_router(ws_notifier: Any, admin_token: str) -> None:
    global _ws_notifier, _admin_token
    _ws_notifier = ws_notifier
    _admin_token = admin_token


@router.websocket("/ws/notifications")
async def ws_notifications(websocket: WebSocket) -> None:
    await websocket.accept()

    token = websocket.query_params.get("token")
    session_auth = (
        websocket.session.get("authenticated", False)
        if "session" in websocket.scope
        else False
    )
    if not session_auth and (not token or token != _admin_token):
        await websocket.close(code=403)
        return

    inboxes_param = websocket.query_params.get("inboxes")
    if not inboxes_param:
        await websocket.close(code=400)
        return

    inboxes = [i.strip() for i in inboxes_param.split(",") if i.strip()]
    if not inboxes:
        await websocket.close(code=400)
        return

    _ws_notifier.register(inboxes, websocket)

    try:
        await websocket.send_json({"event": "connected", "inboxes": inboxes})
        await _ws_notifier.send_initial_sync(websocket, inboxes)

        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        logger.debug("WebSocket disconnected")
    finally:
        _ws_notifier.unregister(websocket)

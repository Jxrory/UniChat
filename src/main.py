import uvicorn

from src.app import create_app
from src.config import load_config

app = create_app(load_config())

if __name__ == "__main__":
    config = load_config()
    uvicorn.run(
        "src.main:app",
        host=config.server.host,
        port=config.server.port,
        reload=False,
    )

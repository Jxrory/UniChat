# UniChat — 消息聚合平台

接收外部 IM 渠道的消息，交给 AgentBot 回复，再把回复发出去。v1 只接 Telegram 和 WhatsApp，Bot-only + 最小转人工。

**生产环境**: https://unichat.makemoney2g.com

## 架构概览

```
Telegram/WhatsApp webhook → routes/webhook.py → adapter.verify → adapter.parse → WebhookEvent
  → WebhookIncoming bus → IngestService（落库 Contact/ContactInbox/Conversation/Message）
    → Incoming bus → AgentBotNotifier（HTTP POST 给外部 AgentBot）
      → AgentBot 调 LLM 后 POST /api/v1/agentbot/reply
        → ReplyReceiver 落库 outgoing message
          → handoff=true → conversation 进 pending_human，不发外部
          → handoff=false → OutComing bus → ChannelSender → adapter.send_message → TG/WA API
```

三个内存 asyncio bus（`WebhookIncoming` / `Incoming` / `OutComing`）串联服务，DB 是唯一真相源。

## 快速开始

```bash
# 安装依赖
uv sync

# 复制环境变量模板
cp .env.example .env
# 编辑 .env 填入 TELEGRAM_BOT_TOKEN、AGENTBOT_URL 等

# 启动开发服务器
uv run uvicorn src.main:app --reload
```

## 配置

所有配置统一在 `config.yaml`，密钥走环境变量 `${VAR}` 替换。

```yaml
inboxes:
  - id: tg
    channel_type: telegram
    config:
      token: "${TELEGRAM_BOT_TOKEN}"
      agentbot_url: "${AGENTBOT_URL}"
```

必要环境变量：`TELEGRAM_BOT_TOKEN`、`TELEGRAM_WEBHOOK_SECRET`、`AGENTBOT_URL`、`AGENTBOT_TOKEN`、`ADMIN_TOKEN`。

可选：`DATABASE_URL`（默认 SQLite）、`LOG_LEVEL`（默认 DEBUG）。

## 测试

```bash
# L1 单元/集成测试
uv run pytest tests/ -v -m "not e2e"

# L2 E2E 浏览器测试（需 playwright + Chromium）
uv run pytest tests/e2e -v -m e2e

# 静态检查
uv run ruff check src/ tests/
uv run mypy src/
```

## 部署

参见 [DEPLOY.md](./DEPLOY.md)。GitHub Actions push 到 main 后自动测试→部署→健康检查。

```bash
# 手动部署
git pull
uv sync --frozen
systemctl restart unichat
```

## 项目结构

```
src/
├── main.py              # 入口
├── app.py               # FastAPI app factory
├── config.py            # YAML 配置加载
├── db.py                # SQLAlchemy engine/session
├── models.py            # 4 张 DB 表（Contact/ContactInbox/Conversation/Message）
├── bus.py               # 内存 asyncio 事件总线
├── adapters/            # 渠道适配器（telegram / whatsapp / test）
├── routes/              # Webhook、Reply、Admin UI、Health
├── services/            # Ingest、Notifier、Sender、ReplyReceiver、WSNotifier
└── templates/           # Jinja2 模板
```

## v1 限定

- Bot-only，不接 Chatwoot SLA/assignee/unread/附件
- 无多租户、无 Admin UI 管理渠道
- 不留空字段、不写占位函数（无 v2 接口债）

详见 [CONTEXT.md](./CONTEXT.md)（领域语言）和 [docs/架构/UniChat-系统架构.md](./docs/架构/UniChat-系统架构.md)（架构规范）。

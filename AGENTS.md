# UniChat

消息聚合平台：把外部 IM 渠道的消息收进来，交给 AgentBot 回复，再把回复发出去。v1 只接 Telegram，Bot-only + 最小转人工。

**当前状态**: 设计阶段，尚无代码。实现前先读 `CONTEXT.md`（领域语言）和 `docs/架构/UniChat-系统架构.md`（架构规范）。

## 工具链

- **包管理**: `uv`（`uv add <pkg>` / `uv run <cmd>`）
- **Web 框架**: FastAPI（单进程 uvicorn）
- **ORM**: SQLAlchemy，DB 用 SQLite（切 Postgres 只需改 DSN）
- **测试**: pytest
- **Python 版本**: 按 pyproject.toml（>=3.11）

## 架构快览

### 事件流（3 个进程内 asyncio bus）

```
Telegram webhook → routes/webhook.py → adapter.verify → adapter.parse → WebhookEvent
  → WebhookIncoming bus → IngestService（找/建 Contact+Conversation+Message 落库）
    → Incoming bus → AgentBotNotifier（HTTP POST 给 AgentBot 外部服务）
      → AgentBot 调 LLM 后 POST /api/v1/agentbot/reply
        → ReplyReceiver 落库 outgoing message
          → handoff=true → conversation 进 pending_human，不发外部
          → handoff=false → OutComing bus → ChannelSender → adapter.send_message → TG API
```

### 3 张 DB 表

- `contacts`（唯一键 `(inbox_id, source_id)` — v1 无跨渠道合并）
- `conversations`（status: `active` / `pending_human` / `resolved`）
- `messages`（`sender_type`: contact / agentbot / user；`handoff` flag；`source_id` 双向去重）

### 配置

Inbox 和 AgentBot 配在 `config.yaml`（YAML，不建表），密钥走环境变量。

## 领域语言

`CONTEXT.md` 定义了精确术语。常见错误：
- 说"bot" → 应该是 **AgentBot**
- 说"session" → 应该是 **Conversation**
- 说"收件箱" → 应该是 **Inbox**
- 说"event" → 注意 message 不是 event（event 指 bus 信号）
- 说"customer/user" → 应该是 **Contact**（user 指人工客服）

## v1 不做（v2 范畴）

Bot-only 排除 Chatwoot 全套 SLA/waiting_since/私密笔记/@提及/邮件通知/assignee/unread 计数/附件。跨渠道 Contact 合并、Admin UI 都是 v2。

**不预留接口** — 不留空字段、不写占位函数。新能力在真正到来时再加。

## 参考文档

- `docs/架构/参考资料/Hermes-Gateway-架构.md` — ChannelAdapter 插件模式来源
- `docs/架构/参考资料/Chatwoot-消息系统-架构.md` — source_id 去重/echo 防环/状态机参考

## 部署

裸 venv + systemd + 已有 nginx + 证书。

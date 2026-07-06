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
Telegram/WhatsApp webhook → routes/webhook.py → adapter.verify → adapter.parse → WebhookEvent
  → WebhookIncoming bus → IngestService（找/建 Contact+ContactInbox+Conversation+Message 落库）
    → Incoming bus → AgentBotNotifier（HTTP POST 给 AgentBot 外部服务）
      → AgentBot 调 LLM 后 POST /api/v1/agentbot/reply
        → ReplyReceiver 落库 outgoing message
          → handoff=true → conversation 进 pending_human，不发外部
          → handoff=false → OutComing bus → ChannelSender → adapter.send_message → TG/WA API
```

### 4 张 DB 表

- `contacts`（唯一键 `source_id` — 全局实体）
- `contact_inboxes`（唯一键 `(inbox_id, source_id)` — 渠道身份映射）
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
**部署用户 sudo 受限**: deploy 账号只允许执行 `deploy/sudoers.unichat` 列出的命令。

## Deploy Configuration (configured by /setup-deploy)
- Platform: Custom (bare metal VPS + systemd + nginx)
- Production URL: https://unichat.makemoney2g.com
- Deploy workflow: .github/workflows/deploy.yml (push to main → test → SSH deploy → health check)
- Health check: GET /health → {"status":"healthy"}
- Merge method: squash
- Project type: web API

### GitHub Secrets required
- `DEPLOY_HOST` — server hostname
- `DEPLOY_USER` — SSH username
- `DEPLOY_PORT` — SSH port (default 22)
- `DEPLOY_SSH_KEY` — SSH private key for deploy user

### Custom deploy hooks
- Pre-merge: uv run ruff check src/ tests/ && uv run pytest tests/ -v
- Deploy trigger: push to main
- Deploy status: poll https://unichat.makemoney2g.com/health until status=healthy
- Post-deploy: curl -sf https://unichat.makemoney2g.com/health

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues (`gh` CLI). External PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles map to label strings of the same name (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — `CONTEXT.md` at root, `docs/adr/` for architectural decisions. See `docs/agents/domain.md`.

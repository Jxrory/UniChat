# UniChat 系统架构

> v1 极简版：单租户、单渠道（Telegram）、Bot-only + 最小转人工、3 天上线。

## 1. 概述

UniChat 是消息聚合平台：把外部 IM 渠道的消息收进来，交给 AgentBot 回复，再把回复发出去。v1 只接 Telegram，形态是 Bot-only（机器人自动回复 + 必要时转人工）。

整个系统通过事件驱动。三个进程内 bus 承担「通知有活干了」的信号职能，持久真相在 DB。AgentBot 是外部独立服务，平台不维护 LLM 对话窗口，AgentBot 自带上下文。

### 设计约束（v1 锁定）

| 约束 | 理由 |
|---|---|
| 单租户，无 Account 表 | 3 天上线，v1 不做 SaaS |
| 单渠道（Telegram） | 但保留插件槽位，未来按 Hermes adapter registry 扩 |
| Bot-only，砍掉 Chatwoot 的 SLA/assignee/私密笔记/@提及/邮件通知/unread 计数 | 这些都是 v2 范畴 |
| Inbox 与 Channel 合并为 YAML 配置 | 无 admin UI，加渠道改 YAML 重启 |
| Contact 单表，唯一键 `(inbox_id, source_id)`，不做跨渠道合并 | 跨渠道合并是 v2 |
| AgentBot 是外部服务，配置挂在 Inbox.config | 不共 DB、不共享 bus、自带上下文 |
| 仅处理 private chat（DM），不支持 group | group 归属是 v2 |
| bus 只传信号不传消息体 | 持久真相在 DB |
| 入向用 `update_id` 去重，发送失败不自动重试 | 客服重发即自然重试 |

详见 `CONTEXT.md` 的 Language 节、`docs/adr/0001-v1-single-channel-minimal-entities.md`。

---

## 2. 事件驱动拓扑

```
                         ┌─────────────────────────────────────────────────┐
                         │                  FastAPI app                     │
                         │                                                 │
   ┌────────────┐        │  routes/webhook.py   routes/reply.py            │
   │  Telegram  │  HTTP  │  ├─ adapter.verify  ├─ AgentBot reply API      │
   │  Bot API   ├───────►│  ├─ adapter.parse   │  (POST /api/v1/agentbot/ │
   │   webhook  │        │  │   → WebhookEvent  │     reply)              │
   └────────────┘        │  └─ push WebhookIncoming bus                   │
                         │                                                 │
                         │  api/v1/conversations.py                       │
                         │  └─ 人工 reply (POST /api/v1/conversations/    │
                         │       {id}/reply)                              │
                         └────────┬──────────────────┬─────────────────────┘
                                  │                  │
                                  ▼                  ▼
                       ┌──────────────────┐  ┌──────────────────┐
                       │ WebhookIncoming  │  │  ReplyReceiver    │
                       │      bus         │  │  (HTTP API)       │
                       └────────┬─────────┘  └────────┬───────────┘
                                │                     │
                                ▼                     │
                       ┌──────────────────┐           │
                       │  IngestService   │           │
                       │  （订阅者）       │           │
                       └────────┬─────────┘           │
                                │                     │
                  找/建 Contact + 找/建 Conversation   │
                  + 落库 Message（单事务）              │
                                │                     │
                                ▼                     ▼
                       ┌──────────────────┐  ┌──────────────────┐
                       │  Incoming bus    │  │  OutComing bus   │
                       └────────┬─────────┘  └────────┬───────────┘
                                │                     │
                                ▼                     │
                       ┌──────────────────┐           │
                       │ AgentBotNotifier │           │
                       │  （订阅者）       │           │
                       └────────┬─────────┘           │
                                │                     │
                                ▼                     │
                          HTTP POST 通知              │
                       ┌──────────────────┐           │
                       │   AgentBot       │           │
                       │   (外部)         │           │
                       └────────┬─────────┘           │
                                │                     │
                                │ 算完后回调 reply API │
                                └──────────────────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │  ChannelSender   │
                                              │  （订阅者）       │
                                              └────────┬─────────┘
                                                       │
                                                       ▼
                                                 adapter.send_message
                                                       │
                                                       ▼
                                                  Telegram Bot API
```

### Bus 语义

| Bus | 订阅者 | payload | 入站端 |
|---|---|---|---|
| `WebhookIncoming` | `IngestService` | `WebhookEvent`（渠道无关统一结构） | `routes/webhook.py` 校验+parse 后 push |
| `Incoming` | `AgentBotNotifier` | `message_id` (str) | `IngestService` 落库后 push |
| `OutComing` | `ChannelSender` | `message_id` (str) | `ReplyReceiver`（AgentBot reply 或人工 reply）落库后 push |

**Bus 实现是进程内 `asyncio`**（推荐用 `asyncio.Queue` per bus name 或 `blinker.async`），不是消息队列。订阅者异步消费，不阻塞 webhook 响应。

---

## 3. 数据模型

v1 共 3 张 DB 表（SQLite，可平滑切 Postgres，改 DSN 即可）。Inbox 与 AgentBot 是 YAML 配置不建表。

```sql
CREATE TABLE contacts (
    id            TEXT PRIMARY KEY,              -- uuid
    inbox_id      TEXT NOT NULL,                  -- 关联 YAML 里的 inbox
    source_id     TEXT NOT NULL,                  -- Telegram chat_id
    name          TEXT,
    avatar_url    TEXT,
    last_activity_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (inbox_id, source_id)
);

CREATE TABLE conversations (
    id            TEXT PRIMARY KEY,              -- uuid
    inbox_id      TEXT NOT NULL,
    contact_id    TEXT NOT NULL REFERENCES contacts(id),
    status        TEXT NOT NULL DEFAULT 'active',  -- active / pending_human / resolved
    last_activity_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conv_contact ON conversations (contact_id, created_at DESC);

CREATE TABLE messages (
    id            TEXT PRIMARY KEY,              -- uuid
    conversation_id TEXT NOT NULL REFERENCES conversations(id),
    inbox_id      TEXT NOT NULL,                 -- 冗余，路由用
    sender_type   TEXT NOT NULL,                  -- contact / agentbot / user
    sender_id     TEXT,                          -- contact_id 或 user_id(v1 占位/NUL)
    content       TEXT NOT NULL,
    content_type  TEXT NOT NULL DEFAULT 'text',
    message_type  TEXT NOT NULL,                  -- incoming / outgoing / activity
    handoff       BOOLEAN NOT NULL DEFAULT false, -- bot 转人工信号
    source_id     TEXT,                          -- Telegram update_id (入向去重) / platform_message_id (出向 echo 防环)
    status        TEXT NOT NULL DEFAULT 'sent',   -- sent / delivered / read / failed
    external_error TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_msg_conv ON messages (conversation_id, created_at ASC);
CREATE INDEX idx_msg_source ON messages (inbox_id, source_id);  -- 去重查询
```

### 字段设计要点

| 字段 | 说明 |
|---|---|
| `contacts.source_id` | Telegram chat_id，与 `inbox_id` 组合唯一 |
| `messages.sender_id` | sender_type=contact 存 contact_id；agentbot 存 NULL（配置唯一）；user 存占位 |
| `messages.inbox_id` | 冗余列，ChannelSender 路由用，免 JOIN conversations |
| `messages.message_type` | 与 sender_type 对偶：contact→incoming, agentbot/user→outgoing, activity 单列 |
| `messages.source_id` 入向 | Telegram `update_id`，webhook 重试防重复入库 |
| `messages.source_id` 出向 | Telegram 返回的 `message_id`，echo 防环（v1 TG Bot API 默认不 echo，但保留以防未来渠道） |
| `messages.handoff` | bot 的转人工信号，OutComing 订阅者据此不发外部（见 §6） |
| `messages.status` | sent(默认) / delivered / read / failed。v1 Telegram webhook 不回投递回执，主要从 send_message 失败落 failed |

---

## 4. Inbox / AgentBot 配置

单条 YAML，无 admin UI。位置：项目根 `config.yaml`。

```yaml
inboxes:
  - id: tg
    name: "Telegram 主渠道"
    channel_type: telegram
    config:
      token: "${TELEGRAM_BOT_TOKEN}"
      webhook_secret: "${TELEGRAM_WEBHOOK_SECRET}"
      agentbot_url: "${AGENTBOT_URL}"
      agentbot_token: "${AGENTBOT_TOKEN}"
      allowed_senders:
        - "*"                             # 允许所有 chat_id，或白名单

server:
  host: "0.0.0.0"
  port: 8000
  admin_token: "${ADMIN_TOKEN}"           # AgentBot 推回 + 人工 reply 共用鉴权

database:
  url: "sqlite:///./unichat.db"            # 切 Postgres 改此行
```

环境变量仅用于密钥（非密钥配置走 YAML）：

| 变量 | 说明 |
|---|---|
| `TELEGRAM_BOT_TOKEN` | BotFather 发的 token |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram Bot API secret_token，防伪造（必填） |
| `AGENTBOT_URL` | AgentBot 接收 incoming 通知的 URL |
| `AGENTBOT_TOKEN` | AgentBot 推回平台时的鉴权 token |
| `ADMIN_TOKEN` | 平台入站 API（AgentBot reply + 人工 reply）的鉴权 token |
| `DATABASE_URL` | 可选，覆盖 YAML 里的 database.url |

---

## 5. 渠道插件接口

参考 Hermes Gateway 的 `BasePlatformAdapter` + `PlatformRegistry`，v1 极简版接口：

```python
# src/adapters/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class WebhookEvent:
    """渠道无关的统一入站事件。"""
    inbox_id: str
    source_id: str          # TG chat_id；标识"会话"
    sender_source_id: str  # TG user_id；标识"谁发的"
    content: str
    content_type: str       # v1 只 'text'
    raw: dict               # 原始负载，调试用

@dataclass
class SendResult:
    ok: bool
    platform_message_id: str | None = None   # 成功后落库到 message.source_id
    error: str | None = None

class ChannelAdapter(ABC):
    """渠道适配器抽象基类。每个 Inbox 实例化一个 adapter 实例。"""
    inbox_id: str
    config: dict

    @abstractmethod
    def verify_webhook(self, headers: dict, body: bytes) -> bool:
        """签名 / secret_token 校验，过不了返 False。"""

    @abstractmethod
    def parse_webhook(self, headers: dict, body: bytes) -> WebhookEvent | None:
        """把原始 webhook 负载解析为统一 WebhookEvent；不支持的事件类型返 None。"""

    @abstractmethod
    async def send_message(self, target: str, content: str) -> SendResult:
        """OutComing 订阅者调它把消息发到外部。"""
```

### 插件注册（类 Hermes platform_registry）

```python
# src/adapters/registry.py
class AdapterRegistry:
    """按 channel_type 名注册 adapter 工厂。"""
    def register(self, channel_type: str, factory):
        ...
    def create(self, inbox_id: str, channel_type: str, config: dict) -> ChannelAdapter:
        ...

registry = AdapterRegistry()

# src/adapters/telegram/__init__.py
def register():
    registry.register("telegram", TelegramAdapter)

# src/app.py 启动时
from adapters.telegram import register as register_tg
register_tg()
```

参考 Hermes 的 `gateway/platform_registry.py` 和 `plugins/platforms/telegram/adapter.py:register()`。

### Telegram adapter 实现要点（v1 极简）

| 方法 | 实现 |
|---|---|
| `verify_webhook` | 校 `headers["X-Telegram-Bot-Api-Secret-Token"] == config["webhook_secret"]` |
| `parse_webhook` | 解析 `update.message.text`（私有 chat）、`update.update_id`；只处理 `message` 且 `text` 字段存在，其他返 None |
| `send_message` | `POST https://api.telegram.org/bot{token}/sendMessage` body `{chat_id, text}`；成功返 `SendResult(ok=True, platform_message_id=str(result.message_id))`；HTTP 异常返 `SendResult(ok=False, error=str(e))` |

可复用 Hermes 的 `TelegramAdapter.send()` 模式：失败降级、超时、最小重试——v1 只做最简版，失败即 `failed`，无重试。

---

## 6. 消息流程详解

### 6.1 入站流程（Telegram → UniChat）

```
1. Telegram Bot API POST /webhooks/telegram/{inbox_id}
   带 X-Telegram-Bot-Api-Secret-Token header

2. routes/webhook.py 收到请求
   ├─ 按 inbox_id 从 YAML 找 inbox 配置
   ├─ instance = registry.create(inbox_id, inbox.channel_type, inbox.config)
   ├─ instance.verify_webhook(headers, body) == False → 401
   ├─ event = instance.parse_webhook(headers, body)
   │   └─ event is None（不支持的事件类型）→ 200 OK 静默丢弃
   └─ bus.publish("WebhookIncoming", event)  # 异步，立即 200 回 Telegram

3. IngestService 收到 WebhookEvent
   ├─ 入向去重：查 messages(inbox_id=event.inbox_id, source_id=event.raw['update_id'])
   │   └─ 存在 → return（Telegram webhook 重试同 update_id 丢弃）
   ├─ 找/建 Contact：unique (inbox_id, source_id=event.source_id)
   ├─ 找/建 Conversation（取最近一条会话，无视状态；无则新建）
   │   └─ resolved 状态在 incoming 消息落库后由 reopen 钩子回退到 active
   ├─ 落库 Message（单事务）：
   │   sender_type='contact', sender_id=contact.id,
   │   message_type='incoming', source_id=event.raw['update_id'],
   │   content=event.content, status='sent'
   ├─ update contact.last_activity_at, conversation.last_activity_at
   ├─ reopen hook：若 conversation.status == 'resolved' → status='active'
   └─ bus.publish("Incoming", message_id)

4. AgentBotNotifier 收到 message_id
   ├─ 从 DB 取 message + conversation + contact
   ├─ 检查 conversation.status：
   │   ├─ 'pending_human' → return（人工接管中，不通知 bot）
   │   ├─ 'resolved'      → 不可能（刚 reopen）
   │   └─ 'active'        → 继续
   └─ HTTP POST {agentbot_url} （fire-and-forget 不等响应）
       Authorization: Bearer {config['agentbot_token']}
       body = {
         "event": "message.created",
         "message_id": "...",
         "conversation_id": "...",
         "inbox_id": "...",
         "contact": {"id": "...", "name": "...", "source_id": "..."},
         "content": "...",
         "content_type": "text",
         "created_at": "..."
       }
```

**会话归属策略**（参考 Chatwoot `set_conversation`）：取最近一条会话（无视状态），无则新建。`resolved` 会被 incoming 消息触发 reopen → `active`，不开新会话。

### 6.2 AgentBot 回复流程（AgentBot → UniChat → Telegram）

```
1. AgentBot 算完后 HTTP POST /api/v1/agentbot/reply
   Authorization: Bearer {ADMIN_TOKEN}
   body = {
     "conversation_id": "...",
     "content": "您好，我是 AI 助手……",
     "handoff": false
   }

2. routes/reply.py 收到
   ├─ 校验 Authorization Bearer token == config['admin_token']
   ├─ 从 DB 取 conversation（404 if not found）
   └─ 调 ReplyReceiver.handle(...)

3. ReplyReceiver.handle（落库事务）
   ├─ 落库 Message：
   │   sender_type='agentbot', sender_id=NULL,
   │   message_type='outgoing', content=...,
   │   handoff=body['handoff'], status='sent'
   ├─ update conversation.last_activity_at
   ├─ if handoff == True:
   │   └─ conversation.status = 'pending_human'（不 push OutComing bus）
   └─ else:
       └─ bus.publish("OutComing", message_id)

4. ChannelSender 收到 message_id
   ├─ 从 DB 取 message + conversation + contact
   ├─ if message.handoff == True → return（保护，理论上不会到这里）
   ├─ instance = registry.create(inbox_id, inbox.channel_type, inbox.config)
   ├─ result = await instance.send_message(target=contact.source_id, content=message.content)
   ├─ if result.ok:
   │   └─ update message.source_id = result.platform_message_id（echo 防环用）
   └─ else:
       └─ update message.status='failed', external_error=result.error
```

### 6.3 转人工流程（handoff）

```
路径 6.2 但 body.handoff == true：
  落库 Message(handoff=True) → conversation.status = 'pending_human'
  → 不 push OutComing bus → 不发送到外部
  → 等待人工接管（v1 通过 REST API，UI 是 v2 的事）
```

### 6.4 人工回复流程（User → UniChat → Telegram）

```
1. 人工客服 curl 或脚本：
   POST /api/v1/conversations/{conversation_id}/reply
   Authorization: Bearer {ADMIN_TOKEN}
   body = {"content": "您好，人工客服来了"}

2. routes/reply.py 收到，走同一 ReplyReceiver.handle
   ├─ sender_type='user', sender_id=占位(user_id v1 不存)
   ├─ message_type='outgoing', handoff=False
   ├─ conversation.status = 'active'（从 pending_human 回 active）
   └─ bus.publish("OutComing", message_id)

3. 后续同 6.2 步骤 4，ChannelSender 发出
```

### 6.5 Conversation 状态机

```
                  incoming (resolved)        AgentBot handoff
       ┌───────────────────────────┐   ┌────────────────────┐
       ▼                           │   ▼                    │
   ┌────────┐  incoming (new) ──┐ │ ┌──────────────┐       │
   │resolved│                    │ │ │pending_human│       │
   └────────┘◄───────────────────┴─┤ └──────────────┘       │
       ▲     手动 / API resolve     │       │                │
       │                           │       │ 人工 reply     │
       │                           │       ▼                │
       │                        ┌──┴──────────┐             │
       └──────────────────────── │                  │             │
                                  └──────────┘             │
                                       ▲                    │
                                       │ AgentBot reply    │
                                       │ (handoff=False)   │
                                       └────────────────────┘
```

状态：`active` / `pending_human` / `resolved`。reopen 只在 incoming 消息触发；resolve 是手动 API。

---

## 7. 目录结构

```
unichat/
├── pyproject.toml
├── config.yaml                 # inbox / agentbot / server 配置
├── CONTEXT.md
├── docs/
│   ├── adr/
│   │   └── 0001-v1-single-channel-minimal-entities.md
│   └── 架构/
│       ├── UniChat-系统架构.md   ← 本文档
│       └── 参考资料/
├── src/
│   ├── app.py                  # FastAPI app + lifespan 启动 bus / 订阅者
│   ├── config.py               # YAML 载入 → Inbox / AgentBot 配置对象
│   ├── bus.py                  # in-process asyncio bus（按名字订阅）
│   ├── db.py                   # SQLAlchemy engine + session
│   ├── models.py               # Contact / Conversation / Message ORM
│   ├── schemas.py              # Pydantic request / response schemas
│   ├── services/
│   │   ├── ingest.py           # 订阅 WebhookIncoming → 落库 → push Incoming
│   │   ├── notifier.py         # 订阅 Incoming → HTTP POST 给 AgentBot
│   │   ├── reply_receiver.py   # AgentBot reply + 人工 reply 入站 → 落库 → push OutComing
│   │   └── sender.py           # 订阅 OutComing → adapter.send_message
│   ├── adapters/
│   │   ├── base.py             # ChannelAdapter 抽象基类 + WebhookEvent / SendResult
│   │   ├── registry.py         # adapter 注册表（类 Hermes platform_registry）
│   │   └── telegram/
│   │       ├── __init__.py     # register() → registry.register("telegram", ...)
│   │       └── adapter.py      # TelegramAdapter(BaseAdapter)
│   ├── routes/
│   │   ├── webhook.py          # FastAPI 路由：adapter 校验 + parse → push WebhookIncoming
│   │   └── reply.py            # AgentBot reply + 人工 reply 入站
│   └── main.py                 # uvicorn 入口
└── tests/
```

### 组件职责对照

| 你原文的描述 | 文件 / 组件 |
|---|---|
| 「消息通过 webhook 进入后做简单校验，进入 WebhookIncoming 消息系统总线」 | `routes/webhook.py`：adapter.verify_webhook → adapter.parse_webhook → push WebhookIncoming bus |
| 「Incoming 消息处理（订阅 WebhookIncoming）解析负载，查找/创建联系人，构建并保存消息，将消息放入 Incoming 总线」 | `services/ingest.py::IngestService`：找/建 Contact + Conversation + Message 落库 → push Incoming bus |
| 「通知 AgentBot 生成回复（订阅 Incoming）」 | `services/notifier.py::AgentBotNotifier`：HTTP POST fire-and-forget 给 AgentBot |
| 「AgentBot 生成的回复通过 api 接口进行处理和落库，要发送到外部的推送到 OutComing 总线」 | `routes/reply.py` + `services/reply_receiver.py::ReplyReceiver`：落库 outgoing message → push OutComing bus |
| 「回复消息（订阅 OutComing），处理要回复的消息格式，发送到对应的渠道」 | `services/sender.py::ChannelSender`：调 adapter.send_message |

---

## 8. API 一览

所有入站 API（即 AgentBot 回推、人工 reply）走 `/api/v1/`，统一 `Authorization: Bearer {ADMIN_TOKEN}` 鉴权。v1 不做角色分离（AgentBot / 人工共享 token）。

| 方法 | 路径 | 用途 | 谁调用 |
|---|---|---|---|
| POST | `/webhooks/telegram/{inbox_id}` | Telegram webhook 入站（**无鉴权 header 用 `X-Telegram-Bot-Api-Secret-Token`**，不走 ADMIN_TOKEN） | Telegram Bot API |
| POST | `/api/v1/agentbot/reply` | AgentBot 推回回复 | AgentBot 外部服务 |
| POST | `/api/v1/conversations/{conversation_id}/reply` | 人工客服回复（handoff 后接管） | 人工（curl / Postman） |
| POST | `/api/v1/conversations/{conversation_id}/resolve` | 手动 resolve 会话（置为 `resolved`） | 人工 |
| GET | `/api/v1/conversations/{conversation_id}/messages` | 拉取会话历史（人工接管前看上下文用） | 人工 |

会话历史 API（最后一条）在 v1 主要供人工接管前 curl 一下看上下文用，不保证性能。

---

## 9. 部署

v1 部署形态：**裸 venv + systemd**，机器上**已有 nginx + 证书**。

### 启动流程

```bash
# 1. 准备环境
python -m venv .venv && source .venv/bin/activate
pip install -e .

# 2. 填环境变量（密钥）
export TELEGRAM_BOT_TOKEN=...
export TELEGRAM_WEBHOOK_SECRET=...
export AGENTBOT_URL=...
export AGENTBOT_TOKEN=...
export ADMIN_TOKEN=...

# 3. 初始化 DB（SQLite，ORM 自动建表）
python -m unichat.main  # 首启动会创建表

# 4. 设置 Telegram webhook
curl -X POST "https://api.telegram.org/bot{TOKEN}/setWebhook" \
  -d "url=https://your-domain/webhooks/telegram/tg" \
  -d "secret_token={TELEGRAM_WEBHOOK_SECRET}"

# 5. systemd 托管
sudo cp deploy/unichat.service /etc/systemd/system/
sudo systemctl enable --now unichat
```

### nginx 反代（你已有证书）

```nginx
server {
    listen 443 ssl;
    server_name unichat.your-domain;

    ssl_certificate     /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Telegram-Bot-Api-Secret-Token $http_x_telegram_bot_api_secret_token;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### systemd unit（`deploy/unichat.service`）

```ini
[Unit]
Description=UniChat
After=network.target

[Service]
Type=simple
User=unichat
WorkingDirectory=/opt/unichat
ExecStart=/opt/unichat/.venv/bin/python -m unichat.main
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

---

## 10. 与参考资料的取舍

### 从 Hermes Gateway 抄的

- `BasePlatformAdapter` 抽象基类（→ `adapters/base.py::ChannelAdapter`）
- `PlatformRegistry` 注册表 + `register()` 函数式插件注册（→ `adapters/registry.py`）
- Telegram webhook secret_token 强制要求
- Telegram `send_message` 模式（成功落 `source_id` 失败降级）

### 从 Chatwoot 抄的

- `Message.sender_type` 三态（Contact / AgentBot / User）
- `source_id` 双向语义（入向去重 + 出向 echo 防环）
- `Conversation` 状态机 + `reopen` 策略（取最近会话无视状态，incoming 触发 reopen）
- `SendReplyJob` → 这里简化为 ChannelSender 订阅 OutComing bus
- `IncomingMessageService` 流程：解析 → 找/建联系人 → 找/建会话 → 落库消息

### 明确不从 Chatwoot 抄的（v2 范畴）

- Account 多租户
- Inbox + Channel 双层 DB 表（v1 合并为 YAML）
- Contact + ContactInbox 双层表（v1 Contact 单表唯一键）
- `waiting_since` / `first_reply_created_at` 等 SLA 元数据
- 私密笔记（`private` flag）
- @提及 / 邮件通知 / Push 通知 / unread 计数
- assignee 分配
- `human_response?` / `bot_response?` 判定链
- `mark_pending_conversation_as_open_for_human_response`
- Activity 消息内容类型分布表（v1 只 text）
- attachments / 附件存储
- Searchkick / 搜索索引
- ActionCable / WebSocket 实时推送
- AutomationRule / Campaign / Csat 扩展
- 跨渠道 Contact 合并 / 跨 Inbox Conversation 合并

---

## 11. v1 → v2 的语言边界

下面这些都明确**不做**也不预留接口（避免接口债在事件驱动架构里扩散）：

| v2 范畴 | v1 的留白 |
|---|---|
| 多渠道 | YAML 写单 inbox；adapters/registry 已就位但只 register telegram |
| 多租户 Account | 无表，Contact.inbox_id 直接对应 YAML |
| 跨渠道 Contact 合并 | Contact 单表，唯一键 (inbox_id, source_id) |
| 人工 assignee | Conversation 无 assignee_id 字段，pending_human 状态只是"等任意人工" |
| Admin UI | 配置改 YAML，运营操作 curl / API |
| Activity 消息 / 附件 / 富文本 | Message.content_type 只 'text'，无 attachments 表 |
| SLA / unread / 邮件通知 | 无 `waiting_since`、无 `first_reply_created_at`、无 unread 计数字段 |

v2 真要做这些时，按现有架构增字段/加 bus 即可，不需要推翻 v1。这是 CONTEXT.md 里「v1 不预留接口」的精确含义——**不留空字段、不写占位函数**，新能力在它真正到来时再加。
# Hermes Gateway 架构

## 概述

Hermes Gateway 是多平台消息网关，负责将 Hermes Agent 连接到各种即时通讯平台（Telegram、Discord、WhatsApp、微信、Signal 等）。它提供了统一的会话管理、消息路由和上下文注入能力。

项目源码: /opt/Code/ai/Agent/hermes-agent

### 核心职责

- **统一接入** — 将不同平台的 API 差异抽象为一套统一的 MessageEvent / SendResult 接口
- **会话管理** — 跨平台持久化会话上下文，支持重置策略和过期清理
- **消息路由** — 将 cron 调度任务、agent 输出路由到正确的目标频道
- **平台工具集** — 每个平台可定义不同的工具集和能力集
- **认证授权** — 基于用户/聊天/群组的白名单过滤

---

## 架构层级

```
┌─────────────────────────────────────────────────────────────────┐
│                      GatewayRunner (run.py)                      │
│  生命周期管理 / 插件发现 / 会话编排 / agent 缓存 / slash 命令     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   Telegram       Discord     WhatsApp/Signal/...
   Adapter        Adapter       Adapter
  (plugin)      (platform)    (platform)
         │             │             │
         ▼             ▼             ▼
    Telegram API   Discord API   Platform API
```

### 核心模块

| 模块 | 路径 | 说明 |
|------|------|------|
| GatewayRunner | `gateway/run.py:2527` | 网关主控制器，管理适配器生命周期、会话编排、agent 缓存 |
| BasePlatformAdapter | `gateway/platforms/base.py` | 平台适配器抽象基类，定义 connect/send/disconnect/handle_message 接口 |
| PlatformRegistry | `gateway/platform_registry.py` | 插件平台注册表，支持运行时发现和按名称创建适配器 |
| SessionStore | `gateway/session.py` | 会话持久化、上下文构建、重置策略管理 |
| DeliveryRouter | `gateway/delivery.py` | 消息投递路由，支持跨平台分发 |
| GatewayConfig | `gateway/config.py` | 网关配置加载、平台配置解析 |

### 网关启动流程

```
start_gateway()
  ├─ 获取进程锁（防多实例）
  ├─ 加载 GatewayConfig
  ├─ 创建 GatewayRunner
  │   ├─ 初始化 SessionStore（SQLite）
  │   ├─ 初始化 DeliveryRouter
  │   └─ 加载插件（PluginManager）
  ├─ GatewayRunner.start()
  │   ├─ 遍历配置的平台列表
  │   │   ├─ _create_adapter(platform, config)
  │   │   │   ├─ 检查 platform_registry（插件优先）
  │   │   │   └─ 回退到内置 if/elif 链
  │   │   └─ adapter.connect()
  │   └─ 启动 cron 调度器（如果启用）
  └─ 进入主事件循环（asyncio.run()）
```

---

## Telegram 接入流程

### 整体架构

```
┌─────────────────────────────────────────────┐
│           Telegram 客户端                       │
│  用户 / 群组 / 论坛主题 / 内联按钮               │
└─────────────────┬───────────────────────────┘
                  │ Bot API (Polling / Webhook)
                  ▼
┌─────────────────────────────────────────────┐
│         TelegramAdapter (插件)                 │
│  plugins/platforms/telegram/adapter.py       │
│                                              │
│  ├─ 连接管理: connect() / disconnect()        │
│  ├─ 消息处理: MessageHandler (text/command/    │
│  │            media/location/callback_query)  │
│  ├─ 消息发送: send() / send_draft() /          │
│  │            edit_message() / send_image()    │
│  ├─ 进度提示: send_typing()                    │
│  ├─ 媒体处理: 图片缓存 / 语音转文字              │
│  └─ 内联按钮: approval / confirm / clarify /    │
│               model_picker                     │
└────────────────────┬────────────────────────┘
                     │  MessageEvent
                     ▼
┌─────────────────────────────────────────────┐
│         GatewayRunner.handle_message()        │
│                                              │
│  ├─ 认证检查 (_is_user_authorized)            │
│  ├─ 会话查找 / 创建                           │
│  ├─ AIAgent.chat() / run_conversation()       │
│  └─ adapter.send() 返回结果                    │
└─────────────────────────────────────────────┘
```

### 消息收发完整流程

#### 接收消息（Telegram → Agent）

```
1. Telegram 客户端发送消息
2. PTB (python-telegram-bot) 通过 long-polling / webhook 接收 Update
3. PTB 根据 filters 路由到注册的 MessageHandler
   ├─ TEXT & ~COMMAND  → _handle_text_message()
   ├─ COMMAND          → _handle_command()
   ├─ PHOTO/VIDEO/AUDIO → _handle_media_message()
   ├─ LOCATION/VENUE   → _handle_location_message()
   └─ CallbackQuery    → _handle_callback_query()
4. Handler 构建 MessageEvent
   ├─ _build_message_event() — 提取 chat_id / user_id / text / media / metadata
   ├─ 媒体消息自动缓存到本地（get_file() → download_as_bytearray()）
   └─ 文本消息延迟批处理（等待多段聚合，防客户端分裂）
5. 调用 self.handle_message(event) → 跳转到 GatewayRunner
6. GatewayRunner._process_message()
   ├─ 认证检查
   ├─ 会话查找 / 创建
   ├─ 注入 agent
   └─ agent.run_conversation()
```

#### 发送消息（Agent → Telegram）

```
1. Agent 产生响应文本
2. stream_consumer._send_or_edit() 调用 adapter.send()
3. TelegramAdapter.send()
   ├─ 尝试 Bot API 10.1 Rich Message 路径（sendRichMessage）
   │  └─ _should_attempt_rich() → _try_send_rich()
   ├─ 回退到 MarkdownV2 消息
   │  ├─ format_message() — Markdown → MarkdownV2
   │  ├─ truncate_message() — 按 4096 UTF-16 截断
   │  └─ self._bot.send_message(parse_mode=MARKDOWN_V2)
   └─ 发送失败时降级为纯文本
```

### 两种连接模式

#### Polling 模式（默认）

```
connect()
  ├─ Application.builder().token().build()
  ├─ 注册 MessageHandler / CallbackQueryHandler
  ├─ app.initialize() — 可重试 8 次
  ├─ app.updater.start_polling()
  │   ├─ allowed_updates=Update.ALL_TYPES
  │   └─ error_callback → 网络错误 / 冲突恢复
  ├─ 注册 BotCommand 菜单
  ├─ 启动心跳检测 (_polling_heartbeat_loop)
  └─ 可选：设置 DM Topics
```

#### Webhook 模式

```
connect()
  ├─ 同上构建 Application
  ├─ 验证 TELEGRAM_WEBHOOK_SECRET 存在（强制安全要求）
  └─ app.updater.start_webhook()
      ├─ listen="0.0.0.0", port=8443
      ├─ url_path, webhook_url
      └─ secret_token（防止伪造更新）
```

### 网络容错机制

| 机制 | 说明 |
|------|------|
| Fallback IP 传输 | `TelegramFallbackTransport` 在多 IP 之间重试 TCP 连接，保留 TLS SNI |
| DNS-over-HTTPS 发现 | 通过 Google/Cloudflare DoH 自动发现 api.telegram.org 的备用 IP |
| 409 冲突恢复 | 前一个连接还未过期时，指数退避（15s-55s）重试最多 5 次 |
| 网络错误恢复 | 网络中断时，指数退避（5s-60s）重试最多 10 次，之后标记致命错误 |
| 心跳检测 | 每 90s 检测连接健康状态 + pending_update_count 监控 |
| 连接池耗尽恢复 | 检测到 httpx PoolTimeout 后重置连接池 |

---

## 使用的 Telegram Bot API 接口

### 消息发送

| Bot API 方法 | Hermes 调用位置 | 用途 |
|---|---|---|
| `sendMessage` | `adapter.py:3069`, `:3083`, `:3597` | **主要** — 发送 MarkdownV2 或纯文本消息 |
| `sendRichMessage` | `adapter.py:1418` | Bot API 10.1 — 发送富文本（表格/任务列表/折叠/数学公式） |
| `sendRichMessageDraft` | `adapter.py:1604` | Bot API 10.1 — 发送富文本草稿帧（流式输出预览） |
| `editMessageText` | `adapter.py:1522`, `:3354` | 编辑已发送消息（MarkdownV2 / Rich Message） |
| `sendMessageDraft` | `adapter.py:3796` | 发送传统 MarkdownV2 草稿帧 |
| `sendPhoto` | `adapter.py:5527` | 发送图片 |
| `sendAnimation` | `adapter.py:5621` | 发送动画/GIF |
| `sendAudio` | `adapter.py:5110` | 发送音频文件（MP3/M4A） |
| `sendVoice` | `adapter.py:5201` | 发送语音消息（OGG/Opus） |
| `sendDocument` | `adapter.py:5429` | 发送文件 |
| `sendVideo` | `adapter.py:5480` | 发送视频 |
| `sendMediaGroup` | `adapter.py:5354` | 发送媒体组（相册） |
| `sendChatAction` | `adapter.py:5668` | 发送打字/上传等聊天动作指示器 |

### 消息接收（Update 处理）

| Bot API 更新类型 | PTB Handler | Herems Handler | 说明 |
|---|---|---|---|
| `message.text` | `MessageHandler(filters.TEXT & ~filters.COMMAND)` | `_handle_text_message` | 普通文本消息 |
| `message.text` (command) | `MessageHandler(filters.COMMAND)` | `_handle_command` | 以 `/` 开头的命令（非内联按钮回调） |
| `message.photo` | `MessageHandler(filters.PHOTO)` | `_handle_media_message` | 图片（自动缓存到本地，支持相册合并） |
| `message.video` | `MessageHandler(filters.VIDEO)` | `_handle_media_message` | 视频 |
| `message.audio` | `MessageHandler(filters.AUDIO)` | `_handle_media_message` | 音频文件 |
| `message.voice` | `MessageHandler(filters.VOICE)` | `_handle_media_message` | 语音消息 |
| `message.document` | `MessageHandler(filters.Document.ALL)` | `_handle_media_message` | 文件 |
| `message.sticker` | `MessageHandler(filters.Sticker.ALL)` | `_handle_media_message` | 贴纸（通过 Vision 模型描述） |
| `message.location` | `MessageHandler(filters.LOCATION)` | `_handle_location_message` | 位置共享 |
| `message.venue` | `MessageHandler(filters.VENUE)` | `_handle_location_message` | 地点共享 |
| `callback_query` | `CallbackQueryHandler` | `_handle_callback_query` | 内联按钮回调 |

### 媒体工具

| Bot API 方法 | Hermes 调用位置 | 用途 |
|---|---|---|
| `getFile` | `adapter.py:6996`, `:7032`, `:7049` | 获取文件句柄，用于下载媒体 |
| `download_as_bytearray`（PTB 封装） | `adapter.py:6998`, `:7033`, `:7068` | 下载媒体文件到内存 |
| `createForumTopic` | `adapter.py:2168` | 创建 DM 论坛主题（Bot API 9.4+） |

### 机器人配置

| Bot API 方法 | Hermes 调用位置 | 用途 |
|---|---|---|
| `getMe` | `adapter.py:1837`, `:1963` | 验证 bot token / 心跳检测 |
| `deleteWebhook` | `adapter.py:2719` | 启动 polling 前清理残留 webhook |
| `setMyCommands` | `adapter.py:2779` | 注册机器人命令菜单（3 个 scope） |
| `setMyShortDescription` | `adapter.py:2862` | 设置机器人状态指示器（Online/Offline） |
| `getWebhookInfo` | `adapter.py:1898` | 监测 pending_update_count（消费卡死检测） |

### 内联交互

| Bot API 方法 | Hermes 调用位置 | 用途 |
|---|---|---|
| `answerCallbackQuery` | `adapter.py:4650` 起多处 | 应答内联按钮点击反馈 |
| `editMessageReplyMarkup` | `adapter.py:4674` 等 | 编辑按钮消息（按钮消失/更新） |
| `editMessageText` （内联按钮用） | `adapter.py:4672`, `:4735` | 按钮点击后更新消息文本 |

### 底层 API

| Bot API 方法 | Hermes 调用位置 | 用途 |
|---|---|---|
| `do_api_request`（PTB 封装） | `adapter.py:1418`, `:1522`, `:1604` | 发送尚未被 PTB 建模的新 API 方法（sendRichMessage 等） |
| `start_webhook`（PTB 封装） | `adapter.py:2695` | 启动 webhook HTTP 服务器 |
| `start_polling`（PTB 封装） | `adapter.py:2745` | 启动 long-polling 更新接收 |
| `stop_polling`（PTB 封装） | `adapter.py:1749` | 停止 polling |
| `initialize`（PTB 封装） | `adapter.py:2648` | 初始化 Application |
| `shutdown`（PTB 封装） | `adapter.py:2907` | 关闭 Application |

---

## 配置

Telegram 平台通过 `config.yaml` 配置，示例：

```yaml
gateway:
  platforms:
    telegram:
      token: "${TELEGRAM_BOT_TOKEN}"        # 必填：BotFather 获取的 token
      extra:
        base_url: "http://localhost:8081"    # 自定义 Bot API 服务器
        base_file_url: "http://localhost:8081" # 自定义文件服务器
        local_mode: true                     # 本地文件模式
        reply_to_mode: "first"              # reply 策略：first/all/off
        disable_link_previews: false         # 禁用链接预览
        rich_messages: false                # 启用 Bot API 10.1 Rich Messages
        rich_drafts: false                  # 启用 Rich 草稿预览
        status_indicator: false             # 显示在线/离线状态
        status_online: "Online"
        status_offline: "Offline"
        dm_topics:                          # DM 主题配置
          - chat_id: 123456789
            topics:
              - name: "Work"
                icon_color: 0x00FF00
              - name: "Personal"
        allow_from:                         # 接入层白名单（可选）
          - "*"                             # 允许所有用户
        command_menu: 60                    # 命令菜单最大数量
        fallback_ips:                       # 备用 IP 列表
          - "149.154.167.220"
        group_sessions_per_user: true
        thread_sessions_per_user: false
```

所有配置（含密钥）统一写入 `config.yaml`（文件权限 600）。
| `TELEGRAM_WEBHOOK_SECRET` | Webhook 密钥（防伪造，必填） |

---

## 插件注册

Telegram 适配器以插件形式注册到网关：

```python
# plugins/platforms/telegram/adapter.py:7951
def register(ctx) -> None:
    ctx.register_platform(
        name="telegram",
        label="Telegram",
        adapter_factory=_build_adapter,          # 根据 PlatformConfig 创建适配器实例
        check_fn=check_telegram_requirements,    # 依赖检查（python-telegram-bot）
        is_connected=_is_connected,              # 连接状态检查
        required_env=["TELEGRAM_BOT_TOKEN"],     # 必需的 env 变量
        install_hint="pip install 'hermes-agent[telegram]'",
        setup_fn=interactive_setup,              # 交互式初始化向导
        allowed_users_env="TELEGRAM_ALLOWED_USERS",
        allow_all_env="TELEGRAM_ALLOW_ALL_USERS",
        cron_deliver_env_var="TELEGRAM_HOME_CHANNEL",
        standalone_sender_fn=_standalone_send,   # 独立发送（不启动完整适配器）
        max_message_length=4096,
    )
```

`GatewayRunner._create_adapter()` 优先查询 `platform_registry`（插件路径），未找到则回退到内置的 `if/elif` 链。

---

## 关键设计决策

1. **插件化架构** — Telegram 适配器作为独立插件，不侵入网关核心代码
2. **两阶段发送** — 优先尝试 Bot API 10.1 sendRichMessage（富文本），失败后降级到 MarkdownV2
3. **自适应批处理** — 文本消息按长度分三档延迟（180ms / 240ms / 配置值），媒体消息 0.8s 批处理
4. **连接健康监测** — 心跳 + pending_update_count + CLOSE-WAIT 检测，三重保障
5. **智能重连** — 区分网络错误（指数退避）和 409 冲突（线性递增），最大重试次数后标记致命错误
6. **安全默认** — Webhook 模式强制要求 secret_token，用户消息预检认证过滤
7. **DM Topic 友好** — 支持 Bot API 9.4 私聊主题，自动创建/绑定/恢复，reply anchor 断裂时降级

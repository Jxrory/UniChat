# Chatwoot 消息系统

Chatwoot项目源码: /opt/Code/chatwoot

## 目录

1. [核心概念](#1-核心概念)
2. [消息存储格式](#2-消息存储格式)
3. [保存前回调](#3-保存前回调)
4. [收取消息流程](#4-收取消息流程)
5. [发送消息流程](#5-发送消息流程)
6. [私密笔记流程](#6-私密笔记流程)
7. [source_id 机制](#7-source_id-机制)
8. [等待与首次回复 SLA](#8-等待与首次回复-sla)
9. [消息状态回执](#9-消息状态回执)
10. [事件分发机制](#10-事件分发机制)
11. [Enterprise 扩展](#11-enterprise-扩展)

---

## 1. 核心概念

在深入消息流程前，先明确消息系统涉及的几个核心领域概念。

### 1.1 Account / Inbox / Channel

- **Account** — 账户。Chatwoot 多租户隔离的最高层。所有数据（会话、消息、联系人、客服）都挂在 Account 下。
- **Inbox** — 收件箱。用户在 UI 中配置的"消息容器"，一个 Inbox 关联一个多态的 Channel。
- **Channel** — 渠道实现（多态）。决定 inbound webhook 来源、outbound 发送 Service、消息处理 Service。Inbox 是面向用户配置的壳，Channel 是渠道特定的实现。一个 Inbox 挂的 Channel 类是什么，决定这个 Inbox 能收什么消息、发用什么 Service。

**消息路由**：`SendReplyJob`（`app/jobs/send_reply_job.rb:20`）按 `message.conversation.inbox.channel.class.to_s` 分发发送任务；`Base::SendOnChannelService#validate_target_channel`（`app/services/base/send_on_channel_service.rb:54`）校验 `inbox.channel.class` 与 Service 对应；所有 Incoming Service 也是按 Channel 子类路由。

### 1.2 Channel 子类

Chatwoot 内置 12 个 Channel 子类（`app/models/channel/`）：

| Channel 子类 | 渠道 |
|---|---|
| `Channel::WebWidget` | 网页 Widget |
| `Channel::Api` | API Inbox |
| `Channel::Email` | 邮件 |
| `Channel::Whatsapp` | WhatsApp |
| `Channel::Telegram` | Telegram |
| `Channel::TwilioSms` | Twilio SMS/WhatsApp |
| `Channel::Sms` | SMS |
| `Channel::FacebookPage` | Facebook Messenger（可含 Instagram DM） |
| `Channel::Instagram` | Instagram Direct |
| `Channel::Line` | LINE |
| `Channel::Tiktok` | TikTok |
| `Channel::TwitterProfile` | Twitter DM/Tweet |

### 1.3 Contact / ContactInbox

- **Contact** — 联系人（客户）。跨渠道的唯一身份，一个 Contact 可以同时在多个 Inbox 里有会话。
- **ContactInbox** — 联系人与 Inbox 的关联，带 `source_id`（平台侧 ID，如 WhatsApp 手机号、Telegram chat_id、Facebook PSID），是渠道侧识别联系人的凭证。

### 1.4 Conversation

会话，是消息的容器。一个 Conversation 关联一个 Inbox、一个 Contact、一个 ContactInbox、可选的 assignee（`User` 或 `AgentBot`）。

#### 状态机

Conversation 有 4 个状态（`conversation.rb:75`）：

| 状态 | 含义 |
|---|---|
| `open` (0) | 活跃会话，客服正在处理 |
| `resolved` (1) | 已解决（关闭） |
| `pending` (2) | bot 应接手的会话（不是"人工等待中"） |
| `snoozed` (3) | 暂挂，`snoozed_until` 控制到期 |

> 注意：没有 `bot` 状态。bot 场景下会话用 `pending` 表示，等 bot 处理或人工接管转 `open`。

#### 与消息流程相关的状态转换触发点

1. **会话创建时**（`determine_conversation_status`，`conversation.rb:280`）：
   - 联系人被 blocked → `resolved`
   - inbox 有 active_bot → `pending`
   - 带 campaign 且无 sender 的 bot campaign → `pending`
   - 否则默认 `open`

2. **incoming 消息回调 `reopen_conversation`**（`message.rb:403`）：
   - muted 会话不重开
   - `snoozed` → `open`
   - `resolved` + active_bot inbox → `pending`（交给 bot 处理）
   - `resolved` + api inbox 且发起人是 Contact → `open`（记 `Current.executed_by`）
   - `resolved` + 其他 → `open`

3. **Captain/AgentBot 人工接管**（`mark_pending_conversation_as_open_for_human_response`，`message.rb:412`）：会话处于 captain_pending 且这条是 human_response → 直接 `open`

4. **`toggle_status`**（`conversation.rb:154`）：open ↔ resolved 互转；pending/snoozed → open

#### 关键字段

| 字段 | 含义 |
|---|---|
| `display_id` | Account 内自增，由 DB 触发器生成（`conversation.rb:383`）。UI 里看到的会话编号是它，不是 `id` |
| `waiting_since` | 客户开始等待的时间戳，SLA 度量基石（详见 §8） |
| `first_reply_created_at` | 首次人工回复时间戳，SLA 报表核心（详见 §8） |
| `agent_last_seen_at` / `assignee_last_seen_at` | 客服最后已读时间，决定 `unread_messages` / `unread_incoming_messages` 计数 |
| `contact_last_seen_at` | 联系人侧最后已读时间 |
| `last_activity_at` | 最近活动时间，每条消息都会更新 |

### 1.5 Message

消息单元。详细见 §2。

---

## 2. 消息存储格式

### 2.1 Message 模型

**文件**: `app/models/message.rb`

#### 表结构

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | integer (PK) | 自增主键 |
| `account_id` | integer (not null) | 所属账户 |
| `conversation_id` | integer (not null) | 所属会话 |
| `inbox_id` | integer (not null) | 所属收件箱（渠道） |
| `sender_id` | bigint | 发送者 ID（多态） |
| `sender_type` | string | 发送者类型：`User` / `Contact` / `AgentBot` |
| `source_id` | text | 外部平台消息 ID（详见 §7） |
| `content` | text | 消息正文（最大 150k 字符） |
| `processed_message_content` | text | 处理后的内容（剥离邮件引文，回退到 `content`，最大 150k 字符） |
| `content_type` | integer (enum) | 消息内容类型 |
| `message_type` | integer (enum) | 消息方向类型 |
| `status` | integer (enum) | 消息状态 |
| `private` | boolean | 私密笔记（仅内部可见，详见 §6） |
| `content_attributes` | json | 灵活的消息元数据 |
| `additional_attributes` | jsonb | 附加属性（如 `campaign_id`、`template_params`） |
| `external_source_ids` | jsonb | 外部源 ID（如 Slack，与 `source_id` 分开存储） |
| `sentiment` | jsonb | 情感分析数据 |
| `created_at` | datetime | 创建时间 |
| `updated_at` | datetime | 更新时间 |

#### sender_type 三种类型的含义

| sender_type | 角色 | message_type | 是否人工回复 | 是否机器人回复 |
|---|---|---|---|---|
| `Contact` | 客户/联系人 | `incoming` | 否 | 否 |
| `User` | 客服/管理员 | `outgoing` | 是（`human_response?` = true） | 否 |
| `AgentBot` | 接入的外部机器人 | `outgoing` | 否（`human_response?` = false） | 是（`bot_response?` = true） |

> 这层区分直接影响首次回复 SLA 统计——只有 `User` 发的才算人工首次回复，`AgentBot` 不算（详见 §8）。

#### 枚举值

**content_type**（13 种）：

| 值 | 常量 | 说明 |
|---|---|---|
| 0 | `text` | 纯文本 |
| 1 | `input_text` | 输入框文本 |
| 2 | `input_textarea` | 输入框多行文本 |
| 3 | `input_email` | 输入框邮件 |
| 4 | `input_select` | 选择框 |
| 5 | `cards` | 卡片消息 |
| 6 | `form` | 表单消息 |
| 7 | `article` | 文章消息 |
| 8 | `incoming_email` | 收到的邮件 |
| 9 | `input_csat` | CSAT 满意度调查 |
| 10 | `integrations` | 集成消息 |
| 11 | `sticker` | 贴纸 |
| 12 | `voice_call` | 语音通话（Enterprise） |

**message_type**（4 种）：

| 值 | 常量 | 说明 |
|---|---|---|
| 0 | `incoming` | 联系人发来的消息 |
| 1 | `outgoing` | 客服/机器人发出的消息 |
| 2 | `activity` | 系统活动消息（如会话分配） |
| 3 | `template` | 模板消息 |

**status**（4 种）：

| 值 | 常量 | 说明 |
|---|---|---|
| 0 | `sent` | 已发送 |
| 1 | `delivered` | 已送达 |
| 2 | `read` | 已读 |
| 3 | `failed` | 发送失败 |

#### content_attributes 常用字段

通过 `store :content_attributes` 暴露为访问器（`message.rb:111`）：

```json
{
  "submitted_email": "user@example.com",
  "items": [{ "title": "...", "value": "..." }],
  "submitted_values": [{ "title": "...", "value": "..." }],
  "email": { "subject": "...", "from": "...", "text_content": { "quoted": "..." }, "html_content": { "quoted": "..." }, "auto_reply": false },
  "in_reply_to": "<chatwoot message id>",
  "in_reply_to_external_id": "<external platform message id>",
  "deleted": true,
  "external_created_at": "2024-01-01T00:00:00Z",
  "external_error": "error message",
  "story_sender": "...",
  "story_id": "...",
  "translations": { "en": "...", "zh": "..." },
  "is_unsupported": true,
  "data": { ... }
}
```

#### 关键关联

```ruby
belongs_to :account
belongs_to :inbox
belongs_to :conversation
belongs_to :sender, polymorphic: true, optional: true
has_many :attachments, dependent: :destroy, autosave: true
has_one :csat_survey_response, dependent: :destroy_async
has_many :notifications, as: :primary_actor, dependent: :destroy_async
```

#### 附件限制

`NUMBER_OF_PERMITTED_ATTACHMENTS = 15`（`message.rb:46`）——单条消息最多 15 个附件。

### 2.2 默认排序与关键 scope

**文件**: `app/models/message.rb`

```ruby
default_scope { order(created_at: :asc) }  # message.rb:126
```

> 默认按 `created_at` 升序。代码注释里有 TODO "Get rid of default scope"。如需覆盖排序请用 `reorder`，不要用 `order`（会被叠加）。

| scope | 定义 | 用途 |
|---|---|---|
| `:chat` | `where.not(message_type: :activity).where(private: false)` | "对话气泡"消息集，排除 activity + 私密。`Conversation#recent_messages` 用它取最近 5 条 |
| `:non_activity_messages` | `where.not(message_type: :activity).reorder('created_at desc')` | 排除 activity 但保留私密，按 desc |
| `:voice_calls` | `where(content_type: :voice_call)` | 语音通话消息 |
| `:today` | 当天创建 | 报表 |
| `:created_since(datetime)` | `where('created_at > ?', datetime)` | 已读未读计数依赖 |

### 2.3 创建后回调（after_create_commit 链）

**文件**: `app/models/message.rb:324-333`

```
1. reopen_conversation                              - incoming 消息重开已关闭/暂挂的会话
2. mark_pending_conversation_as_open_for_human_response - 机器人助手流程
3. set_conversation_activity                        - 更新会话 last_activity_at
4. dispatch_create_events                           - 触发 MESSAGE_CREATED / FIRST_REPLY_CREATED 事件
5. send_reply                                       - 将消息发送到外部平台（异步 SendReplyJob）
6. execute_message_template_hooks                   - 执行消息模板钩子
7. update_contact_activity                          - 更新联系人 last_activity_at
```

> 另有 `after_update_commit :dispatch_update_event`（详见 §10）和 `after_commit :reindex_for_search`（Searchkick 索引）。

### 2.4 Attachment 模型

消息可以包含多个附件，使用 Active Storage 存储。支持图片、文件、音频、视频等。

---

## 3. 保存前回调

**文件**: `app/models/message.rb:65-68`

Message 在持久化前还有 4 个校验/转换回调：

```ruby
before_validation :ensure_content_type           # message.rb:65
before_validation :prevent_message_flooding      # message.rb:66
before_save :ensure_processed_message_content    # message.rb:67
before_save :ensure_in_reply_to                  # message.rb:68
```

### 3.1 ensure_content_type

```ruby
self.content_type ||= Message.content_types[:text]
```

没指定 content_type 就默认 `text`。

### 3.2 prevent_message_flooding

**防刷屏闸门**——同一会话 1 分钟内消息数 ≥ `Limits.conversation_message_per_minute_limit` 时，`errors.add(:base, 'Too many messages')`，整条消息存不进去。

> 这是写自动化规则 / 机器人集成时必知的护栏：循环死调时会被这里拦住，避免无限刷消息。

### 3.3 ensure_processed_message_content

按顺序回退：

```
content_attributes.email.text_content.quoted
→ content_attributes.email.html_content.quoted
→ content
→ truncate(150_000)
```

`processed_message_content` 是邮件引文剥离后的"干净正文"，非邮件消息则等于 `content`。

### 3.4 ensure_in_reply_to

调 `Messages::InReplyToMessageBuilder`，根据 `content_attributes[:in_reply_to]`（Chatwoot 内部 message_id）或 `:in_reply_to_external_id`（外部平台 ID）回查消息，自动补上 `in_reply_to_external_id`——对应 Twitter / 邮件等会话线程语义。

---

## 4. 收取消息流程

### 4.1 总体架构

不同渠道的消息通过各自的 webhook 入口进入系统，遵循统一的处理模式：

```
外部平台（WhatsApp / Telegram / Facebook / 等）
  -> Webhook Controller（验证签名，入队异步 Job）
    -> Webhook Job（查找渠道，获取分布式锁）
      -> Incoming Message Service（解析负载，查找/创建联系人）
        -> 查找或创建会话
          -> 构建并保存消息（含附件处理）
            -> 消息回调链（见 §2.3）
```

### 4.2 各渠道入口

| 渠道 | 入口 Controller | 异步 Job |
|---|---|---|
| **WhatsApp** | `Webhooks::WhatsappController#process_payload` | `Webhooks::WhatsappEventsJob` |
| **Instagram** | `Webhooks::InstagramController#events` | `Webhooks::InstagramEventsJob` |
| **Facebook** | `Webhooks::InstagramController`（共用 Instagram） | `Webhooks::FacebookEventsJob` |
| **Telegram** | `Webhooks::TelegramController#process_payload` | `Webhooks::TelegramEventsJob` |
| **LINE** | `Webhooks::LineController#process_payload` | `Webhooks::LineEventsJob` |
| **SMS** | `Webhooks::SmsController#process_payload` | `Webhooks::SmsEventsJob` |
| **Twilio** | `Twilio::CallbackController#create` | `Webhooks::TwilioEventsJob` |
| **Twitter** | `Api::V1::WebhooksController#twitter_events` | 直连 Service |
| **TikTok** | `Webhooks::TiktokController` | `Webhooks::TiktokEventsJob` |
| **Widget** | `Api::V1::Widget::MessagesController#create` | 直连（无需异步） |
| **API Inbox** | `Api::V1::Accounts::Conversations::MessagesController#create` | 直连 |

### 4.3 Incoming Message Service 详解

各渠道的 Incoming Message Service（IMS）解析平台负载并创建消息：

| 渠道 | Service 类 | 文件路径 |
|---|---|---|
| WhatsApp（360Dialog） | `Whatsapp::IncomingMessageService` | `app/services/whatsapp/incoming_message_service.rb` |
| WhatsApp（Cloud API） | `Whatsapp::IncomingMessageWhatsappCloudService` | `app/services/whatsapp/incoming_message_whatsapp_cloud_service.rb` |
| WhatsApp（基类） | `Whatsapp::IncomingMessageBaseService` | `app/services/whatsapp/incoming_message_base_service.rb` |
| Telegram | `Telegram::IncomingMessageService` | `app/services/telegram/incoming_message_service.rb` |
| Twilio | `Twilio::IncomingMessageService` | `app/services/twilio/incoming_message_service.rb` |
| LINE | `Line::IncomingMessageService` | `app/services/line/incoming_message_service.rb` |
| SMS | `Sms::IncomingMessageService` | `app/services/sms/incoming_message_service.rb` |
| TikTok | `Tiktok::MessageService` | `app/services/tiktok/message_service.rb` |
| Facebook | `Messages::Facebook::MessageBuilder` | `app/builders/messages/facebook/message_builder.rb` |
| Instagram | `Messages::Instagram::MessageBuilder` | `app/builders/messages/instagram/message_builder.rb` |

### 4.4 以 WhatsApp 为例的完整流程

```
1. 360Dialog/Cloud API 发送 HTTP POST 到 /webhooks/whatsapp/{phone_number}

2. Webhooks::WhatsappController#process_payload
   - 验证 Meta 签名（Cloud API）或 token（360Dialog）
   - 入队 Webhooks::WhatsappEventsJob.perform_later

3. Webhooks::WhatsappEventsJob#perform
   - 根据 phone_number 查找 Channel::Whatsapp
   - 获取 Redis 分布式锁（按 inbox + 联系人 source_id）
   - 去重：检查 source_id 是否已存在

4. Whatsapp::IncomingMessageBaseService#perform
   - 解析 statuses 数组 → 更新消息送达/已读状态（详见 §9）
   - 解析 messages 数组 → 处理收到的消息
   - 去重检测：Whatsapp::MessageDedupLock

5. set_contact
   - 通过 ContactInboxWithContactBuilder 查找/创建 Contact
   - 使用 WhatsApp 手机号作为 source_id

6. set_conversation
   - 根据 inbox 的 lock_to_single_conversation 设置：
     - 锁定：取最后一条会话（无论状态）
     - 未锁定：取最后一条未 resolved 的会话
     - 无合适会话：创建新会话（创建时会按 §1.4 决定初始状态）

7. create_messages（事务中）
   - @conversation.messages.build(content:, message_type: :incoming, source_id:, sender:)
   - 处理附件（图片、文档、音频、视频、贴纸、联系人、位置）
   - 设置 content_attributes（如 story_id、location 等）
   - 保存消息 → 触发回调链（§2.3）
```

### 4.5 以 Widget 为例的完整流程

```
1. 网页端用户通过 Widget SDK 发送消息

2. Api::V1::Widget::MessagesController#create
   - 通过 token 认证联系人身份
   - 在联系人对应的会话中直接创建 Message
   - message_type: :incoming

3. 消息回调链触发事件分发和发送回复
```

---

## 5. 发送消息流程

### 5.1 总体架构

```
客服在 UI 发送 / API 调用
  -> MessagesController#create
    -> Messages::MessageBuilder.perform
      -> @message.save!
        -> Message 回调链
          -> dispatch_create_events（实时推送 + 事件处理）
          -> send_reply -> SendReplyJob
            -> 渠道对应的 SendOn*Service
              -> Base::SendOnChannelService#perform（校验）
                -> perform_reply（调用外部 API 发送）
                  -> 更新 message.source_id（详见 §7）
```

### 5.2 触发入口

**文件**: `app/controllers/api/v1/accounts/conversations/messages_controller.rb`

```ruby
def create
  user = Current.user || @resource
  mb = Messages::MessageBuilder.new(user, @conversation, params)
  @message = mb.perform
end
```

### 5.3 MessageBuilder

**文件**: `app/builders/messages/message_builder.rb`

- 根据 `message_type` 参数构建消息，默认为 `outgoing`
- 处理附件上传
- 处理邮件内容（邮件渠道）
- 处理自动化规则、模板参数
- 解析发送者（User / AgentBot / Contact）

### 5.4 SendReplyJob - 发送调度器

**文件**: `app/jobs/send_reply_job.rb`

Channel 到 Service 的映射：

| 渠道类型 | Service 类 |
|---|---|
| `Channel::TwitterProfile` | `Twitter::SendOnTwitterService` |
| `Channel::TwilioSms` | `Twilio::SendOnTwilioService` |
| `Channel::Line` | `Line::SendOnLineService` |
| `Channel::Telegram` | `Telegram::SendOnTelegramService` |
| `Channel::Whatsapp` | `Whatsapp::SendOnWhatsappService` |
| `Channel::Sms` | `Sms::SendOnSmsService` |
| `Channel::Instagram` | `Instagram::SendOnInstagramService` |
| `Channel::Tiktok` | `Tiktok::SendOnTiktokService` |
| `Channel::Email` | `Email::SendOnEmailService` |
| `Channel::WebWidget` | `Messages::SendEmailNotificationService` |
| `Channel::Api` | `Messages::SendEmailNotificationService` |
| `Channel::FacebookPage` | 根据 `conversation.additional_attributes['type']` 路由到 `Instagram::Messenger::SendOnInstagramService` 或 `Facebook::SendOnFacebookService` |

有附件时等待 2 秒再执行 Job，确保附件已上传完成。

### 5.5 Base::SendOnChannelService

**文件**: `app/services/base/send_on_channel_service.rb`

所有发送 Service 的基类。`perform` 方法：

1. `validate_target_channel` - 验证渠道类型
2. `outgoing_message?` - 只发送 outgoing 或 template 类型
3. `invalid_message?` - 跳过：私密笔记 / 有 `source_id` 的（echo 防环，详见 §7） / `voice_call` 类型
4. `perform_reply` - 由子类实现具体发送逻辑

### 5.6 各渠道发送 Service

| 渠道 | Service | 文件路径 |
|---|---|---|
| WhatsApp | `Whatsapp::SendOnWhatsappService` | `app/services/whatsapp/send_on_whatsapp_service.rb` |
| Facebook | `Facebook::SendOnFacebookService` | `app/services/facebook/send_on_facebook_service.rb` |
| Instagram | `Instagram::SendOnInstagramService` | `app/services/instagram/send_on_instagram_service.rb` |
| Telegram | `Telegram::SendOnTelegramService` | `app/services/telegram/send_on_telegram_service.rb` |
| Twitter | `Twitter::SendOnTwitterService` | `app/services/twitter/send_on_twitter_service.rb` |
| Twilio | `Twilio::SendOnTwilioService` | `app/services/twilio/send_on_twilio_service.rb` |
| LINE | `Line::SendOnLineService` | `app/services/line/send_on_line_service.rb` |
| SMS | `Sms::SendOnSmsService` | `app/services/sms/send_on_sms_service.rb` |
| TikTok | `Tiktok::SendOnTiktokService` | `app/services/tiktok/send_on_tiktok_service.rb` |
| Email | `Email::SendOnEmailService` | `app/services/email/send_on_email_service.rb` |

每个 Service：
1. 调用外部平台 API 发送消息
2. 发送成功 → 更新 `message.source_id` 为平台消息 ID
3. 发送失败 → 调用 `Messages::StatusUpdateService` 标记为 `failed`（详见 §9）
4. 认证失败 → 调用 `channel.authorization_error!`

### 5.7 以 WhatsApp 为例的发送流程

```
1. SendReplyJob 检测到 Channel::Whatsapp
2. 调用 Whatsapp::SendOnWhatsappService.new(message: @message).perform
3. Base::SendOnChannelService#perform
   - validate_target_channel: 确认是 Channel::Whatsapp
   - outgoing_message?: 确认是 outgoing/template
   - invalid_message?: 排除私密笔记/Echo 等

4. Whatsapp::SendOnWhatsappService#perform_reply
   - 使用 360Dialog API 或 Cloud API 发送消息
   - 支持文本、图片、文档、音频、视频、模板消息、交互式按钮等
   - 发送成功 → 更新 message.source_id 为平台消息 ID
   - 发送失败 → 调用 Messages::StatusUpdateService 标记为 failed
   - 认证失败 → 调用 channel.authorization_error!
```

---

## 6. 私密笔记流程

私密笔记（`private: true`）是 Chatwoot 的一类特殊消息——客服内部交流，不发给联系人。它走和普通 outgoing 消息一样的创建链路，但被多个回调/Service 在不同位置拦截，行为分歧集中在以下 6 点：

### 6.1 不会发到外部平台

`Base::SendOnChannelService#invalid_message?`（`send_on_channel_service.rb:50`）：

```ruby
def invalid_message?
  message.private? || outgoing_message_originated_from_channel? || message.content_type == 'voice_call'
end
```

`send_reply` 早就入队了 `SendReplyJob`，但 perform 时这里 return，**不会被发到外部平台**。

### 6.2 默认从联系人侧消息列表和 ActionCable 推送过滤

- **MessageFinder**（`message_finder.rb:20`）：默认 `where.not('private = ? OR message_type = ?', true, 2)`——默认不返回私密 + activity
- **MessageFilterHelpers#chat?**（`message_filter_helpers.rb:17`）：`(incoming? || outgoing?) && !private?` 同样排除
- **ActionCableListener**（`action_cable_listener.rb:209`）：`contact_tokens` 方法 `return [] if message.private?`——联系人一侧的 socket 不收到私密通知（客服侧仍收到）

### 6.3 不算首次回复，不影响 `first_reply_created_at`

`valid_first_reply?`（`message.rb:225`）首行 `return false unless human_response? && !private?`——私密笔记第一道就 return false，**不会**触发 `FIRST_REPLY_CREATED`，也不会写 `conversation.first_reply_created_at`。

### 6.4 不重置 `waiting_since`，不触发 `REPLY_CREATED`

`dispatch_create_events`（`message.rb:378`）落入 else `update_waiting_since`，而 `update_waiting_since`（`message.rb:340`）：

```ruby
def update_waiting_since
  clear_waiting_since_on_outgoing_response if conversation.waiting_since.present? && !private
  set_waiting_since_on_incoming_message
end
```

`!private` guard 把私密笔记挡在外面——`clear_waiting_since_on_outgoing_response`（`message.rb:344`）根本不调用，所以 `REPLY_CREATED` 不 dispatch，`waiting_since` 不清。`set_waiting_since_on_incoming_message` 只对 `incoming?` 生效，私密是 outgoing，也走不到。

### 6.5 只触发客服侧通知，不发邮件通知联系人

- **`email_notifiable_message?`**（`message.rb:211`）`return false if private?`——私密笔记不可邮件通知，`NotificationListener` 不会发邮件给联系人
- **`NotificationListener#message_created`**（`notification_listener.rb:50`）仍会触发 `Messages::MentionService`（@提及）和 `Messages::NewMessageNotificationService`——但这些通知的接收方是客服侧，不是联系人

### 6.6 触发途径

- 客服在 UI 手动建（`Messages::MessageBuilder` 接受 `private: true` 参数）
- 自动化规则可创建私密笔记（`automation_rules/action_service.rb:53` 用 `private: true`）
- 宏可创建私密笔记（`macros/execution_service.rb:33` 用 `private: true`）

---

## 7. source_id 机制

`source_id` 是 Message 模型的通用字段（不只 WhatsApp 专属），承担**双向**的关键作用：

### 7.1 入向去重

每个外部渠道用 `source_id` 做幂等去重，防止 webhook 重试导致重复入库：

| 渠道 | 去重位置 |
|---|---|
| WhatsApp | `Whatsapp::IncomingMessageServiceHelpers#find_message_by_source_id`（`whatsapp/incoming_message_service_helpers.rb:80`） |
| Instagram/Facebook | `Messages::Instagram::BaseMessageBuilder#find_message_by_source_id`（`messages/instagram/base_message_builder.rb:179`） |
| IMAP 邮件 | `Imap::BaseFetchEmailService` 查 `find_by(source_id: message_id)`（`imap/base_fetch_email_service.rb:41`） |
| Mailbox | `MailboxHelper` 查 `find_by(source_id:)`（`mailbox_helper.rb:11`） |

> 平台 webhook 重试时同一消息会带相同 source_id，靠此避免重复入库。

### 7.2 出向 echo 防环（核心防消息循环机制）

发送链路：各渠道 `SendOn*Service` 发送成功后 `message.update!(source_id: message_id)`：

- WhatsApp：`whatsapp/send_on_whatsapp_service.rb:37`
- Telegram：`telegram/send_on_telegram_service.rb:12`
- Facebook：`facebook/send_on_facebook_service.rb:31`
- SMS：`sms/send_on_sms_service.rb:14`
- LINE：`line/send_on_line_service.rb:17`
- TikTok：`tiktok/send_on_tiktok_service.rb:16`
- CSAT：`csat_survey_service.rb:117`

写入后，`Base::SendOnChannelService#invalid_message?` 用 `outgoing_message_originated_from_channel?`（即 `message.source_id.present?`，`send_on_channel_service.rb:39-50`）跳过。

**为什么需要这层**：客服从原生 App（如 WhatsApp Business / Instagram）发消息时，平台会 echo 回 Chatwoot。如果 echo 被当作"要发出去的"消息，会循环发一遍。`source_id` 已存在 → `invalid_message?` 拦截 → 不再发。

### 7.3 状态回执路由

部分渠道（WhatsApp、Facebook Messenger、Twilio、SMS）用 `source_id` 定位消息更新 `status`（sent/delivered/read/failed）。详见 §9。

### 7.4 与 external_source_ids 的区别

Slack 的外部源 ID 用单独的 `external_source_ids` JSONB 字段（`message.rb:115`），不是 `source_id`——结构不同：

```ruby
store :external_source_ids, accessors: [:slack], coder: JSON, prefix: :external_source_id
```

---

## 8. 等待与首次回复 SLA

`waiting_since` 和 `first_reply_created_at` 是 Chatwoot SLA 报表的基石。它们在消息流程多个节点被读写，分散在各回调里——单独成节梳理。

### 8.1 `waiting_since` 的生命周期

**含义**：客户开始等待的时间戳。

#### 写入点（3 处）

| 触发位置 | 代码位置 | 值 |
|---|---|---|
| 会话创建时 | `ensure_waiting_since`（`conversation.rb:266`） | `created_at` |
| incoming 消息且当前为空 | `set_waiting_since_on_incoming_message`（`message.rb:357`） | 消息 `created_at` |
| `bot_handoff!` | `conversation.rb:167` | `Time.current`（若为空） |

#### 清除点（4 处）

| 触发位置 | 代码位置 | 关联事件 |
|---|---|---|
| 首次人工回复（`valid_first_reply?` = true） | `message.rb:383` | 同时触发 `FIRST_REPLY_CREATED` |
| 人工回复（`human_response?` = true） | `clear_waiting_since_on_outgoing_response`（`message.rb:344`） | 同时触发 `REPLY_CREATED` |
| bot 回复（`bot_response?` 且非 `preserve_waiting_since`） | 同上方法 `message.rb:354` | 不触发 `REPLY_CREATED` |
| 会话 resolve 时 | `handle_resolved_status_change`（`conversation.rb:258`） | 无 |

> 私密笔记不清 `waiting_since`——`update_waiting_since` 外层 `&& !private` guard 把私密挡在外面（详见 §6.4）。

### 8.2 `first_reply_created_at` 的生命周期

**含义**：会话首次人工回复的时间戳，SLA 报表"首次响应时间"全靠它。

#### 写入点（1 处）

`valid_first_reply?` 为 true 时（`message.rb:383`）置为消息 `created_at`。

#### `valid_first_reply?` 的判定（`message.rb:224-233`）

满足全部 4 条才为 true：

1. `human_response?` && `!private?`
2. `conversation.first_reply_created_at` 为空
3. 此前非 bot、非私密、非 campaign 的 outgoing 消息数 ≤ 1
4. （隐含）当前消息是 outgoing 且非 automation_rule_id、非 campaign_id，sender 是 User 或 external_echo

#### `human_response?` 的判定（`message.rb:362-371`）

```ruby
outgoing? &&
  content_attributes['automation_rule_id'].blank? &&
  additional_attributes['campaign_id'].blank? &&
  (sender.is_a?(User) || content_attributes['external_echo'].present?)
```

> `external_echo` = 客服从原生 App（WhatsApp Business / Instagram）发的消息，平台 echo 回 Chatwoot——也算人工回复。

### 8.3 相关事件

| 事件 | 触发时机 | payload |
|---|---|---|
| `FIRST_REPLY_CREATED` | 首次人工回复时（`message.rb:382`） | `message`、`performed_by` |
| `REPLY_CREATED` | 每次人工回复时（`message.rb:346`） | `waiting_since`（旧值）、`message` |

---

## 9. 消息状态回执

`status` 字段记录消息在外部平台的投递状态。完整生命周期：

```
创建消息（默认 sent）
  -> 平台 webhook 回执（WhatsApp/FB/Twilio/SMS）
    -> delivered
    -> read
  或 发送 Service 即时失败
    -> failed
```

### 9.1 4 类回执入口

#### (1) 外部平台 webhook 回执

平台把送达/已读回执推回 Chatwoot：

| 渠道 | 入口 |
|---|---|
| WhatsApp | `Whatsapp::IncomingMessageBaseService#process_statuses`（`whatsapp/incoming_message_base_service.rb:49`）解析 `statuses` 数组，按 `id`（= source_id）查 Message |
| Facebook Messenger | `Integrations::Facebook::DeliveryStatusService`，用 delivery/read watermark 更新 |
| Twilio | `Twilio::DeliveryStatusService`（`twilio/delivery_status_service.rb:10`） |
| SMS | `Sms::DeliveryStatusService`（`sms/delivery_status_service.rb:7`） |
| LINE / TikTok | 发送 Service 在 API 响应里直接调 `Messages::StatusUpdateService.new(message, 'delivered')`（`line/send_on_line_service.rb:17`、`tiktok/send_on_tiktok_service.rb:16`） |

#### (2) 发送 Service 即时失败

所有渠道 `SendOn*Service` 在 rescue 异常时调 `Messages::StatusUpdateService.new(message, 'failed', e.message)`：

- WhatsApp、Facebook、Twitter、Twilio、Email、Instagram（`instagram/base_send_service.rb:64`）全都这么做

#### (3) 客服手动改状态

`Api::V1::Accounts::Conversations::MessagesController#update_status`（`messages_controller.rb:17`）调 `Messages::StatusUpdateService.new(message, params[:status], params[:external_error])`

#### (4) Webhook 投递失败

`Webhooks::Trigger#update_message_status`（`lib/webhooks/trigger.rb:100`）——队列入 webhooks 投递失败时把消息标 `failed`

### 9.2 StatusUpdateService 的核心规则

**文件**: `app/services/messages/status_update_service.rb`

```ruby
def valid_status_transition?
  return false unless Message.statuses.key?(status)

  # Don't allow changing from 'read' to 'delivered'
  return false if message.read? && status == 'delivered'

  true
end

def update_message_status
  message.update!(
    status: status,
    external_error: (status == 'failed' ? external_error : nil)
  )
end
```

#### 关键约束

- **必须存在该状态**——`Message.statuses.key?(status)`
- **禁止 `read` → `delivered` 倒退**——已读消息不能再退回已送达
- **`external_error` 只在 failed 时写**——非失败状态会清空 `external_error`

---

## 10. 事件分发机制

### 10.1 事件类型

**文件**: `lib/events/types.rb`

| 事件 | 常量 | 说明 |
|---|---|---|
| `message.created` | `MESSAGE_CREATED` | 消息创建 |
| `message.updated` | `MESSAGE_UPDATED` | 消息更新 |
| `first.reply.created` | `FIRST_REPLY_CREATED` | 首次回复创建（详见 §8） |
| `reply.created` | `REPLY_CREATED` | 人工回复创建（详见 §8） |

### 10.2 事件 payload 与 performed_by 追踪

dispatch 时携带的关键数据：

| 事件 | payload |
|---|---|
| `MESSAGE_CREATED` | `message`、`performed_by: Current.executed_by`（`message.rb:379`） |
| `MESSAGE_UPDATED` | `message`、`performed_by`、`previous_changes`（`message.rb:247`） |
| `FIRST_REPLY_CREATED` | `message`、`performed_by`（`message.rb:382`） |
| `REPLY_CREATED` | `waiting_since`、`message`（`message.rb:346`） |

**`Current.executed_by`** 是 Chatwoot 跨 Job/Service 追踪"是谁触发了这条消息"的全局状态——自动化规则产生的消息、bot 产生的、客服产生的，`performed_by` 都不同，监听器据此决定是否发通知、生成何种审计记录。

### 10.3 `message.updated` 触发条件

**文件**: `app/models/message.rb:389`

```ruby
def dispatch_update_event
  return if previous_changes.blank?
  send_update_event
end
```

- `after_update_commit` 触发
- **`previous_changes.blank?` 时不发**——无字段变更不发事件
- payload 带 `previous_changes` 给监听器判断改了啥（如 status 从 sent → delivered）

### 10.4 分发器与监听器

**文件**: `app/dispatchers/dispatcher.rb`

单例模式，基于 Rails 配置，同时分发到同步和异步监听器。

#### 同步监听器（SyncDispatcher）

| 监听器 | 作用 |
|---|---|
| `ActionCableListener` | WebSocket 实时推送 |
| `AgentBotListener` | 通知 Agent Bot |

#### 异步监听器（AsyncDispatcher）

`AutomationRuleListener`、`CampaignListener`、`CsatSurveyListener`、`HookListener`、`InstallationWebhookListener`、`NotificationListener`、`ParticipationListener`、`Conversations::UnreadCounts::Listener`、`ReportingEventListener`、`WebhookListener`

### 10.5 消息事件流过时的具体行为

#### ActionCableListener（同步，`app/listeners/action_cable_listener.rb`）

| 事件 | 行为 |
|---|---|
| `message_created`（line 41） | 向会话 inbox 成员 + 联系人侧广播 `MESSAGE_CREATED` + `message.push_event_data`。私密/活动消息**不广播给联系人侧**（`contact_tokens` 在 `message.rb:209` 排除） |
| `message_updated`（line 49） | 同上接收方，广播 `MESSAGE_UPDATED` + `previous_changes` |
| `first_reply_created`（line 57） | 向 inbox 成员广播 `FIRST_REPLY_CREATED`（不含联系人） |

#### WebhookListener（异步，`app/listeners/webhook_listener.rb`）

| 事件 | 行为 |
|---|---|
| `message_created`（line 25） | 检查 `message.webhook_sendable?`，向账户 webhook + API inbox webhook 投递消息 payload |
| `message_updated`（line 35） | 同上 |

#### NotificationListener（异步，`app/listeners/notification_listener.rb`）

| 事件 | 行为 |
|---|---|
| `message_created`（line 50） | 调 `Messages::MentionService`（处理 @提及）+ `Messages::NewMessageNotificationService`（生成客服侧站内/Push 通知）。**私密笔记不发邮件通知联系人**（`email_notifiable_message?` 为 false） |

#### HookListener（异步，`app/listeners/hook_listener.rb`）

| 事件 | 行为 |
|---|---|
| `message_created`（line 2） | 遍历账户 `hooks`，按 hook 的 `app_id` 检查支持的事件类型（Slack / Dialogflow / Google Translate / Linear 支持 `message.created`），匹配则入队 `HookJob` 执行集成逻辑 |
| `message_updated`（line 8） | 同上，Slack / Dialogflow 支持 `message.updated` |

`supported_events_map`（`hook_listener.rb:61`）：

```ruby
'slack' => ['message.created', 'message.updated'],
'dialogflow' => ['message.created', 'message.updated'],
'google_translate' => ['message.created'],
'linear' => ['message.created']
```

#### AutomationRuleListener（异步）

`message.created` 事件触发已配置的自动化规则（on_message）——执行动作可能产生新的 outgoing 消息（含私密笔记，详见 §6.6）。

---

## 11. Enterprise 扩展

Enterprise 版本在 OSS 基础上增加了以下消息相关功能：

| 扩展 | 文件 |
|---|---|
| Message 模型扩展 | `enterprise/app/models/enterprise/message.rb` |
| Message 模型 Concern | `enterprise/app/models/enterprise/concerns/message.rb` |
| MessageBuilder 覆盖 | `enterprise/app/builders/enterprise/messages/message_builder.rb` |
| MessageFinder 覆盖 | `enterprise/app/finders/enterprise/message_finder.rb` |
| 语音通话消息构建器 | `enterprise/app/services/voice/call_message_builder.rb` |
| Captain AI 消息构建器 | `enterprise/app/services/captain/open_ai_message_builder_service.rb` |
| 活动消息处理器 | `enterprise/app/models/enterprise/activity_message_handler.rb` |

### Enterprise 特性

- **语音通话**：支持 `content_type: :voice_call`，附加通话元数据到 `content_attributes['data']`
- **Captain AI 助手**：AI 自动回复，检测是否需要转人工（本文档不展开 Captain 部分）

# UniChat

消息聚合平台，把外部 IM 渠道的消息收进来，交给 AgentBot 回复，再把回复发出去。v1 只接 Telegram，形态是 Bot-only（机器人自动回复 + 必要时转人工）。

## Language

**Inbox**:
平台的渠道接入点，承载一个外部渠道的配置（token、webhook secret、关联的 AgentBot）。一个 Inbox 绑定一个 Channel 类型。
_Avoid_: 收件箱、mailbox、source（source 容易和 source_id 混淆）

**Channel**:
外部渠道的实现类型（v1 只有 Telegram）。Inbox 是配置的壳，Channel 是渠道特定的 adapter 逻辑。v1 单渠道，二者合并为 YAML 配置项。
_Avoid_: 平台、platform（platform 在本文里指外部 IM 平台）

**Contact**:
外部 IM 平台上联系 UniChat 的人。v1 一个 Contact 由 (Inbox, source_id) 唯一确定，不做跨渠道合并。
_Avoid_: 客户、customer、user（user 在本文指人工客服）

**Contact.source_id**:
外部平台侧的稳定用户标识（Telegram chat_id、WhatsApp 手机号等）。与 Inbox 一起唯一确定一个 Contact。
_Avoid_: external_id、platform_id

**Message.source_id**:
外部平台侧的消息级 ID（Telegram message_id）。用于双向去重：入向防 webhook 重试刷消息，出向防 echo 环。
_Avoid_: external_id、platform_id（注意与 Contact.source_id 是不同层级的概念）

**Conversation**:
消息的容器，关联一个 Inbox、一个 Contact。会话状态机：

- `active` — AgentBot 正常回复
- `pending_human` — AgentBot 发出 handoff 信号后等待人工接入；Contact 在此期间发新消息则回到 active
- `resolved` — 人工客服标记结束，不再接受新消息

同一 Contact 在同一 Inbox 下按「取最近未 resolved 会话，没有则新建」归属消息。
_Avoid_: session（session 暗示临时态）、thread、chat

**Message**:
消息单元。有方向（incoming / outgoing / activity）、sender 类型（Contact / AgentBot / User）、内容类型（v1 先 text）、投递状态、handoff flag、Message.source_id。

- `incoming` — Contact 发来的消息
- `outgoing` — 发往外部平台的消息（AgentBot 或 User 发出）
- `activity` — 系统动作记录（如"Conversation resolved"、"Conversation reopened"），无外部平台的 source_id

_Avoid_: 文本、event（event 在本文指系统总线信号）

**AgentBot**:
独立的外部回复服务。平台把 incoming 消息推给它（fire-and-forget），它自己带上下文调 LLM，算完后通过平台 API 把回复推回来。不是平台内部组件，不共享 DB。
_Avoid_: bot（太宽）、AI、assistant

**handoff**:
Message 上的 flag，标识「这条 outgoing 是 AgentBot 的转人工信号，不要发到外部」。Conversation 由此进入 `pending_human`。
_Avoid_: escalate、transfer

**User**:
人工客服。v1 只作为 sender_type 之一存在（人工回复走 outgoing），没有 assignee、SLA、首次回复时间窗、unread 计数等元数据。这些是 v2 范畴。
_Avoid_: agent（agent 在本文指 AgentBot）、staff、operator

**Bus**:
进程内事件总线（asyncio），只做"通知有活干了"的信号，不传消息体。持久真相在 DB。订阅者按 bus 名订阅。bus 不是消息队列。
_Avoid_: queue、broker、stream

## Rules

- Bot-only 形态明确排除 Chatwoot 的 SLA 子系统（waiting_since / first_reply_created_at / human_response? 判定链 / 私密笔记 / @提及 / 邮件通知 / unread 计数）。这些不是 v1 范畴。
- 跨渠道 Contact 合并、跨 Inbox Conversation 合并、admin UI、人工 assignee 都是 v2 范畴，v1 不预留接口（避免接口债在事件驱动架构里扩散）。
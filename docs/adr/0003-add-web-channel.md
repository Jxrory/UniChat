---
status: accepted
---

# 加入 web Channel：v2 起点

v1 上线后引入第 4 个 Channel 类型 `web`：第三方站点用 `<script>` 嵌入 widget SDK，访客在浏览器里跟 UniChat 后面的 AgentBot/人工对话，访客就是 web 渠道下的 Contact。ADR-0001「v1 只接 Telegram」分句被本 ADR lift；ADR-0001 其它 v1 约束（不加 Chatwoot 多层实体、不跨渠道 Contact 合并、不背 SLA 子系统、不预留 v2 接口）维持不变。

难以反悔 & 后人需要原文上下文：渠道 adapter 现存，但 web channel 下行不是出站 HTTP 而是「丢进进程内 per-conversation queue 给 SSE 拉」——`ChannelAdapter.send_message` 语义随渠道而变第一次落地，签名需要扩 conversation_id 而不止 source_id。架构 §10 明示「不从 Chatwoot 抄 ActionCable/WebSocket」，但 visitor 不能等刷新，折中取 SSE：浏览器原生、单向、纯 HTTP，不改造 bus 模型，不起额外进程；WebSocket 留给后续 typing/附件等双向能力，v1.5 不上。pending_human + incoming：v1 CONTEXT 写「Contact 在此期间发新消息则回到 active」，架构 §6.1 写「pending_human → 不通知 bot」——两段矛盾；web 渠道高频"还在吗" 会把这条 bug 高频暴露。本 ADR 定为「架构为准：pending_human 期间 incoming 静默落库不通知 AgentBot」，修订 CONTEXT.md 对齐。identify 切换：partner 用 HMAC-signed user_id 升级身份时，anonymous-UUID Conversation 显式 resolve、在新 source_id 下「取最近未 resolved 会话，没有则新建」；**不做同渠道内 Contact identity upgrade / merge 操作**，未预设状态机分支。

真实 trade-off：鉴权 = Chatwoot web_widget 路线——Inbox config 加 `embed_key`（公开）+ `hmac_secret`（仅 partner 后端持有）；匿名 = widget 在 localStorage 生 UUID 作 source_id；partner 通过 `widget.identify(user_id, user_hash=HMAC(user_id, hmac_secret))` 升级，验签后 source_id = partner user_id。**不配** CORS origin allowlist——widget 本就嵌在 partner 自有站点，allowlist 与其部署分盆互仿。备选「partner server 发短期 token」更严格但 partner 接入成本跳一档；不选。web 渠道 Contact/Conversation 会越积越多：匿名访客大多只来一次，永不 auto resolve 会堆 active 行。Inbox config 加 `idle_resolve_hours`，backend sweep 自动 resolve 超时无活动的 active conversation；TTL 仅 web channel 生效，不触 v1「不做 SLA 子系统」红线。访客侧新增 GET `/conversations/{conv}/messages`（embed_key 鉴权，跟 send 并列）让 widget 重开能拉历史 continuity。handoff=True：AgentBot 端 outgoing Message 仍 silent 落库；额外由平台生成 activity Message「正在接入人工」走 OutComing → ChannelSender → SSE 推回访客——「activity Message 现在参与 OutComing 而非沉默落库」由此纳入 v1 后续语义。AgentBot notify body 加 `channel_type`，纯增量非破坏。
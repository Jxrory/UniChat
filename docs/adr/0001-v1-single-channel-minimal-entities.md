---
status: accepted
---

# v1 锁定单渠道极简实体

3 天上线约束下，v1 只接 Telegram，且明确不复用 Chatwoot 的 Account/Inbox/Channel 三层 + ContactInbox 双层结构。Inbox 与 Channel 合并为单条 YAML 配置；Contact 单表，唯一键 (inbox_id, source_id)，不做跨渠道合并。AgentBot 不是 DB 实体，配置直接挂在 Inbox.config 里。

这是 hard to reverse 的：未来加第二个渠道（比如 WhatsApp）时，会因为 Contact 没有 ContactInbox 层而需要做一次迁移——但这次迁移要远小于一开始背 Chatwoot 全套实体模型在 3 天里实现不了的风险。

是 real trade-off：备选是直接抄 Chatwoot 的实体模型（多表多态），用更长工期换扩展性。我们选了工期，理由是 v1 业务形态（Bot-only 单渠道）不需要这些层的语言。
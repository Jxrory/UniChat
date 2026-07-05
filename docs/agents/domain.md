# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — defines the project's ubiquitous language (Inbox, Channel, Contact, source_id, Conversation, Message, AgentBot, handoff, User, Bus).
- **`docs/adr/`** — read ADRs that touch the area you're about to work in. Currently: `0001-v1-single-channel-minimal-entities.md` (single channel Telegram, minimal entities).

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── CONTEXT.md
├── docs/adr/
│   └── 0001-v1-single-channel-minimal-entities.md
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept, use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

Common pitfalls in this repo:
- 说 "bot" → 应该是 **AgentBot**
- 说 "session" → 应该是 **Conversation**
- 说 "收件箱" → 应该是 **Inbox**
- 说 "event" → 注意 message 不是 event（event 指 bus 信号）
- 说 "customer/user" → 应该是 **Contact**（user 指人工客服）

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0001 (single channel, minimal entities) — but worth reopening because…_
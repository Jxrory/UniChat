# Changelog

## [0.3.0] - 2026-07-07

### Added

- **Web Channel**: 新增第四个渠道类型 `web`，第三方站点可通过 HTML `<script>` 嵌入聊天框，访客无需 IM 账号即可与 AgentBot/人工对话
- **Widget SDK** (`/static/widget.js`)：自包含 JS SDK，自动初始化、浮动聊天气泡、消息发送、历史拉取、SSE 实时推送
- **SSE 下行推送**: `GET /widget/conversations/{id}/sse` 进程内 per-conversation 队列推送 AgentBot/人工回复到浏览器
- **Identify 身份升级**: `POST /widget/{inbox_id}/identify` HMAC-SHA256 鉴权，匿名访客可升级为已识别用户，老 Conversation 自动 resolve
- **Handoff 活动消息**: AgentBot 转人工时自动创建 `sender_type='system'` 活动消息（默认「转人工中，请稍候」），通过 SSE 推送到 widget
- **Idle TTL Auto-resolve**: 后台 sweep 每分钟检查 web 渠道无活动会话，按 inbox 配置的 `idle_resolve_hours`（默认 24h）自动 resolve
- `ChannelAdapter.send_message` 增加 `conversation_id` 形参（WebAdapter 用它路由 SSE 队列，TG/WA 适配器忽略）

### Changed

- AgentBot 通知 payload 增加 `channel_type` 字段

## [0.2.1] - 2026-07-07

### Added

- 同会话收到新消息（含外部联系人和 Bot 回复）时 WebSocket 自动推送 `#message-panel` 局部刷新：`.msg-container` 增加 `data-conv-id` 属性，`onmessage` 在 `conversation_id` 匹配时追加 `htmx.ajax` 刷新消息面板
- 增加 E2E 测试覆盖 message-panel 刷新的三种场景：同会话/不同会话/Bot 回复（3 个测试方法）

### Fixed

- 修复 Bot 回复（OutComing bus，`message_type=outgoing`）被 WS 推送守卫误拦截的问题：移除 `message_type === "incoming"` 限制，所有类型消息均参与匹配判断

## [0.2.0] - 2026-07-07

### Added

- E2E 测试基础设施：`tests/e2e/conftest.py` + 13 个 Playwright 测试
- 新增 E6（WS 推送 conv-list 自动刷新）、E7（WS onclose 重连）、E9（移动端视口）、E10（未登录重定向）E2E 覆盖
- 所有交互模板增加 `data-testid` 属性（login、admin、_messages）
- E2E 便捷运行脚本 `script/run_e2e.sh`
- 测试方案文档 `docs/测试方案.md`
- `pyproject.toml` 增加 `e2e` marker
- `AGENTS.md` 增加测试约定段
- CI 部署钩子增加 `-m "not e2e"` 自动跳过 E2E

### Fixed

- Test adapter 注册增加 `UNICHAT_ENV` 环境守卫，生产环境不暴露 test webhook 端点
- `config.yaml` test 渠道 `webhook_secret` 改为环境变量 `${TEST_WEBHOOK_SECRET}`，移除明文硬编码

### Changed

- 依赖：增加 `playwright`、`pytest-playwright`
- 模板：`login.html`、`admin.html`、`_messages.html` 增加 `data-testid` 属性

## [0.1.0] - 2026-07-05

### Added

- 项目初始版本

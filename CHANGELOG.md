# Changelog

## [0.2.1] - 2026-07-07

### Added

- WS 推 `message.created` 时同会话 `#message-panel` 自动刷新：`.msg-container` 增加 `data-conv-id` 属性，`onmessage` 在 `message_type === "incoming"` 且 `conversation_id` 匹配时追加 `htmx.ajax` 刷新消息面板
- E2E 测试：同会话 message-panel 刷新 + 不同会话不打扰分支（2 个新测试方法）

### Fixed

- 修复 outgoing message 导致的 message-panel 竞态：增加 `message_type === "incoming"` 守卫，防止管理员回复时 WS 覆盖正在输入的表单

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

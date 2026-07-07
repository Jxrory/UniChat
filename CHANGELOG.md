# Changelog

## [0.2.0] - 2026-07-07

### Added

- E2E 测试基础设施：`tests/e2e/conftest.py` + 8 个 Playwright P0 烟囱测试
- 所有交互模板增加 `data-testid` 属性（login、admin、_messages）
- E2E 便捷运行脚本 `script/run_e2e.sh`
- 测试方案文档 `docs/测试方案.md`
- `pyproject.toml` 增加 `e2e` marker
- `AGENTS.md` 增加测试约定段
- CI 部署钩子增加 `-m "not e2e"` 自动跳过 E2E

### Changed

- 依赖：增加 `playwright`、`pytest-playwright`
- 模板：`login.html`、`admin.html`、`_messages.html` 增加 `data-testid` 属性

## [0.1.0] - 2026-07-05

### Added

- 项目初始版本

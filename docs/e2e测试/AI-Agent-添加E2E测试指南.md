# 用 AI Agent 添加 E2E 测试指南

> 本文档定义一套标准 prompt 和工作流，让 AI Agent（OpenCode / Claude Code / Codex 等）能稳定、合规地添加新的 E2E 测试。
> 配合 `docs/e2e测试/测试点清单.md` 使用。

---

## 一、标准 Prompt 模板（复制即用）

把下面整段贴给 AI Agent，替换 `<N>` 和 `<流程描述>` 即可：

```
为 UniChat 添加 E2E 测试。

必读文件（按顺序读，不要跳过）：
1. docs/e2e测试/测试点清单.md — 看现有覆盖矩阵，确认 E<N> 还未实现
2. docs/测试方案.md §4 — E2E 补位范围，确认只补 httpx 测不到的
3. tests/e2e/conftest.py — 可用 fixture：e2e_server / seeded_conversation / _clean_db
4. tests/e2e/test_smoke.py — 现有 8 个测试的写法范式

任务：实现 E<N>（<流程描述>）

约束（违反任意一条就回滚）：
- 必须加 @pytest.mark.e2e
- 用 data-testid 定位（清单见 docs/e2e测试/测试点清单.md §五），不要用 CSS class、xpath、文本选择器
- 遵循 test_smoke.py 的现有模式：登录 → 操作 → wait_for + expect 断言
- teardown 隐式断言 console 无 error（或在测试内显式收集 page.on("console")）
- 只断言"swap 发生、元素可见、状态正确"，不断言具体文案（文案留给 L1）
- 如果需要新种子数据，扩展 conftest.py 的 _seed_contact_and_conversation 或加新 fixture，不要在测试函数内直接写 SQL
- 不要碰 L1 测试和现有模板（除非需要加新 data-testid，那时同步更新清单文档）

验证（必须全绿才算完成）：
- uv run pytest tests/e2e/test_<new>.py -v -m e2e
- uv run ruff check tests/e2e/
- 不要跑 L1，L1 不应该被影响

完成后：
- 更新 docs/e2e测试/测试点清单.md §一·1.1 和 §三·1.1，把 E<N> 从"未实现"挪到"已实现"，补 TC 编号和文件路径
```

---

## 二、三个关键约束（AI 容易跑偏的点）

AI Agent 在写 E2E 时有三个高频踩坑点，prompt 里已明文禁止，但复查时仍要重点看：

### 2.1 只补 httpx 测不到的

**AI 倾向**：顺手把 `test_admin_ui.py` 已覆盖的 HTML 内容断言用 Playwright 重写一遍。

**正确做法**：E2E 只测以下四类，其他一律不做：
- htmx 局部 swap（`hx-get` / `hx-post` 触发的 `#message-panel` 替换）
- WebSocket 推送（`message.created` → `htmx.ajax` 重载 `#conv-list`）
- 真实浏览器行为（cookie/redirect、URL 变化、`location.reload`）
- JS console error 检测

**自查**：如果新测试的断言是 `expect(element).to_contain_text("具体业务文案")`，且这个文案在 `test_admin_ui.py` 里已经用 `b"..." in resp.content` 断言过 → 删掉，重写为 `to_be_visible()` 或 `to_have_count(N)`。

### 2.2 data-testid 而非 CSS/xpath/文本

**AI 倾向**：用 `.conv-row`、`page.locator("button:has-text('发送')")`、`//div[@class='msg-bubble']` 这类不稳定选择器。

**正确做法**：一律用 `page.get_by_test_id("conv-row")`。完整 testid 清单见 `docs/e2e测试/测试点清单.md §五`。

**例外**：当需要按 sender 区分气泡时，用属性组合选择器：
```python
page.locator('[data-testid="msg-bubble"][data-sender="user"]')
```
这是允许的，因为 `data-sender` 是项目约定的语义属性，不是样式 class。

**需要新 testid 时**：先在模板加 `data-testid="xxx"`，同步更新清单文档 §五，再写测试。

### 2.3 种子数据走 fixture

**AI 倾向**：在测试函数开头直接 `session.execute(text("INSERT INTO ..."))` 写一堆 SQL。

**正确做法**：
- 单条简单数据 → 用现有 `seeded_conversation` fixture
- 需要特殊状态（如 `pending_human` 会话、多条消息） → 在 `conftest.py` 加新 fixture，例如 `seeded_pending_conversation`，复用 `_seed_contact_and_conversation` 的模式
- fixture 必须走 `get_session()`（共享 server 的 engine），不要自己 `create_engine`

---

## 三、完整示例：实现 E6（WebSocket 推送）

下面是一个填好的 prompt 示例，可直接用：

```
[标准 prompt 模板]

任务：实现 E6（WS 推 message.created → #conv-list 自动刷新，无整页 reload）

技术要点：
- admin.html 已有 WS 逻辑：连 /ws/notifications?inboxes=tg，收到 message.created
  触发 htmx.ajax("GET", "/admin", {target: "#conv-list", swap: "innerHTML"})
- 触发推送的两种方式（任选其一）：
  A) 通过 Test adapter webhook：POST /webhooks/test/tg 模拟真实 incoming，
     让 IngestService 落库 + publish Incoming bus → WSNotifier 推送
  B) 直接写库 + 手动 publish bus（参考 tests/test_ws_notifier.py::TestWSNotifierBus
     的做法，调 get_incoming_bus().publish(...))
- 推荐方式 A，更贴近真实流程

断言：
- 登录后等 WS 建立（page.wait_for_timeout(500) 或监听 websocketframereceived 事件）
- 触发新消息
- 新会话行出现在 conv-list（page.get_by_test_id("conv-row", has_text="NewContact").wait_for(timeout=3000)）
- page.url 没变（证明是 htmx 局部刷新，不是 location.reload）

文件：tests/e2e/test_websocket.py（新建）
```

---

## 四、标准工作流（3 步）

### 步骤 1 — 先让 AI 读清单，确认不重复

把标准 prompt 模板贴给 AI，**第一步只让它读 `docs/e2e测试/测试点清单.md` 并报告**：
- E<N> 当前状态（已实现 / 未实现）
- 如果已实现，停在原地，告诉用户"已存在，无需重复"
- 如果未实现，列出将要创建的文件和将要修改的文件

这一步是防呆：避免 AI 重复造已有测试。

### 步骤 2 — AI 写测试 + 跑 + 自查

AI 按 prompt 执行：
1. 读必读文件
2. 写 `tests/e2e/test_<name>.py`
3. 跑 `uv run pytest tests/e2e/test_<name>.py -v -m e2e`
4. 跑 `uv run ruff check tests/e2e/`
5. 必须本地全绿才算完成

**如果 AI 需要新 data-testid**：让它先改模板，跑一次 L1（`uv run pytest tests/ -m "not e2e"`）确认没破坏现有断言，再写 E2E。

### 步骤 3 — AI 更新清单文档

完成后让 AI 更新 `docs/e2e测试/测试点清单.md`：
- §一·1.1（已实现表）：新增一行，补 TC 编号、类名、文件路径
- §一·1.2（未实现表）：删除对应 E<N> 行
- §三·1.1（覆盖矩阵）：E<N> 从 ❌ 改 ✅，补 TC 编号
- §三·1.2（页面/功能表）：对应功能补 ✅ 和 TC 编号
- §五（data-testid 表）：如果加了新 testid，补一行

这一步保证清单文档始终是**单一真相源**，下次 AI 来读时看到的就是最新状态。

---

## 五、常见场景的 Prompt 片段

### 5.1 需要新种子数据

```
需要新种子数据：<描述，如"一个 pending_human 状态的会话 + 3 条消息">

在 conftest.py 加新 fixture `seeded_<name>`，复用 _seed_contact_and_conversation 的模式：
- 用 get_session() + text() + 参数化 INSERT
- 时间戳固定为 2026-07-07T10:00:00+00:00
- id 用 e2e-<entity>-<n> 前缀避免冲突
- 返回 dict 包含新建实体的 id
```

### 5.2 需要新 data-testid

```
需要新 data-testid：<元素描述，如"会话列表的筛选下拉框">

1. 在 src/templates/<file>.html 给元素加 data-testid="<name>"
2. 更新 docs/e2e测试/测试点清单.md §五，补一行
3. 跑 uv run pytest tests/ -m "not e2e" 确认没破坏 L1 的 b"..." in resp.content 断言
4. 再写 E2E 测试用 get_by_test_id("<name>") 定位
```

### 5.3 测试 WebSocket 重连（E7）

```
任务：实现 E7（ws.onclose → 5s 后 location.reload() 不死循环）

技术要点：
- admin.html 的 WS onclose 回调：setTimeout(() => location.reload(), 5000)
- 测试不要真等 5s，用 page.route() 拦截 /ws/notifications 返回 abort，
  然后 page.wait_for_timeout(5100)
- 断言 page.url 仍是 /admin（reload 后还在同页），且没有反复 reload
  （用 page.reload_count 或监听 framenavigated 事件计数）

注意：这个测试跑得慢（>5s），可接受。不要 mock 时间，测真实行为。
```

### 5.4 测试移动端视口（E9）

```
任务：实现 E9（移动端 375px 视口下布局不溢出）

技术要点：
- 用 page.set_viewport_size({"width": 375, "height": 812})
- 登录 → 进 admin
- 断言 .conv-list 的 bounding_box().width <= 375
- 断言 .msg-panel 的 bounding_box().x + width <= 375（不溢出右侧）
- 断言没有水平滚动条：page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
```

---

## 六、禁忌清单（AI 容易犯的错）

| 禁忌 | 为什么不能做 | 正确做法 |
|------|-------------|---------|
| 用 CSS class 定位 | class 是样式，会改；testid 是语义，稳定 | `get_by_test_id()` |
| 用 xpath 定位 | 脆弱，模板一改就断 | 同上 |
| 用 `:has-text("发送")` 定位 | 文案会改，且 i18n 后全断 | 给元素加 testid |
| 在测试里直接写 SQL INSERT | 不可复用，数据 schema 一改全断 | 写成 fixture 放 conftest |
| 断言具体业务文案 | L1 已测，E2E 重测是冗余 | 只断言可见性 / 数量 / 状态 |
| 不加 `@pytest.mark.e2e` | 会被部署钩子跑，CI 没浏览器全红 | 每个测试类/函数都加 |
| 修改 L1 测试 | L1 是稳定的快速反馈层，不该被 E2E 影响 | 只加 E2E，不碰 L1 |
| 不更新清单文档 | 下次 AI 来读时不知道哪些已实现 | 完成后必须更新 §一和§三 |
| 引入 Node/TypeScript | 项目栈全 Python，无意义引 Node | 只用 pytest-playwright |
| 预留占位测试（skip） | 违反 AGENTS.md「不预留接口」原则 | 真要实现时再加，不留空 |

---

## 七、验证清单（AI 完成后自查）

AI 提交前必须自报以下全部为是，否则不算完成：

- [ ] 新测试文件加了 `@pytest.mark.e2e`
- [ ] 所有定位用 `get_by_test_id` 或 `[data-testid="..."][data-xxx="..."]`
- [ ] 没有断言具体业务文案（只断言 visible / count / 状态值）
- [ ] 种子数据走 fixture（conftest.py），没有测试内裸 SQL
- [ ] `uv run pytest tests/e2e/test_<new>.py -v -m e2e` 全绿
- [ ] `uv run ruff check tests/e2e/` 通过
- [ ] 没有修改 L1 测试或现有模板（除非同步更新了清单 §五）
- [ ] `docs/e2e测试/测试点清单.md` §一和§三已更新，E<N> 状态从"未实现"挪到"已实现"

---

## 八、参考文档

- `docs/e2e测试/测试点清单.md` — 现有覆盖 + testid 清单（单一真相源）
- `docs/测试方案.md` — 整体测试分层方案和补位原则
- `tests/e2e/conftest.py` — fixture 实现参考
- `tests/e2e/test_smoke.py` — 8 个现有测试的写法范式
- `AGENTS.md` § Testing conventions — 项目测试约定

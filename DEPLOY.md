# Deploy — UniChat

## Requirements

- Linux x86_64 (bare host, no Docker)
- Python >= 3.11
- `uv` (包管理器) — 安装: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- nginx（已有）
- systemd

## 配置

所有配置统一在 `config.yaml`，包括 Token 等敏感信息。确保 `config.yaml` 文件权限为 600。

## 部署步骤

### 1. 创建系统用户

```bash
sudo useradd --system --create-home --home-dir /opt/unichat unichat
```

### 2. 部署代码

```bash
sudo -u unichat git clone <repo-url> /opt/unichat
sudo -u unichat uv sync --frozen
```

### 3. 配置 config.yaml

```bash
sudo -u unichat cp config.yaml.example /opt/unichat/config.yaml
sudo -u unichat vi /opt/unichat/config.yaml
# 填入 TELEGRAM_BOT_TOKEN、AGENTBOT_URL 等实际值
sudo chmod 600 /opt/unichat/config.yaml
```

### 4. 安装 systemd 服务

```bash
sudo cp deploy/unichat.service /etc/systemd/system/unichat.service
sudo systemctl daemon-reload
sudo systemctl enable unichat
sudo systemctl start unichat
```

验证状态:

```bash
sudo systemctl status unichat
journalctl -u unichat -f
```

### 5. 配置 nginx

编辑 `deploy/nginx-unichat.conf`，将 `server_name` 和证书路径替换为实际值，然后:

```bash
sudo cp deploy/nginx-unichat.conf /etc/nginx/sites-available/unichat
sudo ln -s /etc/nginx/sites-available/unichat /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 6. 设置 Telegram webhook

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://<your-domain>/webhooks/telegram/tg" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

### 7. 验证

```bash
curl -X POST "https://<your-domain>/api/v1/conversations/nonexistent/messages" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
# 应返回 404（期待行为）
```

## 数据库

SQLite 数据库自动创建在 `/opt/unichat/unichat.db`。表在服务启动时自动创建（`create_all`）。

### 切换到 PostgreSQL

修改 `config.yaml` 中的 `database.url`:

```yaml
database:
  url: "postgresql://user:password@host:5432/unichat"
```

重启服务即可。

## 日志

```bash
journalctl -u unichat -f
```

## 更新

```bash
sudo -u unichat git -C /opt/unichat pull
sudo -u unichat uv sync --frozen
sudo systemctl restart unichat
```

## 架构说明

- nginx 监听 443（TLS），反向代理到本地 127.0.0.1:8000
- Uvicorn 只监听 localhost，不直接暴露
- Webhook 路由 `/webhooks/telegram/{inbox_id}` 和 API 路由 `/api/v1/*` 可通过 nginx 访问
- 非上述路径的请求由 nginx 返回 404
- `create_all()` 在启动时自动建表，无需 Alembic  migration（见 ADR-0001）

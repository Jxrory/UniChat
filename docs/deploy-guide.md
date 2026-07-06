# UniChat 部署指南

## 前置条件

- 一台 VPS，已安装 Python 3.11+、nginx、systemd
- 域名 `unichat.makemoney2g.com` DNS 已指向 VPS
- GitHub 仓库 `Jxrory/UniChat`，你有 admin 权限

---

## 一、服务器初始化

### 1.1 创建运行用户

```bash
sudo useradd -r -s /bin/bash -m -d /opt/unichat unichat
```

### 1.2 部署目录与代码

```bash
sudo -u unichat git clone git@github.com:Jxrory/UniChat.git /opt/unichat
cd /opt/unichat
sudo -u unichat uv sync --frozen
```

### 1.3 环境变量

```bash
cp /opt/unichat/.env.example /opt/unichat/.env
# 编辑 .env，填入真实值
```

**`.env` 必需的变量：**

| 变量 | 说明 |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram webhook 验证密钥 |
| `WA_PHONE_NUMBER_ID` | WhatsApp Cloud API 号码 ID |
| `WA_TOKEN` | WhatsApp 永久/临时 Token |
| `WA_WEBHOOK_VERIFY_TOKEN` | WhatsApp webhook verify token |
| `AGENTBOT_URL` | AgentBot 服务地址 |
| `AGENTBOT_TOKEN` | AgentBot 认证 Token |
| `ADMIN_TOKEN` | Admin UI 登录密钥 |

可选变量见 `.env.example`。

### 1.4 nginx

```bash
# 复制配置
sudo cp /opt/unichat/deploy/nginx-unichat.conf /etc/nginx/sites-available/unichat

# 启用站点
sudo ln -s /etc/nginx/sites-available/unichat /etc/nginx/sites-enabled/

# 确保 TLS 证书路径正确（nginx.conf 中 ssl_certificate 路径）
# 如果证书在其他位置，编辑 /etc/nginx/sites-available/unichat 修改路径

# 验证并重载
sudo nginx -t && sudo systemctl reload nginx
```

### 1.5 systemd 服务

```bash
sudo cp /opt/unichat/deploy/unichat.service /etc/systemd/system/unichat.service
sudo systemctl daemon-reload
sudo systemctl enable --now unichat
sudo systemctl status unichat
```

### 1.6 验证服务运行

```bash
curl http://127.0.0.1:8000/health

# 预期输出：{"status":"healthy","timestamp":"...","checks":{"database":"ok"}}
```

也通过域名验证：`curl https://unichat.makemoney2g.com/health`

---

## 二、CD 部署用户配置

部署流程通过 SSH 登录 VPS 执行命令。需要一个专门的 deploy 用户，权限仅限于部署所需命令。

### 2.1 创建 deploy 用户（或用现有用户）

可以用已有用户（如 `root`），但**强烈建议**创建一个受限用户：

```bash
sudo useradd -m -s /bin/bash deploy
sudo passwd deploy  # 或 sudo passwd -d deploy 禁用密码
```

### 2.2 配置 SSH 密钥

在**本地机器**生成部署专用密钥对（不要用个人密钥）：

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""
```

将公钥添加到服务器：

```bash
ssh-copy-id -i ~/.ssh/deploy_key deploy@<服务器IP>
```

### 2.3 安装 sudoers 白名单

```bash
# 在服务器上执行
sudo visudo -f /etc/sudoers.d/unichat-deploy < /opt/unichat/deploy/sudoers.unichat
```

如果 `deploy` 用户不是 `deploy`（比如是 `root`），先编辑 `deploy/sudoers.unichat` 把第一行的 `deploy` 改为实际用户名，再复制到服务器执行。

验证白名单生效：

```bash
sudo -l -U deploy
# 应该只显示 allow 的 7 条命令
```

---

## 三、GitHub Secrets 配置

在 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret，添加以下 4 个：

| Secret | 值 |
|---|---|
| `DEPLOY_HOST` | VPS IP 或域名（如 `203.0.113.10`） |
| `DEPLOY_USER` | deploy 用户名（如 `deploy`） |
| `DEPLOY_PORT` | SSH 端口（默认 `22`，选填） |
| `DEPLOY_SSH_KEY` | **私钥内容** (`cat ~/.ssh/deploy_key` 的输出） |

### 使用 SSH config alias（可选）

本地 `deploy/deploy.sh` 支持 SSH config alias。在 `~/.ssh/config` 添加：

```
Host unichat
    HostName 203.0.113.10
    User deploy
    Port 22
    IdentityFile ~/.ssh/deploy_key
```

然后本地部署：

```bash
export DEPLOY_HOST=unichat
./deploy/deploy.sh          # 实际部署
./deploy/deploy.sh --dry-run  # 预览
```

---

## 四、验证 CD 流程

### 4.1 本地测试 SSH 连接

```bash
ssh -i ~/.ssh/deploy_key deploy@<DEPLOY_HOST>
# 登录后测试 sudo 白名单命令：
sudo -u unichat /usr/bin/git -C /opt/unichat status
sudo /usr/bin/systemctl status unichat
```

### 4.2 触发一次部署

推送到 `main` 分支，或手动触发 workflow：

```bash
git push origin feat/whatsapp-channel:main
```

或在 GitHub → Actions → Deploy → Run workflow。

### 4.3 观察 workflow 日志

- 确认 test job 通过
- 确认 deploy job 的 SSH 连接成功
- 确认 health check 拿到 `{"status":"healthy"}`

---

## 五、手动运维

### 重启服务

```bash
sudo systemctl restart unichat
```

### 查看日志

```bash
sudo journalctl -u unichat -f
```

### 部署时不想触发 CI

在 commit message 中包含 `[skip ci]` 或 `[ci skip]`：

```bash
git commit -m "docs: typo fix [skip ci]"
```

### 本地手动部署（不走 GitHub Actions）

```bash
export DEPLOY_HOST=unichat  # SSH config alias
./deploy/deploy.sh
```

---

## 六、故障排查

| 症状 | 可能原因 | 检查 |
|---|---|---|
| workflow 连接超时 | `DEPLOY_HOST` 不对或防火墙 | `ssh deploy@<HOST>` 能否连上 |
| `sudo: no tty present` | sudoers 没配好 | 检查 `/etc/sudoers.d/unichat-deploy` |
| health check 返回 503 | DB 未初始化或服务未启动 | `sudo journalctl -u unichat -n 20` |
| uv sync 失败 | Python 版本不匹配 | `uv run python --version` |
| nginx 502 | unichat 没监听 8000 | `curl http://127.0.0.1:8000/health` |

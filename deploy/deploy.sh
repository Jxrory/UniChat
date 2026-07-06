#!/usr/bin/env bash
set -euo pipefail

# UniChat Deploy Script
# Usage: ./deploy/deploy.sh [--dry-run]
#
# Requires:
#   - SSH access to the target server
#   - sudo -u unichat permission on the server
#
# Environment variables (set in .env or CI):
#   DEPLOY_HOST      — Server hostname/IP or SSH config Host alias
#   DEPLOY_USER      — SSH user (optional; omit to use SSH config alias)
#   DEPLOY_PORT      — SSH port (default: 22)

DRY_RUN=false
if [ "${1:-}" = "--dry-run" ]; then
    DRY_RUN=true
fi

DEPLOY_HOST="${DEPLOY_HOST:?DEPLOY_HOST not set}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
REMOTE_DIR="/opt/unichat"
HEALTH_URL="https://unichat.makemoney2g.com/health"

if [ -n "${DEPLOY_USER:-}" ]; then
    SSH_TARGET="$DEPLOY_USER@$DEPLOY_HOST"
    SSH_CMD="ssh -p $DEPLOY_PORT $SSH_TARGET"
else
    SSH_TARGET="$DEPLOY_HOST (SSH config alias)"
    SSH_CMD="ssh $DEPLOY_HOST"
fi

echo "=== UniChat Deploy ==="
echo "Target: $SSH_TARGET"
echo "Remote dir: $REMOTE_DIR"
echo "Dry run: $DRY_RUN"
echo ""

deploy_cmds() {
    cat <<'SCRIPT'
set -euo pipefail
echo "[remote] Pulling latest code..."
sudo -u unichat /usr/bin/git -C /opt/unichat pull

echo "[remote] Syncing dependencies..."
cd /opt/unichat
sudo -u unichat /usr/bin/uv sync --frozen

echo "[remote] Restarting service..."
sudo /usr/bin/systemctl restart unichat

echo "[remote] Waiting for service to start..."
for i in $(seq 1 12); do
    sleep 5
    if curl -sf http://127.0.0.1:8000/health > /dev/null 2>&1; then
        echo "[remote] Service is healthy"
        exit 0
    fi
    echo "[remote] Waiting... attempt $i/12"
done
echo "[remote] Service failed to start"
exit 1
SCRIPT
}

if [ "$DRY_RUN" = true ]; then
    echo "[DRY RUN] Would execute on $SSH_TARGET:"
    deploy_cmds
    echo ""
    echo "Dry run complete. Run without --dry-run to deploy."
    exit 0
fi

echo "Connecting to $SSH_TARGET ..."
eval "$SSH_CMD" bash < <(deploy_cmds)

echo ""
echo "=== Deploy complete ==="
echo "Checking health endpoint..."
for i in $(seq 1 6); do
    sleep 5
    STATUS=$(curl -sf "$HEALTH_URL" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "")
    if [ "$STATUS" = "healthy" ]; then
        echo "Health check passed!"
        exit 0
    fi
    echo "Waiting... attempt $i/6 status=$STATUS"
done

echo "Health check failed after 30s"
exit 1

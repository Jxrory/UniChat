#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Running E2E tests with Playwright..."

uv run pytest tests/e2e -v -m e2e \
  --tracing on \
  --video on \
  --screenshot only-on-failure \
  --output=test-results/ \
  "$@"

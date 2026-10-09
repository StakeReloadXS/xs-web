#!/bin/bash
# SessionStart hook for Claude Code cloud sessions.
# Installs the Cloudflare CLI (Wrangler) outside the repo, points the layout tests at the
# preinstalled browser, and reports which Cloudflare variables are present.
# Never prints secret values. Test dependencies are installed lazily by scripts/start.sh --test,
# so session start is never blocked by a slow npm install.
set -euo pipefail

# Local sessions are left alone; this only prepares remote containers.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Resolve the repo from this script's own location. Falling back to the current directory
# breaks when the setup runs from elsewhere (for example $HOME), because the helper path
# then points outside the checkout.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

WRANGLER_VERSION="4"
TOOLS_DIR="${XS_WEB_TOOLS_DIR:-$HOME/.cache/xs-web-tools}"
WRANGLER_BIN="$TOOLS_DIR/node_modules/.bin/wrangler"

# Install Wrangler once. The container caches this directory after the hook
# completes, so later sessions skip the download.
if [ ! -x "$WRANGLER_BIN" ]; then
  mkdir -p "$TOOLS_DIR"
  (cd "$TOOLS_DIR" && npm install --no-audit --no-fund --silent "wrangler@${WRANGLER_VERSION}")
fi

# Put Wrangler on PATH for the rest of the session.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$TOOLS_DIR/node_modules/.bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi

echo "wrangler $("$WRANGLER_BIN" --version 2>/dev/null | tail -n 1) installed at $WRANGLER_BIN" >&2

# Point the layout tests at the preinstalled Chromium. CHROMIUM_PATH takes precedence in
# tests/layout.test.js. The helper is shared with scripts/start.sh --test.
TEST_ENV="$REPO_DIR/scripts/test-env.sh"
if [ ! -f "$TEST_ENV" ]; then
  echo "Error: missing $TEST_ENV; the session hook cannot locate the test helpers." >&2
  exit 1
fi
# shellcheck source=../scripts/test-env.sh
source "$TEST_ENV"
if [ -z "${CHROMIUM_PATH:-}" ]; then
  preinstalled="$(xs_find_chromium || true)"
  if [ -n "$preinstalled" ] && [ -x "$preinstalled" ]; then
    if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
      echo "export CHROMIUM_PATH=\"$preinstalled\"" >> "$CLAUDE_ENV_FILE"
    fi
  else
    echo "Warning: no preinstalled Chromium found under /opt/pw-browsers; layout tests may need 'npx playwright install chromium'." >&2
  fi
fi

if [ ! -d "$REPO_DIR/tests/node_modules" ]; then
  echo "Hint: layout test dependencies are not installed yet. Run scripts/start.sh --test to install and run them." >&2
fi

# Report presence and length only, never values.
missing=0
for v in CF_TOKEN CLOUDFLARE_TOKEN CF_ACCOUNT_ID CF_ZONE_ID; do
  val="${!v:-}"
  if [ -n "$val" ]; then
    echo "env $v: set (length ${#val})" >&2
  else
    echo "env $v: UNSET" >&2
    missing=1
  fi
done

if [ "$missing" -eq 1 ]; then
  echo "Warning: some Cloudflare variables are unset; the apex fix script will refuse to run until they are set." >&2
fi

exit 0

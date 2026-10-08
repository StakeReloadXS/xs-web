#!/bin/bash
# SessionStart hook for Claude Code cloud sessions.
# Installs the Cloudflare CLI (Wrangler) outside the repo and reports which
# Cloudflare variables are present. Never prints secret values.
set -euo pipefail

# Local sessions are left alone; this only prepares remote containers.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

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

# Point the layout tests at the Chromium preinstalled in the container. The lockfile's
# Playwright version can expect a different browser build that is not installed here,
# so launching the default browser fails. CHROMIUM_PATH takes precedence in tests/layout.test.js.
if [ -z "${CHROMIUM_PATH:-}" ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  preinstalled="$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | sort -V | tail -1 || true)"
  if [ -n "$preinstalled" ] && [ -x "$preinstalled" ]; then
    echo "export CHROMIUM_PATH=\"$preinstalled\"" >> "$CLAUDE_ENV_FILE"
  fi
fi

# Install the layout test dependencies so `npm test` in tests/ runs on the first try.
# Reinstall whenever the lockfile changes, not only when node_modules is missing.
# The timeout stops a slow registry from blocking session start.
REPO_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
LOCK="$REPO_DIR/tests/package-lock.json"
STAMP="$REPO_DIR/tests/node_modules/.lock-sha256"
if [ -f "$LOCK" ]; then
  lock_sha="$(sha256sum "$LOCK" | cut -d' ' -f1)"
  if [ ! -f "$STAMP" ] || [ "$(cat "$STAMP")" != "$lock_sha" ]; then
    if (cd "$REPO_DIR/tests" && timeout 300 npm ci --no-audit --no-fund --silent); then
      echo "$lock_sha" > "$STAMP"
    else
      echo "Warning: tests/ dependencies failed to install; run 'npm ci' in tests/ manually." >&2
    fi
  fi
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

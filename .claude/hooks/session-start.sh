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

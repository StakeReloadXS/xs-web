#!/usr/bin/env bash
# Local launcher for the storefront.
#
#   scripts/start.sh            serve the site at http://localhost:${PORT:-8000}
#   scripts/start.sh --test     run the layout tests in tests/ (installs them once)
#
# The site has no build step: it is served as-is by Python's built-in HTTP server.
# Nothing here touches Cloudflare or any remote resource.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-8000}"

if [[ "${1:-}" == "--test" ]]; then
  command -v node >/dev/null || { echo "node is required for the tests" >&2; exit 1; }
  cd "$ROOT/tests"
  # npm ci installs exactly what package-lock.json pins, matching the session hook.
  [ -d node_modules ] || npm ci --no-audit --no-fund
  # tests/layout.test.js uses CHROMIUM_PATH when set; otherwise it uses Playwright's own Chromium.
  npm test
  exit $?
fi

command -v python3 >/dev/null || { echo "python3 is required to serve the site" >&2; exit 1; }

echo "Serving $ROOT at http://localhost:$PORT (Ctrl+C to stop)"
cd "$ROOT"
exec python3 -m http.server "$PORT"

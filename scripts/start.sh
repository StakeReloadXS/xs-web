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
  [ -d node_modules ] || npm install --no-audit --no-fund
  # Playwright browsers are only downloaded if missing; set CHROMIUM_PATH to reuse an existing Chromium.
  npm test
  exit $?
fi

command -v python3 >/dev/null || { echo "python3 is required to serve the site" >&2; exit 1; }

echo "Serving $ROOT at http://localhost:$PORT (Ctrl+C to stop)"
cd "$ROOT"
exec python3 -m http.server "$PORT"

#!/usr/bin/env bash
# Local launcher for the storefront.
#
#   scripts/start.sh            serve the site at http://localhost:${PORT:-8000}
#   scripts/start.sh --test     install tests/ dependencies if the lockfile changed, then run the tests
#
# The site has no build step: it is served as-is by Python's built-in HTTP server.
# Nothing here touches Cloudflare or any remote resource.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-8000}"

if [[ "${1:-}" == "--test" ]]; then
  command -v node >/dev/null || { echo "node is required for the tests" >&2; exit 1; }
  # shellcheck source=test-env.sh
  source "$ROOT/scripts/test-env.sh"
  xs_ensure_test_deps "$ROOT" || { echo "tests/ dependencies failed to install; run 'npm ci' in tests/ to see why." >&2; exit 1; }
  # Use the preinstalled browser unless the caller chose one. The lockfile's Playwright
  # version can expect a browser build that is not installed in every environment.
  if [ -z "${CHROMIUM_PATH:-}" ]; then
    CHROMIUM_PATH="$(xs_find_chromium)"
    export CHROMIUM_PATH
  fi
  cd "$ROOT/tests"
  # exec, so npm's exit status is the script's exit status.
  exec npm test
fi

command -v python3 >/dev/null || { echo "python3 is required to serve the site" >&2; exit 1; }

echo "Serving $ROOT at http://localhost:$PORT (Ctrl+C to stop)"
cd "$ROOT"
exec python3 -m http.server "$PORT"

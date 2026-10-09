#!/usr/bin/env bash
# Behavior tests for .claude/hooks/session-start.sh.
#
#   scripts/tests/session-start.test.sh
#
# Each case runs the hook in a clean environment (env -i) with a stub Wrangler, so nothing is
# downloaded and the real Wrangler cache is never touched. Exits 0 only if every case passes.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HOOK="$ROOT/.claude/hooks/session-start.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/home"

PASS=0
FAIL=0
pass() { PASS=$((PASS + 1)); echo "ok - $1"; }
fail() { FAIL=$((FAIL + 1)); echo "not ok - $1"; [ -n "${2:-}" ] && echo "    $2"; return 0; }

# make_wrangler <tools-dir>: a stub Wrangler, so the hook skips its npm install.
make_wrangler() {
  mkdir -p "$1/node_modules/.bin"
  printf '#!/bin/sh\necho "4.0.0-test"\n' > "$1/node_modules/.bin/wrangler"
  chmod +x "$1/node_modules/.bin/wrangler"
}

# run <cwd> <hook> [VAR=value ...]: runs the hook in a clean environment.
# Sets OUT (stdout and stderr) and RC (exit status).
run() {
  local cwd=$1 hook=$2
  shift 2
  OUT="$(cd "$cwd" && env -i PATH="$PATH" HOME="$TMP/home" "$@" bash "$hook" 2>&1)"
  RC=$?
}

# make_fake_repo <dir>: a copy of the hook in a throwaway repo with a stub browser helper,
# so the Chromium branches can be exercised without depending on /opt/pw-browsers.
make_fake_repo() {
  mkdir -p "$1/.claude/hooks" "$1/scripts"
  cp "$HOOK" "$1/.claude/hooks/session-start.sh"
  cat > "$1/scripts/test-env.sh" <<'EOF'
# Stub helper: reports the browser named by FAKE_CHROME, if any.
xs_find_chromium() { if [ -n "${FAKE_CHROME:-}" ]; then echo "$FAKE_CHROME"; fi; }
EOF
}

# 1. Regression: running from outside the checkout with CLAUDE_PROJECT_DIR unset used to
#    source /<cwd>/scripts/test-env.sh and fail with exit 1.
t="setup run from \$HOME without CLAUDE_PROJECT_DIR exits 0"
make_wrangler "$TMP/t1-tools"
run "$TMP/home" "$HOOK" CLAUDE_CODE_REMOTE=true XS_WEB_TOOLS_DIR="$TMP/t1-tools"
if [ "$RC" -eq 0 ] && [[ "$OUT" == *"installed at"* ]]; then pass "$t"; else fail "$t" "rc=$RC: $OUT"; fi

# 2. The repo is found from the hook's own location, so a wrong CLAUDE_PROJECT_DIR is ignored.
t="wrong CLAUDE_PROJECT_DIR does not break the hook"
mkdir -p "$TMP/elsewhere"
make_wrangler "$TMP/t2-tools"
run "$TMP/home" "$HOOK" CLAUDE_CODE_REMOTE=true XS_WEB_TOOLS_DIR="$TMP/t2-tools" CLAUDE_PROJECT_DIR="$TMP/elsewhere"
if [ "$RC" -eq 0 ]; then pass "$t"; else fail "$t" "rc=$RC: $OUT"; fi

# 3. A missing helper fails with a clear message, not a bare shell error.
t="missing scripts/test-env.sh fails with a clear message"
make_fake_repo "$TMP/t3-repo"
rm "$TMP/t3-repo/scripts/test-env.sh"
make_wrangler "$TMP/t3-tools"
run "$TMP/home" "$TMP/t3-repo/.claude/hooks/session-start.sh" CLAUDE_CODE_REMOTE=true XS_WEB_TOOLS_DIR="$TMP/t3-tools"
if [ "$RC" -eq 1 ] && [[ "$OUT" == *"missing "*"scripts/test-env.sh"* ]]; then pass "$t"; else fail "$t" "rc=$RC: $OUT"; fi

# 4. Outside a remote session the hook does nothing: no output, no install, no env writes.
t="local run (CLAUDE_CODE_REMOTE unset) is a no-op"
envf="$TMP/t4.env"
run "$TMP/home" "$HOOK" XS_WEB_TOOLS_DIR="$TMP/t4-tools" CLAUDE_ENV_FILE="$envf"
if [ "$RC" -eq 0 ] && [ -z "$OUT" ] && [ ! -e "$TMP/t4-tools" ] && [ ! -e "$envf" ]; then
  pass "$t"
else
  fail "$t" "rc=$RC out=$OUT"
fi

# 5. CLAUDE_ENV_FILE is optional: the hook runs without it and writes nothing.
t="remote run without CLAUDE_ENV_FILE exits 0"
make_wrangler "$TMP/t5-tools"
run "$TMP/home" "$HOOK" CLAUDE_CODE_REMOTE=true XS_WEB_TOOLS_DIR="$TMP/t5-tools"
if [ "$RC" -eq 0 ] && [[ "$OUT" != *"export "* ]]; then pass "$t"; else fail "$t" "rc=$RC: $OUT"; fi

# 6. Wrangler is installed once, then reused by later sessions.
t="Wrangler installs once and is reused"
mkdir -p "$TMP/t6-bin"
cat > "$TMP/t6-bin/npm" <<'EOF'
#!/bin/sh
echo install >> "$NPM_LOG"
mkdir -p node_modules/.bin
printf '#!/bin/sh\necho "4.0.0-test"\n' > node_modules/.bin/wrangler
chmod +x node_modules/.bin/wrangler
EOF
chmod +x "$TMP/t6-bin/npm"
log="$TMP/t6.log"
for _ in 1 2; do
  run "$TMP/home" "$HOOK" CLAUDE_CODE_REMOTE=true XS_WEB_TOOLS_DIR="$TMP/t6-tools" NPM_LOG="$log" "PATH=$TMP/t6-bin:$PATH"
done
installs=$(wc -l < "$log" 2>/dev/null || echo 0)
if [ "$RC" -eq 0 ] && [ "$installs" -eq 1 ]; then pass "$t"; else fail "$t" "rc=$RC installs=$installs: $OUT"; fi

# 7. Chromium: CHROMIUM_PATH takes precedence, a found browser is exported, and a missing one warns.
t="CHROMIUM_PATH already set: hook does not export a browser"
make_fake_repo "$TMP/t7a-repo"; make_wrangler "$TMP/t7a-tools"
chrome="$TMP/t7-chrome"; printf '#!/bin/sh\n' > "$chrome"; chmod +x "$chrome"
envf="$TMP/t7a.env"
run "$TMP/home" "$TMP/t7a-repo/.claude/hooks/session-start.sh" CLAUDE_CODE_REMOTE=true \
  XS_WEB_TOOLS_DIR="$TMP/t7a-tools" CLAUDE_ENV_FILE="$envf" CHROMIUM_PATH=/already/set FAKE_CHROME="$chrome"
if [ "$RC" -eq 0 ] && ! grep -qs CHROMIUM_PATH "$envf"; then pass "$t"; else fail "$t" "rc=$RC"; fi

t="browser found and CHROMIUM_PATH unset: hook exports it"
make_fake_repo "$TMP/t7b-repo"; make_wrangler "$TMP/t7b-tools"
envf="$TMP/t7b.env"
run "$TMP/home" "$TMP/t7b-repo/.claude/hooks/session-start.sh" CLAUDE_CODE_REMOTE=true \
  XS_WEB_TOOLS_DIR="$TMP/t7b-tools" CLAUDE_ENV_FILE="$envf" FAKE_CHROME="$chrome"
if [ "$RC" -eq 0 ] && grep -qF "export CHROMIUM_PATH=\"$chrome\"" "$envf"; then pass "$t"; else fail "$t" "rc=$RC: $OUT"; fi

t="no browser found: hook warns and still exits 0"
make_fake_repo "$TMP/t7c-repo"; make_wrangler "$TMP/t7c-tools"
envf="$TMP/t7c.env"
run "$TMP/home" "$TMP/t7c-repo/.claude/hooks/session-start.sh" CLAUDE_CODE_REMOTE=true \
  XS_WEB_TOOLS_DIR="$TMP/t7c-tools" CLAUDE_ENV_FILE="$envf"
if [ "$RC" -eq 0 ] && [[ "$OUT" == *"no preinstalled Chromium found"* ]] && ! grep -qs CHROMIUM_PATH "$envf"; then
  pass "$t"
else
  fail "$t" "rc=$RC: $OUT"
fi

# 8. Cloudflare variables are reported by presence and length only, never by value.
t="Cloudflare variables are reported without their values"
make_wrangler "$TMP/t8-tools"
secret="s3cr3t-value-123"
run "$TMP/home" "$HOOK" CLAUDE_CODE_REMOTE=true XS_WEB_TOOLS_DIR="$TMP/t8-tools" CF_TOKEN="$secret"
if [ "$RC" -eq 0 ] && [[ "$OUT" == *"env CF_TOKEN: set (length ${#secret})"* ]] && [[ "$OUT" != *"$secret"* ]]; then
  pass "$t"
else
  fail "$t" "rc=$RC: $OUT"
fi

echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]

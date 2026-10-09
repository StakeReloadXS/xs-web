# Shared helpers for running the layout tests in tests/. Sourced, not executed.
#
#   xs_find_chromium            prints the newest preinstalled Chromium, or nothing
#   xs_ensure_test_deps ROOT    installs tests/ with npm ci when the lockfile changed
#
# Both are used by scripts/start.sh --test and by the Claude Code session hook.

# Playwright's own browser folders are chromium-<build>. The headless shell is a separate
# folder and is excluded on purpose, because the layout tests need the full browser.
xs_find_chromium() {
  find /opt/pw-browsers -maxdepth 4 -type f -name chrome -path '*/chromium-[0-9]*/*' 2>/dev/null \
    | sort -V | tail -n 1
}

# The stamp records the lockfile hash that node_modules was installed from. A changed
# package-lock.json therefore triggers a reinstall, and an interrupted install leaves
# no stamp, so the next run tries again.
xs_ensure_test_deps() {
  local root=$1
  local lock="$root/tests/package-lock.json"
  local stamp="$root/tests/node_modules/.lock-sha256"
  [ -f "$lock" ] || return 0
  local sha
  sha="$(sha256sum "$lock" | cut -d' ' -f1)"
  if [ -f "$stamp" ] && [ "$(cat "$stamp")" = "$sha" ]; then
    return 0
  fi
  if (cd "$root/tests" && timeout 300 npm ci --no-audit --no-fund --silent); then
    echo "$sha" > "$stamp"
  else
    return 1
  fi
}

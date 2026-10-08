// Guards two things that drift silently: the Cloudflare deploy allowlist and the
// FAQ structured data. Both are checked against the files they describe, so a
// new page or an edited answer fails here instead of 404-ing or diverging in production.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("every root HTML page is in the deploy allowlist", () => {
  const workflow = read(".github/workflows/deploy-cloudflare.yml");
  // The allowlist is the `cp -r` command in the "Stage public site" step, which
  // continues over lines ending in a backslash and ends at `_site/`.
  const match = workflow.match(/cp -r\s+([\s\S]*?)_site\//);
  assert.ok(match, "could not find the cp -r allowlist in deploy-cloudflare.yml");
  const listed = new Set(match[1].replace(/\\\n/g, " ").trim().split(/\s+/));

  const rootPages = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
  assert.ok(rootPages.length > 0, "no root HTML pages found");
  const missing = rootPages.filter((f) => !listed.has(f));
  assert.deepEqual(missing, [], `root pages missing from the deploy allowlist: ${missing.join(", ")}`);
});

test("every entry in the deploy allowlist exists in the repo", () => {
  const workflow = read(".github/workflows/deploy-cloudflare.yml");
  const match = workflow.match(/cp -r\s+([\s\S]*?)_site\//);
  const listed = match[1].replace(/\\\n/g, " ").trim().split(/\s+/);
  const dead = listed.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  assert.deepEqual(dead, [], `allowlist entries that do not exist: ${dead.join(", ")}`);
});

test("support.html FAQ structured data matches the visible FAQ", () => {
  const html = read("support.html");

  const visible = [...html.matchAll(/<details><summary>([^<]+)<\/summary><p class="muted">([^<]+)<\/p><\/details>/g)]
    .map((m) => ({ name: m[1].trim(), text: m[2].trim() }));
  assert.ok(visible.length > 0, "no visible FAQ entries found in support.html");

  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ld, "support.html has no FAQPage JSON-LD block");
  const data = JSON.parse(ld[1]);
  assert.equal(data["@type"], "FAQPage");
  const structured = data.mainEntity.map((q) => ({ name: q.name, text: q.acceptedAnswer.text }));

  assert.deepEqual(structured, visible, "FAQ JSON-LD has drifted from the visible FAQ");
});

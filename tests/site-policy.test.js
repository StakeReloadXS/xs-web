// Guards two things that drift silently: the Cloudflare deploy allowlist and the
// FAQ structured data. Both are checked against the files they describe, so a
// new page or an edited answer fails here instead of 404-ing or diverging in production.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

// The allowlist is the `cp -r` command in the "Stage public site" step. It continues over
// lines ending in a backslash, may use CRLF line endings, and ends at `_site/`.
function deployAllowlist() {
  const workflow = read(".github/workflows/deploy-cloudflare.yml").replace(/\r\n/g, "\n");
  const match = workflow.match(/cp -r\s+([\s\S]*?)_site\//);
  assert.ok(match, "could not find the `cp -r ... _site/` allowlist in deploy-cloudflare.yml; update tests/site-policy.test.js if the staging step changed");
  return match[1].replace(/\\\n/g, " ").trim().split(/\s+/).filter(Boolean);
}

// Decode the entities that can appear in visible text, and strip inline markup, so the
// comparison is between text the visitor reads and text the structured data states.
const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#x27;": "'" };
function plainText(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|#x27);/g, (e) => ENTITIES[e])
    .replace(/\s+/g, " ")
    .trim();
}

test("every root HTML page is in the deploy allowlist", () => {
  const listed = new Set(deployAllowlist());
  const rootPages = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
  assert.ok(rootPages.length > 0, "no root HTML pages found");
  const missing = rootPages.filter((f) => !listed.has(f));
  assert.deepEqual(missing, [], `root pages missing from the deploy allowlist: ${missing.join(", ")}`);
});

test("every entry in the deploy allowlist exists in the repo", () => {
  const dead = deployAllowlist().filter((f) => !fs.existsSync(path.join(ROOT, f)));
  assert.deepEqual(dead, [], `allowlist entries that do not exist: ${dead.join(", ")}`);
});

test("support.html FAQ structured data matches the visible FAQ", () => {
  const html = read("support.html");

  // Each entry is a <details> with one <summary> (the question) and one answer element.
  // Matching across lines and tolerating inline markup avoids false failures on reformatting.
  const visible = [...html.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/details>/g)]
    .map((m) => ({ name: plainText(m[1]), text: plainText(m[2]) }));
  assert.ok(visible.length > 0, "no visible FAQ entries found in support.html");

  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ld, "support.html has no FAQPage JSON-LD block");
  const data = JSON.parse(ld[1]);
  assert.equal(data["@type"], "FAQPage");
  const structured = data.mainEntity.map((q) => ({ name: plainText(q.name), text: plainText(q.acceptedAnswer.text) }));

  assert.deepEqual(structured, visible, "FAQ JSON-LD has drifted from the visible FAQ");
});

// Responsive layout + canonical-design tests. Run: cd tests && npm install && npm test
// Uses Playwright's Chromium (set CHROMIUM_PATH to use a specific binary).
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const PAGES = ["/", "/products.html", "/order.html", "/success.html", "/offers.html", "/team.html", "/support.html"];
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

// Phones, tablets and desktops, portrait and landscape.
const VIEWPORTS = [
  { name: "iPhone SE portrait", width: 320, height: 568, touch: true },
  { name: "Galaxy S portrait", width: 360, height: 740, touch: true },
  { name: "iPhone 14 portrait", width: 390, height: 844, touch: true },
  { name: "Pixel 7 portrait", width: 412, height: 915, touch: true },
  { name: "iPhone SE landscape", width: 568, height: 320, touch: true },
  { name: "iPhone 14 landscape", width: 844, height: 390, touch: true },
  { name: "iPad portrait", width: 768, height: 1024, touch: true },
  { name: "iPad landscape", width: 1024, height: 768, touch: true },
  { name: "iPad Pro portrait", width: 1024, height: 1366, touch: true },
  { name: "Laptop", width: 1280, height: 800, touch: false },
  { name: "Desktop", width: 1440, height: 900, touch: false },
  { name: "Full HD", width: 1920, height: 1080, touch: false },
  { name: "QHD", width: 2560, height: 1440, touch: false }
];
const MOBILE_NAV_MAX = 899; // matches the 56.25em breakpoint in site.css

let server, browser, base;

before(async () => {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
});
after(async () => { await browser?.close(); server?.close(); });

async function open(vp, url, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: vp.touch, isMobile: vp.touch, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const problems = [];
  // Third-party hosts (fonts, chat, video) are blocked so tests are hermetic.
  await page.route((u) => !u.href.startsWith(base), (r) => r.abort());
  page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
  page.on("response", (r) => { if (r.url().startsWith(base) && r.status() >= 400) problems.push(`HTTP ${r.status()} ${r.url()}`); });
  if (opts.seed) await page.addInitScript((s) => localStorage.setItem("xs-cart", s), opts.seed);
  await page.goto(base + url, { waitUntil: "load" });
  await page.waitForSelector("[data-site-header] .brand");
  return { ctx, page, problems };
}

for (const vp of VIEWPORTS) {
  for (const url of PAGES) {
    test(`${vp.name} ${vp.width}x${vp.height} ${url}`, async () => {
      const { ctx, page, problems } = await open(vp, url);
      try {
        if (url === "/" || url === "/products.html") await page.waitForSelector("#product-grid .card");

        // 1. No horizontal scrolling and nothing poking out of the viewport.
        const m = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const offenders = [];
          document.querySelectorAll("body *").forEach((el) => {
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.visibility === "hidden" || el.closest("[hidden]")) return;
            if (el.closest(".site-nav") && !el.closest(".site-nav.open") && getComputedStyle(el.closest(".site-nav")).display === "none") return;
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return;
            if (r.right > vw + 1 || r.left < -1) offenders.push(`${el.tagName.toLowerCase()}.${el.className} [${Math.round(r.left)},${Math.round(r.right)}]`);
          });
          return { vw, scrollW: document.documentElement.scrollWidth, offenders: offenders.slice(0, 5) };
        });
        assert.ok(m.scrollW <= m.vw, `horizontal overflow: scrollWidth ${m.scrollW} > ${m.vw}`);
        assert.deepEqual(m.offenders, [], "elements outside the viewport");

        // 2. Canonical chrome: one h1, header, nav, footer, canonical link, lang, viewport.
        const c = await page.evaluate(() => ({
          h1: document.querySelectorAll("h1").length,
          header: !!document.querySelector(".site-header .brand"),
          footer: !!document.querySelector(".site-footer .copyright"),
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          lang: document.documentElement.lang,
          viewport: document.querySelector('meta[name="viewport"]')?.content,
          desc: !!document.querySelector('meta[name="description"]')
        }));
        assert.equal(c.h1, 1, "exactly one h1");
        assert.ok(c.header && c.footer, "shared header and footer rendered");
        assert.equal(new URL(c.canonical).origin, "https://stakereloadxs.com");
        assert.equal(c.lang, "en");
        assert.match(c.viewport, /width=device-width/);
        assert.ok(c.desc, "meta description");

        // 3. Navigation is reachable: inline links on wide screens, a working menu on narrow ones.
        if (vp.width <= MOBILE_NAV_MAX) {
          assert.ok(await page.locator(".nav-toggle").isVisible(), "menu button visible");
          assert.ok(!(await page.locator(".site-nav").isVisible()), "menu closed initially");
          await page.click(".nav-toggle");
          assert.ok(await page.locator(".site-nav").isVisible(), "menu opens");
          assert.equal(await page.getAttribute(".nav-toggle", "aria-expanded"), "true");
          const nb = await page.evaluate(() => { const r = document.querySelector(".site-nav").getBoundingClientRect(); return { bottom: r.bottom, vh: innerHeight }; });
          assert.ok(nb.bottom <= nb.vh + 1 || (await page.evaluate(() => { const n = document.querySelector(".site-nav"); return n.scrollHeight > n.clientHeight && getComputedStyle(n).overflowY === "auto"; })), "open menu fits or scrolls");
          await page.keyboard.press("Escape");
          assert.ok(!(await page.locator(".site-nav").isVisible()), "Escape closes menu");
        } else {
          assert.ok(!(await page.locator(".nav-toggle").isVisible()), "no menu button on wide screens");
          assert.equal(await page.locator(".site-nav a:visible").count(), 6, "all six nav links visible inline");
        }

        // 4. Content is readable: h1 inside viewport width, body text >= 14px, tap targets >= 44px on touch.
        const q = await page.evaluate((touch) => {
          const h1 = document.querySelector("h1").getBoundingClientRect();
          const small = [];
          document.querySelectorAll("main p, main li, main a, main button, .site-footer a").forEach((el) => {
            if (!el.offsetParent) return;
            if (parseFloat(getComputedStyle(el).fontSize) < 14) small.push(el.textContent.trim().slice(0, 30));
          });
          const tiny = [];
          if (touch) document.querySelectorAll("a.btn, button, .site-nav a:not([hidden]), .site-footer li a, input, select, textarea").forEach((el) => {
            if (!el.offsetParent) return;
            const r = el.getBoundingClientRect();
            if (r.height < 43.5) tiny.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.name || "").trim().slice(0, 20)}" h=${Math.round(r.height)}`);
          });
          return { h1Left: h1.left, h1Right: h1.right, vw: document.documentElement.clientWidth, small, tiny };
        }, vp.touch);
        assert.ok(q.h1Left >= 0 && q.h1Right <= q.vw + 1, "h1 within viewport");
        assert.deepEqual(q.small, [], "text smaller than 14px");
        assert.deepEqual(q.tiny, [], "touch targets smaller than 44px");

        // 5. Images have loaded and respect their container; the footer sits at/below the fold on short pages.
        const imgs = await page.evaluate(async () => {
          const bad = [];
          for (const i of document.querySelectorAll("img")) {
            if (i.loading === "lazy") i.loading = "eager";
            if (!i.complete) await new Promise((r) => { i.onload = i.onerror = r; });
            if (!i.naturalWidth) bad.push(i.getAttribute("src"));
          }
          return bad;
        });
        assert.deepEqual(imgs, [], "broken images");
        const f = await page.evaluate(() => { const r = document.querySelector(".site-footer").getBoundingClientRect(); return { bottom: r.bottom + scrollY, vh: innerHeight }; });
        assert.ok(f.bottom >= f.vh - 1, "footer reaches the bottom of the viewport");

        assert.deepEqual(problems, [], "page errors / failed local requests");
      } finally { await ctx.close(); }
    });
  }
}

// Behaviour: the cart flow works at the narrowest phone and on desktop.
for (const vp of [VIEWPORTS[0], VIEWPORTS[5], VIEWPORTS[9]]) {
  test(`order flow ${vp.name}`, async () => {
    const { ctx, page, problems } = await open(vp, "/products.html");
    try {
      await page.waitForSelector("[data-add]");
      await page.click('[data-add="xs-credits-50k"]');
      await page.click('[data-add="new-xsid"]');
      assert.equal(await page.locator("[data-cart-count]").first().textContent(), "2");
      await page.goto(base + "/order.html");
      await page.waitForSelector("[data-inc]");
      assert.equal(await page.textContent("[data-total]"), "$55.00");
      await page.click('[data-inc="new-xsid"]');
      assert.equal(await page.textContent("[data-total]"), "$60.00");
      await page.fill("[name=name]", "Test User");
      await page.fill("[name=contact]", "@tester");
      await page.click("[type=submit]");
      await page.waitForURL(/success\.html/);
      assert.match(await page.textContent("[data-ref]"), /^XS-/);
      assert.ok(await page.locator("[data-summary]").isVisible());
      assert.match(await page.textContent("[data-summary]"), /2 x New XSID Setup/);
      assert.deepEqual(problems, []);
    } finally { await ctx.close(); }
  });
}

test("empty order disables submit and the layout still fits at 320px", async () => {
  const { ctx, page } = await open(VIEWPORTS[0], "/order.html");
  try {
    await page.waitForSelector("[data-lines] .muted");
    assert.ok(await page.locator("[type=submit]").isDisabled());
  } finally { await ctx.close(); }
});

test("rotating a phone keeps the menu usable (portrait -> landscape)", async () => {
  const { ctx, page } = await open({ width: 390, height: 844, touch: true }, "/");
  try {
    await page.click(".nav-toggle");
    await page.setViewportSize({ width: 844, height: 390 });
    assert.ok(await page.locator(".nav-toggle").isVisible());
    const fits = await page.evaluate(() => { const n = document.querySelector(".site-nav"); return n.scrollHeight <= n.clientHeight || getComputedStyle(n).overflowY === "auto"; });
    assert.ok(fits, "menu scrolls when taller than the landscape viewport");
    await page.setViewportSize({ width: 1280, height: 800 });
    assert.ok(!(await page.locator(".nav-toggle").isVisible()));
    assert.equal(await page.locator(".site-nav a:visible").count(), 6);
  } finally { await ctx.close(); }
});

test("every page has a unique title and canonical URL", async () => {
  const seen = new Set();
  for (const url of PAGES) {
    const { ctx, page } = await open(VIEWPORTS[9], url);
    try {
      const key = (await page.title()) + "|" + (await page.getAttribute('link[rel="canonical"]', "href"));
      assert.ok(!seen.has(key), "duplicate title/canonical: " + key);
      seen.add(key);
    } finally { await ctx.close(); }
  }
});

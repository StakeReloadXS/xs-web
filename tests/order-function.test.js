// Unit tests for functions/api/order.js with a mocked D1 and static assets.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const products = fs.readFileSync(path.join(ROOT, "data/products.json"), "utf8");

async function load() { return import(path.join(ROOT, "functions/api/order.js")); }

function env({ failInsert } = {}) {
  const rows = [];
  return {
    rows,
    DB: { prepare: () => ({ bind: (...a) => ({ run: async () => {
      if (failInsert) throw new Error(failInsert);
      if (rows.some((r) => r[0] === a[0])) throw new Error("UNIQUE constraint failed: orders.reference");
      rows.push(a);
    } }) }) },
    ASSETS: { fetch: async () => new Response(products, { headers: { "Content-Type": "application/json" } }) }
  };
}
const req = (body, headers = { "Content-Type": "application/json" }) =>
  new Request("https://stakereloadxs.com/api/order", { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) });
const good = () => ({ reference: "XS-ABC123-ZZ9Y", name: "Test", contactMethod: "Telegram", contact: "@tester", notes: "", items: [{ id: "xs-credits-50k", quantity: 2 }] });

test("stores a valid order and recomputes the total from the catalog", async () => {
  const { onRequestPost } = await load(); const e = env();
  const body = { ...good(), total: 0.01, items: [{ id: "xs-credits-50k", quantity: 2, unitPrice: 0.01 }] };
  const res = await onRequestPost({ request: req(body), env: e });
  assert.equal(res.status, 200);
  const out = await res.json();
  assert.equal(out.total, 100);
  assert.equal(e.rows.length, 1);
  assert.equal(JSON.parse(e.rows[0][6])[0].unitPrice, 50);
});

test("a retried submit with the same reference is accepted once", async () => {
  const { onRequestPost } = await load(); const e = env();
  await onRequestPost({ request: req(good()), env: e });
  const res = await onRequestPost({ request: req(good()), env: e });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).duplicate, true);
  assert.equal(e.rows.length, 1);
});

for (const [label, mutate, status] of [
  ["unknown product", (b) => { b.items = [{ id: "nope", quantity: 1 }]; }, 400],
  ["zero quantity", (b) => { b.items[0].quantity = 0; }, 400],
  ["fractional quantity", (b) => { b.items[0].quantity = 1.5; }, 400],
  ["huge quantity", (b) => { b.items[0].quantity = 1000; }, 400],
  ["empty cart", (b) => { b.items = []; }, 400],
  ["bad reference", (b) => { b.reference = "hello"; }, 400],
  ["missing name", (b) => { b.name = " "; }, 400],
  ["bad contact method", (b) => { b.contactMethod = "Fax"; }, 400],
  ["bad email", (b) => { b.contactMethod = "Email"; b.contact = "nope"; }, 400]
]) {
  test(`rejects ${label}`, async () => {
    const { onRequestPost } = await load(); const e = env(); const b = good(); mutate(b);
    const res = await onRequestPost({ request: req(b), env: e });
    assert.equal(res.status, status);
    assert.equal(e.rows.length, 0);
  });
}

test("rejects non-JSON, invalid JSON and oversized bodies", async () => {
  const { onRequestPost } = await load();
  assert.equal((await onRequestPost({ request: req("x", { "Content-Type": "text/plain" }), env: env() })).status, 415);
  assert.equal((await onRequestPost({ request: req("{nope"), env: env() })).status, 400);
  assert.equal((await onRequestPost({ request: req({ ...good(), notes: "x".repeat(11000) }), env: env() })).status, 413);
});

test("503 when the D1 binding is missing, 500 when the insert fails, 405 for other methods", async () => {
  const { onRequestPost, onRequest } = await load();
  const e = env(); delete e.DB;
  assert.equal((await onRequestPost({ request: req(good()), env: e })).status, 503);
  assert.equal((await onRequestPost({ request: req(good()), env: env({ failInsert: "disk" }) })).status, 500);
  assert.equal(onRequest().status, 405);
});

test("Telegram notification is best effort", async () => {
  const { onRequestPost } = await load(); const e = { ...env(), TELEGRAM_BOT_TOKEN: "t", TELEGRAM_CHAT_ID: "1" };
  const orig = global.fetch; let sent;
  global.fetch = async (url, init) => { sent = { url, body: JSON.parse(init.body) }; throw new Error("network down"); };
  try {
    const res = await onRequestPost({ request: req(good()), env: e });
    assert.equal(res.status, 200);
    assert.match(sent.url, /api\.telegram\.org\/bott\/sendMessage/);
    assert.match(sent.body.text, /2 x 50,000 XS Credits/);
  } finally { global.fetch = orig; }
});

// Boost is set by the whole order total, so items in one order combine toward a tier.
const order = (items) => ({ ...good(), items });
const boostOf = async (items) => {
  const { onRequestPost } = await load();
  const res = await onRequestPost({ request: req(order(items)), env: env() });
  return (await res.json()).boostPercent;
};

test("a single $50 pack gets no boost", async () => {
  assert.equal(await boostOf([{ id: "xs-credits-50k", quantity: 1 }]), 0);
});

test("items in one order combine toward a boost tier", async () => {
  // $50 + $100 = $150, which reaches the $100 tier and not the $200 tier.
  assert.equal(await boostOf([{ id: "xs-credits-50k", quantity: 1 }, { id: "xs-credits-100k", quantity: 1 }]), 5);
});

test("tier minimums are inclusive and the highest reached tier applies", async () => {
  assert.equal(await boostOf([{ id: "xs-credits-200k", quantity: 1 }]), 10);
  assert.equal(await boostOf([{ id: "xs-credits-500k", quantity: 1 }]), 15);
  assert.equal(await boostOf([{ id: "xs-credits-1m", quantity: 1 }]), 20);
  // $1,000 + $5 is still the top tier, not a tier computed from one item.
  assert.equal(await boostOf([{ id: "xs-credits-1m", quantity: 1 }, { id: "new-xsid", quantity: 1 }]), 20);
});

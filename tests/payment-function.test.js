// Unit tests for functions/api/payment/create.js with mocked static assets and a mocked provider fetch.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const products = fs.readFileSync(path.join(ROOT, "data/products.json"), "utf8");

async function load() { return import(path.join(ROOT, "functions/api/payment/create.js")); }

const CONFIG = { CCPAYMENT_APP_ID: "app-test-id", CCPAYMENT_APP_SECRET: "secret-test-value", CCPAYMENT_API_BASE: "https://sandbox.example.test/" };
function env(overrides = {}) {
  return { ...CONFIG, ASSETS: { fetch: async () => new Response(products, { headers: { "Content-Type": "application/json" } }) }, ...overrides };
}
const req = (body, headers = { "Content-Type": "application/json" }) =>
  new Request("https://stakereloadxs.com/api/payment/create", { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) });
const good = () => ({ reference: "XS-ABC123-ZZ9Y", items: [{ id: "xs-credits-50k", quantity: 2 }] });

// Replaces global fetch with a stub that records the call and returns the given provider reply.
function stubProvider(reply) {
  const calls = [];
  const orig = global.fetch;
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    return typeof reply === "function" ? reply() : new Response(JSON.stringify(reply.body), { status: reply.status || 200, headers: { "Content-Type": "application/json" } });
  };
  return { calls, restore: () => { global.fetch = orig; } };
}

test("503 until app id, app secret and an https API base are all configured", async () => {
  const { onRequestPost } = await load();
  for (const missing of ["CCPAYMENT_APP_ID", "CCPAYMENT_APP_SECRET", "CCPAYMENT_API_BASE"]) {
    const e = env(); delete e[missing];
    const stub = stubProvider({ body: {} });
    try {
      const res = await onRequestPost({ request: req(good()), env: e });
      assert.equal(res.status, 503, `missing ${missing}`);
      assert.equal(stub.calls.length, 0, "no provider call when not configured");
    } finally { stub.restore(); }
  }
  for (const base of ["http://sandbox.example.test", "not a url", "https://sandbox.example.test/?x=1"]) {
    const stub = stubProvider({ body: {} });
    try {
      assert.equal((await onRequestPost({ request: req(good()), env: env({ CCPAYMENT_API_BASE: base }) })).status, 503, base);
      assert.equal(stub.calls.length, 0);
    } finally { stub.restore(); }
  }
});

test("creates a checkout with a recomputed total and returns the payment URL", async () => {
  const { onRequestPost } = await load();
  const stub = stubProvider({ body: { data: { payUrl: "https://pay.example.test/checkout/123" } } });
  try {
    const b = { ...good(), total: 0.01, items: [{ id: "xs-credits-50k", quantity: 2, unitPrice: 0.01 }] };
    const res = await onRequestPost({ request: req(b), env: env() });
    assert.equal(res.status, 200);
    const out = await res.json();
    assert.equal(out.ok, true);
    assert.equal(out.total, 100);
    assert.equal(out.payUrl, "https://pay.example.test/checkout/123");

    assert.equal(stub.calls.length, 1);
    const { url, init } = stub.calls[0];
    assert.equal(url, "https://sandbox.example.test/ccpayment/v2/createPreOrder");
    assert.equal(init.method, "POST");
    assert.equal(init.headers.Appid, CONFIG.CCPAYMENT_APP_ID);
    assert.match(init.headers.Timestamp, /^\d{10}$/);
    const payload = JSON.parse(init.body);
    assert.equal(payload.merchantOrderId, "XS-ABC123-ZZ9Y");
    assert.equal(payload.price, "100.00");
    assert.match(payload.returnUrl, /^https:\/\/stakereloadxs\.com\/success\.html\?ref=XS-ABC123-ZZ9Y$/);
  } finally { stub.restore(); }
});

test("signs appId + timestamp + body with HMAC-SHA256 keyed by the app secret", async () => {
  const { onRequestPost } = await load();
  const stub = stubProvider({ body: { data: { payUrl: "https://pay.example.test/c" } } });
  try {
    await onRequestPost({ request: req(good()), env: env() });
    const { init } = stub.calls[0];
    const expected = crypto.createHmac("sha256", CONFIG.CCPAYMENT_APP_SECRET)
      .update(CONFIG.CCPAYMENT_APP_ID + init.headers.Timestamp + init.body).digest("hex");
    assert.equal(init.headers.Sign, expected);
    assert.ok(!init.body.includes(CONFIG.CCPAYMENT_APP_SECRET), "the secret is never sent in the body");
    assert.ok(!Object.values(init.headers).includes(CONFIG.CCPAYMENT_APP_SECRET), "the secret is never sent in a header");
  } finally { stub.restore(); }
});

test("502 when the provider fails, returns no payment URL, or is unreachable; the provider body is not echoed", async () => {
  const { onRequestPost } = await load();
  const cases = [
    { body: { data: { payUrl: "https://pay.example.test/c" } }, status: 500 },
    { body: { data: {} }, status: 200 },
    { body: { data: { payUrl: "javascript:alert(1)" } }, status: 200 },
    { body: "not json", status: 200 }
  ];
  for (const c of cases) {
    const stub = stubProvider(() => new Response(typeof c.body === "string" ? c.body : JSON.stringify(c.body), { status: c.status }));
    try {
      const res = await onRequestPost({ request: req(good()), env: env() });
      assert.equal(res.status, 502);
      const out = await res.json();
      assert.equal(out.ok, false);
      assert.equal(out.payUrl, undefined);
    } finally { stub.restore(); }
  }
  const stub = stubProvider(() => { throw new Error("network down"); });
  try {
    assert.equal((await onRequestPost({ request: req(good()), env: env() })).status, 502);
  } finally { stub.restore(); }
});

for (const [label, mutate, status] of [
  ["unknown product", (b) => { b.items = [{ id: "nope", quantity: 1 }]; }, 400],
  ["zero quantity", (b) => { b.items[0].quantity = 0; }, 400],
  ["fractional quantity", (b) => { b.items[0].quantity = 1.5; }, 400],
  ["huge quantity", (b) => { b.items[0].quantity = 1000; }, 400],
  ["empty cart", (b) => { b.items = []; }, 400],
  ["bad reference", (b) => { b.reference = "hello"; }, 400]
]) {
  test(`rejects ${label} before calling the provider`, async () => {
    const { onRequestPost } = await load(); const b = good(); mutate(b);
    const stub = stubProvider({ body: {} });
    try {
      assert.equal((await onRequestPost({ request: req(b), env: env() })).status, status);
      assert.equal(stub.calls.length, 0);
    } finally { stub.restore(); }
  });
}

test("rejects non-JSON, invalid JSON and oversized bodies; 405 for other methods", async () => {
  const { onRequestPost, onRequest } = await load();
  assert.equal((await onRequestPost({ request: req("x", { "Content-Type": "text/plain" }), env: env() })).status, 415);
  assert.equal((await onRequestPost({ request: req("{nope"), env: env() })).status, 400);
  assert.equal((await onRequestPost({ request: req({ ...good(), pad: "x".repeat(11000) }), env: env() })).status, 413);
  assert.equal(onRequest().status, 405);
});

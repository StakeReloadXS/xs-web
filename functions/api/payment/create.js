// Cloudflare Pages Function: POST /api/payment/create
// Opens one hosted CCPayment checkout for a cart and returns its payment URL.
// Prices are always recomputed from /data/products.json; the client's totals are ignored.
//
// Configuration lives in the Pages dashboard, never in the repo (see docs/runbook.md, section 3):
//   CCPAYMENT_APP_ID       secret   merchant app id (use sandbox credentials first)
//   CCPAYMENT_APP_SECRET   secret   merchant app secret, used only to sign requests
//   CCPAYMENT_API_BASE     var      https base URL of the CCPayment API. No default: nothing is sent until it is set.
//
// NOT VERIFIED AGAINST THE LIVE OR SANDBOX API. The items marked UNVERIFIED below come from
// reading the CCPayment docs search results, which disagree with each other. Confirm each one
// against the sandbox before enabling checkoutEnabled in assets/js/config.js.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

const TIMEOUT_MS = 10000;
// UNVERIFIED: create-order path. The docs search did not return the page for it.
const CREATE_PATH = "/ccpayment/v2/createPreOrder";

export async function onRequestPost({ request, env }) {
  const base = parseBase(env.CCPAYMENT_API_BASE);
  if (!env.CCPAYMENT_APP_ID || !env.CCPAYMENT_APP_SECRET || !base) return json({ ok: false, error: "payments are not configured" }, 503);
  if (!(request.headers.get("Content-Type") || "").includes("application/json")) return json({ ok: false, error: "expected JSON" }, 415);

  const raw = await request.text();
  if (raw.length > 10000) return json({ ok: false, error: "payload too large" }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ ok: false, error: "invalid JSON" }, 400); }

  const reference = typeof body.reference === "string" ? body.reference.trim() : "";
  if (!/^XS-[A-Z0-9-]{6,32}$/.test(reference)) return json({ ok: false, error: "invalid reference" }, 400);
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 20) return json({ ok: false, error: "invalid items" }, 400);

  const catalogRes = await env.ASSETS.fetch(new URL("/data/products.json", request.url));
  const catalog = Object.fromEntries((await catalogRes.json()).products.map((p) => [p.id, p]));
  let total = 0;
  for (const line of body.items) {
    const p = catalog[line && line.id];
    const qty = line && line.quantity;
    if (!p || p.availability !== "in-stock" || !Number.isInteger(qty) || qty < 1 || qty > 100) return json({ ok: false, error: "invalid item" }, 400);
    total += p.price * qty;
  }
  total = Math.round(total * 100) / 100;

  // UNVERIFIED: body field names and currency. Amount is sent as a decimal string in USD.
  const payload = {
    merchantOrderId: reference,
    price: total.toFixed(2),
    currency: "USD",
    returnUrl: new URL(`/success.html?ref=${encodeURIComponent(reference)}`, request.url).toString()
  };
  const text = JSON.stringify(payload);
  const timestamp = String(Math.floor(Date.now() / 1000));
  // UNVERIFIED signature: HMAC-SHA256 keyed with the app secret over appId + timestamp + body (the v2 docs reading).
  // The v1 docs describe plain SHA-256 over appId + secret + timestamp + body instead.
  const sign = await hmacSha256Hex(env.CCPAYMENT_APP_SECRET, env.CCPAYMENT_APP_ID + timestamp + text);

  let res;
  try {
    res = await fetch(base + CREATE_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Appid": env.CCPAYMENT_APP_ID, "Timestamp": timestamp, "Sign": sign },
      body: text,
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
  } catch {
    return json({ ok: false, error: "payment provider unavailable" }, 502);
  }
  let data = null;
  try { data = await res.json(); } catch { /* handled below */ }
  // UNVERIFIED: the response field that holds the hosted checkout URL.
  const payUrl = data && data.data && typeof data.data.payUrl === "string" ? data.data.payUrl : "";
  if (!res.ok || !payUrl.startsWith("https://")) return json({ ok: false, error: "payment provider error" }, 502);

  return json({ ok: true, reference, total, payUrl });
}

// Accepts only an https base URL. Returns the origin plus any path prefix, without a trailing slash, or null.
function parseBase(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const u = new URL(value.trim());
    if (u.protocol !== "https:" || u.search || u.hash) return null;
    return u.origin + u.pathname.replace(/\/+$/, "");
  } catch { return null; }
}

async function hmacSha256Hex(secret, text) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const onRequest = () => json({ ok: false, error: "method not allowed" }, 405);

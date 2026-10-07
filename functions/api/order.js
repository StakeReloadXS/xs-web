// Cloudflare Pages Function: POST /api/order
// Stores the order in D1 (binding: DB) and optionally pings Telegram (secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID).
// Prices are always recomputed from /data/products.json; the client's totals are ignored.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, error: "orders are not configured" }, 503);
  if (!(request.headers.get("Content-Type") || "").includes("application/json")) return json({ ok: false, error: "expected JSON" }, 415);

  const raw = await request.text();
  if (raw.length > 10000) return json({ ok: false, error: "payload too large" }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ ok: false, error: "invalid JSON" }, 400); }

  const reference = clean(body.reference, 40);
  const name = clean(body.name, 100);
  const contactMethod = clean(body.contactMethod, 20);
  const contact = clean(body.contact, 120);
  const notes = clean(body.notes, 1000);
  if (!/^XS-[A-Z0-9-]{6,32}$/.test(reference)) return json({ ok: false, error: "invalid reference" }, 400);
  if (!name || !contact) return json({ ok: false, error: "name and contact are required" }, 400);
  if (!["Telegram", "Email"].includes(contactMethod)) return json({ ok: false, error: "invalid contact method" }, 400);
  if (contactMethod === "Email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return json({ ok: false, error: "invalid email" }, 400);
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 20) return json({ ok: false, error: "invalid items" }, 400);

  const catalogRes = await env.ASSETS.fetch(new URL("/data/products.json", request.url));
  const catalog = Object.fromEntries((await catalogRes.json()).products.map((p) => [p.id, p]));
  const items = [];
  let total = 0;
  for (const line of body.items) {
    const p = catalog[line && line.id];
    const qty = line && line.quantity;
    if (!p || p.availability !== "in-stock" || !Number.isInteger(qty) || qty < 1 || qty > 100) return json({ ok: false, error: "invalid item" }, 400);
    items.push({ id: p.id, name: p.name, quantity: qty, unitPrice: p.price });
    total += p.price * qty;
  }
  total = Math.round(total * 100) / 100;

  try {
    await env.DB.prepare("INSERT INTO orders (reference, created_at, name, contact_method, contact, notes, items_json, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(reference, new Date().toISOString(), name, contactMethod, contact, notes, JSON.stringify(items), total).run();
  } catch (e) {
    if (/UNIQUE|constraint/i.test(String(e && e.message))) return json({ ok: true, reference, duplicate: true }); // retried submit
    return json({ ok: false, error: "could not save order" }, 500);
  }

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    const text = `New order ${reference}\n` + items.map((i) => `${i.quantity} x ${i.name}`).join("\n") +
      `\nTotal: $${total.toFixed(2)}\n${name}\n${contactMethod}: ${contact}` + (notes ? `\nNotes: ${notes}` : "");
    try {
      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text })
      });
    } catch { /* order is saved; notification is best effort */ }
  }
  return json({ ok: true, reference, total });
}

export const onRequest = () => json({ ok: false, error: "method not allowed" }, 405);

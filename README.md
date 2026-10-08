# StakeReloadXS

Static storefront hosted on Cloudflare Pages (project `xs-web`, domain `stakereloadxs.com`). The only server-side code is the order-intake Pages Function; there is no build step.

- `data/products.json` – the catalog. Edit price/availability, commit, and Pages redeploys.
- `assets/js/config.js` – `orderEndpoint` and `paymentLink`. `orderEndpoint` is currently **empty**, so orders are not saved server-side and `success.html` shows the order summary with a Telegram handoff. Enabling intake is covered under Order intake below.
- `assets/js/app.js` – catalog rendering, localStorage cart, order submit.
- Pages: `index`, `products`, `order`, `success`, `support`, `team`, `offers`.
- Deploy: pushes to `main` publish to Cloudflare Pages via `.github/workflows/deploy-cloudflare.yml`. See [`docs/runbook.md`](docs/runbook.md) for the deploy, DNS fix and secret names.
- `CNAME` is a leftover from the GitHub Pages setup and is not used by the Cloudflare deploy.

Preview locally: `python3 -m http.server` and open http://localhost:8000.

## Layout tests

`tests/` holds Playwright checks (13 device sizes in portrait and landscape × every page: no horizontal overflow, working nav, 44px touch targets, readable text, canonical chrome). They are kept in their own package so the site root stays dependency-free:

    cd tests && npm install && npx playwright install chromium && npm test

Set `CHROMIUM_PATH` to use an existing Chromium binary.

## Design system

`assets/css/site.css` is the single stylesheet (tokens in `:root`); `assets/js/layout.js` renders the shared header and footer on every page.

## Order intake (Cloudflare Pages Function + D1)

`functions/api/order.js` serves `POST /api/order`: it validates the order, recomputes prices from `data/products.json`, stores it in the D1 database `xs-orders` (table `orders`), and optionally notifies Telegram.

One-time setup in the Cloudflare dashboard (Workers & Pages → `xs-web` → Settings):
1. **Bindings → Add → D1 database**: variable name `DB`, database `xs-orders`. Redeploy.
2. Optional: **Variables and Secrets** → add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as secrets (use a *new* bot token).
3. Only after step 1 is live, set `orderEndpoint: "/api/order"` in `assets/js/config.js` and commit. Setting it before the binding exists makes every order fail with 503. See [`docs/operator-guide.md`](docs/operator-guide.md).

Read orders with `SELECT * FROM orders ORDER BY created_at DESC;` (D1 console or `wrangler d1 execute xs-orders`). For how to read and handle orders, see [`docs/operator-guide.md`](docs/operator-guide.md).

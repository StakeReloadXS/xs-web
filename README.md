# StakeReloadXS

Static storefront hosted on GitHub Pages (custom domain via `CNAME`). No server, database, or build step.

- `data/products.json` – the catalog. Edit price/availability, commit, and Pages redeploys.
- `assets/js/config.js` – set `orderEndpoint` (hosted form endpoint accepting a JSON POST) and optionally `paymentLink`. With no endpoint, `success.html` shows the order summary with a Telegram handoff.
- `assets/js/app.js` – catalog rendering, localStorage cart, order submit.
- Pages: `index`, `products`, `order`, `success`, `support`, `team`, `offers`.
- Deploy: `.github/workflows/pages.yml` (Settings → Pages → Source: GitHub Actions).

Preview locally: `python3 -m http.server` and open http://localhost:8000.

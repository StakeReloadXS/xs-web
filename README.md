# StakeReloadXS

Static storefront hosted on GitHub Pages (custom domain via `CNAME`). No server, database, or build step.

- `data/products.json` – the catalog. Edit price/availability, commit, and Pages redeploys.
- `assets/js/config.js` – set `orderEndpoint` (hosted form endpoint accepting a JSON POST) and optionally `paymentLink`. With no endpoint, `success.html` shows the order summary with a Telegram handoff.
- `assets/js/app.js` – catalog rendering, localStorage cart, order submit.
- Pages: `index`, `products`, `order`, `success`, `support`, `team`, `offers`.
- Deploy: GitHub Pages from branch (Settings → Pages → Deploy from a branch → `main` / root). The `CNAME` file sets the custom domain.

Preview locally: `python3 -m http.server` and open http://localhost:8000.

## Layout tests

`tests/` holds Playwright checks (13 device sizes in portrait and landscape × every page: no horizontal overflow, working nav, 44px touch targets, readable text, canonical chrome). They are kept in their own package so the site root stays dependency-free:

    cd tests && npm install && npx playwright install chromium && npm test

Set `CHROMIUM_PATH` to use an existing Chromium binary.

## Design system

`assets/css/site.css` is the single stylesheet (tokens in `:root`); `assets/js/layout.js` renders the shared header and footer on every page.

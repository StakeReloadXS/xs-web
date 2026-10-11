# Design tokens

Tokens extracted from `assets/css/site.css` (`:root`) for the modern stack. Values are unchanged; the static site still uses its own stylesheet.

- `tokens.json`: W3C DTCG source of truth. Edit here first.
- `tokens.css`: CSS custom properties in `@layer tokens`, for plain CSS or any React/Vite app.
- `tailwind.theme.css`: Tailwind CSS v4 `@theme` mapping.

This folder is not in the Pages deploy allowlist (`.github/workflows/deploy-cloudflare.yml`), so it is not published.

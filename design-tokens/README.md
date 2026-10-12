# Design tokens

Tokens taken from `assets/css/site.css` for the modern stack. Wherever `site.css` `:root` defines a token, the value here is identical. The static site still uses its own stylesheet, so nothing here changes the live site.

Not every `:root` variable is a token yet. `--line-strong`, `--accent-soft`, `--radius-lg`, `--shadow-sm`, `--shadow-md` (same value as `shadow.panel`) and `--ease` are in `site.css` but not in `tokens.json`. They are a follow-up once the look is approved. Some tokens (heading sizes, hero and card padding, the focus outline colour, the help launcher shadow) come from literal values in `site.css` rules, not from `:root`.

- `tokens.json`: W3C DTCG source of truth. Edit here first.
- `tokens.css`: CSS custom properties in `@layer tokens`, for plain CSS or any React/Vite app.
- `tailwind.theme.css`: Tailwind CSS v4 `@theme` mapping. It does not map `size.logo`, `size.icon-nav` or `size.chat-panel`.

This folder is not in the Pages deploy allowlist (`.github/workflows/deploy-cloudflare.yml`), so it is not published.

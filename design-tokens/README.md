# Design tokens

Tokens taken from `assets/css/site.css` for the modern stack. Wherever `site.css` `:root` defines a token, the value here is identical. The site's names differ from these: `site.css` uses `--accent`, this folder uses `--color-accent`. The static site still uses its own stylesheet, and this folder does not change it. Note that `site.css` is restyled on the same branch as this folder, and `assets/` is published, so merging that branch changes the live site.

The `payment-*` color tokens exist only here. They have no `site.css` counterpart and are provisional until the design is approved. Use them for non-text fills and borders only. Text in a payment-required CTA uses `on-accent`.

Not every `:root` variable is a token yet. `--line-strong`, `--accent-soft`, `--radius-lg`, `--shadow-sm`, `--shadow-md` (same value as `shadow.panel`) and `--ease` are in `site.css` but not in `tokens.json`. They are a follow-up once the look is approved. Some tokens (heading sizes, hero and card padding, the focus outline colour, the help launcher shadow) come from literal values in `site.css` rules, not from `:root`.

- `tokens.json`: W3C DTCG source of truth. Edit here first.
- `tokens.css`: CSS custom properties in `@layer tokens`, for plain CSS or any React/Vite app.
- `tailwind.theme.css`: Tailwind CSS v4 `@theme` mapping. It does not map `size.logo`, `size.icon-nav`, `size.chat-panel`, `space.footer-top`, `font.weight`, `font.leading` or `motion.duration`.

The three files are hand-maintained. No generator exists yet, so when you change `tokens.json`, update the other two files in the same commit.

This folder is not in the Pages deploy allowlist (`.github/workflows/deploy-cloudflare.yml`), so it is not published.

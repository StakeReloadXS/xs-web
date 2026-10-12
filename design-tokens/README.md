# Design tokens

Tokens taken from `assets/css/site.css` for the modern stack. Wherever `site.css` `:root` defines a token, the value here is identical. The site's names differ from these: `site.css` uses `--accent`, this folder uses `--color-accent`. The static site still uses its own stylesheet, and this folder does not change it. The `site.css` visual refresh is a separate PR, so this folder changes nothing live.

The `payment-*` color tokens exist only here. They have no `site.css` counterpart and are provisional until the design is approved. Use them for non-text fills and borders only. Text in a payment-required CTA uses `on-accent`.

Not every `:root` variable is a token yet. `--line-strong`, `--accent-soft`, `--radius-lg`, `--shadow-sm`, `--shadow-md` (same value as `shadow.panel`) and `--ease` are in `site.css` but not in `tokens.json`. They are a follow-up once the look is approved. Some tokens (heading sizes, hero and card padding, the focus outline colour, the help launcher shadow) come from literal values in `site.css` rules, not from `:root`.

- `tokens.json`: W3C DTCG source of truth. Edit here first.
- `tokens.css`: CSS custom properties in `@layer tokens`, for plain CSS or any React/Vite app.
- `tailwind.theme.css`: Tailwind CSS v4 `@theme` mapping. It does not map `size.logo`, `size.icon-nav`, `size.chat-panel`, `space.footer-top`, `font.weight`, `font.leading` or `motion.duration`.

The three files are hand-maintained. No generator exists yet, so when you change `tokens.json`, update the other two files in the same commit.

This folder is not in the Pages deploy allowlist (`.github/workflows/deploy-cloudflare.yml`), so it is not published.

## Administrator tokens (`--admin-*`)

The administrator design-token contract lives in `assets/css/site.css`, in the `:root` block after `--font`. It is the single source of truth for admin screens; this folder does not duplicate it. The `--admin-*` tokens reuse brand values where they fit and define explicit semantic pairs (text, background, border) for success, warning, danger, info and neutral. Nothing uses them yet, so existing pages render as before.

Measured WCAG 2.x contrast for each pair (text needs 4.5:1; UI boundaries and focus need 3:1):

| Pair | Ratio | Required |
| --- | --- | --- |
| text on canvas / surface / surface-raised / hover | 19.1 / 17.2 / 15.5 / 13.0 | 4.5 |
| text-muted on canvas / surface / surface-raised / hover | 8.3 / 7.5 / 6.8 / 5.7 | 4.5 |
| on-accent on accent / accent-strong | 4.8 / 6.5 | 4.5 |
| accent on surface (non-text fill, icon, selected bar) | 3.9 | 3 |
| accent as text on canvas (not used) | 4.4 | 4.5, so never small text |
| focus-ring on canvas / surface / surface-raised | 21.0 / 18.9 / 17.0 | 3 |
| control-border on canvas / surface / surface-raised | 3.9 / 3.5 / 3.2 | 3 |
| selected: text / accent bar on selected-bg | 16.0 / 3.6 | 4.5 / 3 |
| disabled text on disabled-bg | 4.2 | 3 (WCAG exempts inactive controls) |
| success text / border on success-bg / surface | 11.0 / 4.6 | 4.5 / 3 |
| warning text / border on warning-bg / surface | 11.1 / 5.1 | 4.5 / 3 |
| danger text / border on danger-bg / surface | 9.4 / 3.7 | 4.5 / 3 |
| info text / border on info-bg / surface | 9.4 / 3.9 | 4.5 / 3 |
| neutral text on neutral-bg / control border on surface | 11.5 / 3.5 | 4.5 / 3 |

Ratios were computed with the WCAG relative-luminance formula. The brand `--line-strong` (#3a3a3a) reaches only 1.7:1 on surface, which is why the admin block has its own `--admin-control-border` (#6b6b6b) for input and control outlines.

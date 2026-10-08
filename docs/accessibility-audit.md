# Accessibility audit (automated)

Automated scan of every public page with axe-core 4.10.2, WCAG 2.0 A/AA and 2.1 A/AA rules, at two widths: desktop (1280×800) and phone (390×844). Fonts were blocked during the scan, so Poppins falls back to the system font.

This is the automated half of issue #18. Manual checks (keyboard order, focus visibility, screen-reader naming, and reflow at 200% zoom) have not been run yet.

## Results

| Page | Desktop | Phone |
|---|---|---|
| `index.html` | 1 serious: colour contrast | pass |
| `products.html` | 1 serious: colour contrast | pass |
| `offers.html` | 1 serious: colour contrast | pass |
| `order.html` | 2 serious: colour contrast | 1 serious: colour contrast |
| `success.html` | pass | pass |
| `support.html` | 1 serious: colour contrast | pass |
| `team.html` | 1 serious: colour contrast | pass |

No critical, moderate, or minor violations were reported. Each page also has a number of "incomplete" checks that axe could not decide automatically; these need a manual look.

## Findings

### 1. Active nav link and hover colour fail contrast (all pages, desktop)

- Selector: `.site-nav a[aria-current="page"]` and its `:hover` rule, both reading `var(--accent)` in `assets/css/site.css`. Referenced by selector, not line number, so the note stays correct as the file changes.
- Colour: `--accent: #dc2626` on `--bg: #000`. Contrast is **4.35:1**. WCAG AA needs 4.5:1 for normal text.
- Proposed fix: change `--accent` to `#ef4444` (contrast **5.58:1**). This is a brand colour decision, so it is left for the owner to approve.
- Scope of the fix: `--accent` is also used for buttons (`.btn:hover`), input focus outlines, card hover borders, stat numbers and the hero glow. Changing the token therefore changes more than the nav. Before approving, check those states visually at desktop and phone widths, including the focus ring on inputs, which must stay visible.

### 2. `.accent` text on order page

- Selector: `.accent` (`site.css` line 49), used on `order.html`.
- Same colour token, so the fix in finding 1 also covers it. The phone run reports one instance, the desktop run two.

## Not in scope for this audit

- Muted text (`--muted: #a3a3a3`) passes at 8.33:1 on black.
- Keyboard, focus and screen-reader checks.
- Reflow at 200% zoom and text spacing.

## Re-running

The scan is a short script that loads axe-core from the npm package and runs `axe.run` inside each page. Serve the site locally (`python3 -m http.server`), then run the scan against `http://localhost:8000`.

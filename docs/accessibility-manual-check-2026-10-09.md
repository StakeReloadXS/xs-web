# Accessibility manual checks (issue #18, lane B)

Date: 2026-10-09. Report only. No CSS, HTML, JS, or colour values were changed. `--accent` remains `#dc2626`.

This covers the four manual checks listed as not yet run in `docs/accessibility-audit.md`: tab order, focus visibility, screen-reader names, and reflow at 200% zoom. It also re-checks the accent contrast figure.

## Method

- Served the repo root with `python3 -m http.server 8011`. The server was stopped after the run.
- Playwright (from `tests/node_modules`) driving the preinstalled Chromium at `CHROMIUM_PATH` (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`), headless. Chromium launched without error. `playwright install` was not run.
- Tab order and focus: keyboard `Tab` presses from the top of each page at 1280x800. Each stop was compared against the list of visible focusable elements in DOM order. Focus style was read as computed `outline`, `box-shadow`, border and background, before and after focus.
- Names: computed from `aria-labelledby`, `aria-label`, `<label>` (for or wrapping), `value`, `title`, and text content, in that order.
- Reflow: viewport 320 CSS px wide (the WCAG 1.4.10 width), `scrollWidth` compared with `clientWidth`. A 640 px run was also recorded as a stricter, non-criterion check.
- Contrast: computed from the hex tokens on `:root` and from the computed colours of the active nav link and `.accent` text. Ratios use the WCAG relative-luminance formula.
- axe-core was not re-run. It is not in `tests/node_modules` and was not installed, so the automated half of the audit is not re-verified here.

Raw output is in the scratchpad (`out.json`, `pass2.json`), not in the repo.

## Summary table per page

Desktop 1280x800 unless stated. "Visible focusables" is the DOM count of visible, enabled, non-`tabindex=-1` controls. "Tab presses" includes repeated stops inside an iframe and the stop that leaves the page.

| Page | Visible focusables | Tab presses | tabindex > 0 | Unreachable by Tab | Focus indicator (first 15 stops) | Focus indicator (all controls) | Unnamed controls | Repeated/ambiguous names | Reflow at 640 px | Accent contrast (nav/.accent) |
|---|---|---|---|---|---|---|---|---|---|---|
| `index.html` | 30 | 38 | 0 | 0 | pass | 1 issue: YouTube iframe (non-blocking) | 0 | "Learn more" x3, "Add to order" x7 | no overflow | fail, 4.35:1 (blocking) |
| `products.html` | 22 | 24 | 0 | 0 | pass | pass | 0 | "Add to order" x7 | no overflow | fail, 4.35:1 (blocking) |
| `order.html` | 19 | 21 | 0 | 0 | pass | pass, except Submit order not testable (disabled, see below) | 0 | none beyond nav | no overflow | fail, 4.35:1 on nav and `.accent` text (blocking) |
| `support.html` | 18 | 20 | 0 | 0 | pass | pass | 0 | none beyond nav | no overflow | fail, 4.35:1 (blocking) |
| `team.html` | 15 | 17 | 0 | 0 | pass | pass | 0 | none beyond nav | no overflow | fail, 4.35:1 (blocking) |
| `offers.html` | 17 | 19 | 0 | 0 | pass | pass | 0 | none beyond nav | no overflow | fail, 4.35:1 (blocking) |
| `success.html` | 15 | 17 | 0 | 0 | pass | pass | 0 | none beyond nav | no overflow | no active nav link, no `.accent` text found |

Header and footer both repeat "Team" and "Support" (and "Home" on `team.html` and `success.html`). These point to the same URLs, so they are not treated as issues.

## Counts by check type

| Check | Issues found | Blocking | Non-blocking | Not verified |
|---|---|---|---|---|
| Tab order (tabindex > 0, unreachable controls) | 0 | 0 | 0 | 0 |
| Focus visibility (first ~15 stops, all controls) | 1 | 0 | 1 | 1 |
| Screen-reader names (missing names) | 0 | 0 | 0 | 0 |
| Screen-reader names (ambiguous or duplicate names) | 2 groups | 0 | 2 | 1 |
| Reflow at 640 px | 0 pages overflow | 0 | 0 | 0 |
| Accent contrast | 1 (token) on 6 pages plus `.accent` text on `order.html` | 1 | 0 | 0 |

## Concrete issues

Each issue is marked blocking or not. "Blocking" means it fails a WCAG AA criterion that the audit lists as a serious failure, so it should be fixed before the audit is closed.

### Blocking

1. **Accent text fails contrast (1.4.3).** `--accent: #dc2626` on `--bg: #000` is **4.348:1**, below 4.5:1. It is used for the active nav link and its hover colour (`.site-nav a[aria-current="page"]`, `.site-nav a:hover`) on index, products, order, support, team and offers, and for `.accent` text on `order.html` ("Browse products"). The computed colour on the active nav link is `rgb(220, 38, 38)` on a black background. The fix is the owner's decision (see below). Nothing was changed.

### Not blocking

2. **Repeated, identical "Add to order" buttons (2.4.4, 4.1.2 advisory).** Seven buttons with the same name on `products.html` (and seven on `index.html`). The accessible name does not include the product, so a screen-reader user hearing the list cannot tell which button adds which item. Suggested fix: include the product name in an `aria-label` or visually hidden text, for example "Add Telegram credits to order".
3. **Repeated "Learn more" links (2.4.4).** Three links named "Learn more" on `index.html`, all to the same Telegram URL. Same suggestion as item 2: make each name specific to its service card.
4. **YouTube embed has no computed focus indicator (2.4.7).** The `iframe` on `index.html` (title "StakeReloadXS demo") has `outline-style: none` when focused. In the headless run, focus stayed inside the embed for about seven Tab presses before moving on, so it is not a keyboard trap, but the player's own controls were not checked. Manual check needed with real playback in a desktop browser: confirm that the player's controls show a visible focus ring, and that Tab leaves the embed.
5. **`<select>` accessible name includes option text (advisory).** The wrapping `<label>` for "Contact method" on `order.html` has text content "Contact method Telegram Email", so the option text may be read as part of the label. Check with a screen reader; if so, move the label text into a `<span>` that is not part of the select, or use `aria-labelledby`.

### Not verified

6. **Submit order focus ring (2.4.7).** The `Submit order` button on `order.html` is `disabled` when the cart is empty, so it cannot take focus in this state and the focus ring could not be measured. The global `:focus-visible` rule (`outline: 2px solid #fff`) should apply once enabled, but this has not been confirmed. Needs a run with a populated cart.

## Focus indicator notes (passes)

- Global `:focus-visible` (`outline: 2px solid #fff; outline-offset: 2px`) is present on every page. The skip link, brand link, nav links and footer links all showed it.
- Inputs, select and textarea on `order.html` show the accent outline (`rgb(220, 38, 38) solid 2px`). On black that is 4.35:1, which clears the 3:1 non-text contrast requirement (1.4.11). If the accent is changed to `#ef4444` (5.58:1), the input focus ring remains visible.

## Reflow (WCAG 1.4.10, 320 CSS px)

No page overflows horizontally at 320 CSS px: `scrollWidth` equals `clientWidth` (320) on all seven pages (`index`, `products`, `order`, `support`, `team`, `offers`, `success`). This is the width the reflow criterion uses. The earlier 640 px run is also clean (`scrollWidth` equals `clientWidth` on all seven), but it is not the criterion test.

## Accent contrast re-check

| Pair | Ratio | Audit figure | Result |
|---|---|---|---|
| `--accent` `#dc2626` on `#000` | **4.348:1** | 4.35:1 | Matches |
| `--accent` on `#000`, proposed `#ef4444` | 5.580:1 | 5.58:1 | Matches |
| `--accent-strong` `#b91c1c` on `#000` | 3.246:1 | not in audit | Not used as text on black. The skip link and `.btn` use it as a background with white text. |
| White on `--accent-strong` (`.btn`, skip link) | 6.470:1 | not in audit | Passes AA |
| White on `--accent` (`.btn:hover`) | 4.829:1 | not in audit | Passes AA |
| `--muted` `#a3a3a3` on `#000` | 8.325:1 | 8.33:1 | Matches |

The accent figure in the audit (4.35:1) is confirmed.

## Decision needed from the owner

Blocking issue 1 needs a decision on the accent colour. Proposed by the audit: `#ef4444` (5.58:1). Before approving, the audit says to check `.btn:hover`, input focus rings, card hover borders, stat numbers and the hero glow at desktop and phone widths. This report did not make that visual check.

## Limits of this run

- Headless Chromium only. No screen reader was run. Names were computed from the accessibility rules in code, not from the browser's accessibility tree.
- axe-core was not re-run, so the automated results in the audit are not re-verified here.
- Contrast was computed at 1280 px. The 390 px phone result for `order.html` in the audit is from the same token and was not re-run.
- Embedded YouTube content was not played.

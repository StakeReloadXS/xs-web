DRAFT — NOT APPROVED. Owner decisions required. Do not publish.

# About page copy for about.html (draft)

Issue #14. `about.html` does not exist yet. This is a skeleton. Wording is taken from existing site copy where possible. Every `[OWNER TO CONFIRM]` marker is a fact or decision the repo does not contain.

## Open questions (answer these first)

1. **Approved copy.** Nothing has been approved. The owner must approve the final wording before the page is created.
2. **Scale and experience claims.** `index.html` shows "700+ Monthly Users", "25+ Years combined software development experience", "0 Complaints" and "$60,000,000 wagered on Stake alone". None has a source in the repo. Confirm each one with its date, or remove it.
3. **Gambling notice.** The repo has no age or responsible-gambling notice. The owner decides the wording and whether it is needed for the places the site is served.
4. **Support hours.** `index.html` says "24/7 Customer Support". Confirm whether that is true before the about copy repeats it. See `operator-policies.md`, section 4.
5. **Contact channels.** Only Telegram (`@supitsj`) appears on the site. Is there a public email or other channel?
6. **Wiring, once the copy is approved (not done here).** A nav link needs an edit to `assets/js/layout.js`. A sitemap entry needs `sitemap.xml`. The social preview needs an image: `assets/og/` has no `about.png`, and `scripts/generate-og-images.js` has no about entry. The deploy allowlist in `.github/workflows/deploy-cloudflare.yml` also needs `about.html`. Owner approves each change.
7. **Team.** Does the about page name people, or only link to `team.html`? See `team-bios.md`.

## Page metadata (draft)

- `<title>`: About - StakeReloadXS
- `<meta name="description">`: Who runs StakeReloadXS and what our reload automation does.
- Canonical: `https://stakereloadxs.com/about.html`
- `og:image`: [OWNER TO CONFIRM] Image file. None exists yet.

## 1. Hero

**H1:** About StakeReloadXS

**Lead:** Xtremely Simple Reloads. We build automation that claims stake.com and stake.us reloads and social drops.

(Adapted from the `index.html` hero and meta description. The "less than 2 seconds" speed claim is left out until it is confirmed. [OWNER TO CONFIRM])

## 2. What we do

Reuse existing copy from `index.html`:

- **Automatic Claims.** "We make your bonus lifecycle as simple and painless as possible."
- **Private Servers.** "Specialist set-up for bigger requirements. Contact us on Telegram."
- **KYC account help.** [OWNER TO CONFIRM] Keep only if the service continues. `index.html` lists Level 2 = $75, Level 3 = $500, Level 4 = $1,000. `data/products.json` lists only KYC Level 2 at $75. Confirm the levels and prices.
- **Guaranteed $10,000 wager.** Leave out until the terms exist. [OWNER TO CONFIRM]

## 3. Who we are

Reuse the footer line: "A small team of web3 developers building simple, fast reload automation."

[OWNER TO CONFIRM] Confirm the team description, team size and whether "web3 developers" is accurate.

Link to `team.html` once the bios in `team-bios.md` are approved.

## 4. Experience

[OWNER TO CONFIRM] Years of combined software development experience: ___ (`index.html` currently says 25+). Include only with a source the owner has checked.

## 5. How to reach us

- Main channel: Telegram, [@supitsj](https://t.me/supitsj).
- Email: [OWNER TO CONFIRM] Address, or "none".
- Orders: submit on the Order page. Support hours and response times: [OWNER TO CONFIRM] see `operator-policies.md`, section 4.

## 6. Responsible use

[OWNER TO CONFIRM] Write the age and responsible-gambling notice. The partner sites promoted on `offers.html` are betting sites, so the owner decides what notice is needed and where it appears.

## 7. Not included in this draft

- No claims about partners, sponsorship or endorsement until confirmed.
- No names, photos or personal details. Those go through `team-bios.md` with each person's consent.

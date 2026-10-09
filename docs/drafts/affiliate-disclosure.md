DRAFT — NOT APPROVED. Owner decisions required. Do not publish.

# Affiliate disclosure for offers.html (draft)

Issue #12. Target page: `offers.html`. Nothing here has been applied to the live page. Every `[OWNER TO CONFIRM]` marker is a fact or decision the repo does not contain.

## Open questions (answer these first)

1. **How does StakeReloadXS get paid by Stake and Gamba?** The repo does not say whether the site earns a commission, a fixed fee per signup, or something else. The disclosure cannot be finalised without this.
2. **Who receives the Gamba "25% Commission Share"?** The card says "we share 25% commission with you". That could mean the visitor or the site. Confirm before publishing.
3. **Program rules.** Do Stake and Gamba require specific disclosure wording or placement? Issue #12 asks for each program's link-usage rules. They are not in the repo.
4. **Offer terms and expiry.** "$21 free" and "25% Commission Share" need terms and an expiry date (issue #13). Neither is in the repo.
5. **Legal review.** Does the owner want a legal review of the wording before it goes live? This draft is copy only and is not legal advice.
6. **Placement.** Above the cards, beside each button, or both?
7. **Conflicting offer copy (not part of the disclosure, but on the same page).** `offers.html` says "Get 2000 credits for $1" for Play on Stake. `data/products.json` lists "New XSID Setup" as 5,000 XSID credits for $5.00. Confirm which is current before either is shown next to a disclosure.

## What the page has today

- Stake card: link to `stake.com` with a referral parameter. Already has `rel="noopener sponsored"`.
- Gamba card: link to `gamba.com` with a referral parameter. Already has `rel="noopener sponsored"`.
- No disclosure text anywhere on the page.
- `docs/discovery-map.md` notes the affiliate links are not tracked (issue #12).

## Draft: page-level disclosure

Place under the lead line ("Sign up below to get started."), above the cards.

> **Affiliate links.** Some links on this page are affiliate links. If you sign up through them, StakeReloadXS may receive a payment from the partner site. [OWNER TO CONFIRM] Describe the type of payment (commission, fixed fee or other) and whether any part of it reaches the visitor.
>
> Offers, bonus amounts and terms are set by Stake and Gamba and can change. [OWNER TO CONFIRM] Link to the offer terms once they exist (issue #13).
>
> [OWNER TO CONFIRM] Keep only if true: using these links does not change the price you pay.

## Draft: short note beside each affiliate button (optional)

- Stake card: "Affiliate link. We may receive a payment if you sign up." [OWNER TO CONFIRM] Confirm wording against open question 1.
- Gamba card: "Affiliate link. [OWNER TO CONFIRM] State who receives the 25% share."

## Other copy on the same cards that needs a check

- "First-time users get $21 free when they sign up through our link." [OWNER TO CONFIRM] Eligibility rules and expiry.
- "No KYC required." (Gamba card.) [OWNER TO CONFIRM] Confirm this is accurate for the program before it sits next to a disclosure.

## Implementation, once approved (not done here)

- Edit `offers.html` only. No change to `assets/js/layout.js`.
- Keep `rel="noopener sponsored"` on both links.
- Check the page at phone width with no horizontal scroll (see `tests/layout.test.js`).

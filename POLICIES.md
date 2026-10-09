# StakeReloadXS policies

Register and rules for the site's policy documents, their version history and their publication dates. The text of each live page is kept in its markdown source (`privacy.md`, `refund.md`, `terms.md`). The published pages are `privacy.html` and `refund.html`. The FAQ entries live in `support.html`. The affiliate disclosure is an owner draft and is not yet published.

## Version control rules

- Each published policy has a **version** (`major.minor`), a **published** date (the day the version first went live) and a **last updated** date (the day the text last changed).
- Bump the **major** version when a change alters what users can claim or what we promise (refund windows, data sharing, fees). Bump the **minor** version for clarifications that change no promise.
- Dates use the form `D Month YYYY`, for example `9 October 2026`.
- To change a policy: edit the page, update the version and dates at the top of that page, add a row to its history table on the page, and add the same row to the register below. Commit both in the same change.
- Do not edit a published version in place without a new row. The history table is the record of what was live and when.
- Every live legal page has a markdown source at the repository root. Edit the source first, then make the same change in the page, so the two never differ. Keep the version and dates identical in both.

| Page | Source |
|---|---|
| `privacy.html` | `privacy.md` |
| `refund.html` | `refund.md` |
| `terms.html` | `terms.md` |

## Register

| Document | File | Version | Published | Last updated | Status |
|---|---|---|---|---|---|
| Privacy Policy | `privacy.html` | 1.0 | 9 October 2026 | 9 October 2026 | Live, pending owner review of marked items |
| Refund Policy | `refund.html` | 1.0 | 9 October 2026 | 9 October 2026 | Live, pending owner review of marked items |
| Terms of Use | `terms.html` | 1.0 | 9 October 2026 | 9 October 2026 | Live, pending owner review of marked items |
| FAQ entries (refund, privacy) | `support.html` | 1.0 | 9 October 2026 | 9 October 2026 | Live; answers point to the two policies above |
| Affiliate Disclosure & Program Benefits | not yet published | owner draft | not published | 8 October 2026 (owner's date on the draft) | Draft, not approved; see open questions below |

## Revision history

| Date | Document | Version | Change |
|---|---|---|---|
| 9 October 2026 | Privacy Policy | 1.0 | First published version. |
| 9 October 2026 | Refund Policy | 1.0 | First published version. |
| 9 October 2026 | Terms of Use | 1.0 | First published version. |
| 9 October 2026 | FAQ (`support.html`) | 1.0 | Added "Can I get a refund?" and "How is my personal information used?". |
| 8 October 2026 | Affiliate Disclosure | owner draft | Owner text supplied in the session. Not published. |

## Open items

These need an owner decision before the pages are final. Every one is marked `[OWNER TO CONFIRM]` on the page.

- Privacy: an email address for privacy requests, retention periods, the complete list of recipients, Tawk.to's cookie and chat-data terms, the age requirement, and response times.
- Refunds: the refund window and eligibility rule, whether delivered credits can be refunded, the refund method and currency, who approves refunds, and processing times.
- Terms of use: the scope of the automation service and any service limits, order acceptance rules, minimum age and location restrictions, the limitation-of-liability and governing-law wording (to be reviewed by a qualified lawyer before publishing), the site content licence, and a legal-notices email address.
- Affiliate disclosure: the 50% discount and the priority queue are not in the repo. The text conflicts with the 25% commission share on `offers.html` and the "up to 20% of their deposits" line on `index.html`. Confirm the programme terms before publishing.

---

## Privacy Policy (version 1.0, published 9 October 2026)

**Who we are.** StakeReloadXS runs this website and the reload automation service it describes. Contact us on Telegram (@supitsj) [OWNER TO CONFIRM: add an email address for privacy requests].

**What we collect.**
- *Order details.* When you place an order: your name, how you want us to contact you (Telegram or email), your Telegram handle or email address, any notes you add, the items and quantities, the total, and the reference ID we give you. Order details are saved on our servers only when order intake is switched on. Until then, your order summary is shared with us through a Telegram message you send.
- *Support messages.* Anything you send us on Telegram.
- *Live chat.* Every page loads a live chat widget from Tawk.to. It may record the messages you send in the chat and basic technical details about your visit, under Tawk.to's own privacy policy [OWNER TO CONFIRM].
- *Hosting data.* Our hosting provider, Cloudflare, handles standard connection data, such as IP address and browser type, to deliver the site.

**How we use it.** To take, confirm and fulfil your order, including delivering credits to your XSID. To answer support questions and follow up on refunds or cancellations. To keep the site running and protect it from misuse.

**Who we share it with.** We share information only with the services needed to run the site and the order process: Cloudflare (hosting and, when enabled, order storage), Tawk.to (live chat), and Telegram (order notifications, when enabled, and support messages). [OWNER TO CONFIRM: confirm no other recipients.]

**Cookies.** The site does not set cookies of its own. The Tawk.to chat widget may set cookies [OWNER TO CONFIRM].

**How long we keep it.** [OWNER TO CONFIRM: retention period for order records and support messages, and the process for deleting them.]

**Your choices.** You can ask us what information we hold about you, ask us to correct it, or ask us to delete it, by contacting us on Telegram. [OWNER TO CONFIRM: whether deletion is offered, the process, response time and any verification step.]

**Children.** This service is not for anyone under 18. [OWNER TO CONFIRM: age requirement and wording.]

**Changes to this policy.** We will publish changes on the page and update the version and dates at the top.

---

## Refund Policy (version 1.0, published 9 October 2026)

**How orders work.** Orders are placed on this site and payment is arranged with you directly on Telegram. The site does not take payment itself. [OWNER TO CONFIRM: payment methods and currencies.]

**Cancelling before payment.** You can ask to cancel an order before payment is confirmed by messaging us on Telegram with your reference ID and the name and contact details you used. While order intake is off, the site does not store your reference ID, so we match the order by these details. [OWNER TO CONFIRM: any fee or time limit.]

**When you can get a refund.** [OWNER TO CONFIRM: the refund rule, for example refunds are available when ___, within ___ days of payment confirmation.] [OWNER TO CONFIRM: whether credits already delivered to an XSID can be refunded, and in what cases.]

**How to request a refund.** Message us on Telegram (@supitsj) with your reference ID and the name and contact details you used. [OWNER TO CONFIRM: response time.]

**How refunds are paid.** [OWNER TO CONFIRM: refund method and currency, and how long it takes.]

**Who decides.** [OWNER TO CONFIRM: who approves a refund, and whether the decision can be appealed.]

---

## FAQ entries added to support.html (version 1.0, 9 October 2026)

**Can I get a refund?** Our Refund Policy explains when refunds and cancellations are possible and how to ask for one. You can also message us on Telegram with your reference ID.

**How is my personal information used?** Our Privacy Policy explains what we collect and who we share it with.

---

## Affiliate Disclosure & Program Benefits (owner draft, dated 8 October 2026, not published)

Status: draft, not approved. Not published on any page. Full owner text is kept in `docs/drafts/affiliate-disclosure-owner-text.md`, with the open questions listed there.

StakeReloadXS operates independently and does not receive payments from casinos for providing, operating, or executing its automation services.

Our platform may earn affiliate commissions when users voluntarily elect to participate in our affiliate program and complete qualifying activities through participating third-party platforms.

**How Our Affiliate Program Works**

- **No Casino Payments for Automation:** Casinos do not directly compensate StakeReloadXS for executing automated claims or providing automation services.
- **Affiliate Commission Disclosure:** We may receive a commission when eligible users register or participate through our affiliate links or referral arrangements.
- **50% Service Discount:** Users who qualify through our affiliate program unlock a 50% discount on eligible StakeReloadXS service fees.
- **Priority Claim Queue:** Qualified affiliate participants receive prioritized placement in our claim-processing queue, subject to availability, eligibility, and applicable service limitations.
- **Voluntary Participation:** Participation in the affiliate program is optional. Users are not required to register through an affiliate link to access otherwise available services.

**Our Commitment to Transparency.** Affiliate commissions do not guarantee successful claims, influence claim eligibility, or establish any affiliation, sponsorship, or endorsement by casino operators. The 50% discount applies to eligible StakeReloadXS service fees, not casino deposits, wagers, losses, or third-party charges. StakeReloadXS is an independent service provider. All affiliate relationships are disclosed to help users make informed decisions.

**Responsible Participation.** Participation in third-party casino or gaming platforms is subject to applicable laws, geographic restrictions, age requirements, and each platform's terms of service. StakeReloadXS does not guarantee financial returns or gambling outcomes.

DRAFT — NOT APPROVED. Owner decisions required. Do not publish.

# FAQ additions for support.html (draft)

Issue #22. Covers payment methods, refund policy, delivery times and the boost question. Every answer is marked NEEDS OWNER CONFIRMATION. Every `[OWNER TO CONFIRM]` marker is a fact or decision the repo does not contain.

## Open questions (answer these first)

1. **Payment methods.** Which methods are accepted? CWallet checkout is deferred (issue #10). Until it is decided, the answer must say payment is arranged by hand. No provider is named here. The names in the `config.js` comment (NOWPayments, CCPayment) are examples only.
2. **Refund policy.** Is there one? It is blocked on `operator-policies.md`, section 1. Answer 2 cannot be published without it.
3. **Delivery times.** How long from payment confirmation to XSID delivery?
4. **Boost question.** Publish an answer at all (issue #22 asks this)? And what does the boost add to? The repo gives the tiers but not what the boost is.
5. **Pricing link.** Issue #21 asks whether the 500,000-credit pack was meant to be there, to match the $500 tier. The answer to boost question 4 changes if that pack is removed.
6. **Structured data.** `support.html` has FAQPage JSON-LD in its `<head>`. Any question added to the visible FAQ must also be added to that JSON-LD, with the same wording, or the two will disagree.

## Q1. What payment methods do you accept?

**Status: NEEDS OWNER CONFIRMATION.** Blocked on open question 1.

**Draft answer:**

> Payment is not taken on this website. After you submit your order, we contact you on Telegram or email to arrange payment. [OWNER TO CONFIRM] Accepted methods: ___.

## Q2. Can I get a refund?

**Status: NEEDS OWNER CONFIRMATION.** Blocked on `operator-policies.md`, section 1.

**Draft answer:**

> [OWNER TO CONFIRM] Refunds are available when ___ within ___ days of payment confirmation. To ask about a refund, message us on Telegram with your reference ID.

## Q3. When do I receive my credits?

**Status: NEEDS OWNER CONFIRMATION** for the timing only. The existing answer is already on `support.html`.

**Draft answer:**

> Credits are delivered to your XSID after payment is confirmed. [OWNER TO CONFIRM] Typical time from payment confirmation to delivery: ___.
>
> If you do not have an XSID yet, choose "New XSID Setup" on the Shop page and include your Telegram username, so we can deliver your XSID.

(The second paragraph uses the instruction text for "New XSID Setup" in `data/products.json`.)

## Q4. How does the boost work?

**Status: NEEDS OWNER CONFIRMATION.** The tiers below are in the repo. What the boost gives is not, and whether to publish this answer is open (issue #22).

**Draft answer:**

> Boost is set by your order total. Items in one order combine toward a tier, and the highest tier your total reaches applies:
>
> - 5% at $100 or more
> - 10% at $200 or more
> - 15% at $500 or more
> - 20% at $1,000 or more
>
> [OWNER TO CONFIRM] What the boost adds to (for example, extra credits on the order) and how it is delivered: ___.

Notes:

- The tiers match `data/products.json`, `assets/js/app.js` and `functions/api/order.js`. Check they are still current before publishing.
- The boost is calculated on the whole order total, not per item. The Order page and `products.html` already say this.
- The $500 tier depends on the 500,000-credit pack (open question 5).

## Mirroring into support.html (once approved, not done here)

- Add each approved question to the visible `<details>` list and to the FAQPage JSON-LD, with matching text.
- Edit `support.html` only. Keep the existing three entries.
- Check the page at phone width (`tests/layout.test.js`).

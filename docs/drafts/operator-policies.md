DRAFT — NOT APPROVED. Owner decisions required. Do not publish.

# Operator policies: refunds, cancellations, data retention, out-of-hours cover (draft)

Issue #27, "Operator policy gaps". `docs/operator-guide.md` lists these four as not covered. The repo describes what the site does today, not what the business has decided. Every policy decision below is marked `[OWNER TO CONFIRM]`. Draft wording is for the owner to edit, not a policy.

## Open questions (answer these first)

1. **Refund eligibility and time limit.** This blocks the refund FAQ answer (`faq-additions.md`, Q2) and the cancellation wording below. It is the most important decision.
2. **Cancellations.** Can an order be cancelled before payment? After payment? After credits are delivered?
3. **Data retention.** How long are order rows, Telegram alerts and chat records kept? Who handles deletion requests?
4. **Out-of-hours cover.** Who reads orders and support messages, and when? `index.html` promises "24/7 Customer Support".
5. **Payment status.** The `orders` table has no status column (issue #27 finding). Should it get one, with a manual update process? Refunds depend on knowing whether a payment was confirmed.
6. **Privacy notice and third-party chat.** `assets/js/layout.js` loads a Tawk.to live chat widget on every page. No doc mentions it, and the repo has no privacy notice. Confirm how the chat is set up and whether a privacy notice is needed.

## Current state (from the repo)

- Payment is not collected by the site. `paymentLink` in `assets/js/config.js` is empty (`orderEndpoint` is also empty, so orders are not saved server-side yet).
- Credits are delivered to the customer's XSID after payment is confirmed (`support.html`, `data/products.json`).
- Orders are stored in the D1 table `orders` once intake is enabled, with: reference, created_at, name, contact_method, contact, notes, items_json and total (`docs/operator-guide.md`).
- The Telegram alert, when enabled, includes the name, contact and notes.
- The cart is held only in the browser's localStorage.
- There is no refund, cancellation, retention or out-of-hours wording anywhere on the site.

## 1. Refunds

**Decisions needed**

- Eligibility: [OWNER TO CONFIRM] Which cases qualify (for example, credits not delivered, wrong XSID, order placed in error).
- Time limit: [OWNER TO CONFIRM] ___ days from payment confirmation.
- After delivery: [OWNER TO CONFIRM] Are refunds possible once credits have been delivered? Yes, no or case by case.
- Method: [OWNER TO CONFIRM] How refunds are paid, and in what currency.
- Who decides: [OWNER TO CONFIRM] The role that approves each refund.

**Draft customer-facing wording**

> **Refunds.** [OWNER TO CONFIRM] Refunds are available when ___, within ___ days of payment confirmation. [OWNER TO CONFIRM] Credits already delivered to your XSID cannot be returned, or describe the exception. To ask for a refund, message us on Telegram with your reference ID and the contact details you used.

**Operator note (internal, not published)**

- Record each refund decision outside the repo. The `orders` table has no status column (`docs/operator-guide.md`).

## 2. Cancellations

**Decisions needed**

- Before payment: [OWNER TO CONFIRM] Cancellable? How? (for example, Telegram with the reference ID.)
- After payment, before delivery: [OWNER TO CONFIRM] Cancellable, and under which refund rule?
- After delivery: [OWNER TO CONFIRM] Not cancellable, or governed by section 1.

**Draft customer-facing wording**

> **Cancellations.** You can cancel an order before payment is confirmed by messaging us on Telegram with your reference ID. [OWNER TO CONFIRM] After payment is confirmed, cancellations follow our refund policy.

## 3. Customer data retention

**Current state**

- The site stores what the order form collects (see the Current state list above).
- Telegram and Tawk.to hold their own copies of messages and chats under their own terms.
- No retention period is set and no deletion process exists.

**Decisions needed**

- Retention for order rows: [OWNER TO CONFIRM] ___ months after delivery.
- Retention for Telegram alerts and chat records: [OWNER TO CONFIRM] ___.
- Deletion requests: [OWNER TO CONFIRM] Channel, and turnaround of ___ days.
- Exceptions (for example, records needed for accounts or disputes): [OWNER TO CONFIRM] ___.
- Privacy notice: [OWNER TO CONFIRM] Needed or not, and who drafts it.
- Who can see the Telegram order channel: [OWNER TO CONFIRM] ___.

**Draft customer-facing wording**

> **Your details.** When you place an order we keep your name, contact details, notes and order items for [OWNER TO CONFIRM] ___. To ask us to delete your order details, message us on Telegram with your reference ID. [OWNER TO CONFIRM] We delete them within ___ days, except where we must keep records for ___.

**Operator note (internal, not published)**

- Do not delete rows by pattern. Follow the test-order rules in `docs/operator-guide.md`.
- A retention purge needs its own written procedure, approved by the owner.

## 4. Out-of-hours cover

**Current state**

- `index.html` says "24/7 Customer Support". No hours, cover or response time is documented.
- The only support channel is Telegram (`support.html`).
- The order form shows a Telegram handoff. The alert is best effort (`docs/runbook.md`).
- `docs/operator-guide.md` lists this as an open gap.

**Decisions needed**

- Support hours and time zone: [OWNER TO CONFIRM] ___.
- Who covers outside those hours: [OWNER TO CONFIRM] A named role or backup contact.
- Response time: [OWNER TO CONFIRM] ___ hours on working days.
- Orders placed outside hours: [OWNER TO CONFIRM] Picked up at ___.
- The "24/7" wording on `index.html`: [OWNER TO CONFIRM] Keep only if cover is in place, otherwise replace. This draft does not edit `index.html`.
- Urgent problems: [OWNER TO CONFIRM] How to flag them (see `docs/runbook.md`).

**Draft customer-facing wording (for `support.html`)**

> **Support hours.** Message us on Telegram. [OWNER TO CONFIRM] Support hours: ___ (time zone ___). We usually reply within ___ hours during those hours. Messages sent outside them are answered [OWNER TO CONFIRM] ___.

**Draft replacement for the "24/7" line (owner picks one)**

- Option A (only if cover is in place): [OWNER TO CONFIRM] Keep "24/7 Customer Support".
- Option B: [OWNER TO CONFIRM] "Message us on Telegram. Support hours: ___."

## Not in this draft

- No decision has been made for any item above.
- No change has been made to `index.html`, `support.html`, `layout.js` or `docs/operator-guide.md`. Once the owner decides, `docs/operator-guide.md` should be updated to match.

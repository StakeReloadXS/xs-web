# Operator guide: reading and handling orders

This describes what the site records today. Anything not listed here, such as payment status or refund handling, is not tracked by the code.

## Where orders go

Submitted orders are saved to the D1 database `xs-orders`, table `orders`, by `functions/api/order.js`. If the Telegram secrets are set, a message is also sent to the configured chat.

### Columns

| Column | Meaning |
|---|---|
| `reference` | Customer-facing ID, format `XS-` followed by 6 to 32 letters, digits or hyphens. Unique; a retried submit returns the same reference without a second row. |
| `created_at` | ISO 8601 time the server received the order. |
| `name` | Customer name as entered (max 100 characters). |
| `contact_method` | `Telegram` or `Email`. |
| `contact` | Telegram handle or email address (max 120 characters). |
| `notes` | Optional free text (max 1,000 characters). |
| `items_json` | JSON array of `{id, name, quantity, unitPrice}`. Prices come from `data/products.json` at submit time, not from the browser. |
| `total` | Server-calculated total in USD. |

There is **no status column**. The database cannot show whether an order has been paid, fulfilled or refunded.

## Reading orders

Open the D1 console for `xs-orders`, or run locally with `wrangler d1 execute xs-orders`:

    SELECT reference, created_at, name, contact_method, contact, total, items_json
    FROM orders
    ORDER BY created_at DESC;

To find one order by the reference a customer gives you:

    SELECT * FROM orders WHERE reference = 'XS-XXXXXX';

Use `contact` to reach the customer on their chosen channel. Telegram handles can be shared with a leading `@` or without it, so check both forms.

## Handling an order today

1. Match the reference the customer quotes to a row.
2. Confirm the items and total against the catalog.
3. Contact the customer on `contact_method` to take payment or confirm delivery. Payment is not collected by the site; the payment link in `assets/js/config.js` is empty and the CWallet checkout is deferred (see the open issues).
4. Credits are delivered to the customer's XSID once payment is confirmed (wording used on `support.html`).
5. Record what you did outside the repo, because the database has no status field.

## Lost reference IDs

The support page asks customers to message Telegram with the contact details they used. Search `contact` for those details, then confirm with the customer before sharing the reference.

## Test orders

Do not submit test orders against production without agreement. If one is needed, use a reference that is clearly a test (for example `XS-TEST-0001`), and delete it afterwards:

    DELETE FROM orders WHERE reference = 'XS-TEST-0001';

## Not covered here (needs owner decisions)

- Refund and cancellation policy
- Payment confirmation and status tracking
- Retention or deletion of customer contact data
- Who covers orders out of hours

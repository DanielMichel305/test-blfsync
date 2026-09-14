### Giving history transactions

`GET /payments` now returns one row per financial ledger event in `payments`; it no longer returns one checkout request with nested `ledgerEvents`. Render each returned row directly. A recurring renewal therefore appears as a new row with its own ledger UUID and `occurredAt` value.

Each row contains:

- `id`: the ledger transaction UUID used by `GET /payments/{transactionId}`
- `eventType` and ledger `status` (`pending`, `confirmed`, or `failed`)
- signed `amountMinor` and `amount`; collections and reinstatements are positive, successful refunds and dispute withdrawals are negative, and failed/pending events are zero
- `currency`, provider occurrence time in `occurredAt`, and database receipt time in `recordedAt`
- nullable `paymentRequestId`, `subscriptionId`, and `commitmentId`, plus a compact nullable `track`
- an allowlisted `receipt` object; provider IDs and raw provider metadata are never exposed

Use `occurredAt` for the displayed transaction date. `startDate`, `endDate`, and `sortOrder` all operate on `occurredAt`. A transaction remains valid and visible when `paymentRequestId` is null. Available `eventType` values are successful/failed collections, refund states, and dispute fund withdrawals/reinstatements; checkout and subscription lifecycle bookkeeping is excluded.

The detail route is transaction-oriented: pass `payments[].id` to `GET /payments/{transactionId}`. Do not pass a payment-request ID and do not infer a parent checkout status from transaction rows.

### Checkout-session administration

Checkout attempts are a separate admin/analytics resource:

- `GET /checkout-sessions` supports `page`, `limit`, `userId`, `trackId`, `status`, `paymentType`, `startDate`, `endDate`, and `sortOrder`. Its date range and sorting use checkout-request `createdAt`.
- `GET /checkout-sessions/{paymentRequestId}` returns one sanitized checkout attempt.

Checkout-session rows expose the user, track, payment type/interval, requested amount, request status, attempt/completion timestamps, failure reason, created/updated timestamps, and safe `mode`/`submitType` metadata. They do not expose Stripe IDs, checkout URLs, customer/product identifiers, idempotency keys, redirect URLs, or raw metadata. Both endpoints require the `admin` role and must not be used as the member-facing giving-history source.

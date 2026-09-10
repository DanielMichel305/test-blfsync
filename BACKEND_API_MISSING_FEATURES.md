# Remaining Backend API Contract Work

Reviewed against the backend-provided `openapi copy.yaml` on 2026-09-10.
Analytics features are intentionally excluded from this handoff.

## Executive summary

The updated specification resolves the previously requested payment history,
payment reconciliation, referrals, public content, guest checkout, contact,
field updates, invitation pagination, announcement restore, and administrator
user-activity endpoints. The remaining work is primarily response-schema
completeness. The frontend does not infer undocumented fields.

## P0 — Commitment list items must be typed

Affected operations:

- `GET /subscriptions`
- `GET /users/{id}/commitments`

Both return `CommitmentPage`, but `CommitmentPage.commitments.items` is currently
declared as `type: object` with `additionalProperties: true` even though a
`Commitment` schema already exists.

Required change:

```yaml
CommitmentPage:
  allOf:
    - $ref: '#/components/schemas/Pagination'
    - type: object
      required: [commitments]
      properties:
        commitments:
          type: array
          items:
            $ref: '#/components/schemas/Commitment'
```

This blocks a reliable authenticated commitment/subscription list and the
commitment table on the administrator user-detail page.

## P0 — Profile fields must be returned by the User contract

`PATCH /auth/profile` accepts `phone`, `referralSource`, and
`communicationOptIn`, but `GET /auth/profile` returns `User`, and `User` does not
define those fields. The frontend therefore cannot prefill the form, distinguish
`false` from missing, or verify persisted values after a save.

Required change: add these fields to `User` and return them from both GET and
PATCH profile responses.

```yaml
phone:
  type: string
  nullable: true
referralSource:
  type: string
  nullable: true
communicationOptIn:
  type: boolean
```

## P1 — Payment nested objects need stable schemas

`Payment.commitment`, `Payment.track`, `Payment.lifecycle`,
`Payment.failure`, and every `ledgerEvents` item are arbitrary objects. Core
payment status, amount, currency, interval, and receipt are usable, but the UI
cannot safely show the associated track, lifecycle timestamps, failure reason,
or ledger history.

Required change: define and reference explicit schemas. At minimum:

- Track: `id`, `name`
- Commitment: `id`, `status`
- Lifecycle: creation, completion, expiry, refund timestamps
- Failure: safe user-facing `code` and `message`
- Ledger event: stable `id`, `type`, `amountMinor`, `currency`, `createdAt`

## P1 — Field-update page items must reference FieldUpdate

`FieldUpdatePage.fieldUpdates.items` is an arbitrary object despite the
existence of the `FieldUpdate` schema.

Required change:

```yaml
fieldUpdates:
  type: array
  items:
    $ref: '#/components/schemas/FieldUpdate'
```

This blocks a type-safe public field-update feed and administrator lifecycle
management list.

## P1 — Invitation pagination fields must be required

`GET /invitations` documents `total`, `page`, `limit`, and `totalPages`, but only
`invitations` is required. All other paginated response schemas inherit the
required pagination fields from `Pagination`.

Required change: make the response an intersection of `Pagination` and the
invitation array, or add all five fields to `required`. The frontend currently
normalizes missing values defensively, but the server should always return them.

## P1 — Track commitment pagination is incomplete

`MinistryTrackCommitments` requires `page`, `limit`, and `total_commitments`, but
does not expose `totalPages`. Add `totalPages`, or replace the custom pagination
fields with the shared `Pagination` schema. This is needed for accurate paging
on large subscriber/commitment tables.

## P1 — Guest checkout return parameters must be guaranteed

`POST /guest-checkouts` returns a short-lived `verificationToken`, and
`GET /guest-checkouts/{id}/payment` requires that token. The contract does not
guarantee which identifiers are present on the Stripe success/failure redirect.
Browser local storage works only in the same browser and can be cleared.

Required change: document and implement the hosted-checkout return URLs so the
success URL contains at least:

- `guestCheckoutId` (or `guest_checkout_id`)
- the signed verification token
- `paymentRequestId` where available

For authenticated checkout, guarantee `paymentRequestId` on the return URL.
Do not rely solely on client storage for reconciliation.

## P2 — Public ministry-track enums should match managed tracks

`PublicMinistryTrack.target_period` is an unconstrained string, while the
managed `MinistryTrack` schema uses `Monthly | Quarterly | Annually`. Apply the
same enum publicly so adapters do not need a fallback value.

## P2 — Update-profile success response should be explicit

The updated operation appears to return `{ user: User }`, but this should remain
an explicitly named response schema and include the complete post-update user.
That makes generated clients and cache updates deterministic.

## Resolved by this specification

- Authenticated commitment listing
- Authenticated payment history and receipts
- Payment reconciliation by payment request
- Administrator user payments and prayer-wall activity
- Referral list/create/detail/resend
- Public ministry tracks, announcements, and testimonies
- Guest one-time checkout and signed reconciliation
- Contact inquiry submission
- Public/admin field updates
- Invitation search/filter/sort/pagination
- Announcement restore

No analytics endpoints or analytics requirements are included in this document.

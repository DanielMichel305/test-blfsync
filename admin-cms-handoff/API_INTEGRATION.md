# Frontend API integration and contract notes

The checked-in `openapi copy 2.yaml` is transcribed operation by operation in [API_CONTRACTS.md](API_CONTRACTS.md). The browser implementation lives in `src/api/domains.ts`, with fetch/refresh/error handling in `src/api/client.ts` and TanStack Query hooks in `src/api/hooks.ts`. All paths below are relative to `VITE_API_BASE_URL` or its default `http://localhost:3001/v1`. The UI sends bearer access tokens for authenticated requests.

| Admin area | Reads | Writes |
| --- | --- | --- |
| Prayer moderation | `GET /prayer-wall/manage/threads`, `/threads/{id}`, `/comments`, `/comments/{id}` under `/prayer-wall/manage` | `DELETE /prayer-wall/manage/threads/{id}` and `/comments/{id}` with JSON `{reason}`; `PATCH` corresponding `/restore` |
| Tracks | `GET /ministry-tracks`, `/{id}`, `/{id}/commitments`; `GET /units` | `POST/PATCH/DELETE /ministry-tracks`; `POST /units` |
| Users | `GET /users`, `/{id}`, `/{id}/badges`, `/{id}/commitments`, `/{id}/payments`, `/{id}/prayer-activity`; `GET /checkout-sessions?userId=...` | `PATCH/DELETE /users/{id}`, `POST /users/{id}/resend-invite`; `DELETE /subscriptions/{id}`, `DELETE /checkout-sessions/{id}`; prayer item deletions |
| Invitations | `GET /invitations` | `POST /invitations`, `POST /invitations/{id}/resend`, `POST /invitations/{id}/revoke` |
| Announcements | `GET /announcements/manage` | `POST /announcements`, `PATCH/DELETE /announcements/{id}`, `PATCH /announcements/{id}/restore` |
| Testimonies | `GET /testimonies/manage` | `POST /testimonies`, `PATCH/DELETE /testimonies/{id}` |
| Field updates | `GET /field-updates` and optionally `/{id}` | `POST /field-updates`, `PATCH/DELETE /field-updates/{id}` |
| Badges | `GET /badges`, optionally `/{id}` | `POST /badges`, `PATCH/DELETE /badges/{id}`, `PATCH /badges/{id}/retire` |
| Notifications | `GET /notifications/manage`, optionally `/{id}` | `POST /notifications/manage` |
| Audit | `GET /logs` | None |

## Transport and query behavior

- `apiRequest` sends `Accept: application/json`. Non-`FormData` bodies are JSON with `Content-Type: application/json`; native `FormData` lets the browser set multipart boundaries. `withQuery` omits undefined, null, and empty-string values and stringifies booleans/numbers.
- User create/update, profile update, and testimony create/update use multipart `FormData`, even with no file. Array values are repeated fields; `null` is encoded as an empty string. Field updates use JSON unless a `media` file is present, then multipart. A CMS backend client should not assume JSON for all mutations.
- The shared list UI uses `page`, `limit` (10/20/50/100 choices), search and section-specific filters. Lists usually receive `{records, total, page, limit, totalPages}` with a different record key per model. Exact wrapper names are in `DATA_MODELS.md`. `placeholderData` holds previous pages for many admin queries.
- Mutations invalidate related TanStack Query keys so lists and details refresh. This is client cache behavior, not a server event stream. Payments bypass HTTP cache using `cache:'no-store'` where implemented. Errors are parsed as `{error, code, details}`; network failure gets a synthetic `ApiError` with status `0`.
- OpenAPI's per-operation parameter, body, response, and status details remain authoritative for the documented contract. The table above records **actual frontend wiring** and may include calls not present in the spec.

## Contract gaps and implementation cautions

1. **Checkout sessions:** `src/api/domains.ts` calls `GET /checkout-sessions?userId=...` and `DELETE /checkout-sessions/{id}`, but neither path appears in `openapi copy 2.yaml`. The frontend's `AdminCheckoutSession` type expects `paymentRequestId` (falls back from `id`), optional track name/title, payment type/interval/amount/currency/status/timestamps, and a paginated `checkoutSessions` array. The UI labels a DELETE action “Expire”; the adapter uses that same DELETE for both expire and removal. A separate expiry contract is not documented here. The displayed “Expiry” value is `completedAt || updatedAt`, not a proven expiration timestamp.
2. **Field update email:** `fieldUpdateDeliveryAdapter.getRecipientCount()` always returns `null`; `publish()` always reports `delivered:false` and sends no request. The UI keeps a client-only union audience (`ministry-track-subscribers`, `all-subscribers`, `all-users`, roles, specific user IDs). No email template, recipient-count, or delivery endpoint is connected. Do not model the checkbox as a persisted `FieldUpdate` field.
3. **Unit creation:** the frontend expects `POST /units` to return either a unit directly or `{unit}`; `GET /units` may return an array or `{units}`. The adapter normalizes both. Check the OpenAPI response before committing to one shape in another client.
4. **Invitation list:** the frontend supplies pagination defaults if `GET /invitations` omits `total`, `page`, `limit`, or `totalPages`. Those defaults are a compatibility shim, not proof of reliable server pagination.
5. **Track metric unit:** `CreateMinistryTrackRequest` requires `unitId`; `UpdateMinistryTrackRequest` accepts the fixed `metricUnit` enum instead. The frontend follows that split. A standalone CMS needs both representations when it offers create and edit.
6. **Admin user creation:** `POST /users` exists in the adapter and spec, but the current Users UI has no create action. A CMS may choose to expose it, but doing so would add behavior beyond this frontend.
7. **Authorization:** route gating in React is convenience only. A standalone CMS must rely on server authorization for every admin operation; operation descriptions in OpenAPI identify which are admin-only.

## Source pointers

`src/api/domains.ts` maps path/method/encoding; `src/api/hooks.ts` and `src/api/queryKeys.ts` map cache keys and invalidation; `src/components/admin/` maps fields and controls; `src/api/fieldUpdateDelivery.ts` contains the email placeholder; `openapi copy 2.yaml` contains the checked-in formal contract.

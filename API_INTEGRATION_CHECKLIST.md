# Better Life Friends API Integration Checklist

Use this checklist to implement and verify the API migration. This document is planning and verification guidance only; it does not implement the integration.

## 1. Baseline and contract

- [ ] Confirm `openapi.yaml` is the source of truth for endpoint paths, request bodies, responses, permissions, and enum values.
- [ ] Install dependencies only when implementation begins:
  - [ ] `@tanstack/react-query`
  - [ ] `openapi-typescript` or an equivalent OpenAPI type generator
- [ ] Generate TypeScript types from `openapi.yaml`.
- [ ] Confirm the API base URL is configurable through `VITE_API_BASE_URL`, defaulting to `/v1`.
- [ ] Record the current baseline visual behavior for the landing page, dashboard, donation modal, prayer wall, header, and admin panel.

## 2. API access layer

- [ ] Create one centralized HTTP client for JSON and multipart requests.
- [ ] Add bearer-token injection to authenticated requests.
- [ ] Normalize documented API errors, including HTTP status, `error`, `code`, and field-level `details`.
- [ ] Implement one automatic access-token refresh through `/auth/refresh` after an authentication failure.
- [ ] Clear the session and cached private data when refresh fails.
- [ ] Implement access-layer functions for every supported API domain:
  - [ ] Authentication, profile, 2FA, refresh, and logout.
  - [ ] Ministry tracks.
  - [ ] Checkout creation and recurring subscription management.
  - [ ] Prayer wall threads, comments, reactions, and moderation.
  - [ ] Notifications and administrative notifications.
  - [ ] Users, invitations, audit logs, announcements, testimonies, and badges for admin workflows.
- [ ] Do not add client calls for `/webhooks`; Stripe webhook handling belongs on the backend.

## 3. TanStack Query setup

- [ ] Add `QueryClientProvider` at the application root.
- [ ] Define stable query keys for authentication, tracks, subscriptions, badges, notifications, prayer wall, announcements, testimonies, and admin resources.
- [ ] Create query hooks above the API access functions.
- [ ] Create mutation hooks for all supported writes.
- [ ] Invalidate or update related queries after successful mutations.
- [ ] Keep loading, error, and mutation-pending state available to existing UI states without redesigning the screens.
- [ ] Clear private query data on logout or failed session restoration.

## 4. Authentication wiring

- [ ] Replace mock persona login with `/auth/login`.
- [ ] Add only the controls required by the API contract while preserving the existing visual structure:
  - [ ] Email.
  - [ ] Password.
  - [ ] Six-digit 2FA code when `/auth/login` returns `202`.
- [ ] Wire `/auth/verify-2fa` and store the returned session tokens/user.
- [ ] Restore the session through the stored refresh token and `/auth/profile`.
- [ ] Wire logout through `/auth/logout` before clearing local session state.
- [ ] Map API roles `family` and `friend` to the donor-facing experience; preserve `admin` routing.
- [ ] Remove `SEED_DONORS`, quick-login behavior, and local current-user persistence.

## 5. API-to-UI model adapters

- [ ] Map `User` to the existing donor-facing display model without fabricating unsupported fields.
- [ ] Map `MinistryTrack` to the current track display contract.
- [ ] Calculate existing track progress from `current_metric_level / target_metric_level`.
- [ ] Display progress using the API `metricUnit` rather than the mock monetary `annual_budget` semantics.
- [ ] Map API badges, notifications, prayer-wall entities, announcements, and testimonies to the existing presentation contracts.
- [ ] Keep adapters pure and unit-testable.

## 6. Supported donor flows

### Ministry tracks

- [ ] Load tracks through the API/query layer.
- [ ] Preserve existing cards, filters, calculator, and methodology presentation.
- [ ] Wire admin track updates to `PATCH /ministry-tracks/{id}`.
- [ ] Wire admin track creation/deletion only where the existing UI exposes those actions.
- [ ] Remove local seeded tracks and local track writes.

### Donations and subscriptions

- [ ] Replace `processDonation` with `POST /subscriptions`.
- [ ] Generate a UUID idempotency key for each checkout attempt.
- [ ] Send whole USD amounts, `subscriptionType`, `interval`, and `ministryTrackId` exactly as documented.
- [ ] Redirect to the returned Stripe Checkout URL.
- [ ] Represent pending, completed, failed, and expired checkout states using API responses.
- [ ] Wire recurring subscription update, cancellation, detail, and billing-portal actions where an API subscription ID is available.
- [ ] Remove simulated card, wallet, Fawry, Stripe-input, local transaction, and local track-raised updates.

### Prayer wall

- [ ] Load paginated threads from `/prayer-wall` using the selected prayer/praise filter.
- [ ] Create threads through `POST /prayer-wall`.
- [ ] Load comments through the documented thread/comment endpoints.
- [ ] Create comments through `POST /prayer-wall/{id}/comments`.
- [ ] Wire like and join-prayer controls to the documented reaction endpoints.
- [ ] Use the API reaction summary for counts and viewer state.
- [ ] Wire user-owned deletion and admin moderation actions where exposed.
- [ ] Remove prayer-wall seed posts, replies, reaction counts, and localStorage persistence.

### Notifications

- [ ] Load the authenticated notification feed through `/notifications`.
- [ ] Use API `unreadCount` for the header indicator.
- [ ] Wire individual read and read-all mutations.
- [ ] Invalidate or update the notification query after read mutations.
- [ ] Remove mock milestone generation and local notification persistence.

## 7. Admin flows

- [ ] Load users from `/users` with documented pagination/filter parameters.
- [ ] Load and manage invitations through `/invitations` and its lifecycle endpoints.
- [ ] Load and manage announcements through the management endpoints.
- [ ] Load and manage testimonies through the management endpoints, including multipart image fields where required.
- [ ] Load, create, update, retire, and delete badge definitions through the documented badge endpoints.
- [ ] Load and moderate prayer threads/comments through the moderation endpoints.
- [ ] Load audit logs through `/logs` if the existing admin UI exposes audit history.
- [ ] Replace admin track editing with API mutations using metric fields.
- [ ] Remove the local admin update publisher and donation simulator unless a matching backend contract is added.

## 8. Explicit API clarification blockers

Do not invent mappings or retain mock fallbacks for these existing features. Record each item as blocked until the API owner documents an endpoint or explicit mapping:

- [ ] Authenticated user subscription listing after reload.
- [ ] User transaction/history/receipt data.
- [ ] Leaderboard data.
- [ ] Referral records and referral-based badge qualification.
- [ ] Landing-page live counters.
- [ ] Contact-form submission.
- [ ] The current “Ministry Field Updates” feed shape, media, and category behavior.
- [ ] Persistence for profile phone, referral source, and communication opt-in.
- [ ] Public unauthenticated track loading.
- [ ] Guest donation behavior.

## 9. Mock removal audit

- [ ] Remove all imports of `db.ts` from application and components.
- [ ] Remove seeded entities and localStorage-backed application data.
- [ ] Remove local badge calculation and milestone notification logic.
- [ ] Remove local referral, transaction, subscription, track, donor, update, leaderboard, and notification writes.
- [ ] Retain localStorage only for non-server preferences such as theme/language, if still desired.
- [ ] Confirm no `window.location.reload()` is required for query synchronization.

## 10. Verification and acceptance

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] No production code imports seeded mock data or `db.ts`.
- [ ] Authentication works for password login, optional 2FA, refresh, logout, and expired sessions.
- [ ] API permission failures show an appropriate existing error state.
- [ ] Track progress and metric labels match API values.
- [ ] Checkout uses USD Stripe Checkout and never stores payment credentials in the browser mock layer.
- [ ] Prayer-wall filters, pagination, comments, reactions, and deletion remain functional.
- [ ] Notification counts and read states remain consistent after refresh.
- [ ] Admin mutations update the Query cache without a full page reload.
- [ ] Existing visual layout, styles, navigation, responsive behavior, and animations remain unchanged except for controls required by the API contract.
- [ ] Every item in the API clarification blocker list is either resolved by backend documentation or explicitly excluded from the completed integration scope.

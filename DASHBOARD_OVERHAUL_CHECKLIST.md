# Dashboard Subscription Management & Referral Access Checklist

## Subscription data and API integration

- [x] Define a typed recurring-commitment/subscription shape in `openapi copy 2.yaml` for the fields used by the dashboard: track ID, subscription ID, amount, interval, and status.
- [x] Regenerate `src/api/generated.ts` from the updated OpenAPI specification.
- [x] Load the authenticated user's recurring commitments in the application shell instead of passing an empty subscriptions array to the dashboard.
- [x] Normalize active recurring commitments into a dashboard-friendly subscription model keyed by ministry track ID.
- [x] Treat the API's subscription status as authoritative; do not infer an active subscription solely from payment history.
- [x] Invalidate the subscription list and affected subscription detail queries after an update or cancellation.

## Support ministry-track cards

- [x] Keep Checkout for new support outside the dashboard subscription-management section.
- [x] Show only the user's active recurring subscriptions in the dashboard subscription-management section.
- [x] Add an inline Modify subscription control that opens the amount, frequency, and cancellation form.
- [x] Show the current recurring amount and billing interval in the active-track state.
- [x] Allow the user to edit the recurring amount and select monthly or annual billing.
- [x] Validate the amount before submission, including the annual minimum of twelve times the track's monthly minimum.
- [x] Submit edits with `PATCH /subscriptions/{id}` and a newly generated idempotency UUID.
- [x] Display pending/submitting feedback while an edit or cancellation request is in progress.
- [x] Handle `unchanged` and `updated` responses as successful authoritative outcomes.
- [x] When an update returns `requires_action`, direct the user to its billing-portal URL.
- [x] Present clear, non-duplicative error feedback for validation, conflict, authorization, rate-limit, and service failures.
- [x] Add a cancellation action using `DELETE /subscriptions/{id}`.
- [x] Require explicit confirmation before cancelling a recurring subscription.
- [x] Refresh the card state after cancellation so the track returns to the normal Checkout action only after the API confirms it is no longer active.

## Refer Friends access control

- [x] Add one shared client-side predicate that grants referral visibility to `family` and `admin` API roles only.
- [x] Use `currentUser.api_role`, rather than the legacy display-oriented `role`, for this decision.
- [x] Hide Refer Friends from the desktop header for Friends.
- [x] Hide Refer Friends from the authenticated mobile-header menu for Friends.
- [x] Keep the referrals page/tab available for Family and admin users.
- [x] Guard dashboard sub-tab rendering so a Friend user with stale `referrals` state is redirected to the dashboard overview and the referrals panel is not mounted.
- [x] Leave API-level authorization unchanged; the backend remains responsible for enforcing access.

## Localization, accessibility, and quality checks

- [x] Add English and Arabic copy for all new management labels, validation feedback, status messages, cancellation confirmation, and referral-access behavior.
- [x] Ensure inline controls have associated labels, accessible error/status announcements, disabled states during mutations, and keyboard-operable confirmation controls.
- [x] Add tests for unsubscribed versus active track actions, edit payloads, validation, mutation states, billing-portal handoff, cancellation confirmation, and cache refreshes.
- [x] Add role-based tests for Friend, Family, and admin referral navigation visibility and direct sub-tab protection.
- [x] Run `npm test`.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.

## Confirmed scope

- [x] Active recurring subscriptions can be edited for amount and monthly/annual interval.
- [x] Active recurring subscriptions can be cancelled from the dashboard.
- [x] Management controls appear inline on the associated ministry-track card.
- [x] Family and admin users can access Refer Friends; Friend users cannot.
- [x] Moving a subscription to a different ministry track is out of scope because the current API does not support it.

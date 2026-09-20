# Badge Admin Dashboard — Implementation Checklist

## Contract and types

- [x] Update `openapi copy 2.yaml` so every badge `triggerKey` enum includes `action.referral`.
- [x] Regenerate `src/api/generated.ts` using the project API-generation script.
- [x] Confirm badge API clients and React Query hooks continue to use the existing create, update, retire, and delete endpoints; no backend endpoint changes are required.
- [x] Define a local, discriminated badge-rule form type so the UI represents supported configurations without exposing arbitrary JSON.

## Rule-builder form

- [x] Replace the raw `requirementConfig` JSON textarea in the Badges admin tab.
- [x] Add common fields for code, name, description, and display order.
- [x] Trim text inputs before submission and validate API-aligned constraints: code/name 1–100 characters, description 1–2,000 characters, and a non-negative integer order.
- [x] Default newly created badges to inactive and label the primary action **Save draft**.
- [x] Add a trigger selector with Track duration, Login, Donation, and Referral options.
- [x] For Track duration, collect a positive whole-number target-days value and let the admin choose either Any track or a specific track.
- [x] Implement a searchable, paginated specific-track picker that queries all existing tracks and visibly labels inactive tracks.
- [x] When editing a draft with a selected track outside the active picker results, resolve and show that selected track.
- [x] For Login, Donation, and Referral, offer Consecutive and Rolling-window modes.
- [x] In Consecutive mode, collect positive whole-number count and maximum-interval-days values.
- [x] In Rolling-window mode, collect positive whole-number count and window-days values.
- [x] Reset incompatible rule values when the trigger or action mode changes.
- [x] Serialize each form variant to the exact strict `requirementConfig` accepted by the API, omitting all incompatible keys.

## Lifecycle and editing

- [x] Allow full rule editing for drafts: code, trigger, and requirement configuration must be sent together when either trigger field changes.
- [x] Render code and rule controls read-only for locked definitions, while retaining permitted metadata edits (name, description, order, and active state).
- [x] Classify list entries using API lifecycle data:
  - [x] **Draft**: inactive and not locked.
  - [x] **Active**: active.
  - [x] **Retired**: inactive and locked.
- [x] Give drafts Edit, Activate, and Delete actions.
- [x] Give active badges a Retire action.
- [x] Keep retired badges editable only where the API permits and offer Delete, subject to the server’s no-awards restriction.
- [x] Make activation a dedicated, confirmed action that patches only `{ "isActive": true }` and clearly warns that code and rule settings become immutable.
- [x] Preserve actionable display of API errors, including duplicate codes, invalid rule configurations, missing tracks, and deletion conflicts.

## Tests and verification

- [x] Add unit tests for form validation and serialization for all trigger/mode variants, including referral.
- [x] Cover text trimming and length limits, non-negative order, and all positive-integer rule fields.
- [x] Verify Track duration sends `trackId: null` for Any track and sends the selected UUID for a specific track, including an inactive track.
- [x] Verify trigger/mode changes remove stale incompatible configuration fields.
- [x] Add component coverage for saving a new draft, editing a draft rule, and rendering locked rule controls read-only.
- [x] Add component coverage for activation confirmation and its minimal update payload.
- [x] Run `npm run lint` and `npm test`.

## Decisions already made

- [x] New badges are saved as drafts by default.
- [x] Referral badges are included now, even though the checked-in generated API client currently lacks that enum value.
- [x] The guided builder applies to creation and editable drafts; locked rules remain read-only.
- [x] Activation is an explicit, confirmed operation.
- [x] The specific-track picker includes all tracks and highlights inactive ones.
- [x] Badge award evaluation, scheduling, and backend endpoints are out of scope.

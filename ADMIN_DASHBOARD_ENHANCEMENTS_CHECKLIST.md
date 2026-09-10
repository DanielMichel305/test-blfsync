# Admin Dashboard Enhancements

## Summary

Expand the admin panel into a complete, paginated management workspace while allowing administrators to use all normal donor features. Use `/users/:id` for user details and preserve the existing OpenAPI-driven API/query architecture.

## Implementation Checklist

### 1. Shared admin list infrastructure

- [ ] Create reusable admin search, filter, page-size, pagination, loading, empty-state, and error components.
- [ ] Use `page` and `limit` consistently, matching the current OpenAPI documentation. Backend offset calculations remain internal.
- [ ] Reset the page to `1` whenever search or filters change.
- [ ] Preserve query state in React Query keys so navigation and back/forward behavior work correctly.
- [ ] Add documented search/filter controls for:
  - Tracks: search, active state, sorting.
  - Users: search, role, active state, sorting.
  - Announcements: search, status, visibility, audience, type, priority.
  - Testimonies: search, status, visibility.
  - Badges: search, active state, sorting.
  - Prayer moderation: search and visible/removed status.
  - Notifications: search, origin, audience.
  - Audit logs: user, entity, action, date range, sorting.
- [ ] Extend the invitations API contract to support the same paginated/searchable list behavior, then wire the UI to it.

### 2. Ministry tracks

- [ ] Replace the tracks-only edit display with a full admin track form.
- [ ] Support editing name, description, cover URL, current metric, target metric, minimum contribution, cost per unit, metric unit, target period, and active state.
- [ ] Add a “Create ministry track” action using the existing `POST /ministry-tracks` hook.
- [ ] Validate required fields and numeric constraints before submission.
- [ ] Refresh the paginated track list after create/update/delete.
- [ ] Add confirmation before deleting or deactivating a track where applicable.
- [ ] Ensure changes to `target_period` and metric units are reflected everywhere the track is displayed.

### 3. User list and `/users/:id` detail view

- [ ] Make each user row navigable to `/users/:id`.
- [ ] Add URL-based route handling without losing the admin panel context.
- [ ] Load the selected user through `GET /users/{id}`.
- [ ] Add editable fields supported by `UpdateUserRequest`: first name, last name, email, password, role, active state, and profile picture.
- [ ] Add explicit Save, Deactivate, Reactivate, Delete, and—when applicable—Resend invitation actions.
- [ ] Prevent accidental self-deletion and require confirmation for deactivation/deletion.
- [ ] Show account metadata: role, active state, 2FA state, invitation state, last login, created date, and updated date.
- [ ] Display the user’s active badge progress using the existing user-badges endpoint.
- [ ] Add commitments and prayer-wall activity sections with clear “not available from the current API” states; do not infer these records from unrelated global lists.
- [ ] Invalidate the user detail and user-list queries after edits or status changes.

### 4. Announcements and testimonies

- [ ] Add complete edit forms for existing records, including scheduling, audience/targeting, status, metadata, and testimony image fields supported by the API.
- [ ] Add an explicit Archived view/filter.
- [ ] Support archive actions for active/published records.
- [ ] Support restoring archived records to the active/published state.
- [ ] Support file removal for testimony cover images by sending `coverImageUrl: null` or an empty string as documented.
- [ ] Require a warning/confirmation modal before archive, restore, file removal, or deletion.
- [ ] Keep deletion restricted to records where the API allows it; drafts may be deleted, while published/archived announcements and archived testimonies must not be treated as permanently deletable.
- [ ] Update the API contract or add a restore endpoint for archived announcements, because the current documentation marks archived announcements immutable while the requested feature requires restoration.

### 5. Prayer moderation

- [ ] Make Comments/Threads moderation the default admin tab instead of Tracks.
- [ ] Keep threads and comments as the primary moderation view.
- [ ] Add advanced search and status filters using the documented moderation endpoints.
- [ ] Add pagination independently for thread and comment queues.
- [ ] Add actions for view details, remove, restore, and display moderation reason/source/status.
- [ ] Replace browser prompts with a proper reason/confirmation modal.
- [ ] Require a reason before moderation removal.
- [ ] Require confirmation before removal and restore.
- [ ] Refresh the relevant moderation queue after each action.

### 6. Administrator donor experience

- [ ] Allow admins to access the normal dashboard, overview, prayer wall, donation flow, notifications, and profile areas.
- [ ] Keep the admin panel available as an additional navigation destination.
- [ ] Update desktop and mobile navigation so admin users see both donor-facing navigation and the admin-panel entry.
- [ ] Ensure admins can create prayer threads, comments, reactions, and donations using the same authenticated flows as other users.
- [ ] Include admins in the normal notification feed instead of excluding them by role.
- [ ] Preserve admin authorization for management actions independently from donor-facing access.

### 7. Query, API, and model updates

- [ ] Add or complete typed query hooks for paginated track, user, invitation, announcement, testimony, badge, moderation, notification, and log queries.
- [ ] Add detail-query keys and invalidation behavior for users, tracks, announcements, and testimonies.
- [ ] Extend local view models only where required; keep API field names and enum values aligned with OpenAPI.
- [ ] Regenerate `src/api/generated.ts` after any OpenAPI changes.
- [ ] Avoid using the parent-level `limit: 100` data as the admin source of truth; each tab should own its current page, filters, and results.

## Test Plan

- [ ] Verify every admin tab loads page 1 and navigates through later pages.
- [ ] Verify searches and filters call the API with the documented parameters and reset pagination.
- [ ] Create a track, edit every supported track field, change its period, and verify the updated display.
- [ ] Edit a user, deactivate/reactivate the user, and confirm list/detail cache updates.
- [ ] Open `/users/:id` directly and verify refresh/deep-link behavior.
- [ ] Confirm archive, restore, file removal, and delete warnings appear and cancel correctly.
- [ ] Verify archived content is excluded from active/public feeds.
- [ ] Remove and restore both a prayer thread and a comment with required moderation reasons.
- [ ] Log in as an admin and verify dashboard, prayer wall, notifications, and donation access.
- [ ] Run `npm run lint`, `npm run build`, and regenerate API types successfully.

## Assumptions and Dependencies

- The canonical user-detail route is `/users/:id`.
- The current frontend-only constraint means commitments and prayer activity are shown as unavailable until user-scoped API endpoints exist.
- Pagination follows the repository’s documented `page`/`limit` contract rather than inventing a frontend-only offset model.
- Invitations require an API/OpenAPI extension because the current endpoint returns an unpaginated array.
- Announcement restoration requires a backend contract adjustment because archived announcements are currently documented as immutable.

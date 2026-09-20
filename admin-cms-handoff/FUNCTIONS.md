# Admin functions and record relationships

The admin entry point is `/admin`. The `admin_tab` URL parameter selects one of ten sections; `/users/:id`, `/tracks/:id`, and an admin visit to `/prayer-wall/:id` show details. `App.tsx` only renders the admin panel when the restored or newly signed-in user's API role is `admin`. All writes below use the backend API; there is no standalone CMS database in this repo.

| Section | Current functions | Primary records |
| --- | --- | --- |
| Comments / Threads | Moderate prayer and praise threads and comments; search/filter, view metadata, remove with required reason, restore, share/open full thread | `ManagedThread`, `ManagedComment`, `ManagedCommentPage` |
| Tracks | List/search/filter/sort; create, edit, deactivate, delete; create unit during track creation; inspect track and commitments | `MinistryTrack`, `MinistryUnit`, `Commitment` |
| Users | List/filter/sort; inspect and edit; activate/deactivate, delete, resend pending invite; inspect badges, commitments, payments, checkout sessions, prayer activity; cancel subscriptions, expire checkout, remove prayer items | `User`, `UserBadge`, `SubscriptionCommitment`, `Payment`, `PrayerActivityPage` |
| Invitations | Create/send, search/filter/sort, resend, revoke pending invitation | `Invitation` |
| Announcements | Create/edit drafts or published items; schedule, target, archive, restore, delete drafts; search/filter | `ManagedAnnouncement` |
| Testimonies | Create/edit with cover upload; schedule and associate track; archive, restore, delete drafts, remove cover; search/filter | `ManagedTestimony` |
| Field Updates | Create/edit Markdown, optional media, preview, publish, archive, restore; search/filter/sort | `FieldUpdate` |
| Badges | Create inactive definition, edit, activate, retire, delete eligible inactive definition; inspect badge progress from user detail | `Badge`, `UserBadge` |
| Notifications | Send admin notification to all, users, roles, or tracks; list/filter sent and system notifications, read counts | `ManagedNotification` |
| Audit logs | Read-only log search/filter by actor, entity, action, date and sort | `AuditLog` |

## Relationships and identity

- `User.id` is the account key. `User.role` is `admin`, `family`, or `friend`. `User.inviter` is a nullable `UserInviter`; `referralSource` is an optional UUID. `Invitation.inviterId` identifies the inviting user. These are distinct from the frontend's adapted `Donor.donor_id` and `Donor.role` values.
- `MinistryTrack.id` is referenced by subscriptions/commitments, announcements targeting tracks, testimony `ministryTrackId`, field updates, notifications, and a badge rule's optional `trackId`. A track has a metric unit, goal/current metrics, giving constraints, active flag, and timestamps. The create form submits `unitId`; the edit form submits the enum `metricUnit` from the existing track.
- `Badge` is a definition. `UserBadge` is a per-user earned/progress view. The UI counts `earned` entries and shows progress. Badge definitions have `code`, `name`, `description`, `order`, `triggerKey`, `requirementConfig`, `isActive`, and optional `definitionLockedAt`.
- Announcements use `audienceType=global|roles|tracks` with matching target arrays. Notifications use `audienceType=all|users|roles|tracks` with different matching arrays. These are separate targeting models.
- A field update belongs optionally to one ministry track and has a publisher. The form handles `mdBody` Markdown and one optional media item. Public or signed-in consumers see published updates through the same `/field-updates` collection, filtered by API role/status.
- Prayer threads own comments and reactions. Moderation records preserve `status`, `removalSource`, `removalReason`, `removedAt`, and timestamps; restoring is distinct from creating a new item.
- A user's giving detail combines account data with separate commitments, payments, checkout sessions, and subscriptions. Treat these as API-backed relations, not embedded `User` columns.

## Editor behavior and validation

### Tracks and units

Track creation requires name, `unitId`, current metric >= 0, positive integer target metric, nonnegative integer minimum monthly contribution, positive integer cost per unit, and target period `Monthly|Quarterly|Annually`. Description is capped at 500 characters, name at 100, and cover URL must be absolute when given. Creation defaults: metrics `0/1`, minimum and cost `1`, period `Annually`, active `true`. The UI can create a unit by name and then selects its returned ID. Existing tracks can be edited or deactivated via `isActive=false`. Deletion has a confirmation and may be rejected by backend constraints. Track detail shows subscriber/commitment pagination and subscription links.

### Users and invitations

The user list supports role, active state, search, sort, and pagination. Detail edits `firstName`, `lastName`, `email`, password (only sent when filled), role, and image file. The active flag is changed through a separate confirmation. It displays 2FA state, invitation pending state, inviter, last login, timestamps, and password configured flag. Self-delete is disabled in the UI. Pending invitations can be resent. User creation exists in the API adapter but **the current admin Users screen does not expose a create form**; the Invitations screen is the create/onboarding path. Invitation creation collects email, first/last name, and role; resend and revoke are separate actions. The user detail's prayer activity has client-side type/search filtering over the returned page.

### Announcements and testimonies

Announcement editor fields are title (max 100), description (max 500), type `info|warning|urgent`, priority `low|normal|high`, status `draft|published`, optional `startsAt`/`endsAt`, and audience. Role audience requires at least one role; track audience requires at least one track. End must follow start. The list also shows server-computed `visibilityState` (`draft|scheduled|active|expired|archived`). Published items can be archived; archived items restored to published with retained schedule/audience; drafts can be permanently deleted.

Testimony editor collects author name (max 100), optional location (max 150), quote (max 5000), optional ministry track, testimony date, schedule, status, and optional cover image upload. The archive/restore/delete lifecycle parallels announcements. An existing cover can be removed through the update API. See the exact `CreateTestimonyRequest`, `UpdateTestimonyRequest`, and `ManagedTestimony` schemas for nullable and response-only fields.

### Field updates

Editor fields: title (1–200 characters), tag (1–100), optional category (<=100), optional ministry track, status `draft|published`, optional publication date, required Markdown body (<=50,000 characters), and optional image/video. Media can be kept, removed, supplied by HTTPS URL with `mediaType`, or uploaded as a file. Image/video preview renders the media plus Markdown. Archived updates cannot be edited until restored; the restore action sets status to published. The list Publish button changes a draft to published without the editor's delivery options. Archiving calls `DELETE /field-updates/{id}` as a soft lifecycle action. The editor exposes an email audience UI, but delivery is a placeholder; see `API_INTEGRATION.md`.

### Badges

New definitions start inactive. Trigger keys: `ministry.track.duration`, `action.login`, `action.donation`, `action.referral`. Track duration config is `{targetDays: positive integer, trackId: UUID|null}`. Action config is either `{mode:'consecutive', count: positive integer, maxIntervalDays: positive integer}` or `{mode:'rolling_window', count: positive integer, windowDays: positive integer}`. Code/name are 1–100 characters, description 1–2000, order a nonnegative integer. Activation sets `isActive=true` and locks code, trigger, and rule; the UI subsequently sends only name, description, and order on edits. Retirement keeps awards and rule lock. Deletion is allowed only for inactive definitions without awards according to the UI/contract. See the badge reference files for evaluation semantics and lifecycle details.

### Prayer, notifications, audit

Moderation has separate thread and comment queues with `visible|removed` state, type/search filters, detail view, and required reason for a moderation removal. Restore retains the original record. Admin notification form accepts title (max 100), body (max 500), and audience: all or comma-separated user IDs, roles, or track IDs. Sent records display `origin`, audience, `readCount`, `recipientCount`, and creation time; the admin screen has no edit or delete action. Audit logs are read-only; data includes `oldValues`/`newValues` objects in the API even though the current list does not expand them.

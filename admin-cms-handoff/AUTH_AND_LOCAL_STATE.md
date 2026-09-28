# Authentication states and local UI state

## Session and access

`src/api/session.ts` holds the access token **in memory** and the refresh token in `localStorage` under `better-life.refresh-token`. Login may return an authenticated session or a two-factor challenge. The 2FA verification call obtains and stores the token pair. On app startup, `authApi.restoreSession()` requires a refresh token, calls `/auth/refresh`, then `/auth/profile`; `App.tsx` maps the returned `User` into its display `Donor` type. Admin route access requires mapped `role === 'admin'`, derived from API `User.role === 'admin'`. A nonadmin or anonymous visitor to an admin route sees the login component.

For authenticated API calls, a 401 triggers one refresh attempt shared by concurrent requests, then retries the original request once. Failed refresh or a second 401 clears both tokens, clears private query data, and dispatches `better-life:session-cleared`; `App.tsx` clears the in-memory user. Logout calls `/auth/logout` with the refresh token when present, then clears local session even if the request fails. 2FA enable/disable endpoints operate on the current profile. Do not confuse `User.twoFactorEnabled` with an active challenge: the former is account configuration, the latter is a login state.

The adapted portal `Donor.role` is only `admin|donor`, while `Donor.api_role` retains `admin|family|friend`. Admin forms and backend audience rules use **API roles**, not the display role. The app's `canAccessReferrals` helper allows family/admin; this is adjacent donor functionality, not an admin panel permission matrix.

## Navigation and persisted browser state

- `/admin?admin_tab=...` selects `prayer`, `tracks`, `users`, `invitations`, `announcements`, `testimonies`, `field-updates`, `badges`, `notifications`, or `logs`. Unknown values fall back to prayer. The tab selection is written with `history.replaceState` and read again on `popstate`.
- `/users/:id` and `/tracks/:id` select detail views and set the corresponding tab. `/prayer-wall/:id` goes to the admin thread detail when the current user is admin. Closing a user or track returns to `/admin` with the matching `admin_tab` value.
- `useAdminListState` stores each list's page, limit, search, filters, and sort in query parameters named `<scope>_<field>` (for example `users_page` and `field_updates_status`). It resets page to 1 when a filter changes. Browser Back restores these parameters. Search is sent on every change; no debounce is implemented in this helper.
- Theme is stored separately in `localStorage` key `theme`. It has no effect on API data or permissions.

## Ephemeral state

Forms, edit targets, confirmation targets, moderation removal reasons, feedback messages, previews, field update email audiences, selected uploads, and user-detail pagination live in React component state. They are lost on unmount or reload. `ConfirmDialog` holds no entity data itself; callers hold the pending target and only mutate after confirmation. Unsaved field-update changes remain in the mounted form after a save error. The editor's email audience and estimated recipient count are client-only placeholders and do not survive a save.

TanStack Query stores server responses in memory, with separate keys for each list/filter combination, detail, user activity, and managed vs public feeds. It is a fetch cache, not a source of truth. `src/api/queryKeys.ts` lists those namespaces; `src/api/queryClient.ts` clears private data when a session ends.

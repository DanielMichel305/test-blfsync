# Inviter Reference Implementation Checklist

## Goal

Replace the free-text `User.referralSource` value with the nullable UUID of the user who invited the account. Return a safe inviter summary with every API response that uses the shared `User` representation.

## Response Contract

- [ ] Keep the API and database field name `referralSource` / `referral_source`.
- [ ] Change its meaning to the inviter's UUID, or `null` when the user was created manually or has no known inviter.
- [ ] Add the nullable `inviter` response object:

  ```json
  {
    "referralSource": "inviter-user-uuid-or-null",
    "inviter": {
      "id": "inviter-user-uuid",
      "firstName": "…",
      "lastName": "…",
      "profilePictureUrl": "…"
    }
  }
  ```

- [ ] Return `inviter: null` whenever `referralSource` is null, the inviter is unavailable, or the inviter was deleted.
- [ ] Do not expose the inviter's email, role, account status, password state, or other private fields.

## Database and Models

- [ ] Add a new Sequelize migration that replaces `users.referral_source` with a nullable UUID foreign key to `users.id`.
- [ ] Use `ON DELETE SET NULL` so removing an inviter does not block or delete invited users.
- [ ] Add an index on `users.referral_source` for joins and deletion-time foreign-key checks.
- [ ] Discard legacy free-text `referral_source` values during conversion.
- [ ] Backfill users with accepted invitations using `invitations.accepted_user_id` and `invitations.inviter_id`.
- [ ] Implement a reversible migration: the down migration restores a nullable string column; discarded legacy text does not need recovery.
- [ ] Change `User.referralSource` to a nullable UUID field and add the self-referencing `inviter` association.
- [ ] Add the inverse `invitedUsers` association on `User`, following repository association conventions.

## Invitation and User Flows

- [ ] In invitation acceptance, set the created user's `referralSource` to `invitation.inviterId` in the existing transaction.
- [ ] Leave `referralSource` null for direct/admin user creation.
- [ ] Remove `referralSource` from admin user-update and self-profile-update validation schemas and OpenAPI request schemas.
- [ ] Remove update-service handling that allows the field to be set or cleared by profile edits.
- [ ] Load the safe inviter association wherever a `User` response is serialized: login, 2FA completion, authenticated profile, invitation acceptance, user detail, user list, and user-update responses.
- [ ] Ensure the nested inviter profile image uses the same signed/public URL conversion as other profile images.
- [ ] Keep password-hash redaction and the derived `hasPassword` / `invitationPending` fields unchanged.

## API Documentation

- [ ] Update the OpenAPI `User` schema: `referralSource` is a nullable UUID and `inviter` is a nullable safe summary.
- [ ] Remove `referralSource` from `UpdateUserRequest` and `UpdateProfileRequest`.
- [ ] Update `FRONTEND_API_HANDOFF.md` to describe the UUID relationship and the nullable inviter summary.
- [ ] Mark this as a breaking contract change for clients that submit or render `referralSource` as free text.

## Verification

- [ ] Add a migration test proving legacy text is cleared and accepted-invitation users are backfilled.
- [ ] Add an invitation-acceptance test proving the inviter UUID is stored.
- [ ] Add a direct/admin creation test proving `referralSource` and `inviter` are null.
- [ ] Add serialization tests for login, profile, and user-detail responses with an inviter summary.
- [ ] Assert no password hash or private inviter fields appear in responses.
- [ ] Assert profile and admin user updates reject `referralSource`.
- [ ] Add deletion coverage proving that deleting an inviter clears the invited user's relationship without deleting that user.
- [ ] Run the focused unit/route tests and the relevant E2E suite after migration validation.

## Decisions Locked In

- [x] Reuse the name `referralSource`; it now stores an inviter UUID instead of free text.
- [x] Include both the UUID and a safe inviter summary in `User` responses.
- [x] Legacy free-text values are set to null.
- [x] Accepted historical invitations are used to restore known inviter relationships.
- [x] Manually created users have no inviter relationship by default.

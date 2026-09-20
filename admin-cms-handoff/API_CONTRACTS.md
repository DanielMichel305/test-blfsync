# API operation contracts

Generated from `openapi copy 2.yaml` on 2026-09-16. Paths are relative to the frontend default base URL `http://localhost:3001/v1` (override with `VITE_API_BASE_URL`). Endpoint descriptions and parameter constraints come from OpenAPI. The OpenAPI root declares `bearerAuth` for operations unless an operation overrides security. See `API_INTEGRATION.md` for frontend usage and implementation gaps.

## GET `/badges`

List badge definitions Admin-only management view of active and retired badge definitions.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `search` | query | no | string | maxLength 200; default "" |
| `isActive` | query | no | boolean |  |
| `sortBy` | query | no | string {createdAt, name, order, isActive} | default "createdAt" |
| `sortOrder` | query | no | string {ASC, DESC} | default "DESC" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [BadgePage](#badgepage) | Paginated badge definitions. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |

## POST `/badges`

Create a badge definition Admin-only. Active definitions are locked when created.

Request body: required; application/json: [CreateBadgeRequest](#createbadgerequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: object | Badge definition created. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## GET `/badges/{id}`

Retrieve a badge definition

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Badge definition. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## PATCH `/badges/{id}`

Update a badge definition Admin-only. Trigger, requirement, and code fields cannot change after a definition is locked.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

Request body: required; application/json: [UpdateBadgeRequest](#updatebadgerequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Badge definition updated. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## DELETE `/badges/{id}`

Delete a retired, unawarded badge definition

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## PATCH `/badges/{id}/retire`

Retire a badge definition Makes the badge inactive without removing existing awards.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Badge retired. Repeated retirement is idempotent. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/prayer-wall`

List visible prayer wall threads

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `type` | query | no | string {all, prayer, praise} | default "all" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [ThreadPage](#threadpage) | Paginated newest-first prayer wall feed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## POST `/prayer-wall`

Create a prayer or praise thread

Request body: required; application/json: [CreateThreadRequest](#createthreadrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: object | Thread created. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## GET `/prayer-wall/{id}`

Get a visible thread and its comments

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Thread detail with paginated comments. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## DELETE `/prayer-wall/{id}`

Soft-delete the current user's thread

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Operation completed successfully. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/prayer-wall/{id}/comments`

List visible comments on a visible thread

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [CommentPage](#commentpage) | Paginated comments ordered oldest first. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## POST `/prayer-wall/{id}/comments`

Add a comment to a visible thread

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

Request body: required; application/json: [CreateCommentRequest](#createcommentrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: object | Comment created. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## DELETE `/prayer-wall/{threadId}/comments/{commentId}`

Soft-delete the current user's comment

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `threadId` | path | yes | string (uuid) |  |
| `commentId` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Operation completed successfully. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## PUT `/prayer-wall/{id}/reactions/{reactionType}`

Add a reaction idempotently Like and join-in-prayer are independent and both are available on prayers and praises.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |
| `reactionType` | path | yes | string {like, join_prayer} |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Current reaction state and whether a row was created. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## DELETE `/prayer-wall/{id}/reactions/{reactionType}`

Remove a reaction idempotently

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |
| `reactionType` | path | yes | string {like, join_prayer} |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Current reaction state and whether a row was removed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/prayer-wall/manage/threads`

List threads for moderation Anonymous author identities are included for admins.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `search` | query | no | string | maxLength 200; default "" |
| `type` | query | no | string {prayer, praise} |  |
| `status` | query | no | string {visible, removed} |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [Pagination](#pagination) + object | Paginated moderation thread queue. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |

## GET `/prayer-wall/manage/threads/{id}`

Get a thread for moderation

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Managed thread and all comments, including removed comments. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## DELETE `/prayer-wall/manage/threads/{id}`

Remove a thread from the public feed Removing a thread hides its entire comment subtree without deleting records.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

Request body: required; application/json: object

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Updated managed thread detail. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## PATCH `/prayer-wall/manage/threads/{id}/restore`

Restore a removed thread Previously visible comments become visible again; independently removed comments stay removed.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Restored managed thread detail. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## GET `/prayer-wall/manage/comments`

List comments for moderation This is a separate queue from thread moderation and includes anonymous author identities.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `search` | query | no | string | maxLength 200; default "" |
| `status` | query | no | string {visible, removed} |  |
| `threadId` | query | no | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [Pagination](#pagination) + object | Paginated moderation comment queue. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |

## GET `/prayer-wall/manage/comments/{id}`

Get a comment for moderation

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Managed comment detail. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## DELETE `/prayer-wall/manage/comments/{id}`

Remove a comment from the public feed

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

Request body: required; application/json: object

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Updated managed comment. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## PATCH `/prayer-wall/manage/comments/{id}/restore`

Restore a removed comment

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Restored managed comment. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## GET `/subscriptions`

List the authenticated user's one-time and recurring commitments

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `status` | query | no | string {pending, active, completed, failed, cancelled} |  |
| `trackId` | query | no | string (uuid) |  |
| `type` | query | no | string {one-time, recurring} |  |
| `sortOrder` | query | no | string {ASC, DESC} | default "DESC" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [CommitmentPage](#commitmentpage) | Paginated owner-scoped commitments and sanitized subscription state. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## POST `/subscriptions`

Create a one-time or recurring Checkout session

Request body: required; application/json: [CreateSubscriptionCheckoutRequest](#createsubscriptioncheckoutrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: [CheckoutResponse](#checkoutresponse) | Stripe Checkout session created or returned idempotently. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |
| 429 | application/json: object | The authenticated user exceeded the subscription-operation rate limit. Retry after the interval indicated by the response headers. |
| 500 | application/json: [Error](#error) | An unexpected server error occurred. |

## GET `/subscriptions/{id}`

Get a recurring subscription and access state

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [SubscriptionStatus](#subscriptionstatus) | Sanitized subscription status without Stripe identifiers. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 429 | application/json: object | The authenticated user exceeded the subscription-operation rate limit. Retry after the interval indicated by the response headers. |

## PATCH `/subscriptions/{id}`

Change an active recurring subscription immediately; one-time commitments are not manageable here.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

Request body: required; application/json: [UpdateSubscriptionRequest](#updatesubscriptionrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [SubscriptionUpdateResponse](#subscriptionupdateresponse) | Subscription was unchanged or this update was already confirmed by a subscription webhook. |
| 202 | application/json: [SubscriptionUpdateResponse](#subscriptionupdateresponse) | Update awaits a subscription webhook, optionally requiring customer action in Stripe Billing Portal. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |
| 429 | application/json: object | The authenticated user exceeded the subscription-operation rate limit. Retry after the interval indicated by the response headers. |
| 500 | application/json: [Error](#error) | An unexpected server error occurred. |

## DELETE `/subscriptions/{id}`

Cancel a recurring subscription immediately; one-time commitments are not cancellable here. Immediately requests Stripe cancellation without refunds or proration. Local state awaits customer.subscription.deleted, or checkout.session.expired for open Checkout. Failed requests are retried by billing maintenance.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [SubscriptionCancellationResponse](#subscriptioncancellationresponse) | Subscription and future Stripe billing cancelled. |
| 202 | application/json: [SubscriptionCancellationResponse](#subscriptioncancellationresponse) | Cancellation was requested but Stripe has not yet confirmed a terminal state. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 429 | application/json: object | The authenticated user exceeded the subscription-operation rate limit. Retry after the interval indicated by the response headers. |
| 500 | application/json: [Error](#error) | An unexpected server error occurred. |

## POST `/subscriptions/{id}/billing-portal`

Create a Stripe Billing Portal session

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: object | Short-lived Stripe Billing Portal URL. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 429 | application/json: object | The authenticated user exceeded the subscription-operation rate limit. Retry after the interval indicated by the response headers. |
| 500 | application/json: [Error](#error) | An unexpected server error occurred. |

## GET `/health`

Check API health

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [HealthStatus](#healthstatus) | API is available. |

Security: `[]`

## POST `/auth/login`

Sign in with an email address and password

Request body: required; application/json: [LoginRequest](#loginrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [AuthenticatedSession](#authenticatedsession) | Authentication succeeded without two-factor verification. |
| 202 | application/json: [TwoFactorChallenge](#twofactorchallenge) | Two-factor verification is required before tokens are issued. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

Security: `[]`

## POST `/auth/verify-2fa`

Complete a two-factor sign-in challenge

Request body: required; application/json: [VerifyTwoFactorRequest](#verifytwofactorrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [AuthenticatedSession](#authenticatedsession) | Verification succeeded and tokens were issued. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

Security: `[]`

## POST `/auth/refresh`

Rotate a refresh token

Request body: required; application/json: [RefreshTokenRequest](#refreshtokenrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [TokenPairResponse](#tokenpairresponse) | A new access and refresh-token pair. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

Security: `[]`

## POST `/auth/logout`

Revoke a refresh token

Request body: optional; application/json: [RefreshTokenRequest](#refreshtokenrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Operation completed successfully. |
| 500 | application/json: [Error](#error) | An unexpected server error occurred. |

Security: `[]`

## GET `/auth/profile`

Get the authenticated user's profile

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Current user profile. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## PATCH `/auth/profile`

Update the authenticated user's profile

Request body: required; multipart/form-data: [UpdateProfileRequest](#updateprofilerequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | User operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## POST `/auth/2fa/enable`

Enable email two-factor authentication

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | User operation completed successfully. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## POST `/auth/2fa/disable`

Disable email two-factor authentication

Request body: required; application/json: [PasswordConfirmationRequest](#passwordconfirmationrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | User operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## GET `/auth/invite`

Inspect an invitation before accepting it

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `token` | query | yes | string |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Valid invitation details. |
| 400 | application/json: [Error](#error) | Request validation failed. |

Security: `[]`

## POST `/auth/forgot-password`

Request a password-reset email

Request body: required; application/json: [ForgotPasswordRequest](#forgotpasswordrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |

Security: `[]`

## POST `/auth/reset-password`

Reset a password using a reset token

Request body: required; application/json: [ResetPasswordRequest](#resetpasswordrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |

Security: `[]`

## POST `/auth/accept-invite`

Create an account from a valid invitation

Request body: required; application/json: [AcceptInvitationRequest](#acceptinvitationrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [AuthenticatedSession](#authenticatedsession) | Invitation accepted and a session created. |
| 400 | application/json: [Error](#error) | Request validation failed. |

Security: `[]`

## GET `/users`

List users Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 200; default 20 |
| `search` | query | no | string | maxLength 200; default "" |
| `role` | query | no | string {admin, family, friend} |  |
| `isActive` | query | no | boolean |  |
| `sortBy` | query | no | string {createdAt, firstName, lastName, email, role, isActive, lastLoginAt} | default "createdAt" |
| `sortOrder` | query | no | string {ASC, DESC} | default "DESC" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [UserPage](#userpage) | Paginated users. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |

## POST `/users`

Create a user Admin-only. Submit `profilePictureUrl` as an optional image file, despite the historical field name.

Request body: required; multipart/form-data: [CreateUserRequest](#createuserrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: object | User operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## GET `/users/{id}`

Get a user Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | User profile. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## PATCH `/users/{id}`

Update a user Admin-only. Submit `profilePictureUrl` as an optional replacement image file.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

Request body: required; multipart/form-data: [UpdateUserRequest](#updateuserrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | User operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## DELETE `/users/{id}`

Request user deletion Admin-only. Immediately deactivates and hides the user, then permanently deletes the record only after Stripe confirms all subscriptions are terminal. An administrator cannot delete their own account.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [UserDeletionResponse](#userdeletionresponse) | The user was permanently deleted because all associated subscriptions were already terminal. |
| 202 | application/json: [UserDeletionResponse](#userdeletionresponse) | Deletion is pending Stripe cancellation confirmation. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## POST `/users/{id}/resend-invite`

Resend a user's invitation Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

Request body: optional; application/json: [ResendInvitationRequest](#resendinvitationrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | User operation completed successfully. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/users/{id}/badges`

List a user's active badge progress Any authenticated user can access the route; the handler permits access to the current user's badges.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [UserBadge](#userbadge)[] | Active badge definitions with the user's earned state. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/invitations`

List invitations visible to the caller Available to administrators and family users.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `search` | query | no | string | maxLength 200; default "" |
| `status` | query | no | string {pending, accepted, expired, revoked} |  |
| `role` | query | no | string {admin, family, friend} |  |
| `deliveryStatus` | query | no | string {pending, sent, failed} |  |
| `sortBy` | query | no | string {createdAt, updatedAt, email, expiresAt, status, role, deliveryStatus} |  |
| `sortOrder` | query | no | string {ASC, DESC} | default "DESC" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Invitations. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |

## POST `/invitations`

Send an invitation Available to administrators and family users. Family users can invite friends only.

Request body: required; application/json: [CreateInvitationRequest](#createinvitationrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: object | Invitation operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## POST `/invitations/{id}/resend`

Resend an invitation Available to administrators and family users.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

Request body: optional; application/json: [ResendInvitationRequest](#resendinvitationrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Invitation operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## POST `/invitations/{id}/revoke`

Revoke an invitation Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Invitation operation completed successfully. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/logs`

List audit-log entries Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 200; default 20 |
| `userId` | query | no | string (uuid) |  |
| `entityName` | query | no | string | maxLength 100 |
| `entityId` | query | no | string | maxLength 100 |
| `action` | query | no | string | maxLength 50 |
| `startDate` | query | no | string (date-time) |  |
| `endDate` | query | no | string (date-time) |  |
| `sortBy` | query | no | string {createdAt, action, entityName} | default "createdAt" |
| `sortOrder` | query | no | string {ASC, DESC} | default "DESC" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [AuditLogPage](#auditlogpage) | Paginated audit history. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |

## GET `/units`

List active units Available to every authenticated role. Soft-deleted units are excluded.

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [MinistryUnit](#ministryunit)[] | Active units. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## POST `/units`

Create a unit Admin-only.

Request body: required; application/json: [CreateMinistryUnitRequest](#createministryunitrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: [MinistryUnit](#ministryunit) | Unit created. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |

## DELETE `/units/{id}`

Soft-delete a unit Admin-only. Referenced units cannot be deleted.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Unit deleted. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## GET `/ministry-tracks`

List ministry tracks

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 200; default 20 |
| `search` | query | no | string | maxLength 200; default "" |
| `isActive` | query | no | boolean |  |
| `sortBy` | query | no | string {createdAt, isActive, Alphabetical, current_metric_level, target_metric_level, min_monthly_contribution} | default "createdAt" |
| `sortOrder` | query | no | string {ASC, DESC} | default "ASC" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [MinistryTrackPage](#ministrytrackpage) | Paginated ministry tracks. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## POST `/ministry-tracks`

Create a ministry track Admin-only.

Request body: required; application/json: [CreateMinistryTrackRequest](#createministrytrackrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: [MinistryTrack](#ministrytrack) | Ministry track created. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## GET `/ministry-tracks/{id}`

Get a ministry track

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [MinistryTrack](#ministrytrack) | Ministry track. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## PATCH `/ministry-tracks/{id}`

Update a ministry track Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

Request body: required; application/json: [UpdateMinistryTrackRequest](#updateministrytrackrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [MinistryTrack](#ministrytrack) | Updated ministry track. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## DELETE `/ministry-tracks/{id}`

Delete a ministry track Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Operation completed successfully. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/ministry-tracks/{id}/commitments`

List durable one-time and recurring commitments for a ministry track Returns completed one-time payment history and recurring commitment records. One-time commitments remain visible after confirmation; recurring access is still controlled by the subscription membership projection.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 200; default 20 |
| `search` | query | no | string | maxLength 200; default "" |
| `type` | query | no | string {one-time, recurring} |  |
| `status` | query | no | string {pending, active, completed, failed, cancelled} |  |
| `interval` | query | no | string {month, year} |  |
| `startDate` | query | no | string (date-time) |  |
| `endDate` | query | no | string (date-time) |  |
| `sortBy` | query | no | string {createdAt, updatedAt, amountMinor, status, type} |  |
| `sortOrder` | query | no | string {ASC, DESC} | default "DESC" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [MinistryTrackCommitments](#ministrytrackcommitments) | Ministry-track commitment records. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/announcements`

List announcements visible on the caller's dashboard

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [AnnouncementPage](#announcementpage) | Current published announcements available to the caller. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## POST `/announcements`

Create an announcement Admin-only. Draft or published announcements can target all users, roles, or ministry tracks.

Request body: required; application/json: [CreateAnnouncementRequest](#createannouncementrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: object | Announcement operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## GET `/announcements/manage`

List announcements for management Admin-only. Includes drafts, archived records, targeting metadata, and visibility state.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `search` | query | no | string | maxLength 200; default "" |
| `status` | query | no | string {draft, published, archived} |  |
| `visibilityState` | query | no | string {draft, scheduled, active, expired, archived} |  |
| `audienceType` | query | no | string {global, roles, tracks} |  |
| `type` | query | no | string {info, warning, urgent} |  |
| `priority` | query | no | string {low, normal, high} |  |
| `role` | query | no | string {admin, family, friend} |  |
| `trackId` | query | no | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [ManagedAnnouncementPage](#managedannouncementpage) | Paginated announcement-management list. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |

## GET `/announcements/{id}`

Get an announcement for management Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Announcement including management metadata. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## PATCH `/announcements/{id}`

Update an announcement Admin-only. Archived announcements are immutable.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

Request body: required; application/json: [UpdateAnnouncementRequest](#updateannouncementrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Announcement operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## DELETE `/announcements/{id}`

Delete a draft announcement Admin-only. Published and archived announcements cannot be deleted.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Operation completed successfully. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## PATCH `/announcements/{id}/restore`

Idempotently restore an archived announcement Admin-only. Restores the record to published while preserving its content, targets, and schedule.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Announcement operation completed successfully. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## GET `/notifications`

List the authenticated user's notifications

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `status` | query | no | string {all, unread, read} | default "all" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [NotificationFeedPage](#notificationfeedpage) | Paginated user notification feed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## PATCH `/notifications/read-all`

Mark all delivered notifications as read

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [MarkAllNotificationsReadResponse](#markallnotificationsreadresponse) | Read-state update summary. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## PATCH `/notifications/{id}/read`

Mark a notification as read

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [NotificationFeedItem](#notificationfeeditem) | Updated notification. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/notifications/manage`

List notifications for management Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `search` | query | no | string | maxLength 200; default "" |
| `origin` | query | no | string {admin, system} |  |
| `audienceType` | query | no | string {all, users, roles, tracks} |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [ManagedNotificationPage](#managednotificationpage) | Paginated notification-management list. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |

## POST `/notifications/manage`

Create and deliver an administrative notification Admin-only. Exactly one target array is required for a users, roles, or tracks audience; no targets are allowed for all users.

Request body: required; application/json: [CreateAdminNotificationRequest](#createadminnotificationrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: [ManagedNotification](#managednotification) | Created notification and delivery statistics. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/notifications/manage/{id}`

Get a notification for management Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [ManagedNotification](#managednotification) | Notification and delivery statistics. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/testimonies`

List testimonies visible in the caller's feed

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [TestimonyPage](#testimonypage) | Paginated published testimony feed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## POST `/testimonies`

Create a testimony Admin-only. `coverImage` is an optional image upload.

Request body: required; multipart/form-data: [CreateTestimonyRequest](#createtestimonyrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: object | Testimony operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/testimonies/manage`

List testimonies for management Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `search` | query | no | string | maxLength 200; default "" |
| `status` | query | no | string {draft, published, archived} |  |
| `visibilityState` | query | no | string {draft, scheduled, active, expired, archived} |  |
| `trackId` | query | no | string (uuid) |  |
| `global` | query | no | boolean |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [ManagedTestimonyPage](#managedtestimonypage) | Paginated testimony-management list. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |

## GET `/testimonies/{id}`

Get a testimony for management Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Testimony including management metadata. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## PATCH `/testimonies/{id}`

Update a testimony Admin-only. `coverImage` is an optional replacement image upload.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

Request body: required; multipart/form-data: [UpdateTestimonyRequest](#updatetestimonyrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Testimony operation completed successfully. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## DELETE `/testimonies/{id}`

Delete a testimony Admin-only. Archived testimonies cannot be deleted.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Operation completed successfully. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## GET `/payments`

List the authenticated user's giving history

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `status` | query | no | string {pending, completed, failed, expired, refunded, partially_refunded} |  |
| `trackId` | query | no | string (uuid) |  |
| `startDate` | query | no | string (date-time) |  |
| `endDate` | query | no | string (date-time) |  |
| `sortOrder` | query | no | string {ASC, DESC} | default "DESC" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [PaymentPage](#paymentpage) | Paginated payment history. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## GET `/payments/{paymentRequestId}`

Reconcile a payment from committed webhook state

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `paymentRequestId` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [Payment](#payment) | Payment reconciliation detail. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/users/{id}/commitments`

List a user's commitments Admin-only.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `status` | query | no | string {pending, active, completed, failed, cancelled} |  |
| `trackId` | query | no | string (uuid) |  |
| `type` | query | no | string {one-time, recurring} |  |
| `sortOrder` | query | no | string {ASC, DESC} | default "DESC" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [CommitmentPage](#commitmentpage) | Paginated commitments. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/users/{id}/payments`

List another user's giving history Admin-only. Uses the same filters and response shape as /payments.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `status` | query | no | string {pending, completed, failed, expired, refunded, partially_refunded} |  |
| `trackId` | query | no | string (uuid) |  |
| `startDate` | query | no | string (date-time) |  |
| `endDate` | query | no | string (date-time) |  |
| `sortOrder` | query | no | string {ASC, DESC} | default "DESC" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [PaymentPage](#paymentpage) | Paginated payment history. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/users/{id}/prayer-activity`

List a user's prayer-wall activity Admin-only. Includes threads, comments, reactions, and moderation events.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `activityType` | query | no | string {thread, comment, reaction, moderation} |  |
| `prayerType` | query | no | string {prayer, praise} |  |
| `status` | query | no | string {visible, removed} |  |
| `startDate` | query | no | string (date-time) |  |
| `endDate` | query | no | string (date-time) |  |
| `sortOrder` | query | no | string {ASC, DESC} | default "DESC" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [PrayerActivityPage](#prayeractivitypage) | Paginated distinguishable activity. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## GET `/referrals`

List the authenticated user's referrals

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `status` | query | no | string {pending, invited, joined, expired, revoked} |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [ReferralPage](#referralpage) | Paginated referrals. |
| 401 | application/json: [Error](#error) | A valid access token is required. |

## POST `/referrals`

Create and deliver a referral invitation

Request body: required; application/json: [CreateReferralRequest](#createreferralrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: object | Referral created. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## GET `/referrals/{id}`

Get an owner-scoped referral

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Referral detail. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

## POST `/referrals/{id}/resend`

Rotate and resend a referral invitation

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Referral resent. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |

## GET `/public/ministry-tracks`

List active ministry tracks Returns Cache-Control public caching with max-age from PUBLIC_CACHE_SECONDS (60 seconds by default).

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `search` | query | no | string | maxLength 200; default "" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [PublicMinistryTrackPage](#publicministrytrackpage) | Cacheable active tracks. |
| 429 | — | Public rate limit exceeded. |

Security: `[]`

## GET `/public/ministry-tracks/{id}`

Get an active ministry track

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Active track. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

Security: `[]`

## GET `/public/announcements`

List active globally targeted announcements

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [AnnouncementPage](#announcementpage) | Cacheable currently visible announcements. |

Security: `[]`

## GET `/public/testimonies`

List currently visible testimonies

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [TestimonyPage](#testimonypage) | Cacheable currently visible testimonies. |

Security: `[]`

## POST `/guest-checkouts`

Create an idempotent one-time guest checkout

Request body: required; application/json: [CreateGuestCheckoutRequest](#createguestcheckoutrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: [GuestCheckoutResponse](#guestcheckoutresponse) | Guest checkout and short-lived verification token. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |
| 429 | — | Guest checkout rate limit exceeded. |

Security: `[]`

## GET `/guest-checkouts/{id}/payment`

Reconcile a guest payment using its signed verification token

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |
| `token` | query | yes | string |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [Payment](#payment) | Guest payment reconciliation. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |

Security: `[]`

## GET `/field-updates`

List visible field updates Authenticated users see only published records whose publication timestamp has arrived. Administrators may list draft, published, or archived records and use all filters.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `page` | query | no | integer | minimum 1; default 1 |
| `limit` | query | no | integer | minimum 1; maximum 100; default 20 |
| `search` | query | no | string | maxLength 200; default "" |
| `status` | query | no | string {draft, published, archived} |  |
| `trackId` | query | no | string (uuid) |  |
| `category` | query | no | string | minLength 1; maxLength 100 |
| `tag` | query | no | string | minLength 1; maxLength 100 |
| `sortBy` | query | no | string {createdAt, updatedAt, publishedAt, title, tag, category, status} | default "publishedAt" |
| `sortOrder` | query | no | string {ASC, DESC} | default "DESC" |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [FieldUpdatePage](#fieldupdatepage) | Paginated field updates. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 500 | application/json: [Error](#error) | An unexpected server error occurred. |

## POST `/field-updates`

Create a field update Admin-only. Creates a draft by default. A single image or video may be supplied as multipart media, or an existing HTTPS URL from the matching configured CDN may be supplied with mediaType. Uploads and URL metadata cannot be combined.

Request body: required; application/json: [CreateFieldUpdateRequest](#createfieldupdaterequest); multipart/form-data: [CreateFieldUpdateMultipartRequest](#createfieldupdatemultipartrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 201 | application/json: object | Field update created. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 500 | application/json: [Error](#error) | An unexpected server error occurred. |

## GET `/field-updates/{id}`

Get a visible field update Authenticated non-admin users receive only currently visible published records. Administrators may retrieve records in any lifecycle state and receive archivedAt metadata.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Field update. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 500 | application/json: [Error](#error) | An unexpected server error occurred. |

## PATCH `/field-updates/{id}`

Update, publish, archive, or restore a field update Admin-only. Draft records may remain draft, publish, or archive. Published records may remain published or archive. Archived records are immutable and may only be restored with a status-only change to published. A status-only no-op is a conflict. publishedAt is server-populated when publishing unless a valid timestamp is supplied.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

Request body: required; application/json: [UpdateFieldUpdateRequest](#updatefieldupdaterequest); multipart/form-data: [UpdateFieldUpdateMultipartRequest](#updatefieldupdatemultipartrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Field update changed. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |
| 500 | application/json: [Error](#error) | An unexpected server error occurred. |

## DELETE `/field-updates/{id}`

Archive a field update Admin-only. Sets status and archivedAt. Repeating the operation for an already archived record returns a conflict.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `id` | path | yes | string (uuid) |  |

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: object | Archived field update. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 401 | application/json: [Error](#error) | A valid access token is required. |
| 403 | application/json: [Error](#error) | The authenticated user lacks permission. |
| 404 | application/json: [Error](#error) | The requested content was not found or is not visible. |
| 409 | application/json: [Error](#error) | The requested state transition has already occurred. |
| 500 | application/json: [Error](#error) | An unexpected server error occurred. |

## POST `/contact-inquiries`

Validate, sanitize, and queue a contact inquiry

Request body: required; application/json: [ContactInquiryRequest](#contactinquiryrequest)

| Response | Body | Meaning |
| --- | --- | --- |
| 202 | application/json: object | Generic accepted response. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 429 | — | Contact inquiry rate limit exceeded. |

Security: `[]`

## POST `/webhooks`

Receive a Stripe webhook This endpoint requires Stripe's signature header and the unmodified JSON request body. It does not use bearer authentication.

| Parameter | In | Required | Type | Meaning / constraints |
| --- | --- | --- | --- | --- |
| `stripe-signature` | header | yes | string |  |

Request body: required; application/json: object

| Response | Body | Meaning |
| --- | --- | --- |
| 200 | application/json: [WebhookReceipt](#webhookreceipt) | Event effects and receipt committed transactionally, ignored as unsupported, or already processed. |
| 400 | application/json: [Error](#error) | Request validation failed. |
| 500 | application/json: [Error](#error) | An unexpected server error occurred. |

Security: `[]`

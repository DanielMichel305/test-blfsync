# Data models and attributes

Generated from `openapi copy 2.yaml` on 2026-09-16. This is the checked-in API specification, not a live server introspection. `Required` means OpenAPI requires the property in that schema; optional properties may still be conditionally required by an operation. Nested references link to their schema below. Embedded object fields are listed at the end of this file. The frontend sometimes narrows these types; see the function and gaps documents. For uncommon JSON Schema keywords such as `multipleOf` and `minProperties`, consult the YAML source.

## CreateSubscriptionCheckoutRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `subscriptionAmount` | integer | yes | Whole USD amount; yearly subscriptions must meet twelve times the track monthly minimum.; minimum 1; maximum 999999 |
| `subscriptionCurrency` | string {usd} | yes |  |
| `ministryTrackId` | string (uuid) | yes |  |
| `idempotencyKey` | string (uuid) | yes |  |
| `subscriptionType` | string {one-time, recurring} | yes |  |
| `interval` | string {month, year} | no | Required for recurring requests and forbidden for one-time requests. |

Additional properties: forbidden.

## UpdateSubscriptionRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `subscriptionAmount` | integer | no | minimum 1; maximum 999999 |
| `interval` | string {month, year} | no |  |
| `idempotencyKey` | string (uuid) | yes |  |

Additional properties: forbidden.

## CheckoutResponse


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `paymentRequestId` | string (uuid) | yes |  |
| `commitmentId` | string (uuid) | yes | Durable commitment created for this one-time or recurring checkout. |
| `subscriptionId` | string (uuid) or null | yes |  |
| `checkout` | object | yes |  |
| `status` | string {pending, completed, failed, expired} | yes |  |

## SubscriptionStatus


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `ministryTrackId` | string (uuid) | yes |  |
| `amount` | number or null | yes | Confirmed amount in whole USD; null before the initial subscription confirmation. |
| `currency` | string or null | yes |  |
| `interval` | string {month, year, } or null | yes |  |
| `subscriptionStatus` | string {pending, incomplete, incomplete_expired, trialing, active, past_due, unpaid, paused, canceled} | yes |  |
| `accessStatus` | string {pending, active, grace, inactive, cancelled} | yes |  |
| `currentPeriodEnd` | string (date-time) or null | no |  |
| `cancellation` | object | yes |  |
| `billingReviewStatus` | string {none, dispute_open, dispute_won, dispute_lost} | yes |  |
| `createdAt` | string (date-time) | no |  |
| `updatedAt` | string (date-time) | no |  |

## SubscriptionUpdateResponse


Type: object or object or object

## SubscriptionCancellationResponse


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `status` | string {cancelled, cancellation_pending} | yes |  |
| `subscription` | [SubscriptionStatus](#subscriptionstatus) | yes |  |
| `errorCode` | string or null | no | Present when the cancellation remains pending because the provider could not be confirmed. |

## UserDeletionCancellationSummary


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `requested` | integer | yes | minimum 0 |
| `confirmed` | integer | yes | minimum 0 |
| `pending` | integer | yes | minimum 0 |
| `deletionFinalized` | boolean | yes |  |

## UserDeletionResponse


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `message` | string | yes |  |
| `deletionStatus` | string {deleted, pending_cancellation} | yes |  |
| `operationId` | string (uuid) | yes |  |
| `cancellation` | [UserDeletionCancellationSummary](#userdeletioncancellationsummary) | yes |  |

## WebhookReceipt


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `received` | boolean {true} | yes |  |
| `ignored` | boolean | no | True when the Stripe event type is not handled by this API. |
| `duplicate` | boolean | no | True when the same Stripe event ID had already been processed and committed. |
| `status` | string {processed} | no |  |

## Badge


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `code` | string | yes | maxLength 100 |
| `name` | string | yes | maxLength 100 |
| `description` | string | yes | maxLength 2000 |
| `order` | integer | yes | minimum 0 |
| `triggerKey` | string {ministry.track.duration, action.login, action.donation, action.referral} | yes |  |
| `requirementConfig` | object | yes | Trigger-specific configuration validated by the badge trigger registry. |
| `isActive` | boolean | yes |  |
| `definitionLockedAt` | string (date-time) or null | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |

## CreateBadgeRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `code` | string | yes | minLength 1; maxLength 100 |
| `name` | string | yes | minLength 1; maxLength 100 |
| `description` | string | yes | minLength 1; maxLength 2000 |
| `order` | integer | no | minimum 0; default 0 |
| `triggerKey` | string {ministry.track.duration, action.login, action.donation, action.referral} | yes |  |
| `requirementConfig` | object | yes |  |
| `isActive` | boolean | no | default true |

Additional properties: forbidden.

## UpdateBadgeRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `code` | string | no | minLength 1; maxLength 100 |
| `name` | string | no | minLength 1; maxLength 100 |
| `description` | string | no | minLength 1; maxLength 2000 |
| `order` | integer | no | minimum 0 |
| `triggerKey` | string {ministry.track.duration, action.login, action.donation, action.referral} | no |  |
| `requirementConfig` | object | no |  |
| `isActive` | boolean | no |  |

Additional properties: forbidden.

## BadgePage


Type: [Pagination](#pagination) + object

## Error


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `error` | string | yes |  |
| `code` | string | no | Stable machine-readable code supplied for selected application and database errors. |
| `details` | object[] or object | no |  |

## Pagination


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `total` | integer | yes |  |
| `page` | integer | yes |  |
| `limit` | integer | yes |  |
| `totalPages` | integer | yes |  |

## PublicAuthor


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `firstName` | string | yes |  |
| `lastName` | string or null | no |  |
| `username` | string or null | no |  |
| `profilePictureUrl` | string (uri) or null | yes |  |
| `phone` | string or null | no |  |
| `referralSource` | string or null | no |  |
| `communicationOptIn` | boolean | no |  |

## ReactionSummary


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `likeCount` | integer | yes | minimum 0 |
| `joinPrayerCount` | integer | yes | minimum 0 |
| `viewerHasLiked` | boolean | yes |  |
| `viewerHasJoinedPrayer` | boolean | yes |  |

## PrayerWallThread


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `type` | string {prayer, praise} | yes |  |
| `body` | string | yes | minLength 1; maxLength 1000 |
| `isAnonymous` | boolean | yes |  |
| `author` | [PublicAuthor](#publicauthor) | yes |  |
| `authorDisplayName` | string or null | no | Anonymous for anonymous content; otherwise null. |
| `reactions` | [ReactionSummary](#reactionsummary) | yes |  |
| `commentCount` | integer | yes | minimum 0 |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |

## PrayerWallComment


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `threadId` | string (uuid) | yes |  |
| `body` | string | yes | minLength 1; maxLength 500 |
| `isAnonymous` | boolean | yes |  |
| `author` | [PublicAuthor](#publicauthor) | yes |  |
| `authorDisplayName` | string or null | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |

## CreateThreadRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `type` | string {prayer, praise} | yes |  |
| `body` | string | yes | minLength 1; maxLength 1000 |
| `isAnonymous` | boolean | no | default false |

Additional properties: forbidden.

## CreateCommentRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `body` | string | yes | minLength 1; maxLength 500 |
| `isAnonymous` | boolean | no | default false |

Additional properties: forbidden.

## ThreadPage


Type: [Pagination](#pagination) + object

## CommentPage


Type: [Pagination](#pagination) + object

## ModerationFields


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `status` | string {visible, removed} | yes |  |
| `removedAt` | string (date-time) or null | no |  |
| `removalReason` | string or null | no |  |
| `removalSource` | string {author, moderator} or null | no |  |
| `removedBy` | object or null | no |  |

## ManagedThread


Type: [PrayerWallThread](#prayerwallthread) + [ModerationFields](#moderationfields)

## ManagedComment


Type: [PrayerWallComment](#prayerwallcomment) + [ModerationFields](#moderationfields) + object

## ManagedCommentPage


Type: [Pagination](#pagination) + object

## HealthStatus


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `status` | string {ok} | yes |  |
| `service` | string | yes |  |
| `timestamp` | string (date-time) | yes |  |

## User


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `firstName` | string | yes | maxLength 50 |
| `lastName` | string or null | no | maxLength 50 |
| `username` | string or null | no |  |
| `email` | string (email) | yes |  |
| `role` | string {admin, family, friend} | yes |  |
| `twoFactorEnabled` | boolean | yes |  |
| `profilePictureUrl` | string (uri) or null | no |  |
| `isActive` | boolean | yes |  |
| `lastLoginAt` | string (date-time) or null | no |  |
| `hasPassword` | boolean | yes |  |
| `invitationPending` | boolean | yes |  |
| `phone` | string or null | yes |  |
| `referralSource` | string (uuid) or null | yes |  |
| `inviter` | [UserInviter](#userinviter) or null | yes |  |
| `communicationOptIn` | boolean | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |

## UserSummary


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `firstName` | string | yes |  |
| `lastName` | string or null | no |  |
| `email` | string (email) | yes |  |

## UserInviter


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `firstName` | string | yes |  |
| `lastName` | string or null | yes |  |

## LoginRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `email` | string (email) | yes |  |
| `password` | string | yes |  |

Additional properties: forbidden.

## VerifyTwoFactorRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `tokenId` | string (uuid) | yes |  |
| `code` | string | yes | pattern ^\d{6}$ |

Additional properties: forbidden.

## RefreshTokenRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `refreshToken` | string | yes |  |

Additional properties: forbidden.

## PasswordConfirmationRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `password` | string | yes |  |

Additional properties: forbidden.

## ForgotPasswordRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `email` | string (email) | yes |  |

Additional properties: forbidden.

## ResetPasswordRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `token` | string | yes |  |
| `password` | [Password](#password) | yes |  |

Additional properties: forbidden.

## AcceptInvitationRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `token` | string | yes |  |
| `invitedFirstName` | string | yes | minLength 1; maxLength 50 |
| `invitedLastName` | string | yes | minLength 1; maxLength 50 |
| `firstName` | string | yes | minLength 1; maxLength 50 |
| `lastName` | string | yes | minLength 1; maxLength 50 |
| `password` | [Password](#password) | yes |  |

Additional properties: forbidden.

## Password

Must contain lowercase and uppercase letters and a number.

Type: string

## TokenPairResponse


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `message` | string | yes |  |
| `accessToken` | string | yes |  |
| `refreshToken` | string | yes |  |

## AuthenticatedSession


Type: [TokenPairResponse](#tokenpairresponse) + object

## TwoFactorChallenge


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `message` | string | yes |  |
| `twoFactorRequired` | boolean {true} | yes |  |
| `tokenId` | string (uuid) | yes |  |
| `expiresAt` | string (date-time) | yes |  |

## InvitationPreview


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `email` | string (email) | yes |  |
| `invitedFirstName` | string | yes |  |
| `invitedLastName` | string | yes |  |
| `role` | string {admin, family, friend} | yes |  |
| `status` | string {pending} | yes |  |
| `expiresAt` | string (date-time) | yes |  |

## CreateUserRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `firstName` | string | yes | maxLength 50 |
| `lastName` | string or null | no | maxLength 50 |
| `email` | string (email) | yes |  |
| `password` | [Password](#password) | no |  |
| `role` | string {family, friend} | yes |  |
| `profilePictureUrl` | string (binary) | no | Image upload field. |

Additional properties: forbidden.

## UpdateUserRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `firstName` | string | no | maxLength 50 |
| `lastName` | string or null | no | maxLength 50 |
| `email` | string (email) | no |  |
| `password` | [Password](#password) | no |  |
| `role` | string {admin, family, friend} | no |  |
| `isActive` | boolean | no |  |
| `profilePictureUrl` | string (binary) | no | Replacement image upload field. |
| `removeProfilePicture` | boolean | no |  |
| `phone` | string or null | no |  |
| `communicationOptIn` | boolean | no |  |

Additional properties: forbidden.

## UserPage


Type: [Pagination](#pagination) + object

## UserBadge


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `code` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `order` | integer | yes |  |
| `earned` | boolean | yes |  |
| `progress` | object | yes |  |

## ResendInvitationRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `expiresInHours` | integer | no | minimum 1; maximum 720 |

Additional properties: forbidden.

## Invitation


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `email` | string (email) | yes |  |
| `invitedFirstName` | string | yes |  |
| `invitedLastName` | string | yes |  |
| `role` | string {admin, family, friend} | yes |  |
| `inviterId` | string (uuid) | yes |  |
| `status` | string {pending, accepted, expired, revoked} | yes |  |
| `expiresAt` | string (date-time) | yes |  |
| `acceptedAt` | string (date-time) or null | no |  |
| `revokedAt` | string (date-time) or null | no |  |
| `deliveryStatus` | string {pending, sent, failed} | yes |  |
| `deliveryAttemptedAt` | string (date-time) or null | no |  |
| `deliveryFailureReason` | string or null | no |  |
| `resendCount` | integer | yes | minimum 0 |
| `acceptedUserId` | string (uuid) or null | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |

## CreateInvitationRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `email` | string (email) | yes |  |
| `firstName` | string | yes | minLength 1; maxLength 50 |
| `lastName` | string | yes | minLength 1; maxLength 50 |
| `role` | string {admin, family, friend} | no |  |
| `expiresInHours` | integer | no | minimum 1; maximum 720 |

Additional properties: forbidden.

## AuditLog


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | integer (int64) | yes |  |
| `userId` | string (uuid) or null | no |  |
| `action` | string | yes |  |
| `entityName` | string | yes |  |
| `entityId` | string | yes |  |
| `oldValues` | object or null | no |  |
| `newValues` | object or null | no |  |
| `createdAt` | string (date-time) | yes |  |
| `user` | [UserSummary](#usersummary) or null | no |  |

## AuditLogPage


Type: [Pagination](#pagination) + object

## MinistryUnit


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `name` | string | yes | maxLength 100 |

## CreateMinistryUnitRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `name` | string | yes | maxLength 100 |

Additional properties: forbidden.

## MinistryTrack


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `name` | string | yes | maxLength 100 |
| `order` | integer | no |  |
| `cover_url` | string (uri) or null | no |  |
| `description` | string | yes | maxLength 500 |
| `current_metric_level` | number (double) | yes |  |
| `target_metric_level` | integer | yes |  |
| `min_monthly_contribution` | integer | yes |  |
| `cost_per_unit` | integer | yes |  |
| `metricUnit` | string {souls, streams, usd, egp, houses built} | yes |  |
| `target_period` | string {Monthly, Quarterly, Annually} | yes |  |
| `isActive` | boolean | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |

## CreateMinistryTrackRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `name` | string | yes | maxLength 100 |
| `description` | string | no | maxLength 500 |
| `cover_url` | string (uri) | no |  |
| `current_metric_level` | number | yes |  |
| `target_metric_level` | integer | yes |  |
| `min_monthly_contribution` | integer | yes |  |
| `cost_per_unit` | integer | yes |  |
| `unitId` | string (uuid) | yes |  |
| `target_period` | string {Monthly, Quarterly, Annually} | yes |  |
| `isActive` | boolean | yes | default true |

Additional properties: forbidden.

## UpdateMinistryTrackRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `name` | string | no | maxLength 100 |
| `description` | string | no | maxLength 500 |
| `cover_url` | string (uri) | no |  |
| `current_metric_level` | number | no |  |
| `target_metric_level` | integer | no |  |
| `min_monthly_contribution` | integer | no |  |
| `cost_per_unit` | integer | no |  |
| `metricUnit` | string {souls, streams, usd, egp, houses built} | no |  |
| `target_period` | string {Monthly, Quarterly, Annually} | no |  |
| `isActive` | boolean | no |  |

Additional properties: forbidden.

## MinistryTrackPage


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `total` | integer | yes |  |
| `page` | integer | yes |  |
| `limit` | integer | yes |  |
| `ministryTracks` | [MinistryTrack](#ministrytrack)[] | yes |  |

## PublicMinistryTrack


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `cover_url` | string (uri) or null | no |  |
| `current_metric_level` | number (double) | yes |  |
| `target_metric_level` | integer | yes |  |
| `min_monthly_contribution` | integer | yes |  |
| `cost_per_unit` | integer | yes |  |
| `metricUnit` | string | yes |  |
| `target_period` | string | yes |  |
| `isActive` | boolean {true} | yes |  |
| `createdAt` | string (date-time) | yes |  |

## PublicMinistryTrackPage


Type: [Pagination](#pagination) + object

## Commitment


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `userId` | string (uuid) | yes |  |
| `ministryTrackId` | string (uuid) | yes |  |
| `type` | string {one-time, recurring} | yes |  |
| `amountMinor` | integer | yes | Commitment amount in the currency's minor unit. |
| `currency` | string | yes |  |
| `interval` | string {month, year, } or null | no |  |
| `status` | string {pending, active, completed, failed, cancelled} | yes |  |
| `completedAt` | string (date-time) or null | no |  |
| `cancelledAt` | string (date-time) or null | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | no |  |
| `user` | [UserSummary](#usersummary) or null | yes |  |
| `paymentRequests` | object[] | yes |  |
| `subscription` | object or null | yes |  |

## MinistryTrackCommitments


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `page` | integer | yes |  |
| `limit` | integer | yes |  |
| `ministry_track` | [MinistryTrack](#ministrytrack) | yes |  |
| `total_commitments` | integer | yes |  |
| `commitments` | [Commitment](#commitment)[] | yes |  |

## Announcement


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `title` | string | yes | maxLength 100 |
| `description` | string | yes | maxLength 500 |
| `type` | string {info, warning, urgent} | yes |  |
| `priority` | string {low, normal, high} | yes |  |
| `visibilityState` | string {draft, scheduled, active, expired, archived} | yes |  |
| `startsAt` | string (date-time) or null | no |  |
| `endsAt` | string (date-time) or null | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |

## ManagedAnnouncement


Type: [Announcement](#announcement) + object

## AnnouncementPage


Type: [Pagination](#pagination) + object

## ManagedAnnouncementPage


Type: [Pagination](#pagination) + object

## CreateAnnouncementRequest

For `global`, omit both target arrays. For `roles` provide only targetRoles; for `tracks` provide only targetTrackIds.

| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `title` | string | yes | minLength 1; maxLength 100 |
| `description` | string | yes | minLength 1; maxLength 500 |
| `type` | string {info, warning, urgent} | no | default "info" |
| `priority` | string {low, normal, high} | no | default "normal" |
| `status` | string {draft, published} | no | default "draft" |
| `audienceType` | string {global, roles, tracks} | yes |  |
| `targetRoles` | string {admin, family, friend}[] | no | minItems 1; unique items |
| `targetTrackIds` | string (uuid)[] | no | minItems 1; unique items |
| `startsAt` | string (date-time) or null | no |  |
| `endsAt` | string (date-time) or null | no |  |

Additional properties: forbidden.

## UpdateAnnouncementRequest

Target-array requirements follow the resulting audienceType.

| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `title` | string | no | minLength 1; maxLength 100 |
| `description` | string | no | minLength 1; maxLength 500 |
| `type` | string {info, warning, urgent} | no |  |
| `priority` | string {low, normal, high} | no |  |
| `status` | string {draft, published, archived} | no |  |
| `audienceType` | string {global, roles, tracks} | no |  |
| `targetRoles` | string {admin, family, friend}[] | no | minItems 1; unique items |
| `targetTrackIds` | string (uuid)[] | no | minItems 1; unique items |
| `startsAt` | string (date-time) or null | no |  |
| `endsAt` | string (date-time) or null | no |  |

Additional properties: forbidden.

## NotificationFeedItem


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `title` | string | yes |  |
| `body` | string | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `readAt` | string (date-time) or null | no |  |

## NotificationFeedPage


Type: [Pagination](#pagination) + object

## MarkAllNotificationsReadResponse


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `updatedCount` | integer | yes | minimum 0 |
| `readAt` | string (date-time) | yes |  |

## CreateAdminNotificationRequest

For `all`, omit all target arrays. For any other audience type, provide only its matching target array.

| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `title` | string | yes | minLength 1; maxLength 100 |
| `body` | string | yes | minLength 1; maxLength 500 |
| `audienceType` | string {all, users, roles, tracks} | yes |  |
| `targetUserIds` | string (uuid)[] | no | minItems 1; unique items |
| `targetRoles` | string {admin, family, friend}[] | no | minItems 1; unique items |
| `targetTrackIds` | string (uuid)[] | no | minItems 1; unique items |

Additional properties: forbidden.

## ManagedNotification


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `title` | string | yes |  |
| `body` | string | yes |  |
| `origin` | string {admin, system} | yes |  |
| `audienceType` | string {all, users, roles, tracks} | yes |  |
| `targetCriteria` | object | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `createdBy` | [UserSummary](#usersummary) or null | no |  |
| `recipientCount` | integer | yes | minimum 0 |
| `readCount` | integer | yes | minimum 0 |
| `unreadCount` | integer | yes | minimum 0 |
| `source` | object or null | no |  |

## ManagedNotificationPage


Type: [Pagination](#pagination) + object

## Testimony


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `quote` | string | yes | maxLength 5000 |
| `authorName` | string | yes | maxLength 100 |
| `authorLocation` | string or null | no | maxLength 150 |
| `testimonyDate` | string (date) or null | no |  |
| `coverImageUrl` | string (uri) or null | no |  |
| `track` | object or null | no |  |
| `visibilityState` | string {draft, scheduled, active, expired, archived} | yes |  |
| `startsAt` | string (date-time) or null | no |  |
| `endsAt` | string (date-time) or null | no |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |

## ManagedTestimony


Type: [Testimony](#testimony) + object

## CreateTestimonyRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `quote` | string | yes | minLength 1; maxLength 5000 |
| `authorName` | string | yes | minLength 1; maxLength 100 |
| `authorLocation` | string or null | no | maxLength 150 |
| `testimonyDate` | string (date-time) or null | no |  |
| `ministryTrackId` | string (uuid) or null | no |  |
| `status` | string {draft, published} | no | default "draft" |
| `startsAt` | string (date-time) or null | no |  |
| `endsAt` | string (date-time) or null | no |  |
| `coverImage` | string (binary) | no |  |

Additional properties: forbidden.

## UpdateTestimonyRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `quote` | string | no | minLength 1; maxLength 5000 |
| `authorName` | string | no | minLength 1; maxLength 100 |
| `authorLocation` | string or null | no | maxLength 150 |
| `testimonyDate` | string (date-time) or null | no |  |
| `ministryTrackId` | string (uuid) or null | no |  |
| `status` | string {draft, published, archived} | no |  |
| `startsAt` | string (date-time) or null | no |  |
| `endsAt` | string (date-time) or null | no |  |
| `coverImageUrl` | string or null | no | Set to an empty string or null to remove the current image. |
| `coverImage` | string (binary) | no |  |

Additional properties: forbidden.

## TestimonyPage


Type: [Pagination](#pagination) + object

## ManagedTestimonyPage


Type: [Pagination](#pagination) + object

## UpdateProfileRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `firstName` | string | no | minLength 1; maxLength 50 |
| `lastName` | string or null | no | maxLength 50 |
| `phone` | string or null | no |  |
| `communicationOptIn` | boolean | no |  |
| `removeProfilePicture` | boolean | no |  |
| `profilePictureUrl` | string (binary) | no |  |

Additional properties: forbidden.

## SubscriptionCommitment


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `type` | string {one-time, recurring} | yes |  |
| `amount` | number | yes |  |
| `amountMinor` | integer | yes |  |
| `currency` | string | yes |  |
| `interval` | string {month, year, } or null | yes |  |
| `status` | string {pending, active, completed, failed, cancelled} | yes |  |
| `paymentStatus` | string | yes |  |
| `ministryTrack` | object or null | yes |  |
| `subscription` | [SubscriptionStatus](#subscriptionstatus) or null | yes |  |
| `completedAt` | string (date-time) or null | yes |  |
| `cancelledAt` | string (date-time) or null | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) or null | yes |  |

Additional properties: forbidden.

## CommitmentPage


Type: [Pagination](#pagination) + object

## Payment


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `paymentRequestId` | string (uuid) | yes |  |
| `status` | string {pending, confirmed, completed, failed, expired, refunded, partially_refunded} | yes |  |
| `type` | string {one-time, recurring} | yes |  |
| `interval` | string {month, year} or null | no |  |
| `amount` | number | yes |  |
| `amountMinor` | integer | yes |  |
| `currency` | string | yes |  |
| `occurredAt` | string (date-time) | no |  |
| `commitment` | object or null | no |  |
| `subscription` | [SubscriptionStatus](#subscriptionstatus) or null | no |  |
| `track` | object or null | no |  |
| `lifecycle` | object | yes |  |
| `failure` | object or null | no |  |
| `receipt` | object | yes |  |
| `ledgerEvents` | object[] | yes |  |

## PaymentPage


Type: [Pagination](#pagination) + object

## PrayerActivityPage


Type: [Pagination](#pagination) + object

## CreateReferralRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `email` | string (email) | yes |  |
| `firstName` | string | yes | minLength 1; maxLength 50 |
| `lastName` | string | yes | minLength 1; maxLength 50 |

Additional properties: forbidden.

## Referral


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `email` | string (email) | yes |  |
| `firstName` | string | yes |  |
| `lastName` | string | yes |  |
| `status` | string {pending, invited, joined, expired, revoked} | yes |  |
| `invitationId` | string (uuid) | yes |  |
| `joinedUserId` | string (uuid) or null | no |  |
| `joinedAt` | string (date-time) or null | no |  |
| `expiresAt` | string (date-time) or null | no |  |
| `deliveryStatus` | string {pending, sent, failed} or null | yes |  |
| `resendCount` | integer | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |

## ReferralPage


Type: [Pagination](#pagination) + object

## CreateGuestCheckoutRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `name` | string | yes | minLength 1; maxLength 100 |
| `email` | string (email) | yes |  |
| `amount` | integer | yes | minimum 1; maximum 999999 |
| `currency` | string {usd} | yes |  |
| `ministryTrackId` | string (uuid) | yes |  |
| `idempotencyKey` | string (uuid) | yes |  |
| `type` | string {one-time} | no | default "one-time" |

Additional properties: forbidden.

## GuestCheckoutResponse


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `guestCheckoutId` | string (uuid) | yes |  |
| `paymentRequestId` | string (uuid) | yes |  |
| `status` | string {pending, completed, failed, expired} | yes |  |
| `checkout` | object | yes |  |
| `verificationToken` | string | yes |  |

## FieldUpdate

Safe field-update representation. archivedAt is included only for administrators; storage keys and provider details are never returned.

| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `id` | string (uuid) | yes |  |
| `title` | string | yes |  |
| `tag` | string | yes |  |
| `category` | string or null | yes |  |
| `mdBody` | string | yes |  |
| `status` | string {draft, published, archived} | yes |  |
| `publishedAt` | string (date-time) or null | yes |  |
| `archivedAt` | string (date-time) or null | no | Present only in administrator responses.; read only |
| `mediaType` | string {image, video} or null | yes |  |
| `mediaUrl` | string (uri) or null | yes | Configured image or video CDN URL; never a stored object key.; pattern ^https://; read only |
| `ministryTrack` | object or null | yes |  |
| `publisher` | object or null | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |

## CreateFieldUpdateRequest

JSON create body. mediaUrl and mediaType must either both be omitted, both be non-null, or both be null. publishedAt is accepted only with published status.

| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `title` | string | yes | minLength 1; maxLength 200 |
| `tag` | string | yes | minLength 1; maxLength 100 |
| `mdBody` | string | yes | minLength 1; maxLength 50000 |
| `status` | string {draft, published, archived} | no | default "draft" |
| `publishedAt` | string (date-time) or null | no | Valid only when status is published; defaults to the server time when publishing. |
| `ministryTrackId` | string (uuid) or null | no |  |
| `category` | string or null | no | maxLength 100 |
| `mediaUrl` | string (uri) or null | no | Must belong to the configured pull-zone origin matching mediaType.; pattern ^https:// |
| `mediaType` | string {image, video} or null | no |  |

Additional properties: forbidden.

## CreateFieldUpdateMultipartRequest

Multipart create body. Supply either media or the mediaUrl/mediaType pair, never both.

| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `title` | string | yes | minLength 1; maxLength 200 |
| `tag` | string | yes | minLength 1; maxLength 100 |
| `mdBody` | string | yes | minLength 1; maxLength 50000 |
| `status` | string {draft, published, archived} | no | default "draft" |
| `publishedAt` | string (date-time) or null | no | Valid only when status is published; defaults to the server time when publishing. |
| `ministryTrackId` | string (uuid) or null | no |  |
| `category` | string or null | no | maxLength 100 |
| `mediaUrl` | string (uri) or null | no | Must belong to the configured pull-zone origin matching mediaType.; pattern ^https:// |
| `mediaType` | string {image, video} or null | no |  |
| `media` | string (binary) | no | One JPEG, PNG, GIF, WebP, MP4, MOV, AVI, MKV, WebM, M4V, MPEG, MPG, or 3GP file with a matching MIME type. The default limit is 100 MiB and may be changed with UPLOAD_FILE_SIZE_LIMIT. |

Additional properties: forbidden.

## UpdateFieldUpdateRequest

JSON update body. mediaUrl and mediaType must be provided together; set both to null to remove media. publishedAt may be changed only while the resulting status is published.

| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `title` | string | no | minLength 1; maxLength 200 |
| `tag` | string | no | minLength 1; maxLength 100 |
| `mdBody` | string | no | minLength 1; maxLength 50000 |
| `status` | string {draft, published, archived} | no |  |
| `publishedAt` | string (date-time) or null | no |  |
| `ministryTrackId` | string (uuid) or null | no |  |
| `category` | string or null | no | maxLength 100 |
| `mediaUrl` | string (uri) or null | no | Must belong to the configured pull-zone origin matching mediaType.; pattern ^https:// |
| `mediaType` | string {image, video} or null | no |  |

Additional properties: forbidden.

## UpdateFieldUpdateMultipartRequest

Multipart update body. A media file alone is a valid update. Supply either media or the mediaUrl/mediaType pair, never both.

| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `title` | string | no | minLength 1; maxLength 200 |
| `tag` | string | no | minLength 1; maxLength 100 |
| `mdBody` | string | no | minLength 1; maxLength 50000 |
| `status` | string {draft, published, archived} | no |  |
| `publishedAt` | string (date-time) or null | no |  |
| `ministryTrackId` | string (uuid) or null | no |  |
| `category` | string or null | no | maxLength 100 |
| `mediaUrl` | string (uri) or null | no | Must belong to the configured pull-zone origin matching mediaType.; pattern ^https:// |
| `mediaType` | string {image, video} or null | no |  |
| `media` | string (binary) | no | One JPEG, PNG, GIF, WebP, MP4, MOV, AVI, MKV, WebM, M4V, MPEG, MPG, or 3GP file with a matching MIME type. The default limit is 100 MiB and may be changed with UPLOAD_FILE_SIZE_LIMIT. |

Additional properties: forbidden.

## FieldUpdatePage


Type: [Pagination](#pagination) + object

## ContactInquiryRequest


| Field | Type | Required | Constraints / meaning |
| --- | --- | --- | --- |
| `name` | string | yes | minLength 1; maxLength 100 |
| `email` | string (email) | yes |  |
| `phone` | string or null | no |  |
| `subject` | string | yes | minLength 1; maxLength 200 |
| `message` | string | yes | minLength 10; maxLength 10000 |
| `language` | string | no | default "en" |
| `captchaToken` | string | no |  |

Additional properties: forbidden.

## Embedded object fields

The following fields are nested inside a parent schema property. Requiredness is relative to that nested object.

| Parent field | Child field | Type | Required | Constraints |
| --- | --- | --- | --- | --- |
| `CheckoutResponse.checkout` | `url` | string (uri) | yes |  |
| `SubscriptionStatus.cancellation` | `status` | string {none, pending, scheduled, cancelled} | yes |  |
| `SubscriptionStatus.cancellation` | `requestedAt` | string (date-time) or null | no |  |
| `SubscriptionStatus.cancellation` | `scheduledAt` | string (date-time) or null | no |  |
| `SubscriptionStatus.cancellation` | `effectiveAt` | string (date-time) or null | no |  |
| `SubscriptionStatus.cancellation` | `cancelledAt` | string (date-time) or null | no |  |
| `UserBadge.progress` | `current` | integer | yes | minimum 0 |
| `UserBadge.progress` | `target` | integer | yes | minimum 0 |
| `UserBadge.progress` | `unit` | string {days, actions} | yes |  |
| `UserBadge.progress` | `membershipStartedAt` | string (date-time) | no |  |
| `UserBadge.progress` | `ministryTrackId` | string (uuid) | no |  |
| `Commitment.paymentRequests` | `id` | string (uuid) | yes |  |
| `Commitment.paymentRequests` | `status` | string | yes |  |
| `Commitment.paymentRequests` | `stripeCheckoutSessionId` | string or null | no |  |
| `Commitment.paymentRequests` | `stripePaymentIntentId` | string or null | no |  |
| `Commitment.subscription` | `id` | string (uuid) | no |  |
| `Commitment.subscription` | `stripeSubscriptionId` | string or null | no |  |
| `ManagedNotification.source` | `type` | string | yes |  |
| `ManagedNotification.source` | `id` | string | yes |  |
| `Testimony.track` | `id` | string (uuid) | yes |  |
| `Testimony.track` | `name` | string | yes |  |
| `Testimony.track` | `isActive` | boolean | yes |  |
| `SubscriptionCommitment.ministryTrack` | `id` | string (uuid) | yes |  |
| `SubscriptionCommitment.ministryTrack` | `name` | string | yes |  |
| `SubscriptionCommitment.ministryTrack` | `description` | string | yes |  |
| `SubscriptionCommitment.ministryTrack` | `coverUrl` | string (uri) or null | yes |  |
| `SubscriptionCommitment.ministryTrack` | `isActive` | boolean | yes |  |
| `Payment.receipt` | `available` | boolean | yes |  |
| `Payment.receipt` | `url` | string (uri) or null | yes |  |
| `GuestCheckoutResponse.checkout` | `url` | string (uri) | yes |  |
| `FieldUpdate.ministryTrack` | `id` | string (uuid) | yes |  |
| `FieldUpdate.ministryTrack` | `name` | string | yes |  |
| `FieldUpdate.publisher` | `id` | string (uuid) | yes |  |
| `FieldUpdate.publisher` | `firstName` | string | yes |  |
| `FieldUpdate.publisher` | `lastName` | string or null | yes |  |

import type { components } from './generated';
import { apiRequest, clearSession, toFormData, withQuery } from './client';
import { getRefreshToken, storeTokens } from './session';

type S = components['schemas'];
type PageParams = { page?: number; limit?: number };
type ListParams = PageParams & Record<string, string | number | boolean | undefined>;
type UserFileInput = Omit<S['CreateUserRequest'], 'profilePictureUrl'> & { profilePictureUrl?: File };
type UserFileUpdate = Omit<S['UpdateUserRequest'], 'profilePictureUrl'> & { profilePictureUrl?: File };
type TestimonyInput = Omit<S['CreateTestimonyRequest'], 'coverImage'> & { coverImage?: File };
type TestimonyUpdate = Omit<S['UpdateTestimonyRequest'], 'coverImage'> & { coverImage?: File };
type ProfileFileUpdate = Omit<S['UpdateProfileRequest'], 'profilePictureUrl'> & { profilePictureUrl?: File };
type FieldUpdateInput = Omit<S['CreateFieldUpdateRequest'], 'media'> & { media?: File };
type FieldUpdateEdit = Omit<S['UpdateFieldUpdateRequest'], 'media'> & { media?: File };
type InvitationPage = S['Pagination'] & { invitations: S['Invitation'][] };

export const authApi = {
  async login(input: S['LoginRequest']) {
    const result = await apiRequest<S['AuthenticatedSession'] | S['TwoFactorChallenge']>('/auth/login', {
      method: 'POST', body: input, auth: false,
    });
    if ('accessToken' in result) storeTokens(result);
    return result;
  },
  async verifyTwoFactor(input: S['VerifyTwoFactorRequest']) {
    const result = await apiRequest<S['AuthenticatedSession']>('/auth/verify-2fa', {
      method: 'POST', body: input, auth: false,
    });
    storeTokens(result);
    return result;
  },
  async refresh() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    const result = await apiRequest<S['TokenPairResponse']>('/auth/refresh', {
      method: 'POST', body: { refreshToken }, auth: false,
    });
    storeTokens(result);
    return result;
  },
  profile: () => apiRequest<{ user: S['User'] }>('/auth/profile'),
  updateProfile: (input: ProfileFileUpdate) => apiRequest<{ user: S['User'] }>('/auth/profile', { method: 'PATCH', body: toFormData(input) }),
  enableTwoFactor: () => apiRequest<{ message: string; user: S['User'] }>('/auth/2fa/enable', { method: 'POST' }),
  disableTwoFactor: (password: string) => apiRequest<{ message: string; user: S['User'] }>('/auth/2fa/disable', { method: 'POST', body: { password } }),
  invitationPreview: (token: string) => apiRequest<{ invitation: S['InvitationPreview'] }>(withQuery('/auth/invite', { token }), { auth: false }),
  forgotPassword: (email: string) => apiRequest<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
  resetPassword: (input: S['ResetPasswordRequest']) => apiRequest<{ message: string }>('/auth/reset-password', { method: 'POST', body: input, auth: false }),
  async acceptInvitation(input: S['AcceptInvitationRequest']) {
    const result = await apiRequest<S['AuthenticatedSession']>('/auth/accept-invite', { method: 'POST', body: input, auth: false });
    storeTokens(result);
    return result;
  },
  async restoreSession() {
    if (!getRefreshToken()) return null;
    try {
      await this.refresh();
      return (await this.profile()).user;
    } catch (error) {
      clearSession();
      throw error;
    }
  },
  async logout() {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await apiRequest<{ message: string }>('/auth/logout', { method: 'POST', body: { refreshToken } });
    } finally {
      clearSession();
    }
  },
};

export const ministryTracksApi = {
  list: (params: ListParams = {}) => apiRequest<S['MinistryTrackPage']>(withQuery('/ministry-tracks', params)),
  get: (id: string) => apiRequest<S['MinistryTrack']>(`/ministry-tracks/${id}`),
  create: (input: S['CreateMinistryTrackRequest']) => apiRequest<S['MinistryTrack']>('/ministry-tracks', { method: 'POST', body: input }),
  update: (id: string, input: S['UpdateMinistryTrackRequest']) => apiRequest<S['MinistryTrack']>(`/ministry-tracks/${id}`, { method: 'PATCH', body: input }),
  delete: (id: string) => apiRequest<{ message: string }>(`/ministry-tracks/${id}`, { method: 'DELETE' }),
  commitments: (id: string, params: PageParams = {}) => apiRequest<S['MinistryTrackCommitments']>(withQuery(`/ministry-tracks/${id}/commitments`, params)),
};

export const subscriptionsApi = {
  list: (params: ListParams = {}) => apiRequest<S['CommitmentPage']>(withQuery('/subscriptions', params)),
  createCheckout: (input: S['CreateSubscriptionCheckoutRequest']) => apiRequest<S['CheckoutResponse']>('/subscriptions', { method: 'POST', body: input }),
  get: (id: string) => apiRequest<S['SubscriptionStatus']>(`/subscriptions/${id}`),
  update: (id: string, input: S['UpdateSubscriptionRequest']) => apiRequest<S['SubscriptionUpdateResponse']>(`/subscriptions/${id}`, { method: 'PATCH', body: input }),
  cancel: (id: string) => apiRequest<S['SubscriptionCancellationResponse']>(`/subscriptions/${id}`, { method: 'DELETE' }),
  billingPortal: (id: string) => apiRequest<{ url: string }>(`/subscriptions/${id}/billing-portal`, { method: 'POST' }),
};

export const paymentsApi = {
  list: (params: ListParams = {}) => apiRequest<S['PaymentPage']>(withQuery('/payments', params)),
  get: (paymentRequestId: string) => apiRequest<S['Payment']>(`/payments/${paymentRequestId}`),
  forUser: (id: string, params: ListParams = {}) => apiRequest<S['PaymentPage']>(withQuery(`/users/${id}/payments`, params)),
};

export const guestCheckoutsApi = {
  create: (input: S['CreateGuestCheckoutRequest']) => apiRequest<S['GuestCheckoutResponse']>('/guest-checkouts', { method: 'POST', body: input, auth: false }),
  payment: (id: string, token: string) => apiRequest<S['Payment']>(withQuery(`/guest-checkouts/${id}/payment`, { token }), { auth: false }),
};

export const prayerWallApi = {
  list: (params: PageParams & { type?: 'all' | 'prayer' | 'praise' } = {}) => apiRequest<S['ThreadPage']>(withQuery('/prayer-wall', params)),
  get: (id: string, params: PageParams = {}) => apiRequest<{ thread: S['PrayerWallThread']; comments: S['CommentPage'] }>(withQuery(`/prayer-wall/${id}`, params)),
  create: (input: S['CreateThreadRequest']) => apiRequest<{ message: string; thread: S['PrayerWallThread'] }>('/prayer-wall', { method: 'POST', body: input }),
  delete: (id: string) => apiRequest<{ message: string }>(`/prayer-wall/${id}`, { method: 'DELETE' }),
  comments: (id: string, params: PageParams = {}) => apiRequest<S['CommentPage']>(withQuery(`/prayer-wall/${id}/comments`, params)),
  createComment: (id: string, input: S['CreateCommentRequest']) => apiRequest<{ message: string; comment: S['PrayerWallComment'] }>(`/prayer-wall/${id}/comments`, { method: 'POST', body: input }),
  deleteComment: (threadId: string, commentId: string) => apiRequest<{ message: string }>(`/prayer-wall/${threadId}/comments/${commentId}`, { method: 'DELETE' }),
  addReaction: (id: string, reactionType: 'like' | 'join_prayer') => apiRequest<{ created: boolean; reactions: S['ReactionSummary'] }>(`/prayer-wall/${id}/reactions/${reactionType}`, { method: 'PUT' }),
  removeReaction: (id: string, reactionType: 'like' | 'join_prayer') => apiRequest<{ removed: boolean; reactions: S['ReactionSummary'] }>(`/prayer-wall/${id}/reactions/${reactionType}`, { method: 'DELETE' }),
  manageThreads: (params: ListParams = {}) => apiRequest<S['Pagination'] & { threads: S['ManagedThread'][] }>(withQuery('/prayer-wall/manage/threads', params)),
  manageThread: (id: string, params: PageParams = {}) => apiRequest<{ thread: S['ManagedThread']; comments: S['ManagedCommentPage'] }>(withQuery(`/prayer-wall/manage/threads/${id}`, params)),
  moderateDeleteThread: (id: string, reason: string) => apiRequest<{ message: string; thread: S['ManagedThread']; comments: S['ManagedCommentPage'] }>(`/prayer-wall/manage/threads/${id}`, { method: 'DELETE', body: { reason } }),
  restoreThread: (id: string) => apiRequest<{ message: string; thread: S['ManagedThread']; comments: S['ManagedCommentPage'] }>(`/prayer-wall/manage/threads/${id}/restore`, { method: 'PATCH' }),
  manageComments: (params: ListParams = {}) => apiRequest<S['Pagination'] & { comments: S['ManagedComment'][] }>(withQuery('/prayer-wall/manage/comments', params)),
  manageComment: (id: string) => apiRequest<{ comment: S['ManagedComment'] }>(`/prayer-wall/manage/comments/${id}`),
  moderateDeleteComment: (id: string, reason: string) => apiRequest<{ message: string; comment: S['ManagedComment'] }>(`/prayer-wall/manage/comments/${id}`, { method: 'DELETE', body: { reason } }),
  restoreComment: (id: string) => apiRequest<{ message: string; comment: S['ManagedComment'] }>(`/prayer-wall/manage/comments/${id}/restore`, { method: 'PATCH' }),
};

export const notificationsApi = {
  list: (params: PageParams & { status?: 'all' | 'unread' | 'read' } = {}) => apiRequest<S['NotificationFeedPage']>(withQuery('/notifications', params)),
  markRead: (id: string) => apiRequest<S['NotificationFeedItem']>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiRequest<S['MarkAllNotificationsReadResponse']>('/notifications/read-all', { method: 'PATCH' }),
  manage: (params: ListParams = {}) => apiRequest<S['ManagedNotificationPage']>(withQuery('/notifications/manage', params)),
  create: (input: S['CreateAdminNotificationRequest']) => apiRequest<S['ManagedNotification']>('/notifications/manage', { method: 'POST', body: input }),
  getManaged: (id: string) => apiRequest<S['ManagedNotification']>(`/notifications/manage/${id}`),
};

export const usersApi = {
  list: (params: ListParams = {}) => apiRequest<S['UserPage']>(withQuery('/users', params)),
  get: (id: string) => apiRequest<{ user: S['User'] }>(`/users/${id}`),
  create: (input: UserFileInput) => apiRequest<{ message: string; user: S['User'] }>('/users', { method: 'POST', body: toFormData(input) }),
  update: (id: string, input: UserFileUpdate) => apiRequest<{ message: string; user: S['User'] }>(`/users/${id}`, { method: 'PATCH', body: toFormData(input) }),
  delete: (id: string) => apiRequest<S['UserDeletionResponse']>(`/users/${id}`, { method: 'DELETE' }),
  resendInvitation: (id: string, expiresInHours?: number) => apiRequest<{ message: string; user: S['User'] }>(`/users/${id}/resend-invite`, { method: 'POST', body: expiresInHours ? { expiresInHours } : undefined }),
  badges: (id: string) => apiRequest<S['UserBadge'][]>(`/users/${id}/badges`),
  commitments: (id: string, params: ListParams = {}) => apiRequest<S['CommitmentPage']>(withQuery(`/users/${id}/commitments`, params)),
  payments: (id: string, params: ListParams = {}) => apiRequest<S['PaymentPage']>(withQuery(`/users/${id}/payments`, params)),
  prayerActivity: (id: string, params: ListParams = {}) => apiRequest<S['PrayerActivityPage']>(withQuery(`/users/${id}/prayer-activity`, params)),
};

export const invitationsApi = {
  async list(params: ListParams = {}): Promise<InvitationPage> {
    const result = await apiRequest<{ invitations: S['Invitation'][]; total?: number; page?: number; limit?: number; totalPages?: number }>(withQuery('/invitations', params));
    const page = result.page ?? Number(params.page ?? 1);
    const limit = result.limit ?? Number(params.limit ?? Math.max(result.invitations.length, 1));
    const total = result.total ?? result.invitations.length;
    return { ...result, page, limit, total, totalPages: result.totalPages ?? Math.max(1, Math.ceil(total / limit)) };
  },
  create: (input: S['CreateInvitationRequest']) => apiRequest<{ message: string; invitation: S['Invitation'] }>('/invitations', { method: 'POST', body: input }),
  resend: (id: string, expiresInHours?: number) => apiRequest<{ message: string; invitation: S['Invitation'] }>(`/invitations/${id}/resend`, { method: 'POST', body: expiresInHours ? { expiresInHours } : undefined }),
  revoke: (id: string) => apiRequest<{ message: string; invitation: S['Invitation'] }>(`/invitations/${id}/revoke`, { method: 'POST' }),
};

export const referralsApi = {
  list: (params: ListParams = {}) => apiRequest<S['ReferralPage']>(withQuery('/referrals', params)),
  create: (input: S['CreateReferralRequest']) => apiRequest<S['Referral']>('/referrals', { method: 'POST', body: input }),
  get: (id: string) => apiRequest<{ referral: S['Referral'] }>(`/referrals/${id}`),
  resend: (id: string) => apiRequest<{ message: string; referral: S['Referral'] }>(`/referrals/${id}/resend`, { method: 'POST' }),
};

export const publicApi = {
  tracks: (params: PageParams = {}) => apiRequest<S['PublicMinistryTrackPage']>(withQuery('/public/ministry-tracks', params), { auth: false }),
  track: (id: string) => apiRequest<{ ministryTrack: S['PublicMinistryTrack'] }>(`/public/ministry-tracks/${id}`, { auth: false }),
  announcements: (params: PageParams = {}) => apiRequest<S['AnnouncementPage']>(withQuery('/public/announcements', params), { auth: false }),
  testimonies: (params: PageParams = {}) => apiRequest<S['TestimonyPage']>(withQuery('/public/testimonies', params), { auth: false }),
};

export const fieldUpdatesApi = {
  list: (params: ListParams = {}) => apiRequest<S['FieldUpdatePage']>(withQuery('/field-updates', params), { auth: false }),
  get: (id: string) => apiRequest<S['FieldUpdate']>(`/field-updates/${id}`, { auth: false }),
  create: (input: FieldUpdateInput) => apiRequest<{ fieldUpdate: S['FieldUpdate'] }>('/field-updates', { method: 'POST', body: toFormData(input) }),
  update: (id: string, input: FieldUpdateEdit) => apiRequest<{ fieldUpdate: S['FieldUpdate'] }>(`/field-updates/${id}`, { method: 'PATCH', body: toFormData(input) }),
  delete: (id: string) => apiRequest<{ fieldUpdate: S['FieldUpdate'] }>(`/field-updates/${id}`, { method: 'DELETE' }),
};

export const contactApi = {
  submit: (input: S['ContactInquiryRequest']) => apiRequest<{ message: string }>('/contact-inquiries', { method: 'POST', body: input, auth: false }),
};

export const logsApi = {
  list: (params: ListParams = {}) => apiRequest<S['AuditLogPage']>(withQuery('/logs', params)),
};

export const announcementsApi = {
  list: (params: PageParams = {}) => apiRequest<S['AnnouncementPage']>(withQuery('/announcements', params)),
  manage: (params: ListParams = {}) => apiRequest<S['ManagedAnnouncementPage']>(withQuery('/announcements/manage', params)),
  get: (id: string) => apiRequest<{ announcement: S['ManagedAnnouncement'] }>(`/announcements/${id}`),
  create: (input: S['CreateAnnouncementRequest']) => apiRequest<{ message: string; announcement: S['ManagedAnnouncement'] }>('/announcements', { method: 'POST', body: input }),
  update: (id: string, input: S['UpdateAnnouncementRequest']) => apiRequest<{ message: string; announcement: S['ManagedAnnouncement'] }>(`/announcements/${id}`, { method: 'PATCH', body: input }),
  restore: (id: string) => apiRequest<{ message: string; announcement: S['ManagedAnnouncement'] }>(`/announcements/${id}/restore`, { method: 'PATCH' }),
  delete: (id: string) => apiRequest<{ message: string }>(`/announcements/${id}`, { method: 'DELETE' }),
};

export const testimoniesApi = {
  list: (params: PageParams = {}) => apiRequest<S['TestimonyPage']>(withQuery('/testimonies', params)),
  manage: (params: ListParams = {}) => apiRequest<S['ManagedTestimonyPage']>(withQuery('/testimonies/manage', params)),
  get: (id: string) => apiRequest<{ testimony: S['ManagedTestimony'] }>(`/testimonies/${id}`),
  create: (input: TestimonyInput) => apiRequest<{ message: string; testimony: S['ManagedTestimony'] }>('/testimonies', { method: 'POST', body: toFormData(input) }),
  update: (id: string, input: TestimonyUpdate) => apiRequest<{ message: string; testimony: S['ManagedTestimony'] }>(`/testimonies/${id}`, { method: 'PATCH', body: toFormData(input) }),
  delete: (id: string) => apiRequest<{ message: string }>(`/testimonies/${id}`, { method: 'DELETE' }),
};

export const badgesApi = {
  list: (params: ListParams = {}) => apiRequest<S['BadgePage']>(withQuery('/badges', params)),
  get: (id: string) => apiRequest<{ badge: S['Badge'] }>(`/badges/${id}`),
  create: (input: S['CreateBadgeRequest']) => apiRequest<{ message: string; badge: S['Badge'] }>('/badges', { method: 'POST', body: input }),
  update: (id: string, input: S['UpdateBadgeRequest']) => apiRequest<{ message: string; badge: S['Badge'] }>(`/badges/${id}`, { method: 'PATCH', body: input }),
  retire: (id: string) => apiRequest<{ message: string; badge: S['Badge'] }>(`/badges/${id}/retire`, { method: 'PATCH' }),
  delete: (id: string) => apiRequest<{ message: string }>(`/badges/${id}`, { method: 'DELETE' }),
};

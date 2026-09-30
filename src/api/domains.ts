import type { components } from "./generated";
import { apiRequest, clearSession, toFormData, withQuery } from "./client";
import { getRefreshToken, storeTokens } from "./session";

type S = components["schemas"];
type PageParams = { page?: number; limit?: number };
type ListParams = PageParams &
  Record<string, string | number | boolean | undefined>;
type ProfileFileUpdate = Omit<
  S["UpdateProfileRequest"],
  "profilePictureUrl"
> & { profilePictureUrl?: File };

export const authApi = {
  async login(input: S["LoginRequest"]) {
    const result = await apiRequest<
      S["AuthenticatedSession"] | S["TwoFactorChallenge"]
    >("/auth/login", {
      method: "POST",
      body: input,
      auth: false,
    });
    if ("accessToken" in result) storeTokens(result);
    return result;
  },
  async verifyTwoFactor(input: S["VerifyTwoFactorRequest"]) {
    const result = await apiRequest<S["AuthenticatedSession"]>(
      "/auth/verify-2fa",
      {
        method: "POST",
        body: input,
        auth: false,
      },
    );
    storeTokens(result);
    return result;
  },
  async refresh() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    const result = await apiRequest<S["TokenPairResponse"]>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      auth: false,
    });
    storeTokens(result);
    return result;
  },
  profile: () => apiRequest<{ user: S["User"] }>("/auth/profile"),
  updateProfile: (input: ProfileFileUpdate) =>
    apiRequest<{ user: S["User"] }>("/auth/profile", {
      method: "PATCH",
      body: toFormData(input),
    }),
  enableTwoFactor: () =>
    apiRequest<{ message: string; user: S["User"] }>("/auth/2fa/enable", {
      method: "POST",
    }),
  disableTwoFactor: (password: string) =>
    apiRequest<{ message: string; user: S["User"] }>("/auth/2fa/disable", {
      method: "POST",
      body: { password },
    }),
  invitationPreview: (token: string) =>
    apiRequest<{ invitation: S["InvitationPreview"] }>(
      withQuery("/auth/invite", { token }),
      { auth: false },
    ),
  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    }),
  resetPassword: (input: S["ResetPasswordRequest"]) =>
    apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: input,
      auth: false,
    }),
  async acceptInvitation(input: S["AcceptInvitationRequest"]) {
    const result = await apiRequest<S["AuthenticatedSession"]>(
      "/auth/accept-invite",
      { method: "POST", body: input, auth: false },
    );
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
      if (refreshToken)
        await apiRequest<{ message: string }>("/auth/logout", {
          method: "POST",
          body: { refreshToken },
        });
    } finally {
      clearSession();
    }
  },
};

export const ministryTracksApi = {
  list: (params: ListParams = {}) =>
    apiRequest<S["MinistryTrackPage"]>(withQuery("/ministry-tracks", params)),
};

export const subscriptionsApi = {
  list: (params: ListParams = {}) =>
    apiRequest<S["CommitmentPage"]>(withQuery("/subscriptions", params)),
  createCheckout: (input: S["CreateSubscriptionCheckoutRequest"]) =>
    apiRequest<S["CheckoutResponse"]>("/subscriptions", {
      method: "POST",
      body: input,
    }),
  get: (id: string) =>
    apiRequest<S["SubscriptionStatus"]>(`/subscriptions/${id}`),
  update: (id: string, input: S["UpdateSubscriptionRequest"]) =>
    apiRequest<S["SubscriptionUpdateResponse"]>(`/subscriptions/${id}`, {
      method: "PATCH",
      body: input,
    }),
  cancel: (id: string) =>
    apiRequest<S["SubscriptionCancellationResponse"]>(`/subscriptions/${id}`, {
      method: "DELETE",
    }),
  billingPortal: (id: string) =>
    apiRequest<{ url: string }>(`/subscriptions/${id}/billing-portal`, {
      method: "POST",
    }),
};

export const paymentsApi = {
  // Payment state is the server's webhook projection; bypass HTTP caches as
  // well as React Query's cache when history is revalidated.
  list: (params: ListParams = {}) =>
    apiRequest<S["PaymentPage"]>(withQuery("/payments", params), {
      cache: "no-store",
    }),
  get: (transactionId: string) =>
    apiRequest<S["Payment"]>(`/payments/${transactionId}`, {
      cache: "no-store",
    }),
};

export const guestCheckoutsApi = {
  create: (input: S["CreateGuestCheckoutRequest"]) =>
    apiRequest<S["GuestCheckoutResponse"]>("/guest-checkouts", {
      method: "POST",
      body: input,
      auth: false,
    }),
  payment: (id: string, token: string) =>
    apiRequest<S["Payment"]>(
      withQuery(`/guest-checkouts/${id}/payment`, { token }),
      { auth: false },
    ),
};

export const prayerWallApi = {
  list: (params: PageParams & { type?: "all" | "prayer" | "praise" } = {}) =>
    apiRequest<S["ThreadPage"]>(withQuery("/prayer-wall", params)),
  get: (id: string, params: PageParams = {}) =>
    apiRequest<{ thread: S["PrayerWallThread"]; comments: S["CommentPage"] }>(
      withQuery(`/prayer-wall/${id}`, params),
    ),
  create: (input: S["CreateThreadRequest"]) =>
    apiRequest<{ message: string; thread: S["PrayerWallThread"] }>(
      "/prayer-wall",
      { method: "POST", body: input },
    ),
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/prayer-wall/${id}`, { method: "DELETE" }),
  comments: (id: string, params: PageParams = {}) =>
    apiRequest<S["CommentPage"]>(
      withQuery(`/prayer-wall/${id}/comments`, params),
    ),
  createComment: (id: string, input: S["CreateCommentRequest"]) =>
    apiRequest<{ message: string; comment: S["PrayerWallComment"] }>(
      `/prayer-wall/${id}/comments`,
      { method: "POST", body: input },
    ),
  deleteComment: (threadId: string, commentId: string) =>
    apiRequest<{ message: string }>(
      `/prayer-wall/${threadId}/comments/${commentId}`,
      { method: "DELETE" },
    ),
  addReaction: (id: string, reactionType: "like" | "join_prayer") =>
    apiRequest<{ created: boolean; reactions: S["ReactionSummary"] }>(
      `/prayer-wall/${id}/reactions/${reactionType}`,
      { method: "PUT" },
    ),
  removeReaction: (id: string, reactionType: "like" | "join_prayer") =>
    apiRequest<{ removed: boolean; reactions: S["ReactionSummary"] }>(
      `/prayer-wall/${id}/reactions/${reactionType}`,
      { method: "DELETE" },
    ),
};

export const notificationsApi = {
  list: (params: PageParams & { status?: "all" | "unread" | "read" } = {}) =>
    apiRequest<S["NotificationFeedPage"]>(withQuery("/notifications", params)),
  markRead: (id: string) =>
    apiRequest<S["NotificationFeedItem"]>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),
  markAllRead: () =>
    apiRequest<S["MarkAllNotificationsReadResponse"]>(
      "/notifications/read-all",
      { method: "PATCH" },
    ),
};

export const userBadgesApi = {
  list: (id: string) => apiRequest<S["UserBadge"][]>(`/users/${id}/badges`),
};

export const referralsApi = {
  list: (params: ListParams = {}) =>
    apiRequest<S["ReferralPage"]>(withQuery("/referrals", params)),
  create: (input: S["CreateReferralRequest"]) =>
    apiRequest<S["Referral"]>("/referrals", { method: "POST", body: input }),
  get: (id: string) =>
    apiRequest<{ referral: S["Referral"] }>(`/referrals/${id}`),
  resend: (id: string) =>
    apiRequest<{ message: string; referral: S["Referral"] }>(
      `/referrals/${id}/resend`,
      { method: "POST" },
    ),
};

export const publicApi = {
  tracks: (params: PageParams = {}) =>
    apiRequest<S["PublicMinistryTrackPage"]>(
      withQuery("/public/ministry-tracks", params),
      { auth: false },
    ),
  track: (id: string) =>
    apiRequest<{ ministryTrack: S["PublicMinistryTrack"] }>(
      `/public/ministry-tracks/${id}`,
      { auth: false },
    ),
  announcements: (params: PageParams = {}) =>
    apiRequest<S["AnnouncementPage"]>(
      withQuery("/public/announcements", params),
      { auth: false },
    ),
  testimonies: (params: PageParams = {}) =>
    apiRequest<S["TestimonyPage"]>(withQuery("/public/testimonies", params), {
      auth: false,
    }),
};

export const fieldUpdatesApi = {
  list: (params: ListParams = {}) =>
    apiRequest<S["FieldUpdatePage"]>(withQuery("/field-updates", params)),
  async get(id: string) {
    const result = await apiRequest<{ fieldUpdate: S["FieldUpdate"] }>(
      `/field-updates/${id}`,
    );
    return result.fieldUpdate;
  },
};

export const contactApi = {
  submit: (input: S["ContactInquiryRequest"]) =>
    apiRequest<{ message: string }>("/contact-inquiries", {
      method: "POST",
      body: input,
      auth: false,
    }),
};

export const announcementsApi = {
  list: (params: PageParams = {}) =>
    apiRequest<S["AnnouncementPage"]>(withQuery("/announcements", params)),
};

export const testimoniesApi = {
  list: (params: PageParams = {}) =>
    apiRequest<S["TestimonyPage"]>(withQuery("/testimonies", params)),
};

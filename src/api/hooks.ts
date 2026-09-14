import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import {
  announcementsApi, authApi, badgesApi, checkoutSessionsApi, guestCheckoutsApi, invitationsApi, logsApi, ministryTracksApi,
  fieldUpdatesApi, notificationsApi, paymentsApi, prayerWallApi, publicApi, referralsApi, subscriptionsApi, testimoniesApi, unitsApi, usersApi,
} from './domains';
import { queryKeys } from './queryKeys';
import type { components, paths } from './generated';

type ListParams = Record<string, string | number | boolean | undefined>;
type PageParams = { page?: number; limit?: number };
type SubscriptionStatus = components['schemas']['SubscriptionStatus'];
type CommitmentPage = components['schemas']['CommitmentPage'];
export type TrackListParams = PageParams & { search?: string; isActive?: boolean; sortBy?: 'createdAt' | 'isActive' | 'Alphabetical' | 'current_metric_level' | 'target_metric_level' | 'min_monthly_contribution'; sortOrder?: 'ASC' | 'DESC' };
export type UserListParams = PageParams & { search?: string; role?: 'admin' | 'family' | 'friend'; isActive?: boolean; sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'email' | 'role' | 'isActive' | 'lastLoginAt'; sortOrder?: 'ASC' | 'DESC' };
export type InvitationListParams = PageParams & { search?: string; status?: 'pending' | 'accepted' | 'expired' | 'revoked'; role?: 'admin' | 'family' | 'friend'; deliveryStatus?: 'pending' | 'sent' | 'failed'; sortBy?: 'createdAt' | 'updatedAt' | 'email' | 'status' | 'expiresAt'; sortOrder?: 'ASC' | 'DESC' };
export type AnnouncementAdminListParams = PageParams & { search?: string; status?: 'draft' | 'published' | 'archived'; visibilityState?: 'draft' | 'scheduled' | 'active' | 'expired' | 'archived'; audienceType?: 'global' | 'roles' | 'tracks'; type?: 'info' | 'warning' | 'urgent'; priority?: 'low' | 'normal' | 'high'; role?: 'admin' | 'family' | 'friend'; trackId?: string };
export type TestimonyAdminListParams = PageParams & { search?: string; status?: 'draft' | 'published' | 'archived'; visibilityState?: 'draft' | 'scheduled' | 'active' | 'expired' | 'archived'; trackId?: string; global?: boolean };
export type BadgeListParams = PageParams & { search?: string; isActive?: boolean; sortBy?: 'createdAt' | 'name' | 'order' | 'isActive'; sortOrder?: 'ASC' | 'DESC' };
export type ModerationListParams = PageParams & { search?: string; status?: 'visible' | 'removed'; type?: 'prayer' | 'praise'; threadId?: string };
export type ManagedNotificationListParams = PageParams & { search?: string; origin?: 'admin' | 'system'; audienceType?: 'all' | 'users' | 'roles' | 'tracks' };
export type AuditLogListParams = PageParams & { userId?: string; entityName?: string; entityId?: string; action?: string; startDate?: string; endDate?: string; sortBy?: 'createdAt' | 'action' | 'entityName'; sortOrder?: 'ASC' | 'DESC' };
export type FieldUpdateAdminListParams = NonNullable<paths['/field-updates']['get']['parameters']['query']>;
export type FieldUpdateListParams = Pick<FieldUpdateAdminListParams, 'page' | 'limit'>;

export function useSessionRestore() {
  return useQuery({ queryKey: queryKeys.auth.session, queryFn: () => authApi.restoreSession(), retry: false, staleTime: Infinity });
}

export const useProfile = (enabled = true) => useQuery({ queryKey: queryKeys.auth.profile, queryFn: () => authApi.profile(), enabled });
export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation({ mutationFn: authApi.updateProfile, onSuccess: result => { client.setQueryData(queryKeys.auth.profile, result); client.setQueryData(queryKeys.auth.session, result.user); } });
}
export const useInvitationPreview = (token: string, enabled = true) => useQuery({ queryKey: queryKeys.auth.invitation(token), queryFn: () => authApi.invitationPreview(token), enabled: enabled && !!token });

export function useLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: result => {
      if ('user' in result) client.setQueryData(queryKeys.auth.session, result.user);
    },
  });
}

export function useVerifyTwoFactor() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: authApi.verifyTwoFactor,
    onSuccess: result => client.setQueryData(queryKeys.auth.session, result.user),
  });
}

export function useLogout() {
  const client = useQueryClient();
  return useMutation({ mutationFn: authApi.logout, onSettled: () => client.clear() });
}

export function useEnableTwoFactor() {
  const client = useQueryClient();
  return useMutation({ mutationFn: authApi.enableTwoFactor, onSuccess: result => { client.setQueryData(queryKeys.auth.profile, { user: result.user }); client.invalidateQueries({ queryKey: queryKeys.auth.all }); } });
}

export function useDisableTwoFactor() {
  const client = useQueryClient();
  return useMutation({ mutationFn: authApi.disableTwoFactor, onSuccess: result => { client.setQueryData(queryKeys.auth.profile, { user: result.user }); client.invalidateQueries({ queryKey: queryKeys.auth.all }); } });
}
export const useForgotPassword = () => useMutation({ mutationFn: authApi.forgotPassword });
export const useResetPassword = () => useMutation({ mutationFn: authApi.resetPassword });
export function useAcceptInvitation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: authApi.acceptInvitation, onSuccess: result => client.setQueryData(queryKeys.auth.session, result.user) });
}

export function useMinistryTracks(params: TrackListParams = {}, enabled = true) {
  return useQuery({ queryKey: queryKeys.tracks.list(params), queryFn: () => ministryTracksApi.list(params), enabled, placeholderData: previous => previous });
}
export const useUnits = (enabled = true) => useQuery({ queryKey: queryKeys.units.list, queryFn: unitsApi.list, enabled });
export function useCreateUnit() {
  const client = useQueryClient();
  return useMutation({ mutationFn: unitsApi.create, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.units.all }) });
}
export function useDeleteUnit() {
  const client = useQueryClient();
  return useMutation({ mutationFn: unitsApi.delete, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.units.all }) });
}
export const usePublicTracks = (params: PageParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.public.tracks(params), queryFn: () => publicApi.tracks(params), enabled, placeholderData: previous => previous });
export const usePublicAnnouncements = (params: PageParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.public.announcements(params), queryFn: () => publicApi.announcements(params), enabled });
export const usePublicTestimonies = (params: PageParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.public.testimonies(params), queryFn: () => publicApi.testimonies(params), enabled });
export const useFieldUpdates = (params: FieldUpdateListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.fieldUpdates.userList(params), queryFn: () => fieldUpdatesApi.list({ ...params, status: 'published' }), enabled, placeholderData: previous => previous });
export const useAdminFieldUpdates = (params: FieldUpdateAdminListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.fieldUpdates.adminList(params), queryFn: () => fieldUpdatesApi.list(params), enabled, placeholderData: previous => previous });
export const useFieldUpdate = (id: string, enabled = true) => useQuery({ queryKey: queryKeys.fieldUpdates.detail(id), queryFn: () => fieldUpdatesApi.get(id), enabled: enabled && !!id });

function useFieldUpdateMutation<TVariables>(mutationFn: (variables: TVariables) => ReturnType<typeof fieldUpdatesApi.create>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: fieldUpdate => {
      client.setQueryData(queryKeys.fieldUpdates.detail(fieldUpdate.id), fieldUpdate);
      void client.invalidateQueries({ queryKey: queryKeys.fieldUpdates.lists() });
      void client.invalidateQueries({ queryKey: queryKeys.fieldUpdates.detail(fieldUpdate.id) });
    },
  });
}

export const useCreateFieldUpdate = () => useFieldUpdateMutation(fieldUpdatesApi.create);
export const useUpdateFieldUpdate = () => useFieldUpdateMutation(({ id, input }: { id: string; input: Parameters<typeof fieldUpdatesApi.update>[1] }) => fieldUpdatesApi.update(id, input));
export const usePublishFieldUpdate = () => useFieldUpdateMutation(({ id, publishedAt }: { id: string; publishedAt?: string }) => fieldUpdatesApi.publish(id, publishedAt));
export const useArchiveFieldUpdate = () => useFieldUpdateMutation(fieldUpdatesApi.archive);
export const useRestoreFieldUpdate = () => useFieldUpdateMutation(fieldUpdatesApi.restore);

export function useTrack(id: string, enabled = true) {
  return useQuery({ queryKey: queryKeys.tracks.detail(id), queryFn: () => ministryTracksApi.get(id), enabled: enabled && !!id });
}

export function useTrackCommitments(id: string, params: ListParams = {}, enabled = true) {
  return useQuery({ queryKey: queryKeys.tracks.commitments(id, params), queryFn: () => ministryTracksApi.commitments(id, params), enabled: enabled && !!id });
}

export function useCreateTrack() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ministryTracksApi.create, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.tracks.all }) });
}

export function useUpdateTrack() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof ministryTracksApi.update>[1] }) => ministryTracksApi.update(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.tracks.all }),
  });
}

export function useDeleteTrack() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ministryTracksApi.delete, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.tracks.all }) });
}

export function useSubscription(id: string, enabled = true) {
  return useQuery({ queryKey: queryKeys.subscriptions.detail(id), queryFn: () => subscriptionsApi.get(id), enabled: enabled && !!id });
}

export function useSubscriptions(params: ListParams = {}, enabled = true) {
  return useQuery({ queryKey: queryKeys.subscriptions.list(params), queryFn: () => subscriptionsApi.list(params), enabled, placeholderData: previous => previous });
}

export function useCreateCheckout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: subscriptionsApi.createCheckout,
    // A checkout creates (or retrieves idempotently) the payment request that
    // feeds Giving history. Clear every page so returning to the dashboard
    // cannot show a pre-checkout snapshot.
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.payments.all }),
  });
}
export const useCreateGuestCheckout = () => useMutation({ mutationFn: guestCheckoutsApi.create });
export const useGuestPayment = (id: string, token: string, enabled = true) => useQuery({ queryKey: queryKeys.payments.detail(`guest:${id}`), queryFn: () => guestCheckoutsApi.payment(id, token), enabled: enabled && !!id && !!token, refetchInterval: query => query.state.data?.status === 'pending' ? 4000 : false });
export const usePayments = (params: ListParams = {}, enabled = true) => useQuery({
  queryKey: queryKeys.payments.list(params),
  queryFn: () => paymentsApi.list(params),
  enabled,
  // Payment status is webhook-authoritative, so never treat the shared
  // 30-second query cache as the source of truth for Giving history.
  staleTime: 0,
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
  refetchInterval: query => query.state.data?.payments.some(payment => payment.status === 'pending') ? 4000 : false,
});
export function usePayment(id: string, enabled = true) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => paymentsApi.get(id),
    enabled: enabled && !!id,
    refetchInterval: query => query.state.data?.status === 'pending' ? 4000 : false,
  });
  useEffect(() => {
    if (query.data && query.data.status !== 'pending') void client.invalidateQueries({ queryKey: queryKeys.payments.all });
  }, [client, query.data]);
  return query;
}

export function updateSubscriptionInLists(client: QueryClient, subscription: SubscriptionStatus) {
  client.setQueriesData<CommitmentPage>({ queryKey: queryKeys.subscriptions.all }, current => current ? {
    ...current,
    commitments: current.commitments.map(commitment => commitment.subscription?.id === subscription.id
      ? { ...commitment, subscription }
      : commitment),
  } : current);
}

export async function invalidateSubscriptionQueries(client: QueryClient, id: string) {
  await Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.subscriptions.all }),
    client.invalidateQueries({ queryKey: queryKeys.subscriptions.detail(id) }),
  ]);
}

export function useUpdateSubscription() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof subscriptionsApi.update>[1] }) => subscriptionsApi.update(id, input),
    onSuccess: async (result, variables) => {
      if ('subscription' in result) {
        client.setQueryData(queryKeys.subscriptions.detail(variables.id), result.subscription);
        updateSubscriptionInLists(client, result.subscription);
      }
      await invalidateSubscriptionQueries(client, variables.id);
    },
  });
}

export function useCancelSubscription() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: subscriptionsApi.cancel,
    onSuccess: async (result, id) => {
      client.setQueryData(queryKeys.subscriptions.detail(id), result.subscription);
      updateSubscriptionInLists(client, result.subscription);
      await invalidateSubscriptionQueries(client, id);
    },
  });
}

export const useBillingPortal = () => useMutation({ mutationFn: subscriptionsApi.billingPortal });

export function usePrayerThreads(params: { page?: number; limit?: number; type?: 'all' | 'prayer' | 'praise' }, enabled = true) {
  return useQuery({ queryKey: queryKeys.prayerWall.list(params), queryFn: () => prayerWallApi.list(params), enabled, placeholderData: previous => previous });
}

export function usePrayerComments(id: string, params: { page?: number; limit?: number } = {}, enabled = true) {
  return useQuery({ queryKey: queryKeys.prayerWall.comments(id, params), queryFn: () => prayerWallApi.comments(id, params), enabled: enabled && !!id });
}

export function usePrayerThread(id: string, params: { page?: number; limit?: number } = {}, enabled = true) {
  return useQuery({ queryKey: queryKeys.prayerWall.detail(id, params), queryFn: () => prayerWallApi.get(id, params), enabled: enabled && !!id });
}

export function useManagedPrayerThreads(params: ModerationListParams = {}, enabled = true) {
  return useQuery({ queryKey: queryKeys.prayerWall.manageThreads(params), queryFn: () => prayerWallApi.manageThreads(params), enabled, placeholderData: previous => previous });
}

export function useManagedPrayerComments(params: ModerationListParams = {}, enabled = true) {
  return useQuery({ queryKey: queryKeys.prayerWall.manageComments(params), queryFn: () => prayerWallApi.manageComments(params), enabled, placeholderData: previous => previous });
}

export const useManagedPrayerThread = (id: string, enabled = true) => useQuery({ queryKey: queryKeys.prayerWall.managedThread(id), queryFn: () => prayerWallApi.manageThread(id), enabled: enabled && !!id });
export const useManagedPrayerComment = (id: string, enabled = true) => useQuery({ queryKey: queryKeys.prayerWall.managedComment(id), queryFn: () => prayerWallApi.manageComment(id), enabled: enabled && !!id });

function usePrayerMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.prayerWall.all }) });
}

export const useCreatePrayerThread = () => usePrayerMutation(prayerWallApi.create);
export const useDeletePrayerThread = () => usePrayerMutation(prayerWallApi.delete);
export const useCreatePrayerComment = () => usePrayerMutation(({ id, input }: { id: string; input: Parameters<typeof prayerWallApi.createComment>[1] }) => prayerWallApi.createComment(id, input));
export const useDeletePrayerComment = () => usePrayerMutation(({ threadId, commentId }: { threadId: string; commentId: string }) => prayerWallApi.deleteComment(threadId, commentId));
export const usePrayerReaction = () => usePrayerMutation(({ id, type, active }: { id: string; type: 'like' | 'join_prayer'; active: boolean }) => active ? prayerWallApi.removeReaction(id, type) : prayerWallApi.addReaction(id, type));
export const useModerateDeleteThread = () => usePrayerMutation(({ id, reason }: { id: string; reason: string }) => prayerWallApi.moderateDeleteThread(id, reason));
export const useRestorePrayerThread = () => usePrayerMutation(prayerWallApi.restoreThread);
export const useModerateDeleteComment = () => usePrayerMutation(({ id, reason }: { id: string; reason: string }) => prayerWallApi.moderateDeleteComment(id, reason));
export const useRestorePrayerComment = () => usePrayerMutation(prayerWallApi.restoreComment);

export function useNotifications(params: { page?: number; limit?: number; status?: 'all' | 'unread' | 'read' } = {}, enabled = true) {
  return useQuery({ queryKey: queryKeys.notifications.feed(params), queryFn: () => notificationsApi.list(params), enabled });
}

export function useMarkNotificationRead() {
  const client = useQueryClient();
  return useMutation({ mutationFn: notificationsApi.markRead, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications.all }) });
}

export function useMarkAllNotificationsRead() {
  const client = useQueryClient();
  return useMutation({ mutationFn: notificationsApi.markAllRead, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications.all }) });
}

export function useManagedNotifications(params: ManagedNotificationListParams = {}, enabled = true) {
  return useQuery({ queryKey: queryKeys.notifications.manage(params), queryFn: () => notificationsApi.manage(params), enabled, placeholderData: previous => previous });
}

export const useManagedNotification = (id: string, enabled = true) => useQuery({ queryKey: queryKeys.notifications.managedDetail(id), queryFn: () => notificationsApi.getManaged(id), enabled: enabled && !!id });

export function useCreateAdminNotification() {
  const client = useQueryClient();
  return useMutation({ mutationFn: notificationsApi.create, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications.all }) });
}

export function useUsers(params: UserListParams = {}, enabled = true) {
  return useQuery({ queryKey: queryKeys.admin.users(params), queryFn: () => usersApi.list(params), enabled, placeholderData: previous => previous });
}

export const useUser = (id: string, enabled = true) => useQuery({ queryKey: queryKeys.admin.user(id), queryFn: () => usersApi.get(id), enabled: enabled && !!id });
export const useUserCommitments = (id: string, params: ListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.admin.userCommitments(id, params), queryFn: () => usersApi.commitments(id, params), enabled: enabled && !!id, placeholderData: previous => previous });
export const useUserPayments = (id: string, params: ListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.admin.userPayments(id, params), queryFn: () => usersApi.payments(id, params), enabled: enabled && !!id, placeholderData: previous => previous });
export const useUserCheckoutSessions = (id: string, params: ListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.checkoutSessions.user(id, params), queryFn: () => checkoutSessionsApi.forUser(id, params), enabled: enabled && !!id, placeholderData: previous => previous });
function useCheckoutSessionMutation(fn: (id: string) => Promise<unknown>) { const client = useQueryClient(); return useMutation({ mutationFn: fn, onSuccess: async () => { await client.invalidateQueries({ queryKey: queryKeys.checkoutSessions.all }); } }); }
export const useDeleteCheckoutSession = () => useCheckoutSessionMutation(checkoutSessionsApi.delete);
export const useExpireCheckoutSession = () => useCheckoutSessionMutation(checkoutSessionsApi.expire);
export const useUserPrayerActivity = (id: string, params: ListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.admin.userPrayerActivity(id, params), queryFn: () => usersApi.prayerActivity(id, params), enabled: enabled && !!id, placeholderData: previous => previous });

function useAdminUsersMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.admin.all }) });
}

export const useCreateUser = () => useAdminUsersMutation(usersApi.create);
export const useUpdateUser = () => useAdminUsersMutation(({ id, input }: { id: string; input: Parameters<typeof usersApi.update>[1] }) => usersApi.update(id, input));
export const useDeleteUser = () => useAdminUsersMutation(usersApi.delete);
export const useResendUserInvitation = () => useAdminUsersMutation(({ id, expiresInHours }: { id: string; expiresInHours?: number }) => usersApi.resendInvitation(id, expiresInHours));

export function useUserBadges(id: string, enabled = true) {
  return useQuery({ queryKey: queryKeys.badges.user(id), queryFn: () => usersApi.badges(id), enabled: enabled && !!id });
}

export function useInvitations(params: InvitationListParams = {}, enabled = true) {
  return useQuery({ queryKey: queryKeys.admin.invitations(params), queryFn: () => invitationsApi.list(params), enabled, placeholderData: previous => previous });
}

function useInvitationsMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'invitations'] }) });
}

export const useCreateInvitation = () => useInvitationsMutation(invitationsApi.create);
export const useResendInvitation = () => useInvitationsMutation(({ id, expiresInHours }: { id: string; expiresInHours?: number }) => invitationsApi.resend(id, expiresInHours));
export const useRevokeInvitation = () => useInvitationsMutation(invitationsApi.revoke);

export const useReferrals = (params: ListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.referrals.list(params), queryFn: () => referralsApi.list(params), enabled, placeholderData: previous => previous });
export function useCreateReferral() { const client = useQueryClient(); return useMutation({ mutationFn: referralsApi.create, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.referrals.all }) }); }
export function useResendReferral() { const client = useQueryClient(); return useMutation({ mutationFn: referralsApi.resend, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.referrals.all }) }); }

export const useAuditLogs = (params: AuditLogListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.admin.logs(params), queryFn: () => logsApi.list(params), enabled, placeholderData: previous => previous });
export const useAnnouncements = (params: ListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.announcements.feed(params), queryFn: () => announcementsApi.list(params), enabled });
export const useManagedAnnouncements = (params: AnnouncementAdminListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.announcements.manage(params), queryFn: () => announcementsApi.manage(params), enabled, placeholderData: previous => previous });
export const useAnnouncement = (id: string, enabled = true) => useQuery({ queryKey: queryKeys.announcements.detail(id), queryFn: () => announcementsApi.get(id), enabled: enabled && !!id });

function useAnnouncementsMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.announcements.all }) });
}

export const useCreateAnnouncement = () => useAnnouncementsMutation(announcementsApi.create);
export const useUpdateAnnouncement = () => useAnnouncementsMutation(({ id, input }: { id: string; input: Parameters<typeof announcementsApi.update>[1] }) => announcementsApi.update(id, input));
export const useRestoreAnnouncement = () => useAnnouncementsMutation(announcementsApi.restore);
export const useDeleteAnnouncement = () => useAnnouncementsMutation(announcementsApi.delete);
export const useTestimonies = (params: ListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.testimonies.feed(params), queryFn: () => testimoniesApi.list(params), enabled });
export const useManagedTestimonies = (params: TestimonyAdminListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.testimonies.manage(params), queryFn: () => testimoniesApi.manage(params), enabled, placeholderData: previous => previous });
export const useTestimony = (id: string, enabled = true) => useQuery({ queryKey: queryKeys.testimonies.detail(id), queryFn: () => testimoniesApi.get(id), enabled: enabled && !!id });

function useTestimoniesMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.testimonies.all }) });
}

export const useCreateTestimony = () => useTestimoniesMutation(testimoniesApi.create);
export const useUpdateTestimony = () => useTestimoniesMutation(({ id, input }: { id: string; input: Parameters<typeof testimoniesApi.update>[1] }) => testimoniesApi.update(id, input));
export const useDeleteTestimony = () => useTestimoniesMutation(testimoniesApi.delete);
export const useBadgeDefinitions = (params: BadgeListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.badges.list(params), queryFn: () => badgesApi.list(params), enabled, placeholderData: previous => previous });
export const useBadgeDefinition = (id: string, enabled = true) => useQuery({ queryKey: queryKeys.badges.detail(id), queryFn: () => badgesApi.get(id), enabled: enabled && !!id });

function useBadgesMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.badges.all }) });
}

export const useCreateBadge = () => useBadgesMutation(badgesApi.create);
export const useUpdateBadge = () => useBadgesMutation(({ id, input }: { id: string; input: Parameters<typeof badgesApi.update>[1] }) => badgesApi.update(id, input));
export const useRetireBadge = () => useBadgesMutation(badgesApi.retire);
export const useDeleteBadge = () => useBadgesMutation(badgesApi.delete);

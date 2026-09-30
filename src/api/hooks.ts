import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import {
  announcementsApi, authApi, fieldUpdatesApi, guestCheckoutsApi, ministryTracksApi,
  notificationsApi, paymentsApi, prayerWallApi, publicApi, referralsApi, subscriptionsApi, testimoniesApi, userBadgesApi,
} from './domains';
import { queryKeys } from './queryKeys';
import type { components } from './generated';

type ListParams = Record<string, string | number | boolean | undefined>;
type PageParams = { page?: number; limit?: number };
type SubscriptionStatus = components['schemas']['SubscriptionStatus'];
type CommitmentPage = components['schemas']['CommitmentPage'];
export type TrackListParams = PageParams;
export type FieldUpdateListParams = PageParams;

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
export const usePublicTracks = (params: PageParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.public.tracks(params), queryFn: () => publicApi.tracks(params), enabled, placeholderData: previous => previous });
export const usePublicAnnouncements = (params: PageParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.public.announcements(params), queryFn: () => publicApi.announcements(params), enabled });
export const usePublicTestimonies = (params: PageParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.public.testimonies(params), queryFn: () => publicApi.testimonies(params), enabled });
export const useFieldUpdates = (params: FieldUpdateListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.fieldUpdates.userList(params), queryFn: () => fieldUpdatesApi.list({ ...params, status: 'published' }), enabled, placeholderData: previous => previous });
export const useFieldUpdate = (id: string, enabled = true) => useQuery({ queryKey: queryKeys.fieldUpdates.detail(id), queryFn: () => fieldUpdatesApi.get(id), enabled: enabled && !!id });

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
export const useGuestPayment = (id: string, token: string, enabled = true) => useQuery({
  queryKey: queryKeys.payments.detail(`guest:${id}`),
  queryFn: () => guestCheckoutsApi.payment(id, token),
  enabled: enabled && !!id && !!token,
  // Stripe may complete the payment before its hosted receipt is attached to
  // the sanitized projection. Keep reconciling until both are available.
  refetchInterval: query => query.state.data?.status === 'pending' || !query.state.data?.receipt?.available || !query.state.data?.receipt?.url ? 4000 : false,
});
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

function usePrayerMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.prayerWall.all }) });
}

export const useCreatePrayerThread = () => usePrayerMutation(prayerWallApi.create);
export const useDeletePrayerThread = () => usePrayerMutation(prayerWallApi.delete);
export const useCreatePrayerComment = () => usePrayerMutation(({ id, input }: { id: string; input: Parameters<typeof prayerWallApi.createComment>[1] }) => prayerWallApi.createComment(id, input));
export const useDeletePrayerComment = () => usePrayerMutation(({ threadId, commentId }: { threadId: string; commentId: string }) => prayerWallApi.deleteComment(threadId, commentId));
export const usePrayerReaction = () => usePrayerMutation(({ id, type, active }: { id: string; type: 'like' | 'join_prayer'; active: boolean }) => active ? prayerWallApi.removeReaction(id, type) : prayerWallApi.addReaction(id, type));

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

export function useUserBadges(id: string, enabled = true) {
  return useQuery({ queryKey: queryKeys.badges.user(id), queryFn: () => userBadgesApi.list(id), enabled: enabled && !!id });
}

export const useReferrals = (params: ListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.referrals.list(params), queryFn: () => referralsApi.list(params), enabled, placeholderData: previous => previous });
export function useCreateReferral() { const client = useQueryClient(); return useMutation({ mutationFn: referralsApi.create, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.referrals.all }) }); }
export function useResendReferral() { const client = useQueryClient(); return useMutation({ mutationFn: referralsApi.resend, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.referrals.all }) }); }

export const useAnnouncements = (params: ListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.announcements.feed(params), queryFn: () => announcementsApi.list(params), enabled });
export const useTestimonies = (params: ListParams = {}, enabled = true) => useQuery({ queryKey: queryKeys.testimonies.feed(params), queryFn: () => testimoniesApi.list(params), enabled });

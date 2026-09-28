import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { components } from './generated';
import { subscriptionCommitmentToSubscription } from './adapters';
import { invalidateSubscriptionQueries, updateSubscriptionInLists } from './hooks';
import { queryKeys } from './queryKeys';

type SubscriptionStatus = components['schemas']['SubscriptionStatus'];
type SubscriptionCommitment = components['schemas']['SubscriptionCommitment'];

function status(overrides: Partial<SubscriptionStatus> = {}): SubscriptionStatus {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    ministryTrackId: '00000000-0000-4000-8000-000000000002',
    amount: 30,
    currency: 'usd',
    interval: 'month',
    subscriptionStatus: 'active',
    accessStatus: 'active',
    cancellation: { status: 'none' },
    billingReviewStatus: 'none',
    ...overrides,
  };
}

function commitment(subscription: SubscriptionStatus | null, overrides: Partial<SubscriptionCommitment> = {}): SubscriptionCommitment {
  return {
    id: '00000000-0000-4000-8000-000000000003',
    type: 'recurring',
    amount: 30,
    amountMinor: 3000,
    currency: 'usd',
    interval: 'month',
    status: 'active',
    paymentStatus: 'completed',
    ministryTrack: {
      id: '00000000-0000-4000-8000-000000000002',
      name: 'Track',
      description: 'Description',
      coverUrl: null,
      isActive: true,
    },
    subscription,
    completedAt: null,
    cancelledAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: null,
    ...overrides,
  };
}

describe('subscription normalization', () => {
  it('normalizes API-authoritative active and trialing recurring subscriptions', () => {
    expect(subscriptionCommitmentToSubscription(commitment(status({ currentPeriodEnd: '2026-02-01T00:00:00.000Z' })))).toEqual({
      subscription_id: '00000000-0000-4000-8000-000000000001',
      track_id: '00000000-0000-4000-8000-000000000002',
      amount: 30,
      frequency: 'monthly',
      status: 'active',
      current_period_end: '2026-02-01T00:00:00.000Z',
    });
    expect(subscriptionCommitmentToSubscription(commitment(status({ subscriptionStatus: 'trialing', interval: 'year', amount: 360 }))))?.toMatchObject({
      amount: 360,
      frequency: 'annual',
      status: 'trialing',
    });
  });

  it('keeps cancelled subscriptions available for their end date', () => {
    expect(subscriptionCommitmentToSubscription(commitment(status({
      subscriptionStatus: 'canceled',
      accessStatus: 'cancelled',
      currentPeriodEnd: '2026-03-01T00:00:00.000Z',
    })))).toMatchObject({
      status: 'canceled',
      current_period_end: '2026-03-01T00:00:00.000Z',
    });
  });

  it('does not infer activity from commitment or payment history', () => {
    expect(subscriptionCommitmentToSubscription(commitment(status({ subscriptionStatus: 'past_due' })))).toBeNull();
    expect(subscriptionCommitmentToSubscription(commitment(null))).toBeNull();
    expect(subscriptionCommitmentToSubscription(commitment(status(), { type: 'one-time' }))).toBeNull();
  });
});

describe('subscription cache refresh', () => {
  it('reconciles authoritative mutation responses and invalidates list and detail queries', async () => {
    const client = new QueryClient();
    const listKey = queryKeys.subscriptions.list({ type: 'recurring' });
    const original = status();
    const updated = status({ amount: 60, interval: 'year' });
    client.setQueryData(listKey, {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
      commitments: [commitment(original)],
    });

    updateSubscriptionInLists(client, updated);
    expect(client.getQueryData<components['schemas']['CommitmentPage']>(listKey)?.commitments[0].subscription).toEqual(updated);

    const invalidate = vi.spyOn(client, 'invalidateQueries');
    await invalidateSubscriptionQueries(client, updated.id);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.subscriptions.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.subscriptions.detail(updated.id) });
  });
});

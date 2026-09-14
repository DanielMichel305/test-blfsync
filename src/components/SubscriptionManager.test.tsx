// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../LanguageContext';
import type { Subscription, Track } from '../types';
import { minimumSubscriptionAmount, SubscriptionManager, validateSubscriptionAmount } from './SubscriptionManager';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const roots: Root[] = [];

const track: Track = {
  track_id: '00000000-0000-4000-8000-000000000002',
  name: 'Radio',
  target_unit_label: 'listeners',
  annual_target: 1000,
  min_monthly_gift: 20,
  cost_per_unit: 2,
  current_raised: 100,
  description: 'Radio ministry',
  icon: 'Radio',
  letter: 'A',
  target_period: 'Annually',
  is_active: true,
};

const subscription: Subscription = {
  subscription_id: '00000000-0000-4000-8000-000000000001',
  track_id: track.track_id,
  amount: 30,
  frequency: 'monthly',
  status: 'active',
};

function publicSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: subscription.subscription_id,
    ministryTrackId: track.track_id,
    amount: 30,
    currency: 'usd',
    interval: 'month' as const,
    subscriptionStatus: 'active' as const,
    accessStatus: 'active' as const,
    cancellation: { status: 'none' as const },
    billingReviewStatus: 'none' as const,
    ...overrides,
  };
}

async function renderManager(props: Partial<React.ComponentProps<typeof SubscriptionManager>> = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  await act(async () => {
    root.render(<QueryClientProvider client={client}><LanguageProvider><SubscriptionManager subscription={subscription} track={track} {...props} /></LanguageProvider></QueryClientProvider>);
  });
  return container;
}

function button(container: HTMLElement, label: string) {
  const match = [...container.querySelectorAll('button')].find(element => element.textContent?.includes(label));
  if (!match) throw new Error(`Button not found: ${label}`);
  return match;
}

async function click(element: Element) {
  await act(async () => { element.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
}

function setControlValue(element: HTMLInputElement | HTMLSelectElement, value: string) {
  const prototype = element instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLSelectElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value);
  element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
}

afterEach(async () => {
  while (roots.length) {
    const root = roots.pop();
    if (root) await act(async () => root.unmount());
  }
  document.body.innerHTML = '';
});

describe('subscription validation', () => {
  it('applies monthly and twelve-times-monthly annual minimums', () => {
    const t = (english: string) => english;
    expect(minimumSubscriptionAmount(track, 'monthly')).toBe(20);
    expect(minimumSubscriptionAmount(track, 'annual')).toBe(240);
    expect(validateSubscriptionAmount('19', 'monthly', track, t)).toContain('$20');
    expect(validateSubscriptionAmount('239', 'annual', track, t)).toContain('$240');
    expect(validateSubscriptionAmount('240', 'annual', track, t)).toBeNull();
    expect(validateSubscriptionAmount('20.5', 'monthly', track, t)).toContain('whole-dollar');
  });
});

describe('subscription management controls', () => {
  it('submits edited amount and interval with a fresh UUID', async () => {
    const updateSubscription = vi.fn().mockResolvedValue({ status: 'updated', subscription: publicSubscription({ amount: 240, interval: 'year' }) });
    const container = await renderManager({ updateSubscription });
    await click(button(container, 'Modify subscription'));
    const amount = container.querySelector('input[type="number"]') as HTMLInputElement;
    const interval = container.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      setControlValue(amount, '240');
      setControlValue(interval, 'annual');
    });
    await click(button(container, 'Save changes'));

    expect(updateSubscription).toHaveBeenCalledTimes(1);
    expect(updateSubscription).toHaveBeenCalledWith(subscription.subscription_id, {
      subscriptionAmount: 240,
      interval: 'year',
      idempotencyKey: expect.stringMatching(/^[0-9a-f-]{36}$/i),
    });
    expect(container.textContent).toContain('recurring support was updated');
  });

  it('shows validation once and does not submit an invalid annual amount', async () => {
    const updateSubscription = vi.fn();
    const container = await renderManager({ updateSubscription });
    await click(button(container, 'Modify subscription'));
    await act(async () => setControlValue(container.querySelector('select') as HTMLSelectElement, 'annual'));
    await click(button(container, 'Save changes'));

    expect(updateSubscription).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('$240');
    expect(container.querySelectorAll('[role="alert"]')).toHaveLength(1);
  });

  it('shows mutation feedback and opens the returned billing portal when action is required', async () => {
    let resolveUpdate: ((value: { status: 'requires_action'; subscriptionId: string; portalUrl: string }) => void) | undefined;
    const updateSubscription = vi.fn(() => new Promise<{ status: 'requires_action'; subscriptionId: string; portalUrl: string }>(resolve => { resolveUpdate = resolve; }));
    const openBillingPortal = vi.fn();
    const container = await renderManager({ updateSubscription, openBillingPortal });
    await click(button(container, 'Modify subscription'));
    await click(button(container, 'Save changes'));

    expect(container.textContent).toContain('Updating recurring support');
    expect((button(container, 'Updating') as HTMLButtonElement).disabled).toBe(true);

    await act(async () => resolveUpdate?.({ status: 'requires_action', subscriptionId: subscription.subscription_id, portalUrl: 'https://billing.example.org/session' }));
    expect(openBillingPortal).toHaveBeenCalledWith('https://billing.example.org/session');
    expect(container.textContent).toContain('Opening the billing portal');
  });

  it('requires explicit confirmation before cancellation and exposes cancellation progress', async () => {
    let resolveCancellation: ((value: { status: 'cancelled'; subscription: ReturnType<typeof publicSubscription> }) => void) | undefined;
    const cancelSubscription = vi.fn(() => new Promise<{ status: 'cancelled'; subscription: ReturnType<typeof publicSubscription> }>(resolve => { resolveCancellation = resolve; }));
    const container = await renderManager({ cancelSubscription });
    await click(button(container, 'Modify subscription'));
    await click(button(container, 'Cancel support'));
    expect(cancelSubscription).not.toHaveBeenCalled();
    expect(container.querySelector('[role="group"]')).not.toBeNull();

    await click(button(container, 'Yes, cancel support'));
    expect(cancelSubscription).toHaveBeenCalledWith(subscription.subscription_id);
    expect(container.textContent).toContain('Cancelling recurring support');
    await act(async () => resolveCancellation?.({ status: 'cancelled', subscription: publicSubscription({ subscriptionStatus: 'canceled', accessStatus: 'cancelled', cancellation: { status: 'cancelled' } }) }));
    expect(container.textContent).toContain('Recurring support was cancelled');
  });
});

// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../LanguageContext';
import type { Donor, Subscription, Track } from '../types';
import Dashboard, { getAccessibleDashboardSubTab } from './Dashboard';
import Header from './Header';

vi.mock('./LandingPage', () => ({ default: () => <div data-testid="overview-panel">Overview panel</div> }));

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

function donor(api_role: Donor['api_role']): Donor {
  return {
    donor_id: `00000000-0000-4000-8000-00000000000${api_role === 'friend' ? 3 : api_role === 'family' ? 4 : 5}`,
    name: `${api_role} User`,
    email: `${api_role}@example.org`,
    join_date: '2026-01-01T00:00:00.000Z',
    role: api_role === 'admin' ? 'admin' : 'donor',
    api_role,
  };
}

const activeSubscription: Subscription = {
  subscription_id: '00000000-0000-4000-8000-000000000001',
  track_id: track.track_id,
  amount: 30,
  frequency: 'monthly',
  status: 'active',
  current_period_end: '2026-01-15T00:00:00.000Z',
};

const cancelledSubscription: Subscription = {
  ...activeSubscription,
  subscription_id: '00000000-0000-4000-8000-000000000006',
  status: 'canceled',
  current_period_end: '2026-02-15T00:00:00.000Z',
};

function providers(children: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={client}><LanguageProvider>{children}</LanguageProvider></QueryClientProvider>;
}

function dashboard(user: Donor, subscriptions: Subscription[], activeSubTab: React.ComponentProps<typeof Dashboard>['activeSubTab'] = 'dashboard', setActiveSubTab = vi.fn()) {
  return <Dashboard
    currentUser={user}
    onDonateClick={vi.fn()}
    tracks={[track]}
    subscriptions={subscriptions}
    transactions={[]}
    badges={[]}
    onUserChange={vi.fn()}
    activeSubTab={activeSubTab}
    setActiveSubTab={setActiveSubTab}
    updates={[]}
    leaderboard={[]}
    onOpenAuth={vi.fn()}
  />;
}

async function render(element: React.ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => { root.render(providers(element)); });
  return container;
}

function mobileMenuButton(container: HTMLElement) {
  const match = [...container.querySelectorAll('button')].find(element => element.className.includes('md:hidden'));
  if (!match) throw new Error('Mobile menu button not found');
  return match;
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    notifications: [],
    unreadCount: 0,
    fieldUpdates: [],
    referrals: [],
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })));
});

afterEach(async () => {
  while (roots.length) {
    const root = roots.pop();
    if (root) await act(async () => root.unmount());
  }
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('ministry-track support cards', () => {
  it('shows an empty subscription state instead of unsubscribed ministry tracks', () => {
    const unsubscribed = renderToStaticMarkup(providers(dashboard(donor('family'), [])));
    expect(unsubscribed).toContain('Your subscriptions');
    expect(unsubscribed).toContain('You do not have any active recurring subscriptions');
    expect(unsubscribed).not.toContain('Support this track');
    expect(unsubscribed).not.toContain('Modify subscription');
  });

  it('shows only active subscriptions with a control that opens the modification form', () => {
    const active = renderToStaticMarkup(providers(dashboard(donor('family'), [activeSubscription])));
    expect(active).not.toContain('Support this track');
    expect(active).toContain('Current support');
    expect(active).toContain('$30');
    expect(active).toContain('Renews at');
    expect(active).toContain('Jan 15, 2026');
    expect(active).toContain('Modify subscription');
  });

  it('shows the end date and no management controls for cancelled subscriptions', () => {
    const cancelled = renderToStaticMarkup(providers(dashboard(donor('family'), [cancelledSubscription])));
    expect(cancelled).toContain('Ends at');
    expect(cancelled).toContain('Feb 15, 2026');
    expect(cancelled).toContain('Cancelled');
    expect(cancelled).not.toContain('Modify subscription');
  });

  it('omits subscription dates when the API returns a null date', () => {
    const withoutDate = renderToStaticMarkup(providers(dashboard(donor('family'), [{ ...activeSubscription, current_period_end: null }])));
    expect(withoutDate).not.toContain('Renews at');
    expect(withoutDate).not.toContain('Ends at');
  });
});

describe('role-based referral navigation and protection', () => {
  it.each(['family', 'admin'] as const)('shows desktop and mobile-header referral navigation for %s', async apiRole => {
    const container = await render(<Header
      currentUser={donor(apiRole)}
      onUserChange={vi.fn()}
      onOpenAuth={vi.fn()}
      activeTab="dashboard"
      setActiveTab={vi.fn()}
      dashboardSubTab="overview"
      setDashboardSubTab={vi.fn()}
      theme="light"
      onToggleTheme={vi.fn()}
    />);
    expect(mobileMenuButton(container).className.split(/\s+/)).not.toContain('hidden');
    expect(container.textContent?.match(/Refer Friends/g)).toHaveLength(1);
    await act(async () => { mobileMenuButton(container).dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    expect(container.textContent?.match(/Refer Friends/g)).toHaveLength(2);
  });

  it('hides desktop and mobile-header referral navigation for Friends', async () => {
    const container = await render(<Header
      currentUser={donor('friend')}
      onUserChange={vi.fn()}
      onOpenAuth={vi.fn()}
      activeTab="dashboard"
      setActiveTab={vi.fn()}
      dashboardSubTab="overview"
      setDashboardSubTab={vi.fn()}
      theme="light"
      onToggleTheme={vi.fn()}
    />);
    expect(mobileMenuButton(container).className.split(/\s+/)).not.toContain('hidden');
    expect(container.textContent).not.toContain('Refer Friends');
    await act(async () => { mobileMenuButton(container).dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    expect(container.textContent).not.toContain('Refer Friends');
  });

  it('redirects stale Friend referral state before mounting the panel while allowing Family and admin', async () => {
    const setActiveSubTab = vi.fn();
    const container = await render(dashboard(donor('friend'), [], 'referrals', setActiveSubTab));
    expect(setActiveSubTab).toHaveBeenCalledWith('overview');
    expect(container.querySelector('input[placeholder="First name"]')).toBeNull();
    expect(getAccessibleDashboardSubTab('referrals', donor('friend'))).toBe('overview');
    expect(getAccessibleDashboardSubTab('referrals', donor('family'))).toBe('referrals');
    expect(getAccessibleDashboardSubTab('referrals', donor('admin'))).toBe('referrals');
  });
});

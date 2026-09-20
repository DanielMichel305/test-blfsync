// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const badgeMocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  retire: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('../../api/hooks', () => ({
  useBadgeDefinitions: () => ({
    data: {
      badges: [{
        id: 'draft-id', code: 'draft_badge', name: 'Draft Badge', description: 'Draft description', order: 0,
        triggerKey: 'action.login', requirementConfig: { mode: 'rolling_window', count: 2, windowDays: 7 },
        isActive: false, definitionLockedAt: null, createdAt: '', updatedAt: '',
      }],
      total: 1, page: 1, limit: 20, totalPages: 1,
    },
    isLoading: false,
    error: null,
  }),
  useCreateBadge: () => ({ mutateAsync: badgeMocks.create, isPending: false }),
  useUpdateBadge: () => ({ mutateAsync: badgeMocks.update, isPending: false }),
  useRetireBadge: () => ({ mutateAsync: badgeMocks.retire, isPending: false }),
  useDeleteBadge: () => ({ mutateAsync: badgeMocks.remove, isPending: false }),
  useMinistryTracks: () => ({ data: { ministryTracks: [], total: 0 }, isLoading: false, error: null }),
  useTrack: () => ({ data: undefined, isLoading: false, error: null }),
}));

import { AdminBadges, badgeLifecycle } from './AdminOperations';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.clearAllMocks();
  window.history.replaceState({}, '', '/');
});

describe('AdminBadges activation', () => {
  it('classifies lifecycle from active and lock data', () => {
    const badge = {
      id: 'id', code: 'code', name: 'Name', description: 'Description', order: 0,
      triggerKey: 'action.login' as const, requirementConfig: {}, createdAt: '', updatedAt: '',
    };
    expect(badgeLifecycle({ ...badge, isActive: false, definitionLockedAt: null })).toBe('Draft');
    expect(badgeLifecycle({ ...badge, isActive: true, definitionLockedAt: 'locked' })).toBe('Active');
    expect(badgeLifecycle({ ...badge, isActive: false, definitionLockedAt: 'locked' })).toBe('Retired');
  });

  it('sends code, trigger, and strict configuration together when editing a draft rule', async () => {
    badgeMocks.update.mockResolvedValue({});
    await act(async () => root.render(<AdminBadges />));
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Edit Draft Badge"]')!.click());
    const trigger = container.querySelector<HTMLSelectElement>('#badge-trigger')!;
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set?.call(trigger, 'action.referral');
    await act(async () => trigger.dispatchEvent(new Event('change', { bubbles: true })));
    const count = container.querySelector<HTMLInputElement>('#badge-count')!;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(count, '4');
    await act(async () => count.dispatchEvent(new Event('input', { bubbles: true })));
    const windowDays = container.querySelector<HTMLInputElement>('#badge-window-days')!;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(windowDays, '30');
    await act(async () => windowDays.dispatchEvent(new Event('input', { bubbles: true })));
    await act(async () => container.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(badgeMocks.update).toHaveBeenCalledWith({
      id: 'draft-id',
      input: {
        code: 'draft_badge', name: 'Draft Badge', description: 'Draft description', order: 0,
        triggerKey: 'action.referral', requirementConfig: { mode: 'rolling_window', count: 4, windowDays: 30 },
      },
    });
  });

  it('confirms that activation locks rules and patches only active state', async () => {
    badgeMocks.update.mockResolvedValue({});
    await act(async () => root.render(<AdminBadges />));
    const activate = container.querySelector<HTMLButtonElement>('[aria-label="Activate Draft Badge"]')!;
    await act(async () => activate.click());
    const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.textContent).toContain('permanently locks its code, trigger, and rule settings');
    const confirm = Array.from(dialog.querySelectorAll('button')).find(button => button.textContent === 'Activate')!;
    await act(async () => confirm.click());
    expect(badgeMocks.update).toHaveBeenCalledOnce();
    expect(badgeMocks.update).toHaveBeenCalledWith({ id: 'draft-id', input: { isActive: true } });
  });
});

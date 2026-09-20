// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BadgeForm } from './BadgeForm';
import { badgeToForm, newBadgeForm, type BadgeFormState } from './badgeRules';

const trackMocks = vi.hoisted(() => ({
  list: vi.fn(() => ({ data: { ministryTracks: [], total: 0 }, isLoading: false, error: null })),
  detail: vi.fn(() => ({ data: undefined, isLoading: false, error: null })),
}));

vi.mock('../../api/hooks', () => ({
  useMinistryTracks: trackMocks.list,
  useTrack: trackMocks.detail,
}));

let container: HTMLDivElement;
let root: Root;

function input(id: string) {
  return container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
}

function select(id: string) {
  return container.querySelector<HTMLSelectElement>(`#${id}`)!;
}

function setText(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

function setSelect(element: HTMLSelectElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set?.call(element, value);
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

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
  trackMocks.list.mockReturnValue({ data: { ministryTracks: [], total: 0 }, isLoading: false, error: null });
  trackMocks.detail.mockReturnValue({ data: undefined, isLoading: false, error: null });
});

describe('BadgeForm', () => {
  it('saves a new badge as a trimmed inactive draft', async () => {
    const onSubmit = vi.fn();
    await act(async () => root.render(<BadgeForm initial={newBadgeForm()} locked={false} submitLabel="Save draft" busy={false} onCancel={() => undefined} onSubmit={onSubmit} />));
    await act(async () => {
      setText(input('badge-code'), ' first_gift ');
      setText(input('badge-name'), ' First Gift ');
      setText(input('badge-description'), ' Make a first donation. ');
      container.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(onSubmit).toHaveBeenCalledWith({
      code: 'first_gift', name: 'First Gift', description: 'Make a first donation.', order: 0,
      triggerKey: 'action.donation', requirementConfig: { mode: 'rolling_window', count: 1, windowDays: 1 }, isActive: false,
    });
  });

  it('edits a draft rule and removes incompatible mode fields from the payload', async () => {
    const onSubmit = vi.fn();
    const initial: BadgeFormState = {
      code: 'referrals', name: 'Referrals', description: 'Invite friends', order: '4',
      triggerKey: 'action.referral', mode: 'consecutive', count: '3', maxIntervalDays: '90',
    };
    await act(async () => root.render(<BadgeForm initial={initial} locked={false} submitLabel="Save changes" busy={false} onCancel={() => undefined} onSubmit={onSubmit} />));
    await act(async () => setSelect(select('badge-action-mode'), 'rolling_window'));
    await act(async () => {
      setText(input('badge-window-days'), '180');
      container.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.requirementConfig).toEqual({ mode: 'rolling_window', count: 3, windowDays: 180 });
    expect(payload.requirementConfig).not.toHaveProperty('maxIntervalDays');
  });

  it('renders locked code and rule controls read-only while metadata stays editable', async () => {
    const initial = badgeToForm({
      id: 'badge-id', code: 'locked_code', name: 'Locked', description: 'Locked rule', order: 1,
      triggerKey: 'action.login', requirementConfig: { mode: 'consecutive', count: 7, maxIntervalDays: 2 },
      isActive: true, definitionLockedAt: '2026-09-15T00:00:00.000Z', createdAt: '', updatedAt: '',
    });
    await act(async () => root.render(<BadgeForm initial={initial} locked submitLabel="Save changes" busy={false} onCancel={() => undefined} onSubmit={() => undefined} />));
    expect(input('badge-code').readOnly).toBe(true);
    expect(select('badge-trigger').disabled).toBe(true);
    expect(select('badge-action-mode').disabled).toBe(true);
    expect(input('badge-count').readOnly).toBe(true);
    expect(input('badge-max-interval').readOnly).toBe(true);
    expect(input('badge-name').readOnly).toBe(false);
    expect(input('badge-order').readOnly).toBe(false);
  });

  it('resolves and labels an inactive selected track outside the current picker page', async () => {
    trackMocks.list.mockReturnValue({
      data: { ministryTracks: [{ id: 'active-id', name: 'Active track', description: '', isActive: true, current_metric_level: 0, target_metric_level: 1, min_monthly_contribution: 1, cost_per_unit: 1, metricUnit: 'souls', target_period: 'Monthly', createdAt: '', updatedAt: '' }], total: 12 },
      isLoading: false,
      error: null,
    });
    trackMocks.detail.mockReturnValue({
      data: { id: 'inactive-id', name: 'Historic track', description: '', isActive: false, current_metric_level: 0, target_metric_level: 1, min_monthly_contribution: 1, cost_per_unit: 1, metricUnit: 'souls', target_period: 'Monthly', createdAt: '', updatedAt: '' },
      isLoading: false,
      error: null,
    });
    const initial: BadgeFormState = {
      code: 'duration', name: 'Duration', description: 'Stay involved', order: '1',
      triggerKey: 'ministry.track.duration', targetDays: '30', trackScope: 'specific', trackId: 'inactive-id',
    };
    await act(async () => root.render(<BadgeForm initial={initial} locked={false} submitLabel="Save changes" busy={false} onCancel={() => undefined} onSubmit={() => undefined} />));
    expect(trackMocks.list).toHaveBeenCalledWith({ page: 1, limit: 10, search: undefined, sortBy: 'Alphabetical', sortOrder: 'ASC' });
    expect(trackMocks.detail).toHaveBeenCalledWith('inactive-id', true);
    const selected = Array.from(select('badge-track-id').options).find(option => option.value === 'inactive-id');
    expect(selected?.textContent).toBe('Historic track (Inactive)');
    expect(selected?.selected).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import type { components } from '../../api/generated';
import { badgeToForm, changeActionMode, changeBadgeTrigger, serializeBadgeForm, validateBadgeForm, type BadgeFormState } from './badgeRules';

type Badge = components['schemas']['Badge'];

const common = { code: ' code ', name: ' Name ', description: ' Description ', order: '2' };

describe('badge rule validation and serialization', () => {
  it.each([
    ['login consecutive', { ...common, triggerKey: 'action.login', mode: 'consecutive', count: '3', maxIntervalDays: '2' }, { mode: 'consecutive', count: 3, maxIntervalDays: 2 }],
    ['login rolling', { ...common, triggerKey: 'action.login', mode: 'rolling_window', count: '3', windowDays: '7' }, { mode: 'rolling_window', count: 3, windowDays: 7 }],
    ['donation consecutive', { ...common, triggerKey: 'action.donation', mode: 'consecutive', count: '3', maxIntervalDays: '2' }, { mode: 'consecutive', count: 3, maxIntervalDays: 2 }],
    ['donation rolling', { ...common, triggerKey: 'action.donation', mode: 'rolling_window', count: '3', windowDays: '7' }, { mode: 'rolling_window', count: 3, windowDays: 7 }],
    ['referral consecutive', { ...common, triggerKey: 'action.referral', mode: 'consecutive', count: '3', maxIntervalDays: '2' }, { mode: 'consecutive', count: 3, maxIntervalDays: 2 }],
    ['referral rolling', { ...common, triggerKey: 'action.referral', mode: 'rolling_window', count: '3', windowDays: '7' }, { mode: 'rolling_window', count: 3, windowDays: 7 }],
  ] as const)('serializes %s using only compatible keys', (_label, form, requirementConfig) => {
    expect(serializeBadgeForm(form as BadgeFormState)).toEqual({
      code: 'code', name: 'Name', description: 'Description', order: 2, isActive: false,
      triggerKey: form.triggerKey,
      requirementConfig,
    });
  });

  it('serializes any-track and inactive specific-track duration rules', () => {
    const anyTrack: BadgeFormState = { ...common, triggerKey: 'ministry.track.duration', targetDays: '30', trackScope: 'any', trackId: 'stale-id' };
    const specific: BadgeFormState = { ...common, triggerKey: 'ministry.track.duration', targetDays: '60', trackScope: 'specific', trackId: '11111111-1111-4111-8111-111111111111' };
    expect(serializeBadgeForm(anyTrack)?.requirementConfig).toEqual({ targetDays: 30, trackId: null });
    expect(serializeBadgeForm(specific)?.requirementConfig).toEqual({ targetDays: 60, trackId: specific.trackId });
  });

  it('trims text and enforces all text, order, and positive-integer limits', () => {
    const form: BadgeFormState = {
      code: ' '.repeat(2), name: 'n'.repeat(101), description: 'd'.repeat(2001), order: '-1',
      triggerKey: 'action.login', mode: 'consecutive', count: '0', maxIntervalDays: '1.5',
    };
    expect(validateBadgeForm(form)).toEqual({
      code: 'Code must be between 1 and 100 characters.',
      name: 'Name must be between 1 and 100 characters.',
      description: 'Description must be between 1 and 2,000 characters.',
      order: 'Display order must be a non-negative whole number.',
      count: 'Count must be a positive whole number.',
      maxIntervalDays: 'Maximum interval must be a positive whole number.',
    });
    expect(serializeBadgeForm(form)).toBeNull();
  });

  it('requires target days, a selected specific track, and rolling-window days', () => {
    expect(validateBadgeForm({ ...common, triggerKey: 'ministry.track.duration', targetDays: '-2', trackScope: 'specific', trackId: '' })).toMatchObject({ targetDays: expect.any(String), trackId: expect.any(String) });
    expect(validateBadgeForm({ ...common, triggerKey: 'action.referral', mode: 'rolling_window', count: '2', windowDays: '0' })).toMatchObject({ windowDays: expect.any(String) });
  });

  it('resets incompatible values when trigger and mode change', () => {
    const rolling: BadgeFormState = {
      code: '', name: '', description: '', order: '0', triggerKey: 'action.donation',
      mode: 'rolling_window', count: '8', windowDays: '30',
    };
    const duration = changeBadgeTrigger(rolling, 'ministry.track.duration');
    expect(duration).toEqual({ ...common, code: '', name: '', description: '', order: '0', triggerKey: 'ministry.track.duration', targetDays: '1', trackScope: 'any', trackId: '' });
    expect(duration).not.toHaveProperty('count');
    const action = changeBadgeTrigger(duration, 'action.referral');
    expect(action).toMatchObject({ triggerKey: 'action.referral', mode: 'rolling_window', count: '1', windowDays: '1' });
    expect(action).not.toHaveProperty('targetDays');
    const consecutive = changeActionMode(action, 'consecutive');
    expect(consecutive).toMatchObject({ mode: 'consecutive', count: '1', maxIntervalDays: '1' });
    expect(consecutive).not.toHaveProperty('windowDays');
  });

  it('parses an existing inactive-track selection without needing picker results', () => {
    const badge = {
      id: 'badge-id', code: 'duration', name: 'Duration', description: 'Description', order: 0,
      triggerKey: 'ministry.track.duration', requirementConfig: { targetDays: 10, trackId: 'inactive-track-id' },
      isActive: false, definitionLockedAt: null, createdAt: '', updatedAt: '',
    } satisfies Badge;
    expect(badgeToForm(badge)).toMatchObject({ trackScope: 'specific', trackId: 'inactive-track-id', targetDays: '10' });
  });
});

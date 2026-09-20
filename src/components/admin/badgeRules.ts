import type { components } from '../../api/generated';

type Schemas = components['schemas'];

export type BadgeTriggerKey = Schemas['CreateBadgeRequest']['triggerKey'];
export type ActionTriggerKey = Exclude<BadgeTriggerKey, 'ministry.track.duration'>;

export type BadgeCommonFormFields = {
  code: string;
  name: string;
  description: string;
  order: string;
};

export type TrackDurationRuleForm = {
  triggerKey: 'ministry.track.duration';
  targetDays: string;
  trackScope: 'any' | 'specific';
  trackId: string;
};

export type ConsecutiveRuleForm = {
  triggerKey: ActionTriggerKey;
  mode: 'consecutive';
  count: string;
  maxIntervalDays: string;
};

export type RollingWindowRuleForm = {
  triggerKey: ActionTriggerKey;
  mode: 'rolling_window';
  count: string;
  windowDays: string;
};

export type BadgeRuleForm = TrackDurationRuleForm | ConsecutiveRuleForm | RollingWindowRuleForm;
export type BadgeFormState = BadgeCommonFormFields & BadgeRuleForm;
export type BadgeFormErrors = Partial<Record<'code' | 'name' | 'description' | 'order' | 'targetDays' | 'trackId' | 'count' | 'maxIntervalDays' | 'windowDays', string>>;

const positiveInteger = (value: string) => /^\d+$/.test(value) && Number(value) > 0;
const nonNegativeInteger = (value: string) => /^\d+$/.test(value);
const objectConfig = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const numericString = (value: unknown, fallback = '1') => typeof value === 'number' && Number.isInteger(value) ? String(value) : fallback;

export function newBadgeForm(): BadgeFormState {
  return {
    code: '',
    name: '',
    description: '',
    order: '0',
    triggerKey: 'action.donation',
    mode: 'rolling_window',
    count: '1',
    windowDays: '1',
  };
}

export function badgeToForm(badge: Schemas['Badge']): BadgeFormState {
  const common: BadgeCommonFormFields = {
    code: badge.code,
    name: badge.name,
    description: badge.description,
    order: String(badge.order),
  };
  const config = objectConfig(badge.requirementConfig);

  if (badge.triggerKey === 'ministry.track.duration') {
    const trackId = typeof config.trackId === 'string' ? config.trackId : '';
    return {
      ...common,
      triggerKey: badge.triggerKey,
      targetDays: numericString(config.targetDays),
      trackScope: trackId ? 'specific' : 'any',
      trackId,
    };
  }

  if (config.mode === 'consecutive') {
    return {
      ...common,
      triggerKey: badge.triggerKey,
      mode: 'consecutive',
      count: numericString(config.count),
      maxIntervalDays: numericString(config.maxIntervalDays),
    };
  }

  return {
    ...common,
    triggerKey: badge.triggerKey,
    mode: 'rolling_window',
    count: numericString(config.count),
    windowDays: numericString(config.windowDays),
  };
}

export function changeBadgeTrigger(form: BadgeFormState, triggerKey: BadgeTriggerKey): BadgeFormState {
  const common: BadgeCommonFormFields = {
    code: form.code,
    name: form.name,
    description: form.description,
    order: form.order,
  };
  if (triggerKey === 'ministry.track.duration') {
    return { ...common, triggerKey, targetDays: '1', trackScope: 'any', trackId: '' };
  }
  return { ...common, triggerKey, mode: 'rolling_window', count: '1', windowDays: '1' };
}

export function changeActionMode(form: BadgeFormState, mode: 'consecutive' | 'rolling_window'): BadgeFormState {
  if (form.triggerKey === 'ministry.track.duration') return form;
  const common = {
    code: form.code,
    name: form.name,
    description: form.description,
    order: form.order,
    triggerKey: form.triggerKey,
    count: form.count,
  };
  return mode === 'consecutive'
    ? { ...common, mode, maxIntervalDays: '1' }
    : { ...common, mode, windowDays: '1' };
}

export function validateBadgeForm(form: BadgeFormState): BadgeFormErrors {
  const errors: BadgeFormErrors = {};
  const code = form.code.trim();
  const name = form.name.trim();
  const description = form.description.trim();

  if (!code.length || code.length > 100) errors.code = 'Code must be between 1 and 100 characters.';
  if (!name.length || name.length > 100) errors.name = 'Name must be between 1 and 100 characters.';
  if (!description.length || description.length > 2000) errors.description = 'Description must be between 1 and 2,000 characters.';
  if (!nonNegativeInteger(form.order)) errors.order = 'Display order must be a non-negative whole number.';

  if (form.triggerKey === 'ministry.track.duration') {
    if (!positiveInteger(form.targetDays)) errors.targetDays = 'Target days must be a positive whole number.';
    if (form.trackScope === 'specific' && !form.trackId) errors.trackId = 'Select a ministry track.';
  } else {
    if (!positiveInteger(form.count)) errors.count = 'Count must be a positive whole number.';
    if (form.mode === 'consecutive' && !positiveInteger(form.maxIntervalDays)) errors.maxIntervalDays = 'Maximum interval must be a positive whole number.';
    if (form.mode === 'rolling_window' && !positiveInteger(form.windowDays)) errors.windowDays = 'Window days must be a positive whole number.';
  }

  return errors;
}

export function serializeBadgeForm(form: BadgeFormState): Schemas['CreateBadgeRequest'] | null {
  if (Object.keys(validateBadgeForm(form)).length) return null;

  const common = {
    code: form.code.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    order: Number(form.order),
    isActive: false,
  };

  if (form.triggerKey === 'ministry.track.duration') {
    return {
      ...common,
      triggerKey: form.triggerKey,
      requirementConfig: {
        targetDays: Number(form.targetDays),
        trackId: form.trackScope === 'specific' ? form.trackId : null,
      },
    };
  }

  if (form.mode === 'consecutive') {
    return {
      ...common,
      triggerKey: form.triggerKey,
      requirementConfig: {
        mode: form.mode,
        count: Number(form.count),
        maxIntervalDays: Number(form.maxIntervalDays),
      },
    };
  }

  return {
    ...common,
    triggerKey: form.triggerKey,
    requirementConfig: {
      mode: form.mode,
      count: Number(form.count),
      windowDays: Number(form.windowDays),
    },
  };
}


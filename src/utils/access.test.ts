import { describe, expect, it } from 'vitest';
import { canAccessReferrals } from './access';

describe('referral access', () => {
  it('allows only Family and admin API roles', () => {
    expect(canAccessReferrals({ api_role: 'friend' })).toBe(false);
    expect(canAccessReferrals({ api_role: 'family' })).toBe(true);
    expect(canAccessReferrals({ api_role: 'admin' })).toBe(true);
    expect(canAccessReferrals(null)).toBe(false);
  });
});

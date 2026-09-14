import type { Donor } from '../types';

export function canAccessReferrals(user: Pick<Donor, 'api_role'> | null | undefined) {
  return user?.api_role === 'family' || user?.api_role === 'admin';
}

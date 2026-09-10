import type { Track } from '../types';

export function calculateSubscriptionImpact(
  track: Track,
  amount: number,
  frequency: 'monthly' | 'annual',
) {
  const monthlyAmount = frequency === 'annual' ? amount / 12 : amount;
  const monthlyUnits = track.cost_per_unit > 0 ? monthlyAmount / track.cost_per_unit : 0;
  return { monthlyUnits, annualUnits: monthlyUnits * 12 };
}

export function calculateTrackProgress(track: Track) {
  if (track.annual_target <= 0) return 0;
  return Math.min(Math.round((track.current_raised / track.annual_target) * 100), 100);
}

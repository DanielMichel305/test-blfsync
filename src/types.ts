export interface Track {
  track_id: string;
  name: string;
  target_unit_label: string;
  annual_target: number;
  annual_budget: number;
  min_monthly_gift: number; // For Rallies, set as 600
  cost_per_unit: number;
  units_per_100_egp: number;
  current_raised: number;
  description: string;
  icon: string; // lucide icon name
  letter: string; // A, B, C, D, E, F, G
}

export interface Donor {
  donor_id: string;
  name: string;
  email: string;
  phone: string;
  join_date: string;
  communication_opt_in: boolean;
  referral_source: string;
  avatar_url?: string;
  role: 'donor' | 'admin';
  streak: number; // in months
  last_donation_date: string | null;
}

export interface Subscription {
  subscription_id: string;
  donor_id: string;
  track_id: string;
  amount: number;
  frequency: 'monthly' | 'annual';
  status: 'active' | 'cancelled';
  start_date: string;
}

export interface Transaction {
  transaction_id: string;
  subscription_id?: string;
  donor_id: string;
  donor_name: string;
  track_id: string;
  amount: number;
  date: string;
  payment_method: 'card' | 'wallet' | 'fawry' | 'stripe';
  frequency: 'monthly' | 'annual' | 'one-time';
}

export type BadgeType =
  | 'first_step'
  | 'three_month_faithful'
  | 'anniversary_friend'
  | 'gospel_multiplier'
  | 'loyal_partner'
  | 'kingdom_advocate';

export interface Badge {
  badge_id: string;
  donor_id: string;
  badge_type: BadgeType;
  name: string;
  description: string;
  earned_date: string;
}

export interface UpdateFeed {
  post_id: string;
  title: string;
  content: string;
  media_url?: string;
  publish_date: string;
  category: string;
}

export interface LeaderboardEntry {
  name: string; // First name + Last initial
  impact_units: number;
  track_id: string;
}

export interface Referral {
  referral_id: string;
  donor_id: string;
  friend_name: string;
  friend_email: string;
  friend_phone: string;
  status: 'pending' | 'joined';
  date_added: string;
}

export interface AppNotification {
  notification_id: string;
  donor_id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'milestone' | 'general';
  track_id?: string;
}

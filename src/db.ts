import { Track, Donor, AppNotification, Subscription, Transaction, Badge, BadgeType, UpdateFeed, LeaderboardEntry, Referral } from './types';

// Pre-seeded Funding Tracks with real reference data from specification
export const INITIAL_TRACKS: Track[] = [
  {
    track_id: 'general-fund',
    name: 'General Fund',
    target_unit_label: 'souls reached',
    annual_target: 1000000, // Average of other annual targets: (100k + 1M + 25k + 30k + 3M + 50k) / 6 = 700,833
    annual_budget: 5000000, // Seeking 5 Million total
    min_monthly_gift: 500,
    cost_per_unit: 3.39, // Harmonic average of other cost per units ≈ 3.39 EGP per soul
    units_per_100_egp: 29.5, // 100 / 3.39
    current_raised: 1850000, // ~37%
    description: 'Support overall ministry operations where resources are sowed dynamically across all tracks to match the greatest spiritual needs.',
    icon: 'Layers',
    letter: 'A'
  },
  {
    track_id: 'gospel-reach',
    name: 'Evangelism',
    target_unit_label: 'Gospel Recipients',
    annual_target: 100000,
    annual_budget: 3333333,
    min_monthly_gift: 800,
    cost_per_unit: 33.33,
    units_per_100_egp: 3.0,
    current_raised: 1420500, // ~42.6%
    description: 'Share the Gospel through presentations and outreach.',
    icon: 'Radio',
    letter: 'B'
  },
  {
    track_id: 'answer-search',
    name: 'Faith Questions Answered',
    target_unit_label: 'questions answered',
    annual_target: 1000000,
    annual_budget: 2000000,
    min_monthly_gift: 600,
    cost_per_unit: 2.00,
    units_per_100_egp: 50.0,
    current_raised: 980400, // ~49%
    description: 'Reach seekers exploring faith and truth.',
    icon: 'Search',
    letter: 'C'
  },
  {
    track_id: 'believer-followup',
    name: 'Discipleship Program',
    target_unit_label: 'Discipled',
    annual_target: 30000,
    annual_budget: 4500000,
    min_monthly_gift: 750,
    cost_per_unit: 150.00,
    units_per_100_egp: 0.67,
    current_raised: 1120000, // ~24.9%
    description: 'Equip new believers to grow and walk in faith.',
    icon: 'BookOpen',
    letter: 'E'
  },
  {
    track_id: 'radio-ministry',
    name: 'Radio Ministry',
    target_unit_label: 'Streams',
    annual_target: 3000000,
    annual_budget: 2500000,
    min_monthly_gift: 500,
    cost_per_unit: 0.83,
    units_per_100_egp: 120.5,
    current_raised: 1560000, // ~62.4%
    description: 'Broadcast the Gospel through radio to more communities.',
    icon: 'Tv',
    letter: 'F'
  },
  {
    track_id: 'rallies',
    name: 'Rallies: Youth, Women and Family',
    target_unit_label: 'Attendies',
    annual_target: 50000,
    annual_budget: 2000000,
    min_monthly_gift: 600, // suggested 600+
    cost_per_unit: 40.00,
    units_per_100_egp: 2.5,
    current_raised: 840000, // ~42%
    description: 'Gather and inspire families and communities.',
    icon: 'Users',
    letter: 'G'
  }
];

// Seed Data for Personas
export const SEED_DONORS: Donor[] = [
  {
    donor_id: 'donor-mariam',
    name: 'Mariam Abdelmessih',
    email: 'mariam.a@betterlifefriend.org',
    phone: '+20 100 234 5678',
    join_date: '2026-04-05',
    communication_opt_in: true,
    referral_source: 'Church Bulletin',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'donor',
    streak: 3, // 3 months faithful
    last_donation_date: '2026-07-01'
  },
  {
    donor_id: 'donor-michael',
    name: 'Michael Sawiris',
    email: 'michael.s@betterlifefriend.org',
    phone: '+20 122 987 6543',
    join_date: '2025-07-09',
    communication_opt_in: true,
    referral_source: 'Friend recommendation',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'donor',
    streak: 12, // 1 year of continuous giving
    last_donation_date: '2026-07-05'
  },
  {
    donor_id: 'donor-new',
    name: 'Samuel Fahmy',
    email: 'samuel.f@gmail.com',
    phone: '+20 115 555 4433',
    join_date: '2026-07-09',
    communication_opt_in: true,
    referral_source: 'Social Media Ad',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'donor',
    streak: 0,
    last_donation_date: null
  },
  {
    donor_id: 'admin-kamal',
    name: 'Pastor Kamal Naguib',
    email: 'kamal@betterlife.org',
    phone: '+20 100 111 2222',
    join_date: '2020-01-01',
    communication_opt_in: true,
    referral_source: 'Founder',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    streak: 0,
    last_donation_date: null
  }
];

export const SEED_SUBSCRIPTIONS: Subscription[] = [
  {
    subscription_id: 'sub-1',
    donor_id: 'donor-mariam',
    track_id: 'gospel-reach',
    amount: 500, // EGP per month
    frequency: 'monthly',
    status: 'active',
    start_date: '2026-04-05'
  },
  {
    subscription_id: 'sub-3',
    donor_id: 'donor-michael',
    track_id: 'general-fund',
    amount: 5000, // EGP per year
    frequency: 'annual',
    status: 'active',
    start_date: '2025-07-09'
  },
  {
    subscription_id: 'sub-4',
    donor_id: 'donor-michael',
    track_id: 'believer-followup',
    amount: 1000, // EGP per month
    frequency: 'monthly',
    status: 'active',
    start_date: '2026-01-15'
  }
];

export const SEED_TRANSACTIONS: Transaction[] = [
  // Mariam's transactions (monthly, for April, May, June, July)
  {
    transaction_id: 'tx-m1',
    subscription_id: 'sub-1',
    donor_id: 'donor-mariam',
    donor_name: 'Mariam Abdelmessih',
    track_id: 'gospel-reach',
    amount: 500,
    date: '2026-04-05',
    payment_method: 'card',
    frequency: 'monthly'
  },
  {
    transaction_id: 'tx-m2',
    subscription_id: 'sub-1',
    donor_id: 'donor-mariam',
    donor_name: 'Mariam Abdelmessih',
    track_id: 'gospel-reach',
    amount: 500,
    date: '2026-05-05',
    payment_method: 'card',
    frequency: 'monthly'
  },
  {
    transaction_id: 'tx-m4',
    subscription_id: 'sub-1',
    donor_id: 'donor-mariam',
    donor_name: 'Mariam Abdelmessih',
    track_id: 'gospel-reach',
    amount: 500,
    date: '2026-06-05',
    payment_method: 'card',
    frequency: 'monthly'
  },
  {
    transaction_id: 'tx-m6',
    subscription_id: 'sub-1',
    donor_id: 'donor-mariam',
    donor_name: 'Mariam Abdelmessih',
    track_id: 'gospel-reach',
    amount: 500,
    date: '2026-07-01',
    payment_method: 'card',
    frequency: 'monthly'
  },
  // Michael's transactions
  {
    transaction_id: 'tx-s1',
    subscription_id: 'sub-3',
    donor_id: 'donor-michael',
    donor_name: 'Michael Sawiris',
    track_id: 'general-fund',
    amount: 5000,
    date: '2025-07-09',
    payment_method: 'stripe',
    frequency: 'annual'
  },
  {
    transaction_id: 'tx-s2',
    subscription_id: 'sub-4',
    donor_id: 'donor-michael',
    donor_name: 'Michael Sawiris',
    track_id: 'believer-followup',
    amount: 1000,
    date: '2026-01-15',
    payment_method: 'card',
    frequency: 'monthly'
  },
  {
    transaction_id: 'tx-s3',
    subscription_id: 'sub-4',
    donor_id: 'donor-michael',
    donor_name: 'Michael Sawiris',
    track_id: 'believer-followup',
    amount: 1000,
    date: '2026-02-15',
    payment_method: 'card',
    frequency: 'monthly'
  },
  {
    transaction_id: 'tx-s4',
    subscription_id: 'sub-4',
    donor_id: 'donor-michael',
    donor_name: 'Michael Sawiris',
    track_id: 'believer-followup',
    amount: 1000,
    date: '2026-03-15',
    payment_method: 'card',
    frequency: 'monthly'
  },
  {
    transaction_id: 'tx-s5',
    subscription_id: 'sub-4',
    donor_id: 'donor-michael',
    donor_name: 'Michael Sawiris',
    track_id: 'believer-followup',
    amount: 1000,
    date: '2026-04-15',
    payment_method: 'card',
    frequency: 'monthly'
  },
  {
    transaction_id: 'tx-s6',
    subscription_id: 'sub-4',
    donor_id: 'donor-michael',
    donor_name: 'Michael Sawiris',
    track_id: 'believer-followup',
    amount: 1000,
    date: '2026-05-15',
    payment_method: 'card',
    frequency: 'monthly'
  },
  {
    transaction_id: 'tx-s7',
    subscription_id: 'sub-4',
    donor_id: 'donor-michael',
    donor_name: 'Michael Sawiris',
    track_id: 'believer-followup',
    amount: 1000,
    date: '2026-06-15',
    payment_method: 'card',
    frequency: 'monthly'
  },
  {
    transaction_id: 'tx-s8',
    subscription_id: 'sub-4',
    donor_id: 'donor-michael',
    donor_name: 'Michael Sawiris',
    track_id: 'believer-followup',
    amount: 1000,
    date: '2026-07-05',
    payment_method: 'card',
    frequency: 'monthly'
  }
];

export const SEED_BADGES: Badge[] = [
  {
    badge_id: 'b1',
    donor_id: 'donor-mariam',
    badge_type: 'first_step',
    name: 'First Step',
    description: 'Equip new believers to grow and walk in faith.',
    earned_date: '2026-04-05'
  },
  {
    badge_id: 'b2',
    donor_id: 'donor-mariam',
    badge_type: 'three_month_faithful',
    name: '3-Month Faithful',
    description: 'Completed 3 consecutive months of paying partnerships.',
    earned_date: '2026-07-01'
  },
  {
    badge_id: 'b3',
    donor_id: 'donor-michael',
    badge_type: 'first_step',
    name: 'First Step',
    description: 'Enrolled for one month or made a one-time offering.',
    earned_date: '2025-07-09'
  },
  {
    badge_id: 'b4',
    donor_id: 'donor-michael',
    badge_type: 'three_month_faithful',
    name: '3-Month Faithful',
    description: 'Completed 3 consecutive months of paying partnerships.',
    earned_date: '2025-10-09'
  },
  {
    badge_id: 'b5',
    donor_id: 'donor-michael',
    badge_type: 'gospel_multiplier',
    name: 'Gospel Multipler',
    description: 'Reached 1,000 souls through digital media outreach.',
    earned_date: '2026-01-15'
  },
  {
    badge_id: 'b6',
    donor_id: 'donor-michael',
    badge_type: 'anniversary_friend',
    name: 'Anniversary Friend',
    description: 'Completed 12 months consecutive paying partnerships.',
    earned_date: '2026-07-09'
  }
];

export const SEED_UPDATES: UpdateFeed[] = [
  {
    post_id: 'post-1',
    title: 'Youth Rally Reaches 1,500 in Minya',
    content: 'Praise God! Our team organized a spectacular youth rally in Minya last Friday. Over 1,500 students gathered, filled with songs of hope, interactive games, and a powerful message about salvation. We recorded 700 professions of faith. Thank you to our Rallies track donors who made the logistics, transport, and sound equipment possible!',
    media_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    publish_date: '2026-07-08',
    category: 'Rallies'
  },
  {
    post_id: 'post-2',
    title: 'New Apologetics Videos Complete Post-Production',
    content: 'We have finished producing 12 high-quality short films answering the most searched questions about the Bible and the existence of God. These will be published across TikTok, Facebook, and Instagram. With an estimated reach of 5 Million views, this series is entirely supported by the Faith Questions Answered track. Continue to pray that these seeds fall on fertile ground!',
    media_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    publish_date: '2026-07-04',
    category: 'Faith Questions Answered'
  },
  {
    post_id: 'post-3',
    title: 'Milestone: 15,000 active Discipleship Participants!',
    content: 'Our Follow-up team has successfully integrated 15,000 active people into our structured discipleship programs this month! Our mentors have answered 12,500 discipleship chat messages, walking hand-in-hand with new believers. Your backing of "Discipleship Program" is creating deeply rooted disciples.',
    media_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    publish_date: '2026-06-29',
    category: 'Discipleship Program'
  }
];

export const SEED_LEADERBOARDS: LeaderboardEntry[] = [
  // Evangelism
  { name: 'Michael S.', impact_units: 360, track_id: 'gospel-reach' },
  { name: 'Youssef M.', impact_units: 240, track_id: 'gospel-reach' },
  { name: 'Mariam A.', impact_units: 180, track_id: 'gospel-reach' },
  { name: 'Sarah K.', impact_units: 120, track_id: 'gospel-reach' },
  { name: 'Peter G.', impact_units: 90, track_id: 'gospel-reach' },
  
  // Faith Questions Answered
  { name: 'Sherif H.', impact_units: 15000, track_id: 'answer-search' },
  { name: 'Mariam A.', impact_units: 8000, track_id: 'answer-search' },
  { name: 'Fady T.', impact_units: 6000, track_id: 'answer-search' },

  { name: 'Michael S.', impact_units: 250, track_id: 'general-fund' },
  { name: 'Sameh W.', impact_units: 180, track_id: 'general-fund' },
  { name: 'George N.', impact_units: 110, track_id: 'general-fund' }
];

// LocalStorage Keys
const KEYS = {
  TRACKS: "blf_tracks_v4",
  DONORS: 'blf_donors',
  SUBSCRIPTIONS: 'blf_subscriptions',
  TRANSACTIONS: 'blf_transactions',
  BADGES: 'blf_badges',
  UPDATES: 'blf_updates',
  LEADERBOARD: 'blf_leaderboard',
  CURRENT_USER: 'blf_current_user',
  REFERRALS: 'blf_referrals'
};

export const SEED_REFERRALS: Referral[] = [
  {
    referral_id: 'ref-1',
    donor_id: 'donor-mariam',
    friend_name: 'Fady Shenouda',
    friend_email: 'fady.s@gmail.com',
    friend_phone: '+20 120 444 5555',
    status: 'joined',
    date_added: '2026-05-10'
  },
  {
    referral_id: 'ref-2',
    donor_id: 'donor-michael',
    friend_name: 'Youssef Mansour',
    friend_email: 'youssef.m@gmail.com',
    friend_phone: '+20 100 888 9999',
    status: 'pending',
    date_added: '2026-06-20'
  },
  {
    referral_id: 'ref-3',
    donor_id: 'donor-mariam',
    friend_name: 'Christina Ghali',
    friend_email: 'christina.g@outlook.com',
    friend_phone: '+20 111 222 3333',
    status: 'pending',
    date_added: '2026-07-02'
  }
];

// Database Initialization Helper
export function getLocalStorageData<T>(key: string, seed: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(data);
}

export function saveLocalStorageData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initial DB setup
export function initializeDB() {
  const tracks = getLocalStorageData(KEYS.TRACKS, INITIAL_TRACKS);
  
  // If stored tracks has outdated length, lacks general fund, or has av-production, migrate cleanly
  if (tracks.length !== INITIAL_TRACKS.length || tracks.some(t => t.track_id === 'av-production') || !tracks.some(t => t.track_id === 'general-fund')) {
    saveLocalStorageData(KEYS.TRACKS, INITIAL_TRACKS);
    saveLocalStorageData(KEYS.SUBSCRIPTIONS, SEED_SUBSCRIPTIONS);
    saveLocalStorageData(KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
    saveLocalStorageData(KEYS.UPDATES, SEED_UPDATES);
  } else {
    // Migrate existing track names/labels and min_monthly_gift values if they are outdated in user's localStorage
    let updatedTracks = false;
    const migratedTracks = tracks.map(t => {
      let changed = false;
      let newName = t.name;
      let newLabel = t.target_unit_label;
      let newTarget = t.annual_target;
      let newBudget = t.annual_budget;
      let newMinGift = t.min_monthly_gift;
      let newCost = t.cost_per_unit;
      let newUnitsPer100 = t.units_per_100_egp;
      
      if (t.track_id === 'general-fund') {
        if (t.target_unit_label !== 'souls reached' || t.annual_target !== 1000000) {
          newLabel = 'souls reached';
          newTarget = 1000000;
          changed = true;
        }
      } else if (t.track_id === 'gospel-reach') {
        if (t.name !== 'Evangelism' || t.target_unit_label !== 'Gospel Recipients' || t.annual_target !== 100000 || t.min_monthly_gift !== 800) {
          newName = 'Evangelism';
          newLabel = 'Gospel Recipients';
          newTarget = 100000;
          newMinGift = 800;
          changed = true;
        }
      } else if (t.track_id === 'answer-search') {
        if (t.min_monthly_gift !== 600 || t.annual_target !== 1000000 || t.target_unit_label !== 'questions answered') {
          newMinGift = 600;
          newTarget = 1000000;
          newLabel = 'questions answered';
          changed = true;
        }
      } else if (t.track_id === 'rallies') {
        if (t.name !== 'Rallies: Youth, Women and Family' || t.min_monthly_gift !== 600 || t.target_unit_label !== 'Attendies' || t.annual_target !== 50000) {
          newLabel = 'Attendies';
          newTarget = 50000;
          newName = 'Rallies: Youth, Women and Family';
          newMinGift = 600;
          changed = true;
        }
      } else if (t.track_id === 'believer-followup') {
        if (t.name !== 'Discipleship Program' || t.cost_per_unit !== 150.00 || t.annual_target !== 30000 || t.min_monthly_gift !== 750) {
          newName = 'Discipleship Program';
          newLabel = 'Discipled';
          newTarget = 30000;
          newBudget = 4500000;
          newMinGift = 750;
          newCost = 150.00;
          newUnitsPer100 = 0.67;
          changed = true;
        }
      } else if (t.track_id === 'radio-ministry') {
        if (t.min_monthly_gift !== 500 || t.annual_target !== 3000000 || t.target_unit_label !== 'Streams') {
          newMinGift = 500;
          newTarget = 3000000;
          newLabel = 'Streams';
          changed = true;
        }
      } else if (t.track_id === 'rallies') {
        if (t.annual_target !== 50000 || t.target_unit_label !== 'Attendies') {
          newTarget = 50000;
          newLabel = 'Attendies';
          changed = true;
        }
      } else if (t.track_id === 'rallies') {
        if (t.annual_target !== 50000 || t.target_unit_label !== 'Attendies') {
          newTarget = 50000;
          newLabel = 'Attendies';
          changed = true;
        }
      }
      
      if (changed) {
        updatedTracks = true;
        return {
          ...t,
          name: newName,
          target_unit_label: newLabel,
          annual_target: newTarget,
          annual_budget: newBudget,
          min_monthly_gift: newMinGift,
          cost_per_unit: newCost,
          units_per_100_egp: newUnitsPer100
        };
      }
      return t;
    });
    
    if (updatedTracks) {
      saveLocalStorageData(KEYS.TRACKS, migratedTracks);
    }
  }

  getLocalStorageData(KEYS.DONORS, SEED_DONORS);
  getLocalStorageData(KEYS.SUBSCRIPTIONS, SEED_SUBSCRIPTIONS);
  getLocalStorageData(KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
  getLocalStorageData(KEYS.BADGES, SEED_BADGES);
  
  const storedUpdates = getLocalStorageData(KEYS.UPDATES, SEED_UPDATES);
  const migratedUpdates = storedUpdates.map(u => {
    const match = SEED_UPDATES.find(s => s.post_id === u.post_id);
    if (match) {
      if (u.media_url !== match.media_url || u.category !== match.category || u.title !== match.title) {
        return { ...u, media_url: match.media_url, category: match.category, title: match.title, content: match.content };
      }
    }
    return u;
  });
  saveLocalStorageData(KEYS.UPDATES, migratedUpdates);

  getLocalStorageData(KEYS.LEADERBOARD, SEED_LEADERBOARDS);
  getLocalStorageData(KEYS.REFERRALS, SEED_REFERRALS);
  
  // Do not pre-seed a current user anymore. Let the app start at the login/signup page organically!
}

// Retrieve DB Data
export const db = {
  getTracks: (): Track[] => getLocalStorageData(KEYS.TRACKS, INITIAL_TRACKS),
  saveTracks: (tracks: Track[]) => saveLocalStorageData(KEYS.TRACKS, tracks),

  getDonors: (): Donor[] => getLocalStorageData(KEYS.DONORS, SEED_DONORS),
  saveDonors: (donors: Donor[]) => saveLocalStorageData(KEYS.DONORS, donors),

  getSubscriptions: (): Subscription[] => getLocalStorageData(KEYS.SUBSCRIPTIONS, SEED_SUBSCRIPTIONS),
  saveSubscriptions: (subs: Subscription[]) => saveLocalStorageData(KEYS.SUBSCRIPTIONS, subs),

  getTransactions: (): Transaction[] => getLocalStorageData(KEYS.TRANSACTIONS, SEED_TRANSACTIONS),
  saveTransactions: (txs: Transaction[]) => saveLocalStorageData(KEYS.TRANSACTIONS, txs),

  getBadges: (): Badge[] => getLocalStorageData(KEYS.BADGES, SEED_BADGES),
  saveBadges: (badges: Badge[]) => saveLocalStorageData(KEYS.BADGES, badges),

  getUpdates: (): UpdateFeed[] => getLocalStorageData(KEYS.UPDATES, SEED_UPDATES),
  saveUpdates: (updates: UpdateFeed[]) => saveLocalStorageData(KEYS.UPDATES, updates),

  getLeaderboard: (): LeaderboardEntry[] => getLocalStorageData(KEYS.LEADERBOARD, SEED_LEADERBOARDS),
  saveLeaderboard: (leaderboard: LeaderboardEntry[]) => saveLocalStorageData(KEYS.LEADERBOARD, leaderboard),

  getReferrals: (): Referral[] => getLocalStorageData(KEYS.REFERRALS, SEED_REFERRALS),
  saveReferrals: (referrals: Referral[]) => saveLocalStorageData(KEYS.REFERRALS, referrals),

  getCurrentUser: (): Donor | null => {
    const user = localStorage.getItem(KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },
  setCurrentUser: (user: Donor | null) => {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  }
};

// Logic Helpers

// 1. Process a new Donation
export function processDonation(params: {
  donor_id: string;
  donor_name: string;
  track_id: string;
  amount: number;
  frequency: 'monthly' | 'annual' | 'one-time';
  payment_method: 'card' | 'wallet' | 'fawry' | 'stripe';
}): { transaction: Transaction; sub?: Subscription; newBadges: Badge[] } {
  const txs = db.getTransactions();
  const subs = db.getSubscriptions();
  const tracks = db.getTracks();
  const badges = db.getBadges();
  const donors = db.getDonors();

  const txId = 'tx-' + Math.random().toString(36).substr(2, 9);
  let subId: string | undefined;

  // Update track current_raised
  const updatedTracks = tracks.map(t => {
    if (t.track_id === params.track_id) {
      const oldRaised = t.current_raised;
      const newRaised = oldRaised + params.amount;
      return { ...t, current_raised: newRaised, _oldRaised: oldRaised };
    }
    return t;
  });
  
  const trackToUpdate = updatedTracks.find(t => t.track_id === params.track_id);
  
  db.saveTracks(updatedTracks.map(t => {
    const newT = {...t};
    delete (newT as any)._oldRaised;
    return newT;
  }));
  
  if (trackToUpdate && (trackToUpdate as any)._oldRaised !== undefined) {
    checkMilestonesAndNotify(params.track_id, (trackToUpdate as any)._oldRaised, trackToUpdate.current_raised);
  }

  // If recurring, create or update subscription
  let sub: Subscription | undefined;
  if (params.frequency === 'monthly' || params.frequency === 'annual') {
    const existingIndex = subs.findIndex(s => s.donor_id === params.donor_id && s.track_id === params.track_id && s.status === 'active');
    if (existingIndex !== -1) {
      subs[existingIndex] = {
        ...subs[existingIndex],
        amount: params.amount,
        frequency: params.frequency,
        status: 'active'
      };
      sub = subs[existingIndex];
      subId = sub.subscription_id;
    } else {
      subId = 'sub-' + Math.random().toString(36).substr(2, 9);
      sub = {
        subscription_id: subId,
        donor_id: params.donor_id,
        track_id: params.track_id,
        amount: params.amount,
        frequency: params.frequency,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0]
      };
      subs.push(sub);
    }
    db.saveSubscriptions(subs);
  }

  // Create transaction
  const transaction: Transaction = {
    transaction_id: txId,
    subscription_id: subId,
    donor_id: params.donor_id,
    donor_name: params.donor_name,
    track_id: params.track_id,
    amount: params.amount,
    date: new Date().toISOString().split('T')[0],
    payment_method: params.payment_method,
    frequency: params.frequency
  };
  txs.push(transaction);
  db.saveTransactions(txs);

  // Update donor streak and last donation date
  const updatedDonors = donors.map(d => {
    if (d.donor_id === params.donor_id) {
      const isFirst = d.last_donation_date === null;
      return {
        ...d,
        last_donation_date: new Date().toISOString().split('T')[0],
        streak: isFirst ? 1 : d.streak === 0 ? 1 : d.streak
      };
    }
    return d;
  });
  db.saveDonors(updatedDonors);

  // Update current user cache if matching
  const current = db.getCurrentUser();
  if (current && current.donor_id === params.donor_id) {
    const isFirst = current.last_donation_date === null;
    db.setCurrentUser({
      ...current,
      last_donation_date: new Date().toISOString().split('T')[0],
      streak: isFirst ? 1 : current.streak === 0 ? 1 : current.streak
    });
  }

  // Check Badges trigger dynamically
  const newBadges = checkAndAwardBadges(params.donor_id);

  return { transaction, sub, newBadges };
}

// Check and Award Badges dynamically based on user activities and state
export function checkAndAwardBadges(donorId: string): Badge[] {
  const badges = db.getBadges();
  const userBadges = badges.filter(b => b.donor_id === donorId);
  const txs = db.getTransactions();
  const subs = db.getSubscriptions().filter(s => s.donor_id === donorId && s.status === 'active');
  const tracks = db.getTracks();
  const refs = db.getReferrals().filter(r => r.donor_id === donorId && r.status === 'joined');
  const donors = db.getDonors();
  const donor = donors.find(d => d.donor_id === donorId);
  const streak = donor ? (donor.streak || 1) : 1;

  const newBadges: Badge[] = [];

  const addBadge = (type: BadgeType, name: string, description: string) => {
    if (!userBadges.some(b => b.badge_type === type) && !newBadges.some(b => b.badge_type === type)) {
      newBadges.push({
        badge_id: 'badge-' + Math.random().toString(36).substr(2, 9),
        donor_id: donorId,
        badge_type: type,
        name,
        description,
        earned_date: new Date().toISOString().split('T')[0]
      });
    }
  };

  // 1. First Step (enrolled for one month or one time)
  const hasTxOrSub = txs.some(tx => tx.donor_id === donorId) || subs.length > 0;
  if (hasTxOrSub) {
    addBadge('first_step', 'First Step', 'Enrolled for one month or made a one-time offering.');
  }

  // 2. 3-Month Faithful (3 month paying)
  if (streak >= 3) {
    addBadge('three_month_faithful', '3-Month Faithful', 'Completed 3 consecutive months of paying partnerships.');
  }

  // 3. Anniversary Friend (12 months consecutive paying)
  if (streak >= 12) {
    addBadge('anniversary_friend', 'Anniversary Friend', 'Completed 12 months consecutive paying partnerships.');
  }

  // 4. Gospel Multipler (reached 1000 souls)
  const totalUnits = calculateImpactUnitsForDonor(donorId, tracks, txs);
  let projectedUnits = 0;
  subs.forEach(sub => {
    const track = tracks.find(t => t.track_id === sub.track_id);
    if (track) {
      const { annualUnits } = calculateSubscriptionImpact(track, sub.amount, sub.frequency);
      projectedUnits += annualUnits;
    }
  });
  const totalGospelReach = totalUnits + projectedUnits;
  if (totalGospelReach >= 1000) {
    addBadge('gospel_multiplier', 'Gospel Multipler', 'Reached 1,000 souls through digital media outreach.');
  }

  // 5. Loyal partner (supports 3 or more active ministry tracks)
  if (subs.length >= 3) {
    addBadge('loyal_partner', 'Loyal partner', 'Supports 3 or more active ministry tracks.');
  }

  // 6. Kingdom advocate (Brought 3 friends who enrolled)
  if (refs.length >= 3) {
    addBadge('kingdom_advocate', 'Kingdom advocate', 'Brought 3 friends who enrolled in the program.');
  }

  if (newBadges.length > 0) {
    db.saveBadges([...badges, ...newBadges]);
  }

  return newBadges;
}

// 2. Calculate dynamic impact units for a donor based on their transactions
export function calculateImpactUnitsForDonor(donorId: string, tracks: Track[], transactions: Transaction[]): number {
  let totalUnits = 0;
  const userTxs = transactions.filter(t => t.donor_id === donorId);
  userTxs.forEach(tx => {
    const track = tracks.find(t => t.track_id === tx.track_id);
    if (track) {
      // Impact = Amount / Cost per unit
      const units = tx.amount / track.cost_per_unit;
      totalUnits += units;
    }
  });
  return Math.round(totalUnits);
}

// 3. Calculate impact units for a specific subscription per month/year
export function calculateSubscriptionImpact(track: Track, amount: number, frequency: 'monthly' | 'annual'): { monthlyUnits: number; annualUnits: number } {
  const monthlyAmount = frequency === 'monthly' ? amount : amount / 12;
  const monthlyUnits = monthlyAmount / track.cost_per_unit;
  const annualUnits = monthlyUnits * 12;
  return {
    monthlyUnits: Math.round(monthlyUnits * 10) / 10,
    annualUnits: Math.round(annualUnits)
  };
}


const NOTIFICATIONS_KEY = 'blf_notifications';

function loadNotifications(): AppNotification[] {
  const saved = localStorage.getItem(NOTIFICATIONS_KEY);
  if (saved) return JSON.parse(saved);
  return [];
}

export let notifications: AppNotification[] = loadNotifications();

export function saveNotifications(notifs: AppNotification[]) {
  notifications = notifs;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}



export function checkMilestonesAndNotify(trackId: string, oldRaised: number, newRaised: number) {
  const track = db.getTracks().find(t => t.track_id === trackId);
  if (!track) return;
  const goal = track.annual_budget;
  if (!goal) return;
  
  const oldPct = (oldRaised / goal) * 100;
  const newPct = (newRaised / goal) * 100;
  
  const milestones = [50, 75, 100];
  
  // Get unique donors for this track
  const donorIds = Array.from(new Set(db.getTransactions().filter(tx => tx.track_id === trackId).map(tx => tx.donor_id)));
  
  milestones.forEach(m => {
    if (oldPct < m && newPct >= m) {
      // Reached milestone! Create notification for all donors of this track
      donorIds.forEach(dId => {
        notifications.push({
          notification_id: 'notif-' + Date.now() + '-' + Math.random(),
          donor_id: dId,
          title: `Goal Reached: ${m}%`,
          message: `${track.name} has just reached ${m}% of its funding goal! Thank you for your support.`,
          date: new Date().toISOString(),
          read: false,
          type: 'milestone',
          track_id: trackId
        });
        saveNotifications(notifications);
      });
    }
  });
}

// Add a helper to simulate some notifications on load for demo purposes
export function _seedNotifications() {
  if (notifications.length === 0 && db.getDonors().length > 0) {
    const defaultDonor = db.getDonors()[0];
    notifications.push({
      notification_id: 'notif-1',
      donor_id: defaultDonor.donor_id,
      title: `Goal Reached: 50%`,
      message: `Satellite TV Network has just reached 50% of its funding goal! Thank you for your support.`,
      date: new Date().toISOString(),
      read: false,
      type: 'milestone',
      track_id: 'track-1'
    });
        saveNotifications(notifications);
  }
}
_seedNotifications();

export function markNotificationRead(notificationId: string) {
  const notif = notifications.find(n => n.notification_id === notificationId);
  if (notif) {
    notif.read = true;
    saveNotifications(notifications);
  }
}

export function markAllNotificationsRead(donorId: string) {
  let changed = false;
  notifications.forEach(n => {
    if (n.donor_id === donorId && !n.read) {
      n.read = true;
      changed = true;
    }
  });
  if (changed) {
    saveNotifications(notifications);
  }
}

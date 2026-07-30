import React, { useState, useEffect } from 'react';
import { Donor, Subscription, Transaction, Badge, Track, Referral } from '../types';
import { db, calculateImpactUnitsForDonor, calculateSubscriptionImpact, checkAndAwardBadges } from '../db';
import { useLanguage } from '../LanguageContext';
import {
 getLocalizedDonorName,
 getLocalizedTierName,
 getLocalizedTierDesc,
 getLocalizedTrackName,
 getLocalizedTrackDesc,
 getLocalizedTrackUnitLabel,
 getLocalizedBadgeName,
 getLocalizedBadgeDesc,
 getLocalizedAltarPostText,
 getLocalizedAltarPostCategory
} from '../utils/localization';
import { 
 Flame, 
 Award, 
 FileText, 
 Download, 
 TrendingUp, 
 Calendar, 
 Heart, 
 ArrowUpRight, 
 X, 
 DollarSign, 
 CheckCircle2, 
 ChevronRight,
 ShieldAlert,
 Shield,
 Users,
 Send,
 Trash2,
 Plus,
 MessageSquare,
 User,
 Mail,
 Phone as PhoneIcon,
 Check,
 Globe, Video,
 Copy,
 Link,
 Share2,
 Info,
 Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { AnimateNumber } from './AnimateNumber';
import { PrayerWall } from './PrayerWall';
import { MethodologyModal } from './MethodologyModal';

import LandingPage from './LandingPage';
import { UpdateFeed, LeaderboardEntry } from '../types';

interface DashboardProps {
 currentUser: Donor;
 onDonateClick: (track: Track, amount: number, frequency: 'monthly' | 'annual') => void;
 tracks: Track[];
 subscriptions: Subscription[];
 transactions: Transaction[];
 badges: Badge[];
 onUserChange: (user: Donor | null) => void;
 activeSubTab?: 'dashboard' | 'overview' | 'profile' | 'referrals' | 'prayer';
 setActiveSubTab?: (tab: 'dashboard' | 'overview' | 'profile' | 'referrals' | 'prayer') => void;
 updates: UpdateFeed[];
 leaderboard: LeaderboardEntry[];
 onOpenAuth?: () => void;
}

export const PARTNERSHIP_TIERS_DATA = [
 { name: "Vision Champion", minMonthly: 45000, minAnnual: 540000, desc: "Sponsors mass satellite & digital broadcast operations.", impactMonthlyVal: 450000, impact: "450,000+ souls" },
 { name: "Kingdom Builders", minMonthly: 20000, minAnnual: 240000, desc: "Enables regional youth rallies & counseling centers.", impactMonthlyVal: 200000, impact: "200,000+ souls" },
 { name: "Cornerstone Friend", minMonthly: 4000, minAnnual: 48000, desc: "Backs studio production & follow-up counseling.", impactMonthlyVal: 40000, impact: "40,000+ souls" },
 { name: "Faithful Giver", minMonthly: 2000, minAnnual: 24000, desc: "Supports Daily Bible programs & broadcast ministries.", impactMonthlyVal: 20000, impact: "20,000+ souls" },
 { name: "Harvest Keeper", minMonthly: 1000, minAnnual: 12000, desc: "Sustains media follow-ups & counseling seeker doubts.", impactMonthlyVal: 10000, impact: "10,000+ souls" },
 { name: "Light Bearer", minMonthly: 200, minAnnual: 2400, desc: "Broadcasts Christian songs & Bible truth to seekers.", impactMonthlyVal: 2000, impact: "2,000+ souls" },
 { name: "Faith Companion", minMonthly: 100, minAnnual: 1200, desc: "Backs digital ads & targeted media distribution.", impactMonthlyVal: 1000, impact: "1,000+ souls" },
 { name: "Seed Planter", minMonthly: 50, minAnnual: 600, desc: "Plants initial Gospel seeds in seeker hearts.", impactMonthlyVal: 500, impact: "500+ souls" }
];


const SimplifiedTile = ({ icon, title, value, details, colorClass, hoverClass, textClass, iconBgClass }: any) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  return (
    <motion.div 
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className={`rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-sm border-2 transition-all duration-300 cursor-pointer min-h-[260px] ${colorClass} ${hoverClass}`}
    >
      <motion.div layout className={`mb-6 p-5 rounded-full ${iconBgClass} shadow-inner`}>
        {icon}
      </motion.div>
      <motion.h2 layout className={`text-2xl font-extrabold mb-2 tracking-tight ${textClass}`}>{title}</motion.h2>
      {value && <motion.p layout className={`text-4xl font-serif font-bold mb-2 ${textClass}`}>{value}</motion.p>}
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className={`overflow-hidden text-sm font-medium opacity-90`}
          >
            <div className="pt-4 border-t border-black/5 dark:border-white/5">
              {details}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div layout className="mt-auto pt-4">
        <span className={`text-[10px] uppercase font-bold tracking-widest opacity-50 ${textClass}`}>
          {isExpanded ? 'Click to collapse' : 'Click to expand'}
        </span>
      </motion.div>
    </motion.div>
  );
};


const StreakBadge = ({ streak }: { streak: number }) => {
  if (streak < 1) return null;
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-100 dark:from-orange-950/40 to-amber-100 dark:to-amber-950/40 border border-orange-200 dark:border-orange-800/40 rounded-full text-orange-800 dark:text-orange-300 shadow-sm ml-4" title="Giving Consistency Streak">
      <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400 fill-orange-500 animate-pulse" />
      <span className="text-xs font-bold font-sans tracking-wide">{streak} Month{streak !== 1 ? 's' : ''} Streak</span>
    </div>
  );
};

export default function Dashboard({
 currentUser,
 onDonateClick,
 tracks,
 subscriptions,
 transactions,
 badges,
 onUserChange,
 activeSubTab: externalActiveSubTab,
 setActiveSubTab: externalSetActiveSubTab,
 updates,
 leaderboard,
 onOpenAuth
}: DashboardProps) {
 const { t, language, isRtl } = useLanguage();
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingUpdates(false), 1500);
    return () => clearTimeout(timer);
  }, []);

 // Filter user data
 const userSubs = subscriptions.filter(s => s.donor_id === currentUser.donor_id && s.status === 'active');
 const userTxs = transactions.filter(t => t.donor_id === currentUser.donor_id);
 const userBadges = badges.filter(b => b.donor_id === currentUser.donor_id);

 // Rolling Period state: 30 (Last 30 Days), 90 (Last 90 Days), 365 (Last 12 Months)
 const { width, height } = useWindowSize();
 const [showConfetti, setShowConfetti] = useState(false);
 const [isSimplifiedView, setIsSimplifiedView] = useState(false);
 const [rollingPeriod, setRollingPeriod] = useState<30 | 90 | 365>(30);
 const viewMode = rollingPeriod === 365 ? 'annual' : 'monthly';

 // Live Ticking Accumulator state
 const [elapsedDays, setElapsedDays] = useState(0);

 useEffect(() => {
 const calculateElapsed = () => {
 const now = new Date();
 // Calculate fractional day in current month cycle (capping at 30 days)
 const currentDay = now.getDate();
 const secondsToday = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds() + (now.getMilliseconds() / 1000);
 const fractionalDay = ((currentDay - 1) + (secondsToday / 86400)) % 30;
 setElapsedDays(fractionalDay);
 };

 calculateElapsed();
 const interval = setInterval(calculateElapsed, 100);
 return () => clearInterval(interval);
 }, []);

 const getActualSowedInPeriod = (days: number) => {
 // Current local date from metadata is July 10, 2026. Let's use that as the reference base.
 const refDate = new Date('2026-07-10');
 const cutoffTime = refDate.getTime() - (days * 24 * 3600 * 1000);
 return userTxs
 .filter(tx => {
 const txDate = new Date(tx.date);
 return txDate.getTime() >= cutoffTime;
 })
 .reduce((sum, tx) => sum + tx.amount, 0);
 };


 const activeMonthlyCommitment = userSubs.filter(s => s.frequency === 'monthly').reduce((sum, s) => sum + s.amount, 0);
 const activeAnnualCommitment = userSubs.filter(s => s.frequency === 'annual').reduce((sum, s) => sum + s.amount, 0);

 // Normalized current active commitment values for dynamic metrics
 const currentCommitmentMonthly = activeMonthlyCommitment + Math.round(activeAnnualCommitment / 12);
 const currentCommitmentAnnual = (activeMonthlyCommitment * 12) + activeAnnualCommitment;
 
 // Selected transaction for receipt simulation
 const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
 
 // Level up upgrade state
 const [levelUpSub, setLevelUpSub] = useState<Subscription | null>(null);
 const [upgradeAmount, setUpgradeAmount] = useState(0);
 const [upgradeFrequency, setUpgradeFrequency] = useState<'monthly' | 'annual'>('monthly');
 const [isUpgrading, setIsUpgrading] = useState(false);
 const [upgradeSuccess, setUpgradeSuccess] = useState(false);
 const [isDownloading, setIsDownloading] = useState(false);

 // Partnership Tiers section state
 const [showOtherTiers, setShowOtherTiers] = useState(false);

 // Add Track Form States
 const [showAddTrackForm, setShowAddTrackForm] = useState(false);
 const [selectedAddTrackId, setSelectedAddTrackId] = useState('');
 const [addTrackAmount, setAddTrackAmount] = useState<number>(0);
 const [addTrackFrequency, setAddTrackFrequency] = useState<'monthly' | 'annual'>('monthly');
 
 // Info banner state for Souls touched metric
 const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
 const [methodologyTrackId, setMethodologyTrackId] = useState<string | null>(null);

 const openMethodology = (trackId: string | null = null) => {
 setMethodologyTrackId(trackId);
 setIsMethodologyOpen(true);
 };

 const getTrackImage = (trackId: string): string => {
 switch (trackId) {
 case 'gospel-reach':
 return 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?w=400';
 case 'answer-search':
 return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';
 
 case 'believer-followup':
 return 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400';
 case 'radio-ministry':
 return 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80';
 case 'general-fund':
      return 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=800&auto=format&fit=crop&q=80';
    case 'rallies':
 return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';
 default:
 return 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=400';
 }
 };

 // Sub-tab Navigation state for Dashboard vs Overview vs Profile management vs Referrals
 const [internalActiveSubTab, internalSetActiveSubTab] = useState<'dashboard' | 'overview' | 'profile' | 'referrals' | 'prayer'>('dashboard');
 const activeSubTab = externalActiveSubTab !== undefined ? externalActiveSubTab : internalActiveSubTab;
 const setActiveSubTab = externalSetActiveSubTab !== undefined ? externalSetActiveSubTab : internalSetActiveSubTab;

 // Referral state variables
 const [friendName, setFriendName] = useState('');
 const [friendEmail, setFriendEmail] = useState('');
 const [friendPhone, setFriendPhone] = useState('');
 const [referralSuccess, setReferralSuccess] = useState(false);
 const [referralError, setReferralError] = useState('');
 const [linkCopied, setLinkCopied] = useState(false);
 const [userReferrals, setUserReferrals] = useState<Referral[]>([]);
 const [lastGeneratedReferral, setLastGeneratedReferral] = useState<Referral | null>(null);
 const [copiedReferralId, setCopiedReferralId] = useState<string | null>(null);

 const handleCopySpecialLink = (refId: string, friendName: string) => {
 const link = `https://betterlifefriend.org/join?ref=${currentUser.donor_id}&friend=${encodeURIComponent(friendName)}&invite=${refId}`;
 navigator.clipboard.writeText(link).then(() => {
 setCopiedReferralId(refId);
 setTimeout(() => {
 setCopiedReferralId(null);
 }, 2500);
 }).catch(err => {
 console.error('Failed to copy text: ', err);
 });
 };

 // Reload user referrals when currentUser or sub-tab changes
 useEffect(() => {
 try {
 const allRefs = db.getReferrals();
 const filtered = allRefs.filter(r => r.donor_id === currentUser.donor_id);
 setUserReferrals(filtered);
 } catch (e) {
 console.error("Error loading referrals:", e);
 }
 }, [currentUser, activeSubTab]);

 const handleAddReferral = (e: React.FormEvent) => {
 e.preventDefault();
 setReferralSuccess(false);
 setReferralError('');

 if (!friendName.trim()) {
 setReferralError("Please enter your friend's name.");
 return;
 }

 if (!friendEmail.trim() && !friendPhone.trim()) {
 setReferralError("Please provide at least an email address or a phone number.");
 return;
 }

 if (friendEmail.trim() && !friendEmail.includes('@')) {
 setReferralError('Please enter a valid email address.');
 return;
 }

 try {
 const allRefs = db.getReferrals();
 
 // Check if this friend is already referred by this user
 const alreadyReferred = allRefs.some(
 r => r.donor_id === currentUser.donor_id && 
 ((friendEmail.trim() && r.friend_email.toLowerCase() === friendEmail.trim().toLowerCase()) || 
 (friendPhone.trim() && r.friend_phone.trim() === friendPhone.trim()))
 );

 if (alreadyReferred) {
 setReferralError('You have already referred this friend.');
 return;
 }

 const newReferral: Referral = {
 referral_id: `ref-${Date.now()}`,
 donor_id: currentUser.donor_id,
 friend_name: friendName.trim(),
 friend_email: friendEmail.trim(),
 friend_phone: friendPhone.trim(),
 status: 'joined', // Default to joined so they can easily test the badge criteria!
 date_added: new Date().toISOString().split('T')[0]
 };

 const updated = [newReferral, ...allRefs];
 db.saveReferrals(updated);
 setUserReferrals(updated.filter(r => r.donor_id === currentUser.donor_id));
 setLastGeneratedReferral(newReferral);
 
 // Dynamic badge check & trigger parent refresh
 checkAndAwardBadges(currentUser.donor_id);
 onUserChange(currentUser);
 
 setFriendName('');
 setFriendEmail('');
 setFriendPhone('');
 setReferralSuccess(true);

 setTimeout(() => {
 setReferralSuccess(false);
 }, 5000);
 } catch (err) {
 setReferralError('An error occurred while saving the referral.');
 console.error(err);
 }
 };

 const handleCopyLink = () => {
 const link = `https://betterlifefriend.org/join?ref=${currentUser.donor_id}`;
 navigator.clipboard.writeText(link).then(() => {
 setLinkCopied(true);
 setTimeout(() => {
 setLinkCopied(false);
 }, 2000);
 }).catch(err => {
 console.error('Failed to copy text: ', err);
 });
 };

 // Profile management state variables
 const [profileName, setProfileName] = useState(currentUser.name);
 const [profileEmail, setProfileEmail] = useState(currentUser.email);
 const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
 const [profileReferral, setProfileReferral] = useState(currentUser.referral_source || 'Social Media');
 const [profileOptIn, setProfileOptIn] = useState(currentUser.communication_opt_in);
 const [profileAvatar, setProfileAvatar] = useState(currentUser.avatar_url || '');
 const [showAvatarSelector, setShowAvatarSelector] = useState(false);
 const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
 const [profileUpdateError, setProfileUpdateError] = useState('');

 // Synchronize state when currentUser changes
 useEffect(() => {
 setProfileName(currentUser.name);
 setProfileEmail(currentUser.email);
 setProfilePhone(currentUser.phone || '');
 setProfileReferral(currentUser.referral_source || 'Social Media');
 setProfileOptIn(currentUser.communication_opt_in);
 setProfileAvatar(currentUser.avatar_url || '');
 setProfileUpdateSuccess(false);
 setProfileUpdateError('');
 }, [currentUser]);

 // Spiritual Prayer/Thanks Altar states inside Dashboard

 // Search & Filter UI state for the Prayer Wall

 interface AltarPost {
 id: string;
 type: 'prayer' | 'praise';
  isAnswered?: boolean;
 text: string;
 authorName: string;
 authorAvatar?: string;
 isAnonymous: boolean;
 category: string;
 timestamp: string;
 amensCount: number;
 }

 const [customPrayers, setCustomPrayers] = useState<AltarPost[]>(() => {
 const saved = localStorage.getItem('blf_custom_prayers_v2');
 if (saved) return JSON.parse(saved);
 
 // Fallback/migration from v1 simple string array:
 const v1Saved = localStorage.getItem('blf_custom_prayers');
 if (v1Saved) {
 try {
 const parsed = JSON.parse(v1Saved);
 if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
 return parsed.map((str, idx) => ({
 id: `custom-prayer-${idx}-${Date.now()}`,
 type: 'prayer',
 text: str,
 authorName: currentUser?.name || 'Partner',
 category: 'Personal Faith',
 timestamp: 'Just now',
 amensCount: 1,
 isAnonymous: false
 }));
 }
 } catch (e) {}
 }
 return [];
 });

 const [customThanks, setCustomThanks] = useState<AltarPost[]>(() => {
 const saved = localStorage.getItem('blf_custom_thanks_v2');
 if (saved) return JSON.parse(saved);
 
 // Fallback/migration from v1 simple string array:
 const v1Saved = localStorage.getItem('blf_custom_thanks');
 if (v1Saved) {
 try {
 const parsed = JSON.parse(v1Saved);
 if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
 return parsed.map((str, idx) => ({
 id: `custom-thanks-${idx}-${Date.now()}`,
 type: 'praise',
 text: str,
 authorName: currentUser?.name || 'Partner',
 category: 'Personal Praise',
 timestamp: 'Just now',
 amensCount: 1,
 isAnonymous: false
 }));
 }
 } catch (e) {}
 }
 return [];
 });

 const [selectedUpdate, setSelectedUpdate] = useState<UpdateFeed | null>(null);
 const [updateCategoryFilter, setUpdateCategoryFilter] = useState<string>('All');

 const [prayerAmens, setPrayerAmens] = useState<{ [key: string]: number }>(() => {
 const saved = localStorage.getItem('blf_prayer_amens');
 if (saved) return JSON.parse(saved);
 return {
 'seed-prayer-0': 18,
 'seed-prayer-1': 32,
 'seed-prayer-2': 11
 };
 });

 const [thanksAmens, setThanksAmens] = useState<{ [key: string]: number }>(() => {
 const saved = localStorage.getItem('blf_thanks_amens');
 if (saved) return JSON.parse(saved);
 return {
 'seed-thanks-0': 24,
 'seed-thanks-1': 41,
 'seed-thanks-2': 19
 };
 });

 const [userClickedAmens, setUserClickedAmens] = useState<{ [key: string]: boolean }>(() => {
 const saved = localStorage.getItem('blf_user_clicked_amens');
 return saved ? JSON.parse(saved) : {};
 });

 const [updateLikes, setUpdateLikes] = useState<{ [key: string]: number }>(() => {
 const saved = localStorage.getItem('blf_update_likes');
 if (saved) return JSON.parse(saved);
 return {
 'post-1': 45,
 'post-2': 38,
 'post-3': 52
 };
 });

 const [userLikedUpdates, setUserLikedUpdates] = useState<{ [key: string]: boolean }>(() => {
 const saved = localStorage.getItem('blf_user_liked_updates');
 return saved ? JSON.parse(saved) : {};
 });

 const seedPrayers: AltarPost[] = [
 {
 id: 'seed-prayer-0',
 type: 'prayer',
 text: "For the hearts of the 1,500 youth who attended our recent Minya rally, that they grow deep roots in local discipleship groups.",
 authorName: "Ministry Outreach Team",
 category: "Youth Outreach",
 timestamp: "2 days ago",
 amensCount: 18,
 isAnonymous: false
 },
 {
 id: 'seed-prayer-1',
 type: 'prayer',
 text: "For our apologetics AV team as they write scripts for 12 new shorts addressing search queries about finding hope in difficult times.",
 authorName: "Apologetics Media Team",
 category: "Media Frontiers",
 timestamp: "3 days ago",
 amensCount: 32,
 isAnonymous: false
 },
 {
 id: 'seed-prayer-2',
 type: 'prayer',
 text: "For safety and open doors for our follow-up counselors answering critical seeker questions through live chat in Cairo.",
 authorName: "Cairo Counseling Center",
 category: "Follow-up",
 timestamp: "4 days ago",
 amensCount: 11,
 isAnonymous: false
 }
 ];

 const seedThanks: AltarPost[] = [
 {
 id: 'seed-thanks-0',
 type: 'praise',
 text: "Praise God! All 12 apologetics videos have successfully completed post-production and are ready to be broadcast!",
 authorName: "Apologetics Media Team",
 category: "Media Frontiers",
 timestamp: "1 day ago",
 amensCount: 24,
 isAnonymous: false
 },
 {
 id: 'seed-thanks-1',
 type: 'praise',
 text: "Praise God! The Minya Youth Rally saw over 700 professions of faith and hundreds of students connected to local churches.",
 authorName: "Minya Field Coordinator",
 category: "Youth Outreach",
 timestamp: "2 days ago",
 amensCount: 41,
 isAnonymous: false
 },
 {
 id: 'seed-thanks-2',
 type: 'praise',
 text: "Praise God! Over 15,000 active readers are now engaging with our Daily Bible app every morning.",
 authorName: "Mobile App Team",
 category: "Discipleship",
 timestamp: "3 days ago",
 amensCount: 19,
 isAnonymous: false
 }
 ];

 const handleTogglePrayerAmen = (id: string) => {
 const hasClicked = userClickedAmens[id];
 const updatedClicked = { ...userClickedAmens, [id]: !hasClicked };
 setUserClickedAmens(updatedClicked);
 localStorage.setItem('blf_user_clicked_amens', JSON.stringify(updatedClicked));

 const delta = hasClicked ? -1 : 1;
 const currentCount = prayerAmens[id] !== undefined 
 ? prayerAmens[id] 
 : (customPrayers.find(p => p.id === id)?.amensCount || seedPrayers.find(p => p.id === id)?.amensCount || 0);

 const updatedAmens = {
 ...prayerAmens,
 [id]: Math.max(0, currentCount + delta)
 };
 setPrayerAmens(updatedAmens);
 localStorage.setItem('blf_prayer_amens', JSON.stringify(updatedAmens));

 // Also update customPrayers list in state and storage if it exists there
 const updatedCustom = customPrayers.map(p => {
 if (p.id === id) {
 return { ...p, amensCount: Math.max(0, currentCount + delta) };
 }
 return p;
 });
 setCustomPrayers(updatedCustom);
 localStorage.setItem('blf_custom_prayers_v2', JSON.stringify(updatedCustom));
 };

 const handleToggleThanksAmen = (id: string) => {
 const hasClicked = userClickedAmens[id];
 const updatedClicked = { ...userClickedAmens, [id]: !hasClicked };
 setUserClickedAmens(updatedClicked);
 localStorage.setItem('blf_user_clicked_amens', JSON.stringify(updatedClicked));

 const delta = hasClicked ? -1 : 1;
 const currentCount = thanksAmens[id] !== undefined 
 ? thanksAmens[id] 
 : (customThanks.find(t => t.id === id)?.amensCount || seedThanks.find(t => t.id === id)?.amensCount || 0);

 const updatedAmens = {
 ...thanksAmens,
 [id]: Math.max(0, currentCount + delta)
 };
 setThanksAmens(updatedAmens);
 localStorage.setItem('blf_thanks_amens', JSON.stringify(updatedAmens));

 // Also update customThanks list in state and storage if it exists there
 const updatedCustom = customThanks.map(t => {
 if (t.id === id) {
 return { ...t, amensCount: Math.max(0, currentCount + delta) };
 }
 return t;
 });
 setCustomThanks(updatedCustom);
 localStorage.setItem('blf_custom_thanks_v2', JSON.stringify(updatedCustom));
 };

 const handleToggleUpdateLike = (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 const hasLiked = userLikedUpdates[id];
 const updatedLiked = { ...userLikedUpdates, [id]: !hasLiked };
 setUserLikedUpdates(updatedLiked);
 localStorage.setItem('blf_user_liked_updates', JSON.stringify(updatedLiked));

 const updatedLikes = {
 ...updateLikes,
 [id]: (updateLikes[id] || 0) + (hasLiked ? -1 : 1)
 };
 setUpdateLikes(updatedLikes);
 localStorage.setItem('blf_update_likes', JSON.stringify(updatedLikes));
 };

 /* removed unused altar logic */

 const handleRemoveCustomPrayer = (id: string) => {
 const updated = customPrayers.filter(p => p.id !== id);
 setCustomPrayers(updated);
 localStorage.setItem('blf_custom_prayers_v2', JSON.stringify(updated));
 };

 const handleRemoveCustomThanks = (id: string) => {
 const updated = customThanks.filter(t => t.id !== id);
 setCustomThanks(updated);
 localStorage.setItem('blf_custom_thanks_v2', JSON.stringify(updated));
 };

 const handleSaveProfile = (e: React.FormEvent) => {
 e.preventDefault();
 setProfileUpdateSuccess(false);
 setProfileUpdateError('');

 if (!profileName.trim()) {
 setProfileUpdateError('Name cannot be empty.');
 return;
 }
 if (!profileEmail.trim() || !profileEmail.includes('@')) {
 setProfileUpdateError('Please enter a valid email address.');
 return;
 }

 // Save to LocalStorage mock DB
 const allDonors = db.getDonors();
 const isEmailTaken = allDonors.some(
 d => d.donor_id !== currentUser.donor_id && d.email.toLowerCase() === profileEmail.trim().toLowerCase()
 );

 if (isEmailTaken) {
 setProfileUpdateError('This email is already registered to another user.');
 return;
 }

 const updatedDonor: Donor = {
 ...currentUser,
 name: profileName.trim(),
 email: profileEmail.trim(),
 phone: profilePhone.trim(),
 referral_source: profileReferral,
 communication_opt_in: profileOptIn,
 avatar_url: profileAvatar,
 };

 const updatedDonors = allDonors.map(d => {
 if (d.donor_id === currentUser.donor_id) {
 return updatedDonor;
 }
 return d;
 });

 db.saveDonors(updatedDonors);
 db.setCurrentUser(updatedDonor);

 if (onUserChange) {
 onUserChange(updatedDonor);
 }

 setProfileUpdateSuccess(true);
 setTimeout(() => {
 setProfileUpdateSuccess(false);
 }, 4000);
 };

 const getTierName = (amount: number): string => {
 if (amount < 300) return "Faith Sower";
 if (amount < 750) return "Gospel Light Partner";
 if (amount < 1500) return "Kingdom Builder";
 return "Legacy Pillar";
 };

 const calculateTotalImpact = (mode: 'monthly' | 'annual', upgradeAmt?: number) => {
 let total = 0;
 userSubs.forEach(sub => {
 const track = tracks.find(t => t.track_id === sub.track_id);
 if (!track) return;
 
 let amt = sub.amount;
 if (upgradeAmt !== undefined && levelUpSub && levelUpSub.amount > 0) {
 const ratio = upgradeAmt / levelUpSub.amount;
 amt = sub.amount * ratio;
 }
 
 const { monthlyUnits, annualUnits } = calculateSubscriptionImpact(track, amt, sub.frequency);
 total += Math.round(mode === 'annual' ? annualUnits : monthlyUnits);
 });
 return total;
 };

 const calculateTotalMonthlyImpact = (upgradeAmt?: number) => {
 return calculateTotalImpact('monthly', upgradeAmt);
 };

 // Core cumulative totals
 const totalDonated = userTxs.reduce((sum, tx) => sum + tx.amount, 0);
 const totalImpact = calculateImpactUnitsForDonor(currentUser.donor_id, tracks, transactions);

 // Rolling Period calculations for 3 Main Numbers & Mission Control
 const activeCommitmentForPeriod = rollingPeriod === 30 
 ? currentCommitmentMonthly 
 : rollingPeriod === 90 
 ? currentCommitmentMonthly * 3 
 : currentCommitmentAnnual;

 const actualSowedForPeriod = getActualSowedInPeriod(rollingPeriod);

 const totalExpectedSouls = rollingPeriod === 30 
 ? calculateTotalImpact('monthly') 
 : rollingPeriod === 90 
 ? calculateTotalImpact('monthly') * 3 
 : calculateTotalImpact('annual');

 let accumulatedSouls = 0;
 if (totalExpectedSouls > 0) {
 if (rollingPeriod === 30) {
 accumulatedSouls = (calculateTotalImpact('monthly') / 30) * elapsedDays;
 } else if (rollingPeriod === 90) {
 accumulatedSouls = (calculateTotalImpact('monthly') / 30) * (60 + elapsedDays);
 } else { // 365 days
 accumulatedSouls = (calculateTotalImpact('monthly') / 30) * (11 * 30 + elapsedDays);
 }
 // Cap at total expected souls
 if (accumulatedSouls > totalExpectedSouls) {
 accumulatedSouls = totalExpectedSouls;
 }
 }

 // Calculate specific outreach metrics for active tracks (subscriptions)
 const activeTrackMetrics = userSubs.map(sub => {
 const track = tracks.find(t => t.track_id === sub.track_id);
 if (!track) return null;
 const { monthlyUnits, annualUnits } = calculateSubscriptionImpact(track, sub.amount, sub.frequency);
 
 let value = monthlyUnits;
 if (rollingPeriod === 90) {
 value = monthlyUnits * 3;
 } else if (rollingPeriod === 365) {
 value = annualUnits;
 }
 
 return {
 track_id: track.track_id,
 trackName: getLocalizedTrackName(track.track_id, track.name, language),
 unitLabel: track.target_unit_label,
 value: Math.round(value),
 };
 }).filter(Boolean) as { track_id: string; trackName: string; unitLabel: string; value: number }[];

 // Calculate specific outreach metrics for lifetime donations (transactions)
 const getLifetimeMetrics = () => {
 const breakdown: { [key: string]: { track_id: string; trackName: string; unitLabel: string; value: number } } = {};
 userTxs.forEach(tx => {
 const track = tracks.find(t => t.track_id === tx.track_id);
 if (!track) return;
 const units = tx.amount / track.cost_per_unit;
 if (!breakdown[tx.track_id]) {
 breakdown[tx.track_id] = {
 track_id: track.track_id,
 trackName: getLocalizedTrackName(track.track_id, track.name, language),
 unitLabel: track.target_unit_label,
 value: 0
 };
 }
 breakdown[tx.track_id].value += units;
 });
 return Object.values(breakdown).map(item => ({
 ...item,
 value: Math.round(item.value)
 })).filter(item => item.value > 0);
 };
 const lifetimeTrackMetrics = getLifetimeMetrics();

 // Find current tier based on active commitment amounts and the current viewMode
 const currentTierIndex = PARTNERSHIP_TIERS_DATA.findIndex(tier => {
 return viewMode === 'monthly'
 ? currentCommitmentMonthly >= tier.minMonthly
 : currentCommitmentAnnual >= tier.minAnnual;
 });
 const currentTier = currentTierIndex !== -1 ? PARTNERSHIP_TIERS_DATA[currentTierIndex] : null;

 // Handle subscription upgrading
 const handleOpenUpgrade = (sub: Subscription) => {
 setLevelUpSub(sub);
 setUpgradeAmount(sub.amount + (sub.frequency === 'annual' ? 2400 : 200)); // suggest +2400 for annual or +200 for monthly
 setUpgradeFrequency(sub.frequency);
 setUpgradeSuccess(false);
 };

 const handleConfirmUpgrade = () => {
 if (!levelUpSub) return;
 setIsUpgrading(true);

 setTimeout(() => {
 setIsUpgrading(false);
 
 // Update in LocalStorage
 const allSubs = db.getSubscriptions();
 const updatedSubs = allSubs.map(s => {
 if (s.subscription_id === levelUpSub.subscription_id) {
 return { 
 ...s, 
 amount: upgradeAmount, 
 frequency: upgradeFrequency 
 };
 }
 return s;
 });
 db.saveSubscriptions(updatedSubs);

 // Increase track raised money
 const allTracks = db.getTracks();
 const trackIncrease = upgradeAmount - (levelUpSub.frequency === upgradeFrequency ? levelUpSub.amount : Math.round(levelUpSub.amount / 12));
 const updatedTracks = allTracks.map(t => {
 if (t.track_id === levelUpSub.track_id) {
 return { ...t, current_raised: Math.max(0, t.current_raised + trackIncrease) };
 }
 return t;
 });
 db.saveTracks(updatedTracks);

 setUpgradeSuccess(true);
 
 // Auto close after 2 seconds and reload
 setTimeout(() => {
 setLevelUpSub(null);
 window.location.reload();
 }, 1800);

 }, 1200);
 };

 // Badge list with Earned vs Locked status
 const ALL_BADGES_METADATA = [
 {
 type: 'first_step',
 name: 'First Step',
 description: 'Enrolled for one month or made a one-time offering.',
 level: 'Enrolled for one month or one time',
 iconColor: 'bg-teal-500 dark:bg-teal-600 dark:bg-teal-500 text-white'
 },
 {
 type: 'three_month_faithful',
 name: '3-Month Faithful',
 description: 'Completed 3 consecutive months of paying partnerships.',
 level: '3 month paying',
 iconColor: 'bg-amber-500 dark:bg-amber-600 text-white'
 },
 {
 type: 'anniversary_friend',
 name: 'Anniversary Friend',
 description: 'Completed 12 months consecutive paying partnerships.',
 level: '12 months consecutive paying',
 iconColor: 'bg-emerald-500 dark:bg-emerald-600 text-white'
 },
 {
 type: 'gospel_multiplier',
 name: 'Gospel Multipler',
 description: 'Reached 1,000 souls through digital media outreach.',
 level: 'Reached 1,000 souls',
 iconColor: 'bg-purple-500 dark:bg-purple-600 dark:bg-purple-500 text-white'
 },
 {
 type: 'loyal_partner',
 name: 'Loyal partner',
 description: 'Supports 3 or more active ministry tracks.',
 level: 'Supports 3 or more ministry tracks',
 iconColor: 'bg-indigo-500 dark:bg-indigo-600 dark:bg-indigo-500 text-white'
 },
 {
 type: 'kingdom_advocate',
 name: 'Kingdom advocate',
 description: 'Brought 3 friends who enrolled in the program.',
 level: 'Brought 3 friends who enrolled',
 iconColor: 'bg-rose-500 dark:bg-rose-600 dark:bg-rose-500 text-white'
 }
 ];

 const handleToggleAnswered = (id: string) => {
 const updatedCustom = customPrayers.map(p => {
 if (p.id === id) {
 return { ...p, isAnswered: !p.isAnswered };
 }
 return p;
 });
 setCustomPrayers(updatedCustom);
 localStorage.setItem('blf_custom_prayers_v2', JSON.stringify(updatedCustom));
 };

 const categoriesList = [
 'All',
 'Youth Outreach',
 'Media Frontiers',
 'Follow-up',
 'Discipleship',
 'Healing & Health',
 'Family & Peace',
 'Personal Faith'
 ];

 

 


  const primaryTrack = userSubs.length > 0 ? tracks.find(t => t.track_id === userSubs[0].track_id) : (tracks.find(t => t.track_id === 'general-fund') || tracks[0]);
  const costPerUnit = primaryTrack ? primaryTrack.cost_per_unit : 3.39;
  const primaryUnitLabel = primaryTrack ? getLocalizedTrackUnitLabel(primaryTrack.track_id, primaryTrack.target_unit_label, language) : "Souls/Messages";

  const IMPACT_MILESTONES = [
    { amount: Math.max(1, Math.round(250 / costPerUnit)), name: "Seed Sower", description: "Planted the first seeds of the Gospel.", icon: "Heart" },
    { amount: Math.max(5, Math.round(1000 / costPerUnit)), name: "Faith Builder", description: "Building a strong foundation for seekers.", icon: "Award" },
    { amount: Math.max(10, Math.round(3000 / costPerUnit)), name: "Gospel Partner", description: "Partnering in widespread ministry outreach.", icon: "Shield" },
    { amount: Math.max(50, Math.round(10000 / costPerUnit)), name: "Kingdom Champion", description: "Championing the kingdom with exceptional generosity.", icon: "Flame" },
    { amount: Math.max(100, Math.round(25000 / costPerUnit)), name: "Visionary Leader", description: "Leading the vision for a better life for many.", icon: "Award" },
  ];

  const currentMilestoneIndex = IMPACT_MILESTONES.findIndex(m => totalImpact < m.amount) === -1 
    ? IMPACT_MILESTONES.length - 1 
    : Math.max(0, IMPACT_MILESTONES.findIndex(m => totalImpact < m.amount) - 1);
    
  const nextMilestone = IMPACT_MILESTONES.find(m => totalImpact < m.amount) || IMPACT_MILESTONES[IMPACT_MILESTONES.length - 1];
  
  const currentMilestone = IMPACT_MILESTONES[currentMilestoneIndex];
  
  // Calculate percentage within current tier
  const prevAmount = totalImpact < IMPACT_MILESTONES[0].amount ? 0 : currentMilestone.amount;
  const targetAmount = totalImpact < IMPACT_MILESTONES[0].amount ? IMPACT_MILESTONES[0].amount : nextMilestone.amount;
  
  const progressPercentage = targetAmount === prevAmount ? 100 : Math.min(100, Math.round(((totalImpact - prevAmount) / (targetAmount - prevAmount)) * 100));

 return (
 <div id="dashboard-container" className="space-y-6 md:space-y-8 pb-8 px-4 sm:px-6 relative">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={500} recycle={false} onConfettiComplete={() => setShowConfetti(false)} style={{ zIndex: 9999, position: "fixed", top: 0, left: 0 }} />}
 


 {activeSubTab === 'dashboard' && (
  <>
    <div className="flex justify-end mb-4 pt-2">
      <div className="flex items-center gap-3 bg-editorial-card border border-editorial-charcoal/10 px-4 py-2 rounded-full shadow-sm">
        <span className="text-[12px] uppercase font-bold text-editorial-charcoal/70 tracking-widest">{isSimplifiedView ? "Detailed View" : "Simplified View"}</span>
        <button 
          onClick={() => setIsSimplifiedView(!isSimplifiedView)}
          className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${isSimplifiedView ? "bg-emerald-500 dark:bg-emerald-600" : "bg-editorial-charcoal/20"}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isSimplifiedView ? "left-6" : "left-0.5"}`} />
        </button>
      </div>
    </div>
    {isSimplifiedView ? (
  <div className="max-w-5xl mx-auto space-y-8">
    <div className="text-center py-6">
      <div className="flex flex-col items-center justify-center gap-2 mb-4">
        <h1 className="text-4xl sm:text-6xl font-serif text-editorial-charcoal">{t("Hello, ", "مرحباً، ")}{currentUser.name}</h1>
        <StreakBadge streak={currentUser.streak} />
      </div>
      <p className="text-2xl text-editorial-charcoal/60 font-sans">{t("Welcome to your dashboard", "مرحباً بك في لوحة تحكمك")}</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SimplifiedTile 
        icon={<Heart className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />} 
        title="Lives Touched" 
        value={Math.round(totalImpact).toLocaleString()}
        details={
    <div className="space-y-2">
      <p>Your faithful giving has translated directly into lives touched. This represents the total spiritual impact of your sowed seeds.</p>
      <button 
        onClick={(e) => { e.stopPropagation(); setShowAddTrackForm(true); }}
        className="mt-4 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:bg-emerald-800/40 dark:hover:bg-emerald-800/60 text-[10px] font-bold rounded-xl transition-colors w-full uppercase tracking-wider"
      >
        {t("Increase Your Impact", "ضاعف تأثيرك")}
      </button>
    </div>
  }
        colorClass="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/30"
        hoverClass="hover:shadow-md dark:hover:shadow-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-600"
        textClass="text-emerald-900 dark:text-emerald-400"
        iconBgClass="bg-emerald-200/50 dark:bg-emerald-900/50"
      />
      <SimplifiedTile 
        icon={<Calendar className="w-12 h-12 text-blue-600 dark:text-blue-400" />} 
        title="Monthly Gift" 
        value={`${activeCommitmentForPeriod.toLocaleString()} EGP`}
        details={
    <div className="space-y-2">
      <p>This is your recurring monthly commitment. Your consistent support enables the ministry to plan and execute outreach effectively.</p>
      <button 
        onClick={(e) => { 
          e.stopPropagation();
          if (userSubs.length > 0) {
            setLevelUpSub(userSubs[0]);
            setUpgradeAmount(userSubs[0].amount + (userSubs[0].frequency === 'annual' ? 600 : 50));
            setUpgradeSuccess(false);
          }
        }}
        className="mt-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:bg-blue-800/40 dark:hover:bg-blue-800/60 text-[10px] font-bold rounded-xl transition-colors w-full uppercase tracking-wider"
      >
        {t("Level up your gift", "قم بزيادة عطائك")}
      </button>
    </div>
  }
        colorClass="bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-800/30"
        hoverClass="hover:shadow-md dark:hover:shadow-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
        textClass="text-blue-900 dark:text-blue-400"
        iconBgClass="bg-blue-200/50 dark:bg-blue-900/50"
      />
      <SimplifiedTile 
        icon={<Globe className="w-12 h-12 text-amber-600 dark:text-amber-400" />} 
        title="Active Tracks" 
        value={userSubs.length.toString()}
        details={
          <div className="space-y-2 text-left mt-2">
            <p>{t("You are currently supporting:", "أنت تدعم حالياً:")}</p>
            <ul className="list-disc pl-5">
              {userSubs.map(sub => {
                const track = tracks.find(t => t.track_id === sub.track_id);
                return <li key={sub.subscription_id}>{track ? getLocalizedTrackName(track.track_id, track.name, language) : 'Unknown Track'} - {sub.amount} EGP</li>;
              })}
            </ul>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowAddTrackForm(true); }}
              className="mt-4 px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:bg-amber-800/40 dark:hover:bg-amber-800/60 text-[10px] font-bold rounded-xl transition-colors w-full uppercase tracking-wider"
            >
              {t("Add Track", "أضف مساراً")}
            </button>
          </div>
        }
        colorClass="bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-800/30"
        hoverClass="hover:shadow-md dark:hover:shadow-amber-900/20 hover:border-amber-300 dark:hover:border-amber-600"
        textClass="text-amber-900 dark:text-amber-400"
        iconBgClass="bg-amber-200/50 dark:bg-amber-900/50"
      />
      <SimplifiedTile 
        icon={<Video className="w-12 h-12 text-purple-600 dark:text-purple-400" />} 
        title="Watch Ministry News"
        details={
          <div className="space-y-2">
            <p>{t("Stay updated with the latest field reports, video updates, and praise reports from our ministry teams.", "ابق على اطلاع بآخر التقارير الميدانية وتحديثات الفيديو من فرق خدمتنا.")}</p>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsSimplifiedView(false); 
                setTimeout(() => document.getElementById('dashboard-field-updates')?.scrollIntoView({ behavior: 'smooth' }), 100); 
              }}
              className="mt-4 px-4 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:bg-purple-800/40 dark:hover:bg-purple-800/60 text-[10px] font-bold rounded-xl transition-colors w-full uppercase tracking-wider"
            >
              {t("Watch Updates", "شاهد التحديثات")}
            </button>
          </div>
        }
        colorClass="bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-800/30"
        hoverClass="hover:shadow-md dark:hover:shadow-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600"
        textClass="text-purple-900 dark:text-purple-400"
        iconBgClass="bg-purple-200/50 dark:bg-purple-900/50"
      />
      <SimplifiedTile 
        icon={<MessageSquare className="w-12 h-12 text-rose-600 dark:text-rose-400" />} 
        title="Testimony"
        details={
          <p className="italic text-sm">
             "I grew up hearing about God but never felt close. After watching one of your online broadcast videos, I reached out to the follow-up counseling team on WhatsApp. For three weeks, they answered my doubts with patience and love. Last Tuesday, I took my first true step in faith. I finally feel peace in my heart."
          </p>
        }
        colorClass="bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-800/30"
        hoverClass="hover:shadow-md dark:hover:shadow-rose-900/20 hover:border-rose-300 dark:hover:border-rose-600"
        textClass="text-rose-900 dark:text-rose-400"
        iconBgClass="bg-rose-200/50 dark:bg-rose-900/50"
      />
      <SimplifiedTile 
        icon={<PhoneIcon className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />} 
        title="Contact Us"
        details={
          <div className="space-y-2">
            <p>{t("We'd love to hear from you. Reach out to our partner care team.", "نود التواصل معك. تواصل مع فريق رعاية شركاء الخدمة.")}</p>
            <a href="tel:+201234567890" className="inline-block bg-indigo-600 text-white dark:bg-indigo-500 dark:bg-indigo-600 dark:bg-indigo-500 px-4 py-2 rounded-lg font-bold">{t("Call +201234567890", "اتصل بنا +201234567890")}</a>
          </div>
        }
        colorClass="bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-800/30"
        hoverClass="hover:shadow-md dark:hover:shadow-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-600"
        textClass="text-indigo-900 dark:text-indigo-400"
        iconBgClass="bg-indigo-200/50 dark:bg-indigo-900/50"
      />
      
      <div className="md:col-span-2 lg:col-span-3">
        <button 
          onClick={() => setShowAddTrackForm(true)}
          className="w-full bg-gradient-to-r from-orange-100 dark:from-orange-950/40 to-amber-100 dark:to-amber-950/40 rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-8 shadow-sm border-2 border-orange-200 dark:border-orange-800/40 hover:shadow-lg hover:border-orange-400 hover:scale-[1.01] transition-all duration-300 cursor-pointer group"
        >
          <div className="p-6 bg-orange-200/50 dark:bg-orange-900/50 rounded-full group-hover:bg-orange-500 dark:group-hover:bg-orange-600 transition-colors duration-300">
            <Plus className="w-12 h-12 text-orange-600 dark:text-orange-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-orange-900 tracking-tight mb-2 group-hover:text-orange-700 dark:text-orange-400 transition-colors">{t("Make a New Gift", "تبرع جديد")}</h2>
            <p className="text-orange-900 dark:text-orange-300/80 font-medium text-lg">{t("Support another ministry track or give a one-time gift.", "ادعم مسار خدمة آخر أو قدم عطاء لمرة واحدة.")}</p>
          </div>
        </button>
      </div>
    </div>
  </div>
) : (
  <>
    {/* 1. Welcoming Header Hero section */}
 <section 
  id="dashboard-header" 
  className="mb-6 md:mb-8"
>
  <div className="flex items-center gap-2 group relative w-max">
    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-editorial-charcoal tracking-tight leading-tight flex items-center">
      {t("Welcome, ", "مرحباً، ")}{currentUser.name}
      <StreakBadge streak={currentUser.streak} />
    </h2>
    <div className="relative flex items-center justify-center cursor-help z-50">
      <Info className="w-5 h-5 text-editorial-charcoal/40 hover:text-emerald-700 dark:text-emerald-400 transition-colors" />
      <div className="absolute top-full left-0 mt-2 w-64 md:w-80 bg-editorial-charcoal text-editorial-cream text-xs font-sans rounded-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 text-left shadow-lg pointer-events-none">
        Welcome to your Better Life Partner Dashboard. Here you can support the ministry projects God has placed on your heart, manage your donations, and track your giving.
      </div>
    </div>
  </div>
</section>

 {/* 3. Ministry Field Updates (Beautiful, Professional Grid without Filter Pills) */}
 <section id="dashboard-field-updates" className="space-y-8 text-left bg-editorial-soft/10 border border-editorial-charcoal/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 dark:bg-amber-800/40/5 rounded-full blur-2xl pointer-events-none" />
 <div className="border-b border-editorial-charcoal/10 pb-6">
 
 <h3 className="text-3xl font-serif text-editorial-charcoal mt-3">{t("Ministry Field Updates", "آخر مستجدات الخدمة")}</h3>
 
 </div>

 {/* Grid of Updates */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {isLoadingUpdates ? (
   Array.from({ length: 3 }).map((_, i) => (
     <div key={i} className="bg-editorial-card border border-editorial-charcoal/10 rounded-2xl overflow-hidden flex flex-col shadow-xs animate-pulse">
       <div className="h-40 bg-editorial-charcoal/10"></div>
       <div className="p-5 flex flex-col flex-grow text-left">
         <div className="h-4 bg-editorial-charcoal/10 rounded w-3/4 mb-4"></div>
         <div className="h-4 bg-editorial-charcoal/10 rounded w-1/2 mb-4"></div>
         <div className="mt-auto flex justify-end">
           <div className="h-3 bg-editorial-charcoal/10 rounded w-12"></div>
         </div>
       </div>
     </div>
   ))
 ) : (
 updates
 .filter(post => updateCategoryFilter === 'All' || post.category === updateCategoryFilter)
 .map((post) => {
 const id = `post-${post.post_id}`;
 const likes = updateLikes[id] || 0;
 const hasLiked = !!userLikedUpdates[id];
 return (
 <div 
 key={post.post_id} 
 onClick={() => setSelectedUpdate(post)}
 className="bg-editorial-card border border-editorial-charcoal/10 rounded-2xl overflow-hidden flex flex-col hover:border-editorial-charcoal/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 shadow-xs cursor-pointer group relative"
 >
 {/* Card Image header */}
 <div className="h-40 relative overflow-hidden shrink-0 border-b border-editorial-charcoal/5 bg-editorial-sand">
  <img 
    src={post.media_url || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&auto=format&fit=crop&q=80'} 
    alt={post.title} 
    referrerPolicy="no-referrer"
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
  />
  <span className="absolute top-3 left-3 text-[8px] font-bold uppercase tracking-widest bg-editorial-cream text-editorial-charcoal px-3 py-2 rounded-md border border-editorial-charcoal/10 shadow-sm">
    {post.category}
  </span>
</div>
<div className="p-5 flex flex-col justify-between flex-grow text-left bg-editorial-card">
  <h4 className="text-sm font-serif font-bold text-editorial-charcoal group-hover:text-amber-800 dark:text-amber-300 transition-colors line-clamp-2 leading-snug mb-4">
    {post.title}
  </h4>
  <div className="flex items-center justify-end text-[10px] border-t border-editorial-charcoal/5 pt-3.5 mt-auto">
    <span className="text-[10px] text-editorial-charcoal/70 group-hover:text-editorial-charcoal font-bold tracking-widest flex items-center gap-0.5">
      <span>{t("Read", "قراءة")}</span>
      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
    </span>
  </div>
</div>
</div>
);
})
)}
 </div>
 </section>

<section id="dashboard-testimonies" className="space-y-4">
  {isLoadingUpdates ? (
    <div className="relative bg-editorial-cream dark:bg-editorial-card border border-editorial-charcoal/10 rounded-3xl shadow-xs overflow-hidden flex flex-col md:flex-row animate-pulse min-h-[300px]">
      <div className="p-8 md:p-12 flex-1 flex flex-col justify-center items-start space-y-4">
        <div className="w-32 h-6 bg-editorial-charcoal/10 rounded-full mb-2"></div>
        <div className="w-full h-4 bg-editorial-charcoal/10 rounded"></div>
        <div className="w-full h-4 bg-editorial-charcoal/10 rounded"></div>
        <div className="w-3/4 h-4 bg-editorial-charcoal/10 rounded"></div>
        <div className="flex items-center space-x-3 pt-6 mt-4">
          <div className="w-10 h-10 rounded-full bg-editorial-charcoal/10"></div>
          <div className="space-y-2">
            <div className="w-20 h-3 bg-editorial-charcoal/10 rounded"></div>
            <div className="w-16 h-2 bg-editorial-charcoal/10 rounded"></div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-[40%] bg-editorial-charcoal/5 h-64 md:h-auto"></div>
    </div>
  ) : (
  <div className="relative bg-editorial-cream dark:bg-editorial-card border border-editorial-charcoal/10 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
    
    <div className="p-8 md:p-12 flex-1 flex flex-col justify-center items-start text-left relative min-h-[300px]">
       {/* Symmetrical Elegant Backdrop Elements */}
       <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500 dark:bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
       
       <span className="text-[10px] uppercase tracking-widest font-bold text-amber-900 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-950/30 px-4 py-1.5 rounded-full border border-amber-500/20 dark:border-amber-800/30 shadow-xs mb-6 relative z-10">
         {t("Testimony of the Month", "شهادة الشهر")}
       </span>
       
       <p className="text-base sm:text-lg md:text-xl font-serif italic text-editorial-charcoal leading-relaxed max-w-2xl relative z-10">
          {t(
            "I grew up hearing about God but never felt close. After watching one of your online broadcast videos, I reached out to the follow-up counseling team on WhatsApp. For three weeks, they answered my doubts with patience and love. Last Tuesday, I took my first true step in faith. I finally feel peace in my heart.",
            "نشأت وأنا أسمع عن الله ولكنني لم أشعر بالقرب منه قط. بعد مشاهدة أحد فيديوهاتكم على الإنترنت، تواصلت مع فريق المتابعة عبر الواتساب. ولمدة ثلاثة أسابيع، أجابوا على شكوكي بصبر ومحبة. يوم الثلاثاء الماضي، اتخذت خطوتي الأولى الحقيقية في الإيمان. أخيرًا أشعر بالسلام في قلبي."
          )}
       </p>
       
       <div className="flex items-center space-x-3 rtl:space-x-reverse pt-6 mt-auto relative z-10">
          <div className="w-10 h-10 rounded-full bg-editorial-charcoal/5 flex items-center justify-center font-serif text-editorial-charcoal font-bold text-sm border border-editorial-charcoal/10 shadow-xs">
            M
          </div>
          <div>
            <cite className="text-xs font-bold text-editorial-charcoal not-italic block">{t("Maryam", "مريم")}</cite>
            <span className="text-[10px] text-editorial-charcoal/50 font-sans block mt-0.5">{t("Cairo, Egypt", "القاهرة، مصر")}</span>
          </div>
       </div>
    </div>
    
    <div className="w-full md:w-[40%] min-h-[250px] md:min-h-auto relative shrink-0">
       <img 
          src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1287&auto=format&fit=crop" 
          alt="Testimony"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
       />
       <div className="absolute inset-0 bg-gradient-to-r from-editorial-cream via-editorial-cream/20 to-transparent md:block hidden"></div>
       <div className="absolute inset-0 bg-gradient-to-t from-editorial-cream via-editorial-cream/20 to-transparent md:hidden block"></div>
    </div>
  </div>
  )}
</section>



 

{/* 2. Simplified Kingdom Metrics Section */}
 <section id="kingdom-impact" className="bg-editorial-card border border-editorial-charcoal/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm mb-6 md:mb-8 space-y-10">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-editorial-charcoal/10 pb-6">
 <div className="space-y-1.5 text-left">
 <span className="text-[9px] uppercase font-extrabold tracking-widest text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-md inline-block">
 Kingdom Impact Focus
 </span>
 <div className="flex items-center gap-2">
  <h3 className="text-2xl font-serif font-light text-editorial-charcoal">{t("Your Active Gospel Footprint", "أثرك الكرازي النشط")}</h3>
  <div className="relative group flex items-center">
    <Info className="w-4 h-4 text-editorial-charcoal/40 hover:text-editorial-charcoal cursor-help transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-editorial-charcoal text-editorial-cream text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center shadow-xl">
      {t("A pure, simple view of the lives sowed and hearts reached through your partnership.", "نظرة بسيطة وواضحة على النفوس التي زُرعت والقلوب التي تم الوصول إليها من خلال شراكتك.")}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-editorial-charcoal"></div>
    </div>
  </div>
</div>
 </div>
 
 <div className="flex items-center gap-1 bg-editorial-soft/40 border border-editorial-charcoal/10 p-1 rounded-full self-start md:self-auto shrink-0">
 <button
 type="button"
 onClick={() => setRollingPeriod(30)}
 className={`px-4 py-2.5 md:py-1.5 text-[9px] uppercase tracking-wider font-bold rounded-full transition-all cursor-pointer ${
 rollingPeriod === 30 ? 'bg-editorial-charcoal text-editorial-cream shadow-sm' : 'text-editorial-charcoal/60 hover:text-editorial-charcoal'
 }`}
 >
 30 Days
 </button>
 <button
 type="button"
 onClick={() => setRollingPeriod(90)}
 className={`px-4 py-2.5 md:py-1.5 text-[9px] uppercase tracking-wider font-bold rounded-full transition-all cursor-pointer ${
 rollingPeriod === 90 ? 'bg-editorial-charcoal text-editorial-cream shadow-sm' : 'text-editorial-charcoal/60 hover:text-editorial-charcoal'
 }`}
 >
 90 Days
 </button>
 <button
 type="button"
 onClick={() => setRollingPeriod(365)}
 className={`px-4 py-2.5 md:py-1.5 text-[9px] uppercase tracking-wider font-bold rounded-full transition-all cursor-pointer ${
 rollingPeriod === 365 ? 'bg-editorial-charcoal text-editorial-cream shadow-sm' : 'text-editorial-charcoal/60 hover:text-editorial-charcoal'
 }`}
 >
 12 Months
 </button>
 </div>
 </div>

 {/* Simple Onboarding-Style Metric Grid (3 clean cards with beautiful negative space) */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 
 {/* Card 1: Active Commitment */}
 <div className="bg-editorial-soft/20 border border-editorial-charcoal/5 rounded-2xl p-6 text-left flex flex-col justify-between min-h-[140px] transition-all hover:bg-editorial-soft/30">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <Heart className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
 <p className="text-[10px] uppercase font-bold text-editorial-charcoal/50 tracking-wider">{t("Active Commitment", "التزامك النشط")}<span className="lowercase font-normal text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 px-1 rounded">(annual)</span></p>
 </div>
 <div className="text-3xl font-serif italic text-editorial-charcoal pt-2">
 <AnimateNumber value={activeCommitmentForPeriod} /> <span className="text-xs uppercase font-sans font-bold text-editorial-charcoal/40">{t("EGP", "جنيه")}</span>
 </div>
 </div>
 {activeCommitmentForPeriod === 0 && (
 <button
 type="button"
 onClick={() => setShowAddTrackForm(true)}
 className="mt-4 w-full py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-[9px] uppercase tracking-widest font-bold rounded-xl transition-all cursor-pointer"
 >
 Start Partnering
 </button>
 )}
 </div>

 {/* Card 2: Souls Reached */}
 <div className="bg-editorial-soft/20 border border-editorial-charcoal/5 rounded-2xl p-6 text-left flex flex-col justify-between min-h-[140px] transition-all hover:bg-editorial-soft/30">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <TrendingUp className="w-4 h-4 text-editorial-charcoal/70" />
 <p className="text-[10px] uppercase font-bold text-editorial-charcoal/50 tracking-wider">{t("Estimated Souls Reached", "النفوس المتوقع الوصول إليها")}</p>
 </div>
 <div className="text-3xl font-serif italic text-editorial-charcoal pt-2">
 ~{Math.round(accumulatedSouls).toLocaleString()}
 </div>
 </div>
 {totalExpectedSouls === 0 && (
 <button
 type="button"
 onClick={() => setShowAddTrackForm(true)}
 className="mt-4 w-full py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-[9px] uppercase tracking-widest font-bold rounded-xl transition-all cursor-pointer"
 >
 Give Now
 </button>
 )}
 </div>

 {/* Card 3: Faithful Streak */}
 <div className="bg-editorial-soft/20 border border-editorial-charcoal/5 rounded-2xl p-6 text-left flex flex-col justify-between min-h-[140px] transition-all hover:bg-editorial-soft/30">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
 <p className="text-[10px] uppercase font-bold text-editorial-charcoal/50 tracking-wider">{t("Faithful Streak", "مدة الأمانة المستمرة")}</p>
 </div>
 <div className="text-3xl font-serif italic text-editorial-charcoal pt-2">
 {currentUser.streak} <span className="text-xs uppercase font-sans font-bold text-editorial-charcoal/40">{t("Months", "أشهر")}</span>
 </div>
 </div>
 </div>

 </div>
 {/* Active Subscriptions Card list */}
 <div className="bg-editorial-card/75 border border-editorial-charcoal/10 rounded-2xl p-6 space-y-6">
 <div className="flex items-center justify-between border-b border-editorial-charcoal/10 pb-4">
 <div>
 <h3 className="text-xl font-serif italic font-light text-editorial-charcoal">{t("My Active Tracks", "مساراتي المفعلة")}</h3>
 <p className="text-xs text-editorial-charcoal/60 font-sans mt-1">{t("Your scheduled monthly/annual media operations", "عطاياك المجدولة الشهرية أو السنوية لعمليات الميديا")}</p>
 </div>
 <div className="flex items-center gap-2.5">
 <button
 onClick={() => setShowAddTrackForm(!showAddTrackForm)}
 className="px-3 py-1.5 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream text-[10px] uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
 >
 <Plus className="w-3.5 h-3.5" />
 <span>{showAddTrackForm ? "Cancel" : "Add Track"}</span>
 </button>
 <span className="text-[10px] uppercase font-bold tracking-widest bg-editorial-sand text-editorial-charcoal px-3 py-1.5 rounded-full font-mono">
 {userSubs.length} Active
 </span>
 </div>
 </div>

 <AnimatePresence>
 {showAddTrackForm && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="p-5 bg-editorial-soft/40 border border-editorial-charcoal/10 rounded-2xl space-y-4 overflow-hidden"
 >
 <h4 className="text-xs font-bold uppercase tracking-wider text-editorial-charcoal">
 Activate a New Partnership Track
 </h4>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Select Track */}
 <div className="space-y-1.5">
 <label className="text-[9px] uppercase font-bold tracking-wider text-editorial-charcoal/50">
 Select Track
 </label>
 <select
 value={selectedAddTrackId}
 onChange={(e) => {
 const trackId = e.target.value;
 setSelectedAddTrackId(trackId);
 const track = tracks.find(t => t.track_id === trackId);
 if (track) {
 setAddTrackAmount(track.min_monthly_gift);
 }
 }}
 className="w-full px-3.5 py-2 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-card focus:outline-none focus:border-editorial-charcoal cursor-pointer"
 >
 <option value="">-- Choose a Track --</option>
 {tracks.map((t) => {
 const isSubbed = userSubs.some(s => s.track_id === t.track_id);
 return (
 <option key={t.track_id} value={t.track_id}>
 {t.name} {isSubbed ? '(Already Active)' : ''}
 </option>
 );
 })}
 </select>
 </div>

 {/* Select Frequency */}
 <div className="space-y-1.5">
 <label className="text-[9px] uppercase font-bold tracking-wider text-editorial-charcoal/50">{t("Frequency", "التكرار")}</label>
 <div className="flex bg-editorial-card border border-editorial-charcoal/10 p-1 rounded-xl">
 <button
 type="button"
 onClick={() => {
 setAddTrackFrequency('monthly');
 const track = tracks.find(t => t.track_id === selectedAddTrackId);
 if (track) {
 setAddTrackAmount(track.min_monthly_gift);
 }
 }}
 className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all ${
 addTrackFrequency === 'monthly' ? 'bg-editorial-charcoal text-editorial-cream' : 'text-editorial-charcoal/60 hover:text-editorial-charcoal'
 }`}
 >{t("Monthly", "شهري")}</button>
 <button
 type="button"
 onClick={() => {
 setAddTrackFrequency('annual');
 const track = tracks.find(t => t.track_id === selectedAddTrackId);
 if (track) {
 setAddTrackAmount(track.min_monthly_gift * 12);
 }
 }}
 className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all ${
 addTrackFrequency === 'annual' ? 'bg-editorial-charcoal text-editorial-cream' : 'text-editorial-charcoal/60 hover:text-editorial-charcoal'
 }`}
 >{t("Annual", "سنوي")}</button>
 </div>
 </div>
 </div>

 {selectedAddTrackId && (
 <div className="space-y-3.5 pt-1">
 {/* Amount & Minimum Validation */}
 <div className="space-y-1.5">
 <label className="text-[9px] uppercase font-bold tracking-wider text-editorial-charcoal/50 flex justify-between">
 <span>{t("Commitment Amount (EGP)", "مبلغ الالتزام (جنيه)")}</span>
 <span className="text-[8px] text-editorial-charcoal/40 lowercase">
 min: {
 (tracks.find(t => t.track_id === selectedAddTrackId)?.min_monthly_gift || 50) * (addTrackFrequency === 'annual' ? 12 : 1)
 } EGP
 </span>
 </label>
 <input
 type="number"
 value={addTrackAmount || ''}
 onChange={(e) => setAddTrackAmount(Number(e.target.value))}
 className="w-full px-3.5 py-2 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-card focus:outline-none focus:border-editorial-charcoal font-mono"
 />
 </div>

 {/* Submit Button */}
 <div className="flex justify-end pt-1">
 <button
 type="button"
 onClick={() => {
 const track = tracks.find(t => t.track_id === selectedAddTrackId);
 if (!track) return;
 const min = track.min_monthly_gift * (addTrackFrequency === 'annual' ? 12 : 1);
 if (addTrackAmount < min) {
 alert(`The minimum gift for ${getLocalizedTrackName(track.track_id, track.name, language)} is ${min} EGP. Please adjust.`);
 return;
 }
 setShowAddTrackForm(false);
 onDonateClick(track, addTrackAmount, addTrackFrequency);
 }}
 className="px-5 py-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-[10px] uppercase tracking-widest font-bold rounded-xl transition-all cursor-pointer shadow-xs"
 >
 Add to Partnership &rarr;
 </button>
 </div>
 </div>
 )}
 </motion.div>
 )}
 </AnimatePresence>

 {userSubs.length === 0 ? (
 <div className="text-center py-6 space-y-4 bg-editorial-soft/20 rounded-2xl border border-dashed border-editorial-charcoal/15">
 <Heart className="w-8 h-8 text-editorial-charcoal/30 mx-auto" />
 <p className="text-sm font-bold text-editorial-charcoal/70">{t("No active tracks found.", "لا توجد مسارات نشطة.")}</p>
 <p className="text-xs text-editorial-charcoal/50 max-w-xs mx-auto font-serif italic mb-2">{t("You haven't enrolled in any active tracks yet.", "لم تشترك في أي مسارات نشطة بعد.")}</p>
 <button
 onClick={() => setShowAddTrackForm(true)}
 className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream text-[10px] uppercase tracking-widest font-bold rounded-full transition-all cursor-pointer shadow-sm"
 >
 <Plus className="w-3.5 h-3.5" />
 <span>{t("Start Partnering Now", "ابدأ شراكتك الآن")}</span>
 </button>
 </div>
 ) : (
 <div className="space-y-4.5">
 {userSubs.map((sub) => {
 const track = tracks.find(t => t.track_id === sub.track_id);
 if (!track) return null;
 
 // Calculate units based on rollingPeriod
 const { monthlyUnits, annualUnits } = calculateSubscriptionImpact(track, sub.amount, sub.frequency);
 
 let units = monthlyUnits;
 if (rollingPeriod === 90) {
 units = monthlyUnits * 3;
 } else if (rollingPeriod === 365) {
 units = annualUnits;
 }

 // Normalize commitment display to match selected rollingPeriod
 const monthlyAmount = sub.frequency === 'monthly' ? sub.amount : Math.round(sub.amount / 12);
 
 let displayAmount = monthlyAmount;
 if (rollingPeriod === 90) {
 displayAmount = monthlyAmount * 3;
 } else if (rollingPeriod === 365) {
 displayAmount = sub.frequency === 'annual' ? sub.amount : sub.amount * 12;
 }

 return (
 <div 
 key={sub.subscription_id}
 className="p-5 border border-editorial-charcoal/10 bg-editorial-cream/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-editorial-charcoal/20 transition-all duration-300"
 >
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 border border-editorial-charcoal/20 bg-editorial-soft text-editorial-charcoal font-serif italic text-base font-bold flex items-center justify-center shrink-0 rounded-full">
 {track.letter}
 </div>
 <div>
 <h4 className="text-sm font-serif font-bold text-editorial-charcoal">{getLocalizedTrackName(track.track_id, track.name, language)}</h4>
 <p className="text-[10px] font-bold text-editorial-charcoal/60 uppercase tracking-wider font-mono mt-0.5">
 {displayAmount.toLocaleString()} EGP / {rollingPeriod === 30 ? '30 days' : rollingPeriod === 90 ? '90 days' : 'year'}
 {sub.frequency !== (rollingPeriod === 365 ? 'annual' : 'monthly') && (
 <span className="text-[9px] lowercase italic text-editorial-charcoal/40 ml-1">
 (committed {sub.frequency}ly)
 </span>
 )}
 {' '}·{' '}<span className="font-serif italic font-medium capitalize text-editorial-charcoal/90">{getTierName(sub.frequency === 'annual' ? sub.amount / 12 : sub.amount)}</span>
 </p>
 </div>
 </div>

 {/* Impact translation in bullet */}
 <div className="text-left sm:text-right">
 <p className="text-[9px] text-editorial-charcoal/40 uppercase font-bold tracking-widest">
 {rollingPeriod === 30 && '30-Day Impact'}
 {rollingPeriod === 90 && '90-Day Impact'}
 {rollingPeriod === 365 && '12-Month Impact'}
 </p>
 <p className="text-xs font-bold text-editorial-charcoal font-serif italic mt-0.5">
 ~{Math.round(units).toLocaleString()} {track.target_unit_label}
 </p>
 </div>

 {/* Upgrade / Level Up trigger button */}
 <div className="flex items-center gap-2">
 <button
 onClick={() => handleOpenUpgrade(sub)}
 className="px-4 py-2 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream text-[10px] uppercase tracking-wider font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
 >
 <span>{t("Level Up", "ارتقِ بمستواك")}</span>
 <ArrowUpRight className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Cumulative Lifetime Totals Banner (Visual and Simple) */}
 <div className="pt-6 border-t border-editorial-charcoal/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
 <div className="space-y-0.5">
 <span className="text-[8px] uppercase tracking-wider font-extrabold text-editorial-charcoal/40 block">{t("Cumulative Gospel Backing", "إجمالي دعمك للكرازة")}</span>
 <p className="text-sm font-sans text-editorial-charcoal/70">
 Your total backing has touched approximately <strong className="text-emerald-800 dark:text-emerald-300 font-serif italic text-base">~{totalImpact.toLocaleString()} souls</strong> over your entire partnership journey.
 </p>
 </div>
 <button
 type="button"
 onClick={() => openMethodology(null)}
 className="px-4 py-2 bg-editorial-charcoal text-editorial-cream hover:bg-editorial-charcoal/90 text-[10px] uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer shadow-xs shrink-0 inline-flex items-center gap-1.5"
 >
 <Info className="w-3.5 h-3.5" />
 <span>{t("Our Calculations", "كيف نحسب الأثر؟")}</span>
 </button>
 </div>
 </section>

 
          {/* Milestone Progress Section */}
          <section id="milestone-progress" className="bg-editorial-card border border-editorial-charcoal/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm mb-6 md:mb-8 space-y-8">
            <div className="space-y-1.5 text-left border-b border-editorial-charcoal/10 pb-6">
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-md inline-block">
                Partnership Milestones
              </span>
              <div className="flex items-center gap-2">
  <h3 className="text-2xl font-serif font-light text-editorial-charcoal">{t("Giving Journey & Rewards", "رحلة العطاء والمكافآت")}</h3>
  {!isSimplifiedView && (
    <div className="relative group flex items-center">
      <Info className="w-4 h-4 text-editorial-charcoal/40 hover:text-editorial-charcoal cursor-help transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-editorial-charcoal text-editorial-cream text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center shadow-xl">
        {t("Visual milestones honoring your cumulative generosity and kingdom impact over time.", "معالم مرئية تكرم سخاءك التراكمي وتأثيرك في الملكوت بمرور الوقت.")}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-editorial-charcoal"></div>
      </div>
    </div>
  )}
</div>
            </div>

            <div className="space-y-8">
              {/* Overall Progress Indicator */}
              <div className="bg-editorial-soft/20 rounded-2xl p-6 border border-editorial-charcoal/5 flex flex-col md:flex-row items-center gap-6 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 dark:bg-amber-800/40/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-editorial-charcoal/50 tracking-wider">{t("Total Lives Touched", "إجمالي النفوس التي لمستها")}</p>
                      <p className="text-2xl font-serif italic text-editorial-charcoal">
                        <AnimateNumber value={totalImpact} /> <span className="text-xs uppercase font-sans font-bold text-editorial-charcoal/40">{primaryUnitLabel}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-editorial-charcoal/50 tracking-wider">{t("Next Milestone", "هدفك القادم")}</p>
                      <p className="text-lg font-serif italic text-editorial-charcoal/80">
                        {nextMilestone.amount.toLocaleString()} <span className="text-[10px] uppercase font-sans font-bold text-editorial-charcoal/40">{primaryUnitLabel}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-3 bg-editorial-charcoal/10 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-emerald-600 dark:bg-emerald-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                  
                  <p className="text-xs text-editorial-charcoal/60">
                    {totalImpact >= IMPACT_MILESTONES[IMPACT_MILESTONES.length - 1].amount ? 
                      "You have reached the highest milestone! Thank you for your incredible generosity." : 
                      `${(targetAmount - totalImpact).toLocaleString()} {primaryUnitLabel} to reach ${nextMilestone.name}`
                    }
                  </p>
                </div>
              </div>

              {/* Milestone Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {IMPACT_MILESTONES.map((milestone, idx) => {
                  const isAchieved = totalImpact >= milestone.amount;
                  const isNext = !isAchieved && (idx === 0 || totalImpact >= IMPACT_MILESTONES[idx-1].amount);
                  
                  return (
                    <div 
                      key={milestone.name}
                      className={`relative rounded-2xl p-5 border text-center flex flex-col items-center justify-center space-y-3 transition-all duration-300 ${
                        isAchieved 
                          ? 'bg-editorial-charcoal border-editorial-charcoal text-editorial-cream shadow-md' 
                          : isNext 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-editorial-charcoal shadow-sm'
                            : 'bg-editorial-soft/10 border-editorial-charcoal/5 text-editorial-charcoal/40 opacity-70 grayscale'
                      }`}
                    >
                      {/* Badge Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isAchieved ? 'bg-editorial-cream/10 text-editorial-cream' : 
                        isNext ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-editorial-charcoal/5 text-editorial-charcoal/30'
                      }`}>
                        {milestone.icon === 'Heart' && <Heart className="w-5 h-5" />}
                        {milestone.icon === 'Award' && <Award className="w-5 h-5" />}
                        {milestone.icon === 'Shield' && <Shield className="w-5 h-5" />}
                        {milestone.icon === 'Flame' && <Flame className="w-5 h-5" />}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider">{milestone.name}</p>
                        <p className={`text-[10px] ${isAchieved ? 'text-editorial-cream/70' : 'text-editorial-charcoal/50'}`}>
                          {milestone.amount.toLocaleString()} {primaryUnitLabel}
                        </p>
                      </div>
                      
                      {isAchieved && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-amber-900 dark:text-amber-300" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

  {/* Featured Testimony of the Month (Professional Minimalist Testimonial Card) */}
 
{/* Ministry Family Quarterly Updates */}
<section id="ministry-family-updates" className="bg-editorial-card border border-editorial-charcoal/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm mb-6 md:mb-8 space-y-6">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-editorial-charcoal/10 pb-4 mb-4 gap-4">
    <div className="text-left space-y-1">
      <h3 className="text-2xl font-serif text-editorial-charcoal">{t("Ministry Family Quarterly Updates", "تحديثات ربع سنوية لعائلة الخدمة")}</h3>
      {!isSimplifiedView && <p className="text-xs text-editorial-charcoal/60 font-sans">{t("A special space for our closest ministry partners.", "مساحة خاصة لأقرب شركاء خدمتنا.")}</p>}
    </div>
    <div className="flex gap-3">
      <button className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-[10px] tracking-wider uppercase hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2">
        <Video className="w-3.5 h-3.5" /> Join Next Zoom
      </button>
    </div>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="rounded-2xl overflow-hidden relative h-64 bg-editorial-charcoal/5 border border-editorial-charcoal/10 flex items-center justify-center group cursor-pointer">
      <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80" alt="Quarterly Update Video" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80 transition-transform duration-700 group-hover:scale-105" />
      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center relative z-10 border border-white/50 group-hover:bg-white/30 transition-colors">
        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[12px] border-l-white border-b-8 border-b-transparent ml-1" />
      </div>
    </div>
    <div className="flex flex-col justify-center text-left space-y-4">
      <h4 className="text-lg font-bold text-editorial-charcoal font-serif">{t("Q3 2026 Impact Report", "تقرير أثر الربع الثالث 2026")}</h4>
      <p className="text-sm text-editorial-charcoal/70 font-sans leading-relaxed">
        Watch our leadership team share exactly how your giving has transformed lives this quarter. Hear exclusive testimonies that we cannot share publicly, and pray with us for the upcoming outreach season.
      </p>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 inline-block px-3 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
        <Calendar className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" /> Next Live Zoom: Oct 15th
      </div>
    </div>
  </div>
</section>

{/* Connect with the Ministry */}
<section id="connect-with-ministry" className="bg-editorial-soft/20 border border-editorial-charcoal/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm mb-6 md:mb-8 text-left">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <div className="lg:col-span-5 space-y-4">
      <div className="flex items-center gap-2">
  <h3 className="text-2xl font-serif text-editorial-charcoal">{t("Connect With Us", "تواصل معنا")}</h3>
  {!isSimplifiedView && (
    <div className="relative group flex items-center">
      <Info className="w-4 h-4 text-editorial-charcoal/40 hover:text-editorial-charcoal cursor-help transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-editorial-charcoal text-editorial-cream text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center shadow-xl">
        {t("Have questions? Want to share a testimony? Our ministry team would love to hear from you. Send us a message directly.", "هل لديك أسئلة؟ هل تريد مشاركة شهادة؟ فريق خدمتنا يود الاستماع منك. أرسل لنا رسالة مباشرة.")}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-editorial-charcoal"></div>
      </div>
    </div>
  )}
</div>
      <div className="pt-4 space-y-3">
        <div className="flex items-center gap-3 text-sm text-editorial-charcoal/80 font-medium">
          <div className="w-8 h-8 rounded-full bg-editorial-charcoal/5 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <Mail className="w-4 h-4" />
          </div>
          partners@betterlife.org
        </div>
        <div className="flex items-center gap-3 text-sm text-editorial-charcoal/80 font-medium">
          <div className="w-8 h-8 rounded-full bg-editorial-charcoal/5 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <PhoneIcon className="w-4 h-4" />
          </div>
          +20 123 456 7890
        </div>
      </div>
    </div>
    <div className="lg:col-span-7">
      <form className="space-y-4 bg-editorial-card p-6 rounded-2xl border border-editorial-charcoal/10 shadow-xs" onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-editorial-charcoal/60 tracking-wider">{t("Your Name", "الاسم")}</label>
            <input type="text" className="w-full bg-editorial-sand/30 border border-editorial-charcoal/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400" placeholder={t("John Doe", "الاسم بالكامل")} defaultValue={currentUser.name} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-editorial-charcoal/60 tracking-wider">{t("Subject", "الموضوع")}</label>
            <input type="text" className="w-full bg-editorial-sand/30 border border-editorial-charcoal/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400" placeholder={t("How can we help?", "كيف يمكننا مساعدتك؟")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-editorial-charcoal/60 tracking-wider">{t("Message", "الرسالة")}</label>
          <textarea className="w-full bg-editorial-sand/30 border border-editorial-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 h-28 resize-none" placeholder={t("Write your message here...", "اكتب رسالتك هنا...")}></textarea>
        </div>
        <button type="submit" className="w-full bg-editorial-charcoal text-editorial-cream py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-editorial-charcoal/90 transition-colors flex items-center justify-center gap-2">
          <Send className="w-4 h-4" /> Send Message
        </button>
      </form>
    </div>
  </div>
</section>

{/* 4. Main content splits */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

{/* Left Column: Subscribed Tracks & Level Up recommendations */}
<div className="lg:col-span-12 space-y-12 sm:space-y-16">

{/* Partnership Tiers Overview */}
<div className="bg-editorial-card border border-editorial-charcoal/10 rounded-2xl p-6 space-y-6 shadow-xs">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
<div>
<div className="flex items-center gap-2">
  <h3 className="text-lg font-serif font-bold text-editorial-charcoal">{t("Partnership Tiers", "مستويات الشراكة")}</h3>
  <div className="relative group flex items-center">
    <Info className="w-4 h-4 text-editorial-charcoal/40 hover:text-editorial-charcoal cursor-help transition-colors" />
    <div className="absolute bottom-full left-0 md:left-1/2 md:-translate-x-1/2 mb-2 w-64 p-2 bg-editorial-charcoal text-editorial-cream text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center shadow-xl">
      {t("How our community of friends unites to support Arabic media evangelism", "كيف يتحد مجتمع أصدقائنا لدعم الكرازة عبر الإعلام العربي")}
      <div className="absolute top-full left-4 md:left-1/2 md:-translate-x-1/2 -mt-1 border-4 border-transparent border-t-editorial-charcoal"></div>
    </div>
  </div>
</div>
</div>
<button onClick={() => setShowOtherTiers(!showOtherTiers)}
 className="px-4 py-2 border border-editorial-charcoal/15 text-editorial-charcoal hover:bg-editorial-soft/30 text-[10px] uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
 >
 <span>{showOtherTiers ? "Show Less" : "Level Up Tier"}</span>
 <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${showOtherTiers ? 'rotate-90' : ''}`} />
 </button>
 </div>

 {/* Current Tier card */}
 <div className="p-5 bg-editorial-cream/15 border border-editorial-charcoal/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-editorial-charcoal text-editorial-cream flex items-center justify-center text-sm font-serif font-bold rounded-full shrink-0 shadow-sm uppercase">
 {currentTier ? currentTier.name.charAt(0) : "S"}
 </div>
 <div>
 <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-editorial-charcoal/40">{t("Your Current Level", "مستواك الحالي")}</span>
 <h4 className="text-base font-serif font-bold text-editorial-charcoal mt-0.5">
 {currentTier ? currentTier.name : "Supporter"}
 </h4>
 <p className="text-xs text-editorial-charcoal/60 mt-1 leading-relaxed max-w-md">
 {currentTier ? currentTier.desc : "Establish a monthly or annual commitment to unlock partnership levels and accelerate localized broadcasts."}
 </p>
 </div>
 </div>

 <div className="bg-editorial-card border border-editorial-charcoal/5 rounded-xl px-5 py-4 min-w-[220px] flex flex-row md:flex-col justify-between md:justify-center gap-3">
 <div>
 <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-editorial-charcoal/40 block">{t("Current Commitment", "التزامك الحالي")}</span>
 <span className="text-sm font-mono font-bold text-editorial-charcoal mt-0.5 block">
 {viewMode === 'monthly'
 ? `${currentCommitmentMonthly.toLocaleString()} EGP / mo`
 : `${currentCommitmentAnnual.toLocaleString()} EGP / yr`
 }
 </span>
 </div>
 {currentTier && (
 <div className="border-l md:border-l-0 md:border-t border-editorial-charcoal/10 pl-3 md:pl-0 md:pt-2">
 <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-editorial-charcoal/40 block">{t("Projected Reach", "الوصول المتوقع")}</span>
 <span className="text-xs font-serif font-bold text-emerald-800 dark:text-emerald-300 italic block mt-0.5">
 {viewMode === 'monthly'
 ? `~${currentTier.impactMonthlyVal.toLocaleString()} souls / mo`
 : `~${(currentTier.impactMonthlyVal * 12).toLocaleString()} souls / yr`
 }
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Other Tiers grid when expanded */}
 <AnimatePresence>
 {showOtherTiers && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden pt-2"
 >
 <div className="space-y-4 pt-4">
 <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 border-b border-editorial-charcoal/5 text-[9px] font-bold uppercase tracking-wider text-editorial-charcoal/40">
 <div className="col-span-4">{t("Tier / Level", "الفئة / المستوى")}</div>
 <div className={`col-span-2 text-right ${viewMode === 'monthly' ? 'text-editorial-charcoal font-bold' : ''}`}>{t("Monthly", "شهري")}</div>
 <div className={`col-span-2 text-right ${viewMode === 'annual' ? 'text-editorial-charcoal font-bold' : ''}`}>{t("Annual", "سنوي")}</div>
 <div className="col-span-2 text-right">{t("Projected impact", "الأثر المتوقع")}</div>
 <div className="col-span-2 text-right">{t("Action", "إجراء")}</div>
 </div>

 <div className="divide-y divide-editorial-charcoal/5 border-t border-b border-editorial-charcoal/10">
 {PARTNERSHIP_TIERS_DATA.map((tier, idx) => {
 const isCurrent = currentTierIndex === idx;
 const isAbove = currentTierIndex === -1 || idx < currentTierIndex;
 return (
 <div
 key={tier.name}
 className={`py-4 px-4 flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-4 transition-all ${
 isCurrent
 ? 'bg-emerald-500 dark:bg-emerald-500/[0.02]'
 : 'hover:bg-editorial-soft/20'
 }`}
 >
 <div className="col-span-4 flex items-center gap-3">
 <span className="text-[10px] font-serif font-bold w-6 h-6 bg-editorial-soft border border-editorial-charcoal/10 flex items-center justify-center rounded-full shrink-0 uppercase text-editorial-charcoal/60">{tier.name.charAt(0)}</span>
 <div>
 <h5 className="font-serif font-bold text-xs text-editorial-charcoal flex items-center gap-1.5">
 {tier.name}
 {isCurrent && (
 <span className="text-[7px] bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm">{t("Current", "الحالي")}</span>
 )}
 </h5>
 <p className="text-[10px] text-editorial-charcoal/50 leading-tight mt-0.5">{tier.desc}</p>
 </div>
 </div>

 <div className="col-span-2 w-full md:text-right flex md:block justify-between items-center">
 <span className="text-[9px] font-bold uppercase tracking-wider text-editorial-charcoal/40 md:hidden">{t("Monthly", "شهري")}</span>
 <span className={`text-xs font-mono font-medium ${viewMode === 'monthly' && isCurrent ? 'text-emerald-950 dark:text-emerald-300 font-bold' : 'text-editorial-charcoal/70'}`}>{tier.minMonthly.toLocaleString()} {t("EGP", "جنيه")}</span>
 </div>

 <div className="col-span-2 w-full md:text-right flex md:block justify-between items-center">
 <span className="text-[9px] font-bold uppercase tracking-wider text-editorial-charcoal/40 md:hidden">{t("Annual", "سنوي")}</span>
 <span className={`text-xs font-mono font-medium ${viewMode === 'annual' && isCurrent ? 'text-emerald-950 dark:text-emerald-300 font-bold' : 'text-editorial-charcoal/70'}`}>{tier.minAnnual.toLocaleString()} {t("EGP", "جنيه")}</span>
 </div>

 <div className="col-span-2 w-full md:text-right flex md:block justify-between items-center">
 <span className="text-[9px] font-bold uppercase tracking-wider text-editorial-charcoal/40 md:hidden">{t("Projected Impact", "الأثر المتوقع")}</span>
 <span className="text-xs font-serif italic font-medium text-emerald-800 dark:text-emerald-400">
 {viewMode === 'monthly'
 ? `~${tier.impactMonthlyVal.toLocaleString()} souls`
 : `~${(tier.impactMonthlyVal * 12).toLocaleString()} souls`
 }
 </span>
 </div>

 <div className="col-span-2 w-full md:text-right flex md:block justify-end items-center pt-2 md:pt-0">
 {isCurrent ? (
 <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/20 px-2 py-1 rounded-sm border border-emerald-500/20 dark:border-emerald-800/20 inline-block">{t("Active", "نشط")}</span>
 ) : isAbove && userSubs.length > 0 ? (
 <button
 onClick={() => {
 const subToUpgrade = userSubs[0];
 setLevelUpSub(subToUpgrade);
 const minRequired = subToUpgrade.frequency === 'annual' ? tier.minAnnual : tier.minMonthly;
 setUpgradeAmount(Math.max(minRequired, subToUpgrade.amount + 50));
 setUpgradeSuccess(false);
 }}
 className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 cursor-pointer flex items-center gap-1 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/30 py-1.5 px-3 rounded-lg transition-all duration-200 border border-indigo-200/30 dark:border-indigo-800/30"
 >
 <span>{t("Upgrade", "ترقية")}</span>
 <ArrowUpRight className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
 </button>
 ) : userSubs.length === 0 ? (
 <button
 onClick={() => {
 if (tracks[0]) {
 onDonateClick(
 tracks[0],
 viewMode === 'monthly' ? tier.minMonthly : tier.minAnnual,
 viewMode
 );
 }
 }}
 className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 cursor-pointer flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30 py-1.5 px-3 rounded-lg transition-all duration-200 border border-emerald-200/50 dark:border-emerald-800/30 shadow-xs"
 >
 <span>{t("Sow Faith", "ازرع إيماناً")}</span>
 <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
 </button>
 ) : (
 <span className="text-[9px] font-bold uppercase tracking-widest text-editorial-charcoal/30 inline-block md:pr-4">—</span>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 </div>



 </div>
 
 </>
 )}
 </>
)}

{activeSubTab === 'overview' && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 >
 <LandingPage 
 currentUser={currentUser}
 onDonateClick={onDonateClick}
 updates={updates}
 leaderboard={leaderboard}
 tracks={tracks}
 subscriptions={subscriptions}
 transactions={transactions}
 badges={badges}
 onOpenAuth={onOpenAuth}
 onUserChange={onUserChange}
 />
 </motion.div>
 )}

 {activeSubTab === 'profile' && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="grid grid-cols-1 lg:grid-cols-12 gap-8"
 >
 {/* Left Column - Form Fields */}
 <div className="lg:col-span-8 space-y-6">
 <div className="bg-editorial-card border border-editorial-charcoal/10 rounded-2xl p-6 md:p-8 space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-charcoal/10 pb-6">
 <div>
 <h3 className="text-xl font-serif italic font-light text-editorial-charcoal">{t("Account Details", "تفاصيل الحساب")}</h3>
 <p className="text-xs text-editorial-charcoal/50 mt-1">
 Keep your digital partner credentials and primary contact routes up to date.
 </p>
 </div>

 {/* Interactive Avatar Icon */}
 <div className="relative shrink-0 flex flex-col items-center sm:items-end">
 <button
 type="button"
 onClick={() => setShowAvatarSelector(!showAvatarSelector)}
 className="group relative w-16 h-16 rounded-full overflow-hidden border border-editorial-charcoal/20 hover:border-editorial-charcoal transition-all shadow-xs focus:outline-none cursor-pointer"
 title="Click to change your photo"
 >
 <img
 src={profileAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
 alt="Profile Avatar"
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
 />
 <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[8px] font-bold text-white uppercase tracking-wider text-center p-1 leading-tight">
 <span>{t("Change", "تغيير")}</span>
 <span>{t("Photo", "صورة")}</span>
 </div>
 </button>
 <span className="text-[8px] uppercase tracking-widest text-editorial-charcoal/40 font-bold mt-1.5 font-sans">
 Click to Change
 </span>
 </div>
 </div>

 {/* Expandable Photo Selector Panel */}
 <AnimatePresence>
 {showAvatarSelector && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden border border-editorial-charcoal/10 bg-editorial-cream/35 rounded-xl p-4 space-y-4 animate-none"
 >
 <div className="flex items-center justify-between">
 <span className="text-[9px] uppercase tracking-wider font-extrabold text-editorial-charcoal/50">
 Choose Portrait Preset
 </span>
 <button
 type="button"
 onClick={() => setShowAvatarSelector(false)}
 className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:text-rose-300"
 >
 Close Selector
 </button>
 </div>

 {/* Curated Presets Grid */}
 <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
 {[
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
 ].map((presetUrl, idx) => {
 const isSelected = profileAvatar === presetUrl;
 return (
 <button
 key={idx}
 type="button"
 onClick={() => setProfileAvatar(presetUrl)}
 className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer mx-auto ${
 isSelected 
 ? 'border-editorial-charcoal scale-105 shadow-md' 
 : 'border-transparent opacity-65 hover:opacity-100'
 }`}
 >
 <img src={presetUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
 </button>
 );
 })}
 </div>

 {/* Custom URL Input */}
 <div className="space-y-1.5 text-left">
 <label className="text-[9px] uppercase tracking-wider font-bold text-editorial-charcoal/50 block">{t("Or Paste a Custom Image Link", "أو الصق رابط صورة مخصص")}</label>
 <input
 type="url"
 value={profileAvatar}
 onChange={(e) => setProfileAvatar(e.target.value)}
 className="w-full px-3 py-2 text-[10px] font-mono border border-editorial-charcoal/10 rounded-xl bg-editorial-card focus:outline-none focus:border-editorial-charcoal text-editorial-charcoal transition-all"
 placeholder={t("https://images.unsplash.com/...", "رابط الصورة")}
 />
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 <form onSubmit={handleSaveProfile} className="space-y-6">
 {profileUpdateSuccess && (
 <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/20 text-xs font-semibold rounded-xl flex items-center gap-2.5">
 <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 <span>{t("Your profile information has been successfully saved.", "تم حفظ معلومات ملفك الشخصي بنجاح.")}</span>
 </div>
 )}

 {profileUpdateError && (
 <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/20 text-xs font-semibold rounded-xl">
 {profileUpdateError}
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/50 flex items-center gap-1.5">
 <User className="w-3 h-3 text-editorial-charcoal/40" />
 <span>{t("Full Name", "الاسم الكامل")}</span>
 </label>
 <input
 type="text"
 required
 value={profileName}
 onChange={(e) => setProfileName(e.target.value)}
 className="w-full px-4 py-3 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-cream/20 focus:bg-editorial-card focus:outline-none focus:border-editorial-charcoal text-editorial-charcoal transition-all"
 placeholder={t("Your full name", "الاسم بالكامل")}
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/50 flex items-center gap-1.5">
 <Mail className="w-3 h-3 text-editorial-charcoal/40" />
 <span>{t("Email Address", "البريد الإلكتروني")}</span>
 </label>
 <input
 type="email"
 required
 value={profileEmail}
 onChange={(e) => setProfileEmail(e.target.value)}
 className="w-full px-4 py-3 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-cream/20 focus:bg-editorial-card focus:outline-none focus:border-editorial-charcoal text-editorial-charcoal transition-all"
 placeholder={t("Your email address", "البريد الإلكتروني")}
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/50 flex items-center gap-1.5">
 <PhoneIcon className="w-3.5 h-3.5 text-editorial-charcoal/40" />
 <span>{t("Phone / WhatsApp", "الهاتف / واتساب")}</span>
 </label>
 <input
 type="tel"
 value={profilePhone}
 onChange={(e) => setProfilePhone(e.target.value)}
 className="w-full px-4 py-3 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-cream/20 focus:bg-editorial-card focus:outline-none focus:border-editorial-charcoal text-editorial-charcoal transition-all"
 placeholder={t("e.g. +20 100 234 5678", "مثال: +20 100 234 5678")}
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/50 flex items-center gap-1.5">
 <Globe className="w-3 h-3 text-editorial-charcoal/40" />
 <span>{t("Referral Source", "مصدر التعرف علينا")}</span>
 </label>
 <select
 value={profileReferral}
 onChange={(e) => setProfileReferral(e.target.value)}
 className="w-full px-4 py-3 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-cream/20 focus:bg-editorial-card focus:outline-none focus:border-editorial-charcoal text-editorial-charcoal transition-all cursor-pointer"
 >
 <option value="Church Bulletin">{t("Church Bulletin", "نشرة الكنيسة")}</option>
 <option value="Social Media">{t("Social Media", "وسائل التواصل الاجتماعي")}</option>
 <option value="Friend recommendation">{t("Friend Recommendation", "توصية من صديق")}</option>
 <option value="Satellite TV Program">{t("Satellite TV Program", "برنامج تلفزيوني فضائي")}</option>
 <option value="Other">{t("Other", "أخرى")}</option>
 </select>
 </div>
 </div>

 {/* Newsletter subscription toggle */}
 <div className="p-4 bg-editorial-soft/30 border border-editorial-charcoal/5 rounded-2xl flex items-center justify-between gap-4">
 <div className="flex items-start gap-3">
 <input
 type="checkbox"
 id="profile-opt-in"
 checked={profileOptIn}
 onChange={(e) => setProfileOptIn(e.target.checked)}
 className="w-4 h-4 text-editorial-charcoal border-editorial-charcoal/20 rounded focus:ring-editorial-charcoal mt-0.5 cursor-pointer"
 />
 <label htmlFor="profile-opt-in" className="select-none cursor-pointer">
 <span className="text-xs font-serif italic text-editorial-charcoal font-bold block">{t("Ministry Newsletter & Updates", "النشرة الإخبارية وتحديثات الخدمة")}</span>
 <span className="text-[10px] text-editorial-charcoal/50 block mt-0.5">
 Opt in to receive localized progress stats and critical digital follow-up prayer alerts.
 </span>
 </label>
 </div>
 </div>

 <div className="flex justify-end pt-2">
 <button
 type="submit"
 className="px-6 py-3 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream text-[10px] uppercase tracking-widest font-bold rounded-full transition-colors cursor-pointer"
 >
 {t("Save Changes", "حفظ التغييرات")}
 </button>
 </div>
 </form>
 </div>
 </div>

 {/* Right Column - Badge Case */}
 <div className="lg:col-span-4 space-y-6">
 {/* Badge Case Widget (Rule 4.4) */}
 <div className="bg-editorial-card border border-editorial-charcoal/10 rounded-2xl p-6 space-y-6">
 <div className="text-left">
 <h3 className="text-xl font-serif italic font-light text-editorial-charcoal">{t("My Badge Case", "لوحة أوسمة الشراكة")}</h3>
 <p className="text-xs text-editorial-charcoal/60 font-sans mt-1">{t("Milestones unlocked throughout your partnership journey", "الأوسمة الخدمية الممنوحة لك تقديرًا لمشاركتك الأمينة")}</p>
 </div>

 <div className="grid grid-cols-2 gap-4">
 {ALL_BADGES_METADATA.map((bMeta) => {
 const earned = userBadges.find(ub => ub.badge_type === bMeta.type);
 const localizedName = getLocalizedBadgeName(bMeta.type, bMeta.name, language);
 const localizedDesc = getLocalizedBadgeDesc(bMeta.type, bMeta.description, language);
 const localizedLevel = (() => {
 if (language !== 'ar') return bMeta.level;
 switch (bMeta.type) {
 case 'first_step': return 'العضوية الأولى أو تقديم عطاء لمرة واحدة';
 case 'three_month_faithful': return 'المشاركة الأمينة لـ 3 أشهر متتالية';
 case 'anniversary_friend': return 'المشاركة الأمينة لـ 12 شهرًا متتالية';
 case 'gospel_multiplier': return 'المساهمة في نشر الكلمة لـ 1,000 نفس';
 case 'loyal_partner': return 'دعم 3 قطاعات خدمية نشطة أو أكثر';
 case 'kingdom_advocate': return 'دعوة 3 أصدقاء للمشاركة في الخدمة';
 default: return bMeta.level;
 }
 })();

 return (
 <div 
 key={bMeta.type}
 className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between transition-all duration-300 relative group ${
 earned 
 ? 'bg-editorial-soft/35 border-editorial-charcoal/15 shadow-sm hover:shadow-md' 
 : 'bg-editorial-cream/10 border-editorial-charcoal/5 opacity-40 hover:opacity-85'
 }`}
 >
 {/* Beautiful Absolute Tooltip for Achievement Level */}
 <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-editorial-charcoal text-editorial-cream rounded-2xl shadow-xl border border-editorial-charcoal/20 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 text-left">
 <div className="space-y-2">
 <div className="flex items-center justify-between border-b border-editorial-cream/10 pb-2">
 <span className="text-xs font-serif font-bold italic text-amber-300">
 {localizedName}
 </span>
 <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${earned ? 'bg-emerald-500 dark:bg-emerald-500/20 text-emerald-300 border border-emerald-500 dark:border-emerald-400/30' : 'bg-editorial-card/10 text-editorial-cream/60'}`}>
 {earned ? t("Unlocked", "نشط") : t("Locked", "غير مفعّل")}
 </span>
 </div>
 
 <p className="text-[10px] text-editorial-cream/80 font-sans leading-relaxed">
 {localizedDesc}
 </p>
 
 <div className="pt-2 border-t border-editorial-cream/10 space-y-1">
 <p className="text-[8px] uppercase tracking-wider text-editorial-cream/40 font-bold">{t("Achievement Level", "متطلبات الوسام")}</p>
 <p className="text-[10px] text-amber-200 font-serif italic">
 {localizedLevel}
 </p>
 </div>
 </div>
 {/* Little arrow at the bottom of tooltip */}
 <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-editorial-charcoal"></div>
 </div>

 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif italic font-bold text-sm mb-2.5 border ${
 earned ? 'bg-editorial-charcoal text-editorial-cream border-editorial-charcoal' : 'bg-editorial-sand text-editorial-charcoal/30 border-editorial-charcoal/10'
 }`}>
 <Award className="w-4 h-4" />
 </div>
 
 <div className="text-center">
 <h4 className="text-[11px] font-bold text-editorial-charcoal leading-tight">{localizedName}</h4>
 <p className="text-[9px] text-editorial-charcoal/50 leading-normal mt-1.5 line-clamp-2">
 {localizedDesc}
 </p>
 </div>

 {earned ? (
 <span className="text-[8px] font-bold uppercase tracking-widest text-editorial-charcoal bg-editorial-sand px-3 py-2 rounded-full mt-3.5 font-serif italic">
 {t("Earned", "تم الحصول عليه")} {earned.earned_date.split('-')[1]}/{earned.earned_date.split('-')[0].slice(2)}
 </span>
 ) : (
 <span className="text-[8px] font-bold uppercase tracking-widest text-editorial-charcoal/30 bg-editorial-charcoal/5 px-3 py-2 rounded-full mt-3.5">
 {t("Locked", "مغلق")}
 </span>
 )}
 </div>
 );
 })}
 </div>
 </div>
 </div>
 </motion.div>
 )}

 {activeSubTab === 'referrals' && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="grid grid-cols-1 lg:grid-cols-12 gap-8"
 >
 {/* Left Column: Direct Outreach Form */}
 <div className="lg:col-span-6 space-y-6">
 <div className="bg-editorial-card border border-editorial-charcoal/10 rounded-2xl p-6 md:p-8 space-y-6">
 <div>
 <span className="text-[9px] font-bold uppercase tracking-widest text-editorial-charcoal/40 bg-editorial-charcoal/5 px-3 py-2 rounded-full">{t("Direct Outreach", "التواصل المباشر")}</span>
 <h3 className="text-xl font-serif italic font-light text-editorial-charcoal mt-3">{t("Suggest a Friend", "اقترح صديقاً")}</h3>
 <p className="text-xs text-editorial-charcoal/50 mt-1">
 Provide the contact details of seekers or friends who would love to join our partner portal. Our team will reach out with a personal invitation.
 </p>
 </div>

 <form onSubmit={handleAddReferral} className="space-y-4">
 {referralSuccess && lastGeneratedReferral && (
 <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/20 text-xs rounded-xl space-y-3">
 <div className="flex items-center gap-2.5 font-semibold">
 <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span>{t("Invitation generated for ", "تم إنشاء دعوة لـ ")}{lastGeneratedReferral.friend_name}!</span>
 </div>
 <div className="p-3 bg-editorial-card/90 rounded-lg border border-emerald-200 dark:border-emerald-800/30 text-[10px] font-mono flex flex-col gap-2">
 <p className="text-emerald-900 dark:text-emerald-400 font-sans font-bold uppercase tracking-wider text-[8px]">{t("Special Invitation Link:", "رابط دعوة خاص:")}</p>
 <span className="truncate break-all select-all text-emerald-950 dark:text-emerald-300 font-mono">
 https://betterlifefriend.org/join?ref={currentUser.donor_id}&friend={encodeURIComponent(lastGeneratedReferral.friend_name)}&invite={lastGeneratedReferral.referral_id}
 </span>
 <button
 type="button"
 onClick={() => handleCopySpecialLink(lastGeneratedReferral.referral_id, lastGeneratedReferral.friend_name)}
 className="mt-1 self-start px-3 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-md text-[9px] font-bold uppercase tracking-wider cursor-pointer hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all flex items-center gap-1"
 >
 {copiedReferralId === lastGeneratedReferral.referral_id ? (
 <>
 <Check className="w-3 h-3" />
 <span>{t("Copied Special Link!", "تم نسخ الرابط الخاص!")}</span>
 </>
 ) : (
 <>
 <Copy className="w-3 h-3" />
 <span>{t("Copy Friend Link", "نسخ رابط الصديق")}</span>
 </>
 )}
 </button>
 </div>
 </div>
 )}

 {referralError && (
 <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/20 text-xs font-semibold rounded-xl">
 {referralError}
 </div>
 )}

 <div className="space-y-2">
 <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/50 flex items-center gap-1.5">
 <User className="w-3 h-3 text-editorial-charcoal/40" />
 <span>{t("Friend's Full Name", "اسم الصديق بالكامل")}</span>
 </label>
 <input
 type="text"
 required
 value={friendName}
 onChange={(e) => setFriendName(e.target.value)}
 className="w-full px-4 py-3 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-cream/20 focus:bg-editorial-card focus:outline-none focus:border-editorial-charcoal text-editorial-charcoal transition-all"
 placeholder={t("Enter friend's name", "أدخل اسم الصديق")}
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/50 flex items-center gap-1.5">
 <Mail className="w-3 h-3 text-editorial-charcoal/40" />
 <span>{t("Friend's Email Address", "البريد الإلكتروني للصديق")}</span>
 </label>
 <input
 type="email"
 value={friendEmail}
 onChange={(e) => setFriendEmail(e.target.value)}
 className="w-full px-4 py-3 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-cream/20 focus:bg-editorial-card focus:outline-none focus:border-editorial-charcoal text-editorial-charcoal transition-all"
 placeholder={t("name@example.com (optional if phone provided)", "البريد الإلكتروني (اختياري إذا توفر الهاتف)")}
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/50 flex items-center gap-1.5">
 <PhoneIcon className="w-3 h-3 text-editorial-charcoal/40" />
 <span>{t("Friend's Phone Number", "رقم هاتف الصديق")}</span>
 </label>
 <input
 type="tel"
 value={friendPhone}
 onChange={(e) => setFriendPhone(e.target.value)}
 className="w-full px-4 py-3 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-cream/20 focus:bg-editorial-card focus:outline-none focus:border-editorial-charcoal text-editorial-charcoal transition-all"
 placeholder={t("+20 100 000 0000 (optional if email provided)", "رقم الهاتف (اختياري إذا توفر البريد)")}
 />
 </div>

 <button
 type="submit"
 className="w-full mt-4 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
 >
 <Send className="w-3.5 h-3.5" />
 <span>{t("Submit Friend for Outreach", "إرسال اسم الصديق للتواصل")}</span>
 </button>
 </form>
 </div>
 </div>

 {/* Right Column: Referral Progress List */}
 <div className="lg:col-span-6 space-y-6">
 {/* Referral Status & List */}
 <div className="bg-editorial-card border border-editorial-charcoal/10 rounded-2xl p-6 md:p-8 space-y-4">
 <div className="flex justify-between items-center">
 <div>
 <h4 className="text-sm font-serif italic text-editorial-charcoal">{t("Your Invited Circle", "دائرتك المدعوة")}</h4>
 <p className="text-[11px] text-editorial-charcoal/50 mt-0.5">{t("Tracking status of friends you suggested or shared links with.", "متابعة حالة الأصدقاء الذين اقترحتهم أو شاركت الروابط معهم.")}</p>
 </div>
 <div className="text-right">
 <span className="text-lg font-serif font-light text-editorial-charcoal">{userReferrals.length}</span>
 <span className="text-[9px] block uppercase tracking-wider text-editorial-charcoal/40 font-bold">{t("Total Referred", "إجمالي المدعوين")}</span>
 </div>
 </div>

 {userReferrals.length === 0 ? (
 <div className="text-center py-8 px-4 border border-dashed border-editorial-charcoal/15 rounded-xl bg-editorial-cream/5 space-y-2">
 <p className="text-xs text-editorial-charcoal/50 italic">{t("No invitations sent yet.", "لم يتم إرسال دعوات بعد.")}</p>
 <p className="text-[10px] text-editorial-charcoal/40">{t("Enter a friend's name on the left to start building the community!", "أدخل اسم صديق على اليسار لتبدأ في بناء المجتمع!")}</p>
 </div>
 ) : (
 <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
 {userReferrals.map((ref) => (
 <div 
 key={ref.referral_id} 
 className="p-3 bg-editorial-cream/15 border border-editorial-charcoal/5 rounded-xl flex flex-col gap-2.5"
 >
 <div className="flex items-center justify-between gap-3">
 <div className="space-y-1.5 min-w-0">
 <div>
 <p className="text-xs font-semibold text-editorial-charcoal truncate">{ref.friend_name}</p>
 <div className="flex flex-wrap gap-x-2 text-[9px] text-editorial-charcoal/40 font-mono mt-0.5">
 {ref.friend_email && <span className="truncate">{ref.friend_email}</span>}
 {ref.friend_phone && <span>{ref.friend_phone}</span>}
 </div>
 </div>

 {/* Quick Share Templates as Quick Actions */}
 <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-editorial-charcoal/5">
 <span className="text-[8px] uppercase tracking-wider font-extrabold text-editorial-charcoal/40">{t("Quick Share:", "مشاركة سريعة:")}</span>
 <a
 href={`https://wa.me/?text=${encodeURIComponent(`Hey! I joined Better Life's Digital Missions Partner portal to support reaching millions across Egypt and the Middle East with hope. I think you'd love to partner with them too! Join me here: https://betterlifefriend.org/join?ref=${currentUser.donor_id}&friend=${encodeURIComponent(ref.friend_name)}&invite=${ref.referral_id}`)}`}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center gap-1 px-2 py-0.5 border border-editorial-charcoal/10 rounded-md text-[8px] font-bold uppercase tracking-wider text-editorial-charcoal/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800/40 transition-all cursor-pointer"
 >
 <Share2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
 <span>{t("WhatsApp", "واتساب")}</span>
 </a>
 <a
 href={`mailto:?subject=${encodeURIComponent("Join me in supporting Digital Missions with Better Life")}&body=${encodeURIComponent(`Hey,\n\nI recently partnered with Better Life to support their digital missions tracks, reaching millions with God's word, counseling, and media outreach across the Middle East.\n\nI would love for you to join this journey with me! You can sign up using my referral invitation link here:\n\nhttps://betterlifefriend.org/join?ref=${currentUser.donor_id}&friend=${encodeURIComponent(ref.friend_name)}&invite=${ref.referral_id}\n\nBlessings!`)}`}
 className="inline-flex items-center gap-1 px-2 py-0.5 border border-editorial-charcoal/10 rounded-md text-[8px] font-bold uppercase tracking-wider text-editorial-charcoal/70 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800/40 transition-all cursor-pointer"
 >
 <Mail className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
 <span>{t("Email", "بريد إلكتروني")}</span>
 </a>
 </div>
 </div>

 <div className="flex flex-col items-end gap-1.5 shrink-0">
 {ref.status === 'joined' ? (
 <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 px-2 py-0.5 rounded-full">
 <Check className="w-2.5 h-2.5" />
 <span>{t("Joined", "انضم")}</span>
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/30 px-2 py-0.5 rounded-full">
 <span className="w-1 h-1 bg-amber-500 dark:bg-amber-600 rounded-full animate-pulse"></span>
 <span>{t("Outreach Pending", "في انتظار التواصل")}</span>
 </span>
 )}
 <span className="text-[8px] font-mono text-editorial-charcoal/30">{t("Added ", "تمت الإضافة ")}{ref.date_added}</span>
 </div>
 </div>

 {/* Individual Friend Special Link section */}
 <div className="mt-1 pt-2 border-t border-editorial-charcoal/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-editorial-card/50 p-2 rounded-lg border border-editorial-charcoal/5">
 <div className="text-[9px] font-mono text-editorial-charcoal/50 truncate flex-1 min-w-0 select-all" title={`https://betterlifefriend.org/join?ref=${currentUser.donor_id}&friend=${encodeURIComponent(ref.friend_name)}&invite=${ref.referral_id}`}>
 <span className="font-semibold text-editorial-charcoal/60 font-sans block text-[8px] uppercase tracking-wider mb-0.5">{t("Special Link:", "رابط خاص:")}</span>
 <span className="font-mono text-[9px] truncate block">
 https://betterlifefriend.org/join?ref={currentUser.donor_id.slice(-6)}&friend={encodeURIComponent(ref.friend_name).slice(0, 8)}...&invite={ref.referral_id.slice(-6)}
 </span>
 </div>
 <button
 onClick={() => handleCopySpecialLink(ref.referral_id, ref.friend_name)}
 className={`px-3 py-2 rounded-md text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1 shrink-0 ${
 copiedReferralId === ref.referral_id
 ? 'bg-emerald-600 dark:bg-emerald-600 text-white'
 : 'bg-editorial-charcoal text-editorial-cream hover:bg-editorial-charcoal/90'
 }`}
 >
 {copiedReferralId === ref.referral_id ? (
 <>
 <Check className="w-2.5 h-2.5" />
 <span>{t("Copied!", "تم النسخ!")}</span>
 </>
 ) : (
 <>
 <Copy className="w-2.5 h-2.5" />
 <span>{t("Copy Link", "نسخ الرابط")}</span>
 </>
 )}
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </motion.div>
 )}

 {/* MODAL 1: Level up / Upgrade subscription modal */}
 <AnimatePresence>
 {levelUpSub && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-charcoal/60 backdrop-blur-xs">
 <motion.div 
 initial={{ scale: 0.98, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.98, opacity: 0 }}
 className="bg-editorial-card rounded-2xl border border-editorial-charcoal/20 shadow-2xl max-w-lg w-full overflow-hidden"
 >
 <div className="p-5 border-b border-editorial-charcoal/10 flex items-center justify-between bg-editorial-soft/50">
 <div>
 <span className="text-[9px] font-bold uppercase tracking-widest text-editorial-charcoal/60 font-sans">{t("Level-Up Partnership", "ترقية مستوى الشراكة")}</span>
 <h3 className="text-base font-serif italic text-editorial-charcoal mt-0.5">{t("Upgrade Operational Tier", "ترقية مستوى الدعم التشغيلي")}</h3>
 </div>
 <button 
 onClick={() => setLevelUpSub(null)}
 className="p-1 text-editorial-charcoal/50 hover:text-editorial-charcoal rounded-full cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
 {upgradeSuccess ? (
 <div className="text-center py-6 space-y-4">
 <div className="w-12 h-12 border border-editorial-charcoal/15 bg-editorial-soft text-editorial-charcoal rounded-full flex items-center justify-center mx-auto">
 <CheckCircle2 className="w-6 h-6" />
 </div>
 <h4 className="text-base font-serif font-bold text-editorial-charcoal">{t("Tier Upgraded Successfully!", "تم ترقية المستوى بنجاح!")}</h4>
 <p className="text-xs text-editorial-charcoal/60">{t("Your recurrent support has been adjusted. Reloading dashboard...", "تم تعديل دعمك المستمر. يتم تحديث اللوحة...")}</p>
 </div>
 ) : (() => {
 const upgradedTrack = tracks.find(t => t.track_id === levelUpSub.track_id);
 if (!upgradedTrack) return null;

 // Convert previous rate to equivalent of new upgradeFrequency for direct net commitment change calculation
 let previousConverted = 0;
 if (levelUpSub.frequency === upgradeFrequency) {
 previousConverted = levelUpSub.amount;
 } else if (levelUpSub.frequency === 'monthly' && upgradeFrequency === 'annual') {
 previousConverted = levelUpSub.amount * 12;
 } else if (levelUpSub.frequency === 'annual' && upgradeFrequency === 'monthly') {
 previousConverted = Math.round(levelUpSub.amount / 12);
 }
 const netAmountDifference = upgradeAmount - previousConverted;

 const currentImpact = calculateSubscriptionImpact(upgradedTrack, levelUpSub.amount, levelUpSub.frequency);
 const currentUnits = upgradeFrequency === 'annual' ? currentImpact.annualUnits : currentImpact.monthlyUnits;

 const newImpact = calculateSubscriptionImpact(upgradedTrack, upgradeAmount, upgradeFrequency);
 const newUnits = upgradeFrequency === 'annual' ? newImpact.annualUnits : newImpact.monthlyUnits;

 const netUnitsDifference = newUnits - currentUnits;

 return (
 <>
 <div className="flex items-center gap-3.5 bg-editorial-soft/40 p-4 rounded-xl border border-editorial-charcoal/10">
 <div className="w-9 h-9 border border-editorial-charcoal/25 bg-editorial-cream text-editorial-charcoal font-serif italic text-sm font-bold flex items-center justify-center shrink-0 rounded-full shadow-xs">
 {upgradedTrack.letter}
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-editorial-charcoal/50">{t("Active Track Selected", "المسار النشط المحدد")}</p>
 <h4 className="text-xs font-serif font-bold text-editorial-charcoal">{upgradedTrack.name}</h4>
 </div>
 </div>

 {/* Frequency Switcher Toggle */}
 <div className="space-y-2">
 <label className="text-[9px] font-bold text-editorial-charcoal/60 uppercase tracking-wider block">{t("Giving Frequency Option", "خيار معدل العطاء")}</label>
 <div className="grid grid-cols-2 gap-2 bg-editorial-soft/40 p-1.5 rounded-xl border border-editorial-charcoal/10">
 <button
 type="button"
 onClick={() => {
 setUpgradeFrequency('monthly');
 if (levelUpSub.frequency === 'annual') {
 setUpgradeAmount(Math.max(500, Math.round(levelUpSub.amount / 12)));
 } else {
 setUpgradeAmount(levelUpSub.amount);
 }
 }}
 className={`py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg cursor-pointer transition-all ${
 upgradeFrequency === 'monthly'
 ? 'bg-editorial-charcoal text-editorial-cream shadow-xs'
 : 'text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-soft/20'
 }`}
 >
 Monthly Support
 </button>
 <button
 type="button"
 onClick={() => {
 setUpgradeFrequency('annual');
 if (levelUpSub.frequency === 'monthly') {
 setUpgradeAmount(Math.max(5000, levelUpSub.amount * 12));
 } else {
 setUpgradeAmount(levelUpSub.amount);
 }
 }}
 className={`py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg cursor-pointer transition-all ${
 upgradeFrequency === 'annual'
 ? 'bg-editorial-charcoal text-editorial-cream shadow-xs'
 : 'text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-soft/20'
 }`}
 >
 Annual Support
 </button>
 </div>
 </div>

 {/* Tier Dropdown Selection */}
 <div className="space-y-2.5">
 <label className="text-[9px] font-bold text-editorial-charcoal/60 uppercase tracking-wider block">{t("Choose Partnership Level / Tier", "اختر مستوى / فئة الشراكة")}</label>
 <select
 value={PARTNERSHIP_TIERS_DATA.find(t => (upgradeFrequency === 'annual' ? t.minAnnual : t.minMonthly) === upgradeAmount)?.name || ''}
 onChange={(e) => {
 const selectedTier = PARTNERSHIP_TIERS_DATA.find(t => t.name === e.target.value);
 if (selectedTier) {
 setUpgradeAmount(upgradeFrequency === 'annual' ? selectedTier.minAnnual : selectedTier.minMonthly);
 }
 }}
 className="w-full px-3.5 py-3 text-xs border border-editorial-charcoal/15 rounded-xl bg-editorial-cream focus:outline-none focus:border-editorial-charcoal font-sans text-editorial-charcoal cursor-pointer"
 >
 <option value="" disabled>{t("Custom Amount or Choose Tier Below", "مبلغ مخصص أو اختر من الفئات بالأسفل")}</option>
 {PARTNERSHIP_TIERS_DATA.map((tier) => {
 const amt = upgradeFrequency === 'annual' ? tier.minAnnual : tier.minMonthly;
 return (
 <option key={tier.name} value={tier.name}>
 {tier.name} (EGP {amt.toLocaleString()} / {upgradeFrequency === 'annual' ? 'yr' : 'mo'})
 </option>
 );
 })}
 </select>
 
 {/* Manual inputs slider adjustment for finer control */}
 <div className="space-y-1.5 pt-1">
 <div className="flex justify-between text-[10px] text-editorial-charcoal/60 font-medium">
 <span>{t("Adjust amount manually:", "تعديل المبلغ يدوياً:")}</span>
 <span className="font-bold font-mono text-editorial-charcoal">{upgradeAmount.toLocaleString()} EGP</span>
 </div>
 <input
 type="range"
 min={upgradeFrequency === 'annual' ? 3000 : 250}
 max={upgradeFrequency === 'annual' ? 120000 : 10000}
 step={upgradeFrequency === 'annual' ? 1000 : 50}
 value={upgradeAmount}
 onChange={(e) => setUpgradeAmount(Number(e.target.value))}
 className="w-full accent-editorial-charcoal h-1 bg-editorial-charcoal/10 rounded-lg cursor-pointer"
 />
 </div>
 </div>

 {/* Commitment Net Difference Card */}
 <div className="bg-editorial-soft/30 p-4 border border-editorial-charcoal/10 rounded-xl space-y-3">
 <span className="text-[8px] font-bold uppercase tracking-widest text-editorial-charcoal/50 block">{t("Commitment Net Difference", "فرق الالتزام الصافي")}</span>
 <div className="grid grid-cols-2 gap-4 pb-2.5 border-b border-editorial-charcoal/10">
 <div>
 <span className="text-[9px] uppercase tracking-wider text-editorial-charcoal/50 block font-sans">{t("Current Commitment", "التزامك الحالي")}</span>
 <span className="text-xs font-bold text-editorial-charcoal">{levelUpSub.amount.toLocaleString()} EGP / {levelUpSub.frequency}</span>
 </div>
 <div className="text-right">
 <span className="text-[9px] uppercase tracking-wider text-editorial-charcoal/50 block font-sans">{t("New Commitment", "الالتزام الجديد")}</span>
 <span className="text-xs font-bold text-editorial-charcoal">{upgradeAmount.toLocaleString()} EGP / {upgradeFrequency}</span>
 </div>
 </div>

 <div className="flex items-center justify-between pt-1">
 <span className="text-xs text-editorial-charcoal/70 font-medium">{t("Net Commitment Change:", "صافي التغيير في الالتزام:")}</span>
 <span className={`text-xs font-mono font-bold px-3 py-2 rounded-md border ${
 netAmountDifference > 0 
 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-800/30' 
 : netAmountDifference === 0 
 ? 'bg-editorial-soft text-editorial-charcoal border-editorial-charcoal/15'
 : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-500/20 dark:border-amber-800/30'
 }`}>
 {netAmountDifference > 0 ? '+' : ''}{netAmountDifference.toLocaleString()} EGP / {upgradeFrequency === 'annual' ? 'year' : 'month'}
 </span>
 </div>
 </div>

 {/* Expected Specific Outreach Impact Translation Summary */}
 <div className="bg-emerald-500 dark:bg-emerald-500/[0.02] border border-emerald-500 dark:border-emerald-400/15 p-4 rounded-xl space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 block">{t("Direct Impact Recalculation", "إعادة حساب الأثر المباشر")}</span>
 <span className="text-[10px] text-editorial-charcoal/50 font-serif italic">{t("Track Outcome Summary", "ملخص نتائج المسار")}</span>
 </div>
 <div className="grid grid-cols-2 gap-4 pb-2.5 border-b border-emerald-500 dark:border-emerald-400/10">
 <div>
 <span className="text-[9px] uppercase tracking-wider text-editorial-charcoal/40 block">{t("Current Direct Impact", "الأثر المباشر الحالي")}</span>
 <span className="text-xs font-serif font-bold text-editorial-charcoal">
 ~{Math.round(currentUnits).toLocaleString()} {upgradedTrack.target_unit_label}
 </span>
 </div>
 <div className="text-right">
 <span className="text-[9px] uppercase tracking-wider text-editorial-charcoal/40 block">{t("New Direct Impact", "الأثر المباشر الجديد")}</span>
 <span className="text-xs font-serif font-bold text-editorial-charcoal">
 ~{Math.round(newUnits).toLocaleString()} {upgradedTrack.target_unit_label}
 </span>
 </div>
 </div>

 <div className="flex items-center justify-between pt-1">
 <span className="text-xs text-emerald-950 dark:text-emerald-200 font-serif font-bold italic flex items-center gap-1">
 <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 Net Impact Increase:
 </span>
 <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
 +{Math.round(netUnitsDifference).toLocaleString()} {upgradedTrack.target_unit_label}
 </span>
 </div>
 </div>

 {/* Safety Switcher Info Banner */}
 <div className="p-3.5 bg-amber-500 dark:bg-amber-500/[0.03] border border-amber-500 dark:border-amber-400/20 rounded-xl text-[10px] text-amber-900 dark:text-amber-300 leading-relaxed text-left space-y-1">
 <div className="flex items-center gap-1 font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wider text-[9px]">
 <Shield className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
 <span> Seamless Transition (Anti-Redundancy Safeguard)</span>
 </div>
 {levelUpSub.frequency !== upgradeFrequency ? (
 <p>
 <strong>{t("Schedule Transfer Active:", "نقل الجدولة نشط:")}</strong> {t("Since you are switching from ", "بما أنك تنتقل من ")}<strong>{t(levelUpSub.frequency, levelUpSub.frequency === "monthly" ? "شهري" : "سنوي")}</strong>{t(" to ", " إلى ")}<strong>{t(upgradeFrequency, upgradeFrequency === "monthly" ? "شهري" : "سنوي")}</strong>{t(", the system immediately cancels and replaces your old subscription. No redundant charges will occur.", "، يقوم النظام فوراً بإلغاء واستبدال اشتراكك القديم. لن تحدث رسوم مكررة.")}
 </p>
 ) : (
 <p>
 <strong>{t("Commitment Rate Replaced:", "تم تحديث معدل الالتزام:")}</strong> {t("You are keeping your ", "أنت تحتفظ بجدولك ")}<strong>{t(upgradeFrequency, upgradeFrequency === "monthly" ? "الشهري" : "السنوي")}</strong>{t(". The system replaces your previous ", ". يستبدل النظام التزامك السابق ")}{levelUpSub.amount} {t("EGP commitment with the new ", "جنيه بالمعدل الجديد ")}{upgradeAmount} {t("EGP rate. No new subscription is created.", "جنيه. لن يتم إنشاء اشتراك جديد.")}
 </p>
 )}
 </div>

 {/* Cumulative Total Impact Comparison Banner */}
 <div className="p-4 bg-editorial-soft/50 rounded-xl border border-editorial-charcoal/10 space-y-3">
 <div className="flex items-start justify-between w-full">
 <div>
 <p className="text-[9px] font-bold uppercase tracking-wider text-editorial-charcoal/70">
 Total Partner {upgradeFrequency === 'monthly' ? 'Monthly' : 'Annual'} Impact
 </p>
 <p className="text-[10px] text-editorial-charcoal/60 font-sans mt-0.5 leading-normal">
 Combined outreach across all opted-in tracks:
 </p>
 </div>
 <button
 type="button"
 onClick={() => openMethodology(null)}
 className="p-1 text-editorial-charcoal/40 hover:text-editorial-charcoal hover:bg-editorial-charcoal/5 rounded-full cursor-pointer transition-colors"
 title="View Conversion Methodology"
 >
 <Info className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="grid grid-cols-2 gap-4 text-center pt-1 border-t border-editorial-charcoal/10">
 <div className="bg-editorial-soft/50 p-2.5 rounded-xl border border-editorial-charcoal/5">
 <span className="text-[8px] font-bold uppercase tracking-widest text-editorial-charcoal/50 block">{t("Current Total Impact", "إجمالي الأثر الحالي")}</span>
 <span className="text-xs font-bold text-editorial-charcoal font-mono">
 ~{calculateTotalImpact(upgradeFrequency === 'annual' ? 'annual' : 'monthly').toLocaleString()} Souls
 </span>
 </div>
 <div className="bg-emerald-500 dark:bg-emerald-500/[0.04] p-2.5 rounded-xl border border-emerald-500 dark:border-emerald-400/10">
 <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-300/80 block font-bold">{t("New Target Impact", "الأثر المستهدف الجديد")}</span>
 <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 font-mono">
 ~{calculateTotalImpact(upgradeFrequency === 'annual' ? 'annual' : 'monthly', upgradeAmount).toLocaleString()} Souls
 </span>
 </div>
 </div>
 </div>

 <button
 onClick={handleConfirmUpgrade}
 disabled={isUpgrading}
 className="w-full py-3 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream text-xs font-bold rounded-full uppercase tracking-widest transition-colors cursor-pointer"
 >
 {isUpgrading ? 'Updating schedule...' : levelUpSub.frequency !== upgradeFrequency ? 'Authorize Switch & Transfer Plan' : 'Authorize Upgraded Tier'}
 </button>
 </>
 );
 })()}
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* MODAL 2: Simulated Printable Invoice Receipt view */}
 <AnimatePresence>
 {selectedReceiptTx && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-charcoal/60 backdrop-blur-xs">
 <motion.div 
 initial={{ scale: 0.98, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.98, opacity: 0 }}
 className="bg-editorial-cream rounded-2xl border border-editorial-charcoal/20 shadow-2xl max-w-md w-full overflow-hidden"
 >
 <div className="p-4 border-b border-editorial-charcoal/10 flex items-center justify-between bg-editorial-soft/50">
 <span className="text-[9px] uppercase font-bold text-editorial-charcoal/50 tracking-[0.2em] font-mono">{t("Receipt Invoice", "إيصال الاستلام")}</span>
 <button 
 onClick={() => setSelectedReceiptTx(null)}
 className="p-1 text-editorial-charcoal/50 hover:text-editorial-charcoal rounded-full cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <div id="printable-receipt" className="p-6 space-y-6">
 {/* Header invoice details */}
 <div className="text-center pb-5 border-b border-editorial-charcoal/10 space-y-1">
 <h4 className="text-xl font-serif italic text-editorial-charcoal">{t("Better Life Friends", "أصدقاء حياة أفضل")}</h4>
 <p className="text-[9px] font-bold text-editorial-charcoal/50 uppercase tracking-widest">{t("Christian Media Evangelism Network", "شبكة الميديا المسيحية الكرازية")}</p>
 <p className="text-[10px] text-editorial-charcoal/60 font-serif italic">{t("Cairo, Egypt · support@betterlifefriend.org", "القاهرة، مصر · support@betterlifefriend.org")}</p>
 </div>

 <div className="grid grid-cols-2 gap-4 text-xs font-sans">
 <div>
 <span className="text-editorial-charcoal/40 font-bold uppercase tracking-wider text-[9px] block">{t("Settle Date", "تاريخ التسوية")}</span>
 <span className="font-bold text-editorial-charcoal">{selectedReceiptTx.date}</span>
 </div>
 <div>
 <span className="text-editorial-charcoal/40 font-bold uppercase tracking-wider text-[9px] block">{t("Donor Partner", "الشريك الداعم")}</span>
 <span className="font-bold text-editorial-charcoal">{selectedReceiptTx.donor_name}</span>
 </div>
 <div>
 <span className="text-editorial-charcoal/40 font-bold uppercase tracking-wider text-[9px] block">{t("Invoice Code", "رمز الفاتورة")}</span>
 <span className="font-mono font-bold text-editorial-charcoal">BLF-RC-{selectedReceiptTx.transaction_id.toUpperCase()}</span>
 </div>
 <div>
 <span className="text-editorial-charcoal/40 font-bold uppercase tracking-wider text-[9px] block">{t("Payment Mode", "طريقة الدفع")}</span>
 <span className="font-bold text-editorial-charcoal capitalize">{selectedReceiptTx.payment_method} Sandbox</span>
 </div>
 </div>

 {/* Ledger items */}
 <div className="border-t border-b border-editorial-charcoal/10 py-3.5 text-xs">
 <div className="flex justify-between font-bold text-editorial-charcoal/40 pb-1.5 uppercase text-[9px] tracking-widest">
 <span>{t("Operational Track allocation", "تخصيص المسار التشغيلي")}</span>
 <span>{t("Subtotal", "المجموع الفرعي")}</span>
 </div>
 <div className="flex justify-between py-2.5 border-t border-editorial-charcoal/5 text-editorial-charcoal font-semibold">
 <span className="font-serif italic text-xs">
 {tracks.find(t => t.track_id === selectedReceiptTx.track_id)?.name || 'Ministry operations'} support schedule
 </span>
 <span className="font-mono font-bold">{selectedReceiptTx.amount} EGP</span>
 </div>
 </div>

 <div className="flex justify-between items-center pt-1">
 <span className="text-xs uppercase tracking-wider font-bold text-editorial-charcoal/50">{t("Total Settled", "إجمالي المدفوع")}</span>
 <span className="text-lg font-serif italic font-bold text-editorial-charcoal">{selectedReceiptTx.amount} EGP</span>
 </div>

 <div className="p-3 bg-editorial-sand/40 border border-editorial-charcoal/10 text-editorial-charcoal/80 text-[10px] text-center font-serif italic rounded-2xl">
  Payment processed under authorized Cairo banking credentials
 </div>

 {isDownloading ? (
 <div className="p-3 text-center text-xs font-serif italic text-editorial-charcoal/60 border border-dashed border-editorial-charcoal/20 bg-editorial-card rounded-2xl">
 Simulating secure audit document packaging... Complete.
 </div>
 ) : (
 <button
 onClick={() => {
 setIsDownloading(true);
 setTimeout(() => {
 setIsDownloading(false);
 }, 2500);
 }}
 className="w-full py-3 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream font-bold text-[10px] rounded-full transition-colors cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-widest"
 >
 <Download className="w-4 h-4" />
 <span>{t("Download Audit PDF", "تحميل تقرير المعاملة")}</span>
 </button>
 )}
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Methodology Explainer Modal */}
 <MethodologyModal
 isOpen={isMethodologyOpen}
 onClose={() => setIsMethodologyOpen(false)}
 highlightTrackId={methodologyTrackId}
 />

 {/* Field Update Details Popup Modal */}
 <AnimatePresence>
 {selectedUpdate && (
 <div className="fixed inset-0 bg-editorial-charcoal/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="bg-editorial-card border border-editorial-charcoal/15 w-full max-w-xl rounded-3xl overflow-hidden shadow-xl flex flex-col"
 >
 <div className="relative h-56 bg-editorial-soft overflow-hidden border-b border-editorial-charcoal/10">
 <img 
 src={selectedUpdate.media_url || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&auto=format&fit=crop&q=80'} 
 alt={selectedUpdate.title} 
 referrerPolicy="no-referrer"
 className="w-full h-full object-cover"
 />
 <button
 onClick={() => setSelectedUpdate(null)}
 className="absolute top-4 right-4 bg-editorial-card/95 border border-editorial-charcoal/10 text-editorial-charcoal hover:bg-editorial-card w-11 h-11 flex items-center justify-center rounded-full shadow-md transition-colors cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 <span className="absolute bottom-4 left-4 text-[9px] font-bold uppercase tracking-widest bg-editorial-cream text-editorial-charcoal px-3 py-1 rounded-md border border-editorial-charcoal/10 shadow-xs">
 {selectedUpdate.category}
 </span>
 </div>

 <div className="p-6 space-y-4 text-left">
 <span className="text-[10px] uppercase font-bold text-editorial-charcoal/50 font-mono tracking-wider">
 Sowed on {selectedUpdate.publish_date}
 </span>
 <h3 className="text-xl font-serif font-bold text-editorial-charcoal leading-snug">
 {selectedUpdate.title}
 </h3>
 <div className="text-xs text-editorial-charcoal/80 leading-relaxed font-sans space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-none">
 {selectedUpdate.content.split('\n').map((para, i) => (
 <p key={i}>{para}</p>
 ))}
 </div>
 </div>

 <div className="p-4 border-t border-editorial-charcoal/5 bg-editorial-soft/25 flex justify-end">
 <button
 onClick={() => setSelectedUpdate(null)}
 className="px-5 py-2.5 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream text-[10px] uppercase tracking-widest font-bold rounded-full transition-colors cursor-pointer"
 >
 Close Update
 </button>
 </div>
 </motion.div>
 </div>
 )}
 {activeSubTab === 'prayer' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full space-y-8"
        >
          {/* Prayer Wall Section */}
 <PrayerWall currentUser={currentUser} language={language} />
        </motion.div>
      )}
</AnimatePresence>

 </div>
 );
}


      
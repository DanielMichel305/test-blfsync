import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Award, Bell, Heart, RefreshCw } from 'lucide-react';
import type { Badge, Donor, LeaderboardEntry, Subscription, Track, Transaction, UpdateFeed } from '../types';
import { useLanguage } from '../LanguageContext';
import { getLocalizedBadgeDesc, getLocalizedBadgeName, getLocalizedTrackName, getLocalizedTrackUnitLabel } from '../utils/localization';
import { calculateSubscriptionImpact, calculateTrackProgress } from '../utils/impact';
import { usePayments } from '../api/hooks';
import { MinistryFieldUpdatesFeed } from './MinistryFieldUpdatesFeed';
import { SubscriptionManager } from './SubscriptionManager';
import { canAccessReferrals } from '../utils/access';

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

export type DashboardSubTab = NonNullable<DashboardProps['activeSubTab']>;

export function getAccessibleDashboardSubTab(tab: DashboardSubTab, user: Donor): DashboardSubTab {
  return tab === 'referrals' && !canAccessReferrals(user) ? 'overview' : tab;
}

function formatSubscriptionDate(value: string | null | undefined, language: 'en' | 'ar') {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPaymentAmount(amount: number, currency: string, language: 'en' | 'ar') {
  try {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency.toUpperCase()}`;
  }
}

const DashboardOverviewPage = lazy(() => import('./LandingPage'));
const DashboardPrayerPage = lazy(() => import('./PrayerWall').then(module => ({ default: module.PrayerWall })));
const DashboardProfilePage = lazy(() => import('./DashboardProfilePage'));
const DashboardReferralsPage = lazy(() => import('./DashboardReferralsPage'));

function PageLoader() {
  return <div className="py-16 text-center text-xs text-editorial-charcoal/50">Loading page…</div>;
}

export default function Dashboard({
  currentUser, onDonateClick, tracks, subscriptions, transactions, badges,
  onUserChange, activeSubTab: externalActiveSubTab, setActiveSubTab: externalSetActiveSubTab,
  updates, leaderboard, onOpenAuth,
}: DashboardProps) {
  const { t, language } = useLanguage();
  const [internalSubTab, setInternalSubTab] = useState<'dashboard' | 'overview' | 'profile' | 'referrals' | 'prayer'>('dashboard');
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentFilters, setPaymentFilters] = useState({ startDate: '', endDate: '', sortOrder: 'DESC' as 'ASC' | 'DESC' });
  const activeSubTab = externalActiveSubTab ?? internalSubTab;
  const setActiveSubTab = externalSetActiveSubTab ?? setInternalSubTab;
  const accessibleSubTab = getAccessibleDashboardSubTab(activeSubTab, currentUser);
  const payments = usePayments({ page: paymentsPage, limit: 20, ...paymentFilters }, activeSubTab === 'dashboard');

  useEffect(() => {
    if (accessibleSubTab !== activeSubTab) setActiveSubTab(accessibleSubTab);
  }, [accessibleSubTab, activeSubTab, setActiveSubTab]);

  if (accessibleSubTab === 'overview') return <Suspense fallback={<PageLoader />}><DashboardOverviewPage currentUser={currentUser} onDonateClick={onDonateClick} tracks={tracks} updates={updates} subscriptions={subscriptions} transactions={transactions} badges={badges} leaderboard={leaderboard} onUserChange={onUserChange} onOpenAuth={onOpenAuth} /></Suspense>;
  if (accessibleSubTab === 'prayer') return <Suspense fallback={<PageLoader />}><DashboardPrayerPage currentUser={currentUser} /></Suspense>;
  if (accessibleSubTab === 'profile') return <Suspense fallback={<PageLoader />}><DashboardProfilePage currentUser={currentUser} /></Suspense>;
  if (accessibleSubTab === 'referrals') return <Suspense fallback={<PageLoader />}><DashboardReferralsPage /></Suspense>;

  return (
    <section className="py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div><p className="text-[10px] uppercase tracking-[0.25em] font-bold text-editorial-charcoal/45">{t('Partner dashboard', 'لوحة الشريك')}</p><h1 className="mt-2 text-4xl sm:text-6xl font-serif text-editorial-charcoal">{t('Hello, ', 'مرحباً، ')}{currentUser.name}</h1></div>
        <button onClick={() => setActiveSubTab('prayer')} className="rounded-full bg-editorial-charcoal px-5 py-3 text-[10px] uppercase tracking-widest font-bold text-editorial-cream flex items-center gap-2"><Heart className="w-4 h-4" />{t('Open Prayer Wall', 'افتح حائط الصلاة')}</button>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[28px] bg-emerald-900 text-white p-7"><Bell className="w-5 h-5 text-emerald-300" /><p className="mt-8 text-[10px] uppercase tracking-widest text-white/50">{t('Visible updates', 'التحديثات المتاحة')}</p><p className="mt-2 text-4xl font-serif">{updates.length}</p></div>
        <div className="rounded-[28px] bg-editorial-card border border-editorial-charcoal/10 p-7"><Award className="w-5 h-5 text-amber-600" /><p className="mt-8 text-[10px] uppercase tracking-widest text-editorial-charcoal/45">{t('Earned badges', 'الشارات المكتسبة')}</p><p className="mt-2 text-4xl font-serif">{badges.length}</p></div>
        <div className="rounded-[28px] bg-editorial-card border border-editorial-charcoal/10 p-7"><Heart className="w-5 h-5 text-rose-600" /><p className="mt-8 text-[10px] uppercase tracking-widest text-editorial-charcoal/45">{t('Ministry tracks', 'مسارات الخدمة')}</p><p className="mt-2 text-4xl font-serif">{tracks.length}</p></div>
      </div>

      <MinistryFieldUpdatesFeed />

      <div className="rounded-[32px] bg-editorial-card border border-editorial-charcoal/10 p-6 md:p-8 shadow-sm">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-editorial-charcoal/45">{t('Recurring support', 'الدعم المتكرر')}</p>
          <h2 className="mt-1 text-2xl font-serif">{t('Your subscriptions', 'اشتراكاتك')}</h2>
          <p className="mt-2 text-xs text-editorial-charcoal/55">{t('Review or modify the recurring support connected to your ministry tracks.', 'راجع أو عدّل الدعم المتكرر المرتبط بمسارات خدمتك.')}</p>
        </div>
        {subscriptions.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-editorial-charcoal/15 p-5 text-xs text-editorial-charcoal/50">{t('You do not have any active recurring subscriptions.', 'ليس لديك أي اشتراكات متكررة نشطة.')}</p>
        ) : <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map(subscription => {
            const track = tracks.find(candidate => candidate.track_id === subscription.track_id);
            if (!track) return null;
            const impact = calculateSubscriptionImpact(track, subscription.amount, subscription.frequency);
            const subscriptionDate = formatSubscriptionDate(subscription.current_period_end, language);
            const isCancelled = subscription.status === 'canceled';
            return <article key={subscription.subscription_id} className="rounded-2xl border border-editorial-charcoal/10 p-5">
              <div className="flex justify-between gap-3"><h3 className="font-serif text-lg">{getLocalizedTrackName(track.track_id, track.name, language)}</h3><span className="text-xs font-bold">{calculateTrackProgress(track)}%</span></div>
              <div className="mt-3 h-1.5 rounded-full bg-editorial-charcoal/10"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${calculateTrackProgress(track)}%` }} /></div>
              <p className="mt-3 text-[10px] text-editorial-charcoal/55">{track.current_raised.toLocaleString()} / {track.annual_target.toLocaleString()} {getLocalizedTrackUnitLabel(track.track_id, track.target_unit_label, language)} · {track.target_period}</p>
              <p className="mt-2 text-[10px] text-editorial-charcoal/45">~{Math.round(impact.monthlyUnits).toLocaleString()} {track.target_unit_label} / {t('month', 'شهر')}</p>
              {subscriptionDate && <p className="mt-2 text-[10px] text-editorial-charcoal/55">{isCancelled ? t('Ends at', 'ينتهي في') : t('Renews at', 'يتجدد في')}: {subscriptionDate}</p>}
              {isCancelled ? <p className="mt-5 text-xs font-bold text-editorial-charcoal/55">{t('Cancelled', 'ملغى')}</p> : <SubscriptionManager subscription={subscription} track={track} />}
            </article>;
          })}
        </div>}
      </div>

      {badges.length > 0 && <div className="rounded-[32px] bg-editorial-card border border-editorial-charcoal/10 p-6 md:p-8"><h2 className="text-2xl font-serif">{t('Badges', 'الشارات')}</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{badges.map(badge => <div key={badge.badge_id} className="rounded-2xl bg-amber-500/10 border border-amber-500/15 p-4"><p className="font-bold text-sm">{getLocalizedBadgeName(badge.badge_type, badge.name, language)}</p><p className="mt-1 text-xs text-editorial-charcoal/60">{getLocalizedBadgeDesc(badge.badge_type, badge.description, language)}</p></div>)}</div></div>}

      <div className="rounded-[32px] bg-editorial-card border border-editorial-charcoal/10 p-6 md:p-8"><div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-serif">Giving history</h2><p className="mt-1 text-xs text-editorial-charcoal/50">Live payment records from the API.</p></div><button type="button" onClick={() => void payments.refetch()} disabled={payments.isFetching} className="inline-flex items-center gap-2 rounded-full border border-editorial-charcoal/15 px-4 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${payments.isFetching ? 'animate-spin' : ''}`} />Refresh</button></div>{payments.isLoading ? <p className="mt-5 text-xs text-editorial-charcoal/50">Loading payments…</p> : payments.error ? <p role="alert" className="mt-5 text-xs text-rose-600">Payment history could not be loaded.</p> : !payments.data?.payments.length ? <p className="mt-5 text-xs text-editorial-charcoal/50">No payments yet.</p> : <><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="border-b text-[9px] uppercase tracking-widest text-editorial-charcoal/45"><tr><th className="py-3">Date</th><th>Track</th><th>Status</th><th>Amount</th><th>Receipt</th></tr></thead><tbody>{payments.data.payments.map(payment => <tr key={payment.id} className="border-b border-editorial-charcoal/5"><td className="py-4 whitespace-nowrap">{formatSubscriptionDate(payment.occurredAt, language) || '—'}</td><td>{payment.track?.name as string || payment.track?.title as string || '—'}</td><td className="capitalize">{payment.status}</td><td>{formatPaymentAmount(payment.amount, payment.currency, language)}</td><td>{payment.receipt.available && payment.receipt.url ? <a href={payment.receipt.url} target="_blank" rel="noreferrer" className="font-bold text-emerald-700 underline">Open receipt</a> : '—'}</td></tr>)}</tbody></table></div>{payments.data.totalPages > 1 && <nav aria-label="Giving history pagination" className="mt-5 flex items-center justify-between gap-4 text-xs"><span className="text-editorial-charcoal/50">Page {payments.data.page} of {payments.data.totalPages} · {payments.data.total.toLocaleString()} transactions</span><div className="flex gap-2"><button type="button" onClick={() => setPaymentsPage(page => Math.max(1, page - 1))} disabled={paymentsPage <= 1 || payments.isFetching} className="rounded-full border border-editorial-charcoal/15 px-3 py-1.5 disabled:opacity-50">Previous</button><button type="button" onClick={() => setPaymentsPage(page => Math.min(payments.data?.totalPages ?? page, page + 1))} disabled={paymentsPage >= payments.data.totalPages || payments.isFetching} className="rounded-full border border-editorial-charcoal/15 px-3 py-1.5 disabled:opacity-50">Next</button></div></nav>}</>}</div>
    </section>
  );
}

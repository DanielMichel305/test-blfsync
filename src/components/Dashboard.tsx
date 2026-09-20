import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Award, Bell, ChevronRight, Clock3, Heart, RefreshCw, X } from 'lucide-react';
import type { Badge, Donor, LeaderboardEntry, Subscription, Track, Transaction, UpdateFeed } from '../types';
import { BadgeProgress } from './BadgeProgress';
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

function BadgeDetailsModal({ badges, language, onClose }: { badges: Badge[]; language: 'en' | 'ar'; onClose: () => void }) {
  const { t } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();
    return () => { document.removeEventListener('keydown', onKeyDown); previousFocus?.focus(); };
  }, [onClose]);

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} id="badge-details-dialog" role="dialog" aria-modal="true" aria-labelledby="badge-details-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-editorial-card p-5 shadow-2xl sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-widest text-editorial-charcoal/45">{t('Account progress', 'تقدّم الحساب')}</p><h2 id="badge-details-title" className="mt-1 font-serif text-2xl">{t('All badges', 'كل الشارات')}</h2></div><button ref={closeRef} type="button" onClick={onClose} aria-label={t('Close badge details', 'إغلاق تفاصيل الشارات')} className="rounded-full border border-editorial-charcoal/15 p-2"><X className="h-4 w-4" /></button></div>
      {!badges.length ? <p className="mt-5 rounded-xl border border-dashed border-editorial-charcoal/15 p-4 text-sm text-editorial-charcoal/55">{t('There are no active badges to track yet.', 'لا توجد شارات نشطة لتتبّعها بعد.')}</p> : <div className="mt-5 space-y-3">{badges.map(badge => <article key={badge.badge_id} className={`rounded-2xl border p-4 ${badge.earned ? 'border-amber-500/20 bg-amber-500/10' : 'border-editorial-charcoal/10 bg-editorial-charcoal/[0.03]'}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-sm">{getLocalizedBadgeName(badge.badge_type, badge.name, language)}</h3><p className="mt-1 text-xs leading-relaxed text-editorial-charcoal/65">{getLocalizedBadgeDesc(badge.badge_type, badge.description, language)}</p></div><span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${badge.earned ? 'bg-amber-500/15 text-amber-800' : 'bg-editorial-charcoal/10 text-editorial-charcoal/60'}`}>{badge.earned ? <Award className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}{badge.earned ? t('Awarded', 'مكتسبة') : t('In progress', 'قيد التقدم')}</span></div><BadgeProgress progress={badge.progress} tone={badge.earned ? 'emerald' : 'amber'} /></article>)}</div>}
    </section>
  </div>;
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
  const [badgeDetailsOpen, setBadgeDetailsOpen] = useState(false);
  const activeSubTab = externalActiveSubTab ?? internalSubTab;
  const setActiveSubTab = externalSetActiveSubTab ?? setInternalSubTab;
  const accessibleSubTab = getAccessibleDashboardSubTab(activeSubTab, currentUser);
  const payments = usePayments({ page: paymentsPage, limit: 20, ...paymentFilters }, activeSubTab === 'dashboard');
  const awardedBadges = badges.filter(badge => badge.earned);
  const inProgressBadges = badges.filter(badge => !badge.earned);
  const inlineBadges = badges.slice(0, 3);
  const activeSubscriptionCount = subscriptions.filter(subscription => subscription.status === 'active').length;

  useEffect(() => {
    if (accessibleSubTab !== activeSubTab) setActiveSubTab(accessibleSubTab);
  }, [accessibleSubTab, activeSubTab, setActiveSubTab]);

  if (accessibleSubTab === 'overview') return <Suspense fallback={<PageLoader />}><DashboardOverviewPage currentUser={currentUser} onDonateClick={onDonateClick} tracks={tracks} updates={updates} subscriptions={subscriptions} transactions={transactions} badges={badges} leaderboard={leaderboard} onUserChange={onUserChange} onOpenAuth={onOpenAuth} /></Suspense>;
  if (accessibleSubTab === 'prayer') return <Suspense fallback={<PageLoader />}><DashboardPrayerPage currentUser={currentUser} /></Suspense>;
  if (accessibleSubTab === 'profile') return <Suspense fallback={<PageLoader />}><DashboardProfilePage currentUser={currentUser} onUserChange={onUserChange} /></Suspense>;
  if (accessibleSubTab === 'referrals') return <Suspense fallback={<PageLoader />}><DashboardReferralsPage /></Suspense>;

  return (
    <section className="py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div><p className="text-[10px] uppercase tracking-[0.25em] font-bold text-editorial-charcoal/45">{t('Partner dashboard', 'لوحة الشريك')}</p><h1 className="mt-2 text-4xl sm:text-6xl font-serif text-editorial-charcoal">{t('Hello, ', 'مرحباً، ')}{currentUser.name}</h1></div>
        <button onClick={() => setActiveSubTab('prayer')} className="rounded-full bg-editorial-charcoal px-5 py-3 text-[10px] uppercase tracking-widest font-bold text-editorial-cream flex items-center gap-2"><Heart className="w-4 h-4" />{t('Open Prayer Wall', 'افتح حائط الصلاة')}</button>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[20px] bg-emerald-900 p-3 text-white sm:px-4 sm:py-3"><Bell className="h-3.5 w-3.5 text-emerald-300" /><p className="mt-3 text-[9px] font-bold uppercase tracking-widest text-white/50">{t('Visible updates', 'التحديثات المتاحة')}</p><p className="mt-0.5 text-2xl font-serif">{updates.length}</p></div>
        <div className="rounded-[20px] border border-editorial-charcoal/10 bg-editorial-card p-3 sm:px-4 sm:py-3"><Award className="h-3.5 w-3.5 text-amber-600" /><p className="mt-3 text-[9px] font-bold uppercase tracking-widest text-editorial-charcoal/45">{t('Badge collection', 'مجموعة الشارات')}</p><p className="mt-0.5 text-xs text-editorial-charcoal/65">{t(`${awardedBadges.length} awarded · ${inProgressBadges.length} in progress`, `${awardedBadges.length} مكتسبة · ${inProgressBadges.length} قيد التقدم`)}</p></div>
        <div className="rounded-[20px] border border-editorial-charcoal/10 bg-editorial-card p-3 sm:px-4 sm:py-3"><Heart className="h-3.5 w-3.5 text-rose-600" /><p className="mt-3 text-[9px] font-bold uppercase tracking-widest text-editorial-charcoal/45">{t('Active subscriptions', 'الاشتراكات النشطة')}</p><p className="mt-0.5 text-2xl font-serif">{activeSubscriptionCount}</p></div>
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

      <section aria-labelledby="badge-collection-title" className="rounded-[28px] border border-editorial-charcoal/10 bg-editorial-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-widest text-editorial-charcoal/45">{t('Account progress', 'تقدّم الحساب')}</p><h2 id="badge-collection-title" className="mt-1 text-2xl font-serif">{t('Your badges', 'شاراتك')}</h2></div><button type="button" aria-haspopup="dialog" aria-expanded={badgeDetailsOpen} aria-controls="badge-details-dialog" onClick={() => setBadgeDetailsOpen(true)} className="inline-flex items-center gap-1 rounded-full border border-editorial-charcoal/15 px-3 py-1.5 text-xs font-bold">{t('View all badges', 'عرض كل الشارات')}<ChevronRight className="h-3.5 w-3.5" /></button></div>
        {badges.length === 0 ? <p className="mt-4 rounded-2xl border border-dashed border-editorial-charcoal/15 p-4 text-xs text-editorial-charcoal/50">{t('There are no active badges to track yet.', 'لا توجد شارات نشطة لتتبّعها بعد.')}</p> : <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">{inlineBadges.map((badge, index) => <article key={badge.badge_id} className={`min-w-0 rounded-xl border p-3 ${badge.earned ? 'border-amber-500/20 bg-amber-500/10' : 'border-editorial-charcoal/10 bg-editorial-charcoal/[0.03]'} ${index === 2 ? 'opacity-50' : ''}`}><span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide ${badge.earned ? 'text-amber-800' : 'text-editorial-charcoal/60'}`}>{badge.earned ? <Award className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}{badge.earned ? t('Awarded', 'مكتسبة') : t('In progress', 'قيد التقدم')}</span><p className="mt-2 truncate text-xs font-bold">{getLocalizedBadgeName(badge.badge_type, badge.name, language)}</p><BadgeProgress progress={badge.progress} tone={badge.earned ? 'emerald' : 'amber'} /></article>)}</div>}
      </section>
      {badgeDetailsOpen && <BadgeDetailsModal badges={badges} language={language} onClose={() => setBadgeDetailsOpen(false)} />}

      <div className="rounded-[32px] bg-editorial-card border border-editorial-charcoal/10 p-6 md:p-8"><div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-serif">Giving history</h2><p className="mt-1 text-xs text-editorial-charcoal/50">Live payment records from the API.</p></div><button type="button" onClick={() => void payments.refetch()} disabled={payments.isFetching} className="inline-flex items-center gap-2 rounded-full border border-editorial-charcoal/15 px-4 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${payments.isFetching ? 'animate-spin' : ''}`} />Refresh</button></div>{payments.isLoading ? <p className="mt-5 text-xs text-editorial-charcoal/50">Loading payments…</p> : payments.error ? <p role="alert" className="mt-5 text-xs text-rose-600">Payment history could not be loaded.</p> : !payments.data?.payments.length ? <p className="mt-5 text-xs text-editorial-charcoal/50">No payments yet.</p> : <><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="border-b text-[9px] uppercase tracking-widest text-editorial-charcoal/45"><tr><th className="py-3">Date</th><th>Track</th><th>Status</th><th>Amount</th><th>Receipt</th></tr></thead><tbody>{payments.data.payments.map(payment => <tr key={payment.id} className="border-b border-editorial-charcoal/5"><td className="py-4 whitespace-nowrap">{formatSubscriptionDate(payment.occurredAt, language) || '—'}</td><td>{payment.track?.name as string || payment.track?.title as string || '—'}</td><td className="capitalize">{payment.status}</td><td>{formatPaymentAmount(payment.amount, payment.currency, language)}</td><td>{payment.receipt.available && payment.receipt.url ? <a href={payment.receipt.url} target="_blank" rel="noreferrer" className="font-bold text-emerald-700 underline">Open receipt</a> : '—'}</td></tr>)}</tbody></table></div>{payments.data.totalPages > 1 && <nav aria-label="Giving history pagination" className="mt-5 flex items-center justify-between gap-4 text-xs"><span className="text-editorial-charcoal/50">Page {payments.data.page} of {payments.data.totalPages} · {payments.data.total.toLocaleString()} transactions</span><div className="flex gap-2"><button type="button" onClick={() => setPaymentsPage(page => Math.max(1, page - 1))} disabled={paymentsPage <= 1 || payments.isFetching} className="rounded-full border border-editorial-charcoal/15 px-3 py-1.5 disabled:opacity-50">Previous</button><button type="button" onClick={() => setPaymentsPage(page => Math.min(payments.data?.totalPages ?? page, page + 1))} disabled={paymentsPage >= payments.data.totalPages || payments.isFetching} className="rounded-full border border-editorial-charcoal/15 px-3 py-1.5 disabled:opacity-50">Next</button></div></nav>}</>}</div>
    </section>
  );
}

import React, { useState } from 'react';
import { Award, Bell, Heart, Info, Plus, RefreshCw, Send, User } from 'lucide-react';
import type { Badge, Donor, LeaderboardEntry, Subscription, Track, Transaction, UpdateFeed } from '../types';
import { useLanguage } from '../LanguageContext';
import { getLocalizedBadgeDesc, getLocalizedBadgeName, getLocalizedTrackName, getLocalizedTrackUnitLabel } from '../utils/localization';
import { calculateSubscriptionImpact, calculateTrackProgress } from '../utils/impact';
import { PrayerWall } from './PrayerWall';
import LandingPage from './LandingPage';
import { useCreateReferral, usePayments, useReferrals, useResendReferral } from '../api/hooks';

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

function ReferralsPanel() {
  const list = useReferrals({ page: 1, limit: 50 });
  const create = useCreateReferral();
  const resend = useResendReferral();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [message, setMessage] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      await create.mutateAsync(form);
      setForm({ firstName: '', lastName: '', email: '' });
      setMessage('Referral invitation sent.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Referral could not be sent.');
    }
  };
  return <section className="mx-auto max-w-4xl space-y-6 py-10"><div><p className="text-[10px] font-bold uppercase tracking-widest text-editorial-charcoal/45">Invite your community</p><h1 className="mt-2 text-4xl font-serif">Referrals</h1></div><form onSubmit={submit} className="grid gap-3 rounded-[28px] border bg-editorial-card p-5 sm:grid-cols-3"><input required maxLength={50} placeholder="First name" value={form.firstName} onChange={event => setForm(value => ({ ...value, firstName: event.target.value }))} className="rounded-xl border bg-transparent p-3 text-xs" /><input required maxLength={50} placeholder="Last name" value={form.lastName} onChange={event => setForm(value => ({ ...value, lastName: event.target.value }))} className="rounded-xl border bg-transparent p-3 text-xs" /><input required type="email" placeholder="Email" value={form.email} onChange={event => setForm(value => ({ ...value, email: event.target.value }))} className="rounded-xl border bg-transparent p-3 text-xs" />{message && <p className="text-xs sm:col-span-3">{message}</p>}<button disabled={create.isPending} className="flex items-center justify-center gap-2 rounded-full bg-editorial-charcoal px-5 py-3 text-xs font-bold text-editorial-cream sm:col-span-3"><Send className="h-4 w-4" />Send referral</button></form><div className="space-y-3">{list.isLoading ? <p className="text-xs">Loading referrals…</p> : list.error ? <p role="alert" className="text-xs text-rose-600">Referrals could not be loaded.</p> : !list.data?.referrals.length ? <p className="rounded-2xl border bg-editorial-card p-5 text-xs text-editorial-charcoal/50">No referrals yet.</p> : list.data.referrals.map(referral => <article key={referral.id} className="flex flex-wrap items-center gap-4 rounded-2xl border bg-editorial-card p-4"><div className="min-w-0 flex-1"><p className="font-bold">{referral.firstName} {referral.lastName}</p><p className="text-[10px] text-editorial-charcoal/50">{referral.email} · {referral.status} · delivery {referral.deliveryStatus || 'pending'}</p></div>{['pending', 'invited', 'expired'].includes(referral.status) && <button disabled={resend.isPending} onClick={() => resend.mutate(referral.id)} className="flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold"><RefreshCw className="h-3.5 w-3.5" />Resend</button>}</article>)}</div></section>;
}

function ContractBlocker({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs leading-relaxed text-editorial-charcoal/70 flex gap-3"><Info className="w-4 h-4 shrink-0 text-amber-700" />{children}</div>;
}

export default function Dashboard({
  currentUser, onDonateClick, tracks, subscriptions, transactions, badges,
  onUserChange, activeSubTab: externalActiveSubTab, setActiveSubTab: externalSetActiveSubTab,
  updates, leaderboard, onOpenAuth,
}: DashboardProps) {
  const { t, language } = useLanguage();
  const [internalSubTab, setInternalSubTab] = useState<'dashboard' | 'overview' | 'profile' | 'referrals' | 'prayer'>('dashboard');
  const activeSubTab = externalActiveSubTab ?? internalSubTab;
  const setActiveSubTab = externalSetActiveSubTab ?? setInternalSubTab;
  const payments = usePayments({ page: 1, limit: 20 }, activeSubTab === 'dashboard');

  if (activeSubTab === 'overview') {
    return <LandingPage currentUser={currentUser} onDonateClick={onDonateClick} tracks={tracks} updates={updates} subscriptions={subscriptions} transactions={transactions} badges={badges} leaderboard={leaderboard} onUserChange={onUserChange} onOpenAuth={onOpenAuth} />;
  }

  if (activeSubTab === 'prayer') return <PrayerWall currentUser={currentUser} />;

  if (activeSubTab === 'profile') {
    return <section className="max-w-3xl mx-auto py-10 space-y-6">
      <div className="rounded-[32px] bg-editorial-card border border-editorial-charcoal/10 p-8 shadow-sm">
        <div className="flex items-center gap-4"><div className="w-14 h-14 rounded-full bg-editorial-charcoal/5 flex items-center justify-center"><User className="w-6 h-6" /></div><div><p className="text-[10px] uppercase tracking-widest text-editorial-charcoal/45">{t('Profile', 'الملف الشخصي')}</p><h1 className="text-3xl font-serif">{currentUser.name}</h1></div></div>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-editorial-charcoal/5 p-4"><dt className="text-[9px] uppercase font-bold text-editorial-charcoal/45">{t('Email', 'البريد الإلكتروني')}</dt><dd className="mt-1 text-sm">{currentUser.email}</dd></div><div className="rounded-2xl bg-editorial-charcoal/5 p-4"><dt className="text-[9px] uppercase font-bold text-editorial-charcoal/45">{t('Partner role', 'دور الشريك')}</dt><dd className="mt-1 text-sm capitalize">{currentUser.api_role}</dd></div></dl>
      </div>
      <ContractBlocker>{t('The update endpoint accepts phone, referral source, and communication opt-in, but the User response still omits those fields. Editing remains disabled until the API can return their current saved values.', 'تقبل نقطة التحديث الهاتف ومصدر الإحالة وتفضيل التواصل، لكن استجابة المستخدم لا تعرض هذه الحقول بعد. سيظل التعديل معطلاً حتى تعيد الواجهة القيم المحفوظة الحالية.')}</ContractBlocker>
    </section>;
  }

  if (activeSubTab === 'referrals') {
    return <ReferralsPanel />;
  }

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

      <div className="rounded-[32px] bg-editorial-card border border-editorial-charcoal/10 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-widest text-editorial-charcoal/45">{t('API ministry data', 'بيانات الخدمة')}</p><h2 className="mt-1 text-2xl font-serif">{t('Support a ministry track', 'ادعم مسار خدمة')}</h2></div><Plus className="w-5 h-5 text-editorial-charcoal/35" /></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map(track => {
            const impact = calculateSubscriptionImpact(track, track.min_monthly_gift, 'monthly');
            return <article key={track.track_id} className="rounded-2xl border border-editorial-charcoal/10 p-5">
              <div className="flex justify-between gap-3"><h3 className="font-serif text-lg">{getLocalizedTrackName(track.track_id, track.name, language)}</h3><span className="text-xs font-bold">{calculateTrackProgress(track)}%</span></div>
              <div className="mt-3 h-1.5 rounded-full bg-editorial-charcoal/10"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${calculateTrackProgress(track)}%` }} /></div>
              <p className="mt-3 text-[10px] text-editorial-charcoal/55">{track.current_raised.toLocaleString()} / {track.annual_target.toLocaleString()} {getLocalizedTrackUnitLabel(track.track_id, track.target_unit_label, language)} · {track.target_period}</p>
              <p className="mt-2 text-[10px] text-editorial-charcoal/45">~{Math.round(impact.monthlyUnits).toLocaleString()} {track.target_unit_label} / {t('month', 'شهر')} · ${track.min_monthly_gift}</p>
              <button onClick={() => onDonateClick(track, track.min_monthly_gift, 'monthly')} className="mt-5 w-full rounded-full bg-editorial-charcoal py-2.5 text-[9px] uppercase tracking-widest font-bold text-editorial-cream">{t('Support this track', 'ادعم هذا المسار')}</button>
            </article>;
          })}
        </div>
      </div>

      {badges.length > 0 && <div className="rounded-[32px] bg-editorial-card border border-editorial-charcoal/10 p-6 md:p-8"><h2 className="text-2xl font-serif">{t('Badges', 'الشارات')}</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{badges.map(badge => <div key={badge.badge_id} className="rounded-2xl bg-amber-500/10 border border-amber-500/15 p-4"><p className="font-bold text-sm">{getLocalizedBadgeName(badge.badge_type, badge.name, language)}</p><p className="mt-1 text-xs text-editorial-charcoal/60">{getLocalizedBadgeDesc(badge.badge_type, badge.description, language)}</p></div>)}</div></div>}

      <div className="rounded-[32px] bg-editorial-card border border-editorial-charcoal/10 p-6 md:p-8"><h2 className="text-2xl font-serif">Giving history</h2>{payments.isLoading ? <p className="mt-5 text-xs text-editorial-charcoal/50">Loading payments…</p> : payments.error ? <p role="alert" className="mt-5 text-xs text-rose-600">Payment history could not be loaded.</p> : !payments.data?.payments.length ? <p className="mt-5 text-xs text-editorial-charcoal/50">No payments yet.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="border-b text-[9px] uppercase tracking-widest text-editorial-charcoal/45"><tr><th className="py-3">Status</th><th>Type</th><th>Amount</th><th>Receipt</th></tr></thead><tbody>{payments.data.payments.map(payment => <tr key={payment.id} className="border-b border-editorial-charcoal/5"><td className="py-4"><span className="font-bold capitalize">{payment.status.replace('_', ' ')}</span><span className="block font-mono text-[9px] text-editorial-charcoal/40">{payment.paymentRequestId}</span></td><td className="capitalize">{payment.type}{payment.interval ? ` · ${payment.interval}` : ''}</td><td>${payment.amount.toLocaleString()} {payment.currency.toUpperCase()}</td><td>{payment.receipt.available && payment.receipt.url ? <a href={payment.receipt.url} target="_blank" rel="noreferrer" className="font-bold text-emerald-700 underline">Open receipt</a> : 'Pending'}</td></tr>)}</tbody></table></div>}</div>
    </section>
  );
}

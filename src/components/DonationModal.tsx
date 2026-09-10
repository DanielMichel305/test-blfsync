import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CheckCircle2, ExternalLink, Heart, Loader2, XCircle } from 'lucide-react';
import type { Badge, Donor, Track } from '../types';
import { useLanguage } from '../LanguageContext';
import { getLocalizedTrackName, getLocalizedTrackUnitLabel } from '../utils/localization';
import { calculateSubscriptionImpact } from '../utils/impact';
import { useCreateCheckout, useCreateGuestCheckout } from '../api/hooks';
import { ApiError } from '../api/client';
import { PENDING_CHECKOUT_KEY } from './RoutePages';

interface DonationModalProps {
  track: Track;
  currentUser: Donor | null;
  initialAmount: number;
  initialFrequency: 'monthly' | 'annual' | 'one-time';
  onClose: () => void;
  onSuccess: (user: Donor, badges: Badge[]) => void;
  onOpenAuth: () => void;
}

type CheckoutState = 'ready' | 'pending' | 'completed' | 'failed' | 'expired';

export default function DonationModal({ track, currentUser, initialAmount, initialFrequency, onClose, onSuccess, onOpenAuth }: DonationModalProps) {
  const { t, language } = useLanguage();
  const checkout = useCreateCheckout();
  const guestCheckout = useCreateGuestCheckout();
  const [amount, setAmount] = useState(Math.max(1, Math.round(initialAmount)));
  const [frequency, setFrequency] = useState(currentUser ? initialFrequency : 'one-time');
  const [guest, setGuest] = useState({ name: '', email: '' });
  const [status, setStatus] = useState<CheckoutState>('ready');
  const [error, setError] = useState('');
  const [paymentRequestId, setPaymentRequestId] = useState<string | null>(null);
  const hasStartedCheckout = useRef(false);

  const minimum = frequency === 'one-time' ? 1 : frequency === 'annual' ? Math.ceil(track.min_monthly_gift * 12) : Math.ceil(track.min_monthly_gift);
  const impact = useMemo(() => calculateSubscriptionImpact(track, amount, frequency === 'annual' ? 'annual' : 'monthly'), [track, amount, frequency]);

  const startCheckout = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!Number.isInteger(amount) || amount < minimum || amount > 999999) {
      setError(t(`Enter a whole USD amount from $${minimum} to $999,999.`, `أدخل مبلغاً صحيحاً بالدولار من ${minimum}$ إلى 999,999$.`));
      return;
    }

    setError('');
    setStatus('pending');
    try {
      if (!currentUser) {
        if (!guest.name.trim() || !/^\S+@\S+\.\S+$/.test(guest.email)) {
          setStatus('ready');
          setError(t('Enter your name and a valid email address.', 'أدخل اسمك وعنوان بريد إلكتروني صالحاً.'));
          return;
        }
        const result = await guestCheckout.mutateAsync({ name: guest.name.trim(), email: guest.email.trim(), amount, currency: 'usd', ministryTrackId: track.track_id, idempotencyKey: crypto.randomUUID(), type: 'one-time' });
        setStatus(result.status);
        setPaymentRequestId(result.paymentRequestId);
        localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify({ paymentRequestId: result.paymentRequestId, guestCheckoutId: result.guestCheckoutId, verificationToken: result.verificationToken, ministryTrackId: track.track_id, amount, frequency: 'one-time' }));
        window.location.assign(result.status === 'pending' ? result.checkout.url : '/payments/success');
        return;
      }
      const result = await checkout.mutateAsync({
        subscriptionAmount: amount,
        subscriptionCurrency: 'usd',
        ministryTrackId: track.track_id,
        idempotencyKey: crypto.randomUUID(),
        subscriptionType: frequency === 'one-time' ? 'one-time' : 'recurring',
        ...(frequency === 'one-time' ? {} : { interval: frequency === 'annual' ? 'year' as const : 'month' as const }),
      });
      setStatus(result.status);
      setPaymentRequestId(result.paymentRequestId);
      if (result.status === 'pending') {
        localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify({ paymentRequestId: result.paymentRequestId, commitmentId: result.commitmentId, subscriptionId: result.subscriptionId, ministryTrackId: track.track_id, amount, frequency }));
        window.location.assign(result.checkout.url);
      }
    } catch (requestError) {
      setStatus('failed');
      setError(requestError instanceof ApiError ? requestError.message : t('Checkout could not be created.', 'تعذر إنشاء عملية الدفع.'));
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    if (hasStartedCheckout.current) return;
    hasStartedCheckout.current = true;
    void startCheckout();
  }, [currentUser]);

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div role="dialog" aria-modal="true" aria-labelledby="checkout-title" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }} onClick={event => event.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-[32px] border border-editorial-charcoal/10 bg-editorial-card shadow-2xl">
          <div className="bg-editorial-charcoal text-editorial-cream p-7 flex items-start justify-between gap-5">
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-editorial-cream/50 font-bold">{t('Secure Stripe Checkout', 'دفع آمن عبر Stripe')}</p>
              <h2 id="checkout-title" className="mt-2 text-3xl font-serif">{getLocalizedTrackName(track.track_id, track.name, language)}</h2>
              <p className="mt-2 text-xs text-editorial-cream/60">{t('Amounts are charged in whole USD through hosted checkout.', 'يتم تحصيل المبالغ بالدولار الصحيح من خلال صفحة الدفع المستضافة.')}</p>
            </div>
            <button onClick={onClose} className="rounded-full border border-white/15 p-2 hover:bg-white/10" aria-label={t('Close', 'إغلاق')}><XCircle className="w-5 h-5" /></button>
          </div>

          <div className="p-7 space-y-6">
            {status === 'completed' ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="mt-4 text-2xl font-serif">{t('Checkout completed', 'اكتملت عملية الدفع')}</h3>
                <button onClick={() => onSuccess(currentUser!, [])} className="mt-6 rounded-full bg-editorial-charcoal px-6 py-3 text-xs font-bold uppercase tracking-widest text-editorial-cream">{t('Done', 'تم')}</button>
              </div>
            ) : status === 'expired' ? (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5 text-sm">{t('This checkout session expired. Start a new attempt when you are ready.', 'انتهت جلسة الدفع. ابدأ محاولة جديدة عندما تكون مستعداً.')}</div>
            ) : (
              <>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-editorial-charcoal/50">{t('Giving frequency', 'تكرار العطاء')}</label>
                  <div className="grid grid-cols-3 gap-2 mt-2 rounded-full bg-editorial-charcoal/5 p-1">
                    {(currentUser ? ['monthly', 'annual', 'one-time'] as const : ['one-time'] as const).map(option => (
                      <button key={option} type="button" onClick={() => { setFrequency(option); setStatus('ready'); }} className={`rounded-full px-3 py-2 text-[10px] uppercase font-bold ${frequency === option ? 'bg-editorial-charcoal text-editorial-cream' : 'text-editorial-charcoal/60'}`}>{option}</button>
                    ))}
                  </div>
                </div>

                {!currentUser && <div className="grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-bold uppercase tracking-widest text-editorial-charcoal/50">{t('Your name', 'اسمك')}<input required value={guest.name} onChange={event => setGuest(value => ({ ...value, name: event.target.value }))} className="mt-2 w-full rounded-xl border bg-transparent p-3 text-xs font-normal normal-case tracking-normal" /></label><label className="text-[10px] font-bold uppercase tracking-widest text-editorial-charcoal/50">{t('Email', 'البريد الإلكتروني')}<input required type="email" value={guest.email} onChange={event => setGuest(value => ({ ...value, email: event.target.value }))} className="mt-2 w-full rounded-xl border bg-transparent p-3 text-xs font-normal normal-case tracking-normal" /></label></div>}

                <div>
                  <label htmlFor="checkout-amount" className="text-[10px] font-bold uppercase tracking-widest text-editorial-charcoal/50">{t('Amount (USD)', 'المبلغ (دولار)')}</label>
                  <div className="mt-2 flex items-center rounded-2xl border border-editorial-charcoal/15 bg-editorial-cream px-4">
                    <span className="font-serif text-2xl text-editorial-charcoal/50">$</span>
                    <input id="checkout-amount" type="number" step="1" min={minimum} max={999999} value={amount} onChange={event => { setAmount(Math.round(Number(event.target.value))); setStatus('ready'); }} className="w-full bg-transparent px-3 py-4 text-3xl font-serif outline-none" />
                  </div>
                  <p className="mt-2 text-[10px] text-editorial-charcoal/50">{t('Minimum', 'الحد الأدنى')}: ${minimum.toLocaleString()} USD</p>
                </div>

                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/15 p-4 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-emerald-700" />
                  <p className="text-xs text-editorial-charcoal/70">~{Math.round(frequency === 'monthly' ? impact.monthlyUnits : impact.annualUnits).toLocaleString()} {getLocalizedTrackUnitLabel(track.track_id, track.target_unit_label, language)}</p>
                </div>

                {error && <div role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">{error}</div>}
                {status === 'failed' && !error && <div role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">{t('The checkout attempt failed. You can try again with a new request.', 'فشلت محاولة الدفع. يمكنك المحاولة مرة أخرى بطلب جديد.')}</div>}
                {status === 'failed' && paymentRequestId && <p className="text-[10px] text-editorial-charcoal/45">{t('Payment request', 'طلب الدفع')}: {paymentRequestId}</p>}

                <button type="button" onClick={startCheckout} disabled={checkout.isPending || guestCheckout.isPending || status === 'pending'} className="w-full rounded-full bg-emerald-800 py-4 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-50 flex items-center justify-center gap-2">
                  {checkout.isPending || guestCheckout.isPending || status === 'pending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                  {checkout.isPending || guestCheckout.isPending || status === 'pending' ? t('Creating checkout…', 'جارٍ إنشاء الدفع…') : t('Continue to Stripe Checkout', 'المتابعة إلى Stripe')}
                  {!checkout.isPending && !guestCheckout.isPending && status !== 'pending' && <ArrowRight className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

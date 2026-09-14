import React, { useEffect, useId, useState } from 'react';
import { Loader2, Settings2 } from 'lucide-react';
import type { components } from '../api/generated';
import { ApiError } from '../api/client';
import { useCancelSubscription, useUpdateSubscription } from '../api/hooks';
import { useLanguage } from '../LanguageContext';
import type { Subscription, Track } from '../types';

type SubscriptionUpdateResponse = components['schemas']['SubscriptionUpdateResponse'];
type SubscriptionCancellationResponse = components['schemas']['SubscriptionCancellationResponse'];
type Translate = (english: string, arabic: string) => string;

export function minimumSubscriptionAmount(track: Pick<Track, 'min_monthly_gift'>, frequency: Subscription['frequency']) {
  return frequency === 'annual' ? track.min_monthly_gift * 12 : track.min_monthly_gift;
}

export function validateSubscriptionAmount(
  value: string,
  frequency: Subscription['frequency'],
  track: Pick<Track, 'min_monthly_gift'>,
  t: Translate,
) {
  const amount = Number(value);
  const minimum = minimumSubscriptionAmount(track, frequency);
  if (!value.trim() || !Number.isInteger(amount) || amount <= 0 || amount > 999999) {
    return t(
      'Enter a whole-dollar amount between $1 and $999,999.',
      'أدخل مبلغاً صحيحاً بالدولار بين 1 و999,999 دولاراً.',
    );
  }
  if (amount < minimum) {
    return frequency === 'annual'
      ? t(`Annual support must be at least $${minimum.toLocaleString()} (12 × the monthly minimum).`, `يجب ألا يقل الدعم السنوي عن ${minimum.toLocaleString()} دولاراً (12 × الحد الأدنى الشهري).`)
      : t(`Monthly support must be at least $${minimum.toLocaleString()}.`, `يجب ألا يقل الدعم الشهري عن ${minimum.toLocaleString()} دولاراً.`);
  }
  return null;
}

export function getSubscriptionErrorMessage(error: unknown, t: Translate) {
  if (!(error instanceof ApiError)) {
    return t('Support could not be changed. Please try again.', 'تعذر تغيير الدعم. يرجى المحاولة مرة أخرى.');
  }
  if (error.status === 400) return t('The amount or billing interval is invalid. Review it and try again.', 'المبلغ أو فترة الفوترة غير صالحة. راجعها وحاول مرة أخرى.');
  if (error.status === 401) return t('Your session expired. Sign in and try again.', 'انتهت جلستك. سجّل الدخول وحاول مرة أخرى.');
  if (error.status === 403) return t('You are not authorized to manage this support.', 'ليس لديك إذن لإدارة هذا الدعم.');
  if (error.status === 409) return t('This support changed or another request is in progress. Refresh and try again.', 'تغيّر هذا الدعم أو يوجد طلب آخر قيد التنفيذ. حدّث الصفحة وحاول مرة أخرى.');
  if (error.status === 429) return t('Too many requests. Wait a moment and try again.', 'عدد الطلبات كبير جداً. انتظر قليلاً ثم حاول مرة أخرى.');
  if (error.status === 0 || error.status >= 500) return t('The billing service is temporarily unavailable. Please try again later.', 'خدمة الفوترة غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.');
  return t('Support could not be changed. Please try again.', 'تعذر تغيير الدعم. يرجى المحاولة مرة أخرى.');
}

interface SubscriptionManagerProps {
  subscription: Subscription;
  track: Track;
  updateSubscription?: (id: string, input: components['schemas']['UpdateSubscriptionRequest']) => Promise<SubscriptionUpdateResponse>;
  cancelSubscription?: (id: string) => Promise<SubscriptionCancellationResponse>;
  openBillingPortal?: (url: string) => void;
}

export function SubscriptionManager({
  subscription,
  track,
  updateSubscription,
  cancelSubscription,
  openBillingPortal = url => window.location.assign(url),
}: SubscriptionManagerProps) {
  const { t } = useLanguage();
  const updateMutation = useUpdateSubscription();
  const cancelMutation = useCancelSubscription();
  const amountId = useId();
  const intervalId = useId();
  const feedbackId = useId();
  const [expanded, setExpanded] = useState(false);
  const [confirmingCancellation, setConfirmingCancellation] = useState(false);
  const [amount, setAmount] = useState(String(subscription.amount));
  const [frequency, setFrequency] = useState<Subscription['frequency']>(subscription.frequency);
  const [pendingAction, setPendingAction] = useState<'update' | 'cancel' | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setAmount(String(subscription.amount));
    setFrequency(subscription.frequency);
  }, [subscription.amount, subscription.frequency]);

  const submitUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setStatus('');
    const validationError = validateSubscriptionAmount(amount, frequency, track, t);
    if (validationError) {
      setError(validationError);
      return;
    }

    setPendingAction('update');
    try {
      const input = {
        subscriptionAmount: Number(amount),
        interval: frequency === 'annual' ? 'year' as const : 'month' as const,
        idempotencyKey: crypto.randomUUID(),
      };
      const result = updateSubscription
        ? await updateSubscription(subscription.subscription_id, input)
        : await updateMutation.mutateAsync({ id: subscription.subscription_id, input });

      if (result.status === 'requires_action') {
        setStatus(t('Opening the billing portal to finish this change…', 'جارٍ فتح بوابة الفوترة لإكمال هذا التغيير…'));
        openBillingPortal(result.portalUrl);
      } else if (result.status === 'pending') {
        setStatus(t('Your update is being confirmed. The current support stays visible until confirmation.', 'جارٍ تأكيد التحديث. سيظل الدعم الحالي ظاهراً حتى التأكيد.'));
      } else if (result.status === 'unchanged') {
        setStatus(t('Your support was already up to date.', 'كان دعمك محدّثاً بالفعل.'));
      } else {
        setStatus(t('Your recurring support was updated.', 'تم تحديث دعمك المتكرر.'));
      }
    } catch (caught) {
      setError(getSubscriptionErrorMessage(caught, t));
    } finally {
      setPendingAction(null);
    }
  };

  const confirmCancellation = async () => {
    setError('');
    setStatus('');
    setPendingAction('cancel');
    try {
      const result = cancelSubscription
        ? await cancelSubscription(subscription.subscription_id)
        : await cancelMutation.mutateAsync(subscription.subscription_id);
      setConfirmingCancellation(false);
      setStatus(result.status === 'cancelled'
        ? t('Recurring support was cancelled.', 'تم إلغاء الدعم المتكرر.')
        : t('Cancellation is being confirmed. Management remains available until it completes.', 'جارٍ تأكيد الإلغاء. ستظل الإدارة متاحة حتى اكتماله.'));
    } catch (caught) {
      setError(getSubscriptionErrorMessage(caught, t));
    } finally {
      setPendingAction(null);
    }
  };

  const isPending = pendingAction !== null;
  const intervalLabel = subscription.frequency === 'annual' ? t('year', 'سنة') : t('month', 'شهر');

  return <div className="mt-5 space-y-3">
    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
      {t('Current support', 'الدعم الحالي')}: ${subscription.amount.toLocaleString()} / {intervalLabel}
    </p>
    <button
      type="button"
      aria-expanded={expanded}
      onClick={() => { setExpanded(value => !value); setConfirmingCancellation(false); setError(''); setStatus(''); }}
      disabled={isPending}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-editorial-charcoal/20 py-2.5 text-[9px] font-bold uppercase tracking-widest text-editorial-charcoal disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Settings2 className="h-3.5 w-3.5" />{t('Modify subscription', 'تعديل الاشتراك')}
    </button>

    {expanded && <form noValidate onSubmit={submitUpdate} aria-describedby={error || status ? feedbackId : undefined} className="space-y-3 rounded-2xl bg-editorial-charcoal/5 p-4">
      <div>
        <label htmlFor={amountId} className="mb-1 block text-[10px] font-bold">{t('Recurring amount (USD)', 'مبلغ الدعم المتكرر (دولار)')}</label>
        <input
          id={amountId}
          inputMode="numeric"
          type="number"
          min={minimumSubscriptionAmount(track, frequency)}
          max={999999}
          step={1}
          value={amount}
          onChange={event => setAmount(event.target.value)}
          disabled={isPending}
          aria-invalid={!!error}
          className="w-full rounded-xl border border-editorial-charcoal/15 bg-editorial-card px-3 py-2 text-sm disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor={intervalId} className="mb-1 block text-[10px] font-bold">{t('Billing interval', 'فترة الفوترة')}</label>
        <select id={intervalId} value={frequency} onChange={event => setFrequency(event.target.value as Subscription['frequency'])} disabled={isPending} className="w-full rounded-xl border border-editorial-charcoal/15 bg-editorial-card px-3 py-2 text-sm disabled:opacity-50">
          <option value="monthly">{t('Monthly', 'شهرياً')}</option>
          <option value="annual">{t('Annual', 'سنوياً')}</option>
        </select>
      </div>

      {(error || status || isPending) && <p id={feedbackId} role={error ? 'alert' : 'status'} aria-live="polite" className={`text-[10px] leading-relaxed ${error ? 'text-rose-700 dark:text-rose-300' : 'text-editorial-charcoal/60'}`}>
        {error || status || (pendingAction === 'cancel' ? t('Cancelling recurring support…', 'جارٍ إلغاء الدعم المتكرر…') : t('Updating recurring support…', 'جارٍ تحديث الدعم المتكرر…'))}
      </p>}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={isPending} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-editorial-charcoal px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-editorial-cream disabled:cursor-not-allowed disabled:opacity-50">
          {pendingAction === 'update' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {pendingAction === 'update' ? t('Updating…', 'جارٍ التحديث…') : t('Save changes', 'حفظ التغييرات')}
        </button>
        {!confirmingCancellation && <button type="button" disabled={isPending} onClick={() => { setConfirmingCancellation(true); setError(''); setStatus(''); }} className="rounded-full px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-rose-700 disabled:opacity-50 dark:text-rose-300">
          {t('Cancel support', 'إلغاء الدعم')}
        </button>}
      </div>

      {confirmingCancellation && <div role="group" aria-label={t('Confirm cancellation', 'تأكيد الإلغاء')} className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
        <p className="text-[10px] leading-relaxed">{t('Cancel this recurring support now? This action cannot be undone here.', 'هل تريد إلغاء هذا الدعم المتكرر الآن؟ لا يمكن التراجع عن هذا الإجراء من هنا.')}</p>
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={isPending} onClick={() => void confirmCancellation()} className="rounded-full bg-rose-700 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-white disabled:opacity-50">
            {pendingAction === 'cancel' ? t('Cancelling…', 'جارٍ الإلغاء…') : t('Yes, cancel support', 'نعم، إلغاء الدعم')}
          </button>
          <button type="button" disabled={isPending} onClick={() => setConfirmingCancellation(false)} className="rounded-full border border-editorial-charcoal/15 px-4 py-2 text-[9px] font-bold uppercase tracking-widest disabled:opacity-50">
            {t('Keep support', 'الإبقاء على الدعم')}
          </button>
        </div>
      </div>}
    </form>}
  </div>;
}

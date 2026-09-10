import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Heart, Loader2, LockKeyhole, RefreshCw } from 'lucide-react';
import type { Donor } from '../types';
import { useAcceptInvitation, useGuestPayment, useInvitationPreview, usePayment } from '../api/hooks';
import { userToDonor } from '../api/adapters';
import { ApiError } from '../api/client';

export const PENDING_CHECKOUT_KEY = 'better-life:pending-checkout';

type PendingCheckout = { paymentRequestId: string; commitmentId?: string; subscriptionId?: string | null; guestCheckoutId?: string; verificationToken?: string; ministryTrackId: string; amount: number; frequency: string };

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const field = Array.isArray(error.details) ? error.details[0]?.message : undefined;
    return field || error.message;
  }
  return error instanceof Error ? error.message : 'The request could not be completed.';
}

export function AcceptInvitePage({ onAccepted, onSignIn }: { onAccepted: (user: Donor) => void; onSignIn: () => void }) {
  const token = new URLSearchParams(window.location.search).get('token') || '';
  const preview = useInvitationPreview(token, !!token);
  const accept = useAcceptInvitation();
  const [form, setForm] = useState({ firstName: '', lastName: '', password: '', confirmation: '' });
  const [error, setError] = useState('');
  useEffect(() => { if (preview.data?.invitation) setForm(current => ({ ...current, firstName: preview.data.invitation.invitedFirstName, lastName: preview.data.invitation.invitedLastName })); }, [preview.data]);
  const invitation = preview.data?.invitation;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!invitation) return;
    if (!form.firstName.trim() || !form.lastName.trim()) return setError('First and last name are required.');
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/.test(form.password)) return setError('Use 8–128 characters with uppercase, lowercase, and a number.');
    if (form.password !== form.confirmation) return setError('The passwords do not match.');
    setError('');
    try {
      const result = await accept.mutateAsync({ token, invitedFirstName: invitation.invitedFirstName, invitedLastName: invitation.invitedLastName, firstName: form.firstName.trim(), lastName: form.lastName.trim(), password: form.password });
      onAccepted(userToDonor(result.user));
    } catch (cause) { setError(errorMessage(cause)); }
  };
  return <RouteFrame><div className="grid overflow-hidden rounded-[32px] border border-editorial-charcoal/10 bg-editorial-card shadow-xl lg:grid-cols-[0.85fr_1.15fr]"><aside className="bg-editorial-charcoal p-8 text-editorial-cream md:p-12"><Heart className="h-10 w-10 text-rose-400" /><p className="mt-8 text-[9px] font-bold uppercase tracking-[0.25em] text-editorial-cream/45">Invitation access</p><h1 className="mt-3 font-serif text-4xl">Welcome to Better Life Friends</h1><p className="mt-4 text-sm leading-relaxed text-editorial-cream/65">Confirm your name and create a secure password to activate your invited account.</p>{invitation && <dl className="mt-8 space-y-3 rounded-2xl bg-white/5 p-4 text-xs"><div><dt className="text-editorial-cream/45">Email</dt><dd>{invitation.email}</dd></div><div><dt className="text-editorial-cream/45">Role</dt><dd className="capitalize">{invitation.role}</dd></div><div><dt className="text-editorial-cream/45">Invitation expires</dt><dd>{new Date(invitation.expiresAt).toLocaleString()}</dd></div></dl>}</aside><main className="p-8 md:p-12"><div className="flex items-center gap-2 text-emerald-700"><LockKeyhole className="h-5 w-5" /><span className="text-[10px] font-bold uppercase tracking-widest">Secure account setup</span></div>{!token ? <InvalidInvite message="This invitation link is missing its token." onSignIn={onSignIn} /> : preview.isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div> : preview.error || !invitation ? <InvalidInvite message={errorMessage(preview.error)} onSignIn={onSignIn} /> : <form onSubmit={submit} className="mt-8 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">First name<input required maxLength={50} value={form.firstName} onChange={event => setForm(value => ({ ...value, firstName: event.target.value }))} className="mt-1 w-full rounded-xl border bg-transparent p-3 font-normal" /></label><label className="text-xs font-bold">Last name<input required maxLength={50} value={form.lastName} onChange={event => setForm(value => ({ ...value, lastName: event.target.value }))} className="mt-1 w-full rounded-xl border bg-transparent p-3 font-normal" /></label></div><label className="block text-xs font-bold">Password<input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={form.password} onChange={event => setForm(value => ({ ...value, password: event.target.value }))} className="mt-1 w-full rounded-xl border bg-transparent p-3 font-normal" /><span className="mt-1 block text-[10px] font-normal text-editorial-charcoal/45">At least 8 characters with uppercase, lowercase, and a number.</span></label><label className="block text-xs font-bold">Confirm password<input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={form.confirmation} onChange={event => setForm(value => ({ ...value, confirmation: event.target.value }))} className="mt-1 w-full rounded-xl border bg-transparent p-3 font-normal" /></label>{error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700">{error}</p>}<button disabled={accept.isPending} className="flex w-full items-center justify-center gap-2 rounded-full bg-editorial-charcoal py-3 text-xs font-bold uppercase tracking-widest text-editorial-cream disabled:opacity-40">{accept.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Accept invitation</button></form>}</main></div></RouteFrame>;
}

function InvalidInvite({ message, onSignIn }: { message: string; onSignIn: () => void }) {
  return <div className="py-14 text-center"><AlertTriangle className="mx-auto h-10 w-10 text-amber-600" /><h2 className="mt-4 font-serif text-2xl">Invitation unavailable</h2><p role="alert" className="mx-auto mt-3 max-w-md text-sm text-editorial-charcoal/60">{message}</p><button onClick={onSignIn} className="mt-6 rounded-full border px-5 py-2.5 text-xs font-bold">Go to sign in</button></div>;
}

export function PaymentResultPage({ outcome, onContinue, onTryAgain }: { outcome: 'success' | 'failure'; onContinue: () => void; onTryAgain: () => void }) {
  const params = new URLSearchParams(window.location.search);
  const stored = readPendingCheckout();
  const paymentRequestId = params.get('payment_request_id') || params.get('paymentRequestId') || stored?.paymentRequestId || '';
  const commitmentId = params.get('commitment_id') || params.get('commitmentId') || stored?.commitmentId;
  const guestCheckoutId = params.get('guest_checkout_id') || params.get('guestCheckoutId') || stored?.guestCheckoutId || '';
  const verificationToken = params.get('token') || params.get('verification_token') || stored?.verificationToken || '';
  const authenticatedPayment = usePayment(paymentRequestId, outcome === 'success' && !!paymentRequestId && !guestCheckoutId);
  const guestPayment = useGuestPayment(guestCheckoutId, verificationToken, outcome === 'success' && !!guestCheckoutId && !!verificationToken);
  const paymentQuery = guestCheckoutId ? guestPayment : authenticatedPayment;
  const payment = paymentQuery.data;
  const confirmed = payment?.status === 'completed';
  const leave = (callback: () => void, clear: boolean) => { if (clear) localStorage.removeItem(PENDING_CHECKOUT_KEY); callback(); };
  return <RouteFrame><main className="mx-auto max-w-2xl rounded-[32px] border border-editorial-charcoal/10 bg-editorial-card p-8 text-center shadow-xl md:p-12">{outcome === 'success' ? <><span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700"><CheckCircle2 className="h-10 w-10" /></span><p className="mt-7 text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-700">Checkout returned successfully</p><h1 className="mt-3 font-serif text-4xl">Thank you for your generosity</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-editorial-charcoal/60">{confirmed ? 'Your payment is confirmed.' : payment?.status === 'failed' ? 'The provider reported that this payment failed.' : 'We received your checkout return and are reconciling the committed webhook state.'}</p>{paymentQuery.isLoading && <p className="mt-5 flex items-center justify-center gap-2 text-xs"><Loader2 className="h-4 w-4 animate-spin" />Confirming payment…</p>}{paymentQuery.error && <p role="alert" className="mt-5 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-800">Payment confirmation is still processing. Please refresh shortly.</p>}{payment && <dl className="mt-6 grid gap-3 rounded-2xl bg-editorial-charcoal/5 p-4 text-left text-xs sm:grid-cols-2"><div><dt className="text-editorial-charcoal/45">Payment status</dt><dd className="font-bold capitalize">{payment.status.replace('_', ' ')}</dd></div><div><dt className="text-editorial-charcoal/45">Gift type</dt><dd className="font-bold capitalize">{payment.type}</dd></div><div><dt className="text-editorial-charcoal/45">Amount</dt><dd>${payment.amount.toLocaleString()} {payment.currency.toUpperCase()}</dd></div><div><dt className="text-editorial-charcoal/45">Frequency</dt><dd className="capitalize">{payment.interval || 'One time'}</dd></div>{payment.receipt.available && payment.receipt.url && <div className="sm:col-span-2"><a className="font-bold text-emerald-700 underline" href={payment.receipt.url} target="_blank" rel="noreferrer">Open receipt</a></div>}</dl>}<ReferenceIds paymentRequestId={paymentRequestId} commitmentId={commitmentId} /><button onClick={() => leave(onContinue, true)} className="mt-8 inline-flex items-center gap-2 rounded-full bg-editorial-charcoal px-6 py-3 text-xs font-bold uppercase tracking-widest text-editorial-cream">Continue to dashboard<ArrowRight className="h-4 w-4" /></button></> : <><span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10 text-rose-600"><AlertTriangle className="h-10 w-10" /></span><p className="mt-7 text-[9px] font-bold uppercase tracking-[0.25em] text-rose-600">Checkout not completed</p><h1 className="mt-3 font-serif text-4xl">Your payment was not completed</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-editorial-charcoal/60">No new gift is shown as confirmed. You can return to the portal and start another secure checkout when you are ready.</p><ReferenceIds paymentRequestId={paymentRequestId} commitmentId={commitmentId} /><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={() => leave(onTryAgain, false)} className="inline-flex items-center gap-2 rounded-full bg-editorial-charcoal px-6 py-3 text-xs font-bold text-editorial-cream"><RefreshCw className="h-4 w-4" />Try again</button><button onClick={() => leave(onContinue, true)} className="rounded-full border px-6 py-3 text-xs font-bold">Return to dashboard</button></div></>}</main></RouteFrame>;
}

function ReferenceIds({ paymentRequestId, commitmentId }: { paymentRequestId?: string; commitmentId?: string }) {
  if (!paymentRequestId && !commitmentId) return null;
  return <dl className="mt-5 space-y-1 text-[10px] text-editorial-charcoal/45">{paymentRequestId && <div><dt className="inline">Payment request: </dt><dd className="inline font-mono">{paymentRequestId}</dd></div>}{commitmentId && <div><dt className="inline">Commitment: </dt><dd className="inline font-mono">{commitmentId}</dd></div>}</dl>;
}

function readPendingCheckout(): PendingCheckout | null {
  try { const raw = localStorage.getItem(PENDING_CHECKOUT_KEY); return raw ? JSON.parse(raw) as PendingCheckout : null; } catch { return null; }
}

function RouteFrame({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-editorial-cream px-4 py-10 text-editorial-charcoal sm:px-6 lg:px-8"><div className="mx-auto mb-8 max-w-6xl text-center"><p className="font-serif text-2xl italic">Better Life Friends</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-editorial-charcoal/45">Ministry Partner Portal</p></div><div className="mx-auto max-w-6xl">{children}</div></div>;
}

import { useState } from 'react';
import { RefreshCw, Send } from 'lucide-react';
import { useCreateReferral, useReferrals, useResendReferral } from '../api/hooks';

export default function DashboardReferralsPage() {
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
  return <section className="mx-auto max-w-4xl space-y-6 py-10"><div><p className="text-[10px] font-bold uppercase tracking-widest text-editorial-charcoal/45">Invite your community</p><h1 className="mt-2 font-serif text-4xl">Referrals</h1></div><form onSubmit={submit} className="grid gap-3 rounded-[28px] border bg-editorial-card p-5 sm:grid-cols-3"><input required maxLength={50} placeholder="First name" value={form.firstName} onChange={event => setForm(value => ({ ...value, firstName: event.target.value }))} className="rounded-xl border bg-transparent p-3 text-xs" /><input required maxLength={50} placeholder="Last name" value={form.lastName} onChange={event => setForm(value => ({ ...value, lastName: event.target.value }))} className="rounded-xl border bg-transparent p-3 text-xs" /><input required type="email" placeholder="Email" value={form.email} onChange={event => setForm(value => ({ ...value, email: event.target.value }))} className="rounded-xl border bg-transparent p-3 text-xs" />{message && <p className="text-xs sm:col-span-3">{message}</p>}<button disabled={create.isPending} className="flex items-center justify-center gap-2 rounded-full bg-editorial-charcoal px-5 py-3 text-xs font-bold text-editorial-cream sm:col-span-3"><Send className="h-4 w-4" />Send referral</button></form><div className="space-y-3">{list.isLoading ? <p className="text-xs">Loading referrals…</p> : list.error ? <p role="alert" className="text-xs text-rose-600">Referrals could not be loaded.</p> : !list.data?.referrals.length ? <p className="rounded-2xl border bg-editorial-card p-5 text-xs text-editorial-charcoal/50">No referrals yet.</p> : list.data.referrals.map(referral => <article key={referral.id} className="flex flex-wrap items-center gap-4 rounded-2xl border bg-editorial-card p-4"><div className="min-w-0 flex-1"><p className="font-bold">{referral.firstName} {referral.lastName}</p><p className="text-[10px] text-editorial-charcoal/50">{referral.email} · {referral.status} · delivery {referral.deliveryStatus || 'pending'}</p></div>{['pending', 'invited', 'expired'].includes(referral.status) && <button disabled={resend.isPending} onClick={() => resend.mutate(referral.id)} className="flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold"><RefreshCw className="h-3.5 w-3.5" />Resend</button>}</article>)}</div></section>;
}

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import type { components } from '../../api/generated';
import { useMinistryTracks, useTrack } from '../../api/hooks';
import {
  changeActionMode,
  changeBadgeTrigger,
  serializeBadgeForm,
  validateBadgeForm,
  type BadgeFormErrors,
  type BadgeFormState,
  type BadgeTriggerKey,
} from './badgeRules';

type BadgeRequest = components['schemas']['CreateBadgeRequest'];

const fieldClass = 'mt-1 w-full rounded-xl border border-editorial-charcoal/15 bg-transparent p-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-55';
const labelClass = 'text-[10px] font-bold uppercase tracking-wider text-editorial-charcoal/50';

function FieldError({ message }: { message?: string }) {
  return message ? <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-rose-600">{message}</span> : null;
}

function TrackPicker({ value, onChange, error }: { value: string; onChange: (id: string) => void; error?: string }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const list = useMinistryTracks({ page, limit, search: search || undefined, sortBy: 'Alphabetical', sortOrder: 'ASC' });
  const tracks = list.data?.ministryTracks || [];
  const selectedInPage = tracks.some(track => track.id === value);
  const selected = useTrack(value, !!value && !selectedInPage);
  const selectedTrack = selectedInPage ? tracks.find(track => track.id === value) : selected.data;
  const totalPages = Math.max(1, Math.ceil((list.data?.total || 0) / limit));
  const choices = selectedTrack && !selectedInPage ? [selectedTrack, ...tracks] : tracks;

  useEffect(() => setPage(1), [search]);

  return <div className="space-y-2 rounded-xl border border-editorial-charcoal/10 p-3">
    <label className={labelClass} htmlFor="badge-track-search">Search tracks
      <span className="relative block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-editorial-charcoal/35" />
        <input id="badge-track-search" type="search" value={search} onChange={event => setSearch(event.target.value)} className={`${fieldClass} pl-9`} placeholder="Search all ministry tracks" />
      </span>
    </label>
    <label className={labelClass} htmlFor="badge-track-id">Ministry track
      <select id="badge-track-id" value={value} onChange={event => onChange(event.target.value)} className={fieldClass} aria-invalid={!!error}>
        <option value="">Select a track</option>
        {choices.map(track => <option key={track.id} value={track.id}>{track.name}{track.isActive ? '' : ' (Inactive)'}</option>)}
      </select>
      <FieldError message={error} />
    </label>
    {list.isLoading || (!selectedInPage && selected.isLoading) ? <p className="flex items-center gap-1 text-[11px] text-editorial-charcoal/50"><Loader2 className="h-3 w-3 animate-spin" />Loading tracks…</p> : null}
    {list.error ? <p role="alert" className="text-[11px] text-rose-600">Tracks could not be loaded. Try the search again.</p> : null}
    {!selectedInPage && selected.error ? <p role="alert" className="text-[11px] text-rose-600">The badge’s selected track could not be resolved. It may no longer exist.</p> : null}
    <div className="flex items-center justify-between text-[11px] text-editorial-charcoal/50">
      <span>{list.data?.total || 0} tracks · Page {page} of {totalPages}</span>
      <span className="flex gap-1">
        <button type="button" aria-label="Previous track page" disabled={page <= 1} onClick={() => setPage(current => current - 1)} className="rounded-full border p-1.5 disabled:opacity-30"><ChevronLeft className="h-3 w-3" /></button>
        <button type="button" aria-label="Next track page" disabled={page >= totalPages} onClick={() => setPage(current => current + 1)} className="rounded-full border p-1.5 disabled:opacity-30"><ChevronRight className="h-3 w-3" /></button>
      </span>
    </div>
  </div>;
}

export function BadgeForm({ initial, locked, submitLabel, onCancel, onSubmit, busy }: {
  initial: BadgeFormState;
  locked: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (input: BadgeRequest) => Promise<void> | void;
  busy: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<BadgeFormErrors>({});
  useEffect(() => { setForm(initial); setErrors({}); }, [initial]);

  const actionMode = form.triggerKey === 'ministry.track.duration' ? null : form.mode;
  const triggerDescription = useMemo(() => {
    if (form.triggerKey === 'ministry.track.duration') return 'Awarded for maintaining a ministry-track membership for a number of whole days.';
    if (form.triggerKey === 'action.login') return 'Awarded from successful login history.';
    if (form.triggerKey === 'action.donation') return 'Awarded from qualifying donation history.';
    return 'Awarded when referred invitations are accepted.';
  }, [form.triggerKey]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateBadgeForm(form);
    setErrors(nextErrors);
    const request = serializeBadgeForm(form);
    if (!request) return;
    void onSubmit(request);
  };

  return <form noValidate onSubmit={submit} className="grid gap-4 rounded-2xl border bg-editorial-card p-4 md:grid-cols-2">
    <div className="md:col-span-2">
      <h3 className="font-serif text-xl">{locked ? 'Edit locked badge' : 'Badge draft'}</h3>
      <p className="mt-1 text-xs text-editorial-charcoal/55">{locked ? 'The badge rule is locked. You can still update its display metadata.' : 'Drafts cannot award users until they are explicitly activated.'}</p>
    </div>
    <label className={labelClass} htmlFor="badge-code">Code
      <input id="badge-code" value={form.code} readOnly={locked} maxLength={100} onChange={event => setForm(current => ({ ...current, code: event.target.value }))} className={fieldClass} aria-invalid={!!errors.code} />
      <FieldError message={errors.code} />
    </label>
    <label className={labelClass} htmlFor="badge-name">Name
      <input id="badge-name" value={form.name} maxLength={100} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className={fieldClass} aria-invalid={!!errors.name} />
      <FieldError message={errors.name} />
    </label>
    <label className={`${labelClass} md:col-span-2`} htmlFor="badge-description">Description
      <textarea id="badge-description" rows={3} value={form.description} maxLength={2000} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} className={fieldClass} aria-invalid={!!errors.description} />
      <FieldError message={errors.description} />
    </label>
    <label className={labelClass} htmlFor="badge-order">Display order
      <input id="badge-order" type="number" min="0" step="1" value={form.order} onChange={event => setForm(current => ({ ...current, order: event.target.value }))} className={fieldClass} aria-invalid={!!errors.order} />
      <FieldError message={errors.order} />
    </label>
    <label className={labelClass} htmlFor="badge-trigger">Trigger
      <select id="badge-trigger" disabled={locked} value={form.triggerKey} onChange={event => setForm(current => changeBadgeTrigger(current, event.target.value as BadgeTriggerKey))} className={fieldClass}>
        <option value="ministry.track.duration">Track duration</option>
        <option value="action.login">Login</option>
        <option value="action.donation">Donation</option>
        <option value="action.referral">Referral</option>
      </select>
      <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-editorial-charcoal/50">{triggerDescription}</span>
    </label>

    {form.triggerKey === 'ministry.track.duration' ? <>
      <label className={labelClass} htmlFor="badge-target-days">Target days
        <input id="badge-target-days" type="number" min="1" step="1" readOnly={locked} value={form.targetDays} onChange={event => setForm(current => current.triggerKey === 'ministry.track.duration' ? { ...current, targetDays: event.target.value } : current)} className={fieldClass} aria-invalid={!!errors.targetDays} />
        <FieldError message={errors.targetDays} />
      </label>
      <label className={labelClass} htmlFor="badge-track-scope">Track requirement
        <select id="badge-track-scope" disabled={locked} value={form.trackScope} onChange={event => setForm(current => current.triggerKey === 'ministry.track.duration' ? { ...current, trackScope: event.target.value as 'any' | 'specific', trackId: '' } : current)} className={fieldClass}>
          <option value="any">Any track</option>
          <option value="specific">Specific track</option>
        </select>
      </label>
      {form.trackScope === 'specific' && (locked
        ? <div className="rounded-xl border border-editorial-charcoal/10 p-3 md:col-span-2"><p className={labelClass}>Selected track</p><p className="mt-1 break-all text-sm">{form.trackId}</p></div>
        : <div className="md:col-span-2"><TrackPicker value={form.trackId} onChange={trackId => setForm(current => current.triggerKey === 'ministry.track.duration' ? { ...current, trackId } : current)} error={errors.trackId} /></div>)}
    </> : <>
      <label className={labelClass} htmlFor="badge-action-mode">Action mode
        <select id="badge-action-mode" disabled={locked} value={actionMode || ''} onChange={event => setForm(current => changeActionMode(current, event.target.value as 'consecutive' | 'rolling_window'))} className={fieldClass}>
          <option value="consecutive">Consecutive</option>
          <option value="rolling_window">Rolling window</option>
        </select>
      </label>
      <label className={labelClass} htmlFor="badge-count">Required count
        <input id="badge-count" type="number" min="1" step="1" readOnly={locked} value={form.count} onChange={event => setForm(current => current.triggerKey !== 'ministry.track.duration' ? { ...current, count: event.target.value } : current)} className={fieldClass} aria-invalid={!!errors.count} />
        <FieldError message={errors.count} />
      </label>
      {form.mode === 'consecutive' ? <label className={labelClass} htmlFor="badge-max-interval">Maximum interval days
        <input id="badge-max-interval" type="number" min="1" step="1" readOnly={locked} value={form.maxIntervalDays} onChange={event => setForm(current => current.triggerKey !== 'ministry.track.duration' && current.mode === 'consecutive' ? { ...current, maxIntervalDays: event.target.value } : current)} className={fieldClass} aria-invalid={!!errors.maxIntervalDays} />
        <FieldError message={errors.maxIntervalDays} />
      </label> : <label className={labelClass} htmlFor="badge-window-days">Window days
        <input id="badge-window-days" type="number" min="1" step="1" readOnly={locked} value={form.windowDays} onChange={event => setForm(current => current.triggerKey !== 'ministry.track.duration' && current.mode === 'rolling_window' ? { ...current, windowDays: event.target.value } : current)} className={fieldClass} aria-invalid={!!errors.windowDays} />
        <FieldError message={errors.windowDays} />
      </label>}
    </>}

    <div className="flex justify-end gap-2 md:col-span-2">
      <button type="button" onClick={onCancel} className="rounded-full border px-4 py-2 text-xs">Cancel</button>
      <button disabled={busy} className="rounded-full bg-editorial-charcoal px-4 py-2 text-xs font-bold text-editorial-cream disabled:opacity-50">{busy ? 'Saving…' : submitLabel}</button>
    </div>
  </form>;
}

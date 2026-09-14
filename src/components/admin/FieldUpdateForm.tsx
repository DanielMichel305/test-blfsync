import React, { useEffect, useMemo, useState } from 'react';
import { CircleAlert } from 'lucide-react';
import type { components } from '../../api/generated';
import type { FieldUpdateCreateInput } from '../../api/domains';
import { ApiError } from '../../api/client';
import { fieldUpdateDeliveryAdapter, type FieldUpdateAudienceFilter, type FieldUpdateDeliveryAudience } from '../../api/fieldUpdateDelivery';
import { getApiErrorMessage } from '../../api/errors';
import { FieldUpdateEditor } from './FieldUpdateEditor';
import { getFieldUpdateValidationErrors, type FieldUpdateValidationErrors } from './fieldUpdateValidation';

type FieldUpdate = components['schemas']['FieldUpdate'];
type MediaChoice = 'keep' | 'none' | 'url' | 'upload';
type FieldErrors = FieldUpdateValidationErrors;

export interface FieldUpdateDeliveryOptions {
  enabled: boolean;
  audience: FieldUpdateDeliveryAudience;
}

function localDateTime(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function newFilter(type: FieldUpdateAudienceFilter['type'] = 'all-subscribers'): FieldUpdateAudienceFilter {
  const id = crypto.randomUUID();
  if (type === 'ministry-track-subscribers') return { id, type, trackId: '' };
  if (type === 'roles') return { id, type, roles: [] };
  if (type === 'specific-users') return { id, type, userIds: [] };
  return { id, type };
}

function ValidationTooltip({ field, message }: { field: string; message?: string }) {
  if (!message) return null;
  const id = `field-update-${field}-error`;
  return <span className="group relative ms-1 inline-flex align-middle"><CircleAlert tabIndex={0} aria-label={`Validation error: ${message}`} aria-describedby={id} className="h-4 w-4 cursor-help text-rose-600 outline-none focus-visible:ring-2 focus-visible:ring-rose-600" /><span id={id} role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-lg bg-stone-950 px-3 py-2 text-left text-[11px] font-normal leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{message}<span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-stone-950" /></span></span>;
}

function serverValidationErrors(error: unknown): FieldErrors {
  if (!(error instanceof ApiError) || error.status !== 400 || !Array.isArray(error.details)) return {};
  const supported = new Set(['title', 'tag', 'category', 'ministryTrackId', 'status', 'publishedAt', 'mdBody', 'mediaType', 'mediaUrl', 'media']);
  return error.details.reduce<FieldErrors>((errors, detail) => {
    const field = detail.field?.split('.').at(-1);
    if (field && supported.has(field) && detail.message) errors[field] = detail.message;
    return errors;
  }, {});
}

export function FieldUpdateForm({ initial, tracks, busy, onCancel, onSave }: {
  initial?: FieldUpdate;
  tracks: Array<{ id: string; name: string }>;
  busy: boolean;
  onCancel: () => void;
  onSave: (input: FieldUpdateCreateInput, delivery: FieldUpdateDeliveryOptions) => Promise<void>;
}) {
  const [form, setForm] = useState(() => ({
    title: initial?.title || '',
    tag: initial?.tag || '',
    category: initial?.category || '',
    ministryTrackId: initial?.ministryTrack?.id || '',
    status: (initial?.status === 'published' ? 'published' : 'draft') as 'draft' | 'published',
    publishedAt: localDateTime(initial?.publishedAt),
    mdBody: initial?.mdBody || '',
    mediaChoice: (initial?.mediaUrl ? 'keep' : 'none') as MediaChoice,
    mediaType: (initial?.mediaType || 'image') as 'image' | 'video',
    mediaUrl: initial?.mediaUrl || '',
    media: undefined as File | undefined,
  }));
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [filters, setFilters] = useState<FieldUpdateAudienceFilter[]>([newFilter()]);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [saveError, setSaveError] = useState('');
  const audience = useMemo<FieldUpdateDeliveryAudience>(() => ({ semantics: 'union', filters }), [filters]);

  useEffect(() => {
    let active = true;
    if (!emailEnabled) { setRecipientCount(null); return; }
    void fieldUpdateDeliveryAdapter.getRecipientCount(audience).then(count => { if (active) setRecipientCount(count); });
    return () => { active = false; };
  }, [audience, emailEnabled]);

  useEffect(() => { setServerErrors({}); setSaveError(''); }, [form, filters, emailEnabled]);

  if (initial?.status === 'archived') {
    return <div role="alert" className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm">Archived updates cannot be edited. Restore this update first.</div>;
  }

  const replaceFilter = (id: string, next: FieldUpdateAudienceFilter) => setFilters(values => values.map(value => value.id === id ? next : value));
  const changeFilterType = (filter: FieldUpdateAudienceFilter, type: FieldUpdateAudienceFilter['type']) => replaceFilter(filter.id, { ...newFilter(type), id: filter.id });

  const validate = () => getFieldUpdateValidationErrors(form, emailEnabled, filters);

  const clientErrors = validationAttempted ? validate() : {};
  const fieldErrors = { ...clientErrors, ...serverErrors };
  const invalidClass = (field: string) => fieldErrors[field] ? 'border-rose-600 ring-2 ring-rose-600/20' : 'border-editorial-charcoal/15';
  const describedBy = (field: string) => fieldErrors[field] ? `field-update-${field}-error` : undefined;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationAttempted(true);
    setServerErrors({});
    setSaveError('');
    const validation = validate();
    if (Object.keys(validation).length) return;
    const input: FieldUpdateCreateInput = {
      title: form.title.trim(),
      tag: form.tag.trim(),
      category: form.category.trim() || null,
      ministryTrackId: form.ministryTrackId || null,
      status: form.status,
      mdBody: form.mdBody,
      ...(form.status === 'published' && form.publishedAt ? { publishedAt: new Date(form.publishedAt).toISOString() } : {}),
      ...(form.mediaChoice === 'url' ? { mediaUrl: form.mediaUrl.trim(), mediaType: form.mediaType }
        : form.mediaChoice === 'upload' ? { media: form.media }
          : form.mediaChoice === 'none' && initial?.mediaUrl ? { mediaUrl: null, mediaType: null } : {}),
    };
    try {
      await onSave(input, { enabled: emailEnabled, audience });
    } catch (saveError) {
      setServerErrors(serverValidationErrors(saveError));
      setSaveError(`${getApiErrorMessage(saveError, 'The field update could not be saved.')} Your unsaved changes remain in this form.`);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5 rounded-[28px] border border-editorial-charcoal/10 bg-editorial-card p-5 sm:p-7" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-widest text-editorial-charcoal/45">{initial ? 'Edit field update' : 'New field update'}</p><h2 className="font-serif text-2xl">{initial?.title || 'Create an update'}</h2></div><button type="button" onClick={onCancel} disabled={busy} className="rounded-full border px-4 py-2 text-xs font-bold">Cancel</button></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold">Title <span aria-hidden="true">*</span><ValidationTooltip field="title" message={fieldErrors.title} /><input required maxLength={200} aria-invalid={!!fieldErrors.title} aria-describedby={describedBy('title')} value={form.title} onChange={event => setForm(value => ({ ...value, title: event.target.value }))} className={`mt-1 w-full rounded-xl border bg-transparent p-3 font-normal ${invalidClass('title')}`} /></label>
        <label className="text-xs font-bold">Tag <span aria-hidden="true">*</span><ValidationTooltip field="tag" message={fieldErrors.tag} /><input required maxLength={100} aria-invalid={!!fieldErrors.tag} aria-describedby={describedBy('tag')} value={form.tag} onChange={event => setForm(value => ({ ...value, tag: event.target.value }))} className={`mt-1 w-full rounded-xl border bg-transparent p-3 font-normal ${invalidClass('tag')}`} /></label>
        <label className="text-xs font-bold">Category<ValidationTooltip field="category" message={fieldErrors.category} /><input maxLength={100} aria-invalid={!!fieldErrors.category} aria-describedby={describedBy('category')} value={form.category} onChange={event => setForm(value => ({ ...value, category: event.target.value }))} className={`mt-1 w-full rounded-xl border bg-transparent p-3 font-normal ${invalidClass('category')}`} /></label>
        <label className="text-xs font-bold">Ministry track<ValidationTooltip field="ministryTrackId" message={fieldErrors.ministryTrackId} /><select aria-invalid={!!fieldErrors.ministryTrackId} aria-describedby={describedBy('ministryTrackId')} value={form.ministryTrackId} onChange={event => setForm(value => ({ ...value, ministryTrackId: event.target.value }))} className={`mt-1 w-full rounded-xl border bg-editorial-card p-3 font-normal ${invalidClass('ministryTrackId')}`}><option value="">No specific track</option>{tracks.map(track => <option key={track.id} value={track.id}>{track.name}</option>)}</select></label>
        <label className="text-xs font-bold">Status<ValidationTooltip field="status" message={fieldErrors.status} /><select aria-invalid={!!fieldErrors.status} aria-describedby={describedBy('status')} value={form.status} onChange={event => setForm(value => ({ ...value, status: event.target.value as 'draft' | 'published', publishedAt: event.target.value === 'draft' ? '' : value.publishedAt }))} className={`mt-1 w-full rounded-xl border bg-editorial-card p-3 font-normal ${invalidClass('status')}`}><option value="draft" disabled={initial?.status === 'published'}>Draft</option><option value="published">Published</option></select></label>
        <label className="text-xs font-bold">Publication date <span className="font-normal text-editorial-charcoal/45">(optional)</span><ValidationTooltip field="publishedAt" message={fieldErrors.publishedAt} /><input type="datetime-local" disabled={form.status !== 'published'} aria-invalid={!!fieldErrors.publishedAt} aria-describedby={describedBy('publishedAt')} value={form.publishedAt} onChange={event => setForm(value => ({ ...value, publishedAt: event.target.value }))} className={`mt-1 w-full rounded-xl border bg-transparent p-3 font-normal disabled:opacity-45 ${invalidClass('publishedAt')}`} /></label>
      </div>

      <div><p id="field-update-markdown-label" className="text-xs font-bold">Markdown body <span aria-hidden="true">*</span><ValidationTooltip field="mdBody" message={fieldErrors.mdBody} /></p><div className="mt-1"><FieldUpdateEditor value={form.mdBody} onChange={mdBody => setForm(value => ({ ...value, mdBody }))} disabled={busy} labelledBy="field-update-markdown-label" invalid={!!fieldErrors.mdBody} describedBy={describedBy('mdBody')} /></div><p className={`mt-1 text-right text-[10px] ${fieldErrors.mdBody ? 'font-bold text-rose-700 dark:text-rose-300' : 'text-editorial-charcoal/45'}`}>{form.mdBody.length.toLocaleString()} / 50,000</p></div>

      <fieldset className="space-y-3 rounded-2xl border border-editorial-charcoal/10 p-4">
        <legend className="px-1 text-xs font-bold">Optional media</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold">Media source<select value={form.mediaChoice} onChange={event => setForm(value => ({ ...value, mediaChoice: event.target.value as MediaChoice, media: undefined }))} className="mt-1 w-full rounded-xl border border-editorial-charcoal/15 bg-editorial-card p-3 font-normal">{initial?.mediaUrl && <option value="keep">Keep current media</option>}<option value="none">No media</option><option value="url">HTTPS media URL</option><option value="upload">Upload image/video</option></select></label>
          {form.mediaChoice === 'url' && <>
            <label className="text-xs font-bold">Media type<ValidationTooltip field="mediaType" message={fieldErrors.mediaType} /><select aria-invalid={!!fieldErrors.mediaType} aria-describedby={describedBy('mediaType')} value={form.mediaType} onChange={event => setForm(value => ({ ...value, mediaType: event.target.value as 'image' | 'video' }))} className={`mt-1 w-full rounded-xl border bg-editorial-card p-3 font-normal ${invalidClass('mediaType')}`}><option value="image">Image</option><option value="video">Video</option></select></label>
            <label className="text-xs font-bold sm:col-span-2">Media URL<ValidationTooltip field="mediaUrl" message={fieldErrors.mediaUrl} /><input type="url" required placeholder="https://…" aria-invalid={!!fieldErrors.mediaUrl} aria-describedby={describedBy('mediaUrl')} value={form.mediaUrl} onChange={event => setForm(value => ({ ...value, mediaUrl: event.target.value }))} className={`mt-1 w-full rounded-xl border bg-transparent p-3 font-normal ${invalidClass('mediaUrl')}`} /></label>
          </>}
          {form.mediaChoice === 'upload' && <label className="text-xs font-bold sm:col-span-2">Image or video file<ValidationTooltip field="media" message={fieldErrors.media} /><input type="file" required accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,video/x-m4v,video/mpeg,video/3gpp" aria-invalid={!!fieldErrors.media} aria-describedby={describedBy('media')} onChange={event => setForm(value => ({ ...value, media: event.target.files?.[0] }))} className={`mt-1 block w-full rounded-xl border p-3 font-normal ${invalidClass('media')}`} /></label>}
        </div>
      </fieldset>

      <section className="space-y-3 rounded-2xl border border-editorial-charcoal/10 p-4" aria-labelledby="email-delivery-heading"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 id="email-delivery-heading" className="text-sm font-bold">Email delivery</h3><p className="text-[10px] text-editorial-charcoal/50">Backend email content and delivery endpoints are not yet available.</p></div><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={emailEnabled} onChange={event => setEmailEnabled(event.target.checked)} />Enable email delivery</label></div><p role="status" className="rounded-xl bg-editorial-charcoal/5 p-3 text-xs font-bold">{recipientCount === null ? 'Recipient count unavailable (placeholder)' : `${recipientCount} recipients`}</p>
        <fieldset disabled={!emailEnabled} aria-disabled={!emailEnabled} aria-invalid={!!fieldErrors.audience} aria-describedby={describedBy('audience')} className={`space-y-3 rounded-xl border p-3 disabled:cursor-not-allowed disabled:opacity-40 ${invalidClass('audience')}`}>
          <legend className="px-1 text-[10px] font-bold uppercase tracking-wider">Audience filters (combined as a union)<ValidationTooltip field="audience" message={fieldErrors.audience} /></legend>
          {filters.map((filter, index) => {
            const filterField = `filter-${filter.id}`;
            const filterError = fieldErrors[filterField];
            return <div key={filter.id} className={`grid gap-2 rounded-xl bg-editorial-charcoal/5 p-3 sm:grid-cols-[1fr_1.5fr_auto] ${filterError ? 'ring-2 ring-rose-600/30' : ''}`}>
              <label className="text-[10px] font-bold">Filter {index + 1}<select value={filter.type} onChange={event => changeFilterType(filter, event.target.value as FieldUpdateAudienceFilter['type'])} className="mt-1 w-full rounded-lg border bg-editorial-card p-2 text-xs font-normal"><option value="ministry-track-subscribers">Ministry-track subscribers</option><option value="all-subscribers">All subscribers</option><option value="all-users">All users</option><option value="roles">Specific roles</option><option value="specific-users">Specific users</option></select></label>
              <div>
                {filter.type === 'ministry-track-subscribers' && <label className="text-[10px] font-bold">Track<ValidationTooltip field={filterField} message={filterError} /><select aria-invalid={!!filterError} aria-describedby={describedBy(filterField)} value={filter.trackId} onChange={event => replaceFilter(filter.id, { ...filter, trackId: event.target.value })} className={`mt-1 w-full rounded-lg border bg-editorial-card p-2 text-xs font-normal ${invalidClass(filterField)}`}><option value="">Choose a track</option>{tracks.map(track => <option key={track.id} value={track.id}>{track.name}</option>)}</select></label>}
                {filter.type === 'roles' && <fieldset aria-invalid={!!filterError} aria-describedby={describedBy(filterField)}><legend className="text-[10px] font-bold">Roles<ValidationTooltip field={filterField} message={filterError} /></legend><div className="mt-2 flex flex-wrap gap-3">{(['admin', 'family', 'friend'] as const).map(role => <label key={role} className="flex items-center gap-1 text-xs capitalize"><input type="checkbox" checked={filter.roles.includes(role)} onChange={event => replaceFilter(filter.id, { ...filter, roles: event.target.checked ? [...filter.roles, role] : filter.roles.filter(value => value !== role) })} />{role}</label>)}</div></fieldset>}
                {filter.type === 'specific-users' && <label className="text-[10px] font-bold">User IDs<ValidationTooltip field={filterField} message={filterError} /><input aria-invalid={!!filterError} aria-describedby={describedBy(filterField)} value={filter.userIds.join(', ')} onChange={event => replaceFilter(filter.id, { ...filter, userIds: event.target.value.split(',').map(value => value.trim()).filter(Boolean) })} placeholder="Comma-separated user IDs" className={`mt-1 w-full rounded-lg border bg-transparent p-2 text-xs font-normal ${invalidClass(filterField)}`} /></label>}
                {(filter.type === 'all-subscribers' || filter.type === 'all-users') && <p className="pt-6 text-xs text-editorial-charcoal/55">No additional selection needed.</p>}
              </div>
              <button type="button" onClick={() => setFilters(values => values.filter(value => value.id !== filter.id))} className="self-end rounded-full border px-3 py-2 text-[10px] font-bold">Remove</button>
            </div>;
          })}
          <button type="button" onClick={() => setFilters(values => [...values, newFilter()])} className="rounded-full border px-4 py-2 text-[10px] font-bold">Add union filter</button>
        </fieldset>
      </section>

      {Object.keys(fieldErrors).length > 0 && <p role="alert" aria-live="assertive" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{Object.keys(fieldErrors).length} {Object.keys(fieldErrors).length === 1 ? 'field needs' : 'fields need'} attention. Review the highlighted fields and focus an error icon for a suggested fix.</p>}
      {saveError && <p role="alert" aria-live="assertive" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{saveError}</p>}
      <div className="flex justify-end"><button type="submit" disabled={busy} className="rounded-full bg-editorial-charcoal px-6 py-3 text-xs font-bold text-editorial-cream disabled:opacity-45">{busy ? 'Saving…' : form.status === 'published' ? 'Save and publish' : 'Save draft'}</button></div>
    </form>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Archive, Eye, Pencil, Plus, RotateCcw, Send, X } from 'lucide-react';
import type { components } from '../../api/generated';
import { useAdminFieldUpdates, useArchiveFieldUpdate, useCreateFieldUpdate, usePublishFieldUpdate, useRestoreFieldUpdate, useUpdateFieldUpdate } from '../../api/hooks';
import { getApiErrorMessage } from '../../api/errors';
import { fieldUpdateDeliveryAdapter } from '../../api/fieldUpdateDelivery';
import type { FieldUpdateCreateInput } from '../../api/domains';
import { FieldUpdateMarkdown } from '../FieldUpdateMarkdown';
import { AdminListControls, AdminListState, AdminPagination, FilterField, useAdminListState } from './AdminList';
import { ConfirmDialog } from './ConfirmDialog';
import { FieldUpdateForm, type FieldUpdateDeliveryOptions } from './FieldUpdateForm';

type FieldUpdate = components['schemas']['FieldUpdate'];
type AdminQuery = { page: number; limit: number; search: string; status: string; trackId: string; category: string; tag: string; sortBy: string; sortOrder: string };

function dateLabel(value: string | null | undefined) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not published';
}

function StatusBadge({ status }: { status: FieldUpdate['status'] }) {
  const color = status === 'published' ? 'bg-emerald-700 text-white' : status === 'archived' ? 'bg-stone-700 text-white' : 'bg-amber-200 text-amber-950';
  return <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${color}`}>{status}</span>;
}

function AdminPreview({ update, onClose }: { update: FieldUpdate; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], video[controls], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    closeRef.current?.focus();
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, []);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><article ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="admin-field-update-preview-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-editorial-card p-6 shadow-2xl"><div className="flex justify-between gap-3"><div><StatusBadge status={update.status} /><h2 id="admin-field-update-preview-title" className="mt-3 font-serif text-3xl">{update.title}</h2><p className="mt-1 text-xs text-editorial-charcoal/50">{update.tag}{update.category ? ` · ${update.category}` : ''}{update.ministryTrack ? ` · ${update.ministryTrack.name}` : ''}</p></div><button ref={closeRef} type="button" onClick={onClose} aria-label="Close preview" className="h-fit rounded-full border p-2"><X className="h-4 w-4" /></button></div>{update.mediaUrl && update.mediaType === 'image' && <img src={update.mediaUrl} alt={`${update.title} media`} className="mt-5 max-h-80 w-full rounded-2xl object-contain bg-black/5" />}{update.mediaUrl && update.mediaType === 'video' && <video src={update.mediaUrl} controls aria-label={`Video for ${update.title}`} className="mt-5 max-h-80 w-full rounded-2xl bg-black" />}<FieldUpdateMarkdown mdBody={update.mdBody} className="mt-6" label={`${update.title} preview`} /></article></div>;
}

export function AdminFieldUpdates({ tracks }: { tracks: Array<{ id: string; name: string }> }) {
  const { query, update: setQuery } = useAdminListState<AdminQuery>('field_updates', { page: 1, limit: 10, search: '', status: '', trackId: '', category: '', tag: '', sortBy: 'publishedAt', sortOrder: 'DESC' });
  const list = useAdminFieldUpdates({
    page: query.page,
    limit: query.limit,
    ...(query.search ? { search: query.search } : {}),
    ...(query.status ? { status: query.status as FieldUpdate['status'] } : {}),
    ...(query.trackId ? { trackId: query.trackId } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.tag ? { tag: query.tag } : {}),
    sortBy: query.sortBy as 'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'tag' | 'category' | 'status',
    sortOrder: query.sortOrder as 'ASC' | 'DESC',
  });
  const create = useCreateFieldUpdate();
  const save = useUpdateFieldUpdate();
  const publish = usePublishFieldUpdate();
  const archive = useArchiveFieldUpdate();
  const restore = useRestoreFieldUpdate();
  const [editing, setEditing] = useState<'new' | FieldUpdate | null>(null);
  const [preview, setPreview] = useState<FieldUpdate | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<FieldUpdate | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const lifecycleBusy = publish.isPending || archive.isPending || restore.isPending;

  const run = async (action: () => Promise<unknown>, success: string) => {
    setFeedback(null);
    try { await action(); setFeedback({ kind: 'success', message: success }); }
    catch (error) { setFeedback({ kind: 'error', message: getApiErrorMessage(error) }); }
  };

  const saveForm = async (input: FieldUpdateCreateInput, delivery: FieldUpdateDeliveryOptions) => {
    const result = editing === 'new' ? await create.mutateAsync(input) : await save.mutateAsync({ id: (editing as FieldUpdate).id, input });
    let message = input.status === 'published' ? 'Field update published.' : 'Draft saved.';
    if (input.status === 'published' && delivery.enabled) {
      const deliveryResult = await fieldUpdateDeliveryAdapter.publish({ fieldUpdateId: result.id, audience: delivery.audience });
      message = `Field update published. ${deliveryResult.message}`;
    }
    setFeedback({ kind: 'success', message });
    setEditing(null);
  };

  return <section className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-widest text-editorial-charcoal/45">Content lifecycle</p><h2 className="font-serif text-3xl">Field Updates</h2></div><button type="button" onClick={() => { setEditing('new'); setFeedback(null); }} className="flex items-center gap-2 rounded-full bg-editorial-charcoal px-5 py-3 text-xs font-bold text-editorial-cream"><Plus className="h-4 w-4" />Create update</button></header>
    {feedback && <p role={feedback.kind === 'error' ? 'alert' : 'status'} aria-live="polite" className={`rounded-xl p-3 text-sm ${feedback.kind === 'error' ? 'bg-rose-500/10 text-rose-700' : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'}`}>{feedback.message}</p>}
    {editing && <FieldUpdateForm key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? undefined : editing} tracks={tracks} busy={create.isPending || save.isPending} onCancel={() => setEditing(null)} onSave={saveForm} />}
    <AdminListControls query={query} onChange={setQuery} searchPlaceholder="Search field updates">
      <FilterField label="Status"><select value={query.status} onChange={event => setQuery({ status: event.target.value })}><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></FilterField>
      <FilterField label="Ministry track"><select value={query.trackId} onChange={event => setQuery({ trackId: event.target.value })}><option value="">All tracks</option>{tracks.map(track => <option key={track.id} value={track.id}>{track.name}</option>)}</select></FilterField>
      <FilterField label="Category"><input value={query.category} onChange={event => setQuery({ category: event.target.value })} maxLength={100} /></FilterField>
      <FilterField label="Tag"><input value={query.tag} onChange={event => setQuery({ tag: event.target.value })} maxLength={100} /></FilterField>
      <FilterField label="Sort by"><select value={query.sortBy} onChange={event => setQuery({ sortBy: event.target.value })}>{['publishedAt', 'createdAt', 'updatedAt', 'title', 'tag', 'category', 'status'].map(value => <option key={value} value={value}>{value}</option>)}</select></FilterField>
      <FilterField label="Direction"><select value={query.sortOrder} onChange={event => setQuery({ sortOrder: event.target.value })}><option value="DESC">Descending</option><option value="ASC">Ascending</option></select></FilterField>
    </AdminListControls>
    <AdminListState loading={list.isLoading} error={list.error} empty={!list.data?.fieldUpdates.length}><div className="overflow-x-auto rounded-2xl border border-editorial-charcoal/10"><table className="w-full min-w-[980px] text-left text-xs"><thead className="bg-editorial-charcoal/5 text-[9px] uppercase tracking-wider text-editorial-charcoal/55"><tr><th className="p-3">Title</th><th className="p-3">Tag / category</th><th className="p-3">Track</th><th className="p-3">Status</th><th className="p-3">Published</th><th className="p-3">Updated</th><th className="p-3 text-right">Actions</th></tr></thead><tbody>{list.data?.fieldUpdates.map(item => <tr key={item.id} className="border-t border-editorial-charcoal/10"><td className="p-3 font-bold">{item.title}</td><td className="p-3">{item.tag}{item.category ? <span className="block text-[10px] text-editorial-charcoal/45">{item.category}</span> : null}</td><td className="p-3">{item.ministryTrack?.name || 'All tracks'}</td><td className="p-3"><StatusBadge status={item.status} /></td><td className="p-3">{dateLabel(item.publishedAt)}</td><td className="p-3">{dateLabel(item.updatedAt)}</td><td className="p-3"><div className="flex justify-end gap-1"><button type="button" title="Preview" aria-label={`Preview ${item.title}`} onClick={() => setPreview(item)} className="rounded-full border p-2"><Eye className="h-4 w-4" /></button><button type="button" title="Edit" aria-label={`Edit ${item.title}`} disabled={item.status === 'archived'} onClick={() => setEditing(item)} className="rounded-full border p-2 disabled:opacity-30"><Pencil className="h-4 w-4" /></button><button type="button" title="Publish" aria-label={`Publish ${item.title}`} disabled={item.status !== 'draft' || lifecycleBusy} onClick={() => run(() => publish.mutateAsync({ id: item.id }), 'Field update published.')} className="rounded-full border p-2 disabled:opacity-30"><Send className="h-4 w-4" /></button><button type="button" title="Archive" aria-label={`Archive ${item.title}`} disabled={item.status === 'archived' || lifecycleBusy} onClick={() => setArchiveTarget(item)} className="rounded-full border p-2 disabled:opacity-30"><Archive className="h-4 w-4" /></button><button type="button" title="Restore" aria-label={`Restore ${item.title}`} disabled={item.status !== 'archived' || lifecycleBusy} onClick={() => run(() => restore.mutateAsync(item.id), 'Field update restored to published.')} className="rounded-full border p-2 disabled:opacity-30"><RotateCcw className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div></AdminListState>
    {list.data && <AdminPagination page={list.data.page} limit={list.data.limit} total={list.data.total} totalPages={list.data.totalPages} onChange={setQuery} />}
    <ConfirmDialog open={!!archiveTarget} title="Archive field update?" description="It will disappear from the signed-in feed. You can restore it later." confirmLabel="Archive" destructive busy={archive.isPending} onCancel={() => setArchiveTarget(null)} onConfirm={() => archiveTarget && run(() => archive.mutateAsync(archiveTarget.id), 'Field update archived.').then(() => setArchiveTarget(null))} />
    {preview && <AdminPreview update={preview} onClose={() => setPreview(null)} />}
  </section>;
}

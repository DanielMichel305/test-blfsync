import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CalendarDays, ChevronLeft, ChevronRight, Image as ImageIcon, Loader2, Play, X } from 'lucide-react';
import type { components } from '../api/generated';
import { useFieldUpdate, useFieldUpdates } from '../api/hooks';
import { getApiErrorMessage } from '../api/errors';
import { FieldUpdateMarkdown } from './FieldUpdateMarkdown';

type FieldUpdate = components['schemas']['FieldUpdate'];

export function isCurrentlyVisible(update: FieldUpdate) {
  return update.status === 'published' && !!update.publishedAt && new Date(update.publishedAt).getTime() <= Date.now();
}

function PublicationDate({ value }: { value: string }) {
  return <time dateTime={value}>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))}</time>;
}

export function FieldUpdateMedia({ update, detail = false }: { update: FieldUpdate; detail?: boolean }) {
  if (!update.mediaUrl || !update.mediaType) return null;
  if (update.mediaType === 'image') {
    return <img src={update.mediaUrl} alt={detail ? `${update.title} media` : ''} loading="lazy" className={detail ? 'aspect-video w-full object-cover bg-black/5' : 'h-44 w-full object-cover'} />;
  }
  return (
    <div className={detail ? 'overflow-hidden rounded-2xl bg-black' : 'relative h-44 overflow-hidden bg-editorial-charcoal'}>
      <video src={update.mediaUrl} controls={detail} muted={!detail} preload="metadata" playsInline className={detail ? 'max-h-[28rem] w-full' : 'h-full w-full object-cover'} aria-label={`Video for ${update.title}`} />
      {!detail && <span className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="rounded-full bg-black/65 p-3 text-white"><Play className="h-5 w-5 fill-current" /></span></span>}
    </div>
  );
}

function FieldUpdateDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const detail = useFieldUpdate(id);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], video[controls], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();
    return () => { document.removeEventListener('keydown', onKeyDown); previousFocus?.focus(); };
  }, []);

  const update = detail.data && isCurrentlyVisible(detail.data) ? detail.data : null;
  const hasMedia = !!update?.mediaUrl && !!update.mediaType;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="field-update-detail-title" className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-editorial-card shadow-2xl">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close field update" className="absolute right-4 top-4 z-10 rounded-full border border-editorial-charcoal/15 bg-editorial-card/90 p-2 shadow-sm backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2"><X className="h-4 w-4" /></button>
        {detail.isLoading ? <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 px-5 py-16 text-sm sm:px-8"><Loader2 className="h-5 w-5 animate-spin" />Loading field update…</div>
          : detail.error ? <p role="alert" className="m-5 rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-700 sm:m-8">{getApiErrorMessage(detail.error, 'This field update could not be loaded.')}</p>
          : !update ? <p role="alert" className="m-5 rounded-2xl bg-amber-500/10 p-4 text-sm sm:m-8">This field update is not currently available.</p>
          : <article className="space-y-6 pb-5 sm:pb-8">
            <FieldUpdateMedia update={update} detail />
            <header className={`${hasMedia ? '' : 'pt-5 sm:pt-8'} px-5 sm:px-8`}>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-editorial-charcoal/55"><span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-800 dark:text-amber-300">{update.tag}</span>{update.category && <span className="rounded-full border px-3 py-1">{update.category}</span>}{update.ministryTrack && <span className="rounded-full border px-3 py-1">{update.ministryTrack.name}</span>}</div>
              <h2 id="field-update-detail-title" className="mt-4 font-serif text-3xl sm:text-5xl">{update.title}</h2>
              <p className="mt-3 flex items-center gap-2 text-xs text-editorial-charcoal/50"><CalendarDays className="h-4 w-4" /><PublicationDate value={update.publishedAt!} /></p>
            </header>
            <FieldUpdateMarkdown mdBody={update.mdBody} className="px-5 sm:px-8" label={`${update.title} content`} />
          </article>}
      </section>
    </div>
  );
}

export function MinistryFieldUpdatesFeed({ pageSize = 6 }: { pageSize?: number }) {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useFieldUpdates({ page, limit: pageSize });
  const updates = (query.data?.fieldUpdates || []).filter(isCurrentlyVisible);
  const totalPages = query.data?.totalPages || 1;

  return (
    <section aria-labelledby="ministry-field-updates-title" className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">From the field</p><h2 id="ministry-field-updates-title" className="mt-1 font-serif text-3xl sm:text-4xl">Ministry field updates</h2></div>
        {query.data && <p className="text-xs text-editorial-charcoal/50">{query.data.total} published updates</p>}
      </header>

      {query.isLoading ? <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 rounded-3xl border border-dashed p-12 text-sm"><Loader2 className="h-5 w-5 animate-spin" />Loading ministry updates…</div>
        : query.error ? <div role="alert" className="flex items-center gap-2 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-700"><AlertCircle className="h-5 w-5 shrink-0" />{getApiErrorMessage(query.error, 'Ministry updates could not be loaded.')}</div>
        : updates.length === 0 ? <div className="rounded-3xl border border-dashed p-12 text-center"><ImageIcon className="mx-auto h-6 w-6 text-editorial-charcoal/30" /><p className="mt-3 text-sm text-editorial-charcoal/55">No published field updates are available yet.</p></div>
        : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{updates.map(update => <article key={update.id} className="overflow-hidden rounded-[26px] border border-editorial-charcoal/10 bg-editorial-card shadow-sm">
          <FieldUpdateMedia update={update} />
          <div className="p-5">
            <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-wider"><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-800 dark:text-amber-300">{update.tag}</span>{update.category && <span className="rounded-full border px-2.5 py-1 text-editorial-charcoal/55">{update.category}</span>}</div>
            <h3 className="mt-3 font-serif text-xl">{update.title}</h3>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-editorial-charcoal/50"><span><PublicationDate value={update.publishedAt!} /></span>{update.ministryTrack && <span>{update.ministryTrack.name}</span>}</p>
            <button type="button" onClick={() => setSelectedId(update.id)} className="mt-5 rounded-full border border-editorial-charcoal/20 px-4 py-2 text-[10px] font-bold uppercase tracking-wider focus-visible:outline-2 focus-visible:outline-offset-2">Read full update</button>
          </div>
        </article>)}</div>}

      {query.data && query.data.total > pageSize && <nav aria-label="Field updates pagination" className="flex items-center justify-between rounded-2xl border border-editorial-charcoal/10 p-3 text-xs"><span>Page {query.data.page} of {totalPages}</span><div className="flex gap-2"><button type="button" aria-label="Previous field updates page" disabled={page <= 1 || query.isFetching} onClick={() => setPage(value => Math.max(1, value - 1))} className="rounded-full border p-2 disabled:opacity-35"><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-label="Next field updates page" disabled={page >= totalPages || query.isFetching} onClick={() => setPage(value => Math.min(totalPages, value + 1))} className="rounded-full border p-2 disabled:opacity-35"><ChevronRight className="h-4 w-4" /></button></div></nav>}
      {selectedId && <FieldUpdateDetail id={selectedId} onClose={() => setSelectedId(null)} />}
    </section>
  );
}

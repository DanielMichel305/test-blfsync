import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { ApiError } from '../../api/client';

export type AdminQueryValue = string | number | boolean | undefined;
export type AdminListQuery = Record<string, AdminQueryValue> & { page: number; limit: number; search?: string };

function readQuery<T extends AdminListQuery>(scope: string, defaults: T): T {
  if (typeof window === 'undefined') return defaults;
  const params = new URLSearchParams(window.location.search);
  const next = { ...defaults } as T;
  Object.keys(defaults).forEach(key => {
    const raw = params.get(`${scope}_${key}`);
    if (raw === null) return;
    const fallback = defaults[key];
    if (typeof fallback === 'number') next[key as keyof T] = Number(raw) as T[keyof T];
    else if (typeof fallback === 'boolean') next[key as keyof T] = (raw === 'true') as T[keyof T];
    else next[key as keyof T] = raw as T[keyof T];
  });
  next.page = Number.isFinite(next.page) && next.page > 0 ? next.page : 1;
  next.limit = Number.isFinite(next.limit) && next.limit > 0 ? next.limit : defaults.limit;
  return next;
}

export function useAdminListState<T extends AdminListQuery>(scope: string, defaults: T) {
  const stableDefaults = useMemo(() => defaults, [scope]);
  const [query, setQuery] = useState<T>(() => readQuery(scope, stableDefaults));

  useEffect(() => {
    const onPopState = () => setQuery(readQuery(scope, stableDefaults));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [scope, stableDefaults]);

  const update = useCallback((patch: Partial<T>, resetPage = true) => {
    setQuery(current => {
      const next = { ...current, ...patch };
      if (resetPage && !Object.prototype.hasOwnProperty.call(patch, 'page')) next.page = 1;
      const url = new URL(window.location.href);
      Object.entries(next).forEach(([key, value]) => {
        const param = `${scope}_${key}`;
        if (value === undefined || value === '') url.searchParams.delete(param);
        else url.searchParams.set(param, String(value));
      });
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
      return next;
    });
  }, [scope]);

  return { query, update };
}

export function AdminListControls({
  query, onChange, children, searchPlaceholder = 'Search',
}: {
  query: AdminListQuery;
  onChange: (patch: Partial<AdminListQuery>, resetPage?: boolean) => void;
  children?: React.ReactNode;
  searchPlaceholder?: string;
}) {
  return <div className="rounded-2xl border border-editorial-charcoal/10 bg-editorial-card p-4 space-y-3">
    <label className="relative block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-editorial-charcoal/35" />
      <input
        type="search"
        value={query.search || ''}
        onChange={event => onChange({ search: event.target.value })}
        placeholder={searchPlaceholder}
        className="w-full rounded-xl border border-editorial-charcoal/15 bg-transparent py-2 pl-9 pr-3 text-sm"
      />
    </label>
    <div className="flex flex-wrap items-end gap-3">{children}</div>
  </div>;
}

export function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="min-w-32 flex-1 text-[9px] font-bold uppercase tracking-wider text-editorial-charcoal/45">
    {label}<span className="mt-1 block [&>select]:w-full [&>select]:rounded-xl [&>select]:border [&>select]:border-editorial-charcoal/15 [&>select]:bg-editorial-card [&>select]:p-2 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-editorial-charcoal/15 [&>input]:bg-transparent [&>input]:p-2 [&>input]:text-sm">{children}</span>
  </label>;
}

export function AdminPagination({ page, limit, total, totalPages, onChange }: { page: number; limit: number; total: number; totalPages?: number; onChange: (patch: { page?: number; limit?: number }, resetPage?: boolean) => void }) {
  const pages = totalPages ?? Math.max(1, Math.ceil(total / limit));
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-editorial-charcoal/10 p-3 text-xs">
    <span className="text-editorial-charcoal/55">{total} results · Page {page} of {pages}</span>
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2">Rows
        <select value={limit} onChange={event => onChange({ limit: Number(event.target.value), page: 1 }, false)} className="rounded-lg border border-editorial-charcoal/15 bg-editorial-card p-1.5">
          {[10, 20, 50, 100].map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange({ page: page - 1 }, false)} className="rounded-full border p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
      <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onChange({ page: page + 1 }, false)} className="rounded-full border p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
    </div>
  </div>;
}

export function AdminListState({ loading, error, empty, children }: { loading: boolean; error: unknown; empty: boolean; children: React.ReactNode }) {
  if (loading) return <div className="flex justify-center rounded-2xl border border-dashed p-10" aria-label="Loading"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (error) return <div role="alert" className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-700"><AlertCircle className="h-4 w-4" />{error instanceof ApiError ? error.message : 'This list could not be loaded.'}</div>;
  if (empty) return <div className="rounded-2xl border border-dashed border-editorial-charcoal/20 p-10 text-center text-sm text-editorial-charcoal/45">No records match the current filters.</div>;
  return <>{children}</>;
}

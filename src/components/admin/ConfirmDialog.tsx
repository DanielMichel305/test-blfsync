import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', destructive = false, busy = false, reason, onReasonChange, requireReason = false, onCancel, onConfirm }: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  reason?: string;
  onReasonChange?: (value: string) => void;
  requireReason?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(onCancel);
  const busyRef = useRef(busy);
  onCancelRef.current = onCancel;
  busyRef.current = busy;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') || []);
    focusable()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busyRef.current) onCancelRef.current();
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-3xl bg-editorial-card p-6 shadow-2xl">
      <div className="flex items-start gap-3">
        <span className={`rounded-full p-2 ${destructive ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-700'}`}><AlertTriangle className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1"><h2 id="confirm-title" className="font-serif text-xl">{title}</h2><p className="mt-2 text-sm leading-relaxed text-editorial-charcoal/60">{description}</p></div>
        <button type="button" onClick={onCancel} disabled={busy} aria-label="Close" className="p-1"><X className="h-4 w-4" /></button>
      </div>
      {onReasonChange && <label className="mt-5 block text-[10px] font-bold uppercase tracking-wider text-editorial-charcoal/50">Reason{requireReason ? ' (required)' : ''}<textarea autoFocus value={reason || ''} onChange={event => onReasonChange(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-editorial-charcoal/15 bg-transparent p-3 text-sm normal-case tracking-normal" /></label>}
      <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onCancel} className="rounded-full border px-4 py-2 text-xs font-bold">Cancel</button><button type="button" disabled={busy || (requireReason && !reason?.trim())} onClick={onConfirm} className={`rounded-full px-4 py-2 text-xs font-bold text-white disabled:opacity-40 ${destructive ? 'bg-rose-600' : 'bg-editorial-charcoal'}`}>{busy ? 'Working…' : confirmLabel}</button></div>
    </div>
  </div>;
}

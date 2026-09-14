import React, { useMemo, useState } from 'react';
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  ListsToggle,
  MDXEditor,
  UndoRedo,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  quotePlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { FieldUpdateMarkdown } from '../FieldUpdateMarkdown';

type EditorMode = 'edit' | 'preview' | 'split';

export function FieldUpdateEditor({ value, onChange, disabled = false, labelledBy, invalid = false, describedBy }: { value: string; onChange: (value: string) => void; disabled?: boolean; labelledBy?: string; invalid?: boolean; describedBy?: string }) {
  const [mode, setMode] = useState<EditorMode>('edit');
  const plugins = useMemo(() => [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    linkPlugin(),
    toolbarPlugin({ toolbarContents: () => <><UndoRedo /><BlockTypeSelect /><BoldItalicUnderlineToggles /><ListsToggle /><CreateLink /></> }),
  ], []);

  return (
    <div className="space-y-2">
      <div role="group" aria-label="Markdown editor view" className="flex w-fit rounded-full border border-editorial-charcoal/15 bg-editorial-card p-1">
        {(['edit', 'preview', 'split'] as const).map(option => <button key={option} type="button" aria-pressed={mode === option} onClick={() => setMode(option)} className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${mode === option ? 'bg-editorial-charcoal text-editorial-cream' : 'text-editorial-charcoal/55'}`}>{option}</button>)}
      </div>
      <div className={mode === 'split' ? 'grid gap-3 lg:grid-cols-2' : ''}>
        {(mode === 'edit' || mode === 'split') && <div role="group" aria-labelledby={labelledBy} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={`overflow-hidden rounded-2xl border bg-white text-stone-900 ${invalid ? 'border-rose-600 ring-2 ring-rose-600/20' : 'border-editorial-charcoal/15'}`}><MDXEditor markdown={value} onChange={onChange} readOnly={disabled} plugins={plugins} contentEditableClassName="min-h-64 px-4 py-3" /></div>}
        {(mode === 'preview' || mode === 'split') && <div className="min-h-64 rounded-2xl border border-editorial-charcoal/15 bg-editorial-card p-5" role="region" aria-label="Sanitized Markdown preview" aria-live="polite"><FieldUpdateMarkdown mdBody={value} /></div>}
      </div>
      <p className="text-[10px] text-editorial-charcoal/45">Stored as Markdown. Preview uses the same sanitizer as the signed-in feed.</p>
    </div>
  );
}

import { Compass } from 'lucide-react';

export default function NotFoundPage({ onGoHome }: { onGoHome: () => void }) {
  return <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-4 text-center"><p className="text-xs font-bold uppercase tracking-[0.3em] text-editorial-charcoal/45">Error 404</p><h1 className="mt-4 font-serif text-5xl text-editorial-charcoal sm:text-6xl">Page not found</h1><p className="mt-4 text-sm leading-relaxed text-editorial-charcoal/60">This page may have moved, or the address may be incorrect.</p><button onClick={onGoHome} className="mt-8 flex items-center gap-2 rounded-full bg-editorial-charcoal px-5 py-3 text-xs font-bold text-editorial-cream"><Compass className="h-4 w-4" />Return home</button></section>;
}

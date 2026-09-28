import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, Info, X } from 'lucide-react';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export const WorldMapHero: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);
  const scrollToDonation = () => {
    document.getElementById('donation-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-[#0A0A0A] shadow-2xl">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
    <div className="absolute top-6 inset-x-0 w-full max-w-7xl mx-auto px-4 z-40 pointer-events-none">
      <div className="pointer-events-auto w-max"><button onClick={() => setShowInfo(value => !value)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80"><span className="sr-only">About this map</span>{showInfo ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}</button>
        <AnimatePresence>{showInfo && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-14 left-4 w-72 p-4 bg-[#1C1C1C]/95 border border-white/10 rounded-2xl shadow-2xl text-left"><p className="text-xs text-white/80 leading-relaxed">The map preserves the ministry's global presentation. Live locations and engagement totals are unavailable until the API documents a public counter/feed contract.</p></motion.div>}</AnimatePresence>
      </div>
    </div>
    <div className="w-full relative h-[500px] md:h-[625px] lg:h-[680px] opacity-70 flex items-center justify-center">
      <ComposableMap projection="geoMercator" width={800} height={400} projectionConfig={{ scale: 145, center: [0, 20] }} className="w-full h-full outline-none"><Geographies geography={geoUrl}>{({ geographies }) => geographies.map(geo => <Geography key={geo.rsmKey} geography={geo} fill="#1C1C1C" stroke="#2D2D2D" strokeWidth={0.5} className="outline-none" style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: '#242424' }, pressed: { outline: 'none' } }} />)}</Geographies></ComposableMap>
    </div>
    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 px-6 w-full text-center pointer-events-none"><motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight">Global Ministry Reach</motion.h2></div>
    <div className="absolute top-[56%] md:top-[60%] left-1/2 -translate-x-1/2 z-20 px-6 w-full text-center pointer-events-none"><p className="max-w-2xl mx-auto text-xs md:text-sm font-serif italic text-white/80 leading-relaxed">Every month, seekers across the Middle East look for answers, truth, and community online. <button type="button" onClick={scrollToDonation} className="pointer-events-auto inline-flex items-center gap-1 align-baseline rounded-sm px-0.5 font-inherit font-bold text-amber-300 underline decoration-amber-300/45 decoration-1 underline-offset-4 shadow-[0_0_12px_rgba(252,211,77,0.16)] transition-all hover:text-amber-200 hover:shadow-[0_0_16px_rgba(252,211,77,0.24)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">Partner <ArrowDown className="h-3 w-3 shrink-0" aria-hidden="true" /></button> with Better Life's ministry tracks to support that work.</p><div className="mt-5 inline-block rounded-2xl border border-white/10 bg-[#1C1C1C]/70 px-6 py-3"><span className="mb-1 block text-[8px] uppercase tracking-widest font-mono text-white/50">Live engagement data</span><span className="block text-xl font-mono font-bold text-amber-300">Awaiting API</span></div></div>
    <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent pointer-events-none" />
    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent pointer-events-none" />
  </div>;
};

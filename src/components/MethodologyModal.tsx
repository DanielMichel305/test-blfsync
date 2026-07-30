import { getLocalizedTrackName, getLocalizedTrackDesc, getLocalizedTrackUnitLabel } from '../utils/localization';
import { useLanguage } from '../LanguageContext';
import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MethodologyModalProps {
 isOpen: boolean;
 onClose: () => void;
 highlightTrackId?: string | null;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
 isOpen,
 onClose,
 highlightTrackId = null
}) => {
 const { t, language } = useLanguage();
  const tracksInfo = [
    {
      id: 'general-fund',
      name: 'General Fund',
      cost: '3.39 EGP',
      unit: 'soul sowed',
      description: 'The general fund represents the averaged impact across all active ministry tracks combined, allowing sowed resources to be sowed dynamically to the areas of greatest spiritual need.'
    },
    {
      id: 'gospel-reach',
      name: 'Evangelism',
      cost: '33.33 EGP',
      unit: 'person receiving the Gospel',
      description: 'Seekers who receive a complete digital presentation of the Gospel message via targeted social media video campaigns, followed by one-on-one support from a trained follow-up team member.'
    },
    {
      id: 'answer-search',
      name: 'Faith Questions Answered',
      cost: '2.00 EGP',
      unit: 'question answered',
      description: 'Direct apologetics and spiritual answers provided to curious seekers asking difficult theological questions online.'
    },
    {
      id: 'believer-followup',
      name: 'Discipleship Program',
      cost: '150.00 EGP',
      unit: 'person discipled',
      description: 'New disciples placed into structured daily Bible reading plans with active spiritual mentorship.'
    },
    {
      id: 'radio-ministry',
      name: 'Radio Ministry',
      cost: '0.83 EGP',
      unit: 'radio session',
      description: 'Spiritual programs and broadcasts delivered directly to remote village radios, homes, and transit vehicles.'
    },
    {
      id: 'rallies',
      name: 'Rallies: Youth, Women and Family',
      cost: '40.00 EGP',
      unit: 'person reached at rallies',
      description: 'Youth and family attendees at physically organized live assemblies, local crusades, and community care rallies.'
    }
  ];

 if (!isOpen) return null;

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="absolute inset-0 bg-editorial-charcoal/40 backdrop-blur-xs"
 />

 {/* Modal Container */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 transition={{ type: 'spring', duration: 0.4 }}
 className="bg-editorial-cream border border-editorial-charcoal/15 w-full max-w-2xl rounded-xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] text-left overflow-hidden"
 >
 {/* Header */}
 <div className="p-6 border-b border-editorial-charcoal/10 flex items-start justify-between bg-editorial-sand/10">
 <div className="space-y-1">
 <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-editorial-charcoal/5 border border-editorial-charcoal/10 rounded-sm text-[9px] uppercase tracking-[0.2em] font-bold text-editorial-charcoal">
 <span>{t("Conversion Audit & Standards", "معايير حساب الأثر")}</span>
 </div>
 <h3 className="text-xl font-serif font-bold text-editorial-charcoal">{t("Conversion Methodology", "منهجية حساب الأثر")}</h3>
 <p className="text-[11px] text-editorial-charcoal/60 leading-relaxed">
 How sowed seeds in EGP directly fuel strategic media operations and translate to souls touched in the Middle East.
 </p>
 </div>
 <button
 onClick={onClose}
 className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-editorial-charcoal/5 text-editorial-charcoal/50 hover:text-editorial-charcoal transition-colors cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Content (Scrollable) */}
 <div className="p-6 overflow-y-auto space-y-6">
 {/* Explainer Block */}
 <div className="p-4 bg-editorial-card rounded-lg border border-editorial-charcoal/10 space-y-2">
 <h4 className="text-xs font-bold text-editorial-charcoal font-sans uppercase tracking-wider">
 The Outreach Index
 </h4>
 <p className="text-xs text-editorial-charcoal/80 leading-relaxed font-serif italic">
 "Our calculations are strictly audited and directly bound to actual operating budgets. Your spiritual impact represents the accumulated sum of touchpoints sowed through your faith commitments."
 </p>
 </div>

 {/* Tracks List */}
 <div className="space-y-4">
 <h4 className="text-[10px] font-bold uppercase tracking-wider text-editorial-charcoal/55">{t("Track-by-Track Definitions", "تعريفات مسارات الخدمة")}</h4>
 
 <div className="grid grid-cols-1 gap-3">
 {tracksInfo.map((track) => {
 const isHighlighted = highlightTrackId === track.id;

 return (
 <div
 key={track.id}
 className={`p-4 rounded-lg border transition-all duration-300 relative overflow-hidden ${
 isHighlighted
 ? 'bg-editorial-soft/80 border-editorial-charcoal/30 shadow-xs'
 : 'bg-editorial-card border-editorial-charcoal/5 hover:border-editorial-charcoal/15'
 }`}
 >
 {isHighlighted && (
 <div className="absolute top-0 right-0 px-2 py-0.5 bg-editorial-charcoal text-editorial-cream text-[8px] font-bold uppercase tracking-wider rounded-bl-sm">
 Highlighted
 </div>
 )}

 <div className="space-y-1.5">
 <div className="flex items-center justify-between flex-wrap gap-x-2 border-b border-editorial-charcoal/5 pb-1">
 <h5 className="font-serif font-bold text-sm text-editorial-charcoal">{getLocalizedTrackName(track.id, track.name, language)}</h5>
 <span className="font-serif font-bold text-sm text-editorial-charcoal">
 {track.unit}
 </span>
 </div>
 <p className="text-xs text-editorial-charcoal/70 leading-relaxed font-serif italic pt-1">
 {getLocalizedTrackDesc(track.id, track.description, language)}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="p-4 border-t border-editorial-charcoal/10 bg-editorial-soft/30 flex items-center justify-between text-[10px] text-editorial-charcoal/60">
 <span className="font-serif italic text-editorial-charcoal/60">
 100% of sowed seeds reach operational campaigns.
 </span>
 <button
 onClick={onClose}
 className="px-4 py-2 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream font-bold uppercase tracking-widest rounded-lg text-[9px] cursor-pointer transition-colors"
 >
 Understand & Close
 </button>
 </div>
 </motion.div>
 </div>
 </AnimatePresence>
 );
};

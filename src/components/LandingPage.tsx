import React, { useState, useEffect } from 'react';
import { Track, Donor, Subscription, Transaction, Badge } from '../types';
import { calculateSubscriptionImpact } from '../db';
import { useLanguage } from '../LanguageContext';
import { getLocalizedTrackName, getLocalizedTrackDesc, getLocalizedTrackUnitLabel } from '../utils/localization';
import { 
 Radio, 
 Search, 
 HeartHandshake, 
 BookOpen, 
 Tv, 
 Video, 
 Users, 
 HelpCircle, 
 ArrowRight, 
 ChevronLeft, 
 ChevronRight, 
 Info, 
 X 
 , Flame, Crown, Heart, Layers, Share2, Globe, Youtube, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimateNumber } from './AnimateNumber';
import { MethodologyModal } from './MethodologyModal';
import { WorldMapHero } from './WorldMapHero';

interface LandingPageProps {
 currentUser: Donor | null;
  onDonateClick: (track: Track, amount: number, frequency: 'monthly' | 'annual' | 'one-time', isGuest?: boolean) => void;
 tracks: Track[];
 onOpenAuth: () => void;
 subscriptions: Subscription[];
 transactions: Transaction[];
 badges: Badge[];
 onUserChange?: (user: Donor | null) => void;
 updates?: any[];
 leaderboard?: any[];
}

export default function LandingPage({
 currentUser,
 onDonateClick,
 tracks,
 onOpenAuth,
 subscriptions,
 transactions,
 badges,
 onUserChange
}: LandingPageProps) {
 const { t, language } = useLanguage();
 // Selected tracks for calculator simulator
 const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

 // Methodology modal states
 const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
 const [methodologyTrackId, setMethodologyTrackId] = useState<string | null>(null);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  const [selectedTrackModal, setSelectedTrackModal] = useState<Track | null>(null);
  const [sliderVal, setSliderVal] = useState(500);
  const [frequency, setFrequency] = useState<"monthly" | "annual" | "one-time">("monthly");
  const [modalSliderVal, setModalSliderVal] = useState(500);
  useEffect(() => { if(selectedTrackModal) setModalSliderVal(selectedTrackModal.min_monthly_gift); }, [selectedTrackModal]);

  // Live ministry impact counter states
  const [videosWatched, setVideosWatched] = useState(153928120);
  const [questionsAnswered, setQuestionsAnswered] = useState(424510);
  const [professionsFaith, setProfessionsFaith] = useState(14820);

  // Quick Donation states
  const [quickTrackId, setQuickTrackId] = useState('');
  const [quickAmount, setQuickAmount] = useState(500);
  const [quickFrequency, setQuickFrequency] = useState<'monthly' | 'annual' | 'one-time'>('monthly');

  useEffect(() => {
    if (tracks.length > 0 && !quickTrackId) {
      setQuickTrackId(tracks[0].track_id);
    }
  }, [tracks, quickTrackId]);

 useEffect(() => {
 const startTime = Date.now();
 
 const interval = setInterval(() => {
 const elapsedMs = Date.now() - startTime;
 
 // Gospel Message Streamed: 10 per second = 10 / 1000 = 0.01 per millisecond
 const addedVideos = Math.floor(elapsedMs * 0.01);
 
 // Seeker Questions Answered: 14 per minute = 14 / 60000 = 0.000233333 per millisecond
 const addedQuestions = Math.floor(elapsedMs * (14 / 60000));
 
 // Professions of Faith: 1 every 21 minutes = 1 / (21 * 60 * 1000) = 1 / 1260000 per millisecond
 const addedProfessions = Math.floor(elapsedMs * (1 / 1260000));
 
 setVideosWatched(153928120 + addedVideos);
 setQuestionsAnswered(424510 + addedQuestions);
 setProfessionsFaith(14820 + addedProfessions);
 }, 100);

 return () => clearInterval(interval);
 }, []);

 // Smooth scroll & track highlight helper
 const handleStartSupporting = (trackId: string | null, minGift: number) => {
 setSelectedTrackIds([trackId]);
 if (sliderVal < minGift) {
 setSliderVal(minGift);
 }
 const element = document.getElementById('interactive-impact-sandbox');
 if (element) {
 element.scrollIntoView({ behavior: 'smooth', block: 'center' });
 }
 };

 // Set initial selected tracks once loaded
 useEffect(() => {
 if (tracks.length > 0 && selectedTrackIds.length === 0) {
 setSelectedTrackIds([tracks[0].track_id]);
 }
 }, [tracks]);

 const openMethodology = (trackId: string | null = null) => {
 setMethodologyTrackId(trackId);
 setIsMethodologyOpen(true);
 };

 // Icon mapper for tracks
 const renderTrackIcon = (iconName: string, className: string = "w-5 h-5") => {
 switch (iconName) {
 case 'Radio': return <Radio className={className} />;
 case 'Search': return <Search className={className} />;
 case 'HeartHandshake': return <HeartHandshake className={className} />;
 case 'BookOpen': return <BookOpen className={className} />;
 case 'Tv': return <Tv className={className} />;
 case 'Video': return <Video className={className} />;
 case 'Users': return <Users className={className} />;
    case 'Layers': return <Layers className={className} />;
 default: return <HelpCircle className={className} />;
 }
 };

 // Unsplash image source mapper for tracks
 const getTrackImage = (trackId: string): string => {
 switch (trackId) {
 case 'gospel-reach':
 return 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80';
 case 'answer-search':
 return 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80';
 
 case 'believer-followup':
 return 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80';
 case 'radio-ministry':
 return 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80';
 case 'rallies':
 return 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80';
 default:
 return 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&auto=format&fit=crop&q=80';
 }
 };

 // Format budget currency
 const formatCurrency = (val: number) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'EGP',
 maximumFractionDigits: 0
 }).format(val).replace('EGP', 'EGP ');
 };

 // Thermometer progress
 const getPercent = (t: Track) => {
 if (!t.annual_budget) return 0;
 return Math.min(Math.round((t.current_raised / t.annual_budget) * 100), 100);
 };

 // Calculate combined sowed seed metrics
 const selectedTracksList = tracks.filter(t => selectedTrackIds.includes(t.track_id));
 const minMonthlyGiftSum = selectedTracksList.reduce((sum, t) => sum + t.min_monthly_gift, 0);

 // Keep slider value safe on changes
 useEffect(() => {
 if (sliderVal < minMonthlyGiftSum) {
 setSliderVal(minMonthlyGiftSum);
 }
 }, [selectedTrackIds, minMonthlyGiftSum]);

 const toggleTrackSelection = (trackId: string) => {
 setSelectedTrackIds(prev => {
 let nextIds;
 const isUntoggle = prev.includes(trackId);
 if (isUntoggle) {
  nextIds = prev.filter(id => id !== trackId);
 } else {
 nextIds = [...prev, trackId];
 }
 
 const nextTracksList = tracks.filter(t => nextIds.includes(t.track_id));
 const nextMinSum = nextTracksList.reduce((sum, t) => sum + t.min_monthly_gift, 0);
 if (isUntoggle) {
 setSliderVal(nextMinSum);
 } else {
 if (sliderVal < nextMinSum) {
 setSliderVal(nextMinSum);
 }
 }
 return nextIds;
 });
 };

 // Calculate simulated impact units
 const actualAmount = Math.max(sliderVal, minMonthlyGiftSum);
 const splitAmount = actualAmount / (selectedTrackIds.length || 1);
 const totalSimulatedUnits = selectedTracksList.reduce((sum, track) => {
 const { monthlyUnits, annualUnits } = calculateSubscriptionImpact(track, splitAmount, frequency === 'annual' ? 'annual' : 'monthly');
 return sum + Math.round(frequency === 'monthly' ? monthlyUnits : annualUnits);
 }, 0);

 return (
 <div id="landing-page-container" className="space-y-8 md:space-y-12 pb-10 px-2 sm:px-4 relative">
      <WorldMapHero />
 
 {/* 1. Elegant Magazine-Style Header Banner */}
 

 {/* Real-time Ministry Impact Counter as a Bento Panel */}
 <section id="realtime-ministry-impact" className="max-w-6xl mx-auto">
 <motion.div 
 initial={{ opacity: 0, y: 40 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-100px" }}
 transition={{ duration: 0.6 }}
 className="bg-editorial-card border border-editorial-charcoal/10 rounded-[32px] p-6 md:p-10 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-48 h-48 bg-editorial-sand/10 rounded-full blur-3xl pointer-events-none" />
 
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-charcoal/5 pb-5 text-left">
 <div className="space-y-1.5">
 <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-amber-800 dark:text-amber-300 bg-amber-500 dark:bg-amber-600 dark:bg-amber-500/10 px-3 py-1 rounded-full inline-block font-mono border border-amber-500 dark:border-amber-400/15">
 Annual Ministry Impact Tracker
 </span>
 <h3 className="text-xl md:text-2xl font-serif font-bold text-editorial-charcoal">{t("Real-Time Gospel Operations", "عمليات الكرازة الحية")}</h3>
 </div>
 <div className="flex items-center gap-1.5 text-[9px] font-mono text-editorial-charcoal/50 bg-editorial-card border border-editorial-charcoal/10 px-3 py-1.5 rounded-full shrink-0 shadow-3xs">
 <span className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-500 dark:bg-orange-600 dark:bg-orange-500 animate-ping"></span>
 <span>{t("Live Counters Ticking", "إحصائيات حية")}</span>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {/* Item 1: Gospel Message Streamed */}
 <motion.div 
 whileHover={{ y: -5 }}
 className="bg-editorial-cream/30 border border-editorial-charcoal/5 rounded-2xl p-6 text-left space-y-4 hover:border-editorial-charcoal/20 transition-all duration-300 flex flex-col justify-between shadow-2xs"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="space-y-1">
 <span className="text-[9px] font-mono font-bold text-editorial-charcoal/40 uppercase tracking-widest block">{t("Gospel Message Streamed", "رسائل إنجيلية تم بثها")}</span>
 <p className="text-3xl font-bold text-editorial-charcoal tracking-tight font-mono">
 {videosWatched.toLocaleString()}
 </p>
 </div>
 <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 border border-blue-100 dark:border-blue-900/45">
 <Video className="w-4 h-4" />
 </div>
 </div>
 <div className="flex items-center gap-1.5 text-[10px] text-editorial-charcoal/50 border-t border-editorial-charcoal/5 pt-3">
 <span className="w-1.5 h-1.5 bg-orange-600 dark:bg-orange-500 dark:bg-orange-600 dark:bg-orange-500 rounded-full animate-pulse"></span>
 <span>10 messages streamed every second</span>
 </div>
 </motion.div>

 {/* Item 2: Seeker Questions Answered */}
 <motion.div 
 whileHover={{ y: -5 }}
 className="bg-editorial-cream/30 border border-editorial-charcoal/5 rounded-2xl p-6 text-left space-y-4 hover:border-editorial-charcoal/20 transition-all duration-300 flex flex-col justify-between shadow-2xs"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="space-y-1">
 <span className="text-[9px] font-mono font-bold text-editorial-charcoal/40 uppercase tracking-widest block">{t("Seeker Questions Answered", "تساؤلات مُجاب عنها")}</span>
 <p className="text-3xl font-bold text-editorial-charcoal tracking-tight font-mono">
 {questionsAnswered.toLocaleString()}
 </p>
 </div>
 <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 text-orange-600 dark:text-orange-400 dark:text-amber-400 rounded-xl shrink-0 border border-amber-100 dark:border-amber-900/45">
 <HelpCircle className="w-4 h-4" />
 </div>
 </div>
 <div className="flex items-center gap-1.5 text-[10px] text-editorial-charcoal/50 border-t border-editorial-charcoal/5 pt-3">
 <span className="w-1.5 h-1.5 bg-orange-600 dark:bg-orange-500 dark:bg-orange-600 dark:bg-orange-500 rounded-full animate-pulse"></span>
 <span>14 questions answered every minute</span>
 </div>
 </motion.div>

 {/* Item 3: Professions of Faith */}
 <motion.div 
 whileHover={{ y: -5 }}
 className="bg-editorial-cream/30 border border-editorial-charcoal/5 rounded-2xl p-6 text-left space-y-4 hover:border-editorial-charcoal/20 transition-all duration-300 flex flex-col justify-between shadow-2xs"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="space-y-1">
 <span className="text-[9px] font-mono font-bold text-editorial-charcoal/40 uppercase tracking-widest block">{t("Professions of Faith", "خطوات إيمان حقيقية")}</span>
 <p className="text-3xl font-bold text-editorial-charcoal tracking-tight font-mono">
 {professionsFaith.toLocaleString()}
 </p>
 </div>
 <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl shrink-0 border border-rose-100 dark:border-rose-900/45">
 <Users className="w-4 h-4" />
 </div>
 </div>
 <div className="flex items-center gap-1.5 text-[10px] text-editorial-charcoal/50 border-t border-editorial-charcoal/5 pt-3">
 <span className="w-1.5 h-1.5 bg-rose-600 dark:bg-rose-500 dark:bg-rose-600 dark:bg-rose-500 rounded-full animate-pulse"></span>
 <span>1 profession of faith every 21 minutes</span>
 </div>
 </motion.div>
 </div>
 </motion.div>

        </section>

        {/* 2. Visual Ministry Tracks Collage Grid in Urbi bento cards style */}
        {tracks && tracks.length > 0 && (
          <section id="overview-tracks-carousel" className="space-y-6 max-w-7xl mx-auto px-4 md:px-0 mb-12">
            <div className="flex items-end justify-between mb-4">
              <div className="text-left space-y-2">
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-editorial-charcoal tracking-tight">
                  {t("Our Core Ministry Tracks", "أقسام ومجالات الخدمة الأساسية")}
                </h2>
                <p className="text-sm text-editorial-charcoal/60 max-w-xl font-sans">
                  {t("Faithful backing options seeking sowed seeds today.", "فرص مباركة للمشاركة الروحية والعطاء لنمو ونشر كلمة الله.")}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button 
                  onClick={scrollLeft}
                  className="w-10 h-10 rounded-full border border-editorial-charcoal/10 flex items-center justify-center hover:bg-editorial-charcoal/5 transition-colors cursor-pointer text-editorial-charcoal/70 hover:text-editorial-charcoal"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={scrollRight}
                  className="w-10 h-10 rounded-full border border-editorial-charcoal/10 flex items-center justify-center hover:bg-editorial-charcoal/5 transition-colors cursor-pointer text-editorial-charcoal/70 hover:text-editorial-charcoal"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative group">
              <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 pt-2 px-2 -mx-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
                {tracks.map((track, idx) => {
                  const isSelected = selectedTrackIds.includes(track.track_id);
                  const percentVal = getPercent(track);
                  return (
                    <motion.div
                      key={track.track_id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className={`bg-editorial-card rounded-[32px] overflow-hidden border-2 border-transparent hover:border-emerald-500/30 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col group cursor-pointer relative shrink-0 snap-center w-[85vw] sm:w-[360px] md:w-[400px] lg:w-[460px] xl:w-[500px]`}
                      onClick={() => {
                          setSelectedTrackModal(track);
                      }}
                    >
                      <div className="relative h-[320px] md:h-[400px] lg:h-[460px] overflow-hidden flex-1">
                      <img src={getTrackImage(track.track_id)} alt={getLocalizedTrackName(track.track_id, getLocalizedTrackName(track.track_id, track.name, language), language)} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-all duration-700 group-hover:via-black/60 group-hover:to-black/30" />
                      
                      {/* Top Right Letter/Badge */}
                      <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-mono text-lg font-bold transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                        {track.letter}
                      </div>

                      <div className="absolute inset-x-6 bottom-6 flex flex-col justify-end text-white h-full pb-0">
                        <div className="transform transition-transform duration-500 group-hover:-translate-y-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center backdrop-blur-md shrink-0 border border-emerald-500/30">
                               {renderTrackIcon(track.icon, "w-5 h-5")}
                            </div>
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-serif text-white tracking-tight leading-tight">{getLocalizedTrackName(track.track_id, getLocalizedTrackName(track.track_id, track.name, language), language)}</h3>
                          </div>
                          
                          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out">
                            <div className="overflow-hidden">
                              <p className="text-sm md:text-base text-white/80 line-clamp-3 leading-relaxed mb-6">
                                {getLocalizedTrackDesc(track.track_id, track.description, language)}
                              </p>
                              
                              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                                    {t('Annual Goal', 'الهدف السنوي')}
                                  </span>
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                                    {percentVal}% {t('Funded', 'تم تمويله')}
                                  </span>
                                </div>
                                <div className="text-lg font-bold text-white font-serif">
                                  {track.annual_target.toLocaleString()} <span className="text-sm font-sans font-normal text-white/70">{getLocalizedTrackUnitLabel(track.track_id, track.target_unit_label, language)}</span>
                                </div>
                                <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${Math.min(100, Number(percentVal))}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-emerald-500 rounded-full"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 group-hover:text-emerald-300 transition-colors">
                                <span>{t('View Track Details', 'عرض تفاصيل المسار')}</span>
                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              </div>
            </div>
          </section>
        )}

        
        
        <section id="interactive-impact-sandbox" className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 lg:mb-24">
        {/* Main interactive area wrapper with a subtle background and padding to make it a distinct segment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                 
              {/* Left Column: Calculator Controls */}
              <div className="lg:col-span-7 flex flex-col bg-editorial-card rounded-[32px] p-6 sm:p-8 shadow-sm border border-editorial-charcoal/10">
                  {/* Header Area */}
                  <div className="text-left space-y-1.5 mb-6">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-editorial-charcoal tracking-tight font-medium leading-tight">{t("See the difference", "شاهد الفارق الذي يصنعه")}<span className="text-orange-600 dark:text-orange-400 italic">{t("your gift", "عطاؤك")}</span>{t("can make", "الآن")}</h2>
                    <p className="text-editorial-charcoal/50 text-sm font-medium max-w-lg font-sans">
                      Choose the ministry tracks you want to support. Move the slider to see more lives changed.
                    </p>
                  </div>
                   
                {/* 1. Track Selection Icons */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {tracks.map(track => {
                      const isSelected = selectedTrackIds.includes(track.track_id);
                      return (
                        <div 
                          key={track.track_id}
                          onClick={() => toggleTrackSelection(track.track_id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
                            isSelected 
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30 text-emerald-900 dark:text-emerald-100 hover:shadow-md' 
                              : 'bg-white border-editorial-charcoal/10 hover:border-editorial-charcoal/30 text-editorial-charcoal/70 hover:shadow-md'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected ? 'bg-emerald-600 dark:bg-emerald-500 dark:bg-emerald-600 dark:bg-emerald-500 border-emerald-600 text-white' : 'border-editorial-charcoal/20 text-transparent bg-editorial-charcoal/5'
                          }`}>
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-[11px] font-bold tracking-wide whitespace-nowrap">{getLocalizedTrackName(track.track_id, getLocalizedTrackName(track.track_id, track.name, language), language)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Gift Amount & Slider */}
                <div className="flex flex-col flex-1 justify-center space-y-8 bg-editorial-card rounded-2xl p-6 border border-editorial-charcoal/5 shadow-inner">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-editorial-charcoal/40 font-bold">{t('YOUR GIFT', 'عطاؤك')}</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl md:text-6xl font-serif text-editorial-charcoal font-medium tracking-tight">
                        {Math.max(sliderVal, minMonthlyGiftSum).toLocaleString()}
                      </span>
                      <span className="text-sm font-bold text-editorial-charcoal/50">{t("EGP", "جنيه")}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center max-w-md mx-auto w-full">
                    <div className="w-full relative px-2">
                      <input 
                        type="range" 
                        min={100} 
                        max={10000} 
                        step={100} 
                        value={Math.min(10000, Math.max(sliderVal, minMonthlyGiftSum))} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSliderVal(Math.max(val, minMonthlyGiftSum));
                        }}
                        style={{
                          background: `linear-gradient(to right, #1f2937 ${((Math.min(10000, Math.max(sliderVal, minMonthlyGiftSum)) - 100) / 9900) * 100}%, rgba(0,0,0,0.05) ${((Math.min(10000, Math.max(sliderVal, minMonthlyGiftSum)) - 100) / 9900) * 100}%)`
                        }}
                        className="w-full appearance-none h-2.5 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-editorial-charcoal [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md relative z-10"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {[100, 500, 2000, 5000, 10000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setSliderVal(amt)}
                        className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                          sliderVal === amt 
                            ? 'bg-editorial-charcoal border-editorial-charcoal text-editorial-cream shadow-sm' 
                            : 'bg-transparent border-editorial-charcoal/10 text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-charcoal/5 hover:border-editorial-charcoal/30'
                        }`}
                      >
                        {amt === 10000 ? '10,000+' : amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-editorial-charcoal/10">
                    {['monthly', 'annual', 'one-time'].map(freq => (
                      <button
                        key={freq}
                        onClick={() => setFrequency(freq as any)}
                        className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all border ${
                          frequency === freq 
                            ? 'bg-emerald-600 dark:bg-emerald-500 dark:bg-emerald-600 dark:bg-emerald-500 border-emerald-600 text-white shadow-md transform scale-105' 
                            : 'bg-transparent border-editorial-charcoal/15 text-editorial-charcoal/50 hover:text-editorial-charcoal hover:border-editorial-charcoal/40 hover:bg-editorial-charcoal/5'
                        }`}
                      >
                        {freq === 'monthly' ? t('Monthly', 'شهرياً') : freq === 'annual' ? t('Annual', 'سنوياً') : t('One Time', 'مرة واحدة')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Impact Results Box */}
              <div className="lg:col-span-5 relative flex flex-col bg-black text-white rounded-[32px] overflow-hidden shadow-2xl border border-white/10 p-8 sm:p-10 lg:p-12">
                
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Hero Metric */}
                  <div className="text-center pb-8 border-b border-white/10 mb-8">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/50 font-mono block mb-3">
                      {t('YOU CAN REACH', 'يمكنك الوصول إلى')}
                    </span>
                    <div className="text-7xl lg:text-8xl font-serif text-white leading-none font-medium my-4 tracking-tighter">
                      ~{Math.round(totalSimulatedUnits).toLocaleString()}
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-400 font-mono mt-4 bg-emerald-950/50 inline-block px-4 py-1.5 rounded-full border border-emerald-800/50">
                      PEOPLE {frequency === 'monthly' ? t('EVERY MONTH', 'كل شهر') : frequency === 'annual' ? t('EVERY YEAR', 'كل سنة') : t('ONCE', 'مرة واحدة')}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                       <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono font-bold">
                         YOUR IMPACT BREAKDOWN
                       </div>
                       <button
                          onClick={() => setIsMethodologyOpen(true)}
                          className="text-[10px] uppercase font-bold text-white/40 hover:text-white flex items-center gap-1.5 transition-colors bg-white/5 px-2.5 py-1 rounded-md hover:bg-white/10"
                        >
                          <Info className="w-3 h-3" />
                          <span>{t('Methodology', 'منهجية الحساب')}</span>
                        </button>
                    </div>

                    <div className="flex-1 space-y-5 text-left">
                      {selectedTracksList.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 opacity-50">
                          <Heart className="w-12 h-12 text-white/20" />
                          <p className="text-white/60 text-sm font-medium max-w-[200px]">{t("Select ministry tracks to see your impact breakdown.", "اختر مسارات الخدمة لترى تفاصيل أثرك.")}</p>
                        </div>
                      ) : (
                        selectedTracksList.map((track, i) => {
                          const trackPercent = 1 / (selectedTracksList.length || 1);
                          const allocatedAmount = sliderVal * trackPercent;
                          const { monthlyUnits, annualUnits } = calculateSubscriptionImpact(track, allocatedAmount, frequency === 'annual' ? 'annual' : 'monthly');
                          const impactNumber = frequency === 'annual' ? annualUnits : monthlyUnits;
                          
                          return (
                            <div key={track.track_id} className="space-y-2.5 group">
                              <div className="flex justify-between items-baseline text-sm">
                                <span className="font-bold text-white/90 group-hover:text-white transition-colors">
                                  {getLocalizedTrackName(track.track_id, getLocalizedTrackName(track.track_id, track.name, language), language)}
                                </span>
                                <span className="font-mono font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors text-xs">
                                  ~{Math.round(impactNumber).toLocaleString()} {getLocalizedTrackUnitLabel(track.track_id, track.target_unit_label, language)}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 dark:bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${Math.min((allocatedAmount / Math.max(sliderVal, 1)) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    
                    <div className="pt-6 mt-4 border-t border-white/10">
                      <button 
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          setTimeout(() => onOpenAuth(), 500);
                        }}
                        className="w-full py-4 bg-orange-600 dark:bg-orange-500 dark:bg-orange-600 hover:bg-orange-500 dark:bg-orange-600 dark:bg-orange-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.23)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <Flame className="w-4 h-4" />
                        <span>{t('Start Changing Lives', 'ابدأ بتغيير الحياة')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </section>
      <AnimatePresence>
        {selectedTrackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedTrackModal(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-3xl bg-editorial-card rounded-[32px] overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedTrackModal(null)}
                className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-48 md:h-64 shrink-0">
                <img 
                  src={getTrackImage(selectedTrackModal.track_id)} 
                  alt={selectedTrackModal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="text-white/80 font-mono text-[10px] uppercase tracking-widest block mb-2">{t("Ministry Track", "مسار الخدمة")} {selectedTrackModal.letter}</span>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                      {getLocalizedTrackName(selectedTrackModal.track_id, selectedTrackModal.name, language)}
                    </h2>
                  </div>
                  <div className="hidden md:flex bg-editorial-card/20 backdrop-blur-md p-3 rounded-full text-white">
                    {renderTrackIcon(selectedTrackModal.icon, "w-6 h-6")}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto flex-grow space-y-8">
                <div className="prose prose-sm md:prose-base prose-editorial text-editorial-charcoal/80">
                  <p className="text-lg font-serif italic text-editorial-charcoal">
                    {getLocalizedTrackDesc(selectedTrackModal.track_id, selectedTrackModal.description, language)}
                  </p>
                  
                  <p className="mt-4 font-sans text-sm leading-relaxed">
                    By partnering with this track, you directly supply the resources needed to sustain and scale these vital operations. Every contribution translates into measurable outcomes: {selectedTrackModal.target_unit_label}. Your generosity ensures that our teams can continue working effectively, reaching those who need to hear the message of hope most.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="bg-editorial-cream border border-editorial-charcoal/10 rounded-2xl p-4 text-center flex-1 min-w-[150px]">
                    <span className="block text-[9px] uppercase tracking-widest text-editorial-charcoal/50 font-bold mb-1 font-mono">{t("Target Goal", "الهدف المطلوب")}</span>
                    <span className="block text-xl font-bold text-editorial-charcoal">{selectedTrackModal.annual_target.toLocaleString()}</span>
                    <span className="block text-[10px] font-normal font-serif italic text-editorial-charcoal/60 mt-1 leading-tight">{getLocalizedTrackUnitLabel(selectedTrackModal.track_id, selectedTrackModal.target_unit_label, language)}</span>
                  </div>
                  <div className="bg-editorial-cream border border-editorial-charcoal/10 rounded-2xl p-4 text-center flex-1 min-w-[150px]">
                    <span className="block text-[9px] uppercase tracking-widest text-editorial-charcoal/50 font-bold mb-1 font-mono">{t("Progress", "معدل التقدم")}</span>
                    <span className="block text-xl font-bold text-editorial-charcoal">{getPercent(selectedTrackModal)}%</span>
                    <span className="block text-[10px] font-normal font-serif italic text-editorial-charcoal/60 mt-1 leading-tight">{t("Funded this year", "تم تمويله هذا العام")}</span>
                  </div>
                </div>
                <div className="bg-editorial-cream border border-editorial-charcoal/10 rounded-2xl p-6 flex flex-col space-y-6 mt-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="block text-[10px] uppercase tracking-widest text-editorial-charcoal/50 font-bold mb-1 font-mono">{t("Your Monthly Gift", "عطاؤك الشهري")}</span>
                      <span className="block text-2xl font-bold text-editorial-charcoal">{formatCurrency(modalSliderVal)}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400/70 font-bold mb-1 font-mono">{t("Estimated Impact", "الأثر المتوقع")}</span>
                      <span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400">~{Math.round((modalSliderVal / 100) * selectedTrackModal.units_per_100_egp).toLocaleString()} <span className="text-sm font-normal">{getLocalizedTrackUnitLabel(selectedTrackModal.track_id, selectedTrackModal.target_unit_label, language)}</span></span>
                    </div>
                  </div>
                  <div className="w-full relative px-2 pt-2">
                    <input 
                      type="range" 
                      min={selectedTrackModal.min_monthly_gift} 
                      max={Math.max(10000, selectedTrackModal.min_monthly_gift * 10)} 
                      step={100} 
                      value={modalSliderVal} 
                      onChange={(e) => setModalSliderVal(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #1f2937 ${((modalSliderVal - selectedTrackModal.min_monthly_gift) / (Math.max(10000, selectedTrackModal.min_monthly_gift * 10) - selectedTrackModal.min_monthly_gift)) * 100}%, rgba(0,0,0,0.1) ${((modalSliderVal - selectedTrackModal.min_monthly_gift) / (Math.max(10000, selectedTrackModal.min_monthly_gift * 10) - selectedTrackModal.min_monthly_gift)) * 100}%)`
                      }}
                      className="w-full appearance-none h-1.5 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-editorial-charcoal [&::-webkit-slider-thumb]:cursor-pointer relative z-10"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 pt-4">
                  <a href="#" className="w-10 h-10 rounded-full border border-editorial-charcoal/10 flex items-center justify-center text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-cream transition-all">
                    <Globe className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-editorial-charcoal/10 flex items-center justify-center text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-cream transition-all">
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-editorial-charcoal/10 flex items-center justify-center text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-cream transition-all">
                    <Share2 className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-editorial-charcoal/10">
                  <button
                    onClick={() => {
                      setSelectedTrackModal(null);
                      handleStartSupporting(selectedTrackModal.track_id, modalSliderVal);
                    }}
                    className="w-full sm:w-auto flex-1 px-8 py-4 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream font-bold text-sm rounded-full transition-all uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:-translate-y-0.5"
                  >
                    <span>{t("Start Supporting", "ابدأ المشاركة والتقديم")}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="w-full sm:w-auto text-center sm:text-left">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-editorial-charcoal/50">{t("Your Gift", "عطاؤك")}</span>
                    <span className="text-lg font-bold text-editorial-charcoal">{formatCurrency(modalSliderVal)} <span className="text-sm font-normal text-editorial-charcoal/60">/ mo</span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Methodology Explainer Modal */}
 <MethodologyModal
 isOpen={isMethodologyOpen}
 onClose={() => setIsMethodologyOpen(false)}
 highlightTrackId={methodologyTrackId}
 />

 </div>
 );
}

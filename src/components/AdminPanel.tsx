import { getLocalizedTrackName, getLocalizedTrackDesc, getLocalizedTrackUnitLabel } from '../utils/localization';
import { useLanguage } from '../LanguageContext';
import React, { useState } from 'react';
import { Track, Donor, UpdateFeed, Subscription, Transaction } from '../types';
import { db } from '../db';
import { 
 Users, 
 BarChart2, 
 Settings, 
 PlusCircle, 
 Edit3, 
 DollarSign, 
 FileText, 
 Save, 
 TrendingUp, 
 UserPlus, 
 AlertCircle,
 Megaphone,
 Layers,
 Heart
} from 'lucide-react';

interface AdminPanelProps {
 currentUser: Donor;
 tracks: Track[];
 donors: Donor[];
 updates: UpdateFeed[];
 subscriptions: Subscription[];
 transactions: Transaction[];
 onUpdateTracks: (tracks: Track[]) => void;
 onUpdateUpdates: (updates: UpdateFeed[]) => void;
}

export default function AdminPanel({
 currentUser,
 tracks,
 donors,
 updates,
 subscriptions,
 transactions,
 onUpdateTracks,
 onUpdateUpdates
}: AdminPanelProps) {
  const { t, language } = useLanguage();
 // Stats
 const activeSubs = subscriptions.filter(s => s.status === 'active');
 const totalRaised = tracks.reduce((sum, trk) => sum + trk.current_raised, 0);
 const totalDonorsCount = donors.filter(d => d.role === 'donor').length;
 const averageGift = activeSubs.length > 0 
 ? Math.round(activeSubs.reduce((sum, s) => sum + s.amount, 0) / activeSubs.length)
 : 0;

 // Track editing form state
 const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
 const [editRaised, setEditRaised] = useState(0);
 const [editBudget, setEditBudget] = useState(0);

 // New post update form state
 const [postTitle, setPostTitle] = useState('');
 const [postContent, setPostContent] = useState('');
 const [postCategory, setPostCategory] = useState('Evangelism');
 const [postUrl, setPostUrl] = useState('');
 const [postSuccess, setPostSuccess] = useState(false);

 // Simulator state
 const [simulateTrackId, setSimulateTrackId] = useState(tracks[0]?.track_id || '');
 const [simulateAmount, setSimulateAmount] = useState(50000);
 const [simulationSuccess, setSimulationSuccess] = useState(false);

 // Handle saving track updates
 const handleEditTrack = (track: Track) => {
 setEditingTrackId(track.track_id);
 setEditRaised(track.current_raised);
 setEditBudget(track.annual_budget);
 };

 const handleSaveTrack = (trackId: string) => {
 const updated = tracks.map(trk => {
 if (trk.track_id === trackId) {
 return { ...trk, current_raised: editRaised, annual_budget: editBudget };
 }
 return trk;
 });
 onUpdateTracks(updated);
 db.saveTracks(updated);
 setEditingTrackId(null);
 };

 // Handle publishing update
 const handlePublishUpdate = (e: React.FormEvent) => {
 e.preventDefault();
 if (!postTitle || !postContent) return;

 const newPost: UpdateFeed = {
 post_id: 'post-' + Math.random().toString(36).substr(2, 9),
 title: postTitle,
 content: postContent,
 publish_date: new Date().toISOString().split('T')[0],
 category: postCategory,
 media_url: postUrl || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600'
 };

 const updated = [newPost, ...updates];
 onUpdateUpdates(updated);
 db.saveUpdates(updated);

 // Reset Form
 setPostTitle('');
 setPostContent('');
 setPostUrl('');
 setPostSuccess(true);
 setTimeout(() => setPostSuccess(false), 2500);
 };

 // Handle simulated external donation spike
 const handleTriggerSimulation = () => {
 if (!simulateTrackId) return;

 const updated = tracks.map(trk => {
 if (trk.track_id === simulateTrackId) {
 return { ...trk, current_raised: trk.current_raised + simulateAmount };
 }
 return trk;
 });
 
 // Add a simulated transaction under anonymous donor
 const txId = 'tx-sim-' + Math.random().toString(36).substr(2, 9);
 const newTx: Transaction = {
 transaction_id: txId,
 donor_id: 'donor-anon',
 donor_name: 'Anonymous Partner (Cairo)',
 track_id: simulateTrackId,
 amount: simulateAmount,
 date: new Date().toISOString().split('T')[0],
 payment_method: 'card',
 frequency: 'one-time'
 };
 
 const allTxs = db.getTransactions();
 db.saveTransactions([...allTxs, newTx]);

 onUpdateTracks(updated);
 db.saveTracks(updated);

 setSimulationSuccess(true);
 setTimeout(() => setSimulationSuccess(false), 2000);
 };

 return (
 <div id="admin-panel-container" className="space-y-10 pb-16">
 
 {/* 1. Header Admin Hero */}
 <section id="admin-banner" className="bg-editorial-charcoal text-editorial-cream p-6 sm:p-8 rounded-none border border-editorial-charcoal/10 relative overflow-hidden">
 <div className="flex items-center gap-3.5">
 <div className="w-12 h-12 bg-editorial-soft text-editorial-charcoal rounded-none border border-editorial-charcoal/20 flex items-center justify-center font-serif font-black text-lg">
 S
 </div>
 <div>
 <span className="text-[9px] uppercase font-bold tracking-[0.22em] text-editorial-sand block">{t("Ministry Portal", "بوابة الخدمة")}</span>
 <h2 className="text-2xl font-serif font-light text-editorial-cream mt-1 tracking-wide leading-tight">{t("Better Life Staff Admin Center", "مركز إدارة طاقم حياة أفضل")}</h2>
 <p className="text-xs text-editorial-sand/70 font-sans mt-1.5">{t("Welcome, ", "مرحباً، ")}{currentUser.name}. Manage media targets, post field logs, and review giving statistics.</p>
 </div>
 </div>

 {/* Aggregate KPI indicators */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 border-t border-editorial-sand/15 pt-6">
 <div className="bg-editorial-sand/10 border border-editorial-sand/10 p-4 rounded-none">
 <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-editorial-sand/60 block">{t("Total Raised (2026)", "إجمالي التبرعات (2026)")}</span>
 <span className="text-base font-bold font-mono text-editorial-cream mt-1 block">
 {totalRaised.toLocaleString()} EGP
 </span>
 </div>

 <div className="bg-editorial-sand/10 border border-editorial-sand/10 p-4 rounded-none">
 <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-editorial-sand/60 block">{t("Active subscr.", "الاشتراكات النشطة")}</span>
 <span className="text-base font-bold font-mono text-editorial-cream mt-1 block">
 {activeSubs.length} Donors
 </span>
 </div>

 <div className="bg-editorial-sand/10 border border-editorial-sand/10 p-4 rounded-none">
 <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-editorial-sand/60 block">{t("Total Seed Givers", "إجمالي الداعمين")}</span>
 <span className="text-base font-bold font-mono text-editorial-cream mt-1 block">
 {totalDonorsCount} Partners
 </span>
 </div>

 <div className="bg-editorial-sand/10 border border-editorial-sand/10 p-4 rounded-none">
 <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-editorial-sand/60 block">{t("Avg monthly gift", "متوسط العطاء الشهري")}</span>
 <span className="text-base font-bold font-mono text-editorial-cream/90 mt-1 block">
 {averageGift} EGP
 </span>
 </div>
 </div>
 </section>

 {/* 2. Primary layout splits */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 
 {/* Left Column: Edit Track Targets / Raised Amounts */}
 <div className="lg:col-span-7 bg-editorial-cream border border-editorial-charcoal/10 rounded-none p-6 space-y-6">
 <div className="border-b border-editorial-charcoal/10 pb-3.5 flex items-center justify-between">
 <div>
 <h3 className="text-base font-serif font-bold text-editorial-charcoal">{t("Track Targets & Progress", "أهداف المسارات ومعدل التقدم")}</h3>
 <p className="text-xs text-editorial-charcoal/60 font-serif italic mt-0.5">{t("Edit raised amounts to update front-end donor thermometers instantly", "قم بتعديل المبالغ المجموعة لتحديث مؤشرات الداعمين فوراً")}</p>
 </div>
 <Settings className="w-4 h-4 text-editorial-charcoal/40" />
 </div>

 <div className="space-y-4">
 {tracks.map((trk) => {
 const pct = Math.min(Math.round((trk.current_raised / trk.annual_budget) * 100), 100);
 const isEditing = editingTrackId === trk.track_id;

 return (
 <div 
 key={trk.track_id}
 className="p-4.5 border border-editorial-charcoal/10 bg-editorial-soft/30 space-y-3.5 rounded-none"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <span className="w-5 h-5 rounded-none bg-editorial-charcoal text-editorial-cream flex items-center justify-center text-[10px] font-black font-mono">
 {trk.letter}
 </span>
 <h4 className="text-xs font-serif font-bold text-editorial-charcoal">{getLocalizedTrackName(trk.track_id, trk.name, language)}</h4>
 </div>

 {!isEditing && (
 <button
 onClick={() => handleEditTrack(trk)}
 className="p-2.5 hover:bg-editorial-charcoal/5 text-editorial-charcoal/60 rounded-none transition-colors cursor-pointer"
 title="Edit operational goals"
 >
 <Edit3 className="w-3.5 h-3.5" />
 </button>
 )}
 </div>

 {isEditing ? (
 <div className="space-y-3.5 p-4.5 bg-editorial-card border border-editorial-charcoal/10 rounded-none">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-[9px] font-bold text-editorial-charcoal/50 uppercase tracking-wider mb-1">{t("Current raised (EGP)", "المبلغ المجمع الحالي (جنيه)")}</label>
 <input 
 type="number"
 value={editRaised}
 onChange={(e) => setEditRaised(Number(e.target.value))}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-none bg-editorial-cream/30 focus:outline-none focus:border-editorial-charcoal"
 />
 </div>
 <div>
 <label className="block text-[9px] font-bold text-editorial-charcoal/50 uppercase tracking-wider mb-1">{t("Annual Budget (EGP)", "الميزانية السنوية (جنيه)")}</label>
 <input 
 type="number"
 value={editBudget}
 onChange={(e) => setEditBudget(Number(e.target.value))}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-none bg-editorial-cream/30 focus:outline-none focus:border-editorial-charcoal"
 />
 </div>
 </div>
 <div className="flex items-center gap-2.5 justify-end pt-1">
 <button
 onClick={() => setEditingTrackId(null)}
 className="px-3.5 py-1.5 bg-editorial-sand/40 text-editorial-charcoal text-[10px] uppercase tracking-wider font-bold rounded-none cursor-pointer"
 >{t("Cancel", "إلغاء")}</button>
 <button
 onClick={() => handleSaveTrack(trk.track_id)}
 className="px-3.5 py-1.5 bg-editorial-charcoal text-editorial-cream text-[10px] uppercase tracking-wider font-bold rounded-none flex items-center gap-1.5 cursor-pointer"
 >
 <Save className="w-3 h-3" />
 <span>{t("Save changes", "حفظ التغييرات")}</span>
 </button>
 </div>
 </div>
 ) : (
 <div className="space-y-1.5">
 <div className="flex justify-between text-[11px] text-editorial-charcoal/70">
 <span className="font-serif italic">{pct}% Funded ({trk.current_raised.toLocaleString()} EGP raised)</span>
 <span className="font-bold text-editorial-charcoal">{t("Target:", "الهدف:")} {trk.annual_budget.toLocaleString()} {t("EGP", "جنيه")}</span>
 </div>
 <div className="w-full h-1.5 bg-editorial-sand rounded-none overflow-hidden border border-editorial-charcoal/5">
 <div 
 className="bg-editorial-charcoal h-full rounded-none" 
 style={{ width: `${pct}%` }}
 ></div>
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>

 {/* Right Column: Post Updates Feed & Simulation Sandboxes */}
 <div className="lg:col-span-5 space-y-6">
 
 {/* Create Field Update Form */}
 <div className="bg-editorial-cream border border-editorial-charcoal/10 rounded-none p-6 space-y-5">
 <div className="border-b border-editorial-charcoal/10 pb-3 flex items-center gap-2">
 <Megaphone className="w-4 h-4 text-editorial-charcoal/60" />
 <div>
 <h3 className="text-base font-serif font-bold text-editorial-charcoal">{t("Publish Field Update", "نشر تحديث ميداني")}</h3>
 <p className="text-xs text-editorial-charcoal/60 font-serif italic mt-0.5">{t("Post testimonies and operational logs directly to donor landing feeds", "انشر الشهادات وتقارير العمل الميداني مباشرة لصفحات الداعمين")}</p>
 </div>
 </div>

 {postSuccess && (
 <div className="p-3 bg-emerald-50 dark:bg-emerald-500 dark:bg-emerald-600 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500 dark:border-emerald-400/20 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-none">
  Field update published successfully to all donor portals!
 </div>
 )}

 <form onSubmit={handlePublishUpdate} className="space-y-4">
 <div>
 <label className="block text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/60 mb-1.5">{t("Post Title", "عنوان المنشور")}</label>
 <input 
 type="text"
 required
 placeholder={t("e.g., Radio Session touches thousands in Cairo", "مثال: حلقة إذاعية تلمس الآلاف في القاهرة")}
 value={postTitle}
 onChange={(e) => setPostTitle(e.target.value)}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-none focus:outline-none focus:border-editorial-charcoal bg-editorial-cream/30 focus:bg-editorial-card"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/60 mb-1.5">{t("Category", "الفئة")}</label>
 <select
 value={postCategory}
 onChange={(e) => setPostCategory(e.target.value)}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-none bg-editorial-cream/30 focus:outline-none focus:border-editorial-charcoal"
 >
 {tracks.map(trk => (
 <option key={trk.track_id} value={getLocalizedTrackName(trk.track_id, trk.name, language)}>{getLocalizedTrackName(trk.track_id, trk.name, language)}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/60 mb-1.5">{t("Photo URL (optional)", "رابط الصورة (اختياري)")}</label>
 <input 
 type="url"
 placeholder={t("e.g. https://images.unsplash.com...", "مثال: https://images.unsplash.com...")}
 value={postUrl}
 onChange={(e) => setPostUrl(e.target.value)}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-none focus:outline-none focus:border-editorial-charcoal bg-editorial-cream/30 focus:bg-editorial-card"
 />
 </div>
 </div>

 <div>
 <label className="block text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/60 mb-1.5">{t("Report Content", "محتوى التقرير")}</label>
 <textarea 
 required
 rows={4}
 placeholder={t("Describe what occurred, people reached, and how donor funding enabled this testimony...", "صف ما حدث، النفوس التي تم الوصول إليها وكيف ساعد دعم الشركاء...")}
 value={postContent}
 onChange={(e) => setPostContent(e.target.value)}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-none focus:outline-none focus:border-editorial-charcoal bg-editorial-cream/30 focus:bg-editorial-card resize-none"
 ></textarea>
 </div>

 <button
 type="submit"
 className="w-full py-3 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream font-bold text-[10px] uppercase tracking-widest rounded-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
 >
 <PlusCircle className="w-3.5 h-3.5" />
 <span>{t("Publish Report", "نشر التقرير")}</span>
 </button>
 </form>
 </div>

 {/* External donation simulator sandbox */}
 <div className="bg-editorial-soft border border-editorial-charcoal/10 p-6 rounded-none space-y-4">
 <div className="flex items-center gap-2">
 <Settings className="w-4 h-4 text-editorial-charcoal/60" />
 <h3 className="text-base font-serif font-bold text-editorial-charcoal">{t("Sandboxed Donation Simulator", "محاكي التبرعات (تجريبي)")}</h3>
 </div>
 
 <p className="text-xs text-editorial-charcoal/70 leading-relaxed font-serif italic">
 Simulate an external anonymous wire transfer to test how thermometer progress bars, glowing flames, and live community stats recalculate.
 </p>

 {simulationSuccess && (
 <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500 dark:bg-emerald-600 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500 dark:border-emerald-400/20 text-emerald-800 dark:text-emerald-400 text-[11px] font-bold rounded-none text-center">
  Simulated donation of {simulateAmount.toLocaleString()} EGP successfully integrated!
 </div>
 )}

 <div className="space-y-3.5 bg-editorial-card p-4.5 rounded-none border border-editorial-charcoal/10">
 <div>
 <label className="block text-[9px] uppercase tracking-wider font-bold text-editorial-charcoal/50 mb-1">{t("Target Track", "المسار المستهدف")}</label>
 <select
 value={simulateTrackId}
 onChange={(e) => setSimulateTrackId(e.target.value)}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-none bg-editorial-cream/30 focus:outline-none focus:border-editorial-charcoal"
 >
 {tracks.map(trk => (
 <option key={trk.track_id} value={trk.track_id}>{getLocalizedTrackName(trk.track_id, trk.name, language)} (Track {trk.letter})</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-[9px] uppercase tracking-wider font-bold text-editorial-charcoal/50 mb-1">{t("Simulated Amount (EGP)", "المبلغ الافتراضي (جنيه)")}</label>
 <input 
 type="number"
 step={10000}
 value={simulateAmount}
 onChange={(e) => setSimulateAmount(Number(e.target.value))}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-none bg-editorial-cream/30 focus:outline-none focus:border-editorial-charcoal"
 />
 </div>

 <button
 onClick={handleTriggerSimulation}
 className="w-full py-3 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream font-bold text-[10px] uppercase tracking-widest rounded-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
 >
 <span>{t("Trigger External Spike", "تفعيل دعم خارجي")}</span>
 </button>
 </div>
 </div>

 </div>

 </div>

 </div>
 );
}

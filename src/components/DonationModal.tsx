import { getLocalizedTrackName, getLocalizedTrackDesc, getLocalizedTrackUnitLabel } from '../utils/localization';
import { useLanguage } from '../LanguageContext';
import React, { useState, useEffect } from 'react';
import { Track, Donor, Badge } from '../types';
import { db, processDonation, calculateSubscriptionImpact } from '../db';
import { X, CreditCard, Wallet, CheckCircle, Shield, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DonationModalProps {
 track: Track;
 currentUser: Donor | null;
 initialAmount: number;
 initialFrequency: 'monthly' | 'annual' | 'one-time';
 onClose: () => void;
 onSuccess: (user: Donor, newBadges: Badge[]) => void;
 onOpenAuth: () => void;
}

export default function DonationModal({
 track,
 currentUser,
 initialAmount,
 initialFrequency,
 onClose,
 onSuccess,
 onOpenAuth
}: DonationModalProps) {
  const { t, language } = useLanguage();
 const [amount, setAmount] = useState(initialAmount);
 const [frequency, setFrequency] = useState<'monthly' | 'annual' | 'one-time'>(initialFrequency);
 const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'fawry' | 'stripe'>('card');
 
  // Payment credentials (simulated input fields)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState(currentUser?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  
  const [walletPhone, setWalletPhone] = useState(currentUser?.phone || '');
 
 const [isProcessing, setIsProcessing] = useState(false);
 const [completedState, setCompletedState] = useState(false);
 const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
 const [error, setError] = useState('');

 // Find existing subscription for user on this track
 const existingSub = currentUser
 ? db.getSubscriptions().find(s => s.donor_id === currentUser.donor_id && s.track_id === track.track_id && s.status === 'active')
 : null;

 // Synchronize internal state with incoming props when they change
 useEffect(() => {
 setAmount(initialAmount);
 }, [initialAmount]);

 useEffect(() => {
 setFrequency(initialFrequency);
 }, [initialFrequency]);

 // Validate amount based on lowest tier limits (50 EGP)
 useEffect(() => {
 const min = 50; // Allow down to 50 EGP for Seed Planter
 if (amount < min) {
 setAmount(min);
 }
 }, [frequency, track]);

 const handleAmountSelect = (val: number) => {
 setError('');
 setAmount(val);
 };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser && !cardName) {
      setError('Please enter your full name for the guest donation.');
      return;
    }

    if (!currentUser && !guestEmail) {
      setError('Please enter your email to receive your guest receipt.');
      return;
    }

    const min = 50; // Allow down to 50 EGP (Seed Planter)
    if (amount < min) {
      setError(`The minimum gift for ${getLocalizedTrackName(track.track_id, track.name, language)} is ${min} EGP. Please adjust.`);
      return;
    }

    // Payment validation simulation
    if (paymentMethod === 'card' || paymentMethod === 'stripe') {
      if (!cardNumber || !cardExpiry || !cardCVV) {
        setError('Please fill in your simulated card details.');
        return;
      }
    } else if (paymentMethod === 'wallet') {
      if (!walletPhone) {
        setError('Please fill in your mobile wallet phone number.');
        return;
      }
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      
      // Process donation in db
      const result = processDonation({
        donor_id: currentUser?.donor_id || 'guest-donor',
        donor_name: currentUser?.name || cardName || 'Generous Guest',
        track_id: track.track_id,
        amount: amount,
        frequency: frequency === 'one-time' ? 'one-time' : frequency,
        payment_method: paymentMethod
      });

      setEarnedBadges(result.newBadges);
      setCompletedState(true);
    }, 1500);
  };

  const handleDone = () => {
    if (currentUser) {
      onSuccess(currentUser, earnedBadges);
    } else {
      onSuccess({} as any, []);
    }
    onClose();
  };

 // Pre-calculated impact stats
 const { monthlyUnits, annualUnits } = calculateSubscriptionImpact(
 track, 
 amount, 
 frequency === 'one-time' ? 'monthly' : frequency
 );

 const impactDisplay = frequency === 'annual' ? annualUnits : monthlyUnits;

 return (
 <div id="donation-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-charcoal/70 backdrop-blur-xs">
 <div id="donation-modal" className="relative w-full max-w-lg bg-editorial-cream rounded-2xl border border-editorial-charcoal/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
 
 {/* Header */}
 <div className="flex items-center justify-between p-5 border-b border-editorial-charcoal/10 bg-editorial-soft/40">
 <div>
 <span className="text-[8px] font-bold tracking-widest text-editorial-charcoal/70 uppercase bg-editorial-sand px-2.5 py-1 border border-editorial-charcoal/10 rounded-full font-serif italic">
 Level Up: Track {track.letter}
 </span>
 <h3 className="text-base font-serif font-bold text-editorial-charcoal mt-2">
 {completedState ? 'Welcome to the Family!' : `Support: ${getLocalizedTrackName(track.track_id, track.name, language)}`}
 </h3>
 </div>
 {!isProcessing && (
 <button 
 onClick={onClose}
 className="w-11 h-11 flex items-center justify-center text-editorial-charcoal/50 hover:text-editorial-charcoal rounded-full cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>

 {/* Content Body */}
 <div className="p-6 overflow-y-auto">
 {!completedState ? (
 <form onSubmit={handleSubmitPayment} className="space-y-6">
 {error && (
 <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/20 text-rose-700 dark:text-rose-400 text-xs font-semibold rounded-xl">
 {error}
 </div>
 )}

 {/* Existing Active Subscription Safety Alert & Upgrade Options */}
 {existingSub && (
 <div className="p-4 bg-editorial-soft border border-editorial-charcoal/15 rounded-xl space-y-3 text-left relative">
 <div className="flex items-start gap-2.5">
 <div className="w-5 h-5 rounded-full bg-editorial-charcoal/5 flex items-center justify-center shrink-0 mt-0.5">
 <Award className="w-3 h-3 text-editorial-charcoal" />
 </div>
 <div>
 <h4 className="text-xs font-serif font-bold text-editorial-charcoal">{t("Active Partnership Detected", "تم اكتشاف شراكة نشطة")}</h4>
 <p className="text-[11px] text-editorial-charcoal/70 leading-relaxed mt-0.5">
 You are currently sowed into this track at <span className="font-bold">{existingSub.amount} EGP / {existingSub.frequency}</span>. Let's adjust your commitment without duplicate billing!
 </p>
 </div>
 </div>

 {/* Smart Switcher Scenarios */}
 <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-500 dark:border-amber-400/10 text-[10px]">
 <div>
 <span className="text-editorial-charcoal/40 block">{t("Current Support:", "الدعم الحالي:")}</span>
 <span className="font-semibold text-editorial-charcoal">{existingSub.amount} EGP / {existingSub.frequency}</span>
 </div>
 <div>
 <span className="text-editorial-charcoal/40 block">{t("New Adjusted Support:", "الدعم المُعدل الجديد:")}</span>
 <span className="font-bold text-emerald-800 dark:text-emerald-400 font-mono">
 {amount} EGP / {frequency === 'one-time' ? 'one-time' : frequency}
 </span>
 </div>
 </div>

 {/* Safe Migration Statement */}
 <div className="p-2.5 bg-amber-500/5 dark:bg-amber-950/20 rounded-xl border border-amber-500/10 dark:border-amber-800/20 text-[9px] text-amber-900 dark:text-amber-400 leading-normal">
 {frequency === 'one-time' ? (
 <span> {t("This is a ", "هذا ")}<strong>{t("one-time extra seed", "عطاء إضافي لمرة واحدة")}</strong>{t(". Your existing recurring commitment of ", ". التزامك الحالي المتكرر بقيمة ")}{existingSub.amount} {t("EGP/", "جنيه/")}{t(existingSub.frequency, existingSub.frequency === "monthly" ? "شهري" : "سنوي")}{t(" will continue active in parallel.", " سيستمر نشطاً بالتوازي.")}</span>
 ) : frequency !== existingSub.frequency ? (
 <span> <strong>{t("Schedule Transfer:", "تغيير الجدولة:")}</strong> {t("Switching from ", "التحويل من ")}{t(existingSub.frequency, existingSub.frequency === "monthly" ? "شهري" : "سنوي")}{t(" to ", " إلى ")}{t(frequency, frequency === "monthly" ? "شهري" : "سنوي")}{t(". We will automatically stop your older schedule, ensuring you are NOT billed twice.", ". سنقوم بإيقاف جدولك القديم تلقائياً لضمان عدم المحاسبة مرتين.")}</span>
 ) : amount > existingSub.amount ? (
 <span> <strong>{t("Level-Up:", "ترقية الدعم:")}</strong> {t("Upgrading your monthly seed by ", "زيادة عطائك الشهري بمقدار ")}{amount - existingSub.amount} {t("EGP. No duplicate subscriptions will be created.", "جنيه. لن يتم إنشاء اشتراكات مكررة.")}</span>
 ) : amount < existingSub.amount ? (
 <span> <strong>{t("Adjustment:", "تعديل:")}</strong> {t("Decreasing your recurring commitment. Your plan will be updated smoothly.", "تقليل التزامك المتكرر. سيتم تحديث خطتك بسلاسة.")}</span>
 ) : (
 <span> You are keeping your exact current recurring rate of {amount} EGP / {frequency}.</span>
 )}
 </div>
 
 {/* Optional Quick Action to set back */}
 {(amount !== existingSub.amount || frequency !== existingSub.frequency) && (
 <div className="flex justify-end">
 <button
 type="button"
 onClick={() => {
 setAmount(existingSub.amount);
 setFrequency(existingSub.frequency);
 }}
 className="text-[9px] font-bold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
 >
 Reset to current commitment size
 </button>
 </div>
 )}
 </div>
 )}

 {/* 1. Select frequency */}
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-wider text-editorial-charcoal/60 mb-2">{t("Giving Frequency", "معدل العطاء")}</label>
 <div className="grid grid-cols-3 gap-1 bg-editorial-sand/30 p-1 border border-editorial-charcoal/10 rounded-full">
 <button
 type="button"
 onClick={() => setFrequency('monthly')}
 className={`py-2 text-[10px] uppercase tracking-wider font-bold rounded-full transition-all cursor-pointer ${
 frequency === 'monthly' ? 'bg-editorial-charcoal text-editorial-cream' : 'text-editorial-charcoal/60 hover:text-editorial-charcoal'
 }`}
 >{t("Monthly", "شهري")}</button>
 <button
 type="button"
 onClick={() => setFrequency('annual')}
 className={`py-2 text-[10px] uppercase tracking-wider font-bold rounded-full transition-all cursor-pointer ${
 frequency === 'annual' ? 'bg-editorial-charcoal text-editorial-cream' : 'text-editorial-charcoal/60 hover:text-editorial-charcoal'
 }`}
 >{t("Annual", "سنوي")}</button>
 <button
 type="button"
 onClick={() => setFrequency('one-time')}
 className={`py-2 text-[10px] uppercase tracking-wider font-bold rounded-full transition-all cursor-pointer ${
 frequency === 'one-time' ? 'bg-editorial-charcoal text-editorial-cream' : 'text-editorial-charcoal/60 hover:text-editorial-charcoal'
 }`}
 >
 One-time
 </button>
 </div>
 </div>

 {/* 2. Amount tier selector */}
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-wider text-editorial-charcoal/60 mb-2">{t("Gift Amount (EGP)", "مبلغ العطاء (جنيه)")}</label>
 <div className="grid grid-cols-4 gap-2 mb-3.5">
 {[200, 500, 1000, 2000].map((val) => {
 const isDisabled = frequency !== 'one-time' && val < 50;
 return (
 <button
 key={val}
 type="button"
 disabled={isDisabled}
 onClick={() => handleAmountSelect(val)}
 className={`py-2 px-1 text-xs border transition-all cursor-pointer rounded-xl flex flex-col items-center justify-center min-h-[56px] ${
 amount === val
 ? 'bg-editorial-charcoal border-editorial-charcoal text-editorial-cream shadow-sm'
 : isDisabled
 ? 'bg-editorial-charcoal/5 border-editorial-charcoal/5 text-editorial-charcoal/20 cursor-not-allowed'
 : 'bg-editorial-card border-editorial-charcoal/10 text-editorial-charcoal/80 hover:border-editorial-charcoal hover:shadow-xs'
 }`}
 >
 <span className="font-bold">{val} EGP</span>
 <span className="text-[8px] opacity-70 font-serif italic mt-0.5 whitespace-nowrap leading-none">
 {val < 300 ? 'Faith Sower' : val < 750 ? 'Gospel Light' : val < 1500 ? 'Kingdom Builder' : 'Legacy Pillar'}
 </span>
 </button>
 );
 })}
 </div>

 {/* Custom Amount input */}
 <div>
 <div className="relative rounded-xl">
 <input
 type="number"
 min={50}
 value={amount}
 onChange={(e) => setAmount(Number(e.target.value))}
 className="w-full pl-3.5 pr-12 py-2.5 text-xs font-bold border border-editorial-charcoal/10 rounded-xl bg-editorial-card focus:outline-none focus:border-editorial-charcoal focus:bg-editorial-card"
 />
 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
 <span className="text-xs font-serif italic font-bold text-editorial-charcoal/60">{t("EGP", "جنيه")}</span>
 </div>
 </div>
 <p className="text-[10px] text-editorial-charcoal/50 mt-1.5 font-serif italic">
 {frequency !== 'one-time' && `Minimum required recurring gift for this track: 50 EGP.`}
 </p>
 </div>
 </div>

 {currentUser && (
              <>
                {/* 3. Real-time Impact visualization */}
 <div className="p-4.5 bg-editorial-soft rounded-2xl border border-editorial-charcoal/15 flex items-center justify-between gap-4">
 <div className="min-w-0 flex-1">
 <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-editorial-charcoal/60">{t("Your Calculated Impact", "الأثر المحسوب لعطائك")}</p>
 <p className="text-xs text-editorial-charcoal/75 mt-1.5 leading-normal font-serif italic">
 At this support tier, you will personally reach or answer:
 </p>
 <p className="text-sm font-bold text-editorial-charcoal mt-1 leading-normal font-sans">
 ~{impactDisplay.toLocaleString()} {track.target_unit_label.split(' ')[0]} {frequency === 'monthly' ? 'every month' : frequency === 'annual' ? 'each year' : 'with this gift'}.
 </p>
 </div>
 <div className="w-12 h-12 border border-editorial-charcoal/20 bg-editorial-cream text-editorial-charcoal font-serif italic text-lg font-bold flex items-center justify-center shrink-0 rounded-full shadow-sm">
 {track.letter}
 </div>
 </div>
              </>
            )}
            {/* 4. Payment method */}
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-wider text-editorial-charcoal/60 mb-2">{t("Select Payment Method", "اختر طريقة الدفع")}</label>
 <div className="grid grid-cols-4 gap-2">
 {[
 { id: 'card', name: 'Credit Card', icon: CreditCard },
 { id: 'wallet', name: 'Mobile Wallet', icon: Wallet },
 { id: 'fawry', name: 'Fawry Code', icon: Wallet },
 { id: 'stripe', name: 'Stripe Int\'l', icon: Shield }
 ].map((method) => {
 const IconComp = method.icon;
 return (
 <button
 key={method.id}
 type="button"
 onClick={() => setPaymentMethod(method.id as any)}
 className={`flex flex-col items-center gap-1.5 py-2.5 px-1 border transition-all cursor-pointer rounded-xl ${
 paymentMethod === method.id
 ? 'border-editorial-charcoal bg-editorial-charcoal text-editorial-cream'
 : 'border-editorial-charcoal/15 bg-editorial-card text-editorial-charcoal/60 hover:border-editorial-charcoal'
 }`}
 >
 <IconComp className="w-3.5 h-3.5" />
 <span className="text-[9px] font-bold leading-none">{method.name}</span>
 </button>
 );
 })}
 </div>
 </div>

 {/* Simulated details input */}
 <div className="p-4 bg-editorial-card border border-editorial-charcoal/10 rounded-2xl space-y-3.5">
 <div className="flex items-center justify-between text-[9px] font-bold text-editorial-charcoal/40 font-mono uppercase tracking-widest">
 <span>{t("Simulated Integration Sandbox", "بيئة اختبار الدفع (تجريبية)")}</span>
 <span className="text-editorial-charcoal font-sans font-bold">● Active Sandbox</span>
 </div>

 {(paymentMethod === 'card' || paymentMethod === 'stripe') && (
 <div className="space-y-3">
 <div>
 <input
 type="text"
 required
 placeholder={t("Cardholder Name", "اسم حامل البطاقة")}
 value={cardName}
 onChange={(e) => setCardName(e.target.value)}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-cream/30 focus:outline-none focus:border-editorial-charcoal"
 />
 </div>
 <div>
 <input
 type="text"
 required
 placeholder={t("Card Number (e.g. 4000 1234 5678 9010)", "رقم البطاقة")}
 value={cardNumber}
 onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-cream/30 focus:outline-none focus:border-editorial-charcoal"
 />
 </div>
 <div className="grid grid-cols-2 gap-2">
 <input
 type="text"
 required
 placeholder={t("MM/YY", "شهر/سنة")}
 value={cardExpiry}
 onChange={(e) => setCardExpiry(e.target.value)}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-cream/30 focus:outline-none focus:border-editorial-charcoal"
 />
 <input
 type="password"
 required
 maxLength={3}
 placeholder={t("CVV", "الرقم السري")}
 value={cardCVV}
 onChange={(e) => setCardCVV(e.target.value)}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-cream/30 focus:outline-none focus:border-editorial-charcoal"
 />
 </div>
 </div>
 )}

 {paymentMethod === 'wallet' && (
 <div>
 <label className="block text-[9px] text-editorial-charcoal/60 mb-1.5 uppercase font-bold tracking-wider">{t("Mobile Number (Vodafone / Instapay / etc)", "رقم الهاتف المحمول (فودافون كاش / إنستاباي / إلخ)")}</label>
 <input
 type="tel"
 required
 placeholder={t("e.g. 0100 234 5678", "مثال: 0100 234 5678")}
 value={walletPhone}
 onChange={(e) => setWalletPhone(e.target.value)}
 className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-cream/30 focus:outline-none focus:border-editorial-charcoal"
 />
 <p className="mt-2 text-[9px] text-emerald-800 dark:text-emerald-400 font-serif italic leading-relaxed">
 ️ <strong>{t("Privacy Promise:", "وعد الخصوصية:")}</strong> {t("We promise to only approach you via phone one time, and you will receive a maximum of 2 broadcast messages about enrolling. No spam and no high pressure calls.", "نتعهد بالتواصل معك عبر الهاتف مرة واحدة فقط، وستتلقى رسالتين كحد أقصى بخصوص الاشتراك. لا يوجد رسائل مزعجة أو مكالمات ملحة.")}
 </p>
 </div>
 )}

 {paymentMethod === 'fawry' && (
 <div className="text-center py-2 space-y-1 bg-editorial-soft/30 p-3 border border-dashed border-editorial-charcoal/10 rounded-xl">
 <p className="text-[10px] uppercase font-bold tracking-widest text-editorial-charcoal/50">{t("Fawry Pay-at-Store Code", "كود الدفع من فوري")}</p>
 <p className="text-xl font-mono font-bold text-editorial-charcoal tracking-wider">987445210</p>
 <p className="text-[9px] text-editorial-charcoal/40 mt-1 font-serif italic">{t("A payment request will be simulated when you click 'Complete'.", "ستتم محاكاة طلب دفع عند النقر على 'اكتمل'.")}</p>
 </div>
 )}
 </div>

  {/* Guest details if not logged in */}
  {!currentUser && (
    <div className="p-4 bg-editorial-soft rounded-2xl border border-editorial-charcoal/10 space-y-3 text-left">
      <h4 className="text-xs font-serif font-bold text-editorial-charcoal">{t("Guest Receipt Information", "معلومات إيصال الضيف")}</h4>
      <p className="text-[10px] text-editorial-charcoal/60 leading-normal">
        Your email will only be used to send your simulated receipt. No account creation required!
      </p>
      <div className="space-y-2">
        <div>
          <input
            type="text"
            required
            placeholder={t("Your Full Name", "الاسم بالكامل")}
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-card focus:outline-none focus:border-editorial-charcoal"
          />
        </div>
        <div>
          <input
            type="email"
            required
            placeholder={t("Your Email (for guest receipt)", "البريد الإلكتروني (للإيصال)")}
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-editorial-charcoal/10 rounded-xl bg-editorial-card focus:outline-none focus:border-editorial-charcoal"
          />
        </div>
      </div>
    </div>
  )}

  {/* Submit button */}
  <button
    type="submit"
    disabled={isProcessing}
    className="w-full py-3.5 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream font-bold text-[10px] rounded-full uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
  >
    {isProcessing ? 'Processing secure payment...' : 
    existingSub && frequency !== 'one-time' ? (
      frequency !== existingSub.frequency ? `Confirm Schedule Transfer: ${amount} EGP / ${frequency}` :
      amount > existingSub.amount ? `Authorize Level-Up to ${amount} EGP / ${frequency}` :
      amount < existingSub.amount ? `Authorize Adjustment to ${amount} EGP / ${frequency}` :
      `Keep Current Commitment: ${amount} EGP / ${frequency}`
    ) : `Authorize & Commit ${amount} EGP / ${frequency === 'one-time' ? 'one-time' : frequency}`}
  </button>
 </form>
 ) : (
 <div id="payment-success-card" className="text-center py-6 space-y-6">
 {/* Confetti / Sparkle animation triggers */}
 <div className="w-16 h-16 border border-editorial-charcoal/15 bg-editorial-soft text-editorial-charcoal rounded-full flex items-center justify-center mx-auto shadow-sm">
 <CheckCircle className="w-10 h-10 animate-bounce" />
 </div>

 <div className="space-y-1.5">
 <h4 className="text-2xl font-serif italic text-editorial-charcoal">{t("May God bless your partnership!", "الرب يبارك شراكتك!")}</h4>
 <p className="text-xs text-editorial-charcoal/60 max-w-sm mx-auto leading-relaxed">
 "You just helped someone hear about Jesus today." Your commitment is officially active and has been added to our live community ledger.
 </p>
 </div>

 <div className="p-5 bg-editorial-soft/30 border border-editorial-charcoal/10 rounded-2xl text-left space-y-2.5">
 <div className="flex items-center justify-between text-xs border-b border-editorial-charcoal/10 pb-2">
 <span className="font-semibold text-editorial-charcoal/50 uppercase tracking-wider text-[9px]">{t("Transaction ID", "رقم العملية")}</span>
 <span className="font-mono text-editorial-charcoal font-bold">BLF-TX-{Math.floor(100000 + Math.random() * 900000)}</span>
 </div>
 <div className="flex items-center justify-between text-xs border-b border-editorial-charcoal/10 pb-2">
 <span className="font-semibold text-editorial-charcoal/50 uppercase tracking-wider text-[9px]">{t("Ministry Track", "مسار الخدمة")}</span>
 <span className="font-bold text-editorial-charcoal">{getLocalizedTrackName(track.track_id, track.name, language)}</span>
 </div>
 <div className="flex items-center justify-between text-xs">
 <span className="font-semibold text-editorial-charcoal/50 uppercase tracking-wider text-[9px]">{t("Committed Amount", "المبلغ الملتزم به")}</span>
 <span className="font-bold text-editorial-charcoal">{amount} EGP {frequency === 'one-time' ? '(One-time)' : `/ ${frequency}`}</span>
 </div>
 </div>

 {/* Earned Badges Showcase */}
 {earnedBadges.length > 0 && (
 <div className="p-5 bg-editorial-card border border-editorial-charcoal/10 rounded-2xl space-y-3">
 <div className="flex items-center justify-center gap-1.5 text-editorial-charcoal">
 <Award className="w-4 h-4 text-editorial-charcoal/60 animate-spin" />
 <span className="text-[10px] font-bold uppercase tracking-widest text-editorial-charcoal/50">{t("New Badge Unlocked!", "تم فتح إنجاز جديد!")}</span>
 </div>
 {earnedBadges.map((b) => (
 <div key={b.badge_id} className="text-center">
 <p className="text-base font-serif font-bold text-editorial-charcoal">{b.name}</p>
 <p className="text-xs text-editorial-charcoal/60 mt-1.5 max-w-xs mx-auto leading-relaxed font-serif italic">{b.description}</p>
 </div>
 ))}
 </div>
 )}

 <button
 onClick={handleDone}
 className="w-full py-3.5 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream font-bold text-[10px] rounded-full uppercase tracking-widest transition-all cursor-pointer"
 >
 Go to Mission Control
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}

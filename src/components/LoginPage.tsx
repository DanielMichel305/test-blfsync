import React, { useState, useEffect } from 'react';
import { Donor, Track } from '../types';
import { db } from '../db';
import { Send, CheckCircle, Flame, Mail, User, Phone, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { SEED_DONORS } from '../db';
import { useLanguage } from '../LanguageContext';
import { getLocalizedTrackName } from '../utils/localization';
import { calculateSubscriptionImpact } from '../db';

interface LoginPageProps {
  onOpenAuth: () => void;
  tracks: Track[];
  onDonateClick: (track: Track, amount: number, frequency: 'monthly' | 'annual' | 'one-time', isGuest?: boolean) => void;
  onSuccess: (user: Donor) => void;
}

export default function LoginPage({ onSuccess, tracks, onDonateClick }: LoginPageProps) {
  const { t, language } = useLanguage();

  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [referral, setReferral] = useState('Social Media');
  const [optIn, setOptIn] = useState(true);

  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Quick Guest Donation State
  const [quickTrackId, setQuickTrackId] = useState<string>('');
  const [quickAmount, setQuickAmount] = useState<number>(500);
  const [quickFrequency, setQuickFrequency] = useState<'monthly' | 'annual' | 'one-time'>('monthly');

  useEffect(() => {
    if (tracks && tracks.length > 0 && !quickTrackId) {
      setQuickTrackId(tracks[0].track_id);
    }
  }, [tracks, quickTrackId]);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email) {
        setError('Please enter your email to log in.');
        return;
      }
      const donors = db.getDonors();
      const existing = donors.find(d => d.email.toLowerCase() === email.toLowerCase());
      if (!existing) {
        setError('We couldn\'t find a donor with this email. Click "Sign Up" above to register as a new partner!');
        return;
      }
    } else {
      if (!name || !email || !phone) {
        setError('Please fill in all fields to sign up.');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
    }, 600);
  };

  const handleQuickLogin = (email: string) => {
    const donors = db.getDonors();
    const user = donors.find(d => d.email.toLowerCase() === email.toLowerCase());
    if (user) {
      db.setCurrentUser(user);
      onSuccess(user);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otpCode.length < 4) {
      setError('Please enter a 4-digit code.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const donors = db.getDonors();

      if (isLogin) {
        const user = donors.find(d => d.email.toLowerCase() === email.toLowerCase());
        if (user) {
          db.setCurrentUser(user);
          onSuccess(user);
        } else {
          setError('Invalid login session.');
        }
      } else {
        const newDonorId = 'donor-' + Math.random().toString(36).substr(2, 9);
        const newUser: Donor = {
          donor_id: newDonorId,
          name: name,
          email: email,
          phone: phone,
          role: 'donor',
          communication_opt_in: true,
          referral_source: 'organic',
          join_date: new Date().toISOString().split('T')[0],
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          last_donation_date: null,
          streak: 0,
        };

        const updatedDonors = [...donors, newUser];
        db.saveDonors(updatedDonors);
        db.setCurrentUser(newUser);
        onSuccess(newUser);
      }
    }, 800);
  };

  return (
    <div id="login-container" className="min-h-[85vh] flex flex-col items-center justify-center py-6 px-4">
      {/* Visual branding decoration */}
      <div className="text-center max-w-lg mb-8">
        <div className="inline-flex p-3 bg-editorial-charcoal text-editorial-cream rounded-full shadow-lg mb-4">
          <Heart className="w-8 h-8 fill-rose-500/20 text-rose-500 dark:text-rose-400" />
        </div>
        <h1 className="text-3xl font-serif tracking-tight text-editorial-charcoal">
          Better Life Friend Portal
        </h1>
        <p className="text-sm text-editorial-charcoal/60 font-serif italic mt-2">
          Partnering in mass media evangelism to touch hearts and multiply faith across the globe.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full max-w-6xl items-stretch">
        
        {/* LEFT COLUMN: Become a Better Life Friend (Sign In / Sign Up) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#1A1A1A] text-[#FDF8F5] border border-white/5 rounded-[32px] p-8 md:p-10 flex flex-col shadow-xl relative overflow-hidden text-left"
        >
          {/* Subtle glowing background orb */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 dark:bg-emerald-600 dark:bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 space-y-6 flex-grow flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-100">
                {t("Community Pathway", "مسار مجتمع الشركاء")}
              </span>
            </div>

            <h3 className="text-2xl md:text-4xl font-serif font-bold tracking-tight leading-tight text-white">
              {t("Become a Better Life Friend", "كن من أصدقاء الحياة الأفضل")}
            </h3>
            
            <p className="text-xs sm:text-sm text-[#FDF8F5]/75 leading-relaxed font-serif italic mb-4">
              {t("Join a global family of faithful partners, sharing the same heart and burden for the Arab World.", "انضم لعائلة عالمية من الشركاء الأمناء، يتشاركون نفس القلب والعبء تجاه العالم العربي.")}
            </p>

            {/* Form Tabs */}
            {step === 'info' && (
              <div className="flex bg-black/40 p-1 border border-white/10 rounded-xl mb-4">
                <button
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer ${
                    isLogin ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
                  }`}
                >{t("Sign In", "تسجيل الدخول")}</button>
                <button
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer ${
                    !isLogin ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-rose-500 dark:bg-rose-600 dark:bg-rose-500/20 text-rose-200 text-xs font-semibold rounded-xl border border-rose-500 dark:border-rose-400/30">
                {error}
              </div>
            )}

            {step === 'info' ? (
              <form onSubmit={handleSendOTP} className="space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-4">
                  {!isLogin && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-white/60 mb-1.5">{t("Full Name", "الاسم الكامل")}</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          required
                          placeholder={t("e.g. Samuel Fahmy", "مثال: ساموئل فهمي")}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-white/10 rounded-xl focus:outline-none focus:border-white bg-black/20 focus:bg-black/40 transition-colors text-white placeholder:text-white/20"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-white/60 mb-1.5">{t("Email Address", "البريد الإلكتروني")}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                      <input
                        type="email"
                        required
                        placeholder={t("e.g. donor@example.com", "مثال: donor@example.com")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-white/10 rounded-xl focus:outline-none focus:border-white bg-black/20 focus:bg-black/40 transition-colors text-white placeholder:text-white/20"
                      />
                    </div>
                    {isLogin && (
                      <p className="mt-2 text-[10px] text-white/40 font-serif italic leading-relaxed">
                        Tip: Enter demo email mariam@example.com to test.
                      </p>
                    )}
                  </div>

                  {!isLogin && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-white/60 mb-1.5">WhatsApp / Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                          <input
                            type="tel"
                            required
                            placeholder={t("e.g. +20 100 234 5678", "مثال: +20 100 234 5678")}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-white/10 rounded-xl focus:outline-none focus:border-white bg-black/20 focus:bg-black/40 transition-colors text-white placeholder:text-white/20"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 mt-6 bg-[#FDF8F5] hover:bg-white text-[#1A1A1A] font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
                >
                  <span>{isSubmitting ? 'Sending verification...' : 'Send OTP Secure Code'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6 flex-grow flex flex-col justify-between">
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 border border-white/10 bg-white/5 text-white rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Flame className="w-6 h-6 animate-pulse text-amber-500 dark:text-amber-400 fill-amber-500/10" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-white">Enter Verification Code</h4>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      We sent a simulated 4-digit code to <strong className="text-white">{phone || email}</strong>.
                    </p>
                    <p className="text-[11px] font-serif italic text-white/80 mt-2 bg-white/10 py-1.5 px-3 rounded-lg border border-white/5">
                      Type any 4-digit code (e.g. <span className="font-mono font-bold">1234</span>) to instantly verify!
                    </p>
                  </div>
                </div>

                <div className="py-2">
                  <input
                    type="text"
                    maxLength={4}
                    required
                    placeholder={t("· · · ·", "· · · ·")}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-36 mx-auto text-center block text-3xl tracking-[0.5em] font-bold px-3 py-2.5 border border-white/20 bg-black/40 rounded-xl focus:outline-none focus:border-white text-white shadow-sm placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#FDF8F5] hover:bg-white text-[#1A1A1A] font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    <span>{isSubmitting ? 'Verifying...' : 'Verify & Enter Portal'}</span>
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('info')}
                    className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors cursor-pointer py-1"
                  >
                    Go Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Quick Guest Donation Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-editorial-card border border-editorial-charcoal/15 rounded-[32px] p-8 md:p-10 flex flex-col justify-between space-y-6 shadow-md text-left"
        >
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-editorial-charcoal/5 border border-editorial-charcoal/10 rounded-full">
              <Heart className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 fill-rose-500" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-editorial-charcoal/70">
                {t("Direct Giving Pathway", "مسار العطاء المباشر والسريع")}
              </span>
            </div>

            <h3 className="text-2xl md:text-4xl font-serif font-bold text-editorial-charcoal tracking-tight leading-tight">
              {t("Donate Instantly as Guest", "اغرس بذرة صالحة فوراً كزائر")}
            </h3>

            <div className="p-3.5 bg-rose-500 dark:bg-rose-600 dark:bg-rose-500/5 border border-rose-500 dark:border-rose-400/10 rounded-2xl text-[11px] text-rose-900 dark:text-rose-400 leading-normal font-serif italic">
              {t("While your donation means a lot to us, by checking out as a guest you will miss out on being part of the updates feed, community prayer wall, and live impact ledger! But if you prefer to bypass registration, we welcome your support with open arms.", "رغم أن عطاءك يعني لنا الكثير، إلا أنك كزائر ستفوت التحديثات الدورية وجدار الصلاة وسجل التأثير! ولكن إن كنت تفضل تخطي التسجيل السريع، فنحن نرحب بدعمك بكل سرور ومحبة.")}
            </div>

            {/* Form fields */}
            <div className="space-y-4 pt-1">
              {/* 1. Track selection */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-editorial-charcoal/50 mb-1.5 font-mono">
                  {t("CHOOSE MINISTRY TRACK", "اختر مجال الخدمة")}
                </label>
                <select
                  value={quickTrackId}
                  onChange={(e) => setQuickTrackId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-editorial-charcoal/15 rounded-xl bg-editorial-cream dark:bg-editorial-soft text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal focus:ring-1 focus:ring-editorial-charcoal/10"
                >
                  {tracks.map(t => (
                    <option key={t.track_id} value={t.track_id}>
                      {getLocalizedTrackName(t.track_id, t.name, language)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Frequency selector toggle */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-editorial-charcoal/50 mb-1.5 font-mono">
                  {t("GIVING FREQUENCY", "تكرار العطاء")}
                </label>
                <div className="grid grid-cols-3 gap-1 bg-editorial-soft/40 dark:bg-editorial-soft/10 p-1 border border-editorial-charcoal/15 rounded-full">
                  {(['monthly', 'annual', 'one-time'] as const).map(freq => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setQuickFrequency(freq)}
                      className={`py-2 md:py-1.5 text-[9px] uppercase tracking-wider font-extrabold rounded-full transition-all cursor-pointer ${
                        quickFrequency === freq
                          ? 'bg-editorial-charcoal text-editorial-cream shadow-xs'
                          : 'text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-charcoal/5'
                      }`}
                    >
                      {freq === 'monthly' ? t('Monthly', 'شهري') : freq === 'annual' ? t('Annual', 'سنوي') : t('One-time', 'مرة واحدة')}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Preset selectors + custom field */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-editorial-charcoal/50 mb-1.5 font-mono">
                  {t("SOWED AMOUNT (EGP)", "مبلغ العطاء (جنيه مصري)")}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[200, 500, 1000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQuickAmount(val)}
                      className={`py-2 text-[10px] font-bold border rounded-xl transition-all cursor-pointer ${
                        quickAmount === val
                          ? 'bg-editorial-charcoal border-editorial-charcoal text-editorial-cream shadow-xs'
                          : 'bg-editorial-card border-editorial-charcoal/10 text-editorial-charcoal/80 hover:border-editorial-charcoal'
                      }`}
                    >
                      {val} EGP
                    </button>
                  ))}
                  {/* Custom input */}
                  <div className="relative">
                    <input
                      type="number"
                      min={50}
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(Number(e.target.value))}
                      className="w-full px-2 py-2 text-[10px] font-bold border border-editorial-charcoal/10 rounded-xl bg-editorial-cream dark:bg-editorial-soft text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal text-center"
                      placeholder={t("Other", "أخرى")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button + Simulated Real-time impact calculation */}
          <div className="space-y-4 pt-3 border-t border-editorial-charcoal/5">
            

            <button
              onClick={() => {
                const trackObj = tracks.find(t => t.track_id === quickTrackId);
                if (trackObj) {
                  onDonateClick(trackObj, quickAmount, quickFrequency, true);
                }
              }}
              className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer transition-all hover:scale-98 shadow-md flex items-center justify-center gap-2"
            >
              <span>{t("Donate Securely as Guest", "تبرع بأمان كضيف")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

      </div>

      {/* Demo Accounts Dropdown */}
      <div className="w-full max-w-6xl mt-8 flex flex-col items-center justify-center space-y-2 border-t border-editorial-charcoal/10 pt-6">
        <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/50">
          {t("Demo Accounts", "حسابات تجريبية")}
        </label>
        <select 
          className="px-4 py-2 text-xs font-semibold border border-editorial-charcoal/15 rounded-xl bg-editorial-cream dark:bg-editorial-soft text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal shadow-sm"
          onChange={(e) => {
            if (e.target.value) {
              handleQuickLogin(e.target.value);
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>{t("Select an account to auto-login...", "اختر حساباً للدخول التلقائي...")}</option>
          {SEED_DONORS.map(d => (
            <option key={d.email} value={d.email}>{d.name} ({d.email})</option>
          ))}
        </select>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import type { Donor, Track } from '../types';
import { CheckCircle, Flame, Heart, LockKeyhole, Mail, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../LanguageContext';
import { useLogin, useVerifyTwoFactor } from '../api/hooks';
import { userToDonor } from '../api/adapters';
import { ApiError } from '../api/client';

interface LoginPageProps {
  onOpenAuth: () => void;
  tracks: Track[];
  onDonateClick: (track: Track, amount: number, frequency: 'monthly' | 'annual' | 'one-time', isGuest?: boolean) => void;
  onSuccess: (user: Donor) => void;
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const fieldMessage = Array.isArray(error.details) ? error.details[0]?.message : undefined;
    return fieldMessage || error.message;
  }
  return 'Something went wrong. Please try again.';
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const { t } = useLanguage();
  const login = useLogin();
  const verifyTwoFactor = useVerifyTwoFactor();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [challengeTokenId, setChallengeTokenId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const result = await login.mutateAsync({ email: email.trim(), password });
      if ('twoFactorRequired' in result) {
        setChallengeTokenId(result.tokenId);
        return;
      }
      onSuccess(userToDonor(result.user));
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const handleVerifyTwoFactor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!challengeTokenId || !/^\d{6}$/.test(twoFactorCode)) {
      setError(t('Enter the six-digit code from your email.', 'أدخل الرمز المكون من ستة أرقام من بريدك الإلكتروني.'));
      return;
    }
    setError('');
    try {
      const result = await verifyTwoFactor.mutateAsync({ tokenId: challengeTokenId, code: twoFactorCode });
      onSuccess(userToDonor(result.user));
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const isSubmitting = login.isPending || verifyTwoFactor.isPending;

  return (
    <div id="login-container" className="min-h-[85vh] flex flex-col items-center justify-center py-6 px-4">
      <div className="text-center max-w-lg mb-8">
        <div className="inline-flex p-3 bg-editorial-charcoal text-editorial-cream rounded-full shadow-lg mb-4">
          <Heart className="w-8 h-8 fill-rose-500/20 text-rose-500 dark:text-rose-400" />
        </div>
        <h1 className="text-3xl font-serif tracking-tight text-editorial-charcoal">Better Life Friend Portal</h1>
        <p className="text-sm text-editorial-charcoal/60 font-serif italic mt-2">
          {t('Partnering in mass media evangelism to touch hearts and multiply faith across the globe.', 'شراكة في خدمة الإعلام للوصول إلى القلوب ومضاعفة الإيمان حول العالم.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full max-w-6xl items-stretch">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#1A1A1A] text-[#FDF8F5] border border-white/5 rounded-[32px] p-8 md:p-10 flex flex-col shadow-xl relative overflow-hidden text-left"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 space-y-6 flex-grow flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-100">
                {t('Secure partner access', 'دخول آمن للشركاء')}
              </span>
            </div>
            <h3 className="text-2xl md:text-4xl font-serif font-bold tracking-tight leading-tight text-white">
              {challengeTokenId ? t('Verify your sign-in', 'تحقق من تسجيل دخولك') : t('Welcome back', 'مرحباً بعودتك')}
            </h3>
            <p className="text-xs sm:text-sm text-[#FDF8F5]/75 leading-relaxed font-serif italic">
              {challengeTokenId
                ? t('We sent a six-digit verification code to your email.', 'أرسلنا رمز تحقق من ستة أرقام إلى بريدك الإلكتروني.')
                : t('Sign in with the email and password associated with your invitation.', 'سجل الدخول بالبريد الإلكتروني وكلمة المرور المرتبطين بدعوتك.')}
            </p>

            {error && <div role="alert" className="p-3.5 bg-rose-500/20 text-rose-200 text-xs font-semibold rounded-xl border border-rose-400/30">{error}</div>}

            {!challengeTokenId ? (
              <form onSubmit={handleLogin} className="space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-white/60 mb-1.5">{t('Email Address', 'البريد الإلكتروني')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                      <input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-white/10 rounded-xl focus:outline-none focus:border-white bg-black/20 focus:bg-black/40 transition-colors text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-white/60 mb-1.5">{t('Password', 'كلمة المرور')}</label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                      <input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-white/10 rounded-xl focus:outline-none focus:border-white bg-black/20 focus:bg-black/40 transition-colors text-white" />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3.5 mt-6 bg-[#FDF8F5] hover:bg-white text-[#1A1A1A] font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md">
                  <span>{isSubmitting ? t('Signing in…', 'جارٍ تسجيل الدخول…') : t('Sign in securely', 'تسجيل الدخول بأمان')}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyTwoFactor} className="space-y-6 flex-grow flex flex-col justify-between">
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 border border-white/10 bg-white/5 text-white rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Flame className="w-6 h-6 animate-pulse text-amber-400 fill-amber-500/10" />
                  </div>
                  <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required aria-label={t('Six-digit verification code', 'رمز التحقق من ستة أرقام')} value={twoFactorCode} onChange={event => setTwoFactorCode(event.target.value.replace(/\D/g, ''))} className="w-48 mx-auto text-center block text-3xl tracking-[0.35em] font-bold px-3 py-2.5 border border-white/20 bg-black/40 rounded-xl focus:outline-none focus:border-white text-white shadow-sm" />
                </div>
                <div className="space-y-3">
                  <button type="submit" disabled={isSubmitting || twoFactorCode.length !== 6} className="w-full py-3.5 bg-[#FDF8F5] hover:bg-white text-[#1A1A1A] font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md">
                    <span>{isSubmitting ? t('Verifying…', 'جارٍ التحقق…') : t('Verify & enter portal', 'تحقق وادخل البوابة')}</span>
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => { setChallengeTokenId(null); setTwoFactorCode(''); setError(''); }} className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors cursor-pointer py-1">{t('Go back', 'رجوع')}</button>
                </div>
              </form>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="bg-editorial-card border border-editorial-charcoal/15 rounded-[32px] p-8 md:p-10 flex flex-col justify-center space-y-6 shadow-md text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-editorial-charcoal/5 border border-editorial-charcoal/10 rounded-full w-fit">
            <LockKeyhole className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-editorial-charcoal/70">{t('Invitation access', 'دخول بالدعوة')}</span>
          </div>
          <h3 className="text-2xl md:text-4xl font-serif font-bold text-editorial-charcoal tracking-tight leading-tight">{t('New to Better Life?', 'جديد في الحياة الأفضل؟')}</h3>
          <p className="text-sm text-editorial-charcoal/65 leading-relaxed font-serif italic">{t('Accounts are created through a secure invitation from the Better Life team. Follow the link in your invitation email to set your password, then return here to sign in.', 'يتم إنشاء الحسابات من خلال دعوة آمنة من فريق الحياة الأفضل. اتبع الرابط في رسالة الدعوة لتعيين كلمة المرور، ثم عد هنا لتسجيل الدخول.')}</p>
          <div className="p-4 bg-emerald-500/10 border border-emerald-600/20 rounded-2xl text-xs text-editorial-charcoal/70">{t('One-time guest donations are available from the public ministry-track page. Sign in for recurring giving and partner features.', 'تتوفر تبرعات الزائر لمرة واحدة من صفحة مسارات الخدمة العامة. سجل الدخول للعطاء المتكرر وميزات الشركاء.')}</div>
        </motion.div>
      </div>
    </div>
  );
}

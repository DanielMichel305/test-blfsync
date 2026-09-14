import { Info, User } from 'lucide-react';
import type { Donor } from '../types';
import { useLanguage } from '../LanguageContext';

function ContractBlocker({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs leading-relaxed text-editorial-charcoal/70"><Info className="h-4 w-4 shrink-0 text-amber-700" />{children}</div>;
}

export default function DashboardProfilePage({ currentUser }: { currentUser: Donor }) {
  const { t } = useLanguage();
  return <section className="mx-auto max-w-3xl space-y-6 py-10">
    <div className="rounded-[32px] border border-editorial-charcoal/10 bg-editorial-card p-8 shadow-sm">
      <div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-editorial-charcoal/5"><User className="h-6 w-6" /></div><div><p className="text-[10px] uppercase tracking-widest text-editorial-charcoal/45">{t('Profile', 'الملف الشخصي')}</p><h1 className="font-serif text-3xl">{currentUser.name}</h1></div></div>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-editorial-charcoal/5 p-4"><dt className="text-[9px] font-bold uppercase text-editorial-charcoal/45">{t('Email', 'البريد الإلكتروني')}</dt><dd className="mt-1 text-sm">{currentUser.email}</dd></div><div className="rounded-2xl bg-editorial-charcoal/5 p-4"><dt className="text-[9px] font-bold uppercase text-editorial-charcoal/45">{t('Partner role', 'دور الشريك')}</dt><dd className="mt-1 text-sm capitalize">{currentUser.api_role}</dd></div></dl>
    </div>
    <ContractBlocker>{t('The update endpoint accepts phone, referral source, and communication opt-in, but the User response still omits those fields. Editing remains disabled until the API can return their current saved values.', 'تقبل نقطة التحديث الهاتف ومصدر الإحالة وتفضيل التواصل، لكن استجابة المستخدم لا تعرض هذه الحقول بعد. سيظل التعديل معطلاً حتى تعيد الواجهة القيم المحفوظة الحالية.')}</ContractBlocker>
  </section>;
}

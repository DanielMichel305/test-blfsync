import { Camera, CheckCircle2, Loader2, Save, ShieldCheck, User, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { userToDonor } from '../api/adapters';
import { useEnableTwoFactor, useUpdateProfile } from '../api/hooks';
import { useLanguage } from '../LanguageContext';
import type { Donor } from '../types';

type ProfileForm = {
  firstName: string;
  lastName: string;
  phone: string;
  communicationOptIn: boolean;
  profilePictureUrl?: File;
  removeProfilePicture: boolean;
};

function formFromUser(user: Donor): ProfileForm {
  return {
    firstName: user.first_name || user.name.split(' ')[0] || '',
    lastName: user.last_name || '',
    phone: user.phone || '',
    communicationOptIn: !!user.communication_opt_in,
    removeProfilePicture: false,
  };
}

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : '—';
}

export default function DashboardProfilePage({ currentUser, onUserChange }: { currentUser: Donor; onUserChange: (user: Donor | null) => void }) {
  const { t } = useLanguage();
  const updateProfile = useUpdateProfile();
  const enableTwoFactor = useEnableTwoFactor();
  const [form, setForm] = useState<ProfileForm>(() => formFromUser(currentUser));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(formFromUser(currentUser)), [currentUser]);

  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setSaved(false);
    setForm(current => ({ ...current, [key]: value }));
  };
  const avatar = useMemo(() => !form.removeProfilePicture && (form.profilePictureUrl ? URL.createObjectURL(form.profilePictureUrl) : currentUser.avatar_url), [currentUser.avatar_url, form.profilePictureUrl, form.removeProfilePicture]);

  useEffect(() => () => { if (form.profilePictureUrl && avatar?.startsWith('blob:')) URL.revokeObjectURL(avatar); }, [avatar, form.profilePictureUrl]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.firstName.trim()) {
      setError(t('First name is required.', 'الاسم الأول مطلوب.'));
      return;
    }
    setError('');
    setSaved(false);
    try {
      const result = await updateProfile.mutateAsync({
        firstName: form.firstName.trim(), lastName: form.lastName.trim() || null, phone: form.phone.trim() || null,
        communicationOptIn: form.communicationOptIn,
        ...(form.profilePictureUrl ? { profilePictureUrl: form.profilePictureUrl } : {}),
        ...(form.removeProfilePicture ? { removeProfilePicture: true } : {}),
      });
      const user = userToDonor(result.user);
      onUserChange(user);
      setForm(formFromUser(user));
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('Your profile could not be saved. Please try again.', 'تعذر حفظ ملفك الشخصي. يرجى المحاولة مرة أخرى.'));
    }
  };

  const enableTwoFactorAuthentication = async () => {
    setError('');
    setSaved(false);
    try {
      const result = await enableTwoFactor.mutateAsync();
      onUserChange(userToDonor(result.user));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('Two-factor authentication could not be enabled. Please try again.', 'تعذر تفعيل المصادقة الثنائية. يرجى المحاولة مرة أخرى.'));
    }
  };

  const accountDetails = [
    [t('Email', 'البريد الإلكتروني'), currentUser.email],
    [t('Username', 'اسم المستخدم'), currentUser.username || t('Not set', 'غير محدد')],
    [t('Partner role', 'دور الشريك'), currentUser.api_role],
    [t('Two-factor authentication', 'المصادقة الثنائية'), currentUser.two_factor_enabled ? t('Enabled', 'مفعلة') : t('Not enabled', 'غير مفعلة')],
    [t('Password', 'كلمة المرور'), currentUser.has_password ? t('Configured', 'تم الإعداد') : t('Not configured', 'لم يتم الإعداد')],
    [t('Account status', 'حالة الحساب'), currentUser.invitation_pending ? t('Invitation pending', 'الدعوة معلقة') : currentUser.is_active === false ? t('Inactive', 'غير نشط') : t('Active', 'نشط')],
    [t('Last sign-in', 'آخر تسجيل دخول'), formatDate(currentUser.last_login_at)],
    [t('Member since', 'عضو منذ'), formatDate(currentUser.join_date)],
    [t('Profile last updated', 'آخر تحديث للملف'), formatDate(currentUser.updated_at)],
  ];

  return <section className="mx-auto max-w-3xl space-y-4 py-6">
    <div className="rounded-2xl border border-editorial-charcoal/10 bg-editorial-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-editorial-charcoal/5">{avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <User className="h-5 w-5" />}</div><div><p className="text-[9px] uppercase tracking-widest text-editorial-charcoal/45">{t('Profile', 'الملف الشخصي')}</p><h1 className="font-serif text-2xl">{currentUser.name}</h1></div></div>
      <p className="mt-2 text-xs leading-relaxed text-editorial-charcoal/60">{t('Manage your personal details and communication preferences.', 'أدر تفاصيلك الشخصية وتفضيلات التواصل الخاصة بك.')}</p>
    </div>
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-editorial-charcoal/10 bg-editorial-card p-4 shadow-sm sm:p-5">
      <section><h2 className="font-serif text-xl">{t('Personal details', 'التفاصيل الشخصية')}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-bold">{t('First name', 'الاسم الأول')}<input required maxLength={50} value={form.firstName} onChange={event => update('firstName', event.target.value)} className="mt-1 w-full rounded-lg border bg-transparent p-2.5 font-normal" /></label>
        <label className="text-xs font-bold">{t('Last name', 'اسم العائلة')}<input maxLength={50} value={form.lastName} onChange={event => update('lastName', event.target.value)} className="mt-1 w-full rounded-lg border bg-transparent p-2.5 font-normal" /></label>
        <label className="text-xs font-bold sm:col-span-2">{t('Phone', 'الهاتف')}<input type="tel" value={form.phone} onChange={event => update('phone', event.target.value)} placeholder="+12025550123" className="mt-1 w-full rounded-lg border bg-transparent p-2.5 font-normal" /></label>
      </div></section>
      <section className="border-t border-editorial-charcoal/10 pt-4"><h2 className="font-serif text-xl">{t('Profile picture', 'صورة الملف الشخصي')}</h2><div className="mt-3 flex flex-wrap items-center gap-3"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-editorial-charcoal/5">{avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <User className="h-5 w-5" />}</div><label className="cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold"><Camera className="mr-1 inline h-3.5 w-3.5" />{t('Choose image', 'اختر صورة')}<input type="file" accept="image/*" onChange={event => { update('profilePictureUrl', event.target.files?.[0]); update('removeProfilePicture', false); }} className="sr-only" /></label>{(currentUser.avatar_url || form.profilePictureUrl) && <button type="button" onClick={() => { update('profilePictureUrl', undefined); update('removeProfilePicture', true); }} className="rounded-full border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-600"><X className="mr-1 inline h-3.5 w-3.5" />{t('Remove', 'إزالة')}</button>}</div></section>
      <section className="border-t border-editorial-charcoal/10 pt-4"><h2 className="font-serif text-xl">{t('Communication preferences', 'تفضيلات التواصل')}</h2><label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl bg-editorial-charcoal/5 p-3 text-xs"><input type="checkbox" checked={form.communicationOptIn} onChange={event => update('communicationOptIn', event.target.checked)} className="mt-0.5 h-4 w-4" /><span><span className="block font-bold">{t('Keep me informed', 'أبقني على اطلاع')}</span><span className="mt-0.5 block leading-relaxed text-editorial-charcoal/60">{t('Send me updates and communications about the ministry.', 'أرسل لي التحديثات والمراسلات المتعلقة بالخدمة.')}</span></span></label></section>
      <section className="border-t border-editorial-charcoal/10 pt-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-serif text-xl">{t('Account security', 'أمان الحساب')}</h2><p className="mt-0.5 text-xs text-editorial-charcoal/60">{t('Require an email verification code when you sign in.', 'اطلب رمز تحقق عبر البريد الإلكتروني عند تسجيل الدخول.')}</p></div>{currentUser.two_factor_enabled ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" />{t('Two-factor enabled', 'تم تفعيل المصادقة الثنائية')}</span> : <button type="button" onClick={() => void enableTwoFactorAuthentication()} disabled={enableTwoFactor.isPending} className="rounded-full border border-editorial-charcoal/20 px-3 py-1.5 text-xs font-bold disabled:opacity-50">{enableTwoFactor.isPending ? <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />}{t('Enable two-factor', 'تفعيل المصادقة الثنائية')}</button>}</div></section>
      {error && <p role="alert" className="rounded-lg bg-rose-500/10 p-2.5 text-xs text-rose-600">{error}</p>}
      {saved && <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-800"><CheckCircle2 className="h-4 w-4" />{t('Your profile has been saved.', 'تم حفظ ملفك الشخصي.')}</p>}
      <div className="flex justify-end border-t border-editorial-charcoal/10 pt-4"><button disabled={updateProfile.isPending} className="rounded-full bg-editorial-charcoal px-4 py-2 text-xs font-bold text-editorial-cream disabled:opacity-50">{updateProfile.isPending ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : <Save className="mr-1 inline h-4 w-4" />}{t('Save changes', 'حفظ التغييرات')}</button></div>
    </form>
    <section className="rounded-2xl border border-editorial-charcoal/10 bg-editorial-card p-4 shadow-sm sm:p-5"><h2 className="font-serif text-xl">{t('Account details', 'تفاصيل الحساب')}</h2><dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{accountDetails.map(([label, value]) => <div key={label} className="rounded-xl bg-editorial-charcoal/5 p-3"><dt className="text-[9px] font-bold uppercase text-editorial-charcoal/45">{label}</dt><dd className="mt-0.5 break-words text-xs">{value}</dd></div>)}<div className="rounded-xl bg-editorial-charcoal/5 p-3"><dt className="text-[9px] font-bold uppercase text-editorial-charcoal/45">{t('Invited by', 'تمت دعوتي بواسطة')}</dt><dd className="mt-0.5 break-words text-xs">{currentUser.inviter ? <><span className="block font-bold">{currentUser.inviter.first_name} {currentUser.inviter.last_name || ''}</span><span className="block text-[10px] text-editorial-charcoal/50">{currentUser.inviter.id}</span></> : t('No inviter recorded', 'لا يوجد داعٍ مسجل')}</dd></div></dl></section>
  </section>;
}

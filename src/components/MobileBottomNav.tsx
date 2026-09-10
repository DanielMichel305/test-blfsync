import React from 'react';
import { Compass, Flame, Shield, TrendingUp, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../LanguageContext';
import type { Donor } from '../types';

type AppTab = 'landing' | 'dashboard' | 'admin';
type DashboardTab = 'dashboard' | 'overview' | 'profile' | 'referrals' | 'prayer';

export default function MobileBottomNav({ currentUser, activeTab, setActiveTab, dashboardSubTab, setDashboardSubTab }: { currentUser: Donor | null; activeTab: AppTab; setActiveTab: (tab: AppTab) => void; dashboardSubTab: DashboardTab; setDashboardSubTab: (tab: DashboardTab) => void }) {
  const { t } = useLanguage();
  if (!currentUser) return null;
  const openDashboard = (subTab: DashboardTab) => { setActiveTab('dashboard'); setDashboardSubTab(subTab); };
  const items: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t('Overview', 'نظرة عامة'), icon: <Compass className="h-5 w-5" /> },
    { id: 'dashboard', label: t('Dashboard', 'لوحة التحكم'), icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'prayer', label: t('Prayer', 'الصلاة'), icon: <Flame className="h-5 w-5" /> },
    { id: 'profile', label: t('Profile', 'الملف'), icon: <User className="h-5 w-5" /> },
  ];
  return <nav id="mobile-bottom-nav" className="fixed bottom-0 left-0 right-0 z-40 border-t border-editorial-charcoal/10 bg-editorial-cream/95 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.03)] backdrop-blur-md md:hidden"><div className="mx-auto flex h-16 max-w-md items-center justify-around px-1">{items.map(item => { const active = activeTab === 'dashboard' && dashboardSubTab === item.id; return <button key={item.id} onClick={() => openDashboard(item.id)} className={`relative flex h-full flex-1 flex-col items-center justify-center py-1 text-center transition-all ${active ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'font-medium text-editorial-charcoal/50'}`}>{item.icon}<span className="mt-1 text-[8px] uppercase tracking-wide">{item.label}</span>{active && <motion.div layoutId="mobileActiveTab" className="absolute left-1/4 right-1/4 top-0 h-0.5 rounded-full bg-emerald-600" />}</button>; })}{currentUser.role === 'admin' && <button onClick={() => setActiveTab('admin')} className={`relative flex h-full flex-1 flex-col items-center justify-center py-1 text-center ${activeTab === 'admin' ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'font-medium text-editorial-charcoal/50'}`}><Shield className="h-5 w-5" /><span className="mt-1 text-[8px] uppercase tracking-wide">{t('Admin', 'الإدارة')}</span>{activeTab === 'admin' && <motion.div layoutId="mobileActiveTab" className="absolute left-1/4 right-1/4 top-0 h-0.5 rounded-full bg-emerald-600" />}</button>}</div></nav>;
}

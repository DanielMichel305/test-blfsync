import { useLanguage } from '../LanguageContext';
import React from 'react';
import { Donor } from '../types';
import { Compass, TrendingUp, User, Shield, Users, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileBottomNavProps {
 currentUser: Donor | null;
 activeTab: 'landing' | 'dashboard' | 'admin';
 setActiveTab: (tab: 'landing' | 'dashboard' | 'admin') => void;
 dashboardSubTab: 'dashboard' | 'overview' | 'profile' | 'referrals' | 'prayer';
 setDashboardSubTab: (tab: 'dashboard' | 'overview' | 'profile' | 'referrals' | 'prayer') => void;
}

export default function MobileBottomNav({
 currentUser,
 activeTab,
 setActiveTab,
 dashboardSubTab,
 setDashboardSubTab
}: MobileBottomNavProps) {
  const { t } = useLanguage();
 if (!currentUser) return null;

 const isDonor = currentUser.role === 'donor';
 const isAdmin = currentUser.role === 'admin';

 // Navigation handlers
 const handleNav = (tab: 'landing' | 'dashboard' | 'admin', subTab?: 'dashboard' | 'overview' | 'profile' | 'referrals' | 'prayer' | 'prayer') => {
 setActiveTab(tab);
 if (subTab) {
 setDashboardSubTab(subTab);
 }
 };

 return (
 <nav 
 id="mobile-bottom-nav" 
 className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-editorial-cream/95 backdrop-blur-md border-t border-editorial-charcoal/10 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.2)]"
 >
 <div className="flex h-16 items-center justify-around px-2 max-w-md mx-auto">
 {/* Donor-Specific Tabs */}
 {isDonor && (
 <>
 {/* Tab 1: Overview */}
 <button
    onClick={() => handleNav('dashboard', 'overview')}
    className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
      activeTab === 'dashboard' && dashboardSubTab === 'overview'
        ? 'text-emerald-700 dark:text-emerald-400 font-bold' 
        : 'text-editorial-charcoal/50 hover:text-editorial-charcoal/80 font-medium'
    }`}
  >
    <Compass className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'dashboard' && dashboardSubTab === 'overview' ? 'scale-110 mb-0.5' : ''}`} />
    <span className="text-[9px] uppercase tracking-wider mt-1 font-sans">{t("Overview", "نظرة عامة")}</span>
    {activeTab === 'dashboard' && dashboardSubTab === 'overview' && (
      <motion.div 
        layoutId="mobileActiveTab" 
        className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-emerald-600 dark:bg-emerald-500 rounded-full" 
      />
    )}
  </button>

 {/* Tab 2: Dashboard */}
 <button
    onClick={() => handleNav('dashboard', 'dashboard')}
    className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
      activeTab === 'dashboard' && dashboardSubTab === 'dashboard'
        ? 'text-emerald-700 dark:text-emerald-400 font-bold' 
        : 'text-editorial-charcoal/50 hover:text-editorial-charcoal/80 font-medium'
    }`}
  >
    <TrendingUp className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'dashboard' && dashboardSubTab === 'dashboard' ? 'scale-110 mb-0.5' : ''}`} />
    <span className="text-[9px] uppercase tracking-wider mt-1 font-sans">{t("Dashboard", "لوحة التحكم")}</span>
    {activeTab === 'dashboard' && dashboardSubTab === 'dashboard' && (
      <motion.div 
        layoutId="mobileActiveTab" 
        className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-emerald-600 dark:bg-emerald-500 rounded-full" 
      />
    )}
  </button>

 

 {/* Tab 4: Refer Friends */}
 <button
    onClick={() => handleNav('dashboard', 'referrals')}
    className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
      activeTab === 'dashboard' && dashboardSubTab === 'referrals'
        ? 'text-emerald-700 dark:text-emerald-400 font-bold' 
        : 'text-editorial-charcoal/50 hover:text-editorial-charcoal/80 font-medium'
    }`}
  >
    <Users className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'dashboard' && dashboardSubTab === 'referrals' ? 'scale-110 mb-0.5' : ''}`} />
    <span className="text-[9px] uppercase tracking-wider mt-1 font-sans">{t("Referrals", "دعوات")}</span>
    {activeTab === 'dashboard' && dashboardSubTab === 'referrals' && (
      <motion.div 
        layoutId="mobileActiveTab" 
        className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-emerald-600 dark:bg-emerald-500 rounded-full" 
      />
    )}
  </button>
 </>
 )}

 {/* Admin-Specific Tab */}
 {isAdmin && (
 <button
    onClick={() => handleNav('admin')}
    className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
      activeTab === 'admin'
        ? 'text-emerald-700 dark:text-emerald-400 font-bold' 
        : 'text-editorial-charcoal/50 hover:text-editorial-charcoal/80 font-medium'
    }`}
  >
    <Shield className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'admin' ? 'scale-110 mb-0.5' : ''}`} />
    <span className="text-[9px] uppercase tracking-wider mt-1 font-sans">{t("Admin Panel", "الإدارة")}</span>
    {activeTab === 'admin' && (
      <motion.div 
        layoutId="mobileActiveTab" 
        className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-emerald-600 dark:bg-emerald-500 rounded-full" 
      />
    )}
  </button>
 )}
 </div>
 </nav>
 );
}

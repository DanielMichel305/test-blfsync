import React, { useEffect, useState } from "react";
import { Donor } from "../types";
import {
  User,
  LogOut,
  ArrowRight, Bell,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { useLanguage } from "../LanguageContext";
import { useLogout, useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../api/hooks';
import { notificationToDisplay } from '../api/adapters';
import { canAccessReferrals } from '../utils/access';

interface HeaderProps {
  currentUser: Donor | null;
  onUserChange: (user: Donor | null) => void;
  onOpenAuth: () => void;
  activeTab: "landing" | "dashboard";
  setActiveTab: (tab: "landing" | "dashboard") => void;
  dashboardSubTab:
    "dashboard" | "overview" | "profile" | "referrals" | "prayer";
  setDashboardSubTab: (
    tab: "dashboard" | "overview" | "profile" | "referrals" | "prayer",
  ) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onNavigate?: (path: string) => void;
}

export default function Header({
  currentUser,
  onUserChange,
  onOpenAuth,
  activeTab,
  setActiveTab,
  dashboardSubTab,
  setDashboardSubTab,
  theme,
  onToggleTheme,
  onNavigate,
}: HeaderProps) {
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const notificationFeed = useNotifications({ page: 1, limit: 20 }, !!currentUser);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const logout = useLogout();
  const notifications = (notificationFeed.data?.notifications || []).map(notification => notificationToDisplay(notification, currentUser?.donor_id || ''));
  const openDashboard = (tab: HeaderProps['dashboardSubTab']) => {
    const paths: Record<HeaderProps['dashboardSubTab'], string> = { overview: '/', dashboard: '/dashboard', prayer: '/prayer', profile: '/profile', referrals: '/referrals' };
    if (onNavigate) onNavigate(paths[tab]);
    else { setActiveTab('dashboard'); setDashboardSubTab(tab); }
  };
  const openLanding = () => onNavigate ? onNavigate('/') : setActiveTab('landing');
  const isLanding = activeTab === 'landing';
  const isHeroHeader = activeTab === 'landing' && !isScrolled;
  const navItemClass = (isActive: boolean) => `text-[10px] uppercase tracking-wider font-bold px-4 py-2.5 md:px-3.5 md:py-1.5 rounded-full transition-all duration-250 cursor-pointer ${isActive
    ? (isHeroHeader ? 'bg-editorial-cream text-[#0A0A0A] shadow-xs' : 'bg-editorial-charcoal text-editorial-cream shadow-xs')
    : (isHeroHeader ? 'text-white/65 hover:text-white hover:bg-white/10' : 'text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-charcoal/5')}`;
  const headerControlClass = `border transition-all cursor-pointer rounded-full ${isHeroHeader
    ? 'border-white/15 text-white bg-transparent hover:bg-white/10 hover:border-white/35'
    : 'border-editorial-charcoal/10 text-editorial-charcoal bg-transparent hover:bg-editorial-charcoal/5 hover:border-editorial-charcoal/30'}`;

  useEffect(() => {
    const updateScrolledState = () => setIsScrolled(window.scrollY > 8);
    updateScrolledState();
    window.addEventListener('scroll', updateScrolledState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrolledState);
  }, []);

  const getUserTierName = () => {
    if (!currentUser) return "";
    return currentUser.api_role === 'family'
      ? t('Family Partner', 'شريك العائلة')
      : t('Ministry Friend', 'صديق الخدمة');
  };

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } finally {
      onUserChange(null);
      openLanding();
    }
  };

  return (
    <div className={`h-[68px] ${isLanding ? 'bg-[#0A0A0A]' : ''}`}>
      <div className={`fixed left-0 z-50 box-border w-full transition-[padding,top,margin] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${isScrolled ? 'top-4 mt-0 px-4 sm:px-6 lg:px-8' : 'top-0 mt-0 px-0'}`}>
      <header
        id="app-header"
        className={`mx-auto flex items-center justify-between px-4 py-2.5 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:justify-normal transition-[max-width,border-radius,background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${isScrolled ? 'max-w-7xl rounded-full border border-editorial-charcoal/10 bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:bg-editorial-card/85 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]' : isHeroHeader ? 'max-w-[100rem] rounded-none border border-transparent bg-[#0A0A0A] shadow-none backdrop-blur-none' : 'max-w-[100rem] rounded-none border border-transparent bg-editorial-cream shadow-none backdrop-blur-none'}`}
      >
        {/* Logo and App Name */}
        <div
          id="logo-container"
          className="flex min-w-0 flex-1 items-center gap-3.5 cursor-pointer animate-fade-in lg:flex-none lg:justify-self-start"
          onClick={() => {
            if (currentUser) {
              openDashboard("overview");
            } else {
              openLanding();
            }
          }}
        >
          <div className="text-start">
            <h1 className={`truncate font-serif italic text-lg sm:text-xl tracking-tight font-light leading-none md:overflow-visible md:text-clip md:whitespace-normal ${isHeroHeader ? 'text-white' : 'text-editorial-charcoal'}`}>
              {t("Better Life Friends", "شركاء الحياة الأفضل")}
            </h1>
            <p className={`truncate text-[8px] uppercase tracking-[0.15em] font-extrabold mt-1.5 md:overflow-visible md:text-clip md:whitespace-normal ${isHeroHeader ? 'text-white/50' : 'text-editorial-charcoal/50'}`}>
              {t("Ministry Partner Portal", "بوابة شركاء الخدمة والعطاء")}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          id="main-navigation"
          className="hidden items-center gap-2 lg:flex lg:justify-self-center"
        >
          {currentUser && (
            <>
              <button
                onClick={() => {
                  openLanding();
                }}
                className={navItemClass(activeTab === "landing" || (activeTab === "dashboard" && dashboardSubTab === "overview"))}
              >
                {t("Overview", "نظرة عامة")}
              </button>
              <button
                onClick={() => {
                  openDashboard("dashboard");
                }}
                className={navItemClass(activeTab === "dashboard" && dashboardSubTab === "dashboard")}
              >
                {t("Dashboard", "لوحة التحكم")}
              </button>
              <button
                onClick={() => {
                  openDashboard("prayer");
                }}
                className={navItemClass(activeTab === "dashboard" && dashboardSubTab === "prayer")}
              >
                {t("Prayer Wall", "حائط الصلاة")}
              </button>
              
              {canAccessReferrals(currentUser) && <button
                onClick={() => {
                  openDashboard("referrals");
                }}
                className={navItemClass(activeTab === "dashboard" && dashboardSubTab === "referrals")}
              >
                {t("Refer Friends", "دعوة الأصدقاء")}
              </button>}
            </>
          )}

        </nav>

        {/* Right side actions */}
        <div id="header-actions" className="flex shrink-0 items-center gap-1.5 md:gap-2.5 lg:justify-self-end">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className={`flex h-11 w-11 items-center justify-center gap-0 px-0 text-[9px] font-bold tracking-wider md:w-auto md:gap-1.5 md:px-4 ${headerControlClass}`}
            title={
              language === "en"
                ? "تغيير اللغة إلى العربية"
                : "Switch Language to English"
            }
          >
            <Globe className={`hidden h-3.5 w-3.5 md:block ${isHeroHeader ? 'text-white/70' : 'text-editorial-charcoal/70'}`} />
            <span className="font-sans font-semibold md:hidden" aria-hidden="true">
              {language === "en" ? "AR" : "En"}
            </span>
            <span className="hidden font-sans font-semibold md:inline">
              {language === "en" ? "العربية" : "English"}
            </span>
          </button>

          
          {/* Notifications Toggle */}
          {currentUser && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                className={`w-11 h-11 flex items-center justify-center relative ${headerControlClass}`}
                title={t("Notifications", "الإشعارات")}
              >
                <Bell className="w-3.5 h-3.5" />
                {(notificationFeed.data?.unreadCount || 0) > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 dark:bg-red-600 dark:bg-red-500 rounded-full border border-editorial-cream"></span>
                )}
              </button>
              
              {showNotificationsMenu && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-editorial-card border border-editorial-charcoal/10 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-editorial-charcoal/10 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-editorial-charcoal/50">
                      {t("Notifications", "الإشعارات")}
                    </span>
                    <button 
                      onClick={() => markAllRead.mutate(undefined, { onSuccess: () => setShowNotificationsMenu(false) })}
                      disabled={markAllRead.isPending}
                      className="text-[10px] text-editorial-charcoal/60 hover:text-editorial-charcoal"
                    >
                      {t("Mark all read", "تحديد الكل كمقروء")}
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notificationFeed.error ? (
                      <div role="alert" className="p-4 text-center text-xs text-rose-600">
                        {t("Notifications could not be loaded.", "تعذر تحميل الإشعارات.")}
                      </div>
                    ) : notifications.filter(n => n.donor_id === currentUser.donor_id).length === 0 ? (
                      <div className="p-4 text-center text-xs text-editorial-charcoal/50">
                        {t("No new notifications.", "لا توجد إشعارات جديدة.")}
                      </div>
                    ) : (
                      notifications.filter(n => n.donor_id === currentUser.donor_id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(n => (
                        <div 
                          key={n.notification_id} 
                          className={`p-3 border-b border-editorial-charcoal/5 ${!n.read ? 'bg-editorial-soft/20' : ''}`}
                          onClick={() => {
                            if (!n.read) markRead.mutate(n.notification_id);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!n.read ? 'bg-red-500 dark:bg-red-600 dark:bg-red-500' : 'bg-transparent'}`}></div>
                            <div>
                              <p className="text-xs font-bold text-editorial-charcoal">{n.title}</p>
                              <p className="text-[10px] text-editorial-charcoal/70 mt-0.5 leading-tight">{n.message}</p>
                              <p className="text-[9px] text-editorial-charcoal/40 mt-1">{new Date(n.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`w-11 h-11 flex items-center justify-center ${headerControlClass}`}
            title={
              theme === "light"
                ? t("Switch to Dark Mode", "تفعيل الوضع المظلم")
                : t("Switch to Bright Mode", "تفعيل الوضع المضيء")
            }
          >
            {theme === "light" ? (
              <Moon className="w-3.5 h-3.5" />
            ) : (
              <Sun className="w-3.5 h-3.5" />
            )}
          </button>

          {/* User profile / login */}
          {currentUser ? (
            <div className={`relative group hidden items-center gap-2 border-l rtl:border-l-0 rtl:border-r pl-4 rtl:pl-0 rtl:pr-4 cursor-pointer md:flex ${isHeroHeader ? 'border-white/15' : 'border-editorial-charcoal/10'}`}>
              <div className={`w-11 h-11 flex items-center justify-center rounded-full transition-all ${isHeroHeader ? 'bg-white/10 text-white' : 'bg-editorial-charcoal/5 text-editorial-charcoal'}`}>
                <User className="w-4 h-4" />
              </div>
              <div className="text-left rtl:text-right hidden lg:block">
                <p className={`text-[11px] font-extrabold max-w-[100px] truncate ${isHeroHeader ? 'text-white' : 'text-editorial-charcoal'}`}>
                  {currentUser.name}
                </p>
                <p className={`text-[8px] font-mono uppercase tracking-wider truncate capitalize ${isHeroHeader ? 'text-white/50' : 'text-editorial-charcoal/50'}`}>
                  {getUserTierName()}
                </p>
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-editorial-cream border border-editorial-charcoal/10 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-2">
                <button
                  onClick={() => {
                    openDashboard("profile");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-editorial-charcoal hover:bg-editorial-charcoal/5 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {t("View Profile", "عرض الملف الشخصي")}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t("Logout", "تسجيل الخروج")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[9px] uppercase tracking-widest font-extrabold transition-all cursor-pointer rounded-full shadow-2xs hover:shadow-md ${isHeroHeader ? 'bg-editorial-cream text-[#0A0A0A] hover:bg-white' : 'bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream'}`}
            >
              <span>{t("Join Family", "انضم لعائلتنا")}</span>
              <ArrowRight
                className={`w-3 h-3 transform transition-transform ${language === "ar" ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>

      </header>
      </div>
    </div>
  );
}

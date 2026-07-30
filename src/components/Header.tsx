import React, { useState } from "react";
import { Donor } from "../types";
import { db, notifications, markAllNotificationsRead, markNotificationRead } from "../db";
import {
  Heart,
  User,
  Shield,
  LogOut,
  ArrowRight, X, Bell,
  Layers,
  Sun,
  Moon,
  Globe,
  Menu,
} from "lucide-react";
import { PARTNERSHIP_TIERS_DATA } from "./Dashboard";
import { useLanguage } from "../LanguageContext";
import {
  getLocalizedDonorName,
  getLocalizedTierName,
} from "../utils/localization";

interface HeaderProps {
  currentUser: Donor | null;
  onUserChange: (user: Donor | null) => void;
  onOpenAuth: () => void;
  activeTab: "landing" | "dashboard" | "admin";
  setActiveTab: (tab: "landing" | "dashboard" | "admin") => void;
  dashboardSubTab:
    "dashboard" | "overview" | "profile" | "referrals" | "prayer";
  setDashboardSubTab: (
    tab: "dashboard" | "overview" | "profile" | "referrals" | "prayer",
  ) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
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
}: HeaderProps) {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const donors = db.getDonors();
  const { language, setLanguage, t } = useLanguage();

  const getUserTierName = () => {
    if (!currentUser) return "";
    if (currentUser.role === "admin")
      return t("Staff Admin", "مسؤول النظام والخدمة");

    // Calculate commitment monthly
    const userSubs = db
      .getSubscriptions()
      .filter(
        (s) => s.donor_id === currentUser.donor_id && s.status === "active",
      );
    const activeMonthlyCommitment = userSubs
      .filter((s) => s.frequency === "monthly")
      .reduce((sum, s) => sum + s.amount, 0);
    const activeAnnualCommitment = userSubs
      .filter((s) => s.frequency === "annual")
      .reduce((sum, s) => sum + s.amount, 0);
    const currentCommitmentMonthly =
      activeMonthlyCommitment + Math.round(activeAnnualCommitment / 12);

    const matchingTier = PARTNERSHIP_TIERS_DATA.find(
      (tier) => currentCommitmentMonthly >= tier.minMonthly,
    );
    if (matchingTier) {
      return getLocalizedTierName(matchingTier.name, language);
    }
    return getLocalizedTierName("Seed Planter", language);
  };

  const handleSelectPersona = (donorId: string) => {
    const selected = donors.find((d) => d.donor_id === donorId) || null;
    onUserChange(selected);
    setShowPersonaMenu(false);

    // Auto switch tabs based on user role
    if (selected) {
      if (selected.role === "admin") {
        setActiveTab("admin");
      } else {
        setActiveTab("dashboard");
      }
    } else {
      setActiveTab("landing");
    }
  };

  const handleLogout = () => {
    onUserChange(null);
    setActiveTab("landing");
  };

  return (
    <div className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 mt-4">
      <header
        id="app-header"
        className="max-w-7xl mx-auto rounded-full border border-editorial-charcoal/10 bg-editorial-card/85 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 px-4 sm:px-6 py-2.5 flex items-center justify-between"
      >
        {/* Logo and App Name */}
        <div
          id="logo-container"
          className="flex items-center gap-3.5 cursor-pointer animate-fade-in shrink-0"
          onClick={() => {
            if (currentUser?.role === "admin") {
              setActiveTab("admin");
            } else if (currentUser) {
              setActiveTab("dashboard");
              setDashboardSubTab("overview");
            } else {
              setActiveTab("landing");
            }
          }}
        >
          <div className="text-start">
            <h1 className="font-serif italic text-lg sm:text-xl tracking-tight font-light text-editorial-charcoal leading-none">
              {t("Better Life Friends", "شركاء الحياة الأفضل")}
            </h1>
            <p className="text-[8px] uppercase tracking-[0.15em] font-extrabold text-editorial-charcoal/50 mt-1.5">
              {t("Ministry Partner Portal", "بوابة شركاء الخدمة والعطاء")}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          id="main-navigation"
          className="hidden md:flex items-center gap-2"
        >
          {(!currentUser || currentUser.role === "donor") && (
            <>
              <button
                onClick={() => {
                  setActiveTab("landing");
                }}
                className={`text-[10px] uppercase tracking-wider font-bold px-4 py-2.5 md:px-3.5 md:py-1.5 rounded-full transition-all duration-250 cursor-pointer ${
                  activeTab === "landing" || (activeTab === "dashboard" && dashboardSubTab === "overview")
                    ? "bg-editorial-charcoal text-editorial-cream shadow-xs"
                    : "text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-charcoal/5"
                }`}
              >
                {t("Overview", "نظرة عامة")}
              </button>
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setDashboardSubTab("dashboard");
                }}
                className={`text-[10px] uppercase tracking-wider font-bold px-4 py-2.5 md:px-3.5 md:py-1.5 rounded-full transition-all duration-250 cursor-pointer ${
                  activeTab === "dashboard" && dashboardSubTab === "dashboard"
                    ? "bg-editorial-charcoal text-editorial-cream shadow-xs"
                    : "text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-charcoal/5"
                }`}
              >
                {t("Dashboard", "لوحة التحكم")}
              </button>
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setDashboardSubTab("prayer");
                }}
                className={`text-[10px] uppercase tracking-wider font-bold px-4 py-2.5 md:px-3.5 md:py-1.5 rounded-full transition-all duration-250 cursor-pointer ${
                  activeTab === "dashboard" && dashboardSubTab === "prayer"
                    ? "bg-editorial-charcoal text-editorial-cream shadow-xs"
                    : "text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-charcoal/5"
                }`}
              >
                {t("Prayer Wall", "حائط الصلاة")}
              </button>
              
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setDashboardSubTab("referrals");
                }}
                className={`text-[10px] uppercase tracking-wider font-bold px-4 py-2.5 md:px-3.5 md:py-1.5 rounded-full transition-all duration-250 cursor-pointer ${
                  activeTab === "dashboard" && dashboardSubTab === "referrals"
                    ? "bg-editorial-charcoal text-editorial-cream shadow-xs"
                    : "text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-charcoal/5"
                }`}
              >
                {t("Refer Friends", "دعوة الأصدقاء")}
              </button>
            </>
          )}

          {currentUser?.role === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`text-[10px] uppercase tracking-wider font-bold px-4 py-2 rounded-full transition-all duration-250 cursor-pointer ${
                activeTab === "admin"
                  ? "bg-editorial-charcoal text-editorial-cream shadow-xs"
                  : "text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-charcoal/5"
              }`}
            >
              {t("Staff Admin Panel", "لوحة الإشراف")}
            </button>
          )}
        </nav>

        {/* Right side actions */}
        <div id="header-actions" className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden w-11 h-11 flex items-center justify-center border border-editorial-charcoal/10 text-editorial-charcoal bg-transparent hover:bg-editorial-charcoal/5 hover:border-editorial-charcoal/30 transition-all cursor-pointer rounded-full shrink-0 ${currentUser ? 'hidden' : ''}`}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="flex items-center justify-center h-11 gap-1.5 px-4 border border-editorial-charcoal/10 text-editorial-charcoal bg-transparent hover:bg-editorial-charcoal/5 hover:border-editorial-charcoal/30 transition-all cursor-pointer rounded-full text-[9px] font-bold tracking-wider"
            title={
              language === "en"
                ? "تغيير اللغة إلى العربية"
                : "Switch Language to English"
            }
          >
            <Globe className="w-3.5 h-3.5 text-editorial-charcoal/70" />
            <span className="font-sans font-semibold">
              {language === "en" ? "العربية" : "English"}
            </span>
          </button>

          
          {/* Notifications Toggle */}
          {currentUser && currentUser.role !== 'admin' && (
            <div className="relative">
              <button
                onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                className="w-11 h-11 border border-editorial-charcoal/10 text-editorial-charcoal bg-transparent hover:bg-editorial-charcoal/5 hover:border-editorial-charcoal/30 transition-all cursor-pointer flex items-center justify-center rounded-full relative"
                title={t("Notifications", "الإشعارات")}
              >
                <Bell className="w-3.5 h-3.5" />
                {notifications.filter(n => n.donor_id === currentUser.donor_id && !n.read).length > 0 && (
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
                      onClick={() => {
                        markAllNotificationsRead(currentUser.donor_id);
                        setShowNotificationsMenu(false);
                      }}
                      className="text-[10px] text-editorial-charcoal/60 hover:text-editorial-charcoal"
                    >
                      {t("Mark all read", "تحديد الكل كمقروء")}
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.filter(n => n.donor_id === currentUser.donor_id).length === 0 ? (
                      <div className="p-4 text-center text-xs text-editorial-charcoal/50">
                        {t("No new notifications.", "لا توجد إشعارات جديدة.")}
                      </div>
                    ) : (
                      notifications.filter(n => n.donor_id === currentUser.donor_id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(n => (
                        <div 
                          key={n.notification_id} 
                          className={`p-3 border-b border-editorial-charcoal/5 ${!n.read ? 'bg-editorial-soft/20' : ''}`}
                          onClick={() => {
                            markNotificationRead(n.notification_id);
                            // forces a re-render
                            setShowNotificationsMenu(prev => !prev);
                            setTimeout(() => setShowNotificationsMenu(prev => !prev), 0);
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
            className="w-11 h-11 border border-editorial-charcoal/10 text-editorial-charcoal bg-transparent hover:bg-editorial-charcoal/5 hover:border-editorial-charcoal/30 transition-all cursor-pointer flex items-center justify-center rounded-full"
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
            <div className="relative group flex items-center gap-2 border-l rtl:border-l-0 rtl:border-r border-editorial-charcoal/10 pl-4 rtl:pl-0 rtl:pr-4 cursor-pointer">
              <div className="w-11 h-11 flex items-center justify-center text-editorial-charcoal bg-editorial-charcoal/5 rounded-full transition-all">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left rtl:text-right hidden lg:block">
                <p className="text-[11px] font-extrabold text-editorial-charcoal max-w-[100px] truncate">
                  {getLocalizedDonorName(currentUser.name, language)}
                </p>
                <p className="text-[8px] font-mono uppercase tracking-wider text-editorial-charcoal/50 truncate capitalize">
                  {getUserTierName()}
                </p>
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-editorial-cream border border-editorial-charcoal/10 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-2">
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setDashboardSubTab("profile");
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-cream text-[9px] uppercase tracking-widest font-extrabold transition-all cursor-pointer rounded-full shadow-2xs hover:shadow-md"
            >
              <span>{t("Join Family", "انضم لعائلتنا")}</span>
              <ArrowRight
                className={`w-3 h-3 transform transition-transform ${language === "ar" ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[110%] left-0 right-0 bg-editorial-cream border border-editorial-charcoal/10 rounded-2xl p-4 shadow-xl flex flex-col gap-2 z-50">
            {(!currentUser || currentUser.role === "donor") && (
              <>
                <button
                  onClick={() => {
                    setActiveTab("landing");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 font-bold text-editorial-charcoal hover:bg-editorial-charcoal/5 rounded-lg"
                >
                  {t("Overview", "نظرة عامة")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setDashboardSubTab("dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 font-bold text-editorial-charcoal hover:bg-editorial-charcoal/5 rounded-lg"
                >
                  {t("Dashboard", "لوحة التحكم")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setDashboardSubTab("prayer");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 font-bold text-editorial-charcoal hover:bg-editorial-charcoal/5 rounded-lg"
                >
                  {t("Prayer Wall", "حائط الصلاة")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setDashboardSubTab("profile");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 font-bold text-editorial-charcoal hover:bg-editorial-charcoal/5 rounded-lg"
                >
                  {t("Profile & Contact", "الملف الشخصي")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setDashboardSubTab("referrals");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 font-bold text-editorial-charcoal hover:bg-editorial-charcoal/5 rounded-lg"
                >
                  {t("Refer Friends", "دعوة الأصدقاء")}
                </button>
              </>
            )}
            {currentUser?.role === "admin" && (
              <button
                onClick={() => {
                  setActiveTab("admin");
                  setIsMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2 font-bold text-editorial-charcoal hover:bg-editorial-charcoal/5 rounded-lg"
              >
                {t("Staff Admin Panel", "لوحة الإشراف")}
              </button>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

import { useLanguage } from './LanguageContext';
import React, { useState, useEffect } from 'react';
import { Donor, Track, Subscription, Transaction, Badge, UpdateFeed, LeaderboardEntry } from './types';
import { db } from './db';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import LoginPage from './components/LoginPage';
import DonationModal from './components/DonationModal';
import MobileBottomNav from './components/MobileBottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [currentUser, setCurrentUser] = useState<Donor | null>(null);
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'admin'>('landing');
  const [dashboardSubTab, setDashboardSubTab] = useState<'dashboard' | 'overview' | 'profile' | 'referrals' | 'prayer'>('overview');

  const [tracks, setTracks] = useState<Track[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [updates, setUpdates] = useState<UpdateFeed[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [donationWizardData, setDonationWizardData] = useState<{
    track: Track;
    amount: number;
    frequency: 'monthly' | 'annual' | 'one-time';
  } | null>(null);

  const { t } = useLanguage();
  const [unlockedBadgeNotify, setUnlockedBadgeNotify] = useState<Badge | null>(null);

  const refreshState = () => {
    setTracks(db.getTracks());
    setDonors(db.getDonors());
    setSubscriptions(db.getSubscriptions());
    setTransactions(db.getTransactions());
    setBadges(db.getBadges());
    setUpdates(db.getUpdates());
    setLeaderboard(db.getLeaderboard());

    const current = db.getCurrentUser();
    setCurrentUser(current);
  };

  useEffect(() => {
    refreshState();
  }, []);

  const handleUserChange = (user: Donor | null) => {
    db.setCurrentUser(user);
    refreshState();
  };

  const handleDonateTrigger = (track: Track, amount: number, frequency: 'monthly' | 'annual' | 'one-time', isGuest: boolean = false) => {
    if (!isGuest && !db.getCurrentUser()) {
      setActiveTab('dashboard');
      return;
    }
    setDonationWizardData({ track, amount, frequency });
  };

  const handleDonationSuccess = (user: Donor, newBadges: Badge[]) => {
    refreshState();
    if (newBadges.length > 0) {
      setUnlockedBadgeNotify(newBadges[0]);
      setTimeout(() => setUnlockedBadgeNotify(null), 5000);
    }
  };

  const handleAuthSuccess = (user: Donor) => {
    refreshState();
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <div id="portal-root" className="relative min-h-screen bg-editorial-cream text-editorial-charcoal flex flex-col justify-between selection:bg-editorial-charcoal/10 selection:text-editorial-charcoal overflow-x-hidden">
      <Header
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onOpenAuth={() => setActiveTab('dashboard')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dashboardSubTab={dashboardSubTab}
        setDashboardSubTab={setDashboardSubTab}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main
        id="app-main-content"
        className={`flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full ${currentUser ? 'pb-24 md:pb-8' : 'pb-8'}`}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <LandingPage
                currentUser={currentUser}
                onDonateClick={handleDonateTrigger}
                updates={updates}
                leaderboard={leaderboard}
                tracks={tracks}
                subscriptions={subscriptions}
                transactions={transactions}
                badges={badges}
                onOpenAuth={() => setActiveTab('dashboard')}
                onUserChange={handleUserChange}
              />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            !currentUser ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <LoginPage onSuccess={handleAuthSuccess} onOpenAuth={() => setActiveTab('dashboard')} tracks={tracks} onDonateClick={handleDonateTrigger} />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <Dashboard
                  currentUser={currentUser}
                  onDonateClick={handleDonateTrigger}
                  tracks={tracks}
                  subscriptions={subscriptions}
                  transactions={transactions}
                  badges={badges}
                  onUserChange={handleUserChange}
                  activeSubTab={dashboardSubTab}
                  setActiveSubTab={setDashboardSubTab}
                  updates={updates}
                  leaderboard={leaderboard}
                  onOpenAuth={() => setActiveTab('dashboard')}
                />
              </motion.div>
            )
          )}

          {activeTab === 'admin' && (
            (!currentUser || currentUser.role !== 'admin') ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <LoginPage onSuccess={handleAuthSuccess} onOpenAuth={() => setActiveTab('dashboard')} tracks={tracks} onDonateClick={handleDonateTrigger} />
              </motion.div>
            ) : (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <AdminPanel
                  currentUser={currentUser}
                  tracks={tracks}
                  donors={donors}
                  updates={updates}
                  subscriptions={subscriptions}
                  transactions={transactions}
                  onUpdateTracks={setTracks}
                  onUpdateUpdates={setUpdates}
                />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      <footer id="app-footer" className="bg-editorial-charcoal text-editorial-cream/40 text-[9px] uppercase tracking-widest py-4 mt-8 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-1.5 text-editorial-cream/50">
            <span className="normal-case tracking-normal text-[10px] text-editorial-cream/60">{t("Our faith in Jesus Christ is the foundation of everything we do at Better Life.", "إيماننا بالرب يسوع المسيح هو أساس كل ما نقدمه في خدمة حياة أفضل.")}</span>
          </div>
          <span>{t("Ministry Registered 501(c)(3)", "خدمة مسجلة قانونياً")}</span>
          <span>{t("© 2026 Better Life Ministry.", "© 2026 خدمة حياة أفضل.")}</span>
        </div>
      </footer>

      <AnimatePresence>
        {unlockedBadgeNotify && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 dark:bg-amber-600 dark:text-amber-100 p-4 rounded-2xl shadow-2xl border border-amber-400 dark:border-amber-500 flex items-start gap-3.5 max-w-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-editorial-card text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0 shadow-md">
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-100 font-mono">{t("Achievement Unlocked!", "تم فتح إنجاز جديد!")}</p>
              <h4 className="text-xs font-black mt-0.5">{unlockedBadgeNotify.name}</h4>
              <p className="text-[11px] text-amber-950 dark:text-amber-200 font-medium leading-relaxed mt-1">
                {unlockedBadgeNotify.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {donationWizardData && (
        <DonationModal
          track={donationWizardData.track}
          currentUser={currentUser}
          initialAmount={donationWizardData.amount}
          initialFrequency={donationWizardData.frequency}
          onClose={() => setDonationWizardData(null)}
          onSuccess={handleDonationSuccess}
          onOpenAuth={() => {
            setDonationWizardData(null);
            setActiveTab('dashboard');
          }}
        />
      )}

      {currentUser && (
        <MobileBottomNav
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dashboardSubTab={dashboardSubTab}
          setDashboardSubTab={setDashboardSubTab}
        />
      )}
    </div>
  );
}

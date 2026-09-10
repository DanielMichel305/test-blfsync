import { useLanguage } from './LanguageContext';
import React, { useState, useEffect } from 'react';
import { Donor, Track, Subscription, Transaction, Badge, UpdateFeed, LeaderboardEntry } from './types';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import LoginPage from './components/LoginPage';
import DonationModal from './components/DonationModal';
import MobileBottomNav from './components/MobileBottomNav';
import { AcceptInvitePage, PaymentResultPage } from './components/RoutePages';
import { motion, AnimatePresence } from 'motion/react';
import { useAnnouncements, useMinistryTracks, usePublicAnnouncements, usePublicTestimonies, usePublicTracks, useSessionRestore, useTestimonies, useUserBadges } from './api/hooks';
import { announcementToUpdate, ministryTrackToTrack, publicMinistryTrackToTrack, testimonyToUpdate, userBadgeToBadge, userToDonor } from './api/adapters';

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
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const selectedUserId = pathname.match(/^\/users\/([^/]+)\/?$/)?.[1];
  const selectedTrackId = pathname.match(/^\/tracks\/([^/]+)\/?$/)?.[1];

  const session = useSessionRestore();
  const authenticated = !!currentUser;
  const tracksQuery = useMinistryTracks({ page: 1, limit: 100 }, authenticated);
  const publicTracksQuery = usePublicTracks({ page: 1, limit: 100 }, !authenticated);
  const badgesQuery = useUserBadges(currentUser?.donor_id || '', authenticated);
  const announcementsQuery = useAnnouncements({ page: 1, limit: 20 }, authenticated);
  const testimoniesQuery = useTestimonies({ page: 1, limit: 20 }, authenticated);
  const publicAnnouncementsQuery = usePublicAnnouncements({ page: 1, limit: 20 }, !authenticated);
  const publicTestimoniesQuery = usePublicTestimonies({ page: 1, limit: 20 }, !authenticated);

  const tracks: Track[] = authenticated ? (tracksQuery.data?.ministryTracks || []).map(ministryTrackToTrack) : (publicTracksQuery.data?.ministryTracks || []).map(publicMinistryTrackToTrack);
  const badges: Badge[] = (badgesQuery.data || []).filter(badge => badge.earned).map(badge => userBadgeToBadge(badge, currentUser?.donor_id || ''));
  const updates: UpdateFeed[] = [
    ...((authenticated ? announcementsQuery.data : publicAnnouncementsQuery.data)?.announcements || []).map(announcementToUpdate),
    ...((authenticated ? testimoniesQuery.data : publicTestimoniesQuery.data)?.testimonies || []).map(testimonyToUpdate),
  ].sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
  const subscriptions: Subscription[] = [];
  const transactions: Transaction[] = [];
  const leaderboard: LeaderboardEntry[] = [];

  const [donationWizardData, setDonationWizardData] = useState<{
    track: Track;
    amount: number;
    frequency: 'monthly' | 'annual' | 'one-time';
  } | null>(null);

  const { t } = useLanguage();
  const [unlockedBadgeNotify] = useState<Badge | null>(null);

  useEffect(() => {
    setCurrentUser(session.data ? userToDonor(session.data) : null);
  }, [session.data]);

  useEffect(() => {
    const clear = () => setCurrentUser(null);
    window.addEventListener('better-life:session-cleared', clear);
    return () => window.removeEventListener('better-life:session-cleared', clear);
  }, []);

  useEffect(() => {
    const syncPath = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin' && (selectedUserId || selectedTrackId)) setActiveTab('admin');
  }, [currentUser, selectedUserId, selectedTrackId]);

  const navigateToUser = (id: string) => {
    const url = new URL(window.location.href);
    url.pathname = `/users/${encodeURIComponent(id)}`;
    url.searchParams.set('admin_tab', 'users');
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setPathname(url.pathname);
    setActiveTab('admin');
  };

  const closeUserDetail = () => {
    const url = new URL(window.location.href);
    url.pathname = '/';
    url.searchParams.set('admin_tab', 'users');
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setPathname(url.pathname);
  };

  const navigateToTrack = (id: string) => {
    const url = new URL(window.location.href);
    url.pathname = `/tracks/${encodeURIComponent(id)}`;
    url.searchParams.set('admin_tab', 'tracks');
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setPathname(url.pathname);
    setActiveTab('admin');
  };

  const closeTrackDetail = () => {
    const url = new URL(window.location.href);
    url.pathname = '/';
    url.searchParams.set('admin_tab', 'tracks');
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setPathname(url.pathname);
  };

  const handleUserChange = (user: Donor | null) => {
    setCurrentUser(user);
  };

  const handleDonateTrigger = (track: Track, amount: number, frequency: 'monthly' | 'annual' | 'one-time', isGuest: boolean = false) => {
    setDonationWizardData({ track, amount, frequency: (!currentUser || isGuest) ? 'one-time' : frequency });
  };

  const handleDonationSuccess = () => {
    setDonationWizardData(null);
  };

  const handleAuthSuccess = (user: Donor) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  const leaveStandaloneRoute = (destination: 'dashboard' | 'login', user?: Donor) => {
    const url = new URL(window.location.href);
    url.pathname = '/';
    url.search = '';
    window.history.replaceState({}, '', url.pathname);
    setPathname(url.pathname);
    if (user) handleAuthSuccess(user);
    else {
      setActiveTab('dashboard');
      setDashboardSubTab(destination === 'dashboard' ? 'overview' : 'overview');
    }
  };

  if (pathname === '/accept-invite' || pathname === '/accept-invite/') {
    return <AcceptInvitePage onAccepted={user => leaveStandaloneRoute('dashboard', user)} onSignIn={() => leaveStandaloneRoute('login')} />;
  }

  if (pathname === '/payments/success' || pathname === '/payments/success/') {
    return <PaymentResultPage outcome="success" onContinue={() => leaveStandaloneRoute('dashboard')} onTryAgain={() => leaveStandaloneRoute('dashboard')} />;
  }

  if (['/payments/failure', '/payments/failure/', '/payments/failed', '/payments/cancel'].includes(pathname)) {
    return <PaymentResultPage outcome="failure" onContinue={() => leaveStandaloneRoute('dashboard')} onTryAgain={() => leaveStandaloneRoute('dashboard')} />;
  }

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
        {(tracksQuery.error || announcementsQuery.error || testimoniesQuery.error) && currentUser && (
          <div role="alert" className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-800 dark:text-rose-300">
            {t('Some portal data could not be loaded. Please try again shortly.', 'تعذر تحميل بعض بيانات البوابة. يرجى المحاولة مرة أخرى قريباً.')}
          </div>
        )}
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
                  selectedUserId={selectedUserId ? decodeURIComponent(selectedUserId) : undefined}
                  selectedTrackId={selectedTrackId ? decodeURIComponent(selectedTrackId) : undefined}
                  onOpenUser={navigateToUser}
                  onCloseUser={closeUserDetail}
                  onOpenTrack={navigateToTrack}
                  onCloseTrack={closeTrackDetail}
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

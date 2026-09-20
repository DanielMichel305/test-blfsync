import { useLanguage } from './LanguageContext';
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Donor, Track, Subscription, Transaction, Badge, UpdateFeed, LeaderboardEntry } from './types';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import { PENDING_CHECKOUT_KEY } from './paymentState';
import { motion, AnimatePresence } from 'motion/react';
import { useAnnouncements, useCreateCheckout, useMinistryTracks, usePublicAnnouncements, usePublicTestimonies, usePublicTracks, useSessionRestore, useSubscriptions, useTestimonies, useUserBadges } from './api/hooks';
import { ApiError } from './api/client';
import { announcementToUpdate, ministryTrackToTrack, publicMinistryTrackToTrack, subscriptionCommitmentToSubscription, testimonyToUpdate, userBadgeToBadge, userToDonor } from './api/adapters';
import DonationModal from './components/DonationModal';

const LandingPage = lazy(() => import('./components/LandingPage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));
const AcceptInvitePage = lazy(() => import('./components/RoutePages').then(module => ({ default: module.AcceptInvitePage })));
const PaymentResultPage = lazy(() => import('./components/RoutePages').then(module => ({ default: module.PaymentResultPage })));
const PrayerThreadPage = lazy(() => import('./components/PrayerWall').then(module => ({ default: module.PrayerThreadPage })));

type AppTab = 'landing' | 'dashboard' | 'admin';
type DashboardSubTab = 'dashboard' | 'overview' | 'profile' | 'referrals' | 'prayer';
type DonationIntent = { track: Track; amount: number; frequency: 'monthly' | 'annual' | 'one-time' };

const dashboardRoutes: Record<DashboardSubTab, string> = {
  dashboard: '/dashboard', overview: '/', profile: '/profile', referrals: '/referrals', prayer: '/prayer',
};

function dashboardSubTabForPath(pathname: string): DashboardSubTab | null {
  return (Object.entries(dashboardRoutes).find(([, path]) => path === pathname)?.[0] as DashboardSubTab | undefined) ?? null;
}

function RouteLoader() {
  return <div className="py-16 text-center text-xs text-editorial-charcoal/50">Loading page…</div>;
}

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
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const dashboardSubTab = dashboardSubTabForPath(pathname);
  const isDashboardRoute = dashboardSubTab !== null && pathname !== '/';
  const isPrayerThreadRoute = /^\/prayer-wall\/[^/]+\/?$/.test(pathname);
  const isAdminRoute = pathname === '/admin' || /^\/(users|tracks)\/[^/]+\/?$/.test(pathname) || (isPrayerThreadRoute && currentUser?.role === 'admin');
  const isLoginRoute = pathname === '/login';
  const isJoinRoute = pathname === '/join';
  const isAuthRoute = isLoginRoute || isJoinRoute;
  const activeTab: AppTab = isAdminRoute ? 'admin' : (isDashboardRoute || isAuthRoute) ? 'dashboard' : 'landing';
  const selectedUserId = pathname.match(/^\/users\/([^/]+)\/?$/)?.[1];
  const selectedTrackId = pathname.match(/^\/tracks\/([^/]+)\/?$/)?.[1];
  const selectedPrayerThreadId = pathname.match(/^\/prayer-wall\/([^/]+)\/?$/)?.[1];

  const navigate = (nextPath: string, replace = false) => {
    const url = new URL(window.location.href);
    url.pathname = nextPath;
    url.search = '';
    if (replace) window.history.replaceState({}, '', url.pathname);
    else window.history.pushState({}, '', url.pathname);
    setPathname(url.pathname);
  };
  const setActiveTab = (tab: AppTab) => navigate(tab === 'landing' ? '/' : tab === 'dashboard' ? '/dashboard' : '/admin');
  const setDashboardSubTab = (tab: DashboardSubTab) => navigate(dashboardRoutes[tab]);

  const session = useSessionRestore();
  const checkout = useCreateCheckout();
  const authenticated = !!currentUser;
  const dashboardDataNeeded = dashboardSubTab === 'dashboard';
  const tracksNeeded = dashboardDataNeeded || dashboardSubTab === 'overview' || isAdminRoute;
  const publicContentNeeded = pathname === '/' || isAuthRoute;
  const tracksQuery = useMinistryTracks({ page: 1, limit: 100 }, authenticated && tracksNeeded);
  const publicTracksQuery = usePublicTracks({ page: 1, limit: 100 }, !authenticated && publicContentNeeded);
  const subscriptionsQuery = useSubscriptions({ page: 1, limit: 100, type: 'recurring' }, authenticated && dashboardSubTab === 'dashboard');
  const badgesQuery = useUserBadges(currentUser?.donor_id || '', authenticated && dashboardSubTab === 'dashboard');
  const announcementsQuery = useAnnouncements({ page: 1, limit: 20 }, authenticated && dashboardDataNeeded);
  const testimoniesQuery = useTestimonies({ page: 1, limit: 20 }, authenticated && dashboardDataNeeded);
  const publicAnnouncementsQuery = usePublicAnnouncements({ page: 1, limit: 20 }, !authenticated && dashboardDataNeeded);
  const publicTestimoniesQuery = usePublicTestimonies({ page: 1, limit: 20 }, !authenticated && dashboardDataNeeded);

  const tracks: Track[] = authenticated ? (tracksQuery.data?.ministryTracks || []).map(ministryTrackToTrack) : (publicTracksQuery.data?.ministryTracks || []).map(publicMinistryTrackToTrack);
  const badges: Badge[] = (badgesQuery.data || []).map(badge => userBadgeToBadge(badge, currentUser?.donor_id || ''));
  const updates: UpdateFeed[] = [
    ...((authenticated ? announcementsQuery.data : publicAnnouncementsQuery.data)?.announcements || []).map(announcementToUpdate),
    ...((authenticated ? testimoniesQuery.data : publicTestimoniesQuery.data)?.testimonies || []).map(testimonyToUpdate),
  ].sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
  const subscriptionsByTrack = new Map<string, Subscription>();
  for (const commitment of subscriptionsQuery.data?.commitments || []) {
    const subscription = subscriptionCommitmentToSubscription(commitment);
    const existing = subscription ? subscriptionsByTrack.get(subscription.track_id) : undefined;
    if (subscription && (!existing || (existing.status === 'canceled' && subscription.status !== 'canceled'))) {
      subscriptionsByTrack.set(subscription.track_id, subscription);
    }
  }
  const subscriptions = [...subscriptionsByTrack.values()];
  const transactions: Transaction[] = [];
  const leaderboard: LeaderboardEntry[] = [];

  const [checkoutError, setCheckoutError] = useState<{ message: string; tooltip: string } | null>(null);
  const [guestDonation, setGuestDonation] = useState<DonationIntent | null>(null);

  const { t } = useLanguage();
  const [unlockedBadgeNotify] = useState<Badge | null>(null);

  useEffect(() => {
    // Do not clear the in-memory user while the refresh-token restore is still
    // running. This is especially important after a full-page Stripe redirect.
    if (session.isSuccess) setCurrentUser(session.data ? userToDonor(session.data) : null);
  }, [session.data, session.isSuccess]);

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

  const navigateToUser = (id: string) => {
    const url = new URL(window.location.href);
    url.pathname = `/users/${encodeURIComponent(id)}`;
    url.searchParams.set('admin_tab', 'users');
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setPathname(url.pathname);
  };

  const closeUserDetail = () => {
    const url = new URL(window.location.href);
    url.pathname = '/admin';
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
  };

  const closeTrackDetail = () => {
    const url = new URL(window.location.href);
    url.pathname = '/admin';
    url.searchParams.set('admin_tab', 'tracks');
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setPathname(url.pathname);
  };

  const handleUserChange = (user: Donor | null) => {
    setCurrentUser(user);
  };

  const handleDonateTrigger = async (track: Track, amount: number, frequency: 'monthly' | 'annual' | 'one-time', isGuest: boolean = false) => {
    if (!currentUser || isGuest) {
      setGuestDonation({ track, amount, frequency: 'one-time' });
      return;
    }
    setCheckoutError(null);
    try {
      const result = await checkout.mutateAsync({
        subscriptionAmount: amount,
        subscriptionCurrency: 'usd',
        ministryTrackId: track.track_id,
        idempotencyKey: crypto.randomUUID(),
        subscriptionType: frequency === 'one-time' ? 'one-time' : 'recurring',
        ...(frequency === 'one-time' ? {} : { interval: frequency === 'annual' ? 'year' as const : 'month' as const }),
      });
      localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify({ paymentRequestId: result.paymentRequestId, commitmentId: result.commitmentId, subscriptionId: result.subscriptionId, ministryTrackId: track.track_id, amount, frequency }));
      if (result.status === 'pending') window.location.assign(result.checkout.url);
      else if (result.status !== 'completed') setCheckoutError({ message: 'Checkout could not be started. Please try again.', tooltip: 'The payment provider did not return a usable checkout session. Your card has not been charged.' });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setCheckoutError({ message: 'A checkout for this gift is already being processed.', tooltip: 'To prevent duplicate charges, we stopped this request. Check your existing Stripe tab or wait a moment before trying again.' });
      } else if (error instanceof ApiError && error.status >= 500) {
        setCheckoutError({ message: 'Our payment service is temporarily unavailable.', tooltip: 'No charge was created. Please wait a few minutes and try again; if it continues, contact support with the time of this attempt.' });
      } else {
        setCheckoutError({ message: error instanceof ApiError ? error.message : 'Checkout could not be started. Please try again.', tooltip: 'No charge was created. Review your connection and try again.' });
      }
    }
  };

  const handleAuthSuccess = (user: Donor) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
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
      navigate(destination === 'dashboard' ? '/' : '/login', true);
    }
  };

  if (pathname === '/accept-invite' || pathname === '/accept-invite/') {
    return <Suspense fallback={<RouteLoader />}><AcceptInvitePage onAccepted={user => leaveStandaloneRoute('dashboard', user)} onSignIn={() => leaveStandaloneRoute('login')} /></Suspense>;
  }

  if (pathname === '/payments/success' || pathname === '/payments/success/') {
    return <Suspense fallback={<RouteLoader />}><PaymentResultPage outcome="success" onContinue={async () => { await session.refetch(); leaveStandaloneRoute('dashboard'); }} onTryAgain={() => leaveStandaloneRoute('dashboard')} /></Suspense>;
  }

  if (['/payments/failure', '/payments/failure/', '/payments/failed', '/payments/cancel'].includes(pathname)) {
    return <Suspense fallback={<RouteLoader />}><PaymentResultPage outcome="failure" onContinue={() => leaveStandaloneRoute('dashboard')} onTryAgain={() => leaveStandaloneRoute('dashboard')} /></Suspense>;
  }

  return (
    <div id="portal-root" className="relative min-h-screen bg-editorial-cream text-editorial-charcoal flex flex-col justify-between selection:bg-editorial-charcoal/10 selection:text-editorial-charcoal overflow-x-hidden">
      <Header
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onOpenAuth={() => navigate('/join')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dashboardSubTab={dashboardSubTab ?? 'overview'}
        setDashboardSubTab={setDashboardSubTab}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNavigate={navigate}
      />

      <main
        id="app-main-content"
        className={`flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${pathname === '/' ? 'pt-0' : 'pt-4'} ${currentUser ? 'pb-24 md:pb-8' : 'pb-8'}`}
      >
        {(tracksQuery.error || subscriptionsQuery.error || announcementsQuery.error || testimoniesQuery.error) && currentUser && (
          <div role="alert" className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-800 dark:text-rose-300">
            {t('Some portal data could not be loaded. Please try again shortly.', 'تعذر تحميل بعض بيانات البوابة. يرجى المحاولة مرة أخرى قريباً.')}
          </div>
        )}
        {checkoutError && (
          <div role="alert" className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-800 dark:text-rose-300">
            {checkoutError.message}
          </div>
        )}
        <AnimatePresence mode="wait">
          {pathname === '/' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <Suspense fallback={<RouteLoader />}><LandingPage
                currentUser={currentUser}
                onDonateClick={handleDonateTrigger}
                isCheckoutPending={checkout.isPending}
                checkoutError={checkoutError}
                updates={updates}
                leaderboard={leaderboard}
                tracks={tracks}
                subscriptions={subscriptions}
                transactions={transactions}
                badges={badges}
                onOpenAuth={() => navigate('/join')}
                onUserChange={handleUserChange}
              /></Suspense>
            </motion.div>
          )}

          {(isDashboardRoute || isAuthRoute) && (
            (!currentUser || isAuthRoute) ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <Suspense fallback={<RouteLoader />}><LoginPage onSuccess={handleAuthSuccess} onOpenAuth={() => navigate('/login')} tracks={tracks} onDonateClick={handleDonateTrigger} /></Suspense>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <Suspense fallback={<RouteLoader />}><Dashboard
                  currentUser={currentUser}
                  onDonateClick={handleDonateTrigger}
                  tracks={tracks}
                  subscriptions={subscriptions}
                  transactions={transactions}
                  badges={badges}
                  onUserChange={handleUserChange}
                  activeSubTab={dashboardSubTab!}
                  setActiveSubTab={setDashboardSubTab}
                  updates={updates}
                  leaderboard={leaderboard}
                  onOpenAuth={() => navigate('/login')}
                /></Suspense>
              </motion.div>
            )
          )}

          {isPrayerThreadRoute && !isAdminRoute && (
            (!currentUser) ? (
              <motion.div key="thread-login" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}><Suspense fallback={<RouteLoader />}><LoginPage onSuccess={handleAuthSuccess} onOpenAuth={() => navigate('/login')} tracks={tracks} onDonateClick={handleDonateTrigger} /></Suspense></motion.div>
            ) : (
              <motion.div key="prayer-thread" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}><Suspense fallback={<RouteLoader />}><PrayerThreadPage id={decodeURIComponent(selectedPrayerThreadId!)} onBack={() => navigate('/prayer')} /></Suspense></motion.div>
            )
          )}

          {isAdminRoute && (
            (!currentUser || currentUser.role !== 'admin') ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <Suspense fallback={<RouteLoader />}><LoginPage onSuccess={handleAuthSuccess} onOpenAuth={() => navigate('/login')} tracks={tracks} onDonateClick={handleDonateTrigger} /></Suspense>
              </motion.div>
            ) : (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <Suspense fallback={<RouteLoader />}><AdminPanel
                  currentUser={currentUser}
                  tracks={tracks}
                  selectedUserId={selectedUserId ? decodeURIComponent(selectedUserId) : undefined}
                  selectedTrackId={selectedTrackId ? decodeURIComponent(selectedTrackId) : undefined}
                  selectedPrayerThreadId={selectedPrayerThreadId ? decodeURIComponent(selectedPrayerThreadId) : undefined}
                  onOpenUser={navigateToUser}
                  onCloseUser={closeUserDetail}
                  onOpenTrack={navigateToTrack}
                  onCloseTrack={closeTrackDetail}
                /></Suspense>
              </motion.div>
            )
          )}
          {!dashboardSubTab && !isAuthRoute && !isAdminRoute && !isPrayerThreadRoute && <motion.div key="not-found" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Suspense fallback={<RouteLoader />}><NotFoundPage onGoHome={() => navigate('/')} /></Suspense></motion.div>}
        </AnimatePresence>
        {guestDonation && <DonationModal
          track={guestDonation.track}
          currentUser={null}
          initialAmount={guestDonation.amount}
          initialFrequency={guestDonation.frequency}
          onClose={() => setGuestDonation(null)}
          onSuccess={() => setGuestDonation(null)}
        />}
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

      {currentUser && (
        <MobileBottomNav
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dashboardSubTab={dashboardSubTab ?? 'overview'}
          setDashboardSubTab={setDashboardSubTab}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}

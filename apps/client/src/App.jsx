import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Home, CalendarPlus, Package, Brain, Gauge, MoreHorizontal } from 'lucide-react';

// Shared Packages
import { useAuthStore, useThemeStore, useNotificationStore, useSystemStore, useBookingStore, usePWA, NOTIFICATION_TYPES, ROLES } from '@cleanflow/core';
import { Navbar, BottomNav, ProtectedRoute, VoiceBookingModal, NEMAReportModal, LoadingScreen, PWAInstallModal } from '@cleanflow/ui';
import { Toaster } from 'sonner';

// Components
import ReleaseFundsModal from './components/user/ReleaseFundsModal.jsx';

// ── LAZY LOADED PAGES (SPEED OPTIMIZATION) ─────────────────────────
const UserHome = lazy(() => import('./pages/user/UserHome.jsx'));
const BookPickup = lazy(() => import('./pages/user/BookPickup.jsx'));
const MyBookings = lazy(() => import('./pages/user/MyBookings.jsx'));
const MyIotPage = lazy(() => import('./pages/user/MyIotPage.jsx'));
const ImpactHub = lazy(() => import('./pages/user/ImpactHub.jsx'));
const HygeneXPage = lazy(() => import('./pages/shared/HygeneXPage.jsx'));

// Settings Pages
const SettingsMenu = lazy(() => import('./pages/settings/SettingsMenu.jsx'));
const ProfilePage = lazy(() => import('./pages/settings/ProfilePage.jsx'));
const NotificationsPage = lazy(() => import('./pages/settings/NotificationsPage.jsx'));
const PrivacySecurityPage = lazy(() => import('./pages/settings/PrivacySecurityPage.jsx'));
const SupportPage = lazy(() => import('./pages/settings/SupportPage.jsx'));
const FeedbackPage = lazy(() => import('./pages/settings/FeedbackPage.jsx'));
const SubscriptionPage = lazy(() => import('./pages/settings/SubscriptionPage.jsx'));

// Auth Pages (Instant Load)
import Welcome from './pages/auth/Welcome.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

function MobileLayout() {
  const { clientType } = useAuthStore();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/book-pickup', icon: CalendarPlus, label: 'Book' },
    { path: '/my-bookings', icon: Package, label: 'Bookings' },
    { path: '/hygenex', icon: Brain, label: 'HygeneX' },
    // Only show IoT for residents
    ...(clientType === 'resident' ? [{ path: '/my-iot', icon: Gauge, label: 'My IoT' }] : []),
    { path: '/settings', icon: MoreHorizontal, label: 'More' },
  ];

  return (
    <>
      <div className="max-w-lg mx-auto px-2 py-5 pb-24">
        <Suspense fallback={<LoadingScreen message="Loading..." />}>
          <Outlet />
        </Suspense>
      </div>
      <BottomNav items={navItems} />
    </>
  );
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}

export default function App() {
  const { role, isAuthenticated, checkAppRole, userId, isInitializing, initializeAuth } = useAuthStore();
  const { fetchNotifications, subscribeToRealtime } = useNotificationStore();
  const { fetchConfig } = useSystemStore();
  const { subscribeToBookings, cleanupBookings } = useBookingStore();
  
  // PWA Installation
  const { isInstallable, triggerInstall } = usePWA();
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    // Proactive Prompt: Show modal automatically after 10 seconds
    const hasPrompted = sessionStorage.getItem('pwa_prompted');
    
    if (isInstallable && !hasPrompted) {
      setShowInstallModal(true);
      sessionStorage.setItem('pwa_prompted', 'true');
    }
  }, [isInstallable]);

  useEffect(() => {
    initializeAuth();
    fetchConfig();
    return () => {
      cleanupBookings();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && userId) {
      checkAppRole('client');
      const targetRole = role || ROLES.USER;
      
      // Initialize Realtime Listeners
      fetchNotifications(userId, targetRole);
      subscribeToRealtime(userId, targetRole);
      subscribeToBookings(userId); // Watch for Agent confirmations
    }
  }, [isAuthenticated, userId, role]);

  if (isInitializing) {
    return <LoadingScreen message="Securing Session..." />;
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 transition-colors duration-200">


      <Routes>
        <Route path="/welcome" element={isAuthenticated ? <Navigate to="/" replace /> : <Welcome />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

        <Route element={<ProtectedLayout />}>
          <Route element={<MobileLayout />}>
            <Route path="/" element={<UserHome />} />
            <Route path="/book-pickup" element={<BookPickup />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/impact-hub" element={<ImpactHub />} />
            <Route path="/hygenex" element={<HygeneXPage />} />
            <Route path="/my-iot" element={<MyIotPage />} />
            
            <Route path="/settings">
              <Route index element={<SettingsMenu />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="subscriptions" element={<SubscriptionPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="privacy" element={<PrivacySecurityPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>

      {isAuthenticated && (
        <>
          <VoiceBookingModal />
          <NEMAReportModal />
          <ReleaseFundsModal />
        </>
      )}

      <PWAInstallModal 
        isOpen={showInstallModal} 
        onClose={() => setShowInstallModal(false)}
        onInstall={() => {
          setShowInstallModal(false);
          triggerInstall();
        }}
      />

      <Toaster position="top-center" richColors closeButton duration={2500} />
    </div>
  );
}

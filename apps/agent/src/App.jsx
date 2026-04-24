import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Home, Briefcase, Brain, Wallet, MoreHorizontal } from 'lucide-react';

// Shared Packages
import { useAuthStore, useThemeStore, useNotificationStore, usePWA, ROLES } from '@cleanflow/core';
import { Navbar, BottomNav, PWAInstallModal, ProtectedRoute, LoadingScreen } from '@cleanflow/ui';
import { Toaster } from 'sonner';
import { useAgentStore } from '@cleanflow/core';

// ── LAZY LOADED PAGES (SPEED OPTIMIZATION) ─────────────────────────
const AgentHome = lazy(() => import('./pages/agent/AgentHome.jsx'));
const AvailableJobs = lazy(() => import('./pages/agent/AvailableJobs.jsx'));
const EarningsPage = lazy(() => import('./pages/agent/EarningsPage.jsx'));
const MyRoutes = lazy(() => import('./pages/agent/MyRoutes.jsx'));
const ReviewsPage = lazy(() => import('./pages/agent/ReviewsPage.jsx'));
const NavigateJobPage = lazy(() => import('./pages/agent/NavigateJobPage.jsx'));
const HygeneXPage = lazy(() => import('./pages/shared/HygeneXPage.jsx'));

// Settings Pages
const SettingsMenu = lazy(() => import('./pages/settings/SettingsMenu.jsx'));
const ProfilePage = lazy(() => import('./pages/settings/ProfilePage.jsx'));
const NotificationsPage = lazy(() => import('./pages/settings/NotificationsPage.jsx'));
const PrivacySecurityPage = lazy(() => import('./pages/settings/PrivacySecurityPage.jsx'));
const SupportPage = lazy(() => import('./pages/settings/SupportPage.jsx'));
const FeedbackPage = lazy(() => import('./pages/settings/FeedbackPage.jsx'));
const StaffApplication = lazy(() => import('./pages/settings/StaffApplication.jsx'));

// Auth Pages
import Welcome from './pages/auth/Welcome.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

function MobileLayout() {
  const { availableJobs } = useAgentStore();
  
  const AGENT_NAV = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/jobs', icon: Briefcase, label: 'Jobs', badge: availableJobs.length },
    { path: '/hygenex', icon: Brain, label: 'HygeneX' },
    { path: '/earnings', icon: Wallet, label: 'Earnings' },
    { path: '/settings', icon: MoreHorizontal, label: 'More' },
  ];

  return (
    <>
      <div className="max-w-lg mx-auto px-4 py-5 pb-24">
        <Suspense fallback={<LoadingScreen message="Loading..." />}>
          <Outlet />
        </Suspense>
      </div>
      <BottomNav items={AGENT_NAV} />
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

  // PWA Installation
  const { isInstallable, triggerInstall } = usePWA();
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    // Proactive Prompt: Show modal automatically after 10 seconds
    const hasPrompted = sessionStorage.getItem('pwa_prompted');
    
    if (isInstallable && !hasPrompted) {
      const timer = setTimeout(() => {
        setShowInstallModal(true);
        sessionStorage.setItem('pwa_prompted', 'true');
      }, 10000); // 10 second delay
      
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && userId) {
      checkAppRole('agent');
      fetchNotifications(userId, role);
      subscribeToRealtime(userId, role);
    }
  }, [isAuthenticated, checkAppRole, userId, role]);

  if (isInitializing) {
    return <LoadingScreen message="Syncing Dispatch..." />;
  }

  return (
    <div className="min-h-dvh bg-slate-100 dark:bg-slate-900 transition-colors duration-200">


      <Routes>
        <Route path="/welcome" element={isAuthenticated ? <Navigate to="/" replace /> : <Welcome />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

        <Route element={<ProtectedLayout />}>
          <Route element={<MobileLayout />}>
            <Route path="/" element={<AgentHome />} />
            <Route path="/jobs" element={<AvailableJobs />} />
            <Route path="/jobs/navigate/:id" element={<NavigateJobPage />} />
            <Route path="/routes" element={<MyRoutes />} />
            <Route path="/earnings" element={<EarningsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/hygenex" element={<HygeneXPage />} />
            
            <Route path="/settings">
              <Route index element={<SettingsMenu />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="privacy" element={<PrivacySecurityPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="staff-application" element={<StaffApplication />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>

      <PWAInstallModal 
        isOpen={showInstallModal} 
        onClose={() => setShowInstallModal(false)}
        onInstall={() => {
          setShowInstallModal(false);
          triggerInstall();
        }}
      />

      <Toaster position="top-center" richColors />
    </div>
  );
}

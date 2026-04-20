import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Home, Briefcase, Brain, Wallet, MoreHorizontal } from 'lucide-react';

// Shared Packages
import { useAuthStore, useThemeStore, useNotificationStore, ROLES } from '@cleanflow/core';
import { Navbar, BottomNav, ProtectedRoute } from '@cleanflow/ui';

import { Toaster } from 'sonner';

// Pages
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import AgentHome from './pages/agent/AgentHome.jsx';
import AvailableJobs from './pages/agent/AvailableJobs.jsx';
import EarningsPage from './pages/agent/EarningsPage.jsx';
import MyRoutes from './pages/agent/MyRoutes.jsx';
import ReviewsPage from './pages/agent/ReviewsPage.jsx';
import NavigateJobPage from './pages/agent/NavigateJobPage.jsx';
import HygeneXPage from './pages/shared/HygeneXPage.jsx';

// Settings Pages
import SettingsMenu from './pages/settings/SettingsMenu.jsx';
import ProfilePage from './pages/settings/ProfilePage.jsx';
import NotificationsPage from './pages/settings/NotificationsPage.jsx';
import PrivacySecurityPage from './pages/settings/PrivacySecurityPage.jsx';
import SupportPage from './pages/settings/SupportPage.jsx';
import FeedbackPage from './pages/settings/FeedbackPage.jsx';

import { useAgentStore } from '@cleanflow/core';

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
        <Outlet />
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
  const { role, isAuthenticated, checkAppRole, userId } = useAuthStore();
  const { fetchNotifications, subscribeToRealtime } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated && userId) {
      checkAppRole('agent');
      fetchNotifications(userId, role);
      subscribeToRealtime(userId, role);
    }
  }, [isAuthenticated, checkAppRole, userId, role]);

  return (
    <div className="min-h-dvh bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
      <Routes>
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
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </div>
  );
}

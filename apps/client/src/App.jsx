import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Home, CalendarPlus, Package, Brain, Gauge, MoreHorizontal } from 'lucide-react';

// Shared Packages
import { useAuthStore, useThemeStore, useNotificationStore, useSystemStore, NOTIFICATION_TYPES, ROLES } from '@cleanflow/core';
import { Navbar, BottomNav, ProtectedRoute, VoiceBookingModal, NEMAReportModal } from '@cleanflow/ui';

import { Toaster } from 'sonner';

// Pages
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import UserHome from './pages/user/UserHome.jsx';
import BookPickup from './pages/user/BookPickup.jsx';
import MyBookings from './pages/user/MyBookings.jsx';
import MyIotPage from './pages/user/MyIotPage.jsx';
import ImpactHub from './pages/user/ImpactHub.jsx';
import HygeneXPage from './pages/shared/HygeneXPage.jsx';

// Settings Pages
import SettingsMenu from './pages/settings/SettingsMenu.jsx';
import ProfilePage from './pages/settings/ProfilePage.jsx';
import NotificationsPage from './pages/settings/NotificationsPage.jsx';
import PrivacySecurityPage from './pages/settings/PrivacySecurityPage.jsx';
import SupportPage from './pages/settings/SupportPage.jsx';
import FeedbackPage from './pages/settings/FeedbackPage.jsx';
import SubscriptionPage from './pages/settings/SubscriptionPage.jsx';

const CLIENT_NAV = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/book-pickup', icon: CalendarPlus, label: 'Book' },
  { path: '/my-bookings', icon: Package, label: 'Bookings' },
  { path: '/hygenex', icon: Brain, label: 'HygeneX' },
  { path: '/my-iot', icon: Gauge, label: 'My IoT' },
  { path: '/settings', icon: MoreHorizontal, label: 'More' },
];

function MobileLayout() {
  const navigate = useNavigate();
  return (
    <>
      <div className="max-w-lg mx-auto px-4 py-5 pb-24">
        <Outlet />
      </div>
      <BottomNav items={CLIENT_NAV} />
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
  const { fetchConfig } = useSystemStore();

  useEffect(() => {
    // Always fetch global config on boot
    fetchConfig();
  }, []);

  useEffect(() => {
    if (isAuthenticated && userId) {
      checkAppRole('client');
      // Ensure we use the correct targeted role for notifications
      const targetRole = role || ROLES.USER;
      fetchNotifications(userId, targetRole);
      subscribeToRealtime(userId, targetRole);
    }
  }, [isAuthenticated, userId, role]);
  return (
    <div className="min-h-dvh bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
      <Routes>
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
        </>
      )}
      <Toaster position="top-center" richColors closeButton duration={2500} />
    </div>
  );
}

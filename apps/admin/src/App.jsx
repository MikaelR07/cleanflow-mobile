import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Brain, MapPin, Settings, MessageSquare, Building2 } from 'lucide-react';

// Shared Packages
import { useAuthStore, useThemeStore, useNotificationStore, useSystemStore, ROLES } from '@cleanflow/core';
import { Navbar, AdminSidebar, ProtectedRoute, BottomNav } from '@cleanflow/ui';

import { Toaster } from 'sonner';

// Pages
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminLiveMap from './pages/admin/AdminLiveMap.jsx';
import AdminFeedbackInbox from './pages/admin/AdminFeedbackInbox.jsx';
import AdminB2B from './pages/admin/AdminB2B.jsx';
import HygeneXPage from './pages/shared/HygeneXPage.jsx';

// Settings Pages
import SettingsMenu from './pages/settings/SettingsMenu.jsx';
import ProfilePage from './pages/settings/ProfilePage.jsx';
import NotificationsPage from './pages/settings/NotificationsPage.jsx';
import PrivacySecurityPage from './pages/settings/PrivacySecurityPage.jsx';
import SupportPage from './pages/settings/SupportPage.jsx';
import FeedbackPage from './pages/settings/FeedbackPage.jsx';
import SystemConfigPage from './pages/settings/SystemConfigPage.jsx';

const ADMIN_NAV = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/reviews', icon: MessageSquare, label: 'Reviews' },
  { path: '/b2b', icon: Building2, label: 'B2B Center' },
  { path: '/hygenex', icon: Brain, label: 'HygeneX' },
  { path: '/map', icon: MapPin, label: 'Live Map' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100dvh-56px)] pb-16 lg:pb-0">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full">
        <Outlet />
      </main>
      <BottomNav items={ADMIN_NAV} />
    </div>
  );
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Navbar />
      <Outlet />
    </ProtectedRoute>
  );
}

export default function App() {
  const { role, isAuthenticated, checkAppRole, userId } = useAuthStore();
  const { subscribeToRealtime } = useNotificationStore();
  const { fetchConfig } = useSystemStore();

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (isAuthenticated && userId) {
      checkAppRole('admin');
      subscribeToRealtime(userId, role);
    }
  }, [isAuthenticated, userId, role]);

  return (
    <div className="min-h-dvh bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
      <Routes>
        <Route path="/login" element={isAuthenticated && role === ROLES.ADMIN ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated && role === ROLES.ADMIN ? <Navigate to="/" replace /> : <Register />} />

        <Route element={<ProtectedLayout />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/reports" element={<AdminReports />} />
            <Route path="/reviews" element={<AdminFeedbackInbox />} />
            <Route path="/b2b" element={<AdminB2B />} />
            <Route path="/hygenex" element={<HygeneXPage />} />
            <Route path="/map" element={<AdminLiveMap />} />
            
            <Route path="/settings">
              <Route index element={<SettingsMenu />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="privacy" element={<PrivacySecurityPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="system" element={<SystemConfigPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </div>
  );
}

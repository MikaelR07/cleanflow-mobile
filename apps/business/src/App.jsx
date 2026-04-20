import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Store, PlusCircle, ShoppingBag, Package, Brain, MoreHorizontal } from 'lucide-react';

// Shared Packages
import { useAuthStore, useThemeStore, ROLES } from '@cleanflow/core';
import { Navbar, BottomNav, ProtectedRoute } from '@cleanflow/ui';

import { Toaster } from 'sonner';

// Pages
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import MarketplaceHome from './pages/marketplace/MarketplaceHome.jsx';
import BuyRecyclables from './pages/marketplace/BuyRecyclables.jsx';
import SellRecyclables from './pages/marketplace/SellRecyclables.jsx';
import MyListings from './pages/marketplace/MyListings.jsx';
import MyOrders from './pages/marketplace/MyOrders.jsx';
import HygeneXPage from './pages/shared/HygeneXPage.jsx';

// Settings Pages
import SettingsMenu from './pages/settings/SettingsMenu.jsx';
import ProfilePage from './pages/settings/ProfilePage.jsx';
import NotificationsPage from './pages/settings/NotificationsPage.jsx';
import PrivacySecurityPage from './pages/settings/PrivacySecurityPage.jsx';
import SupportPage from './pages/settings/SupportPage.jsx';
import FeedbackPage from './pages/settings/FeedbackPage.jsx';

const BUSINESS_NAV = [
  { path: '/', icon: Store, label: 'Market' },
  { path: '/sell', icon: PlusCircle, label: 'Sell' },
  { path: '/buy', icon: ShoppingBag, label: 'Buy' },
  { path: '/orders', icon: Package, label: 'Orders' },
  { path: '/hygenex', icon: Brain, label: 'Advisor' },
  { path: '/settings', icon: MoreHorizontal, label: 'More' },
];

function MobileLayout() {
  return (
    <>
      <div className="max-w-lg mx-auto px-4 py-5 pb-24">
        <Outlet />
      </div>
      <BottomNav items={BUSINESS_NAV} />
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
  const { role, isAuthenticated, checkAppRole } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      checkAppRole('business');
    }
  }, [isAuthenticated, checkAppRole]);

  return (
    <div className="min-h-dvh bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

        <Route element={<ProtectedLayout />}>
          <Route element={<MobileLayout />}>
            <Route path="/" element={<MarketplaceHome />} />
            <Route path="/buy" element={<BuyRecyclables />} />
            <Route path="/sell" element={<SellRecyclables />} />
            <Route path="/listings" element={<MyListings />} />
            <Route path="/orders" element={<MyOrders />} />
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

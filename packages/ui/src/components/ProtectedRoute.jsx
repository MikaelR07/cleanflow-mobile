/**
 * ProtectedRoute.jsx
 *
 * Guards all authenticated routes. Handles three states:
 *  1. Supabase session is being restored on load → show loading spinner
 *  2. No valid session → redirect to /login
 *  3. Valid session → render children
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Recycle } from 'lucide-react';
import { useAuthStore } from '@cleanflow/core';
import { supabase, isSupabaseConfigured } from '@cleanflow/supabase';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Since we are falling back to the pure local DB model, 
  // we do not need to wait for a network session restore.
  const [checking, setChecking] = useState(false);

  // Show a branded loading screen while we verify the Supabase session
  if (checking) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse">
          <Recycle className="w-7 h-7 text-white" />
        </div>
        <p className="text-sm text-slate-400 font-medium animate-pulse">Restoring session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

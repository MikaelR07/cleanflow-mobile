import { createClient } from '@supabase/supabase-js';

const getEnv = (key) => {
  // Support both Vite (import.meta.env) and Node/standard (process.env)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  return process.env[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[CleanFlow] Supabase env vars not set. ' +
    'Create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'cleanflow-session-v2',
      },
    })
  : null;

export const phoneToEmail = (phone) => {
  const digits = phone.replace(/\D/g, '').slice(-9);
  return `cf${digits}@gmail.com`;
};

export const sanitizeProfile = (profile) => {
  const { pin, role, ...safe } = profile;
  return safe;
};

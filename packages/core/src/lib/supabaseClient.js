/**
 * supabaseClient.js — Re-exports from the dedicated @cleanflow/supabase package.
 * This allows all stores in @cleanflow/core to have a single, consistent import path.
 */
export { supabase, isSupabaseConfigured, phoneToEmail } from '@cleanflow/supabase';

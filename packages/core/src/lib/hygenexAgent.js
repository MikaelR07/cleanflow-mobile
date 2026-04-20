/**
 * hygenexAgent.js — Frontend client for calling the HygeneX Supabase Edge Function
 *
 * Usage:
 *   import { callHygeneXAgent } from '../lib/hygenexAgent.js';
 *
 *   // From IoT store when a bin hits 90%:
 *   await callHygeneXAgent.iotAlert({ binId, binName, fillLevel, estate, userId });
 *
 *   // From hygenexStore when user sends a message:
 *   const { reply } = await callHygeneXAgent.userMessage({ userMessage, userId, chatHistory });
 *
 *   // From admin dashboard:
 *   await callHygeneXAgent.scheduled('daily_report');
 */
import { supabase, isSupabaseConfigured } from '@cleanflow/supabase';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hygenex-agent`;

// ── Generic invoker ─────────────────────────────────────────────────
async function invoke(body) {
  if (!isSupabaseConfigured) {
    console.warn('[HygeneX Agent] Supabase not configured — skipping agent call.');
    return null;
  }

  const session = await supabase.auth.getSession();
  const token = session?.data?.session?.access_token;

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    console.error('[HygeneX Agent] Edge Function error:', err);
    return null;
  }

  return res.json();
}

// ── Typed helpers ───────────────────────────────────────────────────
export const callHygeneXAgent = {
  /**
   * Triggered when an IoT threshold is crossed.
   */
  iotAlert: ({ binId, binName, fillLevel, aqi, odourLevel, estate, userId }) =>
    invoke({
      type: 'iot_alert',
      userId,
      payload: { binId, binName, fillLevel, aqi, odourLevel, estate },
    }),

  /**
   * Triggered when a user sends a message in HygeneX chat.
   * Returns { decision, actions, reply } where reply is the AI's response text.
   */
  userMessage: ({ userMessage, userId, chatHistory = [], userRole = 'user' }) =>
    invoke({
      type: 'user_message',
      userId,
      payload: { userMessage, chatHistory, userRole },
    }),

  /**
   * Triggered by a cron job or admin action.
   * checkType: 'daily_report' | 'reward_audit' | 'agent_dispatch'
   */
  scheduled: (checkType = 'daily_report') =>
    invoke({
      type: 'scheduled',
      payload: { checkType },
    }),
};

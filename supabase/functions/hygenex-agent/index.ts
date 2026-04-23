// ═══════════════════════════════════════════════════════════════════
// CleanFlow KE — HygeneX AI Operations Manager (Gemini Edition)
// ═══════════════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── MAIN HANDLER ────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const { type, userId, payload } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400, headers: corsHeaders });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in Supabase Secrets');
    }

    // 1. Build Context — fetch the user's data to give the AI "Memory"
    const [profileRes, bookingsRes, iotRes, marketRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('bookings').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
      supabase.from('iot_devices').select('*').eq('owner_id', userId),
      supabase.from('marketplace_listings').select('*').eq('status', 'active').limit(5)
    ]);

    const user = profileRes.data;
    const recentBookings = bookingsRes.data || [];
    const devices = iotRes.data || [];
    const marketListings = marketRes.data || [];

    // 2. Build the prompt with all context baked in
    const systemContext = `You are HygeneX, the Autonomous Operations Manager for CleanFlow KE.
You are speaking to ${user?.name || 'a user'} (Role: ${user?.role || 'user'}).

LOCALE: Nairobi, Kenya. Warm, professional, efficient.
CORE DATA:
- User Stats: Wallet KSh ${user?.wallet_balance || 0}, Points ${user?.reward_points || 0}, Tier ${user?.subscription_tier || 'lite'}
- IoT Sensors: ${devices.length > 0 ? devices.map(d => `${d.name}: ${d.fill_level}%`).join(', ') : 'No active sensors.'}
- Recent Activity: ${recentBookings.length > 0 ? recentBookings.map(b => `${b.waste_type} (${b.status})`).join(', ') : 'No recent bookings.'}
- Market Trends (Live): ${marketListings.length > 0 ? marketListings.map(l => `${l.material} @ KSh ${l.price_per_kg}/kg`).join(', ') : 'Market data unavailable.'}

INTELLIGENCE RULES:
- If a user asks about rewards, explain how they can earn more by better segregation.
- If an agent asks about work, prioritize "pending" bookings near their location.
- If a business/weaver asks about selling, use the Live Market Trends above to suggest optimal pricing.
- If an IoT bin is >85%, insist they book a pickup NOW.
- Keep answers under 60 words. Be actionable. Use Swahili greetings sparingly.`;

    const userMessage = payload?.message || payload?.userMessage || 'Hello';

    // 3. Call Gemini REST API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemContext}\n\nUser: ${userMessage}` }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
      })
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error('[Gemini Error]', err);
      throw new Error(`AI Engine Failure: ${err}`);
    }

    const geminiData = await geminiRes.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "I'm processing too much data. Try again in a second.";

    // 4. Store AI response
    await supabase.from('hygenex_messages').insert({ user_id: userId, role: 'ai', text: aiResponse });

    return new Response(JSON.stringify({ text: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[HygeneX Error]', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

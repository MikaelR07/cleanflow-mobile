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

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in Supabase Secrets');
    }

    // 1. Build Context — fetch the user's data to give the AI "Memory"
    const [profileRes, bookingsRes, iotRes, marketRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('bookings').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
      supabase.from('iot_devices').select('*').eq('owner_id', userId),
      supabase.from('marketplace_listings').select('*').eq('status', 'active').limit(10)
    ]);

    const user = profileRes.data;
    const recentBookings = bookingsRes.data || [];
    const devices = iotRes.data || [];
    const marketListings = marketRes.data || [];

    // 2. Build the prompt with all context baked in
    const systemContext = `You are HygeneX, the Autonomous Operations Manager for CleanFlow KE, a smart waste management platform in Nairobi, Kenya.

You are speaking to ${user?.name || 'a valued user'} who is a "${user?.role || 'user'}".

PERSONALITY: Professional, warm, efficient, knowledgeable about waste management and recycling in Kenya.
LANGUAGE: Prioritize English. Use Swahili greetings only for warmth (e.g., "Karibu!", "Asante!").

LIVE DATA FROM CLEANFLOW:
- User: ${user?.name || 'Unknown'}, Subscription: ${user?.subscription_tier || 'lite'}, Reward Points: ${user?.reward_points || 0}, Wallet: KSh ${user?.wallet_balance || 0}
- Recent Bookings (${recentBookings.length}): ${recentBookings.length > 0 ? JSON.stringify(recentBookings.map(b => ({ date: b.preferred_date, status: b.status, waste: b.waste_type, kg: b.weight_kg }))) : 'No recent bookings.'}
- IoT Devices (${devices.length}): ${devices.length > 0 ? JSON.stringify(devices.map(d => ({ name: d.name, fill: d.fill_level + '%', type: d.type }))) : 'No connected devices.'}
- Marketplace Listings (${marketListings.length}): ${marketListings.length > 0 ? JSON.stringify(marketListings.map(l => ({ material: l.material, price_per_kg: l.price_per_kg, quantity: l.quantity }))) : 'No active listings.'}

CAPABILITIES:
- For "user": Help with bookings, reward tracking, waste tips, impact stories.
- For "agent": Advise on routes, log incident reports, prioritize pickups.
- For "business": Analyze marketplace prices from CURRENT listings, suggest pricing.
- For "admin": Summarize platform health, draft NEMA reports, flag anomalies.

RULES:
- Base marketplace price suggestions on ACTUAL listing data above only.
- Keep responses concise (2-4 sentences max unless asked for detail).
- If IoT bin is above 80% fill, proactively suggest booking a pickup.
- Be proactive and actionable.`;

    const userMessage = payload?.message || payload?.userMessage || 'Hello';

    // 3. Call Gemini REST API — using the simplest, most compatible format
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemContext}\n\n---\nUser says: ${userMessage}` }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[Gemini API Error]', geminiRes.status, errText);
      
      // If gemini-2.0-flash fails, try gemini-1.5-flash as fallback
      if (geminiRes.status === 404 || geminiRes.status === 400) {
        console.log('[Gemini] Trying fallback model gemini-1.5-flash...');
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const fallbackRes = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemContext}\n\n---\nUser says: ${userMessage}` }] }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
          })
        });
        
        if (!fallbackRes.ok) {
          const fallbackErr = await fallbackRes.text();
          throw new Error(`Both Gemini models failed. Last error: ${fallbackErr}`);
        }
        
        const fallbackData = await fallbackRes.json();
        const fallbackText = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.';
        
        await supabase.from('hygenex_messages').insert({ user_id: userId, role: 'ai', text: fallbackText });
        return new Response(JSON.stringify({ text: fallbackText }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Handle Rate Limiting (Too Many Requests) gracefully
      if (geminiRes.status === 429) {
        const rateLimitMessage = "I'm receiving too many messages at once! Give me a minute to catch my breath and please try again.";
        await supabase.from('hygenex_messages').insert({ user_id: userId, role: 'ai', text: rateLimitMessage });
        return new Response(JSON.stringify({ text: rateLimitMessage }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Gemini API returned ${geminiRes.status}: ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response. Please try again.';

    // 4. Store AI response in the database
    await supabase.from('hygenex_messages').insert({
      user_id: userId,
      role: 'ai',
      text: aiResponse
    });

    // 5. Log the action for admin audit trail (non-critical)
    try {
      await supabase.from('agent_actions').insert({
        trigger_type: type || 'user_message',
        user_id: userId,
        payload: { message: userMessage },
        decision: aiResponse.substring(0, 200),
        tools_called: ['gemini-api'],
        success: true,
        duration_ms: Date.now() - startTime,
      });
    } catch (_) { /* non-critical */ }

    return new Response(JSON.stringify({ text: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[HygeneX Error]', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

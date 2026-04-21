import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    if (!phone) throw new Error('Phone number is required.');

    // Normalize to international format
    let normalized = phone.replace(/\D/g, '');
    if (normalized.startsWith('0')) normalized = '254' + normalized.slice(1);
    if (!normalized.startsWith('254')) normalized = '254' + normalized;
    const e164 = '+' + normalized;

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP hash in Supabase (expires in 10 minutes)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Upsert OTP record (one per phone at a time)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: dbError } = await supabase
      .from('otp_verifications')
      .upsert({ phone: e164, otp_code: otp, expires_at: expiresAt }, { onConflict: 'phone' });

    if (dbError) throw new Error('Failed to store OTP: ' + dbError.message);

    // Send SMS via Africa's Talking
    const AT_API_KEY  = Deno.env.get('AT_API_KEY')!;
    const AT_USERNAME = Deno.env.get('AT_USERNAME')!; // 'sandbox' for testing

    const body = new URLSearchParams({
      username: AT_USERNAME,
      to: e164,
      message: `Your CleanFlow verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
    });

    const atRes = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'apiKey': AT_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const atData = await atRes.json();
    console.log('[CleanFlow OTP] AT Response:', JSON.stringify(atData));

    const status = atData?.SMSMessageData?.Recipients?.[0]?.status;
    if (status && status !== 'Success') {
      throw new Error(`SMS delivery failed: ${status}`);
    }

    return new Response(JSON.stringify({ success: true, message: 'OTP sent successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('[CleanFlow OTP] Error:', err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

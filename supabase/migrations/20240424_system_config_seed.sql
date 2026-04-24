-- ════════════════════════════════════════════════════════════════
-- SYSTEM CONFIG MIGRATION — Flexible Key-Value Architecture
-- This replaces the single-row config with a manageable list.
-- ════════════════════════════════════════════════════════════════

-- 1. Clean Slate
DROP TABLE IF EXISTS public.system_config CASCADE;

-- 2. Create the new flexible table
CREATE TABLE public.system_config (
  key         TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  value       NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Security
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone views config" ON public.system_config 
  FOR SELECT USING (true);

-- Only Admins can update settings
CREATE POLICY "Admins update config" ON public.system_config 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Seed with all standard settings
INSERT INTO public.system_config (key, label, value, description)
VALUES 
  ('fee_pickup', 'Base Pickup Fee', 100, 'The standard cost for a waste collection request.'),
  ('fee_logistics', 'Logistics Surcharge', 50, 'Additional fee covering transport to recovery centers.'),
  ('fee_min_payout', 'Minimum Withdrawal', 500, 'Minimum wallet balance required for payout requests.'),
  ('fee_min_pickup', 'Minimum Weight (KG)', 5, 'Minimum weight required to justify a collection trip.'),
  ('whatsapp_number', 'WhatsApp Support', 254113787588, 'The official business WhatsApp contact (numbers only).'),
  ('support_number', 'Customer Support', 254113787588, 'The official customer support hotline (numbers only).');

-- Migration: 20240422_fix_marketplace_schema.sql
-- Description: Adds missing columns and tables for the B2B Escrow Marketplace

-- 1. Ensure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create assets table IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.assets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  verifier_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  weaver_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  owner_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  material_type   TEXT NOT NULL,
  grade           TEXT,
  weight_kg       NUMERIC(10,2) NOT NULL,
  estimated_value NUMERIC(12,2),
  purity_score    INTEGER DEFAULT 85,
  photo_url       TEXT,
  status          TEXT DEFAULT 'verified',
  source          TEXT DEFAULT 'verified',
  matched_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Fix marketplace_orders table
-- Add missing columns
ALTER TABLE public.marketplace_orders 
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'b2b';

-- Update listing_id to be nullable
ALTER TABLE public.marketplace_orders 
  ALTER COLUMN listing_id DROP NOT NULL;

-- 4. Update status check constraint for Escrow Workflow
ALTER TABLE public.marketplace_orders 
  DROP CONSTRAINT IF EXISTS marketplace_orders_status_check;

ALTER TABLE public.marketplace_orders 
  ADD CONSTRAINT marketplace_orders_status_check 
  CHECK (status IN (
    'pending', 'waiting', 'processing', 'confirmed', 
    'completed', 'cancelled', 'held_in_escrow', 
    'funds_released', 'disputed'
  ));

-- 5. Enable Realtime for assets (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'assets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assets;
  END IF;
END $$;

-- 6. Add RLS for assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Creation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone authenticated can view assets') THEN
        CREATE POLICY "Anyone authenticated can view assets" ON public.assets FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Agents can insert assets') THEN
        CREATE POLICY "Agents can insert assets" ON public.assets FOR INSERT WITH CHECK (EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'agent' OR role = 'admin')
        ));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Weavers and Admins can update assets') THEN
        CREATE POLICY "Weavers and Admins can update assets" ON public.assets FOR UPDATE USING (EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'business' OR role = 'admin' OR role = 'agent')
        ));
    END IF;
END $$;

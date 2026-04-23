-- Add columns to support Agent→Weaver escrow claims
ALTER TABLE public.marketplace_orders 
  ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'b2b' CHECK (order_type IN ('b2b', 'agent_claim')),
  ALTER COLUMN listing_id DROP NOT NULL;

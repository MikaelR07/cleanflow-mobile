-- ════════════════════════════════════════════════════════════════
-- WASTE CATEGORIES RESET — Simplified Resident-Friendly Categories
-- Run this in Supabase SQL Editor to reset the categories table.
-- ════════════════════════════════════════════════════════════════

-- 1. Ensure the table has the right shape
ALTER TABLE IF EXISTS public.waste_categories
  ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📦',
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Clear old entries (Gas Cooker, Clothings, etc.)
DELETE FROM public.waste_categories;

-- 3. Seed with the 8 simplified categories
INSERT INTO public.waste_categories (label, slug, icon, description, is_active, price_per_unit) VALUES
  ('General Waste',    'general',     '🗑️', 'Regular household trash',    true, 0),
  ('Recyclable',       'recyclable',  '♻️', 'Plastics, Paper, Cardboard', true, 0),
  ('Organic / Food',   'organic',     '🍎', 'Food scraps and greens',     true, 0),
  ('Metal',            'metal',       '⛓️', 'Scrap metal, cans, tins',    true, 0),
  ('E-Waste',          'ewaste',      '💻', 'Electronics, batteries',      true, 0),
  ('Bulky Item',       'bulky',       '🛋️', 'Furniture, mattresses',      true, 0),
  ('Large Appliances', 'appliances',  '🧊', 'Fridges, Washers, Cookers',  true, 0),
  ('Hazardous',        'hazardous',   '⚠️', 'Chemicals, paints, oils',    true, 0);

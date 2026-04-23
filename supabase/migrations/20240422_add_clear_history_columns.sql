-- ── Add Clear History Columns to Profiles ─────────────────────────────────────
-- These columns are used to "soft clear" booking history from the UI
-- without deleting the actual booking records from the database.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS completed_cleared_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_cleared_at TIMESTAMPTZ;

-- Refresh the schema cache so PostgREST (the API) recognizes the new columns immediately
NOTIFY pgrst, 'reload schema';

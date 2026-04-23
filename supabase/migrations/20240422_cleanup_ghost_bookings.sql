-- ── Cleanup Dirty Data: Mark Paid Bookings as Completed ──────────────────────
-- This fixes old bookings that were paid but never officially closed.

UPDATE public.bookings 
SET status = 'completed'
WHERE payment_status = 'paid' AND status != 'completed';

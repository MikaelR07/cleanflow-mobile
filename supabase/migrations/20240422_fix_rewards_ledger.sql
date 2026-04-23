-- ── Fix: rewards_ledger column mismatch ─────────────────────────────────────
-- The trigger was referencing 'amount_points' but the live DB may have 'points'.
-- This migration ensures the correct column exists and the trigger is updated.

-- Step 1: Add amount_points column if it doesn't exist (safe, idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'rewards_ledger' 
      AND column_name = 'amount_points'
  ) THEN
    ALTER TABLE public.rewards_ledger ADD COLUMN amount_points INTEGER DEFAULT 0;
  END IF;
END$$;

-- Step 2: Rebuild the reward trigger to fire on BOTH:
--   a) booking status → 'completed' (agent marks job done)
--   b) payment_status → 'paid'      (client confirms escrow)
CREATE OR REPLACE FUNCTION credit_user_rewards()
RETURNS TRIGGER AS $$
DECLARE
  v_cashback_per_kg NUMERIC := 5.00;
  v_points_per_kg   NUMERIC := 5;
  v_earned_cashback NUMERIC;
  v_earned_points   INTEGER;
  v_weight          NUMERIC;
BEGIN
  -- Fire on: booking completed OR payment confirmed
  IF (NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed'))
  OR (NEW.payment_status = 'paid' AND (OLD.payment_status IS DISTINCT FROM 'paid')) THEN

    -- Prevent double-crediting: only credit once per booking
    IF EXISTS (
      SELECT 1 FROM public.rewards_ledger WHERE booking_id = NEW.id
    ) THEN
      RETURN NEW;
    END IF;

    v_weight          := COALESCE(NEW.actual_weight_kg, NEW.weight_kg, NEW.bags, 1);
    v_earned_cashback := v_weight * v_cashback_per_kg;
    v_earned_points   := floor(v_weight * v_points_per_kg);

    -- 1. Update the user's wallet + points
    UPDATE public.profiles
    SET 
      wallet_balance = COALESCE(wallet_balance, 0) + v_earned_cashback,
      reward_points  = COALESCE(reward_points, 0) + v_earned_points
    WHERE id = NEW.user_id;

    -- 2. Log the transaction in the ledger
    INSERT INTO public.rewards_ledger (
      profile_id, 
      booking_id, 
      amount_cashback, 
      amount_points, 
      transaction_type, 
      description
    )
    VALUES (
      NEW.user_id, 
      NEW.id, 
      v_earned_cashback, 
      v_earned_points, 
      'earning', 
      'Recycling reward for ' || v_weight || ' units collected'
    );

    -- 3. Send real-time notification to user
    INSERT INTO public.notifications (target_user, target_role, type, title, body)
    VALUES (
      NEW.user_id, 
      'user', 
      'reward', 
      'Rewards Earned! 🌿', 
      'You earned KSh ' || v_earned_cashback || ' and ' || v_earned_points || ' XP for your collection.'
    );

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the trigger on the bookings table
DROP TRIGGER IF EXISTS on_booking_completed ON public.bookings;
CREATE TRIGGER on_booking_completed
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION credit_user_rewards();

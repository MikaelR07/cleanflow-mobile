-- Migration: 20240422_micro_escrow_service_fees.sql
-- Description: Implements the 80/20 service fee split for Client-to-Agent pickups

-- 1. Add payment_status to bookings
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
  CHECK (payment_status IN ('pending', 'authorized', 'paid', 'disputed'));

-- 2. Create the Service Payout Function
CREATE OR REPLACE FUNCTION public.handle_service_payout()
RETURNS TRIGGER AS $$
DECLARE
  v_agent_id UUID;
  v_payout_amount NUMERIC(10,2);
  v_commission_amount NUMERIC(10,2);
BEGIN
  -- Logic: When payment_status changes to 'paid'
  IF (NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid')) THEN
    
    v_agent_id := NEW.agent_id;
    
    IF v_agent_id IS NOT NULL AND NEW.total_price > 0 THEN
      -- Calculate 80/20 split
      v_payout_amount := NEW.total_price * 0.80;
      v_commission_amount := NEW.total_price * 0.20;

      -- 1. Credit the Agent's Wallet
      UPDATE public.profiles
      SET wallet_balance = COALESCE(wallet_balance, 0) + v_payout_amount
      WHERE id = v_agent_id;

      -- 2. Log in Rewards Ledger
      INSERT INTO public.rewards_ledger (profile_id, transaction_type, amount_cashback, description)
      VALUES (v_agent_id, 'earning', v_payout_amount, 'Service fee payout for Pickup #' || NEW.id);

      -- 3. Notify the Agent
      INSERT INTO public.notifications (target_user, target_role, type, title, body)
      VALUES (
        v_agent_id, 
        'agent', 
        'success', 
        'Service Fee Received! 🚛', 
        'You have earned KSh ' || v_payout_amount || ' for pickup ' || NEW.id
      );

      -- 4. Credit Resident Rewards (Sustainomics)
      -- Residents get 5% of their fee back in points
      PERFORM public.add_reward_points(NEW.user_id, (NEW.total_price * 0.05)::INTEGER, 'Recycling Service Bonus');
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach the Trigger
DROP TRIGGER IF EXISTS on_service_paid ON public.bookings;
CREATE TRIGGER on_service_paid
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_service_payout();

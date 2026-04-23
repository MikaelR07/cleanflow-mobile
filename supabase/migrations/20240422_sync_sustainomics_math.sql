-- ── REFINEMENT: Sustainomics Reward & Payout Engine ───────────────────────────
-- This script synchronizes the frontend math with the database logic.
-- 1. Deducts Fee from Resident
-- 2. Pays 80% of Fee to Agent
-- 3. Issues dynamic Cashback based on Material Market Rates
-- 4. Issues GFP Points (XP)

CREATE OR REPLACE FUNCTION public.credit_user_rewards()
RETURNS TRIGGER AS $$
DECLARE
  v_material_rate   NUMERIC;
  v_earned_cashback NUMERIC;
  v_earned_points   INTEGER;
  v_agent_pay       NUMERIC;
  v_weight          NUMERIC;
  v_points_per_kg   INTEGER := 5;
BEGIN
  -- Trigger Logic: Fire on 'completed' status or 'paid' payment status
  IF (NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed'))
  OR (NEW.payment_status = 'paid' AND (OLD.payment_status IS DISTINCT FROM 'paid')) THEN

    -- 1. Safety Guard: Prevent double-crediting
    IF EXISTS (
      SELECT 1 FROM public.rewards_ledger WHERE booking_id = NEW.id
    ) THEN
      RETURN NEW;
    END IF;

    -- 2. Determine the Weight
    v_weight := COALESCE(NEW.actual_weight_kg, NEW.weight_kg, NEW.bags, 1);

    -- 3. Lookup Material Rate from material_prices table
    SELECT price_per_kg INTO v_material_rate 
    FROM public.material_prices 
    WHERE material_name ILIKE '%' || NEW.waste_type || '%' 
    LIMIT 1;

    -- Fallback rate if material not found
    IF v_material_rate IS NULL THEN
      v_material_rate := 5.00; 
    END IF;

    -- 4. Calculate Values
    v_earned_cashback := v_weight * v_material_rate;
    v_earned_points   := floor(v_weight * v_points_per_kg);
    v_agent_pay       := COALESCE(NEW.fee, 0) * 0.80;

    -- 5. UPDATE RESIDENT (Deduct Fee, Add Cashback & Points)
    UPDATE public.profiles
    SET 
      wallet_balance = COALESCE(wallet_balance, 0) - COALESCE(NEW.fee, 0) + v_earned_cashback,
      reward_points  = COALESCE(reward_points, 0) + v_earned_points
    WHERE id = NEW.user_id;

    -- 6. UPDATE AGENT (Add 80% Commission)
    IF NEW.agent_id IS NOT NULL THEN
      UPDATE public.profiles
      SET wallet_balance = COALESCE(wallet_balance, 0) + v_agent_pay
      WHERE id = NEW.agent_id;
    END IF;

    -- 7. LOG TRANSACTION (Resident's View)
    INSERT INTO public.rewards_ledger (
      profile_id, booking_id, amount_cashback, amount_points, transaction_type, description
    )
    VALUES (
      NEW.user_id, 
      NEW.id, 
      v_earned_cashback - COALESCE(NEW.fee, 0), 
      v_earned_points, 
      'earning', 
      'Recycling ' || v_weight || 'kg of ' || NEW.waste_type || ' (Reward - Logistics Fee)'
    );

    -- 8. NOTIFY RESIDENT
    INSERT INTO public.notifications (target_user, target_role, type, title, body)
    VALUES (
      NEW.user_id, 'user', 'reward', 'Mission Success! 🚛', 
      'You earned ' || v_earned_points || ' XP. Net impact: KSh ' || (v_earned_cashback - COALESCE(NEW.fee, 0))
    );

    -- 9. NOTIFY AGENT
    IF NEW.agent_id IS NOT NULL THEN
      INSERT INTO public.notifications (target_user, target_role, type, title, body)
      VALUES (
        NEW.agent_id, 'agent', 'reward', 'Commission Received! 💰', 
        'KSh ' || v_agent_pay || ' has been added to your wallet for mission ' || NEW.id
      );
    END IF;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

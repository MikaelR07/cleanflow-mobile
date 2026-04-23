-- ── REFINEMENT: Founder's Launch Split (85% Agent / 15% Platform) ─────────────
-- Updated for the "First 1,000 Missions" trust-building phase.

CREATE OR REPLACE FUNCTION public.get_admin_overview()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'totalUsers',        (SELECT count(*) FROM public.profiles WHERE role = 'user'),
    'activeAgents',       (SELECT count(*) FROM public.profiles WHERE role = 'agent' AND is_online = true),
    'registeredAgents',   (SELECT count(*) FROM public.profiles WHERE role = 'agent'),
    'totalBusinesses',    (SELECT count(*) FROM public.profiles WHERE role = 'business'),
    'freeTierMembers',    (SELECT count(*) FROM public.profiles WHERE subscription_tier = 'lite' AND role = 'user'),
    'standardMembers',    (SELECT count(*) FROM public.profiles WHERE subscription_tier = 'standard' AND role = 'user'),
    'premiumMembers',     (SELECT count(*) FROM public.profiles WHERE subscription_tier = 'premium' AND role = 'user'),
    
    'totalWeight',        COALESCE((SELECT sum(actual_weight_kg) FROM public.bookings WHERE status = 'completed'), 0),
    'totalRevenue',       COALESCE((SELECT sum(fee) FROM public.bookings WHERE status = 'completed'), 0) + 
                          COALESCE((SELECT sum(total_price) FROM public.marketplace_orders WHERE status IN ('completed', 'funds_released')), 0),
    
    'subscriptionRevenue', COALESCE((SELECT sum(CASE 
                                WHEN subscription_tier = 'standard' THEN 500 
                                WHEN subscription_tier = 'premium' THEN 1500 
                                ELSE 0 END) FROM public.profiles), 0),
    
    -- Updated to 15% Platform Commission for Launch Phase
    'commissionRevenue',  COALESCE((SELECT sum(fee * 0.15) FROM public.bookings WHERE status = 'completed'), 0) +
                          COALESCE((SELECT sum(total_price * 0.15) FROM public.marketplace_orders WHERE status IN ('completed', 'funds_released')), 0),
    
    'rewardsLiabilities', COALESCE((SELECT sum(wallet_balance) FROM public.profiles), 0),
    'pendingJobs',        (SELECT count(*) FROM public.bookings WHERE status = 'pending')
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the Reward & Payout Logic to 85%
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
  IF (NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed'))
  OR (NEW.payment_status = 'paid' AND (OLD.payment_status IS DISTINCT FROM 'paid')) THEN

    IF EXISTS (SELECT 1 FROM public.rewards_ledger WHERE booking_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    v_weight := COALESCE(NEW.actual_weight_kg, NEW.weight_kg, NEW.bags, 1);

    SELECT price_per_kg INTO v_material_rate 
    FROM public.material_prices 
    WHERE material_name ILIKE '%' || NEW.waste_type || '%' 
    LIMIT 1;

    IF v_material_rate IS NULL THEN v_material_rate := 5.00; END IF;

    v_earned_cashback := v_weight * v_material_rate;
    v_earned_points   := floor(v_weight * v_points_per_kg);
    
    -- FOUNDER'S RATE: 85% Payout to Agent
    v_agent_pay       := COALESCE(NEW.fee, 0) * 0.85;

    -- Update Resident
    UPDATE public.profiles
    SET 
      wallet_balance = COALESCE(wallet_balance, 0) - COALESCE(NEW.fee, 0) + v_earned_cashback,
      reward_points  = COALESCE(reward_points, 0) + v_earned_points
    WHERE id = NEW.user_id;

    -- Update Agent (85% Split)
    IF NEW.agent_id IS NOT NULL THEN
      UPDATE public.profiles
      SET wallet_balance = COALESCE(wallet_balance, 0) + v_agent_pay
      WHERE id = NEW.agent_id;
    END IF;

    -- Log & Notify... (Keeping rest same)
    INSERT INTO public.rewards_ledger (profile_id, booking_id, amount_cashback, amount_points, transaction_type, description)
    VALUES (NEW.user_id, NEW.id, v_earned_cashback - COALESCE(NEW.fee, 0), v_earned_points, 'earning', 'Recycling ' || v_weight || 'kg of ' || NEW.waste_type || ' (Founder Split)');

    INSERT INTO public.notifications (target_user, target_role, type, title, body)
    VALUES (NEW.user_id, 'user', 'reward', 'Mission Success! 🚛', 'Impact net: KSh ' || (v_earned_cashback - COALESCE(NEW.fee, 0)));

    IF NEW.agent_id IS NOT NULL THEN
      INSERT INTO public.notifications (target_user, target_role, type, title, body)
      VALUES (NEW.agent_id, 'agent', 'reward', 'Founder Commission Received! 💰', 'KSh ' || v_agent_pay || ' added to wallet (85% Split)');
    END IF;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

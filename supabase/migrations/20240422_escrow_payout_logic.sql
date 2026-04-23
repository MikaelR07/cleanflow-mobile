-- Migration: 20240422_escrow_payout_logic.sql
-- Description: Implements the automated 90/10 payout trigger and updates admin analytics RPCs

-- 1. Create the Payout Trigger Function
CREATE OR REPLACE FUNCTION public.handle_escrow_payout()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
  v_payout_amount NUMERIC(12,2);
  v_commission_amount NUMERIC(12,2);
BEGIN
  -- Trigger logic: When status changes to 'funds_released'
  IF (NEW.status = 'funds_released' AND OLD.status != 'funds_released') THEN
    
    -- Identify the seller
    -- For agent_claim, seller_id is explicitly set
    -- For B2B listings, we might need to fetch it from the listing if not set
    v_seller_id := NEW.seller_id;
    
    IF v_seller_id IS NULL AND NEW.listing_id IS NOT NULL THEN
      SELECT seller_id INTO v_seller_id FROM public.marketplace_listings WHERE id = NEW.listing_id;
    END IF;

    IF v_seller_id IS NOT NULL THEN
      -- Calculate 90/10 split
      v_payout_amount := NEW.total_price * 0.90;
      v_commission_amount := NEW.total_price * 0.10;

      -- 1. Credit the Seller's Wallet
      UPDATE public.profiles
      SET wallet_balance = COALESCE(wallet_balance, 0) + v_payout_amount
      WHERE id = v_seller_id;

      -- 2. Log in Rewards Ledger (as a sale earning)
      INSERT INTO public.rewards_ledger (profile_id, transaction_type, amount_cashback, description)
      VALUES (v_seller_id, 'earning', v_payout_amount, 'Marketplace sale payout for Order #' || NEW.id);

      -- 3. Notify the Seller
      INSERT INTO public.notifications (target_user, target_role, type, title, body)
      VALUES (
        v_seller_id, 
        'all', 
        'success', 
        'Payment Received! 💰', 
        'Funds from order ' || NEW.id || ' have been released to your wallet (90% payout).'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the Trigger to marketplace_orders
DROP TRIGGER IF EXISTS on_escrow_released ON public.marketplace_orders;
CREATE TRIGGER on_escrow_released
  AFTER UPDATE ON public.marketplace_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_escrow_payout();

-- 3. Update Admin Overview RPC
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
    'commissionRevenue',  COALESCE((SELECT sum(total_price * 0.1) FROM public.marketplace_orders WHERE status IN ('completed', 'funds_released')), 0),
    'rewardsLiabilities', COALESCE((SELECT sum(wallet_balance) FROM public.profiles), 0),
    'pendingJobs',        (SELECT count(*) FROM public.bookings WHERE status = 'pending')
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update Revenue Trends RPC
CREATE OR REPLACE FUNCTION public.get_revenue_trends()
RETURNS SETOF json AS $$
BEGIN
  RETURN QUERY
  SELECT json_build_object(
    'month', to_char(created_at, 'Mon'),
    'revenue', sum(total_price)
  )
  FROM public.marketplace_orders
  WHERE status IN ('completed', 'funds_released')
  GROUP BY 1, date_trunc('month', created_at)
  ORDER BY date_trunc('month', created_at) DESC
  LIMIT 6;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update Material Distribution RPC
CREATE OR REPLACE FUNCTION public.get_material_distribution()
RETURNS SETOF json AS $$
BEGIN
  RETURN QUERY
  SELECT json_build_object(
    'name', material,
    'value', sum(quantity)
  )
  FROM public.marketplace_orders
  WHERE status IN ('completed', 'funds_released')
  GROUP BY material
  ORDER BY 2 DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

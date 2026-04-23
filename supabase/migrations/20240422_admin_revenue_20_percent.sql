-- ── REFINEMENT: Admin Revenue Analytics (20% Platform Gains) ────────────────
-- This script updates the Admin Dashboard analytics to reflect the new
-- commission structure (80% Agent / 20% Platform).

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
    
    -- Total Gross Weight Collected
    'totalWeight',        COALESCE((SELECT sum(actual_weight_kg) FROM public.bookings WHERE status = 'completed'), 0),
    
    -- Total Gross Sales (Subscriptions + Marketplace Gross + Booking Gross)
    'totalRevenue',       COALESCE((SELECT sum(fee) FROM public.bookings WHERE status = 'completed'), 0) + 
                          COALESCE((SELECT sum(total_price) FROM public.marketplace_orders WHERE status IN ('completed', 'funds_released')), 0),
    
    -- Subscription Revenue
    'subscriptionRevenue', COALESCE((SELECT sum(CASE 
                                WHEN subscription_tier = 'standard' THEN 500 
                                WHEN subscription_tier = 'premium' THEN 1500 
                                ELSE 0 END) FROM public.profiles), 0),
    
    -- Platform Net Commissions (20% of Bookings + 20% of Marketplace)
    'commissionRevenue',  COALESCE((SELECT sum(fee * 0.20) FROM public.bookings WHERE status = 'completed'), 0) +
                          COALESCE((SELECT sum(total_price * 0.20) FROM public.marketplace_orders WHERE status IN ('completed', 'funds_released')), 0),
    
    -- Total Liabilities (User Wallet Balances)
    'rewardsLiabilities', COALESCE((SELECT sum(wallet_balance) FROM public.profiles), 0),
    
    -- Operations
    'pendingJobs',        (SELECT count(*) FROM public.bookings WHERE status = 'pending')
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

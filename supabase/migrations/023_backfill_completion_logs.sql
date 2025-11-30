-- ============================================================================
-- Migration: Backfill Completion Logs for Existing Completed Trips
-- ============================================================================
-- Creates completion log entries for trips that were completed before
-- the trip_completion_logs table was created
-- ============================================================================

-- ============================================================================
-- STEP 1: Insert completion logs for completed trips that don't have one
-- ============================================================================

INSERT INTO public.trip_completion_logs (
  trip_id,
  user_id,
  final_profit,
  reserve_released,
  trip_spend_released,
  business_account_released,
  total_advance_received,
  total_expenses,
  breakdown,
  completed_at,
  created_at
)
SELECT
  t.id as trip_id,
  t.user_id,
  COALESCE(t.released_profit, 0) as final_profit,
  -- Since we don't have historical breakdown data, we show all profit as "released"
  -- but cannot break it down by source (reserve vs trip spend vs business)
  0 as reserve_released,
  0 as trip_spend_released,
  COALESCE(t.released_profit, 0) as business_account_released,
  COALESCE(t.total_advance_received, 0) as total_advance_received,
  COALESCE(
    (SELECT COALESCE(SUM(e.amount), 0) FROM public.expenses e WHERE e.trip_id = t.id),
    0
  ) as total_expenses,
  jsonb_build_object(
    'total_advance_received', COALESCE(t.total_advance_received, 0),
    'trip_reserve_balance', 0,
    'operating_account', 0,
    'business_account', 0,
    'total_expenses', COALESCE(
      (SELECT COALESCE(SUM(e.amount), 0) FROM public.expenses e WHERE e.trip_id = t.id),
      0
    ),
    'reserve_released', 0,
    'trip_spend_released', 0,
    'business_account_released', COALESCE(t.released_profit, 0),
    'final_profit', COALESCE(t.released_profit, 0),
    'completion_formula', 'Total Profit (breakdown unavailable for legacy trips)',
    'note', 'Backfilled from existing completed trip - detailed breakdown not available'
  ) as breakdown,
  COALESCE(t.updated_at, t.created_at) as completed_at,
  NOW() as created_at
FROM public.trips t
WHERE t.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM public.trip_completion_logs tcl
    WHERE tcl.trip_id = t.id
  );

-- ============================================================================
-- Success message
-- ============================================================================

DO $$
DECLARE
  inserted_count INTEGER;
BEGIN
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled % completion log(s) for existing completed trips', inserted_count;
END $$;

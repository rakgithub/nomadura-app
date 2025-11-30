-- ============================================================================
-- Migration: Cleanup Completed Trip Balances
-- ============================================================================
-- Zeroes out trip_reserve_balance, operating_account, and business_account
-- for all trips that are already completed
-- ============================================================================

-- ============================================================================
-- STEP 1: Zero out balances for completed trips
-- ============================================================================

UPDATE public.trips
SET
  trip_reserve_balance = 0,
  operating_account = 0,
  business_account = 0,
  updated_at = NOW()
WHERE status = 'completed'
  AND (
    trip_reserve_balance != 0
    OR operating_account != 0
    OR business_account != 0
  );

-- ============================================================================
-- Success message
-- ============================================================================

DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Cleaned up % completed trip(s) with non-zero balances', updated_count;
END $$;

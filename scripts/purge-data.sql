-- ============================================================================
-- PURGE ALL DATA - Standalone Script
-- ============================================================================
-- Run this directly in Supabase SQL Editor to delete all data
-- WARNING: This is irreversible! Use only for development/testing.
-- ============================================================================

-- ============================================================================
-- STEP 1: Delete all data (order matters due to foreign keys)
-- ============================================================================
-- Delete child records first (those with foreign keys pointing to other tables)
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.advance_payments CASCADE;
TRUNCATE TABLE public.expenses CASCADE;
TRUNCATE TABLE public.participants CASCADE;
TRUNCATE TABLE public.trip_completion_logs CASCADE;

-- Delete parent tables
TRUNCATE TABLE public.trips CASCADE;
TRUNCATE TABLE public.business_expenses CASCADE;
TRUNCATE TABLE public.withdrawals CASCADE;
TRUNCATE TABLE public.transfers CASCADE;
TRUNCATE TABLE public.destinations CASCADE;
TRUNCATE TABLE public.settings CASCADE;

-- ============================================================================
-- STEP 2: Verification - Check record counts
-- ============================================================================
SELECT
  'trips' as table_name,
  COUNT(*) as record_count
FROM public.trips
UNION ALL
SELECT 'participants', COUNT(*) FROM public.participants
UNION ALL
SELECT 'payments', COUNT(*) FROM public.payments
UNION ALL
SELECT 'advance_payments', COUNT(*) FROM public.advance_payments
UNION ALL
SELECT 'expenses', COUNT(*) FROM public.expenses
UNION ALL
SELECT 'trip_completion_logs', COUNT(*) FROM public.trip_completion_logs
UNION ALL
SELECT 'business_expenses', COUNT(*) FROM public.business_expenses
UNION ALL
SELECT 'withdrawals', COUNT(*) FROM public.withdrawals
UNION ALL
SELECT 'transfers', COUNT(*) FROM public.transfers
UNION ALL
SELECT 'destinations', COUNT(*) FROM public.destinations
UNION ALL
SELECT 'settings', COUNT(*) FROM public.settings;

-- All counts should be 0

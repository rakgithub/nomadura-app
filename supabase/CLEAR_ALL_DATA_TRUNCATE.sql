-- ============================================
-- CLEAR ALL DATA - TRUNCATE Version (Faster)
-- WARNING: This will DELETE ALL DATA from all tables
-- Use this to start fresh with real data
-- ============================================

-- TRUNCATE is faster than DELETE and resets sequences
-- CASCADE automatically handles foreign key dependencies

-- ⚠️ WARNING: THIS CANNOT BE UNDONE! ⚠️

-- Clear all data with CASCADE (handles foreign keys automatically)
TRUNCATE TABLE
  public.trips,
  public.participants,
  public.payments,
  public.expenses,
  public.business_expenses,
  public.withdrawals
CASCADE;

-- ============================================
-- Verify all tables are empty
-- ============================================

SELECT
  'trips' as table_name,
  COUNT(*) as row_count
FROM public.trips

UNION ALL

SELECT
  'participants' as table_name,
  COUNT(*) as row_count
FROM public.participants

UNION ALL

SELECT
  'payments' as table_name,
  COUNT(*) as row_count
FROM public.payments

UNION ALL

SELECT
  'expenses' as table_name,
  COUNT(*) as row_count
FROM public.expenses

UNION ALL

SELECT
  'business_expenses' as table_name,
  COUNT(*) as row_count
FROM public.business_expenses

UNION ALL

SELECT
  'withdrawals' as table_name,
  COUNT(*) as row_count
FROM public.withdrawals;

-- ============================================
-- All tables should show 0 rows
-- ============================================

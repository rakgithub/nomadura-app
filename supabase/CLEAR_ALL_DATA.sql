-- ============================================
-- CLEAR ALL DATA - Testing Script
-- WARNING: This will DELETE ALL DATA from all tables
-- Use this to start fresh with real data
-- ============================================

-- IMPORTANT: This script deletes ALL data but keeps the table structures
-- Make sure you want to do this before running!

-- Disable triggers temporarily for faster deletion
SET session_replication_role = 'replica';

-- Delete data in correct order (respecting foreign key constraints)
-- ============================================

-- 1. Delete payments (references participants)
DELETE FROM public.payments;

-- 2. Delete participants (references trips)
DELETE FROM public.participants;

-- 3. Delete expenses (references trips)
DELETE FROM public.expenses;

-- 4. Delete trips
DELETE FROM public.trips;

-- 5. Delete business expenses (independent table)
DELETE FROM public.business_expenses;

-- 6. Delete withdrawals (independent table)
DELETE FROM public.withdrawals;

-- Re-enable triggers
SET session_replication_role = 'origin';

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
-- Result should show 0 rows for all tables
-- ============================================

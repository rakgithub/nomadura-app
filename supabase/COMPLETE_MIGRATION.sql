-- ============================================
-- COMPLETE MIGRATION - All Features
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- ============================================
-- Part 1: Business Expenses & Withdrawals
-- (Fund Separation Feature)
-- ============================================

-- Create business expense category enum (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_expense_category') THEN
        CREATE TYPE business_expense_category AS ENUM (
          'rent',
          'software',
          'marketing',
          'insurance',
          'other'
        );
    END IF;
END $$;

-- Create business_expenses table
CREATE TABLE IF NOT EXISTS public.business_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category business_expense_category NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_business_expenses_user_id ON public.business_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_business_expenses_date ON public.business_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_business_expenses_category ON public.business_expenses(category);

-- Enable Row Level Security
ALTER TABLE public.business_expenses ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create it
DROP POLICY IF EXISTS "Users can manage their own business expenses" ON public.business_expenses;
CREATE POLICY "Users can manage their own business expenses"
  ON public.business_expenses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Drop existing trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_business_expenses_updated_at ON public.business_expenses;
CREATE TRIGGER update_business_expenses_updated_at
  BEFORE UPDATE ON public.business_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  withdrawal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_date ON public.withdrawals(withdrawal_date);

-- Enable Row Level Security
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create it
DROP POLICY IF EXISTS "Users can manage their own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can manage their own withdrawals"
  ON public.withdrawals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Drop existing trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON public.withdrawals;
CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Part 2: Destinations Feature
-- ============================================

-- Create destinations table
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  country VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_destinations_user_id ON public.destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_destinations_name ON public.destinations(name);

-- Enable Row Level Security
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create it
DROP POLICY IF EXISTS "Users can manage their own destinations" ON public.destinations;
CREATE POLICY "Users can manage their own destinations"
  ON public.destinations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Drop existing trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_destinations_updated_at ON public.destinations;
CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Part 3: Migrate existing destination data
-- ============================================

-- Migrate existing destination data from trips table
-- This creates destination records for unique destination names
INSERT INTO public.destinations (user_id, name)
SELECT DISTINCT
  t.user_id,
  t.destination
FROM public.trips t
WHERE t.destination IS NOT NULL
  AND t.destination != ''
ON CONFLICT (user_id, name) DO NOTHING;

-- Add destination_id column to trips table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'trips'
        AND column_name = 'destination_id'
    ) THEN
        ALTER TABLE public.trips
            ADD COLUMN destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Update trips to reference the new destinations
UPDATE public.trips t
SET destination_id = d.id
FROM public.destinations d
WHERE t.user_id = d.user_id
  AND t.destination = d.name
  AND t.destination IS NOT NULL
  AND t.destination_id IS NULL;

-- Create index on destination_id
CREATE INDEX IF NOT EXISTS idx_trips_destination_id ON public.trips(destination_id);

-- ============================================
-- Verification
-- ============================================

-- Check that all tables exist
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_expenses') THEN 'business_expenses ✓'
    ELSE 'business_expenses ✗'
  END as table_check

UNION ALL

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'withdrawals') THEN 'withdrawals ✓'
    ELSE 'withdrawals ✗'
  END

UNION ALL

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destinations') THEN 'destinations ✓'
    ELSE 'destinations ✗'
  END

UNION ALL

SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'trips' AND column_name = 'destination_id'
    ) THEN 'trips.destination_id ✓'
    ELSE 'trips.destination_id ✗'
  END;

-- ============================================
-- Part 4: Update Trip Status Enum
-- ============================================

-- Update trip_status enum to have only 4 statuses
-- From: planning, confirmed, in_progress, completed, cancelled
-- To: upcoming, in_progress, completed, cancelled

-- Step 1: Add new enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trip_status_new') THEN
        CREATE TYPE trip_status_new AS ENUM (
          'upcoming',
          'in_progress',
          'completed',
          'cancelled'
        );
    END IF;
END $$;

-- Step 2: Add temporary column with new type (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trips' AND column_name = 'status_new'
    ) THEN
        ALTER TABLE public.trips ADD COLUMN status_new trip_status_new;
    END IF;
END $$;

-- Step 3: Migrate data
-- Map 'planning' and 'confirmed' to 'upcoming'
UPDATE public.trips
SET status_new = CASE
  WHEN status::text = 'planning' THEN 'upcoming'::trip_status_new
  WHEN status::text = 'confirmed' THEN 'upcoming'::trip_status_new
  WHEN status::text = 'in_progress' THEN 'in_progress'::trip_status_new
  WHEN status::text = 'completed' THEN 'completed'::trip_status_new
  WHEN status::text = 'cancelled' THEN 'cancelled'::trip_status_new
  ELSE 'upcoming'::trip_status_new
END
WHERE status_new IS NULL;

-- Step 4: Drop old column and rename
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trips' AND column_name = 'status'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'trips' AND column_name = 'status_new'
    ) THEN
        ALTER TABLE public.trips DROP COLUMN status;
        ALTER TABLE public.trips RENAME COLUMN status_new TO status;
    END IF;
END $$;

-- Step 5: Set default for new trips
ALTER TABLE public.trips ALTER COLUMN status SET DEFAULT 'upcoming'::trip_status_new;

-- Step 6: Clean up old enum if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trip_status') THEN
        -- Only drop if not in use
        DROP TYPE IF EXISTS trip_status CASCADE;
    END IF;
END $$;

-- Step 7: Rename new enum type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trip_status_new') THEN
        ALTER TYPE trip_status_new RENAME TO trip_status;
    END IF;
END $$;

-- ============================================
-- End of migrations
-- All features are now installed!
-- ============================================

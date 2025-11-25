-- ============================================
-- Fund Separation Feature Migrations (SAFE VERSION)
-- Run this SQL in your Supabase SQL Editor
-- Handles cases where types/tables may already exist
-- ============================================

-- Migration 006: Business Expenses
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

-- Create indexes (only if they don't exist)
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

-- Migration 007: Withdrawals
-- ============================================

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

-- Create indexes (only if they don't exist)
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
-- End of migrations
-- ============================================

-- Verify tables were created
SELECT 'business_expenses table created' as status
WHERE EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'business_expenses'
);

SELECT 'withdrawals table created' as status
WHERE EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'withdrawals'
);

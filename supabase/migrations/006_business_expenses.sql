-- Create business expense category enum
CREATE TYPE business_expense_category AS ENUM (
  'rent',
  'software',
  'marketing',
  'insurance',
  'other'
);

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

-- RLS Policy: Users can only manage their own business expenses
CREATE POLICY "Users can manage their own business expenses"
  ON public.business_expenses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_business_expenses_updated_at
  BEFORE UPDATE ON public.business_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

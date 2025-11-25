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

-- RLS Policy: Users can only manage their own withdrawals
CREATE POLICY "Users can manage their own withdrawals"
  ON public.withdrawals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

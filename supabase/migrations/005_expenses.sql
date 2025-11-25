-- Create expense category enum
CREATE TYPE expense_category AS ENUM (
  'transport',
  'accommodation',
  'food',
  'activities',
  'guide',
  'equipment',
  'permits',
  'insurance',
  'other'
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category expense_category NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage expenses for their trips
CREATE POLICY "Users can manage expenses for their trips"
  ON public.expenses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

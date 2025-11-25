-- Create trip status enum
CREATE TYPE trip_status AS ENUM (
  'planning',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
);

-- Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  destination VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status trip_status DEFAULT 'planning',
  expected_participants INTEGER,
  budgeted_expenses DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_start_date ON public.trips(start_date);

-- Enable Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Owner can do everything with their trips
CREATE POLICY "Owner full access to trips"
  ON public.trips
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

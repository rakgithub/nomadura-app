-- Create participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  amount_paid DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_participants_trip_id ON public.participants(trip_id);

-- Enable Row Level Security
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage participants for their trips
CREATE POLICY "Users can manage participants for their trips"
  ON public.participants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = participants.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = participants.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

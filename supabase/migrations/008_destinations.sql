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

-- RLS Policy: Users can only manage their own destinations
CREATE POLICY "Users can manage their own destinations"
  ON public.destinations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

-- Add destination_id column to trips table
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL;

-- Update trips to reference the new destinations
UPDATE public.trips t
SET destination_id = d.id
FROM public.destinations d
WHERE t.user_id = d.user_id
  AND t.destination = d.name
  AND t.destination IS NOT NULL;

-- Create index on destination_id
CREATE INDEX IF NOT EXISTS idx_trips_destination_id ON public.trips(destination_id);

-- Note: We keep the old destination column for now as a backup
-- You can drop it later once you verify everything works:
-- ALTER TABLE public.trips DROP COLUMN destination;

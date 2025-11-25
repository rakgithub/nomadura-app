-- Add price_per_participant to trips
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS price_per_participant DECIMAL(12, 2);

-- Rename expected_participants to max_participants
ALTER TABLE public.trips
RENAME COLUMN expected_participants TO max_participants;

-- Remove budgeted_expenses (will calculate from expenses later)
ALTER TABLE public.trips
DROP COLUMN IF EXISTS budgeted_expenses;

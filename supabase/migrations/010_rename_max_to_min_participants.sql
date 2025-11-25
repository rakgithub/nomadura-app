-- Rename max_participants to min_participants
-- The field represents the minimum number of participants needed for a trip
ALTER TABLE public.trips
RENAME COLUMN max_participants TO min_participants;

-- Add comment to clarify the purpose
COMMENT ON COLUMN public.trips.min_participants IS 'Minimum number of participants required for the trip to proceed';

-- Update trip_status enum to have only 4 statuses
-- From: planning, confirmed, in_progress, completed, cancelled
-- To: upcoming, in_progress, completed, cancelled

-- Step 1: Add new enum type
CREATE TYPE trip_status_new AS ENUM (
  'upcoming',
  'in_progress',
  'completed',
  'cancelled'
);

-- Step 2: Add temporary column with new type
ALTER TABLE public.trips
  ADD COLUMN status_new trip_status_new;

-- Step 3: Migrate data
-- Map 'planning' and 'confirmed' to 'upcoming'
UPDATE public.trips
SET status_new = CASE
  WHEN status = 'planning' THEN 'upcoming'::trip_status_new
  WHEN status = 'confirmed' THEN 'upcoming'::trip_status_new
  WHEN status = 'in_progress' THEN 'in_progress'::trip_status_new
  WHEN status = 'completed' THEN 'completed'::trip_status_new
  WHEN status = 'cancelled' THEN 'cancelled'::trip_status_new
  ELSE 'upcoming'::trip_status_new
END;

-- Step 4: Drop old column
ALTER TABLE public.trips DROP COLUMN status;

-- Step 5: Rename new column to status
ALTER TABLE public.trips RENAME COLUMN status_new TO status;

-- Step 6: Set default for new trips
ALTER TABLE public.trips ALTER COLUMN status SET DEFAULT 'upcoming'::trip_status_new;

-- Step 7: Drop old enum type
DROP TYPE trip_status;

-- Step 8: Rename new enum type
ALTER TYPE trip_status_new RENAME TO trip_status;

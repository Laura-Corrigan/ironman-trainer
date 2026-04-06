-- Ironman Trainer — Supabase schema
-- Run this in the Supabase SQL editor to set up the database

-- Workout tracking table
-- Each row is one workout slot (e.g. week 0, day 1 = "0-1")
CREATE TABLE IF NOT EXISTS workouts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  week_day TEXT UNIQUE NOT NULL,        -- "0-1", "0-2", etc (week index - day index)
  completed_at BIGINT,                   -- Unix timestamp when marked complete (null = not done)
  metrics JSONB,                         -- { dur, dist, hr, power, pace, cal, notes }
  rpe TEXT,                              -- "1" to "10"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_workouts_week_day ON workouts(week_day);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security (optional but recommended)
-- For a single-user app, you can keep it simple:
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anonymous users
-- (since this is a single-user app, the anon key is fine)
CREATE POLICY "Allow all" ON workouts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add amount and deadline columns to cases table
-- This migration is idempotent (safe to run multiple times)

-- Add amount column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'amount'
  ) THEN
    ALTER TABLE cases ADD COLUMN amount DECIMAL(10, 2);
  END IF;
END $$;

-- Add deadline column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'deadline'
  ) THEN
    ALTER TABLE cases ADD COLUMN deadline DATE;
  END IF;
END $$;

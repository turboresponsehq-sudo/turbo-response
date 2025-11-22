-- NOTE: Applied manually to production on 2025-11-13 – keep for history
-- Add Missing Case Columns Migration
-- Adds all missing columns to cases table for full case detail display
-- This migration is idempotent (safe to run multiple times)

-- Add full_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE cases ADD COLUMN full_name VARCHAR(255);
  END IF;
END $$;

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'email'
  ) THEN
    ALTER TABLE cases ADD COLUMN email VARCHAR(255);
  END IF;
END $$;

-- Add phone column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'phone'
  ) THEN
    ALTER TABLE cases ADD COLUMN phone VARCHAR(50);
  END IF;
END $$;

-- Add address column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'address'
  ) THEN
    ALTER TABLE cases ADD COLUMN address TEXT;
  END IF;
END $$;

-- Add case_details column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'case_details'
  ) THEN
    ALTER TABLE cases ADD COLUMN case_details TEXT;
  END IF;
END $$;

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

-- Add documents column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'documents'
  ) THEN
    ALTER TABLE cases ADD COLUMN documents JSONB DEFAULT '[]';
  END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE cases ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE cases ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

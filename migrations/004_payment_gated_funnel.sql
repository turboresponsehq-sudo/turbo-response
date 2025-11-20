-- Migration: Payment-Gated Funnel System
-- Date: 2025-11-19
-- Description: Adds funnel stages, payment tracking, and timeline system

-- Add funnel stage and payment tracking columns
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS funnel_stage VARCHAR(50) DEFAULT 'Lead Submitted',
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20),
ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS payment_verified_by INTEGER,
ADD COLUMN IF NOT EXISTS client_account_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS client_user_id INTEGER;

-- Create case timeline table
CREATE TABLE IF NOT EXISTS case_timeline (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  metadata JSONB
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_funnel_stage ON cases(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_cases_payment_verified ON cases(payment_verified);
CREATE INDEX IF NOT EXISTS idx_timeline_case_id ON case_timeline(case_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON case_timeline(created_at DESC);

-- Set default funnel stage for existing cases based on old status
UPDATE cases 
SET funnel_stage = CASE
  WHEN status = 'Completed' THEN 'Active Case'
  WHEN status = 'In Review' THEN 'Active Case'
  WHEN status = 'Awaiting Client' THEN 'Awaiting Payment'
  ELSE 'Lead Submitted'
END
WHERE funnel_stage IS NULL OR funnel_stage = 'Lead Submitted';

-- Create initial timeline events for existing cases
INSERT INTO case_timeline (case_id, event_type, description, created_at)
SELECT id, 'case_created', 'Case submitted via intake form', created_at
FROM cases
WHERE NOT EXISTS (
  SELECT 1 FROM case_timeline WHERE case_timeline.case_id = cases.id
);

-- Verify new columns and table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cases'
AND column_name IN ('funnel_stage', 'payment_method', 'payment_verified', 'payment_verified_at', 'payment_verified_by', 'client_account_created', 'client_user_id')
ORDER BY column_name;

SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'case_timeline'
ORDER BY ordinal_position;

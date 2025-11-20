-- Migration: Add Client Portal Columns
-- Date: 2025-11-19
-- Description: Adds client portal fields to cases table

-- Add client portal columns
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS client_status TEXT,
ADD COLUMN IF NOT EXISTS client_notes TEXT,
ADD COLUMN IF NOT EXISTS payment_link TEXT,
ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT TRUE;

-- Create index for faster portal access queries
CREATE INDEX IF NOT EXISTS idx_cases_portal_enabled ON cases(portal_enabled);

-- Set default values for existing cases
UPDATE cases 
SET portal_enabled = TRUE 
WHERE portal_enabled IS NULL;

UPDATE cases 
SET client_status = 'Under Review' 
WHERE client_status IS NULL;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cases'
AND column_name IN ('client_status', 'client_notes', 'payment_link', 'portal_enabled')
ORDER BY column_name;

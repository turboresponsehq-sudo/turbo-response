-- Migration: Add Pricing Tier System
-- Date: 2025-11-19
-- Description: Adds pricing tier fields for 4-tier pricing structure

-- Add pricing tier columns to cases table
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS pricing_tier VARCHAR(20),
ADD COLUMN IF NOT EXISTS pricing_tier_amount INTEGER,
ADD COLUMN IF NOT EXISTS pricing_tier_name VARCHAR(100);

-- Create index for pricing tier queries
CREATE INDEX IF NOT EXISTS idx_cases_pricing_tier ON cases(pricing_tier);

-- Set default pricing tier for existing cases
UPDATE cases 
SET pricing_tier = 'foundation',
    pricing_tier_amount = 349,
    pricing_tier_name = 'Foundation Case Strategy'
WHERE pricing_tier IS NULL;

-- Update amount column for cases that have it set
UPDATE cases
SET pricing_tier_amount = CAST(REPLACE(REPLACE(amount, '$', ''), ',', '') AS INTEGER)
WHERE amount IS NOT NULL 
  AND amount != ''
  AND pricing_tier_amount IS NULL;

-- Verify new columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cases'
AND column_name IN ('pricing_tier', 'pricing_tier_amount', 'pricing_tier_name')
ORDER BY column_name;

-- Show sample data
SELECT id, case_number, pricing_tier, pricing_tier_amount, pricing_tier_name
FROM cases
LIMIT 5;

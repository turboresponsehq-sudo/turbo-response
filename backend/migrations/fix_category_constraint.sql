-- Fix category constraint to match frontend categories
-- Drop old constraint
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_category_check;

-- Add new constraint with all 8 categories
ALTER TABLE cases ADD CONSTRAINT cases_category_check 
  CHECK (category IN ('eviction', 'debt', 'irs', 'wage', 'medical', 'benefits', 'auto', 'consumer'));

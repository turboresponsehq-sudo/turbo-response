-- Migration: Change pricing_suggestion from NUMERIC to TEXT
-- Reason: AI generates descriptive pricing ranges like "$80-$1,600" which cannot be stored in NUMERIC column
-- Date: 2024-11-17

-- Change pricing_suggestion column type from NUMERIC to TEXT
ALTER TABLE case_analyses 
  ALTER COLUMN pricing_suggestion 
  TYPE text 
  USING pricing_suggestion::text;

-- Also change estimated_value to TEXT for consistency (AI may return ranges)
ALTER TABLE case_analyses 
  ALTER COLUMN estimated_value 
  TYPE text 
  USING estimated_value::text;

-- Add comment to document the change
COMMENT ON COLUMN case_analyses.pricing_suggestion IS 'AI-generated pricing suggestion (text format to support ranges like "$80-$1,600")';
COMMENT ON COLUMN case_analyses.estimated_value IS 'AI-generated estimated value (text format to support ranges and descriptive values)';

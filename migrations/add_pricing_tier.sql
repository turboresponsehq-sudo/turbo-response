-- Add pricing_tier column to case_analyses table
-- Part of Deterministic Pricing Engine v1.0 implementation

ALTER TABLE case_analyses 
ADD COLUMN IF NOT EXISTS pricing_tier VARCHAR(20); -- 'standard' | 'high' | 'extreme'

-- Add comment for documentation
COMMENT ON COLUMN case_analyses.pricing_tier IS 'Pricing tier from deterministic engine: standard ($149-$799), high ($800-$1,499), extreme ($1,500+)';

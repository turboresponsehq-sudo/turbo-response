-- Add missing fields to business_intakes table
ALTER TABLE business_intakes
ADD COLUMN IF NOT EXISTS estimated_amount VARCHAR(255),
ADD COLUMN IF NOT EXISTS case_description TEXT,
ADD COLUMN IF NOT EXISTS primary_goal VARCHAR(255),
ADD COLUMN IF NOT EXISTS target_authority VARCHAR(255),
ADD COLUMN IF NOT EXISTS stage VARCHAR(255),
ADD COLUMN IF NOT EXISTS deadline VARCHAR(255);

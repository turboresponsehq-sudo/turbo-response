-- Business Submissions Table Migration
-- Creates table for storing business intake form submissions

CREATE TABLE IF NOT EXISTS business_submissions (
  id SERIAL PRIMARY KEY,
  
  -- Contact Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  
  -- Digital Presence
  website_url TEXT NOT NULL,
  instagram_url TEXT,
  tiktok_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  link_in_bio TEXT,
  
  -- Business Snapshot
  what_you_sell TEXT NOT NULL,
  ideal_customer TEXT NOT NULL,
  biggest_struggle TEXT NOT NULL,
  short_term_goal TEXT NOT NULL,
  
  -- Vision
  long_term_vision TEXT NOT NULL,
  
  -- File Uploads (S3 URLs)
  brand_assets_url TEXT,
  pricing_sheet_url TEXT,
  
  -- Consent
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Blueprint Generation
  blueprint_generated BOOLEAN NOT NULL DEFAULT FALSE,
  blueprint_data JSONB,
  blueprint_generated_at TIMESTAMP,
  
  -- Status Tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Status values: 'pending', 'reviewed', 'blueprint_generated', 'completed', 'archived'
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Admin Notes
  admin_notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_submissions_email ON business_submissions(email);
CREATE INDEX IF NOT EXISTS idx_business_submissions_status ON business_submissions(status);
CREATE INDEX IF NOT EXISTS idx_business_submissions_created_at ON business_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_submissions_blueprint_generated ON business_submissions(blueprint_generated);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_business_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_submissions_updated_at
BEFORE UPDATE ON business_submissions
FOR EACH ROW
EXECUTE FUNCTION update_business_submissions_updated_at();

-- Comments for documentation
COMMENT ON TABLE business_submissions IS 'Stores business intake form submissions for AI strategy blueprint generation';
COMMENT ON COLUMN business_submissions.blueprint_data IS 'JSON object containing the 5-section AI-generated strategy blueprint';
COMMENT ON COLUMN business_submissions.status IS 'Workflow status: pending, reviewed, blueprint_generated, completed, archived';

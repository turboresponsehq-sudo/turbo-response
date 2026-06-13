-- Migration 006: Add Command Center fields to cases table
-- Adds drive_folder_link, internal_notes, and priority for the Command Center dashboard

-- Add Google Drive folder link per case
ALTER TABLE cases ADD COLUMN IF NOT EXISTS drive_folder_link TEXT;

-- Add internal admin notes (from phone calls, meetings, etc.)
ALTER TABLE cases ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Add priority level for triage
ALTER TABLE cases ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' 
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Add timeline/milestone tracking as JSON array
ALTER TABLE cases ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]';

-- Create index for priority filtering
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);

-- Verify
SELECT 'Migration 006 complete' AS status;

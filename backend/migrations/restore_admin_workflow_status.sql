-- Restore Admin Workflow Status Values
-- Based on authoritative specification from Chief Strategist
-- Date: November 12, 2025

-- Step 1: Drop existing status constraint
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_status_check;

-- Step 2: Update existing data to new status values
UPDATE cases SET status = 'Pending Review' WHERE status = 'pending';
UPDATE cases SET status = 'Completed' WHERE status = 'completed';
UPDATE cases SET status = 'Rejected' WHERE status = 'cancelled';
UPDATE cases SET status = 'In Review' WHERE status = 'processing';

-- Step 3: Add new status constraint with exact specification values
ALTER TABLE cases ADD CONSTRAINT cases_status_check 
  CHECK (status IN ('Pending Review', 'In Review', 'Awaiting Client', 'Completed', 'Rejected'));

-- Step 4: Update default status value
ALTER TABLE cases ALTER COLUMN status SET DEFAULT 'Pending Review';

-- Verification query (run after migration)
-- SELECT DISTINCT status FROM cases ORDER BY status;

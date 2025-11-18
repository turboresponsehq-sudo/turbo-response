-- Drop old status constraint
ALTER TABLE cases DROP CONSTRAINT IF EXISTS cases_status_check;

-- Add correct Turbo Response admin workflow statuses
ALTER TABLE cases
ADD CONSTRAINT cases_status_check
CHECK (status IN (
    'Pending Review',
    'In Review',
    'Awaiting Client',
    'Completed',
    'Rejected'
));

-- Normalize legacy statuses
UPDATE cases SET status = 'Pending Review' WHERE status = 'pending';
UPDATE cases SET status = 'In Review'        WHERE status = 'processing';
UPDATE cases SET status = 'Completed'        WHERE status = 'completed';
UPDATE cases SET status = 'Rejected'         WHERE status = 'cancelled';

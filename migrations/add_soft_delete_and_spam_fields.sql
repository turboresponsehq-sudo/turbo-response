-- Migration: Add soft delete, status workflow, and spam protection fields to resource_requests
-- Date: 2026-02-09
-- Purpose: Enable admin soft-delete with audit trail + spam protection

-- Add soft delete fields
ALTER TABLE resource_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE resource_requests ADD COLUMN IF NOT EXISTS deleted_by TEXT DEFAULT NULL;
ALTER TABLE resource_requests ADD COLUMN IF NOT EXISTS delete_reason TEXT DEFAULT NULL;

-- Add spam protection fields
ALTER TABLE resource_requests ADD COLUMN IF NOT EXISTS ip_address TEXT DEFAULT NULL;
ALTER TABLE resource_requests ADD COLUMN IF NOT EXISTS honeypot_triggered BOOLEAN DEFAULT FALSE;

-- Update status column to support workflow: new, reviewed, spam, deleted
-- (status column already exists with TEXT type, just ensure default is 'new')
UPDATE resource_requests SET status = 'new' WHERE status = 'pending' OR status IS NULL;

-- Create index on deleted_at for filtering
CREATE INDEX IF NOT EXISTS idx_resource_requests_deleted_at ON resource_requests(deleted_at);

-- Create index on ip_address for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_resource_requests_ip_address ON resource_requests(ip_address);

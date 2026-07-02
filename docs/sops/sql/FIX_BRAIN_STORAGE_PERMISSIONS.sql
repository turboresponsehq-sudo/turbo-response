-- Fix brain-docs Storage Bucket Permissions
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- Step 1: Make the brain-docs bucket public
UPDATE storage.buckets
SET public = true
WHERE name = 'brain-docs';

-- Step 2: Add storage policy to allow public read access
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Create new policy for public read access to brain-docs
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'brain-docs');

-- Step 3: Add policy to allow authenticated uploads (optional, for future use)
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brain-docs' AND auth.role() = 'authenticated');

-- Step 4: Add policy to allow authenticated deletes (optional, for future use)
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'brain-docs' AND auth.role() = 'authenticated');

-- Verification query - check bucket status
SELECT name, public, created_at
FROM storage.buckets
WHERE name = 'brain-docs';

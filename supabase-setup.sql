-- Supabase Setup for Turbo Brain System
-- Run this SQL in your Supabase SQL Editor

-- 1. Create brain_documents table
CREATE TABLE IF NOT EXISTS brain_documents (
    id              BIGSERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT NULL,
    file_url        TEXT NOT NULL,
    mime_type       TEXT NULL,
    size_bytes      BIGINT NULL,
    source          TEXT DEFAULT 'upload',
    
    relevance_score INTEGER,
    is_outdated     BOOLEAN DEFAULT FALSE,
    is_duplicate    BOOLEAN DEFAULT FALSE,
    is_archived     BOOLEAN DEFAULT FALSE,

    usage_count     INTEGER DEFAULT 0,
    last_used_at    TIMESTAMPTZ NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brain_documents_created_at
    ON brain_documents (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_brain_documents_relevance
    ON brain_documents (relevance_score DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_brain_documents_is_archived
    ON brain_documents (is_archived);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE brain_documents ENABLE ROW LEVEL SECURITY;

-- 4. Create policy for service role (backend access)
CREATE POLICY "Service role has full access to brain_documents"
    ON brain_documents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. Create storage bucket (run this in Supabase Dashboard > Storage)
-- Bucket name: brain-docs
-- Public: false (private by default)
-- File size limit: 50MB
-- Allowed MIME types: application/pdf, text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

-- Note: You'll need to create the bucket manually in Supabase Dashboard
-- Then set up storage policies for the bucket

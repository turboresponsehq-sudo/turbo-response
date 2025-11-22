-- Migration: Create case_messages table for client-admin communication
-- PostgreSQL compatible version
-- This table stores all messages between clients and admins for each case
-- Structured for future AI analysis and summarization

CREATE TABLE IF NOT EXISTS case_messages (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('client', 'admin')),
  sender_name VARCHAR(255), -- Name of the person who sent the message
  message_text TEXT, -- Nullable if only file is sent
  file_path TEXT, -- S3 URL or file path, nullable if only text
  file_name VARCHAR(255), -- Original filename for display
  file_type VARCHAR(50), -- MIME type (e.g., 'application/pdf', 'image/jpeg')
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure at least one of message_text or file_path is present
  CONSTRAINT message_or_file_required CHECK (
    message_text IS NOT NULL OR file_path IS NOT NULL
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_messages_case_id ON case_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_case_messages_created_at ON case_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_case_messages_sender ON case_messages(sender);

-- Composite index for fetching messages by case in chronological order
CREATE INDEX IF NOT EXISTS idx_case_messages_case_created ON case_messages(case_id, created_at DESC);

-- Add unread_messages_count to cases table for admin notification
ALTER TABLE cases ADD COLUMN IF NOT EXISTS unread_messages_count INTEGER DEFAULT 0;

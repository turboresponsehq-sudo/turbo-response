-- Fix brain_documents table schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- Add file_url if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='brain_documents' AND column_name='file_url') THEN
    ALTER TABLE brain_documents ADD COLUMN file_url TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add mime_type if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='brain_documents' AND column_name='mime_type') THEN
    ALTER TABLE brain_documents ADD COLUMN mime_type VARCHAR(100);
  END IF;
END $$;

-- Add size_bytes if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='brain_documents' AND column_name='size_bytes') THEN
    ALTER TABLE brain_documents ADD COLUMN size_bytes INTEGER;
  END IF;
END $$;

-- Add source if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='brain_documents' AND column_name='source') THEN
    ALTER TABLE brain_documents ADD COLUMN source VARCHAR(50) DEFAULT 'upload';
  END IF;
END $$;

-- Add is_archived if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='brain_documents' AND column_name='is_archived') THEN
    ALTER TABLE brain_documents ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

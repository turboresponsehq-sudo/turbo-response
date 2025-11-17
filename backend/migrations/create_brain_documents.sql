-- Brain Upload System - Phase 1 Database Schema
-- Multi-domain knowledge repository for Turbo Response

-- Create brain_documents table
CREATE TABLE IF NOT EXISTS brain_documents (
  id SERIAL PRIMARY KEY,
  
  -- Document Identity
  title VARCHAR(500) NOT NULL,
  filename VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- pdf, txt, image, docx, link
  file_size INTEGER,
  
  -- Multi-Domain Classification
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  tags TEXT[], -- Array of searchable tags
  domain VARCHAR(100) NOT NULL, -- consumer-rights, business-client, internal-strategy, legal, marketing, automation, training, industry-specific
  
  -- Content & Processing
  content_text TEXT, -- Extracted text content
  summary TEXT, -- AI-generated summary (future)
  chunk_count INTEGER DEFAULT 0, -- Number of vector chunks (Phase 2)
  processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  
  -- Metadata
  uploaded_by VARCHAR(100),
  client_id INTEGER, -- Optional: link to specific client
  is_public BOOLEAN DEFAULT false,
  visibility VARCHAR(50) DEFAULT 'private', -- private, internal, public
  
  -- Analytics
  access_count INTEGER DEFAULT 0, -- Track how many times retrieved
  last_accessed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_brain_category ON brain_documents(category);
CREATE INDEX IF NOT EXISTS idx_brain_domain ON brain_documents(domain);
CREATE INDEX IF NOT EXISTS idx_brain_tags ON brain_documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_brain_status ON brain_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_brain_created ON brain_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_visibility ON brain_documents(visibility);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_brain_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brain_documents_updated_at
BEFORE UPDATE ON brain_documents
FOR EACH ROW
EXECUTE FUNCTION update_brain_documents_updated_at();

-- Insert sample domains for reference (optional)
COMMENT ON COLUMN brain_documents.domain IS 'Supported domains: consumer-rights, business-client, internal-strategy, legal, marketing, automation, training, industry-specific';
COMMENT ON COLUMN brain_documents.visibility IS 'Access control: private (owner only), internal (team), public (all clients)';
COMMENT ON COLUMN brain_documents.processing_status IS 'Document processing state: pending, processing, completed, failed';

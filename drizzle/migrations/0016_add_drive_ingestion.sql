-- Create-only bounded Google Drive ingestion state.
-- The canonical Drive remains authoritative; no file content is stored here.

ALTER TABLE knowledge_documents
  ADD COLUMN IF NOT EXISTS drive_file_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS drive_mime_type VARCHAR(255),
  ADD COLUMN IF NOT EXISTS drive_modified_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS source_path TEXT,
  ADD COLUMN IF NOT EXISTS ingestion_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ingestion_error TEXT,
  ADD COLUMN IF NOT EXISTS ingested_at TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_documents_drive_file_id
  ON knowledge_documents (drive_file_id)
  WHERE drive_file_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS drive_ingestion_runs (
  id SERIAL PRIMARY KEY,
  root_folder_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'running',
  discovered_count INTEGER NOT NULL DEFAULT 0,
  imported_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  unchanged_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  unavailable_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drive_ingestion_folders (
  id SERIAL PRIMARY KEY,
  run_id INTEGER NOT NULL,
  folder_id VARCHAR(255) NOT NULL,
  parent_folder_id VARCHAR(255),
  source_path TEXT NOT NULL,
  next_page_token TEXT,
  scan_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  last_error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_drive_ingestion_folders_run_folder UNIQUE (run_id, folder_id)
);

CREATE INDEX IF NOT EXISTS idx_drive_ingestion_folders_run_status
  ON drive_ingestion_folders (run_id, scan_status, id);

CREATE TABLE IF NOT EXISTS drive_ingestion_items (
  id SERIAL PRIMARY KEY,
  drive_file_id VARCHAR(255) NOT NULL UNIQUE,
  knowledge_document_id INTEGER,
  last_seen_run_id INTEGER NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  mime_type VARCHAR(255) NOT NULL,
  source_path TEXT NOT NULL,
  source_url VARCHAR(1000),
  drive_modified_at TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  last_error TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drive_ingestion_items_run_status
  ON drive_ingestion_items (last_seen_run_id, status, id);

CREATE INDEX IF NOT EXISTS idx_drive_ingestion_items_drive_file
  ON drive_ingestion_items (drive_file_id);

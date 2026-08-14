-- Production-safe Command Center schema repair.
-- This migration is create-only and does not alter or delete existing relations or data.

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id serial PRIMARY KEY,
  title varchar(500) NOT NULL,
  category varchar(100) NOT NULL,
  subcategory varchar(100),
  source varchar(50) NOT NULL DEFAULT 'google_drive',
  source_system varchar(50) NOT NULL DEFAULT 'google_drive',
  "sourceUrl" varchar(1000),
  "fileType" varchar(50),
  content text,
  summary text,
  status varchar(50) NOT NULL DEFAULT 'active',
  "isProcessed" integer NOT NULL DEFAULT 0,
  "adminNotes" text,
  last_synced_at timestamp,
  xai_collection_id varchar(255),
  synced_to_xai integer NOT NULL DEFAULT 0,
  content_hash varchar(64),
  workspace_id integer,
  "dateAdded" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS turbo_signals (
  id serial PRIMARY KEY,
  company_name varchar(255) NOT NULL,
  website varchar(500),
  industry varchar(100),
  contact_name varchar(255),
  contact_role varchar(255),
  contact_email varchar(320),
  source_type varchar(50),
  source_link varchar(1000),
  signal_type varchar(50),
  date_captured varchar(50),
  notes text,
  ai_summary text,
  recommended_action text,
  opportunity_score integer,
  file_url text,
  file_name varchar(255),
  pipeline_id integer,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_opportunities (
  id serial PRIMARY KEY,
  signal_id integer,
  company_name varchar(255) NOT NULL,
  contact_name varchar(255),
  contact_email varchar(320),
  opportunity_score integer,
  recommended_action text,
  stage varchar(50) NOT NULL DEFAULT 'lead',
  value numeric(10, 2),
  next_step text,
  follow_up_date varchar(50),
  notes text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mission_tasks (
  id serial PRIMARY KEY,
  title varchar(500) NOT NULL,
  company_name varchar(255),
  contact_name varchar(255),
  signal_id integer,
  due_date varchar(50),
  priority varchar(50) NOT NULL DEFAULT 'medium',
  notes text,
  status varchar(50) NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspaces (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  type varchar(50) NOT NULL,
  description text,
  status varchar(50) NOT NULL DEFAULT 'planning',
  priority varchar(50) NOT NULL DEFAULT 'normal',
  assigned_to varchar(255),
  due_date varchar(50),
  notes text,
  workspace_id varchar(64),
  client_id integer,
  signal_id integer,
  metadata jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_tasks (
  id serial PRIMARY KEY,
  workspace_id integer NOT NULL,
  title varchar(500) NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'pending',
  priority varchar(50) NOT NULL DEFAULT 'normal',
  due_date varchar(50),
  notes text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_notes (
  id serial PRIMARY KEY,
  workspace_id integer NOT NULL,
  author varchar(255) DEFAULT 'Demarcus',
  content text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_documents (
  id serial PRIMARY KEY,
  workspace_id integer NOT NULL,
  file_name varchar(500) NOT NULL,
  file_url text NOT NULL,
  file_type varchar(50),
  file_size integer,
  uploaded_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_timeline (
  id serial PRIMARY KEY,
  workspace_id integer NOT NULL,
  event varchar(500) NOT NULL,
  event_type varchar(50),
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_next_actions (
  id serial PRIMARY KEY,
  workspace_id integer NOT NULL,
  action varchar(500) NOT NULL,
  completed smallint NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_briefs (
  id serial PRIMARY KEY,
  "sourceType" varchar(32) NOT NULL,
  "sourceId" integer NOT NULL,
  "sourceName" varchar(255),
  "briefType" varchar(64) NOT NULL,
  content jsonb NOT NULL,
  "rawData" jsonb,
  "generatedAt" timestamp NOT NULL DEFAULT now(),
  metadata jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_ai_analyses (
  id serial PRIMARY KEY,
  "workspaceId" integer NOT NULL,
  title varchar(500) NOT NULL,
  "aiSource" varchar(50) NOT NULL,
  "analysisType" varchar(50) NOT NULL,
  content text NOT NULL,
  tags jsonb,
  "generatedBy" varchar(32) DEFAULT 'manual',
  "modelVersion" varchar(100),
  "confidenceScore" numeric(5, 2),
  "parentAnalysisId" integer,
  metadata jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

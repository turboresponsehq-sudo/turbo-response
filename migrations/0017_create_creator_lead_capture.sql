-- Creator Lead Capture V1 — migration 0017
--
-- Production procedure:
--   1. Create a Render logical export immediately before execution.
--   2. Run this file once in the Render web-service shell against DATABASE_URL.
--   3. Verify the four creator_* tables, indexes, and schema_migrations record.
--
-- This migration creates new Creator Business tables only. It does not alter,
-- update, delete, or read any existing Turbo Response consumer tables.

BEGIN;

SELECT pg_advisory_xact_lock(hashtext('creator-lead-capture-v1-0017'));

CREATE TABLE IF NOT EXISTS creator_leads (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  brand_name VARCHAR(255),
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(50),
  creator_type VARCHAR(50) NOT NULL,
  social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  website_url VARCHAR(500),
  goals TEXT,
  challenges TEXT,
  automation_wish TEXT,
  revenue_streams JSONB NOT NULL DEFAULT '[]'::jsonb,
  additional_monetization TEXT,
  audience_location TEXT,
  priority_platforms JSONB NOT NULL DEFAULT '[]'::jsonb,
  audience_size VARCHAR(100),
  collects_fan_contacts VARCHAR(50),
  brand_assets JSONB NOT NULL DEFAULT '[]'::jsonb,
  brand_style TEXT,
  business_systems JSONB NOT NULL DEFAULT '[]'::jsonb,
  opportunity_focus JSONB NOT NULL DEFAULT '[]'::jsonb,
  project_priority TEXT NOT NULL,
  budget_range VARCHAR(50),
  package_interest VARCHAR(100),
  final_question TEXT,
  source VARCHAR(100) NOT NULL DEFAULT 'website',
  source_path VARCHAR(500),
  referrer VARCHAR(1000),
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  consent_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT creator_leads_status_check
    CHECK (status IN ('new', 'reviewing', 'follow_up', 'converted', 'closed'))
);

CREATE TABLE IF NOT EXISTS creator_lead_events (
  id BIGSERIAL PRIMARY KEY,
  creator_lead_id BIGINT NOT NULL REFERENCES creator_leads(id) ON DELETE RESTRICT,
  event_type VARCHAR(100) NOT NULL,
  actor VARCHAR(255) NOT NULL DEFAULT 'system',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT creator_lead_events_idempotency_key_unique UNIQUE (idempotency_key)
);

CREATE TABLE IF NOT EXISTS creator_lead_notes (
  id BIGSERIAL PRIMARY KEY,
  creator_lead_id BIGINT NOT NULL REFERENCES creator_leads(id) ON DELETE RESTRICT,
  note TEXT NOT NULL,
  author_user_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS creator_follow_up_tasks (
  id BIGSERIAL PRIMARY KEY,
  creator_lead_id BIGINT NOT NULL REFERENCES creator_leads(id) ON DELETE RESTRICT,
  due_at TIMESTAMPTZ,
  owner_user_id BIGINT,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  task_type VARCHAR(100) NOT NULL DEFAULT 'follow_up',
  task_detail TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT creator_follow_up_tasks_status_check
    CHECK (status IN ('open', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_creator_leads_status_submitted
  ON creator_leads (status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_leads_email
  ON creator_leads (lower(email));
CREATE INDEX IF NOT EXISTS idx_creator_lead_events_lead_created
  ON creator_lead_events (creator_lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_lead_notes_lead_created
  ON creator_lead_notes (creator_lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_follow_up_tasks_open_due
  ON creator_follow_up_tasks (status, due_at ASC NULLS LAST);

INSERT INTO schema_migrations (migration_name)
SELECT '0017_create_creator_lead_capture'
WHERE NOT EXISTS (
  SELECT 1
  FROM schema_migrations
  WHERE migration_name = '0017_create_creator_lead_capture'
);

COMMIT;

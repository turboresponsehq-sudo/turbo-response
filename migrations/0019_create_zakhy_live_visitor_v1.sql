-- Zakhy Live Visitor V1 — migration 0019
--
-- Production procedure:
--   1. Create a fresh Render logical export immediately before execution.
--   2. Run this file exactly once against the production DATABASE_URL.
--   3. Verify both zakhy_visitor_* tables and the schema_migrations record.
--
-- This migration creates only Zakhy visitor tables. It does not alter,
-- update, delete, or read any Turbo Response consumer tables.

BEGIN;

SELECT pg_advisory_xact_lock(hashtext('zakhy-live-visitor-v1-0019'));

CREATE TABLE IF NOT EXISTS zakhy_visitor_sessions (
  id BIGSERIAL PRIMARY KEY,
  visitor_token VARCHAR(128) NOT NULL,
  session_token VARCHAR(128) NOT NULL,
  entry_route VARCHAR(500) NOT NULL,
  current_route VARCHAR(500) NOT NULL,
  referrer VARCHAR(1000),
  source VARCHAR(100),
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  device_type VARCHAR(20) NOT NULL,
  returning BOOLEAN NOT NULL DEFAULT FALSE,
  creator_lead_id BIGINT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT zakhy_visitor_sessions_visitor_token_unique UNIQUE (visitor_token),
  CONSTRAINT zakhy_visitor_sessions_session_token_unique UNIQUE (session_token)
);

CREATE INDEX IF NOT EXISTS idx_zakhy_visitor_sessions_last_seen
  ON zakhy_visitor_sessions (last_seen_at);
CREATE INDEX IF NOT EXISTS idx_zakhy_visitor_sessions_creator_lead
  ON zakhy_visitor_sessions (creator_lead_id);

CREATE TABLE IF NOT EXISTS zakhy_visitor_events (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES zakhy_visitor_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  route VARCHAR(500) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zakhy_visitor_events_session_created
  ON zakhy_visitor_events (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_zakhy_visitor_events_type_created
  ON zakhy_visitor_events (event_type, created_at);

INSERT INTO schema_migrations (migration_name)
SELECT '0019_create_zakhy_live_visitor_v1'
WHERE NOT EXISTS (
  SELECT 1
  FROM schema_migrations
  WHERE migration_name = '0019_create_zakhy_live_visitor_v1'
);

COMMIT;

-- Rollback (manual, only if explicitly approved before real visitor data is accepted):
-- BEGIN;
-- DROP TABLE IF EXISTS zakhy_visitor_events;
-- DROP TABLE IF EXISTS zakhy_visitor_sessions;
-- DELETE FROM schema_migrations WHERE migration_name = '0019_create_zakhy_live_visitor_v1';
-- COMMIT;

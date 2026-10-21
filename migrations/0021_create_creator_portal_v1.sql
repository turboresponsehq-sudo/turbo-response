-- Creator Portal V1 — candidate migration 0021
--
-- IMPORTANT: Do not execute until production preflight confirms that 0021 is the
-- next unused migration number and a current Render backup/checkpoint exists.
-- This migration is additive and isolated from consumer cases and client portals.

BEGIN;

SELECT pg_advisory_xact_lock(hashtext('creator-portal-v1-0021'));

CREATE TABLE IF NOT EXISTS creator_portals (
  id BIGSERIAL PRIMARY KEY,
  creator_lead_id BIGINT NOT NULL UNIQUE REFERENCES creator_leads(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'disabled',
  current_status VARCHAR(50) NOT NULL DEFAULT 'Intake Received',
  current_phase VARCHAR(100) NOT NULL DEFAULT 'Discovery',
  next_step TEXT,
  drive_folder_url VARCHAR(1000),
  access_token_hash VARCHAR(128),
  token_expires_at TIMESTAMPTZ,
  invitation_sent_at TIMESTAMPTZ,
  last_access_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT creator_portals_status_check CHECK (status IN ('disabled', 'invited', 'active')),
  CONSTRAINT creator_portals_project_status_check CHECK (current_status IN ('Intake Received', 'Reviewing', 'Awaiting Client', 'Planning', 'In Progress', 'Ready for Review', 'Completed'))
);

CREATE TABLE IF NOT EXISTS creator_portal_items (
  id BIGSERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL REFERENCES creator_portals(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'needed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT creator_portal_items_status_check CHECK (status IN ('needed', 'received', 'complete'))
);

CREATE TABLE IF NOT EXISTS creator_portal_updates (
  id BIGSERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL REFERENCES creator_portals(id) ON DELETE CASCADE,
  update_text TEXT NOT NULL,
  visible_to_creator BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_user_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS creator_portal_events (
  id BIGSERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL REFERENCES creator_portals(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  actor VARCHAR(255) NOT NULL DEFAULT 'system',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_portals_status ON creator_portals(status);
CREATE INDEX IF NOT EXISTS idx_creator_portal_items_portal_status ON creator_portal_items(portal_id, status);
CREATE INDEX IF NOT EXISTS idx_creator_portal_updates_visible_created ON creator_portal_updates(portal_id, visible_to_creator, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_portal_events_portal_created ON creator_portal_events(portal_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_creator_portals_access_token_hash ON creator_portals(access_token_hash) WHERE access_token_hash IS NOT NULL;

INSERT INTO schema_migrations (migration_name)
SELECT '0021_create_creator_portal_v1'
WHERE NOT EXISTS (
  SELECT 1 FROM schema_migrations WHERE migration_name = '0021_create_creator_portal_v1'
);

COMMIT;

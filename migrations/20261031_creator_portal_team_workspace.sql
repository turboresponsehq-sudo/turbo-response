-- Creator Automations: opt-in team workspace.
-- IMPORTANT: Apply only after production backup and portal baseline migration preflight.
-- This SQL is not run automatically by the frontend deployment.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('creator-portal-team-20261031'));

-- Installations may have the initial portal tables but not the messages table.
CREATE TABLE IF NOT EXISTS creator_portal_messages (
  id BIGSERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL REFERENCES creator_portals(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('admin', 'creator')),
  message_text TEXT NOT NULL,
  visible_to_creator BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_user_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_creator_portal_messages_portal_created
  ON creator_portal_messages(portal_id, created_at);
CREATE INDEX IF NOT EXISTS idx_creator_portal_messages_visible_created
  ON creator_portal_messages(portal_id, visible_to_creator, created_at);

-- Group-chat link is project-scoped and revocable, NOT a login credential.
ALTER TABLE creator_portals ADD COLUMN IF NOT EXISTS team_join_token_hash VARCHAR(128);
ALTER TABLE creator_portals ADD COLUMN IF NOT EXISTS team_join_expires_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS idx_creator_portal_team_join_token
  ON creator_portals(team_join_token_hash) WHERE team_join_token_hash IS NOT NULL;

-- Every teammate chooses a private login code, verifies email, and awaits approval.
CREATE TABLE IF NOT EXISTS creator_portal_members (
  id BIGSERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL REFERENCES creator_portals(id) ON DELETE CASCADE,
  email VARCHAR(320) NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  role VARCHAR(24) NOT NULL DEFAULT 'collaborator' CHECK (role IN ('client', 'collaborator')),
  status VARCHAR(28) NOT NULL DEFAULT 'pending_verification'
    CHECK (status IN ('pending_verification','pending_approval','active','revoked')),
  password_hash VARCHAR(128) NOT NULL,
  email_verification_hash VARCHAR(128),
  email_verification_expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by_user_id BIGINT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(portal_id, email)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_creator_portal_member_verification
  ON creator_portal_members(email_verification_hash)
  WHERE email_verification_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_creator_portal_members_portal_status
  ON creator_portal_members(portal_id, status);

ALTER TABLE creator_portal_messages ADD COLUMN IF NOT EXISTS sender_member_id BIGINT;
ALTER TABLE creator_portal_messages ADD COLUMN IF NOT EXISTS sender_name VARCHAR(150);

CREATE TABLE IF NOT EXISTS creator_portal_calendar (
  id BIGSERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL REFERENCES creator_portals(id) ON DELETE CASCADE,
  title VARCHAR(250) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_by VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT creator_portal_calendar_dates_valid CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS idx_creator_portal_calendar_portal_date
  ON creator_portal_calendar(portal_id, starts_at);

CREATE TABLE IF NOT EXISTS creator_portal_files (
  id BIGSERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL REFERENCES creator_portals(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size_bytes BIGINT NOT NULL,
  uploaded_by VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_creator_portal_files_portal_date
  ON creator_portal_files(portal_id, created_at DESC);

INSERT INTO schema_migrations (migration_name)
SELECT '20261031_creator_portal_team_workspace'
WHERE NOT EXISTS (
 SELECT 1 FROM schema_migrations WHERE migration_name = '20261031_creator_portal_team_workspace'
);
COMMIT;

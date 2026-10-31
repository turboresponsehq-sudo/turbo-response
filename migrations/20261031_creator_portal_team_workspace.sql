-- Creator Automations team portal V1.
-- MANUAL production preflight only: verify baseline portal migration, take a DB backup,
-- and apply this additive migration before enabling the team features.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('creator-portal-team-20261031'));

-- Also repairs installations where the original portal-messages table was
-- defined in Drizzle but not materialized by the 0021 SQL migration.
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

CREATE TABLE IF NOT EXISTS creator_portal_members (
  id BIGSERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL REFERENCES creator_portals(id) ON DELETE CASCADE,
  email VARCHAR(320) NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  role VARCHAR(24) NOT NULL DEFAULT 'collaborator' CHECK (role IN ('client', 'collaborator')),
  status VARCHAR(16) NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'revoked')),
  access_token_hash VARCHAR(128),
  token_expires_at TIMESTAMPTZ,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(portal_id, email)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_creator_portal_member_token
 ON creator_portal_members(access_token_hash) WHERE access_token_hash IS NOT NULL;
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
  CONSTRAINT portal_event_times_valid CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS idx_creator_portal_calendar_portal_date
 ON creator_portal_calendar(portal_id, starts_at);

INSERT INTO schema_migrations (migration_name)
SELECT '20261031_creator_portal_team_workspace'
WHERE NOT EXISTS (
  SELECT 1 FROM schema_migrations
  WHERE migration_name = '20261031_creator_portal_team_workspace'
);
COMMIT;

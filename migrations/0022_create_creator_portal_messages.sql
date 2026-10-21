-- Creator Portal V1.1 — persistent project communication log
-- Additive and isolated from consumer cases and Creator Leads.

BEGIN;

SELECT pg_advisory_xact_lock(hashtext('creator-portal-messages-v1-0022'));

CREATE TABLE IF NOT EXISTS creator_portal_messages (
  id BIGSERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL REFERENCES creator_portals(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL,
  message_text TEXT NOT NULL,
  visible_to_creator BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_user_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT creator_portal_messages_sender_check CHECK (sender_type IN ('admin', 'creator')),
  CONSTRAINT creator_portal_messages_text_check CHECK (length(trim(message_text)) BETWEEN 1 AND 10000)
);

CREATE INDEX IF NOT EXISTS idx_creator_portal_messages_portal_created
  ON creator_portal_messages(portal_id, created_at ASC, id ASC);

CREATE INDEX IF NOT EXISTS idx_creator_portal_messages_visible_created
  ON creator_portal_messages(portal_id, visible_to_creator, created_at ASC, id ASC);

INSERT INTO schema_migrations (migration_name)
SELECT '0022_create_creator_portal_messages'
WHERE NOT EXISTS (
  SELECT 1 FROM schema_migrations WHERE migration_name = '0022_create_creator_portal_messages'
);

COMMIT;

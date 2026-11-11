-- Phase: First-party Data Connections hub
-- Additive only. Existing CRM/contact data is preserved.

BEGIN;

CREATE TABLE IF NOT EXISTS zakhy_data_sources (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  external_account_id TEXT NULL,
  account_label TEXT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMPTZ NULL,
  sync_cursor TEXT NULL,
  connected_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_zakhy_data_sources_provider_account
  ON zakhy_data_sources(provider, COALESCE(external_account_id, ''));

CREATE TABLE IF NOT EXISTS zakhy_contact_external_ids (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NOT NULL REFERENCES zakhy_network_contacts(id) ON DELETE CASCADE,
  source_id BIGINT NOT NULL REFERENCES zakhy_data_sources(id) ON DELETE CASCADE,
  external_person_id TEXT NOT NULL,
  source_email TEXT NULL,
  source_phone TEXT NULL,
  source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_id, external_person_id)
);

CREATE INDEX IF NOT EXISTS idx_zakhy_contact_external_ids_contact
  ON zakhy_contact_external_ids(contact_id);

CREATE TABLE IF NOT EXISTS zakhy_contact_events (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NULL REFERENCES zakhy_network_contacts(id) ON DELETE SET NULL,
  source_id BIGINT NOT NULL REFERENCES zakhy_data_sources(id) ON DELETE CASCADE,
  external_event_id TEXT NULL,
  event_type TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  amount_cents BIGINT NULL,
  currency TEXT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_zakhy_contact_events_source_external
  ON zakhy_contact_events(source_id, external_event_id)
  WHERE external_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_zakhy_contact_events_contact_time
  ON zakhy_contact_events(contact_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS zakhy_contact_consents (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NULL REFERENCES zakhy_network_contacts(id) ON DELETE SET NULL,
  source_id BIGINT NOT NULL REFERENCES zakhy_data_sources(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zakhy_contact_consents_contact
  ON zakhy_contact_consents(contact_id, channel, observed_at DESC);

CREATE TABLE IF NOT EXISTS zakhy_source_sync_runs (
  id BIGSERIAL PRIMARY KEY,
  source_id BIGINT NOT NULL REFERENCES zakhy_data_sources(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  records_seen INTEGER NOT NULL DEFAULT 0,
  records_created INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  error_message TEXT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ NULL
);

INSERT INTO schema_migrations (migration_name, applied_at)
SELECT '0025_create_zakhy_data_connections', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM schema_migrations WHERE migration_name = '0025_create_zakhy_data_connections'
);

COMMIT;

-- Rollback note:
-- Revert application code first. These tables are additive and should be retained
-- once they contain first-party customer history. If never used, they can be
-- dropped in reverse dependency order.

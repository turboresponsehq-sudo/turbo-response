-- Optional rollback. Only use before customer/platform data is stored.
BEGIN;
DROP TABLE IF EXISTS zakhy_source_sync_runs;
DROP TABLE IF EXISTS zakhy_contact_consents;
DROP TABLE IF EXISTS zakhy_contact_events;
DROP TABLE IF EXISTS zakhy_contact_external_ids;
DROP TABLE IF EXISTS zakhy_data_sources;
DELETE FROM schema_migrations WHERE migration_name = '0025_create_zakhy_data_connections';
COMMIT;

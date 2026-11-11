-- Optional rollback for Phase 1 schema additions.
-- This intentionally preserves zakhy_network_contacts and its core historical fields.

BEGIN;
DROP TABLE IF EXISTS zakhy_network_contact_categories;
DROP TABLE IF EXISTS zakhy_network_categories;
ALTER TABLE zakhy_network_contacts DROP COLUMN IF EXISTS social_links;
ALTER TABLE zakhy_network_contacts DROP COLUMN IF EXISTS is_priority;
ALTER TABLE zakhy_network_contacts DROP COLUMN IF EXISTS is_favorite;
ALTER TABLE zakhy_network_contacts DROP COLUMN IF EXISTS photo_url;
ALTER TABLE zakhy_network_contacts DROP COLUMN IF EXISTS email;
DELETE FROM schema_migrations WHERE migration_name = '0024_create_zakhy_network_crm_phase1';
COMMIT;

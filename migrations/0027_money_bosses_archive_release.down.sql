-- Only after staging review; no production execution has been performed.
BEGIN;
ALTER TABLE mb_archive_videos DROP COLUMN IF EXISTS release_at;
DELETE FROM schema_migrations WHERE migration_name = '0027_money_bosses_archive_release';
COMMIT;

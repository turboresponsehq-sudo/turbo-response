-- Development/staging review only. Do not run against production without approval.
BEGIN;
ALTER TABLE mb_archive_videos ADD COLUMN IF NOT EXISTS release_at TIMESTAMPTZ;
INSERT INTO schema_migrations (migration_name, applied_at)
SELECT '0027_money_bosses_archive_release', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM schema_migrations WHERE migration_name = '0027_money_bosses_archive_release'
);
COMMIT;

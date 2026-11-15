-- Backend-only external handoffs. No artwork, video, snapshot, or publication rewrites.
BEGIN;
ALTER TABLE mb_content_story_drafts ADD COLUMN IF NOT EXISTS external_url TEXT CHECK (external_url IS NULL OR char_length(external_url) <= 2000);
ALTER TABLE mb_content_story_drafts ADD COLUMN IF NOT EXISTS external_label TEXT CHECK (external_label IS NULL OR char_length(external_label) <= 160);
INSERT INTO schema_migrations(migration_name,applied_at)
SELECT '0029_external_archive_destinations',NOW()
WHERE NOT EXISTS(SELECT 1 FROM schema_migrations WHERE migration_name='0029_external_archive_destinations');
COMMIT;

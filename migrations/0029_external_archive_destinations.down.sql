-- Immutable snapshot history and existing MP4 content remain retained.
BEGIN;
ALTER TABLE mb_content_story_drafts DROP COLUMN IF EXISTS external_label;
ALTER TABLE mb_content_story_drafts DROP COLUMN IF EXISTS external_url;
DELETE FROM schema_migrations WHERE migration_name='0029_external_archive_destinations';
COMMIT;

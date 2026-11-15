-- Removes this extension only; baseline artworks/videos/memberships remain unchanged.
BEGIN;
DROP TABLE IF EXISTS mb_content_publications;
DROP TABLE IF EXISTS mb_content_snapshot_media;
DROP TABLE IF EXISTS mb_content_snapshots;
DROP FUNCTION IF EXISTS mb_content_reject_snapshot_mutation();
DROP TABLE IF EXISTS mb_content_story_drafts;
ALTER TABLE mb_archive_videos DROP COLUMN IF EXISTS content_approved;
ALTER TABLE mb_archive_videos DROP COLUMN IF EXISTS media_id;
DROP TABLE IF EXISTS mb_content_media;
DELETE FROM schema_migrations WHERE migration_name='0028_money_bosses_content_publishing';
COMMIT;

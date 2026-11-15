-- Local/staging only until separately approved. Existing approved source assets are not changed.
BEGIN;
CREATE TABLE IF NOT EXISTS mb_content_media (
  id UUID PRIMARY KEY,
  storage_key TEXT NOT NULL UNIQUE CHECK (storage_key ~ '^[a-f0-9]{64}\.mp4$'),
  mime_type TEXT NOT NULL CHECK (mime_type = 'video/mp4'),
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 104857600),
  duration_seconds DOUBLE PRECISION NOT NULL CHECK (duration_seconds > 0),
  video_codec TEXT NOT NULL CHECK (video_codec = 'h264'),
  audio_codec TEXT CHECK (audio_codec IS NULL OR audio_codec = 'aac'),
  sha256 TEXT NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  uploaded_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE mb_archive_videos ADD COLUMN IF NOT EXISTS media_id UUID REFERENCES mb_content_media(id);
ALTER TABLE mb_archive_videos ADD COLUMN IF NOT EXISTS content_approved BOOLEAN NOT NULL DEFAULT FALSE;

-- Seed only absent original reference rows. ON CONFLICT never rewrites existing approved rows.
INSERT INTO mb_archive_artworks(stable_key,title,source_asset_id,source_checksum,approved)
VALUES
 ('tony-tripp','Tony Tripp','/approved/tony-tripp.jpg','4a1dab1ea4014ad7c8eb45de9246d3f4abd4c7151ee41d3b54c0460d0b321f63',TRUE),
 ('rod-tre','Rod & Tre','/approved/rod-tre.jpg','f6a73e7db9d4ab6d2c1d732185f38511ff46e6e0232aea0319da5883a1b195d5',TRUE),
 ('cow-pac','Cow Pac','/approved/cow-pac.jpg','2ded90dcd1b1788819ff208fec427bdf34061055f7ce403945deabcd0d6b7f28',TRUE)
ON CONFLICT(stable_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS mb_content_story_drafts (
  artwork_id BIGINT PRIMARY KEY REFERENCES mb_archive_artworks(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  era TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  recognition_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO mb_content_story_drafts(artwork_id,title,display_order)
SELECT id,title,CASE stable_key WHEN 'tony-tripp' THEN 0 WHEN 'rod-tre' THEN 1 ELSE 2 END
FROM mb_archive_artworks WHERE stable_key IN ('tony-tripp','rod-tre','cow-pac') AND deleted_at IS NULL
ON CONFLICT(artwork_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS mb_content_snapshots (
  id UUID PRIMARY KEY,
  artwork_id BIGINT NOT NULL REFERENCES mb_archive_artworks(id) ON DELETE RESTRICT,
  version INTEGER NOT NULL CHECK(version > 0),
  payload JSONB NOT NULL,
  approved_by_user_id INTEGER NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  release_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  CHECK(expires_at IS NULL OR release_at IS NULL OR expires_at > release_at),
  UNIQUE(artwork_id,version),
  UNIQUE(artwork_id,id)
);
CREATE TABLE IF NOT EXISTS mb_content_snapshot_media (
  snapshot_id UUID NOT NULL REFERENCES mb_content_snapshots(id) ON DELETE RESTRICT,
  media_id UUID NOT NULL REFERENCES mb_content_media(id) ON DELETE RESTRICT,
  release_at TIMESTAMPTZ,
  PRIMARY KEY(snapshot_id,media_id)
);
CREATE TABLE IF NOT EXISTS mb_content_publications (
  artwork_id BIGINT PRIMARY KEY REFERENCES mb_archive_artworks(id) ON DELETE RESTRICT,
  snapshot_id UUID NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY(artwork_id,snapshot_id) REFERENCES mb_content_snapshots(artwork_id,id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_mb_content_snapshot_media_media ON mb_content_snapshot_media(media_id);
CREATE OR REPLACE FUNCTION mb_content_reject_snapshot_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Published Money Bosses snapshots are immutable';
END;
$$;
DROP TRIGGER IF EXISTS mb_content_snapshots_immutable ON mb_content_snapshots;
CREATE TRIGGER mb_content_snapshots_immutable BEFORE UPDATE OR DELETE ON mb_content_snapshots
FOR EACH ROW EXECUTE FUNCTION mb_content_reject_snapshot_mutation();
DROP TRIGGER IF EXISTS mb_content_snapshot_media_immutable ON mb_content_snapshot_media;
CREATE TRIGGER mb_content_snapshot_media_immutable BEFORE UPDATE OR DELETE ON mb_content_snapshot_media
FOR EACH ROW EXECUTE FUNCTION mb_content_reject_snapshot_mutation();
INSERT INTO schema_migrations(migration_name,applied_at)
SELECT '0028_money_bosses_content_publishing',NOW()
WHERE NOT EXISTS(SELECT 1 FROM schema_migrations WHERE migration_name='0028_money_bosses_content_publishing');
COMMIT;

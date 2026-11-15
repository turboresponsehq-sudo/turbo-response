BEGIN;

CREATE TABLE IF NOT EXISTS mb_memberships (
  id BIGSERIAL PRIMARY KEY,
  internal_id TEXT NOT NULL UNIQUE,
  shopify_customer_id TEXT,
  member_name TEXT,
  preferred_name TEXT,
  profile_photo_url TEXT,
  tier TEXT NOT NULL DEFAULT 'founding_member',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','expired','revoked','suspended')),
  member_since TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  public_credential_ref_hash TEXT UNIQUE,
  card_artwork_version TEXT NOT NULL DEFAULT 'mb-001-v1',
  photo_consent BOOLEAN NOT NULL DEFAULT FALSE,
  deletion_requested_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mb_memberships_status ON mb_memberships(status);
CREATE INDEX IF NOT EXISTS idx_mb_memberships_shopify_customer ON mb_memberships(shopify_customer_id);

CREATE TABLE IF NOT EXISTS mb_membership_events (
  id BIGSERIAL PRIMARY KEY,
  membership_id BIGINT NOT NULL REFERENCES mb_memberships(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mb_membership_events_membership_created ON mb_membership_events(membership_id, created_at DESC);

CREATE TABLE IF NOT EXISTS mb_wallet_passes (
  id BIGSERIAL PRIMARY KEY,
  membership_id BIGINT NOT NULL REFERENCES mb_memberships(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('apple','google','samsung')),
  provider_object_id TEXT,
  state TEXT NOT NULL DEFAULT 'not_configured' CHECK (state IN ('not_configured','ready','issued','update_pending','revoked','error')),
  last_error TEXT,
  issued_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(membership_id, provider)
);

CREATE TABLE IF NOT EXISTS mb_archive_artworks (
  id BIGSERIAL PRIMARY KEY,
  stable_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  source_asset_id TEXT,
  source_checksum TEXT,
  recognition_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mb_archive_videos (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  media_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','retired')),
  audio_rights_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (audio_rights_status IN ('pending_review','approved','blocked')),
  source_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mb_archive_artwork_videos (
  artwork_id BIGINT NOT NULL REFERENCES mb_archive_artworks(id) ON DELETE CASCADE,
  video_id BIGINT NOT NULL REFERENCES mb_archive_videos(id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (artwork_id, video_id)
);

CREATE TABLE IF NOT EXISTS mb_qr_destinations (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  path_or_payload TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','retired')),
  is_official BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mb_benefits (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','retired')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mb_announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','retired')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mb_scan_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('qr_arrival','photo_recognition','hub_open','video_handoff','membership_verification')),
  artwork_id BIGINT REFERENCES mb_archive_artworks(id) ON DELETE SET NULL,
  destination_id BIGINT REFERENCES mb_qr_destinations(id) ON DELETE SET NULL,
  anonymous_session_ref TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mb_scan_events_type_created ON mb_scan_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mb_scan_events_artwork_created ON mb_scan_events(artwork_id, created_at DESC);

CREATE TABLE IF NOT EXISTS mb_integration_settings (
  provider TEXT PRIMARY KEY CHECK (provider IN ('shopify','apple_wallet','google_wallet','samsung_wallet','approved_asset_source')),
  state TEXT NOT NULL DEFAULT 'not_configured' CHECK (state IN ('not_configured','setup_required','ready','connected','paused','error')),
  account_label TEXT,
  external_account_ref TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO mb_integration_settings(provider, state, account_label)
VALUES
  ('shopify', 'setup_required', 'Money Bosses'),
  ('apple_wallet', 'not_configured', 'Apple Wallet'),
  ('google_wallet', 'not_configured', 'Google Wallet'),
  ('samsung_wallet', 'not_configured', 'Samsung Wallet'),
  ('approved_asset_source', 'setup_required', 'Money Bosses approved assets')
ON CONFLICT (provider) DO NOTHING;

INSERT INTO schema_migrations (migration_name, applied_at)
SELECT '0026_create_money_bosses_command_center', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM schema_migrations WHERE migration_name = '0026_create_money_bosses_command_center'
);

COMMIT;

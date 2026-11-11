-- Phase 1: ZAKHY My Network CRM
-- Additive and idempotent. Preserves any existing zakhy_network_contacts rows.

BEGIN;

CREATE TABLE IF NOT EXISTS zakhy_network_contacts (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  where_met TEXT NOT NULL,
  profession TEXT NOT NULL,
  company TEXT NULL,
  notes TEXT NULL,
  follow_up_at TIMESTAMPTZ NULL,
  follow_up_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_user_id BIGINT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE zakhy_network_contacts ADD COLUMN IF NOT EXISTS email TEXT NULL;
ALTER TABLE zakhy_network_contacts ADD COLUMN IF NOT EXISTS photo_url TEXT NULL;
ALTER TABLE zakhy_network_contacts ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE zakhy_network_contacts ADD COLUMN IF NOT EXISTS is_priority BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE zakhy_network_contacts ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS zakhy_network_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zakhy_network_contact_categories (
  contact_id BIGINT NOT NULL REFERENCES zakhy_network_contacts(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES zakhy_network_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (contact_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_zakhy_network_contacts_follow_up
  ON zakhy_network_contacts (follow_up_done, follow_up_at);
CREATE INDEX IF NOT EXISTS idx_zakhy_network_contacts_created
  ON zakhy_network_contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_zakhy_network_contacts_name
  ON zakhy_network_contacts (LOWER(full_name));
CREATE INDEX IF NOT EXISTS idx_zakhy_network_contacts_company
  ON zakhy_network_contacts (LOWER(company));
CREATE INDEX IF NOT EXISTS idx_zakhy_network_contacts_profession
  ON zakhy_network_contacts (LOWER(profession));

INSERT INTO zakhy_network_categories (name, slug, sort_order)
VALUES
  ('Music / Artists','music-artists',10),
  ('Influencers / Content Creators','influencers-content-creators',20),
  ('Restaurants / Hospitality','restaurants-hospitality',30),
  ('Financial Services','financial-services',40),
  ('Entrepreneurs / Business Owners','entrepreneurs-business-owners',50),
  ('Politics / Community Leaders','politics-community-leaders',60),
  ('Fashion / Streetwear','fashion-streetwear',70),
  ('Real Estate','real-estate',80),
  ('Technology','technology',90),
  ('Other','other',100)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO schema_migrations (migration_name, applied_at)
SELECT '0024_create_zakhy_network_crm_phase1', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM schema_migrations WHERE migration_name = '0024_create_zakhy_network_crm_phase1'
);

COMMIT;

-- Rollback notes:
-- Phase 1 is intentionally additive. To roll back UI/API behavior, revert the application commit.
-- Do not drop zakhy_network_contacts because that may contain user data.
-- Optional schema-only rollback for newly added structures:
-- DROP TABLE IF EXISTS zakhy_network_contact_categories;
-- DROP TABLE IF EXISTS zakhy_network_categories;
-- ALTER TABLE zakhy_network_contacts DROP COLUMN IF EXISTS social_links;
-- ALTER TABLE zakhy_network_contacts DROP COLUMN IF EXISTS is_priority;
-- ALTER TABLE zakhy_network_contacts DROP COLUMN IF EXISTS is_favorite;
-- ALTER TABLE zakhy_network_contacts DROP COLUMN IF EXISTS photo_url;
-- ALTER TABLE zakhy_network_contacts DROP COLUMN IF EXISTS email;

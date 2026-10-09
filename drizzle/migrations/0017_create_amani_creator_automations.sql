-- Amani Mansur is a Creator Automations client. These records are intentionally
-- isolated from Turbo Response cases, consumer intake, payments, and client portals.
-- This migration is additive only: it creates no objects in the public schema.

CREATE SCHEMA IF NOT EXISTS amani_creator_automations;

CREATE TABLE IF NOT EXISTS amani_creator_automations.relationships (
  id BIGSERIAL PRIMARY KEY,
  creator_client_key VARCHAR(50) NOT NULL DEFAULT 'amani',
  email VARCHAR(320) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  organization VARCHAR(255),
  contact_role VARCHAR(255),
  city VARCHAR(255),
  brand_or_social VARCHAR(500),
  original_source VARCHAR(100) NOT NULL DEFAULT 'Amani Website',
  landing_page VARCHAR(500),
  referrer VARCHAR(1000),
  utm_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  relationship_type VARCHAR(100) NOT NULL DEFAULT 'Potential client relationship',
  relationship_strength VARCHAR(50) NOT NULL DEFAULT 'new',
  relationship_owner VARCHAR(100) NOT NULL DEFAULT 'AMANI',
  implementation_owner VARCHAR(100) NOT NULL DEFAULT 'AMANI',
  handoff_destination VARCHAR(100) NOT NULL DEFAULT 'AMANI',
  last_contact_at TIMESTAMPTZ,
  next_action TEXT,
  notes TEXT,
  hubspot_contact_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_amani_relationships_client_email UNIQUE (creator_client_key, email)
);

CREATE INDEX IF NOT EXISTS idx_amani_relationships_owner
  ON amani_creator_automations.relationships (relationship_owner, updated_at DESC);

CREATE TABLE IF NOT EXISTS amani_creator_automations.opportunities (
  id BIGSERIAL PRIMARY KEY,
  relationship_id BIGINT NOT NULL REFERENCES amani_creator_automations.relationships(id) ON DELETE RESTRICT,
  client_submission_id UUID NOT NULL UNIQUE,
  opportunity_type VARCHAR(500) NOT NULL,
  business_pathway VARCHAR(255) NOT NULL,
  what_they_are_building TEXT NOT NULL,
  primary_challenge TEXT NOT NULL,
  operating_stage VARCHAR(255) NOT NULL,
  service_interest VARCHAR(500),
  campaign_interest VARCHAR(500),
  timeline VARCHAR(255) NOT NULL,
  budget_range VARCHAR(100),
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  qualified_state VARCHAR(50) NOT NULL DEFAULT 'new',
  opportunity_owner VARCHAR(100) NOT NULL DEFAULT 'AMANI',
  relationship_owner VARCHAR(100) NOT NULL DEFAULT 'AMANI',
  implementation_owner VARCHAR(100) NOT NULL DEFAULT 'AMANI',
  handoff_destination VARCHAR(100) NOT NULL DEFAULT 'AMANI',
  handoff_reason TEXT,
  next_action TEXT NOT NULL,
  source VARCHAR(100) NOT NULL DEFAULT 'Amani Website',
  source_path VARCHAR(500),
  landing_page VARCHAR(500),
  utm_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_internal_test BOOLEAN NOT NULL DEFAULT FALSE,
  hubspot_contact_id VARCHAR(100),
  hubspot_note_id VARCHAR(100),
  hubspot_sync_status VARCHAR(50) NOT NULL DEFAULT 'disabled',
  hubspot_sync_error TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amani_opportunities_relationship_created
  ON amani_creator_automations.opportunities (relationship_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_amani_opportunities_owner_status
  ON amani_creator_automations.opportunities (opportunity_owner, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_amani_opportunities_handoff
  ON amani_creator_automations.opportunities (handoff_destination, created_at DESC);

CREATE TABLE IF NOT EXISTS amani_creator_automations.opportunity_events (
  id BIGSERIAL PRIMARY KEY,
  opportunity_id BIGINT NOT NULL REFERENCES amani_creator_automations.opportunities(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  actor VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amani_opportunity_events_opportunity_created
  ON amani_creator_automations.opportunity_events (opportunity_id, created_at DESC);

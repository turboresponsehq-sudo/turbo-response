import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(process.cwd(), "migrations/0026_create_money_bosses_command_center.sql"), "utf8");
const downMigration = readFileSync(resolve(process.cwd(), "migrations/0026_create_money_bosses_command_center.down.sql"), "utf8");

describe("Money Bosses command-center migration contract", () => {
  it("creates only namespaced Money Bosses tables with reversible boundaries", () => {
    const tables = [
      "mb_memberships",
      "mb_membership_events",
      "mb_wallet_passes",
      "mb_archive_artworks",
      "mb_archive_videos",
      "mb_archive_artwork_videos",
      "mb_qr_destinations",
      "mb_benefits",
      "mb_announcements",
      "mb_scan_events",
      "mb_integration_settings",
    ];

    expect(migration).toMatch(/^BEGIN;/);
    expect(migration.trimEnd()).toMatch(/COMMIT;$/);
    expect(downMigration).toMatch(/^BEGIN;/);
    expect(downMigration.trimEnd()).toMatch(/COMMIT;$/);
    for (const table of tables) {
      expect(migration).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(downMigration).toContain(`DROP TABLE IF EXISTS ${table}`);
    }
    expect(migration).not.toMatch(/DROP TABLE|TRUNCATE|DELETE FROM/);
  });

  it("keeps member privacy and deletion controls explicit", () => {
    expect(migration).toContain("preferred_name TEXT");
    expect(migration).toContain("profile_photo_url TEXT");
    expect(migration).toContain("photo_consent BOOLEAN NOT NULL DEFAULT FALSE");
    expect(migration).toContain("deletion_requested_at TIMESTAMPTZ");
    expect(migration).toContain("deleted_at TIMESTAMPTZ");
    expect(migration).toContain("public_credential_ref_hash TEXT UNIQUE");
  });

  it("keeps wallet providers disabled until configured and separates scan events", () => {
    expect(migration).toContain("('apple_wallet', 'not_configured'");
    expect(migration).toContain("('google_wallet', 'not_configured'");
    expect(migration).toContain("('samsung_wallet', 'not_configured'");
    expect(migration).toContain("CHECK (event_type IN ('qr_arrival','photo_recognition','hub_open','video_handoff','membership_verification'))");
    expect(migration).toContain("membership_id BIGINT NOT NULL REFERENCES mb_memberships");
    expect(migration).toContain("event_type TEXT NOT NULL");
    expect(migration).not.toContain("CREATE TABLE users");
  });
});

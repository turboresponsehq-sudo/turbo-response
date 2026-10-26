import { sql } from "drizzle-orm";
import { getDb } from "../../db";

const CLEANUP_MIGRATION = "0023_remove_zakhy_hubspot_qa_records";

export async function cleanupZakhyHubSpotQaRecords() {
  const db = await getDb();
  if (!db) {
    console.warn("[Creator Cleanup] Database unavailable; skipping HubSpot QA cleanup.");
    return;
  }

  try {
    const applied = await db.execute(sql`
      SELECT 1
      FROM schema_migrations
      WHERE migration_name = ${CLEANUP_MIGRATION}
      LIMIT 1
    `);
    const rows = Array.isArray(applied) ? applied : ((applied as { rows?: unknown[] }).rows ?? []);
    if (rows.length) return;

    const match = `
      source = 'zakhy-creator-intake-internal-test'
      AND (
        full_name ILIKE 'Zakhy HubSpot%'
        OR brand_name ILIKE '%HUBSPOT%'
      )
    `;

    await db.execute(`
      DELETE FROM creator_portals
      WHERE creator_lead_id IN (SELECT id FROM creator_leads WHERE ${match})
    `);
    await db.execute(`
      DELETE FROM creator_follow_up_tasks
      WHERE creator_lead_id IN (SELECT id FROM creator_leads WHERE ${match})
    `);
    await db.execute(`
      DELETE FROM creator_lead_notes
      WHERE creator_lead_id IN (SELECT id FROM creator_leads WHERE ${match})
    `);
    await db.execute(`
      DELETE FROM creator_lead_events
      WHERE creator_lead_id IN (SELECT id FROM creator_leads WHERE ${match})
    `);
    const deleted = await db.execute(`
      DELETE FROM creator_leads
      WHERE ${match}
      RETURNING id
    `);
    const deletedRows = Array.isArray(deleted) ? deleted : ((deleted as { rows?: unknown[] }).rows ?? []);

    await db.execute(sql`
      INSERT INTO schema_migrations (migration_name, applied_at)
      VALUES (${CLEANUP_MIGRATION}, NOW())
    `);

    console.log(`[Creator Cleanup] Removed ${deletedRows.length} Zakhy HubSpot QA record(s).`);
  } catch (error) {
    // Cleanup must never prevent production from starting.
    console.error("[Creator Cleanup] HubSpot QA cleanup failed; production startup will continue.", error);
  }
}

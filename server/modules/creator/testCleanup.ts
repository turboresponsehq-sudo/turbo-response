import { sql } from "drizzle-orm";
import { getDb } from "../../db";

const CLEANUP_MIGRATION = "0022_cleanup_zakhy_hubspot_test_leads";

export async function cleanupZakhyHubSpotTestLeads() {
  const db = await getDb();
  if (!db) {
    console.warn("[Creator Cleanup] Database unavailable; skipping test-record cleanup.");
    return;
  }

  try {
    const appliedResult = await db.execute(sql`
      SELECT 1
      FROM schema_migrations
      WHERE migration_name = ${CLEANUP_MIGRATION}
      LIMIT 1
    `);
    const appliedRows = Array.isArray(appliedResult)
      ? appliedResult
      : ((appliedResult as { rows?: unknown[] }).rows ?? []);

    if (appliedRows.length) return;

    const testLeadResult = await db.execute(sql`
      SELECT id
      FROM creator_leads
      WHERE source = 'zakhy-creator-intake-internal-test'
        AND (
          full_name ILIKE 'Zakhy HubSpot%'
          OR brand_name ILIKE '%HUBSPOT%'
        )
    `);
    const testLeads = (Array.isArray(testLeadResult)
      ? testLeadResult
      : ((testLeadResult as { rows?: Array<{ id: number }> }).rows ?? [])) as Array<{ id: number }>;

    const ids = testLeads.map((row) => Number(row.id)).filter((id) => Number.isSafeInteger(id) && id > 0);

    if (ids.length) {
      await db.execute(sql`DELETE FROM creator_portals WHERE creator_lead_id = ANY(${ids}::int[])`);
      await db.execute(sql`DELETE FROM creator_follow_up_tasks WHERE creator_lead_id = ANY(${ids}::int[])`);
      await db.execute(sql`DELETE FROM creator_lead_notes WHERE creator_lead_id = ANY(${ids}::int[])`);
      await db.execute(sql`DELETE FROM creator_lead_events WHERE creator_lead_id = ANY(${ids}::int[])`);
      await db.execute(sql`DELETE FROM creator_leads WHERE id = ANY(${ids}::int[])`);
    }

    await db.execute(sql`
      INSERT INTO schema_migrations (migration_name, applied_at)
      VALUES (${CLEANUP_MIGRATION}, NOW())
    `);

    console.log(`[Creator Cleanup] Removed ${ids.length} Zakhy HubSpot internal test lead(s).`);
  } catch (error) {
    console.error("[Creator Cleanup] Failed to remove Zakhy HubSpot test leads.", error);
    throw error;
  }
}

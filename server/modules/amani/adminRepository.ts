import { sql } from "drizzle-orm";
import { getDb } from "../../db";

function rowsOf(result: unknown): any[] {
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows?: unknown[] }).rows as any[] ?? [];
  }
  return [];
}

export async function listAmaniAdminOpportunities(limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Amani inquiry storage is unavailable");
  const safeLimit = Math.min(Math.max(Number.isFinite(limit) ? Math.floor(limit) : 100, 1), 200);
  const result = await db.execute(sql`
    SELECT
      o.id,
      o.relationship_id,
      r.full_name,
      r.organization,
      r.email,
      o.opportunity_type,
      o.what_they_are_building,
      o.operating_stage,
      o.timeline,
      o.budget_range,
      o.source,
      o.status,
      o.created_at,
      o.is_internal_test
    FROM amani_creator_automations.opportunities o
    INNER JOIN amani_creator_automations.relationships r ON r.id = o.relationship_id
    ORDER BY o.created_at DESC
    LIMIT ${safeLimit}
  `);
  return rowsOf(result);
}

export async function getAmaniAdminOpportunity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Amani inquiry storage is unavailable");

  const opportunityResult = await db.execute(sql`
    SELECT
      o.*,
      r.id AS relationship_record_id,
      r.creator_client_key,
      r.email,
      r.full_name,
      r.phone,
      r.organization,
      r.contact_role,
      r.city,
      r.brand_or_social,
      r.original_source,
      r.landing_page AS relationship_landing_page,
      r.referrer,
      r.utm_data AS relationship_utm_data,
      r.relationship_type,
      r.relationship_strength,
      r.relationship_owner,
      r.implementation_owner,
      r.handoff_destination AS relationship_handoff_destination,
      r.last_contact_at,
      r.next_action AS relationship_next_action,
      r.notes AS relationship_notes,
      r.hubspot_contact_id AS relationship_hubspot_contact_id,
      r.created_at AS relationship_created_at,
      r.updated_at AS relationship_updated_at
    FROM amani_creator_automations.opportunities o
    INNER JOIN amani_creator_automations.relationships r ON r.id = o.relationship_id
    WHERE o.id = ${id}
    LIMIT 1
  `);
  const opportunity = rowsOf(opportunityResult)[0];
  if (!opportunity) return null;

  const eventsResult = await db.execute(sql`
    SELECT id, opportunity_id, event_type, actor, payload, created_at
    FROM amani_creator_automations.opportunity_events
    WHERE opportunity_id = ${id}
    ORDER BY created_at DESC
    LIMIT 200
  `);

  return { opportunity, events: rowsOf(eventsResult) };
}

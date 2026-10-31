/**
 * One-time, idempotent project setup requested for the existing FeDelvey
 * Creator Automations client on October 31, 2026. Never send invitations.
 */
import { sql } from "drizzle-orm";
import { getDb } from "../../db";

function rowsOf(result: unknown): any[] {
  if (Array.isArray(result)) return result;
  return result && typeof result === "object" && "rows" in result
    ? ((result as { rows?: any[] }).rows ?? []) : [];
}

export async function seedFeDelveyHostingTask() {
  const db = await getDb();
  if (!db) return;
  const match = await db.execute(sql`
    SELECT p.id AS portal_id
    FROM creator_portals p
    JOIN creator_leads l ON l.id = p.creator_lead_id
    WHERE l.id = 15 AND l.brand_name = 'FeDelvey'
    LIMIT 1
  `);
  const portalId = Number(rowsOf(match)[0]?.portal_id);
  if (!Number.isSafeInteger(portalId) || portalId < 1) return;

  const title = "Choose and purchase a website hosting platform";
  const inserted = await db.execute(sql`
    INSERT INTO creator_portal_items (portal_id, label, status)
    SELECT ${portalId}, ${title}, 'needed'
    WHERE NOT EXISTS (
      SELECT 1 FROM creator_portal_items
      WHERE portal_id = ${portalId} AND lower(label) = lower(${title})
    )
    RETURNING id
  `);
  const taskId = Number(rowsOf(inserted)[0]?.id);
  if (Number.isSafeInteger(taskId) && taskId > 0) {
    await db.execute(sql`
      INSERT INTO creator_portal_events (portal_id, event_type, actor, payload)
      VALUES (${portalId}, 'workspace_task_meta', 'admin-request-2026-10-31',
        ${JSON.stringify({ taskId, owner: "client", priority: "urgent" })}::jsonb)
    `);
  }

  const goal = "Launch the FeDelvey website online";
  await db.execute(sql`
    INSERT INTO creator_portal_events (portal_id, event_type, actor, payload)
    SELECT ${portalId}, 'workspace_goal', 'admin-request-2026-10-31',
      ${JSON.stringify({ title: goal })}::jsonb
    WHERE NOT EXISTS (
      SELECT 1 FROM creator_portal_events
      WHERE portal_id = ${portalId} AND event_type = 'workspace_goal'
    )
  `);
}

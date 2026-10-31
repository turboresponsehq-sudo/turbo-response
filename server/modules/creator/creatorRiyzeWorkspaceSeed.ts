/**
 * One-time RIYZE REIGN Creator Automations workspace setup, October 31, 2026.
 * Strictly scoped to existing client lead #13 / portal #12 and verified email.
 * No email or text is sent. Only a SHA-256 hash of the private invitation
 * secret is stored in source/database; the secret is never logged.
 *
 * Uses the SAME Creator Portal tables, tasks, chat and file APIs as other
 * client workspaces, but never changes any other client's records.
 */
import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb } from "../../db";

function rowsOf(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  return value && typeof value === "object" && "rows" in value
    ? ((value as { rows?: any[] }).rows ?? []) : [];
}

const RIYZE_INVITE_HASH = "a672982132be51d8cbf1d9870574cad0a644449f396112ab5be7190bd424bbb1";
const EVENT_ACTOR = "founder-approved-riyze-setup-20261031";
const MARKER = "riyze_workspace_bootstrap_20261031";

const taskSpecs: Array<{ title: string; owner: "team" | "client"; priority: "normal" | "urgent" }> = [
  { title: "Review Shopify desktop and mobile layouts", owner: "team", priority: "normal" },
  { title: "Fix website navigation, collections, product displays, and shopping bag issues", owner: "team", priority: "normal" },
  { title: "Test website performance and functionality", owner: "team", priority: "normal" },
  { title: "Prepare the unpublished website for Frederick's final approval", owner: "team", priority: "normal" },
  { title: "Review the private website preview", owner: "client", priority: "urgent" },
  { title: "Provide any missing product information, photographs, or branding materials", owner: "client", priority: "normal" },
  { title: "Approve the final website before launch", owner: "client", priority: "urgent" },
];

/** Idempotent, transactional bootstrap; never opens Shopify, DNS or checkout. */
export async function seedRiyzeCreatorWorkspace(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("RIYZE Creator workspace database unavailable");

  await db.transaction(async tx => {
    // Lock only Frederick's portal. Prevent two Render services from racing.
    const lead = rowsOf(await tx.execute(sql`
      SELECT p.id AS portal_id
      FROM creator_portals p
      JOIN creator_leads l ON l.id = p.creator_lead_id
      WHERE p.id = 12 AND l.id = 13
        AND l.brand_name = 'RIYZE REIGN'
        AND lower(l.email) = 'riyzereign45@gmail.com'
      FOR UPDATE OF p
    `))[0];
    if (!lead) return;
    const portalId = Number(lead.portal_id);

    const completed = rowsOf(await tx.execute(sql`
      SELECT id FROM creator_portal_events
      WHERE portal_id = ${portalId} AND event_type = ${MARKER}
      LIMIT 1
    `));
    if (completed.length) return;

    const credentials = rowsOf(await tx.execute(sql`
      SELECT password_hash FROM creator_portal_credentials
      WHERE portal_id = ${portalId} LIMIT 1
    `))[0];
    if (credentials?.password_hash) {
      throw new Error("RIYZE client has already created a password; refusing to invalidate access");
    }

    const goal = "Complete, test, and prepare the RIYZE REIGN Shopify website for launch.";
    const nextStep = "Review the private website preview";
    await tx.execute(sql`
      UPDATE creator_portals
      SET current_status = 'In Progress',
          current_phase = 'Shopify QA and launch preparation',
          next_step = ${nextStep},
          updated_at = NOW()
      WHERE id = ${portalId}
    `);
    await tx.execute(sql`
      INSERT INTO creator_portal_events (portal_id, event_type, actor, payload)
      VALUES (${portalId}, 'workspace_goal', ${EVENT_ACTOR},
        ${JSON.stringify({ title: goal })}::jsonb)
    `);
    await tx.execute(sql`
      INSERT INTO creator_portal_events (portal_id, event_type, actor, payload)
      VALUES (${portalId}, 'next_step_state', ${EVENT_ACTOR},
        ${JSON.stringify({ text: nextStep, owner: "client", done: false })}::jsonb)
    `);

    for (const item of taskSpecs) {
      const existing = rowsOf(await tx.execute(sql`
        SELECT id FROM creator_portal_items
        WHERE portal_id = ${portalId} AND lower(label) = lower(${item.title})
        LIMIT 1
      `))[0];
      let taskId = Number(existing?.id);
      if (!Number.isSafeInteger(taskId) || taskId <= 0) {
        const added = rowsOf(await tx.execute(sql`
          INSERT INTO creator_portal_items (portal_id, label, status)
          VALUES (${portalId}, ${item.title}, 'needed') RETURNING id
        `))[0];
        taskId = Number(added?.id);
      }
      if (!Number.isSafeInteger(taskId) || taskId <= 0)
        throw new Error("RIYZE task insert failed");
      await tx.execute(sql`
        INSERT INTO creator_portal_events (portal_id, event_type, actor, payload)
        VALUES (${portalId}, 'workspace_task_meta', ${EVENT_ACTOR},
          ${JSON.stringify({ taskId, owner: item.owner, priority: item.priority })}::jsonb)
      `);
    }

    // Invitation is created only once, without emailing or texting anyone.
    // Password creation consumes it; existing clients remain untouched.
    const newVersion = crypto.randomBytes(24).toString("base64url");
    await tx.execute(sql`
      INSERT INTO creator_portal_credentials
        (portal_id, password_hash, session_version, failed_attempts, locked_until)
      VALUES (${portalId}, NULL, ${newVersion}, 0, NULL)
      ON CONFLICT (portal_id) DO UPDATE
      SET password_hash = NULL, session_version = EXCLUDED.session_version,
          failed_attempts = 0, locked_until = NULL, updated_at = NOW()
    `);
    await tx.execute(sql`
      UPDATE creator_portals
      SET status = 'invited', access_token_hash = ${RIYZE_INVITE_HASH},
          token_expires_at = NOW() + INTERVAL '24 hours',
          invitation_sent_at = NULL, updated_at = NOW()
      WHERE id = ${portalId}
    `);
    await tx.execute(sql`
      INSERT INTO creator_portal_events (portal_id, event_type, actor, payload)
      VALUES (${portalId}, ${MARKER}, ${EVENT_ACTOR},
        ${JSON.stringify({ tasks: taskSpecs.length, delivery: "manual-unsent", oneTime: true, expiresInHours: 24 })}::jsonb)
    `);
  });
}

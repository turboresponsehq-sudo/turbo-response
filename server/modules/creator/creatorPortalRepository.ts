import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb } from "../../db";

export type CreatorPortalStatus = "disabled" | "invited" | "active";
export type CreatorProjectStatus =
  | "Intake Received"
  | "Reviewing"
  | "Awaiting Client"
  | "Planning"
  | "In Progress"
  | "Ready for Review"
  | "Completed";
export type CreatorPortalItemStatus = "needed" | "received" | "complete";

type PortalConfig = {
  status?: CreatorPortalStatus;
  currentStatus?: CreatorProjectStatus;
  currentPhase?: string;
  nextStep?: string | null;
  driveFolderUrl?: string | null;
};

function rowsOf(result: unknown): any[] {
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows?: any[] }).rows ?? [];
  }
  return [];
}

function nullable(value: string | null | undefined): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || null;
}

function tokenHash(token: string): string {
  return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

function makeToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function creatorPortalEnabled(): boolean {
  return process.env.CREATOR_PORTAL_ENABLED === "true";
}

export function createPortalToken(): { token: string; hash: string; expiresAt: Date } {
  const token = makeToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return { token, hash: tokenHash(token), expiresAt };
}

export function hashPortalToken(token: string): string {
  return tokenHash(token);
}

export async function getCreatorPortalByLeadId(creatorLeadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const result = await db.execute(sql`
    SELECT id, creator_lead_id, status, current_status, current_phase, next_step,
           drive_folder_url, invitation_sent_at, last_access_at, created_at, updated_at
    FROM creator_portals
    WHERE creator_lead_id = ${creatorLeadId}
    LIMIT 1
  `);
  return rowsOf(result)[0] ?? null;
}

export async function ensureCreatorPortal(creatorLeadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const result = await db.execute(sql`
    INSERT INTO creator_portals (creator_lead_id)
    VALUES (${creatorLeadId})
    ON CONFLICT (creator_lead_id) DO UPDATE SET updated_at = NOW()
    RETURNING id, creator_lead_id, status, current_status, current_phase, next_step,
              drive_folder_url, invitation_sent_at, last_access_at, created_at, updated_at
  `);
  return rowsOf(result)[0] ?? null;
}

export async function saveCreatorPortalConfig(input: {
  creatorLeadId: number;
  actor: string;
  config: PortalConfig;
}) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const portal = await ensureCreatorPortal(input.creatorLeadId);
  if (!portal) throw new Error("Creator portal could not be created");

  const result = await db.execute(sql`
    UPDATE creator_portals
    SET status = COALESCE(${input.config.status ?? null}, status),
        current_status = COALESCE(${input.config.currentStatus ?? null}, current_status),
        current_phase = COALESCE(${nullable(input.config.currentPhase)}, current_phase),
        next_step = ${nullable(input.config.nextStep)},
        drive_folder_url = ${nullable(input.config.driveFolderUrl)},
        updated_at = NOW()
    WHERE creator_lead_id = ${input.creatorLeadId}
    RETURNING id, creator_lead_id, status, current_status, current_phase, next_step,
              drive_folder_url, invitation_sent_at, last_access_at, created_at, updated_at
  `);
  const updated = rowsOf(result)[0] ?? null;
  if (updated) await appendPortalEvent({ portalId: Number(updated.id), eventType: "portal_config_saved", actor: input.actor });
  return updated;
}

export async function inviteCreatorPortal(input: { creatorLeadId: number; actor: string }) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const portal = await ensureCreatorPortal(input.creatorLeadId);
  if (!portal) throw new Error("Creator portal could not be created");
  const generated = createPortalToken();
  const result = await db.execute(sql`
    UPDATE creator_portals
    SET status = 'invited', access_token_hash = ${generated.hash},
        token_expires_at = ${generated.expiresAt.toISOString()},
        invitation_sent_at = NOW(), updated_at = NOW()
    WHERE creator_lead_id = ${input.creatorLeadId}
    RETURNING id, creator_lead_id, status, current_status, current_phase, next_step,
              drive_folder_url, invitation_sent_at, last_access_at, created_at, updated_at
  `);
  const updated = rowsOf(result)[0] ?? null;
  if (updated) await appendPortalEvent({ portalId: Number(updated.id), eventType: "invitation_created", actor: input.actor });
  return updated ? { portal: updated, token: generated.token, expiresAt: generated.expiresAt } : null;
}

export async function revokeCreatorPortal(input: { creatorLeadId: number; actor: string }) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const result = await db.execute(sql`
    UPDATE creator_portals
    SET status = 'disabled', access_token_hash = NULL, token_expires_at = NULL, updated_at = NOW()
    WHERE creator_lead_id = ${input.creatorLeadId}
    RETURNING id, creator_lead_id, status, current_status, current_phase, next_step,
              drive_folder_url, invitation_sent_at, last_access_at, created_at, updated_at
  `);
  const updated = rowsOf(result)[0] ?? null;
  if (updated) await appendPortalEvent({ portalId: Number(updated.id), eventType: "access_revoked", actor: input.actor });
  return updated;
}

export async function acceptCreatorPortalToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const result = await db.execute(sql`
    UPDATE creator_portals
    SET status = 'active', last_access_at = NOW(), updated_at = NOW()
    WHERE access_token_hash = ${tokenHash(token)}
      AND token_expires_at > NOW()
      AND status IN ('invited', 'active')
    RETURNING id, creator_lead_id, status
  `);
  const portal = rowsOf(result)[0] ?? null;
  if (portal) await appendPortalEvent({ portalId: Number(portal.id), eventType: "portal_accessed", actor: "creator" });
  return portal;
}

export async function getPortalForSession(portalId: number) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const result = await db.execute(sql`
    SELECT p.id, p.creator_lead_id, p.status, p.current_status, p.current_phase, p.next_step,
           p.drive_folder_url, l.full_name, l.brand_name, l.email, l.creator_type,
           l.package_interest, l.submitted_at
    FROM creator_portals p
    JOIN creator_leads l ON l.id = p.creator_lead_id
    WHERE p.id = ${portalId} AND p.status = 'active'
    LIMIT 1
  `);
  const portal = rowsOf(result)[0];
  if (!portal) return null;
  const [items, updates] = await Promise.all([
    db.execute(sql`
      SELECT id, label, status, created_at, updated_at
      FROM creator_portal_items WHERE portal_id = ${portalId}
      ORDER BY status ASC, id ASC LIMIT 100
    `),
    db.execute(sql`
      SELECT id, update_text, created_at
      FROM creator_portal_updates
      WHERE portal_id = ${portalId} AND visible_to_creator = TRUE
      ORDER BY created_at DESC, id DESC LIMIT 100
    `),
  ]);
  return { ...portal, items: rowsOf(items), updates: rowsOf(updates) };
}

export async function appendPortalEvent(input: { portalId: number; eventType: string; actor: string; payload?: Record<string, unknown> }) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  await db.execute(sql`
    INSERT INTO creator_portal_events (portal_id, event_type, actor, payload)
    VALUES (${input.portalId}, ${input.eventType}, ${input.actor}, ${JSON.stringify(input.payload ?? {})})
  `);
}

export async function createPortalUpdate(input: { creatorLeadId: number; text: string; visibleToCreator: boolean; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const portal = await ensureCreatorPortal(input.creatorLeadId);
  if (!portal) throw new Error("Creator portal could not be created");
  const result = await db.execute(sql`
    INSERT INTO creator_portal_updates (portal_id, update_text, visible_to_creator, created_by_user_id)
    VALUES (${Number(portal.id)}, ${input.text.trim()}, ${input.visibleToCreator}, ${input.userId})
    RETURNING id, update_text, visible_to_creator, created_at
  `);
  return rowsOf(result)[0] ?? null;
}

export async function createPortalItem(input: { creatorLeadId: number; label: string; status: CreatorPortalItemStatus }) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const portal = await ensureCreatorPortal(input.creatorLeadId);
  if (!portal) throw new Error("Creator portal could not be created");
  const result = await db.execute(sql`
    INSERT INTO creator_portal_items (portal_id, label, status)
    VALUES (${Number(portal.id)}, ${input.label.trim()}, ${input.status})
    RETURNING id, label, status, created_at, updated_at
  `);
  return rowsOf(result)[0] ?? null;
}

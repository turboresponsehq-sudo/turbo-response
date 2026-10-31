import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb } from "../../db";
import { invalidatePortalCredentials } from "./creatorPortalCredentials";
import { getWorkspaceData } from "./creatorWorkspaceRepository";

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
export type CreatorPortalMessageSender = "admin" | "creator";

type PortalConfig = {
  status?: CreatorPortalStatus;
  currentStatus?: CreatorProjectStatus;
  currentPhase?: string;
  nextStep?: string | null;
  nextStepOwner?: "team" | "client";
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
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, hash: tokenHash(token), expiresAt };
}

export function hashPortalToken(token: string): string {
  return tokenHash(token);
}


export type CreatorNextStepOwner = "team" | "client";
type NextStepState = { next_step_owner: CreatorNextStepOwner; next_step_done: boolean };

function normalizedOwner(value: unknown): CreatorNextStepOwner {
  return value === "client" ? "client" : "team";
}

/** Use the existing append-only portal event log for one simple next step; no migration required. */
async function readNextStepState(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, portalId: number, currentText: string | null): Promise<NextStepState> {
  const events = await db.execute(sql`
    SELECT payload FROM creator_portal_events
    WHERE portal_id = ${portalId} AND event_type = 'next_step_state'
    ORDER BY id DESC LIMIT 1
  `);
  const payload = rowsOf(events)[0]?.payload as Record<string, unknown> | undefined;
  if (!payload || payload.text !== (currentText ?? "")) {
    return { next_step_owner: "team", next_step_done: false };
  }
  return { next_step_owner: normalizedOwner(payload.owner), next_step_done: payload.done === true };
}

async function writeNextStepState(input: {
  portalId: number; text: string; owner: CreatorNextStepOwner; done: boolean; actor: string;
}) {
  await appendPortalEvent({
    portalId: input.portalId,
    eventType: "next_step_state",
    actor: input.actor,
    payload: { text: input.text, owner: input.owner, done: input.done },
  });
}

/** Admin can check either task; creator can only check their own task. */
export async function setCreatorNextStepDone(input: {
  portalId: number;
  actor: string;
  done: boolean;
  scope: "admin" | "client";
}) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const result = await db.execute(sql`
    SELECT id, status, next_step FROM creator_portals WHERE id = ${input.portalId} LIMIT 1
  `);
  const portal = rowsOf(result)[0];
  if (!portal || (input.scope === "client" && portal.status !== "active")) return null;
  const text = nullable(portal.next_step);
  if (!text) return null;
  const state = await readNextStepState(db, Number(portal.id), text);
  if (input.scope === "client" && state.next_step_owner !== "client") return null;
  if (state.next_step_done !== input.done) {
    await writeNextStepState({
      portalId: Number(portal.id), text, owner: state.next_step_owner, done: input.done, actor: input.actor,
    });
  }
  return { next_step: text, next_step_owner: state.next_step_owner, next_step_done: input.done };
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
  const portal = rowsOf(result)[0] ?? null;
  if (!portal) return null;
  return { ...portal, ...await readNextStepState(db, Number(portal.id), portal.next_step) };
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
  const previous = await readNextStepState(db, Number(portal.id), portal.next_step);
  const nextText = nullable(input.config.nextStep);
  const nextOwner = input.config.nextStepOwner ?? previous.next_step_owner;
  const changed = nextText !== nullable(portal.next_step) || nextOwner !== previous.next_step_owner;

  const result = await db.execute(sql`
    UPDATE creator_portals
    SET status = COALESCE(${input.config.status ?? null}, status),
        current_status = COALESCE(${input.config.currentStatus ?? null}, current_status),
        current_phase = COALESCE(${nullable(input.config.currentPhase)}, current_phase),
        next_step = ${nextText},
        drive_folder_url = ${nullable(input.config.driveFolderUrl)},
        updated_at = NOW()
    WHERE creator_lead_id = ${input.creatorLeadId}
    RETURNING id, creator_lead_id, status, current_status, current_phase, next_step,
              drive_folder_url, invitation_sent_at, last_access_at, created_at, updated_at
  `);
  const updated = rowsOf(result)[0] ?? null;
  if (updated) {
    if (changed) await writeNextStepState({ portalId: Number(updated.id), text: nextText ?? "", owner: nextOwner, done: false, actor: input.actor });
    await appendPortalEvent({ portalId: Number(updated.id), eventType: "portal_config_saved", actor: input.actor });
  }
  return updated ? { ...updated, next_step_owner: nextOwner, next_step_done: changed ? false : previous.next_step_done } : null;
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
  if (updated) {
    await invalidatePortalCredentials(Number(updated.id));
    await appendPortalEvent({ portalId: Number(updated.id), eventType: "invitation_created", actor: input.actor });
  }
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
  if (updated) {
    await invalidatePortalCredentials(Number(updated.id));
    await appendPortalEvent({ portalId: Number(updated.id), eventType: "access_revoked", actor: input.actor });
  }
  return updated;
}

export async function acceptCreatorPortalToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const result = await db.execute(sql`
    UPDATE creator_portals
    SET status = 'active', last_access_at = NOW(), updated_at = NOW(),
        access_token_hash = NULL, token_expires_at = NULL
    WHERE access_token_hash = ${tokenHash(token)}
      AND token_expires_at > NOW()
      AND status = 'invited'
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
  const [items, updates, messages, step, workspace] = await Promise.all([
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
    db.execute(sql`
      SELECT id, sender_type, message_text, created_at
      FROM creator_portal_messages
      WHERE portal_id = ${portalId} AND visible_to_creator = TRUE
      ORDER BY created_at ASC, id ASC LIMIT 200
    `),
    readNextStepState(db, portalId, portal.next_step),
    getWorkspaceData(portalId, String(portal.package_interest || "Your project")),
  ]);
  return { ...portal, ...step, ...workspace, items: rowsOf(items), updates: rowsOf(updates), messages: rowsOf(messages) };
}

export async function getCreatorPortalMessages(creatorLeadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const portal = await ensureCreatorPortal(creatorLeadId);
  if (!portal) throw new Error("Creator portal could not be created");
  const result = await db.execute(sql`
    SELECT id, portal_id, sender_type, message_text, visible_to_creator, created_by_user_id, created_at
    FROM creator_portal_messages
    WHERE portal_id = ${Number(portal.id)}
    ORDER BY created_at ASC, id ASC LIMIT 200
  `);
  return rowsOf(result);
}

export async function createCreatorPortalMessage(input: {
  creatorLeadId: number;
  senderType: CreatorPortalMessageSender;
  text: string;
  visibleToCreator: boolean;
  userId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Creator portal storage is unavailable");
  const portal = await ensureCreatorPortal(input.creatorLeadId);
  if (!portal) throw new Error("Creator portal could not be created");
  const result = await db.execute(sql`
    INSERT INTO creator_portal_messages (portal_id, sender_type, message_text, visible_to_creator, created_by_user_id)
    VALUES (${Number(portal.id)}, ${input.senderType}, ${input.text.trim()}, ${input.visibleToCreator}, ${input.userId ?? null})
    RETURNING id, portal_id, sender_type, message_text, visible_to_creator, created_by_user_id, created_at
  `);
  const message = rowsOf(result)[0] ?? null;
  if (message) await appendPortalEvent({ portalId: Number(portal.id), eventType: "message_created", actor: input.senderType, payload: { messageId: Number(message.id) } });
  return message;
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

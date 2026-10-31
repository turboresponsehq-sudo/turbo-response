/**
 * Creator-only project workspace. Uses existing Creator Portal tables and
 * append-only event metadata. No legacy consumer case data and no migration.
 */
import { sql } from "drizzle-orm";
import { getDb } from "../../db";

type Owner = "team" | "client";
type Priority = "urgent" | "normal";
type AttachmentKind = "file" | "link";

function rowsOf(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  return (value && typeof value === "object" && "rows" in value)
    ? ((value as { rows?: any[] }).rows ?? []) : [];
}

function normalizeOwner(value: unknown): Owner {
  return value === "team" ? "team" : "client";
}
function normalizePriority(value: unknown): Priority {
  return value === "urgent" ? "urgent" : "normal";
}

export type WorkspaceTask = { id: number; label: string; status: string; owner: Owner; priority: Priority };
export type WorkspaceAttachment = {
  id: number; kind: AttachmentKind; name: string; url?: string; size?: number; mime?: string; created_at: string;
};

export async function getWorkspaceData(portalId: number, fallbackGoal: string) {
  const db = await getDb();
  if (!db) throw new Error("Creator workspace storage is unavailable");
  const [taskRows, eventRows] = await Promise.all([
    db.execute(sql`SELECT id, label, status FROM creator_portal_items WHERE portal_id = ${portalId} ORDER BY id ASC LIMIT 100`),
    db.execute(sql`SELECT id, event_type, payload, created_at FROM creator_portal_events
      WHERE portal_id = ${portalId} AND event_type IN ('workspace_goal','workspace_task_meta','workspace_attachment')
      ORDER BY id ASC LIMIT 1000`),
  ]);
  const taskMeta = new Map<number, { owner: Owner; priority: Priority }>();
  let goal = fallbackGoal;
  const attachments: WorkspaceAttachment[] = [];
  for (const event of rowsOf(eventRows)) {
    const data = event.payload as Record<string, any> | null;
    if (!data || typeof data !== "object") continue;
    if (event.event_type === "workspace_goal" && typeof data.title === "string") {
      goal = data.title;
    } else if (event.event_type === "workspace_task_meta" && Number.isSafeInteger(Number(data.taskId))) {
      taskMeta.set(Number(data.taskId), { owner: normalizeOwner(data.owner), priority: normalizePriority(data.priority) });
    } else if (event.event_type === "workspace_attachment" && (data.kind === "link" || data.kind === "file")) {
      attachments.push({
        id: Number(event.id),
        kind: data.kind,
        name: String(data.name || "Attachment"),
        url: data.kind === "link" ? String(data.url || "") : undefined,
        size: typeof data.size === "number" ? data.size : undefined,
        mime: typeof data.mime === "string" ? data.mime : undefined,
        created_at: String(event.created_at),
      });
    }
  }
  const tasks: WorkspaceTask[] = rowsOf(taskRows).map(row => ({
    id: Number(row.id),
    label: String(row.label),
    status: String(row.status),
    owner: taskMeta.get(Number(row.id))?.owner ?? "client",
    priority: taskMeta.get(Number(row.id))?.priority ?? "normal",
  }));
  return { project_goal: goal, tasks, attachments: attachments.slice(-100).reverse() };
}

export async function setWorkspaceGoal(portalId: number, title: string, actor: string) {
  const db = await getDb();
  if (!db) throw new Error("Creator workspace storage is unavailable");
  await db.execute(sql`INSERT INTO creator_portal_events (portal_id, event_type, actor, payload)
    VALUES (${portalId}, 'workspace_goal', ${actor}, ${JSON.stringify({ title })}::jsonb)`);
  return title;
}

export async function addWorkspaceTask(portalId: number, title: string, owner: Owner, priority: Priority, actor: string) {
  const db = await getDb();
  if (!db) throw new Error("Creator workspace storage is unavailable");
  const result = await db.execute(sql`INSERT INTO creator_portal_items (portal_id, label, status)
    VALUES (${portalId}, ${title}, 'needed') RETURNING id, label, status`);
  const task = rowsOf(result)[0];
  if (!task) throw new Error("Task could not be created");
  await db.execute(sql`INSERT INTO creator_portal_events (portal_id, event_type, actor, payload)
    VALUES (${portalId}, 'workspace_task_meta', ${actor},
      ${JSON.stringify({ taskId: Number(task.id), owner, priority })}::jsonb)`);
  return { id: Number(task.id), label: task.label, status: task.status, owner, priority } as WorkspaceTask;
}

export async function updateWorkspaceTask(input: {
  portalId: number; taskId: number; done: boolean; actor: string; role: "admin" | "client";
}) {
  const db = await getDb();
  if (!db) throw new Error("Creator workspace storage is unavailable");
  const portalResult = await db.execute(sql`SELECT status FROM creator_portals WHERE id = ${input.portalId} LIMIT 1`);
  if (input.role === "client" && rowsOf(portalResult)[0]?.status !== "active") return null;
  const taskResult = await db.execute(sql`SELECT id, label, status FROM creator_portal_items
    WHERE portal_id = ${input.portalId} AND id = ${input.taskId} LIMIT 1`);
  const task = rowsOf(taskResult)[0];
  if (!task) return null;
  const eventResult = await db.execute(sql`SELECT payload FROM creator_portal_events
    WHERE portal_id = ${input.portalId} AND event_type = 'workspace_task_meta'
      AND (payload->>'taskId')::bigint = ${input.taskId}
    ORDER BY id DESC LIMIT 1`);
  const meta = rowsOf(eventResult)[0]?.payload ?? {};
  const owner = normalizeOwner(meta.owner);
  const priority = normalizePriority(meta.priority);
  if (input.role === "client" && owner !== "client") return null;
  const status = input.done ? "complete" : "needed";
  const updated = await db.execute(sql`UPDATE creator_portal_items SET status = ${status}, updated_at = NOW()
    WHERE portal_id = ${input.portalId} AND id = ${input.taskId}
    RETURNING id, label, status`);
  const row = rowsOf(updated)[0];
  if (!row) return null;
  await db.execute(sql`INSERT INTO creator_portal_events (portal_id, event_type, actor, payload)
    VALUES (${input.portalId}, 'workspace_task_checked', ${input.actor},
      ${JSON.stringify({ taskId: input.taskId, done: input.done })}::jsonb)`);
  return { id: Number(row.id), label: row.label, status: row.status, owner, priority } as WorkspaceTask;
}

export async function addWorkspaceAttachment(
  portalId: number, actor: string,
  attachment: { kind: AttachmentKind; name: string; url?: string; storageId?: string; size?: number; mime?: string },
) {
  const db = await getDb();
  if (!db) throw new Error("Creator workspace storage is unavailable");
  const result = await db.execute(sql`INSERT INTO creator_portal_events (portal_id, event_type, actor, payload)
    VALUES (${portalId}, 'workspace_attachment', ${actor}, ${JSON.stringify(attachment)}::jsonb)
    RETURNING id, created_at`);
  const row = rowsOf(result)[0];
  if (!row) throw new Error("Attachment metadata could not be saved");
  return { id: Number(row.id), kind: attachment.kind, name: attachment.name,
    url: attachment.kind === "link" ? attachment.url : undefined, size: attachment.size,
    mime: attachment.mime, created_at: String(row.created_at) };
}

export async function findWorkspaceAttachment(portalId: number, attachmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Creator workspace storage is unavailable");
  const result = await db.execute(sql`SELECT payload FROM creator_portal_events
    WHERE portal_id = ${portalId} AND id = ${attachmentId} AND event_type = 'workspace_attachment' LIMIT 1`);
  const data = rowsOf(result)[0]?.payload as Record<string, unknown> | undefined;
  if (!data || data.kind !== "file" || typeof data.storageId !== "string") return null;
  return { name: String(data.name || "attachment"), storageId: data.storageId, mime: String(data.mime || "application/octet-stream") };
}

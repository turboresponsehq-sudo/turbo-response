import { sql } from "drizzle-orm";
import { getDb } from "../../db";
import type {
  CreatorLeadInput,
  CreatorLeadNoteInput,
  CreatorLeadStatus,
  CreatorLeadTaskInput,
} from "./types";

export type CreatorLeadListItem = {
  id: number;
  fullName: string;
  brandName: string | null;
  email: string;
  creatorType: string;
  packageInterest: string | null;
  budgetRange: string | null;
  status: CreatorLeadStatus;
  submittedAt: string;
  nextAction: string | null;
  openTaskDueAt: string | null;
};

function rowsOf(result: unknown): any[] {
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows?: any[] }).rows ?? [];
  }
  return [];
}

function nullable(value: string | undefined): string | null {
  return value?.trim() || null;
}

export async function createCreatorLead(input: CreatorLeadInput, metadata: {
  referrer?: string;
  ip?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Creator lead storage is unavailable");

  const inserted = await db.execute(sql`
    INSERT INTO creator_leads (
      full_name, brand_name, email, phone, creator_type, social_links, website_url,
      goals, challenges, automation_wish, revenue_streams, additional_monetization,
      audience_location, priority_platforms, audience_size, collects_fan_contacts,
      brand_assets, brand_style, business_systems, opportunity_focus, project_priority,
      budget_range, package_interest, final_question, source, source_path, referrer,
      utm_source, utm_medium, utm_campaign, consent_at
    ) VALUES (
      ${input.fullName}, ${nullable(input.brandName)}, ${input.email.toLowerCase()},
      ${nullable(input.phone)}, ${input.creatorType}, ${JSON.stringify(input.socialLinks)},
      ${nullable(input.websiteUrl)}, ${input.goals}, ${input.challenges},
      ${nullable(input.automationWish)}, ${JSON.stringify(input.revenueStreams)},
      ${nullable(input.additionalMonetization)}, ${nullable(input.audienceLocation)},
      ${JSON.stringify(input.priorityPlatforms)}, ${nullable(input.audienceSize)},
      ${input.collectsFanContacts ?? null}, ${JSON.stringify(input.brandAssets)},
      ${nullable(input.brandStyle)}, ${JSON.stringify(input.businessSystems)},
      ${JSON.stringify(input.opportunityFocus)}, ${input.projectPriority},
      ${input.budgetRange ?? null}, ${input.packageInterest ?? null},
      ${nullable(input.finalQuestion)}, ${input.source?.trim() || "website"},
      ${nullable(input.sourcePath)}, ${nullable(metadata.referrer)},
      ${nullable(input.utm?.source)}, ${nullable(input.utm?.medium)},
      ${nullable(input.utm?.campaign)}, NOW()
    )
    RETURNING id, full_name, brand_name, email, creator_type, status, submitted_at
  `);
  const lead = rowsOf(inserted)[0];
  if (!lead) throw new Error("Creator lead was not created");

  await appendCreatorLeadEvent({
    creatorLeadId: Number(lead.id),
    eventType: "lead_created",
    actor: "public_creator_intake",
    idempotencyKey: `creator-lead:${lead.id}:created`,
    payload: {
      source: input.source?.trim() || "website",
      sourcePath: input.sourcePath?.trim() || null,
      ipRecorded: Boolean(metadata.ip),
    },
  });

  return normalizeLead(lead);
}

export async function appendCreatorLeadEvent(event: {
  creatorLeadId: number;
  eventType: string;
  actor: string;
  idempotencyKey: string;
  payload?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Creator lead storage is unavailable");

  await db.execute(sql`
    INSERT INTO creator_lead_events (
      creator_lead_id, event_type, actor, payload, idempotency_key
    ) VALUES (
      ${event.creatorLeadId}, ${event.eventType}, ${event.actor},
      ${JSON.stringify(event.payload ?? {})}, ${event.idempotencyKey}
    )
    ON CONFLICT (idempotency_key) DO NOTHING
  `);
}

export async function listCreatorLeads(limit = 100): Promise<CreatorLeadListItem[]> {
  const db = await getDb();
  if (!db) throw new Error("Creator lead storage is unavailable");
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100);

  const result = await db.execute(sql`
    SELECT
      l.id, l.full_name, l.brand_name, l.email, l.creator_type, l.package_interest,
      l.budget_range, l.status, l.submitted_at,
      task.task_detail AS next_action,
      task.due_at AS open_task_due_at
    FROM creator_leads l
    LEFT JOIN LATERAL (
      SELECT task_detail, due_at
      FROM creator_follow_up_tasks
      WHERE creator_lead_id = l.id AND status = 'open'
      ORDER BY due_at ASC NULLS LAST, id ASC
      LIMIT 1
    ) task ON TRUE
    ORDER BY l.submitted_at DESC
    LIMIT ${safeLimit}
  `);

  return rowsOf(result).map(normalizeLead);
}

export async function getCreatorLeadById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Creator lead storage is unavailable");

  const leadResult = await db.execute(sql`
    SELECT * FROM creator_leads WHERE id = ${id} LIMIT 1
  `);
  const lead = rowsOf(leadResult)[0];
  if (!lead) return null;

  const [events, notes, tasks] = await Promise.all([
    db.execute(sql`
      SELECT id, event_type, actor, payload, created_at
      FROM creator_lead_events
      WHERE creator_lead_id = ${id}
      ORDER BY created_at DESC, id DESC
      LIMIT 100
    `),
    db.execute(sql`
      SELECT id, note, author_user_id, created_at
      FROM creator_lead_notes
      WHERE creator_lead_id = ${id}
      ORDER BY created_at DESC, id DESC
      LIMIT 100
    `),
    db.execute(sql`
      SELECT id, task_type, task_detail, due_at, owner_user_id, status, completed_at, created_at
      FROM creator_follow_up_tasks
      WHERE creator_lead_id = ${id}
      ORDER BY status ASC, due_at ASC NULLS LAST, id DESC
      LIMIT 100
    `),
  ]);

  return {
    ...normalizeLead(lead),
    ...lead,
    events: rowsOf(events),
    notes: rowsOf(notes),
    tasks: rowsOf(tasks),
  };
}

export async function updateCreatorLeadStatus(input: {
  creatorLeadId: number;
  status: CreatorLeadStatus;
  actor: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Creator lead storage is unavailable");

  const result = await db.execute(sql`
    UPDATE creator_leads
    SET status = ${input.status}, updated_at = NOW()
    WHERE id = ${input.creatorLeadId}
    RETURNING id, status
  `);
  const updated = rowsOf(result)[0];
  if (!updated) return null;

  await appendCreatorLeadEvent({
    creatorLeadId: input.creatorLeadId,
    eventType: "status_changed",
    actor: input.actor,
    idempotencyKey: `creator-lead:${input.creatorLeadId}:status:${input.status}:${Date.now()}`,
    payload: { status: input.status },
  });

  return updated;
}

export async function addCreatorLeadNote(input: {
  creatorLeadId: number;
  authorUserId: number;
  note: CreatorLeadNoteInput;
}) {
  const db = await getDb();
  if (!db) throw new Error("Creator lead storage is unavailable");

  const result = await db.execute(sql`
    INSERT INTO creator_lead_notes (creator_lead_id, note, author_user_id)
    VALUES (${input.creatorLeadId}, ${input.note.note}, ${input.authorUserId})
    RETURNING id, note, author_user_id, created_at
  `);
  return rowsOf(result)[0] ?? null;
}

export async function createCreatorFollowUpTask(input: {
  creatorLeadId: number;
  ownerUserId: number;
  task: CreatorLeadTaskInput;
}) {
  const db = await getDb();
  if (!db) throw new Error("Creator lead storage is unavailable");

  const result = await db.execute(sql`
    INSERT INTO creator_follow_up_tasks (
      creator_lead_id, due_at, owner_user_id, task_type, task_detail
    ) VALUES (
      ${input.creatorLeadId}, ${input.task.dueAt ?? null}, ${input.ownerUserId},
      ${input.task.taskType}, ${nullable(input.task.taskDetail)}
    )
    RETURNING id, task_type, task_detail, due_at, status, created_at
  `);
  return rowsOf(result)[0] ?? null;
}

function normalizeLead(lead: any): CreatorLeadListItem {
  return {
    id: Number(lead.id),
    fullName: lead.full_name,
    brandName: lead.brand_name ?? null,
    email: lead.email,
    creatorType: lead.creator_type,
    packageInterest: lead.package_interest ?? null,
    budgetRange: lead.budget_range ?? null,
    status: lead.status,
    submittedAt: lead.submitted_at,
    nextAction: lead.next_action ?? null,
    openTaskDueAt: lead.open_task_due_at ?? null,
  };
}

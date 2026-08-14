import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "./db";
import { intakeLeads } from "../drizzle/schema";
import type { InsertIntakeLead, IntakeLead } from "../drizzle/schema";
import { recordNewIntakeLead } from "./services/operationalIntelligenceService";

const CREATE_INTAKE_LEADS_TABLE = sql.raw(`
  CREATE TABLE IF NOT EXISTS "intake_leads" (
    "id" serial PRIMARY KEY,
    "fullName" varchar(255) NOT NULL,
    "email" varchar(320) NOT NULL,
    "phone" varchar(100),
    "socialHandle" varchar(255),
    "situationPreview" text,
    "fullSituation" text,
    "source" varchar(50) NOT NULL DEFAULT 'intake',
    "status" varchar(50) NOT NULL DEFAULT 'new_lead',
    "adminNotes" text,
    "submittedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

/** Extract the underlying database error message from a wrapped drizzle error */
function rootCauseMessage(error: unknown): string {
  const err = error as { message?: string; cause?: { message?: string; code?: string } };
  if (err?.cause?.message) {
    return `${err.cause.code ? `[${err.cause.code}] ` : ""}${err.cause.message}`;
  }
  return err?.message || String(error);
}

/**
 * Save a new intake lead to the database.
 * If the intake_leads table does not exist yet (fresh database), create it and retry once.
 */
export async function saveIntakeLead(data: InsertIntakeLead): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(intakeLeads).values(data).returning({ id: intakeLeads.id });
    const id = Number(result[0].id);
    try {
      await recordNewIntakeLead({ leadId: id, fullName: data.fullName, email: data.email, source: data.source || "intake" });
    } catch (intelligenceError) {
      console.warn("[IntakeLeads] Operational intelligence failed (non-fatal):", rootCauseMessage(intelligenceError));
    }
    return id;
  } catch (error) {
    const causeMsg = rootCauseMessage(error);
    console.error("[IntakeLeads] Insert failed:", causeMsg);

    // If the table is missing (Postgres error 42P01: undefined_table), create it and retry once
    const cause = (error as { cause?: { code?: string } })?.cause;
    if (cause?.code === "42P01" || /does not exist|doesn't exist/i.test(causeMsg)) {
      console.warn("[IntakeLeads] intake_leads table missing — creating it now");
      await db.execute(CREATE_INTAKE_LEADS_TABLE);
      const retry = await db.insert(intakeLeads).values(data).returning({ id: intakeLeads.id });
      const id = Number(retry[0].id);
      try {
        await recordNewIntakeLead({ leadId: id, fullName: data.fullName, email: data.email, source: data.source || "intake" });
      } catch (intelligenceError) {
        console.warn("[IntakeLeads] Operational intelligence failed (non-fatal):", rootCauseMessage(intelligenceError));
      }
      return id;
    }

    throw new Error(`Could not save lead: ${causeMsg}`);
  }
}

/**
 * Get all intake leads ordered by most recent first
 */
export async function getAllIntakeLeads(limit = 100): Promise<IntakeLead[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(intakeLeads).orderBy(desc(intakeLeads.submittedAt)).limit(limit);
}

/**
 * Update the status of an intake lead
 */
export async function updateIntakeLeadStatus(
  id: number,
  status: "new_lead" | "reviewing" | "follow_up" | "converted",
  adminNotes?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Partial<InsertIntakeLead> = { status };
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  await db.update(intakeLeads).set(updateData).where(eq(intakeLeads.id, id));
}

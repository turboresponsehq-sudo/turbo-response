import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "./db";
import { intakeLeads } from "../drizzle/schema";
import type { InsertIntakeLead, IntakeLead } from "../drizzle/schema";

const CREATE_INTAKE_LEADS_TABLE = sql.raw(`
  CREATE TABLE IF NOT EXISTS \`intake_leads\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`fullName\` varchar(255) NOT NULL,
    \`email\` varchar(320) NOT NULL,
    \`phone\` varchar(100),
    \`socialHandle\` varchar(255),
    \`situationPreview\` text,
    \`fullSituation\` longtext,
    \`source\` varchar(50) NOT NULL DEFAULT 'intake',
    \`status\` enum('new_lead','reviewing','follow_up','converted') NOT NULL DEFAULT 'new_lead',
    \`adminNotes\` longtext,
    \`submittedAt\` timestamp NOT NULL DEFAULT (now()),
    \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`intake_leads_id\` PRIMARY KEY(\`id\`)
  )
`);

/** Extract the underlying MySQL error message from a wrapped drizzle error */
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
    const result = await db.insert(intakeLeads).values(data);
    return Number(result[0].insertId);
  } catch (error) {
    const causeMsg = rootCauseMessage(error);
    console.error("[IntakeLeads] Insert failed:", causeMsg);

    // If the table is missing (ER_NO_SUCH_TABLE), create it and retry once
    const cause = (error as { cause?: { code?: string; errno?: number } })?.cause;
    if (cause?.code === "ER_NO_SUCH_TABLE" || cause?.errno === 1146 || /doesn't exist/i.test(causeMsg)) {
      console.warn("[IntakeLeads] intake_leads table missing — creating it now");
      await db.execute(CREATE_INTAKE_LEADS_TABLE);
      const retry = await db.insert(intakeLeads).values(data);
      return Number(retry[0].insertId);
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

import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { intakeLeads, type InsertIntakeLead, type IntakeLead } from "../drizzle/schema";

/**
 * Save a new intake lead to the database
 */
export async function saveIntakeLead(data: InsertIntakeLead): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(intakeLeads).values(data);
  return Number(result[0].insertId);
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

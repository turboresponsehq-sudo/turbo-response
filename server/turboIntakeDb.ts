import { eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  turboIntakeSubmissions,
  type TurboIntakeSubmission,
  type InsertTurboIntakeSubmission,
} from "../drizzle/schema";

/**
 * Create a new Turbo Intake submission
 */
export async function createIntakeSubmission(data: InsertTurboIntakeSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [submission] = await db.insert(turboIntakeSubmissions).values(data).$returningId();
  return submission.id;
}

/**
 * Get all Turbo Intake submissions (for admin dashboard)
 */
export async function getAllIntakeSubmissions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(turboIntakeSubmissions)
    .orderBy(turboIntakeSubmissions.createdAt);
}

/**
 * Get a single submission by ID
 */
export async function getIntakeSubmissionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [submission] = await db
    .select()
    .from(turboIntakeSubmissions)
    .where(eq(turboIntakeSubmissions.id, id))
    .limit(1);

  return submission;
}

/**
 * Get a single submission by submission ID (e.g., TURBO-INTAKE-20251107-211806)
 */
export async function getIntakeSubmissionBySubmissionId(submissionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [submission] = await db
    .select()
    .from(turboIntakeSubmissions)
    .where(eq(turboIntakeSubmissions.submissionId, submissionId))
    .limit(1);

  return submission;
}

/**
 * Update submission with audit report path (Layer 1)
 */
export async function markAuditGenerated(id: number, reportPath: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(turboIntakeSubmissions)
    .set({
      auditGenerated: 1,
      auditGeneratedAt: new Date(),
      auditReportPath: reportPath,
      status: "audit_generated",
    })
    .where(eq(turboIntakeSubmissions.id, id));
}

/**
 * Update submission with blueprint report path (Layer 2)
 */
export async function markBlueprintGenerated(id: number, reportPath: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(turboIntakeSubmissions)
    .set({
      blueprintGenerated: 1,
      blueprintGeneratedAt: new Date(),
      blueprintReportPath: reportPath,
      status: "blueprint_generated",
    })
    .where(eq(turboIntakeSubmissions.id, id));
}

/**
 * Mark submission as completed
 */
export async function markIntakeCompleted(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(turboIntakeSubmissions)
    .set({
      status: "completed",
    })
    .where(eq(turboIntakeSubmissions.id, id));
}


import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "../drizzle/schema";
import type { InsertUser } from "../drizzle/schema";

import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Determine SSL settings from the connection string.
 * Render Postgres (external hostnames) requires SSL; localhost does not.
 */
function sslConfig(connectionString: string) {
  if (/localhost|127\.0\.0\.1/.test(connectionString)) return undefined;
  return { rejectUnauthorized: false };
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pgModule = await import("pg");
      const Pool = pgModule.Pool ?? (pgModule as any).default?.Pool;
      const connectionString = process.env.DATABASE_URL;
      const pool = new Pool({
        connectionString,
        ssl: sslConfig(connectionString),
        max: 10,
        connectionTimeoutMillis: 10000,
      });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date().toISOString();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date().toISOString();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * List all cases from the cases table.
 *
 * Uses raw SQL to match the actual production schema (full_name, case_number,
 * email, case_details, etc.) rather than the drizzle schema which has
 * different column names (clientName, conversationId, etc.).
 *
 * Returns rows normalized to the shape both AdminDashboard and AdminCasesList
 * expect: { id, case_number, full_name, client_name, email, client_email,
 *           phone, category, status, title, description, case_details,
 *           case_type, payment_status, funnel_stage, createdAt, created_at }
 */
export async function listCases() {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot list cases: database not available');
    return [];
  }

  try {
    const result = await db.execute(`
      SELECT
        id,
        case_number,
        full_name,
        email,
        phone,
        category,
        status,
        case_details,
        case_type,
        title,
        payment_status,
        payment_amount,
        funnel_stage,
        portal_enabled,
        created_at,
        updated_at
      FROM cases
      ORDER BY created_at DESC
    `);

    // drizzle node-postgres execute returns a pg QueryResult: { rows: [...] }
    const rows: any[] = (result as any).rows ?? (result as any);

    // Normalize to the shape the frontend expects
    return rows.map((r: any) => ({
      id: r.id,
      case_number: r.case_number,
      // AdminDashboard uses full_name; AdminCasesList uses client_name
      full_name: r.full_name,
      client_name: r.full_name,
      email: r.email,
      client_email: r.email,
      phone: r.phone,
      category: r.category,
      status: r.status,
      case_details: r.case_details,
      description: r.case_details,
      title: r.title || r.case_number || `Case #${r.id}`,
      case_type: r.case_type,
      payment_status: r.payment_status,
      payment_amount: r.payment_amount,
      funnel_stage: r.funnel_stage,
      portal_enabled: r.portal_enabled,
      createdAt: r.created_at,
      created_at: r.created_at,
    }));
  } catch (error) {
    console.error('[Database] Failed to list cases:', error);
    return [];
  }
}

/**
 * Create a new case in the cases table.
 * Maps camelCase input to the snake_case columns in the real production schema.
 */
export async function createCase(caseData: any) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  try {
    const caseNumber = caseData.caseNumber || `TR-${Date.now()}`;
    const fullName = caseData.clientName || caseData.full_name || caseData.client_name || 'Unknown';
    const email = caseData.clientEmail || caseData.email || caseData.client_email || '';
    const phone = caseData.clientPhone || caseData.phone || caseData.client_phone || null;
    const category = caseData.category || 'general';
    const status = caseData.status || 'open';
    const caseDetails = caseData.description || caseData.case_details || null;
    const title = caseData.title || null;
    const caseType = caseData.caseType || caseData.case_type || null;

    const result = await db.execute(sql`
      INSERT INTO cases (case_number, full_name, email, phone, category, status, case_details, title, case_type)
      VALUES (
        ${caseNumber}, ${fullName}, ${email}, ${phone}, ${category}, ${status}, ${caseDetails}, ${title}, ${caseType}
      )
      RETURNING id, case_number
    `);
    return result;
  } catch (error) {
    console.error('[Database] Failed to create case:', error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.

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
 * Treat only clearly closed states as inactive so the Command Center can surface
 * real open legacy cases without copying them into the newer Workspace tables.
 */
export function isActiveOperationalCase(caseRecord: { status?: string | null }) {
  const status = caseRecord.status?.trim().toLowerCase();
  return !["closed", "completed", "archived", "resolved", "cancelled"].includes(status || "");
}

/**
 * Compact, read-only summary of the established operational records that predate
 * the Workspace subsystem. This intentionally references each source in place.
 */
export async function getOperationalCaseSummary() {
  const db = await getDb();
  if (!db) {
    return {
      cases: [],
      activeCaseCount: 0,
      caseDocumentCount: 0,
      caseAnalysisCount: 0,
      aiBriefCount: 0,
      workspaceAiAnalysisCount: 0,
      unreadMessageCount: 0,
      businessIntakeCount: 0,
      businessSubmissionCount: 0,
      fileUploadCount: 0,
      hubSpotConfigured: Boolean(process.env.HUBSPOT_PRIVATE_APP_TOKEN),
    };
  }

  const [cases, summaryResult] = await Promise.all([
    listCases(),
    db.execute(`
      SELECT
        (SELECT COUNT(*) FROM case_documents) AS case_document_count,
        (SELECT COUNT(*) FROM case_analyses) AS case_analysis_count,
        (SELECT COUNT(*) FROM ai_briefs) AS ai_brief_count,
        (SELECT COUNT(*) FROM workspace_ai_analyses) AS workspace_ai_analysis_count,
        (SELECT COALESCE(SUM(COALESCE(unread_messages_count, 0)), 0) FROM cases)
          + (SELECT COALESCE(SUM(COALESCE(unread_messages_count, 0)), 0) FROM business_intakes)
          AS unread_message_count,
        (SELECT COUNT(*) FROM business_intakes) AS business_intake_count,
        (SELECT COUNT(*) FROM business_submissions) AS business_submission_count,
        (SELECT COUNT(*) FROM file_uploads) AS file_upload_count
    `),
  ]);

  const row = ((summaryResult as any).rows ?? summaryResult as any)[0] ?? {};
  const asNumber = (value: unknown) => Number(value ?? 0);

  return {
    cases,
    activeCaseCount: cases.filter(isActiveOperationalCase).length,
    caseDocumentCount: asNumber(row.case_document_count),
    caseAnalysisCount: asNumber(row.case_analysis_count),
    aiBriefCount: asNumber(row.ai_brief_count),
    workspaceAiAnalysisCount: asNumber(row.workspace_ai_analysis_count),
    unreadMessageCount: asNumber(row.unread_message_count),
    businessIntakeCount: asNumber(row.business_intake_count),
    businessSubmissionCount: asNumber(row.business_submission_count),
    fileUploadCount: asNumber(row.file_upload_count),
    hubSpotConfigured: Boolean(process.env.HUBSPOT_PRIVATE_APP_TOKEN),
  };
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

/**
 * Fetch a single case by ID — returns all columns the AdminCaseDetail page needs.
 */
export async function getCaseById(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.execute(sql`
    SELECT
      id, case_number, full_name, email, phone, address,
      category, status, case_details, description, case_type, title,
      payment_status, payment_amount, payment_plan, payment_link,
      payment_verified, payment_verified_at, payment_verified_by, payment_method,
      funnel_stage, portal_enabled, client_status, client_notes,
      pricing_tier, pricing_tier_amount, pricing_tier_name,
      blueprint_generated, blueprint_content, blueprint_generated_at,
      documents, internal_notes, priority, drive_folder_link,
      business_name, website_url, instagram_url, tiktok_url, facebook_url, youtube_url,
      primary_goal, target_authority, estimated_amount,
      client_account_created, client_user_id,
      terms_accepted_at, terms_accepted_ip,
      unread_messages_count,
      stage, amount, deadline, stripe_payment_id, entity_type, link_in_bio,
      created_at, updated_at
    FROM cases
    WHERE id = ${id}
    LIMIT 1
  `);

  const rows: any[] = (result as any).rows ?? (result as any);
  if (!rows.length) return null;

  const r = rows[0];
  return {
    ...r,
    // Aliases so the frontend works regardless of which key it uses
    client_name: r.full_name,
    client_email: r.email,
    case_details: r.case_details || r.description,
    description: r.case_details || r.description,
    title: r.title || r.case_number || `Case #${r.id}`,
    createdAt: r.created_at,
    documents: r.documents ?? [],
  };
}

/**
 * Update mutable fields on a case row.
 * Accepts any subset of the updatable columns.
 */
export async function updateCase(id: number, updates: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Build SET clause dynamically from the updates object
  const allowed = [
    'status', 'case_details', 'description', 'title', 'category',
    'client_status', 'client_notes', 'payment_link', 'portal_enabled',
    'funnel_stage', 'payment_status', 'payment_amount', 'payment_plan',
    'payment_verified', 'payment_verified_at', 'payment_verified_by', 'payment_method',
    'pricing_tier', 'pricing_tier_amount', 'pricing_tier_name',
    'blueprint_generated', 'blueprint_content', 'blueprint_generated_at',
    'internal_notes', 'priority', 'drive_folder_link',
    'documents', 'address', 'phone',
  ];

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  for (const key of allowed) {
    if (key in updates) {
      setClauses.push(`${key} = $${paramIdx}`);
      values.push(updates[key]);
      paramIdx++;
    }
  }

  if (!setClauses.length) return;

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const pgModule = await import('pg');
  const Pool = pgModule.Pool ?? (pgModule as any).default?.Pool;
  const connectionString = process.env.DATABASE_URL!;
  const pool = new Pool({ connectionString, ssl: sslConfig(connectionString) });
  try {
    await pool.query(
      `UPDATE cases SET ${setClauses.join(', ')} WHERE id = $${paramIdx}`,
      values
    );
  } finally {
    await pool.end();
  }
}

/**
 * Delete a case by ID.
 */
export async function deleteCase(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.execute(sql`DELETE FROM cases WHERE id = ${id}`);
}

// TODO: add feature queries here as your schema grows.

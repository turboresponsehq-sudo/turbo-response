import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, cases, leads } from "../drizzle/schema";
import type { InsertUser } from "../drizzle/schema";
import { desc } from "drizzle-orm";

import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
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
 * List all cases from leads table
 */
export async function listCases() {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot list cases: database not available');
    return [];
  }

  try {
    // Query leads table which contains the actual cases
    const result = await db.select({
      id: cases.id,
      conversationId: cases.conversationId,
      client_name: cases.clientName,
      client_email: cases.clientEmail,
      client_phone: cases.clientPhone,
      title: cases.title,
      category: cases.category,
      description: cases.description,
      status: cases.status,
      createdAt: cases.createdAt,
    }).from(cases).orderBy(desc(cases.createdAt));
    return result;
  } catch (error) {
    console.error('[Database] Failed to list cases:', error);
    return [];
  }
}

/**
 * Create a new case in leads table
 */
export async function createCase(caseData: any) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  try {
    const result = await db.insert(cases).values({
      clientName: caseData.clientName || null,
      clientEmail: caseData.clientEmail || null,
      clientPhone: caseData.clientPhone || null,
      title: caseData.title || null,
      category: caseData.category || null,
      description: caseData.description || null,
      status: caseData.status || 'open',
      conversationId: caseData.conversationId || null,
    });
    return result;
  } catch (error) {
    console.error('[Database] Failed to create case:', error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.

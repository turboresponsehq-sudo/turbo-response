import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, screenshots, Screenshot, InsertScreenshot } from "../drizzle/schema";
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
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
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
 * Save a screenshot with metadata
 */
export async function saveScreenshot(screenshot: InsertScreenshot): Promise<Screenshot | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save screenshot: database not available");
    return null;
  }

  try {
    const result = await db.insert(screenshots).values(screenshot);
    const id = result[0];
    
    if (id) {
      const saved = await db.select().from(screenshots).where(eq(screenshots.id, id)).limit(1);
      return saved.length > 0 ? saved[0] : null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to save screenshot:", error);
    throw error;
  }
}

/**
 * Get all screenshots for a user
 */
export async function getUserScreenshots(userId: number): Promise<Screenshot[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get screenshots: database not available");
    return [];
  }

  try {
    const result = await db.select().from(screenshots).where(eq(screenshots.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get screenshots:", error);
    return [];
  }
}

/**
 * Get a single screenshot by ID
 */
export async function getScreenshot(id: number): Promise<Screenshot | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get screenshot: database not available");
    return null;
  }

  try {
    const result = await db.select().from(screenshots).where(eq(screenshots.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get screenshot:", error);
    return null;
  }
}

/**
 * Mark a screenshot as saved (prevents auto-delete)
 */
export async function markScreenshotAsSaved(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update screenshot: database not available");
    return;
  }

  try {
    await db.update(screenshots).set({ isSaved: 1 }).where(eq(screenshots.id, id));
  } catch (error) {
    console.error("[Database] Failed to mark screenshot as saved:", error);
    throw error;
  }
}

/**
 * Delete a screenshot record
 */
export async function deleteScreenshot(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete screenshot: database not available");
    return;
  }

  try {
    await db.delete(screenshots).where(eq(screenshots.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete screenshot:", error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.

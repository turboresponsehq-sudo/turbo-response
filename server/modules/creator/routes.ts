import { Router, type RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { sql } from "drizzle-orm";
import { getDb } from "../../db";
import { getWorkspaceData, linkWorkspaceAttachment } from "./creatorWorkspaceRepository";
import { registerCreatorWorkspaceRoutes } from "./creatorWorkspaceRoutes";
import { workspaceEmailNotice } from "./creatorMessageNotification";
import { claimCreatorInvite, loginCreatorPassword, checkCreatorSessionVersion, validCreatorPassword } from "./creatorPortalCredentials";
import {
  addCreatorLeadNote,
  createCreatorFollowUpTask,
  createCreatorLead,
  getCreatorLeadById,
  listCreatorLeads,
  updateCreatorLeadStatus,
} from "./creatorLeadRepository";
import {
  creatorLeadInputSchema,
  creatorLeadNoteSchema,
  creatorLeadStatusSchema,
  creatorLeadTaskSchema,
} from "./types";
import { processCreatorLeadEmailWorkflow } from "./emailWorkflow";
import { creatorLeadCaptureEnabled } from "./featureGate";
import { syncContactToHubSpot } from "../../hubspotSync";
import { getAmaniAdminOpportunity, listAmaniAdminOpportunities } from "../amani/adminRepository";
import {
  createCreatorPortalMessage,
  createPortalItem,
  createPortalUpdate,
  creatorPortalEnabled,
  getCreatorPortalByLeadId,
  getCreatorPortalMessages,
  ensureCreatorPortal,
  getPortalForSession,
  inviteCreatorPortal,
  revokeCreatorPortal,
  saveCreatorPortalConfig,
  setCreatorNextStepDone,
} from "./creatorPortalRepository";

export const creatorRouter = Router();

// Creator V1 remains closed until the additive PostgreSQL migration is applied
// and a release is explicitly approved. This prevents traffic from reaching
// the module while it is only prepared in source control.
creatorRouter.use("/creator", (_req, res, next) => {
  const portalRequest = _req.originalUrl.includes("/portal");
  if (!creatorLeadCaptureEnabled() && !(portalRequest && creatorPortalEnabled())) {
    return res.status(404).json({ error: "Not found" });
  }
  return next();
});

const intakeAttempts = new Map<string, number[]>();
const MAX_ATTEMPTS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function clientKey(req: any): string {
  return req.ip || req.headers["x-forwarded-for"] || "unknown";
}

function allowIntakeAttempt(key: string): boolean {
  const now = Date.now();
  const recent = (intakeAttempts.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= MAX_ATTEMPTS_PER_WINDOW) {
    intakeAttempts.set(key, recent);
    return false;
  }
  recent.push(now);
  intakeAttempts.set(key, recent);
  return true;
}

function safeLeadId(value: string): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function requireRoles(allowedRoles: string[]): RequestHandler {
  return async (req: any, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Admin authentication required" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("[Creator] Admin access unavailable: JWT secret missing");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const claims = jwt.verify(authorization.slice(7), secret) as {
      userId?: number | string;
      email?: string;
      role?: string;
    };
    const userId = Number(claims.userId);
    if (!allowedRoles.includes(String(claims.role)) || !Number.isSafeInteger(userId) || userId < 1) {
      return res.status(403).json({ error: "Insufficient admin access" });
    }

    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Creator lead storage is unavailable" });
    const userResult = await db.execute(sql`
      SELECT id, email, role FROM users WHERE id = ${userId} LIMIT 1
    `);
    const users = Array.isArray(userResult)
      ? userResult
      : ((userResult as { rows?: unknown[] }).rows ?? []);
    const user = users[0] as { id: number; email?: string; role?: string } | undefined;
    if (!user || !allowedRoles.includes(String(user.role)) || (claims.email && user.email?.toLowerCase() !== claims.email.toLowerCase())) {
      return res.status(403).json({ error: "Insufficient admin access" });
    }

    req.creatorAdmin = { id: user.id, email: user.email || "admin" };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired admin session" });
  }
  };
}

export const requireCreatorAdmin: RequestHandler = requireRoles(["admin"]);
export const requireAmaniAdmin: RequestHandler = requireRoles(["admin", "amani_admin"]);

let networkStorageReady: Promise<void> | null = null;

function networkSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function normalizeNetworkPhone(value: string) {
  return value.replace(/\D/g, "");
}

function networkRows(result: any): any[] {
  return Array.isArray(result) ? result : ((result as { rows?: unknown[] }).rows ?? []);
}

function parseSocialLinks(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry: any) => ({
      platform: String(entry?.platform || "").trim().slice(0, 40),
      url: String(entry?.url || "").trim().slice(0, 1000),
      handle: String(entry?.handle || "").trim().slice(0, 160),
    }))
    .filter((entry) => entry.url && /^https?:\/\//i.test(entry.url))
    .slice(0, 12);
}

async function ensureNetworkStorage() {
  if (networkStorageReady) return networkStorageReady;
  networkStorageReady = (async () => {
    const db = await getDb();
    if (!db) throw new Error("Network contact storage is unavailable");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS zakhy_network_contacts (
        id BIGSERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        where_met TEXT NOT NULL,
        profession TEXT NOT NULL,
        company TEXT NULL,
        notes TEXT NULL,
        follow_up_at TIMESTAMPTZ NULL,
        follow_up_done BOOLEAN NOT NULL DEFAULT FALSE,
        created_by_user_id BIGINT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`ALTER TABLE zakhy_network_contacts ADD COLUMN IF NOT EXISTS email TEXT NULL`);
    await db.execute(sql`ALTER TABLE zakhy_network_contacts ADD COLUMN IF NOT EXISTS photo_url TEXT NULL`);
    await db.execute(sql`ALTER TABLE zakhy_network_contacts ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT FALSE`);
    await db.execute(sql`ALTER TABLE zakhy_network_contacts ADD COLUMN IF NOT EXISTS is_priority BOOLEAN NOT NULL DEFAULT FALSE`);
    await db.execute(sql`ALTER TABLE zakhy_network_contacts ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '[]'::jsonb`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS zakhy_network_categories (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        sort_order INTEGER NOT NULL DEFAULT 100,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS zakhy_network_contact_categories (
        contact_id BIGINT NOT NULL REFERENCES zakhy_network_contacts(id) ON DELETE CASCADE,
        category_id BIGINT NOT NULL REFERENCES zakhy_network_categories(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (contact_id, category_id)
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_zakhy_network_contacts_follow_up ON zakhy_network_contacts (follow_up_done, follow_up_at)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_zakhy_network_contacts_created ON zakhy_network_contacts (created_at DESC)`);
    await db.execute(sql`
      INSERT INTO zakhy_network_categories (name, slug, sort_order)
      VALUES
        ('Music / Artists','music-artists',10),
        ('Influencers / Content Creators','influencers-content-creators',20),
        ('Restaurants / Hospitality','restaurants-hospitality',30),
        ('Financial Services','financial-services',40),
        ('Entrepreneurs / Business Owners','entrepreneurs-business-owners',50),
        ('Politics / Community Leaders','politics-community-leaders',60),
        ('Fashion / Streetwear','fashion-streetwear',70),
        ('Real Estate','real-estate',80),
        ('Technology','technology',90),
        ('Other','other',100)
      ON CONFLICT (slug) DO NOTHING
    `);
    await db.execute(sql`
      INSERT INTO schema_migrations (migration_name, applied_at)
      SELECT '0024_create_zakhy_network_crm_phase1', NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM schema_migrations WHERE migration_name = '0024_create_zakhy_network_crm_phase1'
      )
    `);
  })().catch((error) => {
    networkStorageReady = null;
    throw error;
  });
  return networkStorageReady;
}

async function setNetworkCategories(db: any, contactId: number, categoryIds: number[]) {
  const safeIds = Array.from(new Set(categoryIds.filter((id) => Number.isSafeInteger(id) && id > 0))).slice(0, 12);
  await db.execute(sql`DELETE FROM zakhy_network_contact_categories WHERE contact_id = ${contactId}`);
  for (const categoryId of safeIds) {
    await db.execute(sql`
      INSERT INTO zakhy_network_contact_categories (contact_id, category_id)
      SELECT ${contactId}, id FROM zakhy_network_categories WHERE id = ${categoryId} AND is_active = TRUE
      ON CONFLICT DO NOTHING
    `);
  }
}

creatorRouter.get("/creator/admin/network/categories", requireCreatorAdmin, async (_req: any, res) => {
  try {
    await ensureNetworkStorage();
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Network storage unavailable" });
    const result = await db.execute(sql`
      SELECT id, name, slug, sort_order, is_active
      FROM zakhy_network_categories
      WHERE is_active = TRUE
      ORDER BY sort_order, name
    `);
    return res.json({ success: true, categories: networkRows(result) });
  } catch (error) {
    console.error("[ZAKHY Network] Category list failed", error);
    return res.status(503).json({ error: "Unable to load categories" });
  }
});

creatorRouter.post("/creator/admin/network/categories", requireCreatorAdmin, async (req: any, res) => {
  const name = String(req.body?.name || "").trim().slice(0, 100);
  const slug = networkSlug(name);
  if (!name || !slug) return res.status(400).json({ error: "Category name is required" });
  try {
    await ensureNetworkStorage();
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Network storage unavailable" });
    const result = await db.execute(sql`
      INSERT INTO zakhy_network_categories (name, slug, sort_order, is_active)
      VALUES (${name}, ${slug}, 100, TRUE)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, is_active = TRUE, updated_at = NOW()
      RETURNING id, name, slug, sort_order, is_active
    `);
    return res.status(201).json({ success: true, category: networkRows(result)[0] });
  } catch (error) {
    console.error("[ZAKHY Network] Category create failed", error);
    return res.status(503).json({ error: "Unable to save category" });
  }
});

creatorRouter.patch("/creator/admin/network/categories/:categoryId", requireCreatorAdmin, async (req: any, res) => {
  const categoryId = Number(req.params.categoryId);
  const name = String(req.body?.name || "").trim().slice(0, 100);
  if (!Number.isSafeInteger(categoryId) || categoryId < 1 || !name) return res.status(400).json({ error: "Valid category is required" });
  try {
    await ensureNetworkStorage();
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Network storage unavailable" });
    const result = await db.execute(sql`
      UPDATE zakhy_network_categories
      SET name = ${name}, updated_at = NOW()
      WHERE id = ${categoryId}
      RETURNING id, name, slug, sort_order, is_active
    `);
    const category = networkRows(result)[0];
    if (!category) return res.status(404).json({ error: "Category not found" });
    return res.json({ success: true, category });
  } catch (error) {
    console.error("[ZAKHY Network] Category update failed", error);
    return res.status(503).json({ error: "Unable to update category" });
  }
});

creatorRouter.get("/creator/admin/network", requireCreatorAdmin, async (req: any, res) => {
  try {
    await ensureNetworkStorage();
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Network contact storage is unavailable" });
    const query = String(req.query.q || "").trim().toLowerCase().slice(0, 120);
    const categoryId = Number(req.query.categoryId || 0);
    const favoritesOnly = req.query.favorites === "true";
    const priorityOnly = req.query.priority === "true";
    const result = await db.execute(sql`
      SELECT c.id, c.full_name, c.phone, c.email, c.where_met, c.profession, c.company, c.notes,
             c.photo_url, c.social_links, c.is_favorite, c.is_priority,
             c.follow_up_at, c.follow_up_done, c.created_at, c.updated_at,
             COALESCE(
               json_agg(json_build_object('id', cat.id, 'name', cat.name, 'slug', cat.slug) ORDER BY cat.sort_order, cat.name)
               FILTER (WHERE cat.id IS NOT NULL), '[]'::json
             ) AS categories
      FROM zakhy_network_contacts c
      LEFT JOIN zakhy_network_contact_categories cc ON cc.contact_id = c.id
      LEFT JOIN zakhy_network_categories cat ON cat.id = cc.category_id AND cat.is_active = TRUE
      WHERE
        (${query} = '' OR LOWER(c.full_name) LIKE ${"%" + query + "%"} OR LOWER(COALESCE(c.company,'')) LIKE ${"%" + query + "%"} OR LOWER(c.profession) LIKE ${"%" + query + "%"} OR LOWER(COALESCE(cat.name,'')) LIKE ${"%" + query + "%"})
        AND (${favoritesOnly} = FALSE OR c.is_favorite = TRUE)
        AND (${priorityOnly} = FALSE OR c.is_priority = TRUE)
        AND (${Number.isSafeInteger(categoryId) && categoryId > 0 ? categoryId : 0} = 0 OR cat.id = ${Number.isSafeInteger(categoryId) && categoryId > 0 ? categoryId : 0})
      GROUP BY c.id
      ORDER BY LOWER(c.full_name), c.created_at DESC
      LIMIT 500
    `);
    return res.json({ success: true, contacts: networkRows(result) });
  } catch (error) {
    console.error("[ZAKHY Network] List failed", error);
    return res.status(503).json({ error: "Unable to load network contacts" });
  }
});

creatorRouter.get("/creator/admin/network/:contactId", requireCreatorAdmin, async (req: any, res) => {
  const contactId = Number(req.params.contactId);
  if (!Number.isSafeInteger(contactId) || contactId < 1) return res.status(400).json({ error: "Invalid contact" });
  try {
    await ensureNetworkStorage();
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Network storage unavailable" });
    const result = await db.execute(sql`
      SELECT c.id, c.full_name, c.phone, c.email, c.where_met, c.profession, c.company, c.notes,
             c.photo_url, c.social_links, c.is_favorite, c.is_priority,
             c.follow_up_at, c.follow_up_done, c.created_at, c.updated_at,
             COALESCE(
               json_agg(json_build_object('id', cat.id, 'name', cat.name, 'slug', cat.slug) ORDER BY cat.sort_order, cat.name)
               FILTER (WHERE cat.id IS NOT NULL), '[]'::json
             ) AS categories
      FROM zakhy_network_contacts c
      LEFT JOIN zakhy_network_contact_categories cc ON cc.contact_id = c.id
      LEFT JOIN zakhy_network_categories cat ON cat.id = cc.category_id AND cat.is_active = TRUE
      WHERE c.id = ${contactId}
      GROUP BY c.id
    `);
    const contact = networkRows(result)[0];
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    return res.json({ success: true, contact });
  } catch (error) {
    console.error("[ZAKHY Network] Contact load failed", error);
    return res.status(503).json({ error: "Unable to load contact" });
  }
});

creatorRouter.post("/creator/admin/network", requireCreatorAdmin, async (req: any, res) => {
  try {
    await ensureNetworkStorage();
    const fullName = String(req.body?.fullName || "").trim();
    const phone = String(req.body?.phone || "").replace(/[^0-9+]/g, "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 320) || null;
    const whereMet = String(req.body?.whereMet || "").trim();
    const profession = String(req.body?.profession || "").trim();
    const company = String(req.body?.company || "").trim() || null;
    const notes = String(req.body?.notes || "").trim() || null;
    const photoUrl = String(req.body?.photoUrl || "").trim().slice(0, 1000) || null;
    const socialLinks = parseSocialLinks(req.body?.socialLinks);
    const categoryIds = Array.isArray(req.body?.categoryIds) ? req.body.categoryIds.map(Number) : [];
    const followUpAtRaw = String(req.body?.followUpAt || "").trim();
    const followUpAt = followUpAtRaw ? new Date(followUpAtRaw) : null;
    const isFavorite = req.body?.isFavorite === true;
    const isPriority = req.body?.isPriority === true;

    if (!fullName || !phone || !whereMet || !profession) {
      return res.status(400).json({ error: "Name, phone, where you met, and profession are required" });
    }
    if (phone.length > 30 || fullName.length > 180 || whereMet.length > 250 || profession.length > 180) {
      return res.status(400).json({ error: "One or more fields are too long" });
    }
    if (followUpAt && Number.isNaN(followUpAt.getTime())) return res.status(400).json({ error: "Invalid follow-up date" });

    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Network contact storage is unavailable" });

    const normalizedPhone = normalizeNetworkPhone(phone);
    const duplicate = await db.execute(sql`
      SELECT id, full_name
      FROM zakhy_network_contacts
      WHERE (${normalizedPhone} <> '' AND regexp_replace(phone, '[^0-9]', '', 'g') = ${normalizedPhone})
         OR (${email || ""} <> '' AND LOWER(COALESCE(email,'')) = ${email || ""})
      LIMIT 1
    `);
    const existing = networkRows(duplicate)[0];
    if (existing) return res.status(409).json({ error: "This person may already be in My Network", existingContactId: existing.id, existingName: existing.full_name });

    const result = await db.execute(sql`
      INSERT INTO zakhy_network_contacts
        (full_name, phone, email, where_met, profession, company, notes, photo_url, social_links,
         is_favorite, is_priority, follow_up_at, created_by_user_id)
      VALUES
        (${fullName}, ${phone}, ${email}, ${whereMet}, ${profession}, ${company}, ${notes}, ${photoUrl},
         ${JSON.stringify(socialLinks)}::jsonb, ${isFavorite}, ${isPriority},
         ${followUpAt ? followUpAt.toISOString() : null}, ${req.creatorAdmin.id})
      RETURNING id, full_name, phone, email, where_met, profession, company, notes, photo_url, social_links,
                is_favorite, is_priority, follow_up_at, follow_up_done, created_at, updated_at
    `);
    const inserted = networkRows(result)[0];
    const contactId = Number(inserted?.id);
    if (!contactId) throw new Error("Contact insert failed");
    await setNetworkCategories(db, contactId, categoryIds);
    return res.status(201).json({ success: true, contactId, contact: { ...inserted, categories: [] } });
  } catch (error) {
    console.error("[ZAKHY Network] Create failed", error);
    return res.status(503).json({ error: "Unable to save network contact" });
  }
});

creatorRouter.patch("/creator/admin/network/:contactId", requireCreatorAdmin, async (req: any, res) => {
  const contactId = Number(req.params.contactId);
  if (!Number.isSafeInteger(contactId) || contactId < 1) return res.status(400).json({ error: "Invalid contact" });
  try {
    await ensureNetworkStorage();
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Network storage unavailable" });

    const fullName = String(req.body?.fullName || "").trim();
    const phone = String(req.body?.phone || "").replace(/[^0-9+]/g, "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 320) || null;
    const whereMet = String(req.body?.whereMet || "").trim();
    const profession = String(req.body?.profession || "").trim();
    const company = String(req.body?.company || "").trim() || null;
    const notes = String(req.body?.notes || "").trim() || null;
    const photoUrl = String(req.body?.photoUrl || "").trim().slice(0, 1000) || null;
    const socialLinks = parseSocialLinks(req.body?.socialLinks);
    const categoryIds = Array.isArray(req.body?.categoryIds) ? req.body.categoryIds.map(Number) : [];
    const followUpAtRaw = String(req.body?.followUpAt || "").trim();
    const followUpAt = followUpAtRaw ? new Date(followUpAtRaw) : null;

    if (!fullName || !phone || !whereMet || !profession) return res.status(400).json({ error: "Name, phone, where you met, and profession are required" });
    if (followUpAt && Number.isNaN(followUpAt.getTime())) return res.status(400).json({ error: "Invalid follow-up date" });

    const normalizedPhone = normalizeNetworkPhone(phone);
    const duplicate = await db.execute(sql`
      SELECT id FROM zakhy_network_contacts
      WHERE id <> ${contactId}
        AND ((${normalizedPhone} <> '' AND regexp_replace(phone, '[^0-9]', '', 'g') = ${normalizedPhone})
          OR (${email || ""} <> '' AND LOWER(COALESCE(email,'')) = ${email || ""}))
      LIMIT 1
    `);
    if (networkRows(duplicate)[0]) return res.status(409).json({ error: "Another contact already uses this phone or email" });

    const result = await db.execute(sql`
      UPDATE zakhy_network_contacts SET
        full_name = ${fullName}, phone = ${phone}, email = ${email}, where_met = ${whereMet},
        profession = ${profession}, company = ${company}, notes = ${notes}, photo_url = ${photoUrl},
        social_links = ${JSON.stringify(socialLinks)}::jsonb,
        is_favorite = ${req.body?.isFavorite === true},
        is_priority = ${req.body?.isPriority === true},
        follow_up_at = ${followUpAt ? followUpAt.toISOString() : null},
        follow_up_done = ${req.body?.followUpDone === true},
        updated_at = NOW()
      WHERE id = ${contactId}
      RETURNING id
    `);
    if (!networkRows(result)[0]) return res.status(404).json({ error: "Contact not found" });
    await setNetworkCategories(db, contactId, categoryIds);
    return res.json({ success: true, contactId });
  } catch (error) {
    console.error("[ZAKHY Network] Contact update failed", error);
    return res.status(503).json({ error: "Unable to update contact" });
  }
});

creatorRouter.patch("/creator/admin/network/:contactId/follow-up", requireCreatorAdmin, async (req: any, res) => {
  const contactId = Number(req.params.contactId);
  if (!Number.isSafeInteger(contactId) || contactId < 1 || typeof req.body?.done !== "boolean") {
    return res.status(400).json({ error: "Invalid follow-up update" });
  }
  try {
    await ensureNetworkStorage();
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Network contact storage is unavailable" });
    const result = await db.execute(sql`
      UPDATE zakhy_network_contacts
      SET follow_up_done = ${req.body.done}, updated_at = NOW()
      WHERE id = ${contactId}
      RETURNING id, follow_up_done
    `);
    const contact = networkRows(result)[0];
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    return res.json({ success: true, contact });
  } catch (error) {
    console.error("[ZAKHY Network] Follow-up update failed", error);
    return res.status(503).json({ error: "Unable to update follow-up" });
  }
});


function networkQuestionTerms(question: string) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9@&+.' -]/g, " ")
    .split(/\s+/)
    .map((value) => value.trim())
    .filter((value) => value.length > 2 && !["who","what","when","where","which","this","that","with","from","about","tell","show","have","should","need","did","make","meet","met","follow","followup","follow-up","people","person","contact","contacts","network"].includes(value))
    .slice(0, 8);
}

creatorRouter.post("/creator/admin/network/ask", requireCreatorAdmin, async (req: any, res) => {
  const question = String(req.body?.question || "").trim().slice(0, 500);
  if (!question) return res.status(400).json({ error: "Ask a question about your network." });

  try {
    await ensureNetworkStorage();
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Network storage unavailable" });

    const q = question.toLowerCase();
    const wantsWeek = /\b(this week|week|recently|recent|new people|new contacts|meet|met)\b/.test(q);
    const wantsFollowUp = /\b(follow ?up|follow-up|call|reach out|contact next|should i contact|needs attention)\b/.test(q);
    const wantsOverdue = /\b(overdue|late|missed)\b/.test(q);
    const wantsPriority = /\b(priority|important|best opportunity|top people|top contacts)\b/.test(q);
    const wantsFavorites = /\b(favorite|favorites)\b/.test(q);

    let intent = "search";
    if (wantsOverdue) intent = "overdue";
    else if (wantsFollowUp) intent = "follow_up";
    else if (wantsPriority) intent = "priority";
    else if (wantsFavorites) intent = "favorites";
    else if (wantsWeek) intent = "this_week";

    const terms = networkQuestionTerms(question);
    const searchText = terms.join(" ");

    const result = await db.execute(sql`
      SELECT c.id, c.full_name, c.phone, c.email, c.where_met, c.profession, c.company, c.notes,
             c.is_favorite, c.is_priority, c.follow_up_at, c.follow_up_done, c.created_at,
             COALESCE(
               json_agg(json_build_object('id', cat.id, 'name', cat.name, 'slug', cat.slug) ORDER BY cat.sort_order, cat.name)
               FILTER (WHERE cat.id IS NOT NULL), '[]'::json
             ) AS categories
      FROM zakhy_network_contacts c
      LEFT JOIN zakhy_network_contact_categories cc ON cc.contact_id = c.id
      LEFT JOIN zakhy_network_categories cat ON cat.id = cc.category_id AND cat.is_active = TRUE
      WHERE
        (
          ${intent} = 'this_week' AND c.created_at >= date_trunc('week', NOW())
        )
        OR (
          ${intent} = 'overdue' AND c.follow_up_done = FALSE AND c.follow_up_at IS NOT NULL AND c.follow_up_at < NOW()
        )
        OR (
          ${intent} = 'follow_up' AND c.follow_up_done = FALSE AND (
            c.follow_up_at IS NOT NULL
            OR c.is_priority = TRUE
          )
        )
        OR (
          ${intent} = 'priority' AND c.is_priority = TRUE
        )
        OR (
          ${intent} = 'favorites' AND c.is_favorite = TRUE
        )
        OR (
          ${intent} = 'search' AND (
            ${searchText} = ''
            OR LOWER(c.full_name) LIKE ${"%" + searchText.toLowerCase() + "%"}
            OR LOWER(COALESCE(c.company,'')) LIKE ${"%" + searchText.toLowerCase() + "%"}
            OR LOWER(c.profession) LIKE ${"%" + searchText.toLowerCase() + "%"}
            OR LOWER(COALESCE(c.notes,'')) LIKE ${"%" + searchText.toLowerCase() + "%"}
            OR LOWER(COALESCE(cat.name,'')) LIKE ${"%" + searchText.toLowerCase() + "%"}
          )
        )
      GROUP BY c.id
      ORDER BY
        CASE
          WHEN c.follow_up_done = FALSE AND c.follow_up_at IS NOT NULL AND c.follow_up_at < NOW() THEN 0
          WHEN c.follow_up_done = FALSE AND c.follow_up_at IS NOT NULL THEN 1
          WHEN c.is_priority = TRUE THEN 2
          ELSE 3
        END,
        c.follow_up_at ASC NULLS LAST,
        c.created_at DESC
      LIMIT 12
    `);

    let contacts = networkRows(result);

    if (intent === "follow_up" && contacts.length === 0) {
      const fallback = await db.execute(sql`
        SELECT c.id, c.full_name, c.phone, c.email, c.where_met, c.profession, c.company, c.notes,
               c.is_favorite, c.is_priority, c.follow_up_at, c.follow_up_done, c.created_at,
               COALESCE(
                 json_agg(json_build_object('id', cat.id, 'name', cat.name, 'slug', cat.slug) ORDER BY cat.sort_order, cat.name)
                 FILTER (WHERE cat.id IS NOT NULL), '[]'::json
               ) AS categories
        FROM zakhy_network_contacts c
        LEFT JOIN zakhy_network_contact_categories cc ON cc.contact_id = c.id
        LEFT JOIN zakhy_network_categories cat ON cat.id = cc.category_id AND cat.is_active = TRUE
        WHERE c.follow_up_done = FALSE
        GROUP BY c.id
        ORDER BY c.is_priority DESC, c.created_at DESC
        LIMIT 8
      `);
      contacts = networkRows(fallback);
    }

    const count = contacts.length;
    let answer = "";
    if (intent === "this_week") {
      answer = count
        ? `You added ${count} contact${count === 1 ? "" : "s"} to My Network this week. I’m using the date you saved them as the current stand-in for when you met them.`
        : "You have not added anyone to My Network this week yet.";
    } else if (intent === "overdue") {
      answer = count
        ? `You have ${count} overdue follow-up${count === 1 ? "" : "s"}. I put the most overdue contacts first.`
        : "You do not have any overdue follow-ups right now.";
    } else if (intent === "follow_up") {
      answer = count
        ? `These are the ${count} people I would look at first for follow-up, based on your reminders and Priority flag.`
        : "I do not see anyone marked for follow-up yet. Add a reminder or mark someone Priority and I’ll surface them here.";
    } else if (intent === "priority") {
      answer = count
        ? `You currently have ${count} Priority contact${count === 1 ? "" : "s"}.`
        : "You do not have any Priority contacts yet.";
    } else if (intent === "favorites") {
      answer = count
        ? `You currently have ${count} Favorite contact${count === 1 ? "" : "s"}.`
        : "You do not have any Favorite contacts yet.";
    } else {
      answer = count
        ? `I found ${count} contact${count === 1 ? "" : "s"} that match what you asked.`
        : "I could not find a strong match in My Network. Try a person’s name, company, profession, or industry.";
    }

    return res.json({
      success: true,
      intent,
      answer,
      contacts,
      note: intent === "this_week" ? "Current version uses contact creation date because Date Met is not stored separately yet." : null,
    });
  } catch (error) {
    console.error("[ZAKHY Network] Ask failed", error);
    return res.status(503).json({ error: "Unable to answer from My Network right now." });
  }
});


let dataConnectionsReady: Promise<void> | null = null;

async function ensureDataConnectionsStorage() {
  if (dataConnectionsReady) return dataConnectionsReady;
  dataConnectionsReady = (async () => {
    await ensureNetworkStorage();
    const db = await getDb();
    if (!db) throw new Error("Data connection storage is unavailable");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS zakhy_data_sources (
        id BIGSERIAL PRIMARY KEY,
        provider TEXT NOT NULL,
        display_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        external_account_id TEXT NULL,
        account_label TEXT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        last_sync_at TIMESTAMPTZ NULL,
        sync_cursor TEXT NULL,
        connected_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_zakhy_data_sources_provider_account
      ON zakhy_data_sources(provider, COALESCE(external_account_id, ''))
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS zakhy_contact_external_ids (
        id BIGSERIAL PRIMARY KEY,
        contact_id BIGINT NOT NULL REFERENCES zakhy_network_contacts(id) ON DELETE CASCADE,
        source_id BIGINT NOT NULL REFERENCES zakhy_data_sources(id) ON DELETE CASCADE,
        external_person_id TEXT NOT NULL,
        source_email TEXT NULL,
        source_phone TEXT NULL,
        source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(source_id, external_person_id)
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS zakhy_contact_events (
        id BIGSERIAL PRIMARY KEY,
        contact_id BIGINT NULL REFERENCES zakhy_network_contacts(id) ON DELETE SET NULL,
        source_id BIGINT NOT NULL REFERENCES zakhy_data_sources(id) ON DELETE CASCADE,
        external_event_id TEXT NULL,
        event_type TEXT NOT NULL,
        occurred_at TIMESTAMPTZ NOT NULL,
        amount_cents BIGINT NULL,
        currency TEXT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS zakhy_contact_consents (
        id BIGSERIAL PRIMARY KEY,
        contact_id BIGINT NULL REFERENCES zakhy_network_contacts(id) ON DELETE SET NULL,
        source_id BIGINT NOT NULL REFERENCES zakhy_data_sources(id) ON DELETE CASCADE,
        channel TEXT NOT NULL,
        status TEXT NOT NULL,
        observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS zakhy_source_sync_runs (
        id BIGSERIAL PRIMARY KEY,
        source_id BIGINT NOT NULL REFERENCES zakhy_data_sources(id) ON DELETE CASCADE,
        status TEXT NOT NULL,
        records_seen INTEGER NOT NULL DEFAULT 0,
        records_created INTEGER NOT NULL DEFAULT 0,
        records_updated INTEGER NOT NULL DEFAULT 0,
        error_message TEXT NULL,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        finished_at TIMESTAMPTZ NULL
      )
    `);
    await db.execute(sql`
      INSERT INTO schema_migrations (migration_name, applied_at)
      SELECT '0025_create_zakhy_data_connections', NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM schema_migrations WHERE migration_name = '0025_create_zakhy_data_connections'
      )
    `);
  })().catch((error) => {
    dataConnectionsReady = null;
    throw error;
  });
  return dataConnectionsReady;
}

const DATA_CONNECTION_CATALOG = [
  { provider: "shopify", name: "Shopify", category: "Commerce", description: "Customers, orders, subscriptions, marketing consent, and lifetime value.", ready: true },
  { provider: "manychat", name: "ManyChat", category: "Social / DM", description: "DM subscribers, tags, opt-ins, and lead-source context.", ready: false },
  { provider: "email", name: "Email Platform", category: "Email", description: "Subscribers, campaigns, engagement, and email consent.", ready: false },
  { provider: "calendly", name: "Calendly", category: "Scheduling", description: "Bookings, meeting history, and relationship activity.", ready: false },
  { provider: "google_contacts", name: "Google Contacts", category: "Contacts", description: "Personal contacts and basic identity details.", ready: false },
] as const;

function normalizeShopifyStore(value: string) {
  let input = value.trim().toLowerCase();
  input = input.replace(/^https?:\/\//, "").replace(/\/$/, "");
  input = input.split("/")[0];
  if (!input) return null;
  if (/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(input)) return input;
  if (/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(input)) return input;
  return null;
}

creatorRouter.get("/creator/admin/connections", requireCreatorAdmin, async (_req: any, res) => {
  try {
    await ensureDataConnectionsStorage();
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Data connection storage unavailable" });

    const sourcesResult = await db.execute(sql`
      SELECT s.id, s.provider, s.display_name, s.status, s.external_account_id, s.account_label,
             s.metadata, s.last_sync_at, s.connected_at, s.created_at, s.updated_at,
             COALESCE(i.people_count, 0)::int AS people_count,
             COALESCE(e.event_count, 0)::int AS event_count,
             COALESCE(e.revenue_cents, 0)::bigint AS revenue_cents
      FROM zakhy_data_sources s
      LEFT JOIN (
        SELECT source_id, COUNT(*) AS people_count
        FROM zakhy_contact_external_ids
        GROUP BY source_id
      ) i ON i.source_id = s.id
      LEFT JOIN (
        SELECT source_id, COUNT(*) AS event_count, COALESCE(SUM(amount_cents),0) AS revenue_cents
        FROM zakhy_contact_events
        GROUP BY source_id
      ) e ON e.source_id = s.id
      ORDER BY s.created_at DESC
    `);

    return res.json({
      success: true,
      catalog: DATA_CONNECTION_CATALOG,
      sources: networkRows(sourcesResult),
    });
  } catch (error) {
    console.error("[ZAKHY Connections] List failed", error);
    return res.status(503).json({ error: "Unable to load data connections." });
  }
});

creatorRouter.post("/creator/admin/connections/shopify/prepare", requireCreatorAdmin, async (req: any, res) => {
  const storeDomain = normalizeShopifyStore(String(req.body?.storeDomain || ""));
  const accountLabel = String(req.body?.accountLabel || "Money Bosses").trim().slice(0, 120) || "Shopify";
  if (!storeDomain) return res.status(400).json({ error: "Enter a valid Shopify store domain." });

  try {
    await ensureDataConnectionsStorage();
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Data connection storage unavailable" });

    const result = await db.execute(sql`
      INSERT INTO zakhy_data_sources
        (provider, display_name, status, external_account_id, account_label, metadata, updated_at)
      VALUES
        ('shopify', 'Shopify', 'setup_required', ${storeDomain}, ${accountLabel},
         ${JSON.stringify({ storeDomain, intendedData: ["customers","orders","marketing_consent","customer_value"] })}::jsonb, NOW())
      ON CONFLICT (provider, COALESCE(external_account_id, ''))
      DO UPDATE SET account_label = EXCLUDED.account_label, metadata = EXCLUDED.metadata, status = 'setup_required', updated_at = NOW()
      RETURNING id, provider, display_name, status, external_account_id, account_label, metadata, last_sync_at, connected_at, created_at, updated_at
    `);

    return res.status(201).json({
      success: true,
      source: networkRows(result)[0],
      nextStep: "Create/authorize the Shopify app connection for this store. No access token is stored yet.",
    });
  } catch (error) {
    console.error("[ZAKHY Connections] Shopify prepare failed", error);
    return res.status(503).json({ error: "Unable to prepare Shopify connection." });
  }
});

creatorRouter.patch("/creator/admin/connections/:sourceId/status", requireCreatorAdmin, async (req: any, res) => {
  const sourceId = Number(req.params.sourceId);
  const status = String(req.body?.status || "").trim();
  const allowed = ["setup_required", "connected", "paused", "error"];
  if (!Number.isSafeInteger(sourceId) || sourceId < 1 || !allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid connection update." });
  }

  try {
    await ensureDataConnectionsStorage();
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Data connection storage unavailable" });
    const result = await db.execute(sql`
      UPDATE zakhy_data_sources
      SET status = ${status},
          connected_at = CASE WHEN ${status} = 'connected' THEN COALESCE(connected_at, NOW()) ELSE connected_at END,
          updated_at = NOW()
      WHERE id = ${sourceId}
      RETURNING id, provider, display_name, status, external_account_id, account_label, metadata, last_sync_at, connected_at, created_at, updated_at
    `);
    const source = networkRows(result)[0];
    if (!source) return res.status(404).json({ error: "Connection not found." });
    return res.json({ success: true, source });
  } catch (error) {
    console.error("[ZAKHY Connections] Status update failed", error);
    return res.status(503).json({ error: "Unable to update connection." });
  }
});

function portalUnavailable(res: any) {
  return res.status(404).json({ error: "Creator Portal is not enabled" });
}

function portalBaseUrl() {
  return "https://turboresponsehq.ai";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  }[character] || character));
}

function creatorPortalSessionClaims(req: any): { portalId: number } | null {
  const token = req.cookies?.creator_portal_session;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const claims = jwt.verify(token, secret) as { portalId?: number; purpose?: string };
    const portalId = Number(claims.portalId);
    return claims.purpose === "creator_portal" && Number.isSafeInteger(portalId) && portalId > 0 ? { portalId } : null;
  } catch {
    return null;
  }
}

/** Client stays signed in on this browser between visits. Sessions roll for 180 days
 * of inactivity; clearing site data, logging out, or revocation ends access. */
const CREATOR_SESSION_DAYS = 180;
const CREATOR_SESSION_MS = CREATOR_SESSION_DAYS * 24 * 60 * 60 * 1000;
// Renew at most once per day to keep the session active while this browser is in use.
const CREATOR_RENEW_THRESHOLD_SECONDS = (CREATOR_SESSION_DAYS - 1) * 24 * 60 * 60;

/** Current Creator sessions are tied to the version of the client's password. */
function setCreatorSession(res: any, portalId: number, authVersion: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Portal signing is unavailable");
  const session = jwt.sign({ portalId, purpose: "creator_portal", authVersion }, secret, { expiresIn: CREATOR_SESSION_DAYS + "d" });
  res.cookie("creator_portal_session", session, { httpOnly: true, sameSite: "lax",
    secure: process.env.NODE_ENV === "production", maxAge: CREATOR_SESSION_MS, path: "/" });
}
const clientAuthAttempts = new Map<string, number[]>();
function allowClientAuthAttempt(key: string): boolean {
  const now = Date.now();
  const recent = (clientAuthAttempts.get(key) || []).filter(t => t > now - 15 * 60 * 1000);
  if (recent.length >= 12) return false;
  clientAuthAttempts.set(key, [...recent, now]);
  return true;
}
/** Preserve existing legacy sessions only for portals with no password record. */
creatorRouter.use("/creator/portal", async (req: any, res, next) => {
  res.set("Cache-Control", "no-store");
  if (["/auth/claim", "/auth/login", "/accept", "/logout"].includes(req.path)) return next();
  const token = req.cookies?.creator_portal_session;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return res.status(401).json({ error: "Client sign-in required" });
  try {
    const claims = jwt.verify(token, secret) as { portalId?: number; purpose?: string; authVersion?: string; exp?: number };
    const portalId = Number(claims.portalId);
    if (claims.purpose !== "creator_portal" || !Number.isSafeInteger(portalId) || portalId < 1)
      return res.status(401).json({ error: "Client sign-in required" });
    if (!await checkCreatorSessionVersion(portalId, claims.authVersion))
      return res.status(401).json({ error: "Session expired. Sign in again." });
    // Renew only password-enabled sessions. Legacy magic-link sessions retain
    // their original expiry and cannot silently become permanent.
    if (typeof claims.authVersion === "string" && claims.authVersion.length > 0 &&
        typeof claims.exp === "number" &&
        claims.exp - Math.floor(Date.now() / 1000) < CREATOR_RENEW_THRESHOLD_SECONDS) {
      setCreatorSession(res, portalId, claims.authVersion);
    }
    return next();
  } catch {
    return res.status(401).json({ error: "Client sign-in required" });
  }
});

creatorRouter.post("/creator/portal/auth/claim", async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const token = String(req.body?.token || "").trim(), password = req.body?.password;
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token) || !validCreatorPassword(password))
    return res.status(400).json({ error: "Use a valid invitation and a password with at least 8 characters." });
  if (!process.env.JWT_SECRET) return res.status(503).json({ error: "Portal authentication is unavailable" });
  if (!allowClientAuthAttempt("claim:" + clientKey(req))) return res.status(429).json({ error: "Too many attempts. Try later." });
  try {
    const result = await claimCreatorInvite(token, password);
    if (!result) return res.status(401).json({ error: "Invitation expired, already used or invalid. Request a new link." });
    setCreatorSession(res, result.portalId, result.version);
    return res.json({ success: true });
  } catch (error) {
    console.error("[Creator Portal] Password setup failed", error);
    return res.status(503).json({ error: "Password setup is temporarily unavailable" });
  }
});

creatorRouter.post("/creator/portal/auth/login", async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const email = String(req.body?.email || "").trim(), password = String(req.body?.password || "");
  if (!email || !password) return res.status(400).json({ error: "Enter email and password" });
  if (!process.env.JWT_SECRET) return res.status(503).json({ error: "Portal authentication is unavailable" });
  if (!allowClientAuthAttempt("login:" + clientKey(req))) return res.status(429).json({ error: "Too many attempts. Try later." });
  try {
    const result = await loginCreatorPassword(email, password);
    if (!result) return res.status(401).json({ error: "Email or password not recognized. Request a fresh invitation if needed." });
    setCreatorSession(res, result.portalId, result.version);
    return res.json({ success: true });
  } catch (error) {
    console.error("[Creator Portal] Password login failed", error);
    return res.status(503).json({ error: "Sign-in is temporarily unavailable" });
  }
});

/** Old magic-link-only access is disabled; a password must be set first. */
creatorRouter.post("/creator/portal/accept", (_req: any, res) =>
  res.status(410).json({ error: "Create your password from the invitation link to continue." })
);

creatorRouter.get("/creator/portal/me", async (req: any, res) => {
  res.set("Cache-Control", "no-store");
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const claims = creatorPortalSessionClaims(req);
  if (!claims) return res.status(401).json({ error: "Creator Portal session required" });
  try {
    const portal = await getPortalForSession(claims.portalId);
    if (!portal) return res.status(401).json({ error: "Creator Portal access is inactive" });
    return res.json({ success: true, portal });
  } catch (error) {
    console.error("[Creator Portal] Workspace load failed", error);
    return res.status(503).json({ error: "Creator Portal storage is unavailable" });
  }
});

/** Clients can only mark the step explicitly assigned to them. */
creatorRouter.patch("/creator/portal/next-step", async (req: any, res) => {
  res.set("Cache-Control", "no-store");
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const claims = creatorPortalSessionClaims(req);
  if (!claims) return res.status(401).json({ error: "Creator Portal session required" });
  if (typeof req.body?.done !== "boolean") return res.status(400).json({ error: "A completion value is required" });
  try {
    const step = await setCreatorNextStepDone({ portalId: claims.portalId, actor: "creator", done: req.body.done, scope: "client" });
    if (!step) return res.status(403).json({ error: "This next step is not assigned to you" });
    return res.json({ success: true, step });
  } catch (error) {
    console.error("[Creator Portal] Next-step completion failed", error);
    return res.status(503).json({ error: "Unable to update this next step" });
  }
});

creatorRouter.post("/creator/portal/logout", async (_req: any, res) => {
  res.clearCookie("creator_portal_session", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return res.json({ success: true });
});

creatorRouter.post("/creator/portal/messages", async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const claims = creatorPortalSessionClaims(req);
  const text = String(req.body?.text || "").trim();
  if (!claims || !text || text.length > 10000) return res.status(400).json({ error: "A valid portal message is required" });
  try {
    const portal = await getPortalForSession(claims.portalId);
    if (!portal) return res.status(401).json({ error: "Creator Portal access is inactive" });
    const attachmentId = req.body?.attachmentId == null ? null : safeLeadId(String(req.body.attachmentId));
    const matched = attachmentId ? portal.attachments?.find((a: any) => Number(a.id) === attachmentId) : null;
    if (req.body?.attachmentId != null && !matched) return res.status(400).json({ error: "Attachment was not found in your project" });
    const message = await createCreatorPortalMessage({ creatorLeadId: Number(portal.creator_lead_id), senderType: "creator", text, visibleToCreator: true });
    if (attachmentId && message) await linkWorkspaceAttachment(Number(portal.id), attachmentId, Number(message.id), "creator");
    const emailSent = await workspaceEmailNotice(portal, matched ? text + "\\n\\nAttachment: " + matched.name + " (view in project workspace)" : text);
    return res.status(201).json({ success: true, message, emailSent });
  } catch (error) {
    console.error("[Creator Portal] Creator message failed", error);
    return res.status(503).json({ error: "Unable to save Creator Portal message" });
  }
});

creatorRouter.get("/creator/admin/leads/:leadId/portal", requireCreatorAdmin, async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const leadId = safeLeadId(req.params.leadId);
  if (!leadId) return res.status(400).json({ error: "Invalid lead identifier" });
  try {
    const portal = await getCreatorPortalByLeadId(leadId);
    if (!portal) return res.json({ success: true, portal: null });
    const lead = await getCreatorLeadById(leadId);
    const [workspace, messages] = await Promise.all([
      getWorkspaceData(Number(portal.id), String(lead?.package_interest || "Your project")),
      getCreatorPortalMessages(leadId),
    ]);
    return res.json({ success: true, portal: { ...portal, ...workspace, messages: messages.filter((m: any) => m.visible_to_creator === true) } });
  } catch (error) {
    console.error("[Creator Portal] Admin load failed", error);
    return res.status(503).json({ error: "Creator Portal storage is unavailable" });
  }
});

/** Explicitly initialize an empty project workspace without sending any client invitation. */
creatorRouter.post("/creator/admin/leads/:leadId/portal/setup", requireCreatorAdmin, async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const leadId = safeLeadId(req.params.leadId);
  if (!leadId) return res.status(400).json({ error: "Invalid lead" });
  try {
    const lead = await getCreatorLeadById(leadId);
    if (!lead) return res.status(404).json({ error: "Client record not found" });
    const portal = await ensureCreatorPortal(leadId);
    return res.status(201).json({ success: true, portal });
  } catch (err) {
    console.error("[Creator workspace] Setup failed", err);
    return res.status(503).json({ error: "Could not create project workspace" });
  }
});

creatorRouter.patch("/creator/admin/leads/:leadId/portal", requireCreatorAdmin, async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const leadId = safeLeadId(req.params.leadId);
  if (!leadId) return res.status(400).json({ error: "Invalid lead identifier" });
  try {
    const portal = await saveCreatorPortalConfig({ creatorLeadId: leadId, actor: req.creatorAdmin.email, config: {
      status: req.body?.status,
      currentStatus: req.body?.currentStatus,
      currentPhase: req.body?.currentPhase,
      nextStep: req.body?.nextStep,
      nextStepOwner: req.body?.nextStepOwner === "client" ? "client" : "team",
      driveFolderUrl: req.body?.driveFolderUrl,
    }});
    return res.json({ success: true, portal });
  } catch (error) {
    console.error("[Creator Portal] Admin save failed", error);
    return res.status(503).json({ error: "Unable to save Creator Portal settings" });
  }
});

/** Staff can mark the one next step completed, regardless of who owns it. */
creatorRouter.patch("/creator/admin/leads/:leadId/portal/next-step", requireCreatorAdmin, async (req: any, res) => {
  res.set("Cache-Control", "no-store");
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const leadId = safeLeadId(req.params.leadId);
  if (!leadId || typeof req.body?.done !== "boolean") return res.status(400).json({ error: "Invalid next-step update" });
  try {
    const portal = await getCreatorPortalByLeadId(leadId);
    if (!portal) return res.status(404).json({ error: "No Creator Portal has been set up for this client" });
    const step = await setCreatorNextStepDone({ portalId: Number(portal.id), actor: req.creatorAdmin.email, done: req.body.done, scope: "admin" });
    if (!step) return res.status(400).json({ error: "Add a next step before marking it completed" });
    return res.json({ success: true, step });
  } catch (error) {
    console.error("[Creator Portal] Admin next-step update failed", error);
    return res.status(503).json({ error: "Unable to update this next step" });
  }
});

creatorRouter.post("/creator/admin/leads/:leadId/portal/invite", requireCreatorAdmin, async (req: any, res) => {
  res.set("Cache-Control", "no-store");
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const leadId = safeLeadId(req.params.leadId);
  if (!leadId) return res.status(400).json({ error: "Invalid client" });
  const channel = req.body?.channel === "text" ? "text" : "email";
  try {
    const lead = await getCreatorLeadById(leadId);
    if (!lead?.email) return res.status(404).json({ error: "This client needs an email address for future password sign-in" });
    const invitation = await inviteCreatorPortal({ creatorLeadId: leadId, actor: req.creatorAdmin.email });
    if (!invitation) return res.status(500).json({ error: "Invitation could not be created" });
    const invitationUrl = `${portalBaseUrl()}/creator/portal/invite?token=${encodeURIComponent(invitation.token)}`;
    const firstName = String(lead.full_name || "there").split(" ")[0];
    let emailSent = false;
    if (channel === "email") {
      try {
        const { sendRawEmail } = await import("../../services/auditEmailService");
        emailSent = await sendRawEmail({
          to: String(lead.email), fromName: "Creator Automations",
          subject: "Set up your private Creator Automations workspace",
          html: `<p>Hi ${escapeHtml(firstName)},</p><p>Your project workspace is ready.</p><p><a href="${invitationUrl}">Create your password</a></p><p>This one-time link expires in 24 hours. Use your email address to sign in afterward.</p>`,
        });
      } catch (error) {
        console.error("[Creator Portal] Invite email failed; manual link is available", error);
      }
    }
    const smsText = `Hi ${firstName}, your Creator Automations project workspace is ready. Use this private link within 24 hours to create your password: ${invitationUrl}`;
    return res.status(201).json({ success: true, portal: invitation.portal, invitationUrl, smsText, expiresInHours: 24, emailSent });
  } catch (error) {
    console.error("[Creator Portal] Invitation creation failed", error);
    return res.status(503).json({ error: "Unable to create invitation" });
  }
});

creatorRouter.post("/creator/admin/leads/:leadId/portal/revoke", requireCreatorAdmin, async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const leadId = safeLeadId(req.params.leadId);
  if (!leadId) return res.status(400).json({ error: "Invalid lead identifier" });
  try {
    return res.json({ success: true, portal: await revokeCreatorPortal({ creatorLeadId: leadId, actor: req.creatorAdmin.email }) });
  } catch (error) {
    console.error("[Creator Portal] Revoke failed", error);
    return res.status(503).json({ error: "Unable to revoke Creator Portal access" });
  }
});

creatorRouter.post("/creator/admin/leads/:leadId/portal/updates", requireCreatorAdmin, async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const leadId = safeLeadId(req.params.leadId);
  const text = String(req.body?.text || "").trim();
  if (!leadId || !text || text.length > 5000) return res.status(400).json({ error: "A valid update is required" });
  try {
    return res.status(201).json({ success: true, update: await createPortalUpdate({ creatorLeadId: leadId, text, visibleToCreator: req.body?.visibleToCreator === true, userId: req.creatorAdmin.id }) });
  } catch (error) {
    console.error("[Creator Portal] Update creation failed", error);
    return res.status(503).json({ error: "Unable to save Creator Portal update" });
  }
});

creatorRouter.get("/creator/admin/leads/:leadId/portal/messages", requireCreatorAdmin, async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const leadId = safeLeadId(req.params.leadId);
  if (!leadId) return res.status(400).json({ error: "Invalid lead identifier" });
  try {
    return res.json({ success: true, messages: await getCreatorPortalMessages(leadId) });
  } catch (error) {
    console.error("[Creator Portal] Admin message load failed", error);
    return res.status(503).json({ error: "Unable to load Creator Portal messages" });
  }
});

creatorRouter.post("/creator/admin/leads/:leadId/portal/messages", requireCreatorAdmin, async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const leadId = safeLeadId(req.params.leadId);
  const text = String(req.body?.text || "").trim();
  if (!leadId || !text || text.length > 10000) return res.status(400).json({ error: "A valid portal message is required" });
  try {
    const portal = await getCreatorPortalByLeadId(leadId);
    if (!portal) return res.status(404).json({ error: "Project not found" });
    const attachmentId = req.body?.attachmentId == null ? null : safeLeadId(String(req.body.attachmentId));
    if (req.body?.attachmentId != null && !attachmentId) return res.status(400).json({ error: "Invalid attachment" });
    if (attachmentId) {
      const workspace = await getWorkspaceData(Number(portal.id), "Project");
      if (!workspace.attachments.some(a => a.id === attachmentId)) return res.status(400).json({ error: "Attachment not in this project" });
    }
    const message = await createCreatorPortalMessage({ creatorLeadId: leadId, senderType: "admin", text, visibleToCreator: req.body?.visibleToCreator !== false, userId: req.creatorAdmin.id });
    if (attachmentId && message) await linkWorkspaceAttachment(Number(portal.id), attachmentId, Number(message.id), req.creatorAdmin.email);
    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("[Creator Portal] Admin message failed", error);
    return res.status(503).json({ error: "Unable to save Creator Portal message" });
  }
});

creatorRouter.post("/creator/admin/leads/:leadId/portal/items", requireCreatorAdmin, async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const leadId = safeLeadId(req.params.leadId);
  const label = String(req.body?.label || "").trim();
  const status = req.body?.status || "needed";
  if (!leadId || !label || !["needed", "received", "complete"].includes(status)) return res.status(400).json({ error: "A valid portal item is required" });
  try {
    return res.status(201).json({ success: true, item: await createPortalItem({ creatorLeadId: leadId, label, status }) });
  } catch (error) {
    console.error("[Creator Portal] Item creation failed");
    return res.status(503).json({ error: "Unable to save Creator Portal item" });
  }
});

/** Public Creator Business intake. It never uses consumer case records. */
creatorRouter.post("/creator/leads", async (req: any, res) => {
  const key = clientKey(req);
  if (!allowIntakeAttempt(key)) {
    return res.status(429).json({ error: "Please wait a few minutes before submitting again." });
  }

  const parsed = creatorLeadInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Please complete the required creator project information.",
      fields: parsed.error.flatten().fieldErrors,
    });
  }

  // Honeypot: respond as submitted without persisting a bot payload.
  if (parsed.data.website) {
    return res.status(201).json({ success: true, message: "Project request received." });
  }

  try {
      const lead = await createCreatorLead(parsed.data, {
        referrer: typeof req.get === "function" ? req.get("referer") : undefined,
        ip: key,
      });

      // Reuse the existing Turbo Response HubSpot contact upsert. The full
      // Creator Intake context is kept in the standard contact description so
      // no new HubSpot objects or custom CRM architecture are required.
      try {
        const nameParts = parsed.data.fullName.trim().split(/\s+/);
        const firstname = nameParts.shift() || parsed.data.fullName.trim();
        const lastname = nameParts.join(" ");
        const submittedAt = lead.submittedAt || new Date().toISOString();
        const context = [
          "ZAKHY CREATOR INTAKE",
          `Submitted: ${submittedAt}`,
          `Creator type: ${parsed.data.creatorType}`,
          `Package/service interest: ${parsed.data.packageInterest || "Not specified"}`,
          `Budget: ${parsed.data.budgetRange || "Not specified"}`,
          `Main goal: ${parsed.data.goals}`,
          `Challenges: ${parsed.data.challenges}`,
          `Automation needs: ${parsed.data.automationWish || "Not specified"}`,
          `Revenue streams: ${parsed.data.revenueStreams.join(", ") || "Not specified"}`,
          `Revenue/opportunity focus: ${parsed.data.opportunityFocus.join(", ") || "Not specified"}`,
          `Audience: ${parsed.data.audienceSize || "Not specified"} · ${parsed.data.audienceLocation || "Location not specified"}`,
          `Business systems: ${parsed.data.businessSystems.join(", ") || "Not specified"}`,
          `Social links: ${parsed.data.socialLinks.join(", ") || "Not provided"}`,
          `Source: ${parsed.data.source || "zakhy-creator-intake"}`,
          `Source path: ${parsed.data.sourcePath || "Not specified"}`,
          `UTM: ${parsed.data.utm?.source || ""} / ${parsed.data.utm?.medium || ""} / ${parsed.data.utm?.campaign || ""}`,
          `Referrer: ${typeof req.get === "function" ? req.get("referer") || "Not provided" : "Not provided"}`,
          `Project priority: ${parsed.data.projectPriority}`,
          `Final question: ${parsed.data.finalQuestion || "Not specified"}`,
        ].join("\n");

        await syncContactToHubSpot({
          firstname,
          lastname,
          email: parsed.data.email,
          phone: parsed.data.phone || undefined,
          company: parsed.data.brandName || undefined,
          website: parsed.data.websiteUrl || parsed.data.socialLinks[0] || undefined,
          contextNote: context,
          lead_source: "Website Intake",
          hs_lead_status: "NEW",
          lifecyclestage: "lead",
        });
      } catch (hubspotError) {
        console.error("[Creator] HubSpot sync failed after lead was stored", hubspotError);
      }

      // The database write is complete before email workflow processing starts.
      // Email errors are isolated and never roll back or reject this lead.
      try {
        await processCreatorLeadEmailWorkflow({
          fullName: parsed.data.fullName,
          brandName: parsed.data.brandName || null,
          email: parsed.data.email,
          phone: parsed.data.phone || null,
          creatorType: parsed.data.creatorType,
          projectPriority: parsed.data.projectPriority,
          budgetRange: parsed.data.budgetRange || null,
          packageInterest: parsed.data.packageInterest || null,
          submittedAt: lead.submittedAt,
          leadId: lead.id,
        });
      } catch (emailError) {
        console.error("[Creator] Email workflow failed after lead was stored", emailError);
      }

      return res.status(201).json({
      success: true,
      message: "Your Creator Project request is in. We will review it and follow up with the clearest next step.",
      leadId: lead.id,
    });
  } catch (error) {
    console.error("[Creator] Lead intake failed", error);
    return res.status(500).json({ error: "We could not save your request. Please try again." });
  }
});

creatorRouter.get("/creator/admin/leads", requireCreatorAdmin, async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit ?? 100);
    const includeInternalTests = req.query.includeInternalTests === "true";
    const leads = await listCreatorLeads(
      Number.isFinite(requestedLimit) ? requestedLimit : 100,
      includeInternalTests,
    );
    return res.json({ success: true, leads });
  } catch (error) {
    console.error("[Creator] Lead list failed", error);
    return res.status(500).json({ error: "Unable to load Creator Leads." });
  }
});

creatorRouter.get("/creator/admin/amani", requireAmaniAdmin, async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit ?? 100);
    const opportunities = await listAmaniAdminOpportunities(
      Number.isFinite(requestedLimit) ? requestedLimit : 100,
    );
    return res.json({ success: true, opportunities });
  } catch (error) {
    console.error("[Creator] Amani opportunity list failed", error);
    return res.status(500).json({ error: "Unable to load Amani opportunities." });
  }
});

creatorRouter.get("/creator/admin/amani/:opportunityId", requireAmaniAdmin, async (req, res) => {
  const opportunityId = safeLeadId(req.params.opportunityId);
  if (!opportunityId) return res.status(400).json({ error: "Invalid Amani opportunity identifier" });

  try {
    const record = await getAmaniAdminOpportunity(opportunityId);
    if (!record) return res.status(404).json({ error: "Amani opportunity not found" });
    return res.json({ success: true, ...record });
  } catch (error) {
    console.error("[Creator] Amani opportunity detail failed", error);
    return res.status(500).json({ error: "Unable to load Amani opportunity." });
  }
});

creatorRouter.get("/creator/admin/leads/:leadId", requireCreatorAdmin, async (req, res) => {
  const leadId = safeLeadId(req.params.leadId);
  if (!leadId) return res.status(400).json({ error: "Invalid lead identifier" });

  try {
    const lead = await getCreatorLeadById(leadId);
    if (!lead) return res.status(404).json({ error: "Creator lead not found" });
    return res.json({ success: true, lead });
  } catch (error) {
    console.error("[Creator] Lead detail failed", error);
    return res.status(500).json({ error: "Unable to load Creator Lead." });
  }
});

creatorRouter.patch("/creator/admin/leads/:leadId/status", requireCreatorAdmin, async (req: any, res) => {
  const leadId = safeLeadId(req.params.leadId);
  const parsed = creatorLeadStatusSchema.safeParse(req.body);
  if (!leadId || !parsed.success) return res.status(400).json({ error: "Invalid status update" });

  try {
    const updated = await updateCreatorLeadStatus({
      creatorLeadId: leadId,
      status: parsed.data.status,
      actor: req.creatorAdmin.email,
    });
    if (!updated) return res.status(404).json({ error: "Creator lead not found" });
    return res.json({ success: true, lead: updated });
  } catch (error) {
    console.error("[Creator] Lead status update failed", error);
    return res.status(500).json({ error: "Unable to update Creator Lead." });
  }
});

creatorRouter.post("/creator/admin/leads/:leadId/notes", requireCreatorAdmin, async (req: any, res) => {
  const leadId = safeLeadId(req.params.leadId);
  const parsed = creatorLeadNoteSchema.safeParse(req.body);
  if (!leadId || !parsed.success) return res.status(400).json({ error: "A note is required" });

  try {
    const note = await addCreatorLeadNote({
      creatorLeadId: leadId,
      authorUserId: req.creatorAdmin.id,
      note: parsed.data,
    });
    return res.status(201).json({ success: true, note });
  } catch (error) {
    console.error("[Creator] Lead note failed", error);
    return res.status(500).json({ error: "Unable to save note." });
  }
});

creatorRouter.post("/creator/admin/leads/:leadId/tasks", requireCreatorAdmin, async (req: any, res) => {
  const leadId = safeLeadId(req.params.leadId);
  const parsed = creatorLeadTaskSchema.safeParse(req.body);
  if (!leadId || !parsed.success) return res.status(400).json({ error: "Invalid follow-up task" });

  try {
    const task = await createCreatorFollowUpTask({
      creatorLeadId: leadId,
      ownerUserId: req.creatorAdmin.id,
      task: parsed.data,
    });
    return res.status(201).json({ success: true, task });
  } catch (error) {
    console.error("[Creator] Follow-up task failed", error);
    return res.status(500).json({ error: "Unable to save follow-up task." });
  }
});

// Creator-only project workspace endpoints; all keep the existing portal/admin authorization.
registerCreatorWorkspaceRoutes(creatorRouter, requireCreatorAdmin, creatorPortalSessionClaims);

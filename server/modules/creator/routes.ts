import { Router, type RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { sql } from "drizzle-orm";
import { getDb } from "../../db";
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

export const creatorRouter = Router();

// Creator V1 remains closed until the additive PostgreSQL migration is applied
// and a release is explicitly approved. This prevents traffic from reaching
// the module while it is only prepared in source control.
creatorRouter.use("/creator", (_req, res, next) => {
  if (!creatorLeadCaptureEnabled()) {
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

const requireCreatorAdmin: RequestHandler = async (req: any, res, next) => {
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
    if (claims.role !== "admin" || !Number.isSafeInteger(userId) || userId < 1) {
      return res.status(403).json({ error: "Admin access required" });
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
    if (!user || user.role !== "admin" || (claims.email && user.email?.toLowerCase() !== claims.email.toLowerCase())) {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.creatorAdmin = { id: user.id, email: user.email || "admin" };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired admin session" });
  }
};

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
    const leads = await listCreatorLeads(Number.isFinite(requestedLimit) ? requestedLimit : 100);
    return res.json({ success: true, leads });
  } catch (error) {
    console.error("[Creator] Lead list failed", error);
    return res.status(500).json({ error: "Unable to load Creator Leads." });
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

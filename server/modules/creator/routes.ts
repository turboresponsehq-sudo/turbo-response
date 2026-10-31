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
import { syncContactToHubSpot } from "../../hubspotSync";
import { registerCreatorTeamPortalRoutes } from "./teamPortalRoutes";
import { notifyCreatorTeamActivity } from "./creatorTeamNotifications";
import { getAmaniAdminOpportunity, listAmaniAdminOpportunities } from "../amani/adminRepository";
import {
  acceptCreatorPortalToken,
  createCreatorPortalMessage,
  createPortalItem,
  createPortalUpdate,
  creatorPortalEnabled,
  getCreatorPortalByLeadId,
  getCreatorPortalMessages,
  getPortalForSession,
  inviteCreatorPortal,
  revokeCreatorPortal,
  saveCreatorPortalConfig,
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

// Isolated, opt-in team workspace routes. Existing one-person portal is unchanged.
registerCreatorTeamPortalRoutes(creatorRouter, requireCreatorAdmin);

function portalUnavailable(res: any) {
  return res.status(404).json({ error: "Creator Portal is not enabled" });
}

function portalBaseUrl() {
  return process.env.FRONTEND_URL || "https://turboresponsehq.ai";
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

/** Creator Portal access is isolated from the legacy consumer client portal. */
creatorRouter.post("/creator/portal/accept", async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const token = String(req.body?.token || "").trim();
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) return res.status(400).json({ error: "Invalid invitation token" });
  try {
    const portal = await acceptCreatorPortalToken(token);
    if (!portal) return res.status(401).json({ error: "Invitation is invalid, expired, or revoked" });
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(503).json({ error: "Portal authentication is unavailable" });
    const session = jwt.sign({ portalId: Number(portal.id), purpose: "creator_portal" }, secret, { expiresIn: "7d" });
    res.cookie("creator_portal_session", session, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000, path: "/" });
    return res.json({ success: true });
  } catch (error) {
    console.error("[Creator Portal] Invitation acceptance failed", error);
    return res.status(503).json({ error: "Creator Portal storage is unavailable" });
  }
});

creatorRouter.get("/creator/portal/me", async (req: any, res) => {
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
    const message = await createCreatorPortalMessage({ creatorLeadId: Number(portal.creator_lead_id), senderType: "creator", text, visibleToCreator: true });
    return res.status(201).json({ success: true, message });
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
    return res.json({ success: true, portal: await getCreatorPortalByLeadId(leadId) });
  } catch (error) {
    console.error("[Creator Portal] Admin load failed", error);
    return res.status(503).json({ error: "Creator Portal storage is unavailable" });
  }
});

creatorRouter.patch("/creator/admin/leads/:leadId/portal", requireCreatorAdmin, async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const leadId = safeLeadId(req.params.leadId);
  if (!leadId) return res.status(400).json({ error: "Invalid lead identifier" });
  try {
    const previous = await getCreatorPortalByLeadId(leadId);
    const portal = await saveCreatorPortalConfig({ creatorLeadId: leadId, actor: req.creatorAdmin.email, config: {
      status: req.body?.status,
      currentStatus: req.body?.currentStatus,
      currentPhase: req.body?.currentPhase,
      nextStep: req.body?.nextStep,
      driveFolderUrl: req.body?.driveFolderUrl,
    }});
    const changes = !!portal && (
      (previous?.next_step || "") !== (portal.next_step || "")
      || (previous?.current_status || "") !== (portal.current_status || "")
      || (previous?.current_phase || "") !== (portal.current_phase || "")
    );
    if (changes) {
      try { await notifyCreatorTeamActivity({portalId:Number(portal.id),type:"project_update",
        actorName:"Creator Automations",actorEmail:req.creatorAdmin.email,audience:"members"}); }
      catch(err) { console.error("[Creator Team] Project update alert failed",err); }
    }
    return res.json({ success: true, portal });
  } catch (error) {
    console.error("[Creator Portal] Admin save failed", error);
    return res.status(503).json({ error: "Unable to save Creator Portal settings" });
  }
});

creatorRouter.post("/creator/admin/leads/:leadId/portal/invite", requireCreatorAdmin, async (req: any, res) => {
  if (!creatorPortalEnabled()) return portalUnavailable(res);
  const leadId = safeLeadId(req.params.leadId);
  if (!leadId) return res.status(400).json({ error: "Invalid lead identifier" });
  try {
    const lead = await getCreatorLeadById(leadId);
    if (!lead?.email) return res.status(404).json({ error: "Creator Lead email is missing" });
    const current = await getCreatorPortalByLeadId(leadId);
    // Once group access is configured, legacy shared invites must not bypass
    // individual email verification and admin approval.
    if (current) {
      const db = await getDb();
      if (db) {
        const group = await db.execute(sql`
          SELECT 1 FROM creator_portals WHERE id = ${Number(current.id)}
          AND team_join_token_hash IS NOT NULL LIMIT 1
        `);
        const records = Array.isArray(group) ? group : (group as {rows?: unknown[]}).rows || [];
        if (records.length) return res.status(409).json({error:"Use Team Workspace Access for individual approved client logins."});
      }
    }
    const invitation = await inviteCreatorPortal({ creatorLeadId: leadId, actor: req.creatorAdmin.email });
    if (!invitation) return res.status(500).json({ error: "Invitation could not be created" });
    const invitationUrl = `${portalBaseUrl()}/creator/portal/invite?token=${encodeURIComponent(invitation.token)}`;
    const { sendRawEmail } = await import("../../services/auditEmailService");
    const firstName = escapeHtml(String(lead.full_name || "there").split(" ")[0]);
    const sent = await sendRawEmail({
      to: String(lead.email),
      subject: "Your Zakhy Creator Portal invitation",
      html: `<p>Hi ${firstName},</p><p>Your private Zakhy Creator Portal is ready.</p><p><a href="${invitationUrl}">Open your Creator Portal</a></p><p>This invitation expires in 7 days. If you were not expecting it, you can ignore this message.</p>`,
    });
    return res.status(201).json({ success: true, portal: invitation.portal, invitationUrl, emailSent: sent });
  } catch (error) {
    console.error("[Creator Portal] Invitation creation failed", error);
    return res.status(503).json({ error: "Unable to create Creator Portal invitation" });
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
    const update = await createPortalUpdate({ creatorLeadId: leadId, text,
      visibleToCreator: req.body?.visibleToCreator === true, userId: req.creatorAdmin.id });
    if (req.body?.visibleToCreator === true) {
      const portal = await getCreatorPortalByLeadId(leadId);
      if (portal) {
        try { await notifyCreatorTeamActivity({portalId:Number(portal.id),type:"project_update",
          actorName:"Creator Automations",actorEmail:req.creatorAdmin.email,audience:"members"}); }
        catch(err) { console.error("[Creator Team] Portal update alert failed",err); }
      }
    }
    return res.status(201).json({ success: true, update });
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
    const isVisible = req.body?.visibleToCreator !== false;
    const message = await createCreatorPortalMessage({ creatorLeadId: leadId, senderType: "admin", text,
      visibleToCreator: isVisible, userId: req.creatorAdmin.id });
    if (isVisible) {
      const portal = await getCreatorPortalByLeadId(leadId);
      if (portal) {
        try { await notifyCreatorTeamActivity({portalId:Number(portal.id),type:"message",
          actorName:"Creator Automations",actorEmail:req.creatorAdmin.email,audience:"members"}); }
        catch(err) { console.error("[Creator Team] Admin message alert failed",err); }
      }
    }
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

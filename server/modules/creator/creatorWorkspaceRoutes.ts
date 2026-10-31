import type { Router, RequestHandler } from "express";
import multer from "multer";
import { addWorkspaceAttachment, addWorkspaceTask, findWorkspaceAttachment, getWorkspaceData, setWorkspaceGoal, updateWorkspaceTask } from "./creatorWorkspaceRepository";
import { getCreatorPortalByLeadId, getPortalForSession, creatorPortalEnabled } from "./creatorPortalRepository";
import { allowedWorkspaceMimes, getWorkspaceFile, MAX_WORKSPACE_FILE_BYTES, safeAttachmentName, saveWorkspaceFile } from "./creatorWorkspaceFiles";

function safeId(value: unknown) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
function unavailable(res: any) { return res.status(404).json({ error: "Creator Portal not enabled" }); }

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_WORKSPACE_FILE_BYTES, files: 1 },
  fileFilter: (_req, file, done) => done(allowedWorkspaceMimes.has(file.mimetype) ? null : new Error("Allowed: image, screenshot, PDF, Word, or text")),
});
const singleUpload: RequestHandler = (req, res, next) => {
  upload.single("file")(req, res, (err: any) => {
    if (err) return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "File limit is 8 MB" : String(err.message || "Upload rejected") });
    next();
  });
};

async function download(res: any, portalId: number, attachmentId: number) {
  try {
    const file = await findWorkspaceAttachment(portalId, attachmentId);
    if (!file) return res.status(404).json({ error: "File not found" });
    const bytes = await getWorkspaceFile(portalId, file.storageId);
    if (!bytes) return res.status(404).json({ error: "File no longer available" });
    res.set("Cache-Control", "private, no-store");
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Content-Type", "application/octet-stream");
    res.set("Content-Disposition", `attachment; filename="${safeAttachmentName(file.name).replace(/"/g, "")}"`);
    return res.send(bytes);
  } catch (err) {
    console.error("[Creator workspace] File read failed", err);
    return res.status(503).json({ error: "File temporarily unavailable" });
  }
}

async function saveLink(req: any, res: any, portalId: number, actor: string) {
  const url = String(req.body?.url || "").trim();
  const name = String(req.body?.name || url).trim().slice(0, 160);
  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password || url.length > 2000 || !name)
      return res.status(400).json({ error: "Enter a valid website link" });
  } catch { return res.status(400).json({ error: "Enter a valid website link" }); }
  try {
    const attachment = await addWorkspaceAttachment(portalId, actor, { kind: "link", name, url });
    return res.status(201).json({ success: true, attachment });
  } catch (err) { console.error("[Creator workspace] Link save failed", err); return res.status(503).json({ error: "Could not save link" }); }
}

async function saveUpload(req: any, res: any, portalId: number, actor: string) {
  const file = req.file as Express.Multer.File | undefined;
  if (!file?.buffer?.length || !allowedWorkspaceMimes.has(file.mimetype)) return res.status(400).json({ error: "Choose a supported file up to 8 MB" });
  try {
    const existing = await getWorkspaceData(portalId, "Project");
    const stored = existing.attachments.filter(item => item.kind === "file");
    const totalBytes = stored.reduce((sum, item) => sum + (item.size || 0), 0);
    if (stored.length >= 25 || totalBytes + file.size > 100 * 1024 * 1024) {
      return res.status(400).json({ error: "Project file limit reached. Please share a Drive link instead." });
    }
    const storageId = await saveWorkspaceFile(portalId, file.buffer);
    const attachment = await addWorkspaceAttachment(portalId, actor, {
      kind: "file", name: safeAttachmentName(file.originalname), size: file.size, mime: file.mimetype, storageId,
    });
    return res.status(201).json({ success: true, attachment });
  } catch (err) { console.error("[Creator workspace] Upload failed", err); return res.status(503).json({ error: "File storage unavailable. Please share a link instead." }); }
}

/** Router is mounted under /api. Admin uses existing admin-session middleware; client uses portal session cookie. */
export function registerCreatorWorkspaceRoutes(
  router: Router,
  requireAdmin: RequestHandler,
  clientClaims: (req: any) => { portalId: number } | null,
) {
  router.patch("/creator/admin/leads/:leadId/portal/goal", requireAdmin, async (req: any, res) => {
    if (!creatorPortalEnabled()) return unavailable(res);
    const leadId = safeId(req.params.leadId), title = String(req.body?.title || "").trim();
    if (!leadId || !title || title.length > 180) return res.status(400).json({ error: "Enter a project title up to 180 characters" });
    try {
      const portal = await getCreatorPortalByLeadId(leadId);
      if (!portal) return res.status(404).json({ error: "Set up this client's portal first" });
      return res.json({ success: true, project_goal: await setWorkspaceGoal(Number(portal.id), title, req.creatorAdmin.email) });
    } catch (err) { console.error("[Creator workspace] Goal failed", err); return res.status(503).json({ error: "Could not save project goal" }); }
  });

  router.post("/creator/admin/leads/:leadId/portal/tasks", requireAdmin, async (req: any, res) => {
    if (!creatorPortalEnabled()) return unavailable(res);
    const leadId = safeId(req.params.leadId), title = String(req.body?.title || "").trim();
    const owner = req.body?.owner, priority = req.body?.priority;
    if (!leadId || !title || title.length > 255 || !["team","client"].includes(owner) || !["urgent","normal"].includes(priority))
      return res.status(400).json({ error: "Enter a task, owner and priority" });
    try {
      const portal = await getCreatorPortalByLeadId(leadId);
      if (!portal) return res.status(404).json({ error: "Set up this client's portal first" });
      const task = await addWorkspaceTask(Number(portal.id), title, owner, priority, req.creatorAdmin.email);
      return res.status(201).json({ success: true, task });
    } catch (err) { console.error("[Creator workspace] New task failed", err); return res.status(503).json({ error: "Could not save task" }); }
  });

  router.patch("/creator/admin/leads/:leadId/portal/tasks/:taskId", requireAdmin, async (req: any, res) => {
    if (!creatorPortalEnabled()) return unavailable(res);
    const leadId = safeId(req.params.leadId), taskId = safeId(req.params.taskId);
    if (!leadId || !taskId || typeof req.body?.done !== "boolean") return res.status(400).json({ error: "Invalid task update" });
    try {
      const portal = await getCreatorPortalByLeadId(leadId);
      if (!portal) return res.status(404).json({ error: "Project not found" });
      const task = await updateWorkspaceTask({ portalId: Number(portal.id), taskId, done: req.body.done, actor: req.creatorAdmin.email, role: "admin" });
      if (!task) return res.status(404).json({ error: "Task not found" });
      return res.json({ success: true, task });
    } catch (err) { console.error("[Creator workspace] Admin task failed", err); return res.status(503).json({ error: "Could not update task" }); }
  });

  router.patch("/creator/portal/tasks/:taskId", async (req: any, res) => {
    if (!creatorPortalEnabled()) return unavailable(res);
    const claims = clientClaims(req), taskId = safeId(req.params.taskId);
    if (!claims) return res.status(401).json({ error: "Client login required" });
    if (!taskId || typeof req.body?.done !== "boolean") return res.status(400).json({ error: "Invalid task update" });
    try {
      const task = await updateWorkspaceTask({ portalId: claims.portalId, taskId, done: req.body.done, actor: "creator", role: "client" });
      if (!task) return res.status(403).json({ error: "Only your assigned tasks can be checked off" });
      return res.json({ success: true, task });
    } catch (err) { console.error("[Creator workspace] Client task failed", err); return res.status(503).json({ error: "Could not update task" }); }
  });

  router.post("/creator/portal/attachments/link", async (req: any, res) => {
    if (!creatorPortalEnabled()) return unavailable(res);
    const claims = clientClaims(req);
    if (!claims) return res.status(401).json({ error: "Client login required" });
    const portal = await getPortalForSession(claims.portalId).catch(() => null);
    if (!portal) return res.status(401).json({ error: "Portal access inactive" });
    return saveLink(req, res, claims.portalId, "creator");
  });
  router.post("/creator/admin/leads/:leadId/portal/attachments/link", requireAdmin, async (req: any, res) => {
    if (!creatorPortalEnabled()) return unavailable(res);
    const leadId = safeId(req.params.leadId);
    if (!leadId) return res.status(400).json({ error: "Invalid lead" });
    const portal = await getCreatorPortalByLeadId(leadId).catch(() => null);
    if (!portal) return res.status(404).json({ error: "Portal not set up" });
    return saveLink(req, res, Number(portal.id), req.creatorAdmin.email);
  });

  // Verify the session BEFORE parsing upload bytes.
  router.post("/creator/portal/attachments/file", (req: any, res, next) => {
    if (!creatorPortalEnabled()) return unavailable(res);
    if (!clientClaims(req)) return res.status(401).json({ error: "Client login required" });
    next();
  }, singleUpload, async (req: any, res) => {
    const claims = clientClaims(req);
    if (!claims) return res.status(401).json({ error: "Client login required" });
    const portal = await getPortalForSession(claims.portalId).catch(() => null);
    if (!portal) return res.status(401).json({ error: "Portal access inactive" });
    return saveUpload(req, res, claims.portalId, "creator");
  });
  router.post("/creator/admin/leads/:leadId/portal/attachments/file", requireAdmin, singleUpload, async (req: any, res) => {
    if (!creatorPortalEnabled()) return unavailable(res);
    const leadId = safeId(req.params.leadId);
    if (!leadId) return res.status(400).json({ error: "Invalid lead" });
    const portal = await getCreatorPortalByLeadId(leadId).catch(() => null);
    if (!portal) return res.status(404).json({ error: "Portal not set up" });
    return saveUpload(req, res, Number(portal.id), req.creatorAdmin.email);
  });

  router.get("/creator/portal/attachments/:attachmentId", async (req: any, res) => {
    if (!creatorPortalEnabled()) return unavailable(res);
    const claims = clientClaims(req), attachmentId = safeId(req.params.attachmentId);
    if (!claims) return res.status(401).json({ error: "Client login required" });
    if (!attachmentId) return res.status(400).json({ error: "Invalid attachment" });
    const portal = await getPortalForSession(claims.portalId).catch(() => null);
    if (!portal) return res.status(401).json({ error: "Portal access inactive" });
    return download(res, claims.portalId, attachmentId);
  });
  router.get("/creator/admin/leads/:leadId/portal/attachments/:attachmentId", requireAdmin, async (req: any, res) => {
    if (!creatorPortalEnabled()) return unavailable(res);
    const leadId = safeId(req.params.leadId), attachmentId = safeId(req.params.attachmentId);
    if (!leadId || !attachmentId) return res.status(400).json({ error: "Invalid attachment" });
    const portal = await getCreatorPortalByLeadId(leadId).catch(() => null);
    if (!portal) return res.status(404).json({ error: "Portal not found" });
    return download(res, Number(portal.id), attachmentId);
  });
}

import { Router, type RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { sql } from "drizzle-orm";
import { getDb } from "../../db";
import {
  connectVisitorToLead,
  heartbeatVisitor,
  listLiveVisitorSessions,
  listRecentVisitorEvents,
  recordVisitorEvent,
  startVisitorSession,
} from "./repository";
import { sendTelegramVisitorAlert, shouldAlertForRoute, type VisitorAlertType } from "./telegram";

export const visitorRouter = Router();
const tokenPattern = /^[A-Za-z0-9_-]{16,128}$/;
const eventTypes = new Set<VisitorAlertType | "page_view" | "heartbeat">([
  "new_visitor", "dwell_threshold", "high_value_page", "returning_visitor", "inquiry_started", "inquiry_submitted", "page_view", "heartbeat",
]);

function validToken(value: unknown): value is string {
  return typeof value === "string" && tokenPattern.test(value);
}

function safeRoute(value: unknown) {
  if (typeof value !== "string") return "/";
  const route = value.slice(0, 500);
  return route.startsWith("/") ? route : "/";
}

function deviceType(value: unknown): "mobile" | "tablet" | "desktop" {
  return value === "mobile" || value === "tablet" ? value : "desktop";
}

const requireVisitorAdmin: RequestHandler = async (req: any, res, next) => {
  const authorization = req.headers.authorization;
  const secret = process.env.JWT_SECRET;
  if (!authorization?.startsWith("Bearer ") || !secret) return res.status(401).json({ error: "Admin authentication required" });
  try {
    const claims = jwt.verify(authorization.slice(7), secret) as { userId?: number | string; email?: string; role?: string };
    const userId = Number(claims.userId);
    if (claims.role !== "admin" || !Number.isSafeInteger(userId) || userId < 1) return res.status(403).json({ error: "Admin access required" });
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Visitor storage is unavailable" });
    const result = await db.execute(sql`SELECT id, email, role FROM users WHERE id = ${userId} LIMIT 1`);
    const rows = Array.isArray(result) ? result : ((result as { rows?: unknown[] }).rows ?? []);
    const user = rows[0] as { id: number; email?: string; role?: string } | undefined;
    if (!user || user.role !== "admin" || (claims.email && user.email?.toLowerCase() !== claims.email.toLowerCase())) return res.status(403).json({ error: "Admin access required" });
    req.visitorAdmin = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired admin session" });
  }
};

visitorRouter.post("/zakhy/visitor/session", async (req, res) => {
  const body = req.body || {};
  if (!validToken(body.visitorToken) || !validToken(body.sessionToken)) return res.status(400).json({ error: "Invalid visitor session token" });
  try {
    const id = await startVisitorSession({
      visitorToken: body.visitorToken,
      sessionToken: body.sessionToken,
      route: safeRoute(body.route),
      referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 1000) : null,
      source: typeof body.source === "string" ? body.source.slice(0, 100) : null,
      utmSource: typeof body.utmSource === "string" ? body.utmSource.slice(0, 255) : null,
      utmMedium: typeof body.utmMedium === "string" ? body.utmMedium.slice(0, 255) : null,
      utmCampaign: typeof body.utmCampaign === "string" ? body.utmCampaign.slice(0, 255) : null,
      deviceType: deviceType(body.deviceType),
      returning: body.returning === true,
    });
    const type: VisitorAlertType = body.returning === true ? "returning_visitor" : "new_visitor";
    await recordVisitorEvent({ sessionToken: body.sessionToken, eventType: type, route: safeRoute(body.route) });
    await sendTelegramVisitorAlert({ type, page: safeRoute(body.route), source: body.source, device: deviceType(body.deviceType), secondsOnSite: 0, returning: body.returning === true });
    return res.status(201).json({ success: true, sessionId: id, telegramAlertsEnabled: false });
  } catch (error) {
    console.error("[Zakhy visitor] Session start failed", error);
    return res.status(500).json({ error: "Visitor session unavailable" });
  }
});

visitorRouter.post("/zakhy/visitor/event", async (req, res) => {
  const body = req.body || {};
  if (!validToken(body.sessionToken) || !eventTypes.has(body.eventType)) return res.status(400).json({ error: "Invalid visitor event" });
  const route = safeRoute(body.route);
  try {
    await recordVisitorEvent({ sessionToken: body.sessionToken, eventType: body.eventType, route, metadata: typeof body.metadata === "object" ? body.metadata : {} });
    if (body.eventType !== "page_view" && body.eventType !== "heartbeat") {
      await sendTelegramVisitorAlert({ type: body.eventType, page: route, source: body.source, device: deviceType(body.deviceType), secondsOnSite: Number(body.secondsOnSite) || 0, returning: body.returning === true, leadId: Number.isSafeInteger(body.leadId) ? body.leadId : undefined });
    } else if (body.eventType === "page_view" && shouldAlertForRoute(route)) {
      await sendTelegramVisitorAlert({ type: "high_value_page", page: route, source: body.source, device: deviceType(body.deviceType), secondsOnSite: Number(body.secondsOnSite) || 0, returning: body.returning === true });
    }
    return res.status(202).json({ success: true, telegramAlertsEnabled: false });
  } catch (error) {
    console.error("[Zakhy visitor] Event failed", error);
    return res.status(500).json({ error: "Visitor event unavailable" });
  }
});

visitorRouter.post("/zakhy/visitor/heartbeat", async (req, res) => {
  const body = req.body || {};
  if (!validToken(body.sessionToken)) return res.status(400).json({ error: "Invalid visitor session token" });
  try {
    await heartbeatVisitor(body.sessionToken, safeRoute(body.route));
    return res.status(204).send();
  } catch (error) {
    console.error("[Zakhy visitor] Heartbeat failed", error);
    return res.status(500).json({ error: "Visitor heartbeat unavailable" });
  }
});

visitorRouter.post("/zakhy/visitor/connect-lead", async (req, res) => {
  const body = req.body || {};
  const leadId = Number(body.creatorLeadId);
  if (!validToken(body.sessionToken) || !Number.isSafeInteger(leadId) || leadId < 1) return res.status(400).json({ error: "Invalid visitor lead connection" });
  try {
    const connected = await connectVisitorToLead(body.sessionToken, leadId);
    return res.status(connected ? 200 : 404).json({ success: connected });
  } catch (error) {
    console.error("[Zakhy visitor] Lead connection failed", error);
    return res.status(500).json({ error: "Visitor lead connection unavailable" });
  }
});

visitorRouter.get("/zakhy/admin/live-visitors", requireVisitorAdmin, async (_req, res) => {
  try {
    const [sessions, events] = await Promise.all([listLiveVisitorSessions(), listRecentVisitorEvents(100)]);
    return res.json({ success: true, sessions, events, telegramAlertsEnabled: false });
  } catch (error) {
    console.error("[Zakhy visitor] Admin list failed", error);
    return res.status(500).json({ error: "Unable to load Live Visitors" });
  }
});

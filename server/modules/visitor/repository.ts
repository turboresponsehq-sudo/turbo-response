import { and, desc, eq, gt, sql } from "drizzle-orm";
import { getDb } from "../../db";
import { zakhyVisitorEvents, zakhyVisitorSessions } from "../../../drizzle/schema";

export type VisitorSessionInput = {
  visitorToken: string;
  sessionToken: string;
  route: string;
  referrer?: string | null;
  source?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  deviceType: "mobile" | "tablet" | "desktop";
  returning: boolean;
};

export type VisitorEventInput = {
  sessionToken: string;
  eventType: string;
  route: string;
  metadata?: Record<string, unknown>;
};

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Visitor storage is unavailable");
  return db;
}

export async function startVisitorSession(input: VisitorSessionInput) {
  const db = await requireDb();
  const existing = await db.select({ id: zakhyVisitorSessions.id })
    .from(zakhyVisitorSessions)
    .where(eq(zakhyVisitorSessions.sessionToken, input.sessionToken))
    .limit(1);

  if (existing[0]) {
    await db.update(zakhyVisitorSessions).set({
      currentRoute: input.route,
      lastSeenAt: new Date().toISOString(),
      deviceType: input.deviceType,
    }).where(eq(zakhyVisitorSessions.id, existing[0].id));
    return existing[0].id;
  }

  const result = await db.insert(zakhyVisitorSessions).values({
    visitorToken: input.visitorToken,
    sessionToken: input.sessionToken,
    entryRoute: input.route,
    currentRoute: input.route,
    referrer: input.referrer || null,
    source: input.source || null,
    utmSource: input.utmSource || null,
    utmMedium: input.utmMedium || null,
    utmCampaign: input.utmCampaign || null,
    deviceType: input.deviceType,
    returning: input.returning,
  }).returning({ id: zakhyVisitorSessions.id });
  return result[0].id;
}

export async function recordVisitorEvent(input: VisitorEventInput) {
  const db = await requireDb();
  const sessions = await db.select({ id: zakhyVisitorSessions.id })
    .from(zakhyVisitorSessions)
    .where(eq(zakhyVisitorSessions.sessionToken, input.sessionToken))
    .limit(1);
  const session = sessions[0];
  if (!session) return null;

  await db.insert(zakhyVisitorEvents).values({
    sessionId: session.id,
    eventType: input.eventType,
    route: input.route,
    metadata: input.metadata || {},
  });
  await db.update(zakhyVisitorSessions).set({ currentRoute: input.route, lastSeenAt: new Date().toISOString() })
    .where(eq(zakhyVisitorSessions.id, session.id));
  return session.id;
}

export async function heartbeatVisitor(sessionToken: string, route: string) {
  const db = await requireDb();
  await db.update(zakhyVisitorSessions).set({ currentRoute: route, lastSeenAt: new Date().toISOString() })
    .where(eq(zakhyVisitorSessions.sessionToken, sessionToken));
}

export async function connectVisitorToLead(sessionToken: string, creatorLeadId: number) {
  const db = await requireDb();
  const sessions = await db.select({ id: zakhyVisitorSessions.id })
    .from(zakhyVisitorSessions)
    .where(eq(zakhyVisitorSessions.sessionToken, sessionToken))
    .limit(1);
  if (!sessions[0]) return false;
  await db.update(zakhyVisitorSessions).set({ creatorLeadId }).where(eq(zakhyVisitorSessions.id, sessions[0].id));
  await db.insert(zakhyVisitorEvents).values({
    sessionId: sessions[0].id,
    eventType: "inquiry_submitted",
    route: "/creator/start",
    metadata: { creatorLeadId },
  });
  return true;
}

export async function listLiveVisitorSessions(limit = 50) {
  const db = await requireDb();
  const cutoff = new Date(Date.now() - 90_000).toISOString();
  return db.select({
    id: zakhyVisitorSessions.id,
    currentRoute: zakhyVisitorSessions.currentRoute,
    entryRoute: zakhyVisitorSessions.entryRoute,
    source: zakhyVisitorSessions.source,
    utmSource: zakhyVisitorSessions.utmSource,
    deviceType: zakhyVisitorSessions.deviceType,
    returning: zakhyVisitorSessions.returning,
    startedAt: zakhyVisitorSessions.startedAt,
    lastSeenAt: zakhyVisitorSessions.lastSeenAt,
    creatorLeadId: zakhyVisitorSessions.creatorLeadId,
  }).from(zakhyVisitorSessions)
    .where(gt(zakhyVisitorSessions.lastSeenAt, cutoff))
    .orderBy(desc(zakhyVisitorSessions.lastSeenAt))
    .limit(Math.min(Math.max(limit, 1), 100));
}

export async function listRecentVisitorEvents(limit = 100) {
  const db = await requireDb();
  return db.select({
    id: zakhyVisitorEvents.id,
    sessionId: zakhyVisitorEvents.sessionId,
    eventType: zakhyVisitorEvents.eventType,
    route: zakhyVisitorEvents.route,
    metadata: zakhyVisitorEvents.metadata,
    createdAt: zakhyVisitorEvents.createdAt,
  }).from(zakhyVisitorEvents).orderBy(desc(zakhyVisitorEvents.createdAt)).limit(Math.min(Math.max(limit, 1), 200));
}

export async function countSessionEvents(sessionId: number, eventType: string) {
  const db = await requireDb();
  const result = await db.select({ count: sql<number>`count(*)` }).from(zakhyVisitorEvents)
    .where(and(eq(zakhyVisitorEvents.sessionId, sessionId), eq(zakhyVisitorEvents.eventType, eventType)));
  return Number(result[0]?.count || 0);
}

export async function pruneVisitorData(retentionDays = 30) {
  const db = await requireDb();
  const cutoff = new Date(Date.now() - retentionDays * 86_400_000).toISOString();
  await db.delete(zakhyVisitorEvents).where(sql`${zakhyVisitorEvents.createdAt} < ${cutoff}`);
  await db.delete(zakhyVisitorSessions).where(sql`${zakhyVisitorSessions.lastSeenAt} < ${cutoff}`);
}

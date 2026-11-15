import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../db";
export const rows = (result: any): any[] => Array.isArray(result) ? result : result?.rows ?? [];
export const pending = { database: "migration_pending" as const, ready: false as const };
export const ready = { database: "ready" as const, ready: true as const };
export async function contentDb() {
  const db = await getDb();
  if (!db) return null;
  try {
    const r = rows(await db.execute(sql`SELECT to_regclass('public.mb_content_publications') AS publication, to_regclass('public.mb_content_media') AS media, to_regclass('public.mb_content_story_drafts') AS drafts`))[0];
    return r?.publication && r?.media && r?.drafts ? db : null;
  } catch { return null; }
}
export function notFound(message: string): never { throw new TRPCError({ code: "NOT_FOUND", message }); }
export function badRequest(message: string): never { throw new TRPCError({ code: "BAD_REQUEST", message }); }
export function normalizeVideo(v: any) { return v ? { ...v, id: Number(v.id) } : null; }
export function normalizeStory(s: any) {
  return { artworkId: Number(s.artwork_id), stableKey: s.stable_key, title: s.title, subtitle: s.subtitle, body: s.body, era: s.era, location: s.location, displayOrder: s.display_order, recognitionEnabled: s.recognition_enabled, updatedAt: s.updated_at, publication: s.snapshot_id ? { snapshotId: s.snapshot_id, enabled: s.enabled, releaseAt: s.release_at, expiresAt: s.expires_at, publishedAt: s.published_at } : null };
}

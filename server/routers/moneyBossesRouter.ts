import { z } from "zod";
import { sql } from "drizzle-orm";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

const emptyOverview = {
  database: "migration_pending" as const,
  memberships: 0,
  activeMemberships: 0,
  archiveArtworks: 0,
  approvedVideos: 0,
  activeQrDestinations: 0,
  walletProviders: [
    { provider: "Apple Wallet", state: "not_configured", requirement: "Pass Type ID, certificate, signed .pkpass service, update endpoint" },
    { provider: "Google Wallet", state: "not_configured", requirement: "Issuer account, Cloud project, service account, publishing access" },
    { provider: "Samsung Wallet", state: "not_configured", requirement: "Partner onboarding, card ID, CSR/encryption and certification" },
  ],
};

function rows(result: any): any[] {
  return Array.isArray(result) ? result : ((result as { rows?: unknown[] }).rows ?? []);
}

async function tableExists(db: any, tableName: string) {
  const result = await db.execute(sql`SELECT to_regclass(${`public.${tableName}`}) AS table_name`);
  return Boolean(rows(result)[0]?.table_name);
}

export const moneyBossesRouter = router({
  overview: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db || !(await tableExists(db, "mb_memberships"))) return emptyOverview;

    const result = await db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM mb_memberships WHERE deleted_at IS NULL) AS memberships,
        (SELECT COUNT(*)::int FROM mb_memberships WHERE status = 'active' AND deleted_at IS NULL) AS active_memberships,
        (SELECT COUNT(*)::int FROM mb_archive_artworks WHERE deleted_at IS NULL) AS archive_artworks,
        (SELECT COUNT(*)::int FROM mb_archive_videos WHERE status = 'approved') AS approved_videos,
        (SELECT COUNT(*)::int FROM mb_qr_destinations WHERE status = 'active') AS active_qr_destinations
    `);
    const row = rows(result)[0] || {};
    return {
      ...emptyOverview,
      database: "ready" as const,
      memberships: Number(row.memberships || 0),
      activeMemberships: Number(row.active_memberships || 0),
      archiveArtworks: Number(row.archive_artworks || 0),
      approvedVideos: Number(row.approved_videos || 0),
      activeQrDestinations: Number(row.active_qr_destinations || 0),
    };
  }),

  archiveContent: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db || !(await tableExists(db, "mb_archive_artworks"))) return { database: "migration_pending" as const, artworks: [], videos: [] };
      const limit = input?.limit ?? 50;
      const artworkResult = await db.execute(sql`SELECT id, stable_key, title, source_asset_id, source_checksum, recognition_enabled, approved, updated_at FROM mb_archive_artworks WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT ${limit}`);
      const videoResult = await db.execute(sql`SELECT id, label, media_url, status, audio_rights_status, updated_at FROM mb_archive_videos ORDER BY updated_at DESC LIMIT ${limit}`);
      return { database: "ready" as const, artworks: rows(artworkResult), videos: rows(videoResult) };
    }),

  createArchiveVideoDraft: adminProcedure
    .input(z.object({
      label: z.string().trim().min(1).max(160),
      mediaUrl: z.string().url().max(2000),
      sourceNote: z.string().trim().max(1000).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db || !(await tableExists(db, "mb_archive_videos"))) {
        return { database: "migration_pending" as const, created: false };
      }
      const result = await db.execute(sql`
        INSERT INTO mb_archive_videos(label, media_url, status, audio_rights_status, source_note)
        VALUES (${input.label}, ${input.mediaUrl}, 'draft', 'pending_review', ${input.sourceNote || null})
        RETURNING id, label, media_url, status, audio_rights_status, source_note, created_at
      `);
      return { database: "ready" as const, created: true, video: rows(result)[0] || null };
    }),

  assignArchiveVideo: adminProcedure
    .input(z.object({ artworkId: z.number().int().positive(), videoId: z.number().int().positive(), isDefault: z.boolean().default(true) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db || !(await tableExists(db, "mb_archive_artwork_videos"))) {
        return { database: "migration_pending" as const, assigned: false };
      }
      await db.execute(sql`
        INSERT INTO mb_archive_artwork_videos(artwork_id, video_id, is_default)
        VALUES (${input.artworkId}, ${input.videoId}, ${input.isDefault})
        ON CONFLICT (artwork_id, video_id) DO UPDATE SET is_default = EXCLUDED.is_default
      `);
      return { database: "ready" as const, assigned: true };
    }),

  integrations: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db || !(await tableExists(db, "mb_integration_settings"))) return { database: "migration_pending" as const, integrations: emptyOverview.walletProviders };
    const result = await db.execute(sql`SELECT provider, state, account_label, external_account_ref, updated_at FROM mb_integration_settings ORDER BY provider`);
    return { database: "ready" as const, integrations: rows(result) };
  }),

  members: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db || !(await tableExists(db, "mb_memberships"))) return { database: "migration_pending" as const, members: [] };
      const limit = input?.limit ?? 50;
      const result = await db.execute(sql`SELECT id, internal_id, member_name, preferred_name, tier, status, member_since, valid_until, card_artwork_version, photo_consent, created_at, updated_at FROM mb_memberships WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT ${limit}`);
      return { database: "ready" as const, members: rows(result) };
    }),
});

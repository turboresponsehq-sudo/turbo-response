import { z } from "zod";
import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { archiveContent, saveStory, createVideo, updateVideo, assignVideo, publishStory, unpublishStory } from "../modules/moneyBosses/service";
import { contentDb, pending, ready, rows } from "../modules/moneyBosses/database";
import { flags, idSchema, mediaIdSchema, mediaPath, storySchema, videoCreateSchema, videoUpdateSchema, publishSchema } from "../modules/moneyBosses/validation";
import { signPreviewTicket } from "../modules/moneyBosses/media";

const emptyOverview = {
  database: "migration_pending" as const,
  ...flags,
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
async function tableExists(db: any, tableName: string) {
  const result = await db.execute(sql`SELECT to_regclass(${`public.${tableName}`}) AS table_name`);
  return Boolean(rows(result)[0]?.table_name);
}
const publishProcedure = adminProcedure.input(publishSchema).mutation(({ input, ctx }) => publishStory(input, ctx.user.id));
const unpublishProcedure = adminProcedure.input(z.object({ artworkId: idSchema })).mutation(({ input }) => unpublishStory(input.artworkId));
const updateVideoProcedure = adminProcedure.input(videoUpdateSchema).mutation(({ input }) => updateVideo(input));

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
    return { ...emptyOverview, database: "ready" as const, memberships: Number(row.memberships || 0), activeMemberships: Number(row.active_memberships || 0), archiveArtworks: Number(row.archive_artworks || 0), approvedVideos: Number(row.approved_videos || 0), activeQrDestinations: Number(row.active_qr_destinations || 0) };
  }),
  archiveContent: adminProcedure.input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional()).query(({ input }) => archiveContent(input?.limit ?? 50)),
  saveArchiveStoryDraft: adminProcedure.input(storySchema).mutation(({ input, ctx }) => saveStory(input, ctx.user.id)),
  saveArchiveStory: adminProcedure.input(z.object({ artworkId: idSchema, storyTitle: z.string().trim().min(1).max(160), storyBody: z.string().trim().max(20000) })).mutation(({ input, ctx }) => saveStory(input, ctx.user.id, true)),
  createArchiveVideoDraft: adminProcedure.input(videoCreateSchema).mutation(({ input }) => createVideo(input)),
  updateArchiveVideoDraft: updateVideoProcedure,
  updateArchiveVideo: updateVideoProcedure,
  assignArchiveVideo: adminProcedure.input(z.object({ artworkId: idSchema, videoId: idSchema, isDefault: z.boolean().default(true) })).mutation(({ input }) => assignVideo(input)),
  removeArchiveVideoAssignment: adminProcedure.input(z.object({ artworkId: idSchema, videoId: idSchema })).mutation(({ input }) => assignVideo(input, true)),
  publishArchiveStory: publishProcedure,
  publishArchiveArtwork: publishProcedure,
  unpublishArchiveStory: unpublishProcedure,
  unpublishArchiveArtwork: unpublishProcedure,
  createArchiveMediaPreview: adminProcedure.input(z.object({ mediaId: mediaIdSchema })).mutation(async ({ input, ctx }) => {
    const db = await contentDb();
    if (!db) return { ...pending };
    if (!rows(await db.execute(sql`SELECT id FROM mb_content_media WHERE id=${input.mediaId}`))[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Uploaded media not found" });
    try {
      const preview = signPreviewTicket(input.mediaId, ctx.user.id);
      return { ...ready, url: `${mediaPath(input.mediaId)}?ticket=${preview.ticket}`, expiresAt: preview.expiresAt };
    } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Private preview signing is unavailable" }); }
  }),
  integrations: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db || !(await tableExists(db, "mb_integration_settings"))) return { database: "migration_pending" as const, integrations: emptyOverview.walletProviders };
    const result = await db.execute(sql`SELECT provider, state, account_label, external_account_ref, updated_at FROM mb_integration_settings ORDER BY provider`);
    return { database: "ready" as const, integrations: rows(result) };
  }),
  members: adminProcedure.input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db || !(await tableExists(db, "mb_memberships"))) return { database: "migration_pending" as const, members: [] };
    const result = await db.execute(sql`SELECT id, internal_id, member_name, preferred_name, tier, status, member_since, valid_until, card_artwork_version, photo_consent, created_at, updated_at FROM mb_memberships WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT ${input?.limit ?? 50}`);
    return { database: "ready" as const, members: rows(result) };
  }),
});

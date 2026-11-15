import { isIP } from "node:net";
import { z } from "zod";

// Exact approved source references. Draft/save/publish APIs cannot change these fields.
export const ARTWORK_REFERENCES = {
  "tony-tripp": { subject: "Tony Tripp", label: "Red Shirt", image: "/approved/tony-tripp.jpg", sha256: "4a1dab1ea4014ad7c8eb45de9246d3f4abd4c7151ee41d3b54c0460d0b321f63", alt: "Original photograph of Tony Tripp wearing a red shirt" },
  "rod-tre": { subject: "Rod & Tre", label: "Wicker Chair / Jets", image: "/approved/rod-tre.jpg", sha256: "f6a73e7db9d4ab6d2c1d732185f38511ff46e6e0232aea0319da5883a1b195d5", alt: "Original archival photograph of Rod and Tre with a wicker chair and Jets clothing" },
  "cow-pac": { subject: "Cow Pac", label: "Red Cap / Gold Chains", image: "/approved/cow-pac.jpg", sha256: "2ded90dcd1b1788819ff208fec427bdf34061055f7ce403945deabcd0d6b7f28", alt: "Original photograph of Cow Pac wearing a red cap and gold chains" },
} as const;
export type StableKey = keyof typeof ARTWORK_REFERENCES;
export const flags = { credentialsEnabled: false as const, membershipEnabled: false as const };
export const idSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
export const dateSchema = z.string().datetime({ offset: true });
export const mediaIdSchema = z.string().uuid();
export const mediaPath = (id: string) => `/api/money-bosses/media/${id}`;
export function isSafeExternalVideoUrl(value: string): boolean {
  try {
    const u = new URL(value);
    const h = u.hostname.toLowerCase().replace(/\.$/, "");
    return u.protocol === "https:" && !u.username && !u.password && !u.hash &&
      (!u.port || u.port === "443") && !isIP(h.replace(/^\[|\]$/g, "")) &&
      h.includes(".") && !/(^|\.)(instagram\.com|localhost|local|internal|test|invalid|example)$/.test(h) &&
      !h.endsWith(".localhost") && !h.endsWith(".local") && !h.endsWith(".internal") &&
      !h.endsWith(".localdomain") && !/^(localhost|0x[0-9a-f]+|[0-9]+)$/.test(h);
  } catch { return false; }
}
export const externalVideoUrlSchema = z.string().max(2000).refine(isSafeExternalVideoUrl, "Use an independently hosted public HTTPS video URL (no credentials, Instagram, or local/IP hosts)");
// Stable local URL compatibility. Query strings/tickets/local paths cannot become saved media.
export const savedMediaUrlSchema = z.string().max(2000).refine(value => isSafeExternalVideoUrl(value) || /^\/api\/money-bosses\/media\/[0-9a-f-]{36}$/i.test(value), "Use a valid uploaded media URL or independently hosted HTTPS video URL");
export const storySchema = z.object({
  artworkId: idSchema, title: z.string().trim().min(1).max(160),
  subtitle: z.string().trim().max(300).default(""), body: z.string().trim().max(20000),
  era: z.string().trim().max(100).default(""), location: z.string().trim().max(160).default(""),
  displayOrder: z.number().int().min(0).max(1000).default(0), recognitionEnabled: z.boolean().default(true),
});
export const videoCreateSchema = z.object({ label: z.string().trim().min(1).max(160), mediaUrl: savedMediaUrlSchema.optional(), mediaId: mediaIdSchema.optional(), sourceNote: z.string().trim().max(1000).optional(), releaseAt: dateSchema.optional() })
  .refine(v => Boolean(v.mediaUrl) !== Boolean(v.mediaId), "Provide exactly one mediaUrl or mediaId");
export const videoUpdateSchema = z.object({ videoId: idSchema, label: z.string().trim().min(1).max(160), mediaUrl: savedMediaUrlSchema.optional(), mediaId: mediaIdSchema.optional(), sourceNote: z.string().trim().max(1000).optional(), releaseAt: dateSchema.nullable().optional(), audioApproved: z.boolean().optional(), contentApproved: z.boolean().optional(), audioRightsStatus: z.enum(["pending_review", "approved", "blocked"]).optional() })
  .refine(v => !(v.mediaUrl && v.mediaId), "Provide at most one media source");
export const publishSchema = z.object({ artworkId: idSchema, videoId: idSchema.optional(), approval: z.literal(true), audioRightsApproved: z.boolean().optional(), releaseAt: dateSchema.nullable().optional(), expiresAt: dateSchema.nullable().optional() });

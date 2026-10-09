import { z } from "zod";

const shortText = (max: number) => z.string().trim().max(max);
const optionalShortText = (max: number) => shortText(max).optional().or(z.literal(""));
const optionalLongText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const AMANI_CLIENT_KEY = "amani" as const;
export const AMANI_RELATIONSHIP_OWNER = "AMANI" as const;

export const amaniInquirySchema = z.object({
  fullName: shortText(255).min(2),
  email: z.string().trim().email().max(320),
  phone: optionalShortText(50),
  organization: optionalShortText(255),
  role: optionalShortText(255),
  city: optionalShortText(255),
  brandOrSocial: optionalShortText(500),
  goal: shortText(500).min(2),
  challenge: shortText(500).min(2),
  stage: shortText(255).min(2),
  timeline: shortText(255).min(2),
  investment: optionalShortText(100),
  notes: optionalLongText(4000),
  source: shortText(100).optional(),
  sourcePath: shortText(500).optional(),
  landingPage: shortText(500).optional(),
  utm: z.object({
    source: optionalShortText(255),
    medium: optionalShortText(255),
    campaign: optionalShortText(255),
    term: optionalShortText(255),
    content: optionalShortText(255),
  }).optional(),
  consent: z.literal(true),
  clientSubmissionId: z.string().uuid(),
  website: z.string().max(0).optional(),
});

export type AmaniInquiryInput = z.infer<typeof amaniInquirySchema> & { isInternalTest: boolean };

export type AmaniOpportunity = {
  id: number;
  relationshipId: number;
  clientSubmissionId: string;
  createdAt: string;
  hubspotContactId: string | null;
  hubspotNoteId: string | null;
  hubspotSyncStatus: "pending" | "synced" | "failed" | "disabled";
  isInternalTest: boolean;
};

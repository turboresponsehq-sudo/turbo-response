import { z } from "zod";

export const CREATOR_TYPES = [
  "Artist",
  "Rapper",
  "Influencer",
  "Podcaster",
  "DJ",
  "Comedian",
  "Athlete",
  "Other",
] as const;

export const CREATOR_LEAD_STATUSES = [
  "new",
  "reviewing",
  "follow_up",
  "converted",
  "closed",
] as const;

const checkboxValues = [
  "Performances",
  "Features",
  "Hosting / Appearances",
  "Merch",
  "Sponsorships",
  "Brand deals",
  "Events",
  "Content",
  "Memberships",
  "Digital products",
  "Services",
  "Affiliate income",
  "Other",
] as const;

const brandAssets = [
  "Website",
  "Domain",
  "Logo",
  "Brand colors",
  "Professional photos",
  "Videos",
  "Merch store",
  "Booking page",
] as const;

const businessSystems = [
  "Booking system",
  "CRM",
  "Email marketing",
  "SMS marketing",
  "Analytics dashboard",
  "Online store",
  "Payment system",
  "AI chatbot",
  "Automations",
] as const;

const opportunities = [
  "Bookings",
  "Features",
  "Collaborations",
  "Sponsorships",
  "Brand deals",
  "Events",
  "Fan growth",
  "Merch sales",
  "Music promotion",
  "Content growth",
] as const;

const shortText = (max: number) => z.string().trim().max(max);
const longText = (max: number) => z.string().trim().max(max);
const urls = z.array(z.string().trim().url().max(500)).max(8);

export const creatorLeadInputSchema = z.object({
  fullName: shortText(255).min(2),
  brandName: shortText(255).optional().or(z.literal("")),
  email: z.string().trim().email().max(320),
  phone: shortText(50).optional().or(z.literal("")),
  creatorType: z.enum(CREATOR_TYPES),
  socialLinks: urls.default([]),
  websiteUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  goals: longText(4000).min(8),
  challenges: longText(4000).min(8),
  automationWish: longText(4000).optional().or(z.literal("")),
  revenueStreams: z.array(z.enum(checkboxValues)).max(checkboxValues.length).default([]),
  additionalMonetization: longText(2000).optional().or(z.literal("")),
  audienceLocation: longText(1000).optional().or(z.literal("")),
  priorityPlatforms: z.array(shortText(100)).max(12).default([]),
  audienceSize: shortText(100).optional().or(z.literal("")),
  collectsFanContacts: z.enum(["Yes", "No", "Not sure"]).optional(),
  brandAssets: z.array(z.enum(brandAssets)).max(brandAssets.length).default([]),
  brandStyle: longText(1000).optional().or(z.literal("")),
  businessSystems: z.array(z.enum(businessSystems)).max(businessSystems.length).default([]),
  opportunityFocus: z.array(z.enum(opportunities)).max(opportunities.length).default([]),
  projectPriority: longText(2000).min(8),
  budgetRange: z.enum([
    "Under $1,000",
    "$1,000–$2,500",
    "$2,500–$5,000",
    "$5,000–$10,000",
    "$10,000+",
  ]).optional(),
  packageInterest: z.enum(["Creator Website", "Turbo Automations", "Full Creator Business System", "Not sure yet"]).optional(),
  finalQuestion: longText(4000).optional().or(z.literal("")),
  consent: z.literal(true),
  source: shortText(100).optional(),
  sourcePath: shortText(500).optional(),
  utm: z.object({
    source: shortText(255).optional(),
    medium: shortText(255).optional(),
    campaign: shortText(255).optional(),
  }).optional(),
  website: z.string().max(0).optional(),
});

export const creatorLeadStatusSchema = z.object({
  status: z.enum(CREATOR_LEAD_STATUSES),
});

export const creatorLeadNoteSchema = z.object({
  note: longText(4000).min(1),
});

export const creatorLeadTaskSchema = z.object({
  taskType: shortText(100).min(1),
  taskDetail: longText(2000).optional().or(z.literal("")),
  dueAt: z.string().datetime({ offset: true }).optional(),
});

export type CreatorLeadInput = z.infer<typeof creatorLeadInputSchema>;
export type CreatorLeadStatus = z.infer<typeof creatorLeadStatusSchema>["status"];
export type CreatorLeadNoteInput = z.infer<typeof creatorLeadNoteSchema>;
export type CreatorLeadTaskInput = z.infer<typeof creatorLeadTaskSchema>;

export const creatorLeadOptionSets = {
  revenueStreams: checkboxValues,
  brandAssets,
  businessSystems,
  opportunities,
} as const;

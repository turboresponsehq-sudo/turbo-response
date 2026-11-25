import { describe, expect, it } from "vitest";
import { creatorLeadInputSchema, creatorLeadStatusSchema } from "./types";

const validCreatorLead = {
  fullName: "Jordan Creator",
  brandName: "Jordan Creates",
  email: "jordan@example.com",
  creatorType: "Artist",
  socialLinks: ["https://instagram.com/jordancreates"],
  goals: "Build a professional website and organize booking requests this year.",
  challenges: "Booking opportunities get lost across direct messages and email.",
  revenueStreams: ["Performances", "Merch"],
  brandAssets: ["Logo"],
  businessSystems: ["Booking system"],
  opportunityFocus: ["Bookings"],
  projectPriority: "Create a strong booking and fan capture system first.",
  consent: true,
};

describe("creatorLeadInputSchema", () => {
  it("accepts a complete creator project request", () => {
    const result = creatorLeadInputSchema.safeParse(validCreatorLead);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("jordan@example.com");
  });

  it("accepts a business automation request and keeps its operational answers", () => {
    const result = creatorLeadInputSchema.safeParse({ ...validCreatorLead, creatorType: "Small business", packageInterest: "AI & Business Systems", revenueStreams: ["Product sales", "Services"], businessSystems: ["CRM", "Accounting software", "Spreadsheets"], opportunityFocus: ["Sales conversion", "Internal workflows", "Reporting / analytics"], priorityPlatforms: ["QuickBooks", "HubSpot"], automationWish: "Automate lead follow-up and weekly reporting.", audienceLocation: "Retail", audienceSize: "6–20", finalQuestion: "Improve response times within 60 days." });
    expect(result.success).toBe(true);
    if (result.success) { expect(result.data.creatorType).toBe("Small business"); expect(result.data.automationWish).toContain("weekly reporting"); }
  });
  it("continues accepting legacy package values", () => {
    expect(creatorLeadInputSchema.safeParse({ ...validCreatorLead, packageInterest: "Turbo Automations" }).success).toBe(true);
  });

  it("requires consent and the key project context", () => {
    const result = creatorLeadInputSchema.safeParse({ ...validCreatorLead, consent: false, projectPriority: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status values", () => {
    expect(creatorLeadStatusSchema.safeParse({ status: "delete_everything" }).success).toBe(false);
    expect(creatorLeadStatusSchema.safeParse({ status: "follow_up" }).success).toBe(true);
  });
});

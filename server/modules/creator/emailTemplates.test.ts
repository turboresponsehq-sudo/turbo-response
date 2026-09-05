import { describe, expect, it } from "vitest";
import {
  buildCreatorLeadConfirmationEmail,
  buildCreatorLeadOwnerEmail,
  creatorEmailSendingEnabled,
} from "./emailTemplates";

const lead = {
  fullName: "Ralo Creator",
  brandName: "FAMGOON",
  creatorType: "Artist",
  projectPriority: "Organize booking, merch, and fan opportunities.",
  budgetRange: "$2,500–$5,000",
  packageInterest: "Turbo Automations",
  leadId: 42,
};

describe("Creator V1 email templates", () => {
  it("uses Zakhy Builds AI branding for creator confirmation", () => {
    const email = buildCreatorLeadConfirmationEmail(lead);
    expect(email.subject).toContain("Zakhy Builds AI");
    expect(email.html).toContain("ZAKHY BUILDS AI");
    expect(email.html).toContain("Ralo");
  });

  it("builds an owner review email without delivering it", () => {
    const email = buildCreatorLeadOwnerEmail(lead, "https://turboresponsehq.ai/admin/creator/leads?lead=42");
    expect(email.subject).toContain("FAMGOON");
    expect(email.html).toContain("Review Creator Lead");
    expect(creatorEmailSendingEnabled()).toBe(false);
  });
});

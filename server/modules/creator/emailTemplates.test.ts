import { describe, expect, it } from "vitest";
import {
  buildCreatorLeadConfirmationEmail,
  buildCreatorLeadOwnerEmail,
} from "./emailTemplates";

const lead = {
  fullName: "Ralo Creator",
  brandName: "FAMGOON",
  email: "ralo@example.test",
  phone: "404-555-0101",
  creatorType: "Artist",
  projectPriority: "Organize booking, merch, and fan opportunities.",
  budgetRange: "$2,500–$5,000",
  packageInterest: "Turbo Automations",
  submittedAt: "2026-09-05T03:00:00.000Z",
  leadId: 42,
};

describe("Creator V1 email templates", () => {
  it("uses Zakhy Builds AI branding for creator confirmation", () => {
    const email = buildCreatorLeadConfirmationEmail(lead);
    expect(email.subject).toContain("Zakhy Builds AI");
    expect(email.html).toContain("ZAKHY BUILDS AI");
    expect(email.html).toContain("Ralo");
    expect(email.html).not.toContain("Turbo Response");
  });

  it("renders the full Zakhy admin notification without delivering it", () => {
    const email = buildCreatorLeadOwnerEmail(lead, "https://turboresponsehq.ai/admin/creator/leads?lead=42");
    expect(email.subject).toBe("New Creator Inquiry — FAMGOON");
    expect(email.html).toContain("Review Creator Lead");
    expect(email.html).toContain("ralo@example.test");
    expect(email.html).toContain("404-555-0101");
    expect(email.html).toContain("Requested service");
    expect(email.html).not.toContain("Turbo Response");
  });
});

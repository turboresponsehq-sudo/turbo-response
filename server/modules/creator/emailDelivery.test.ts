import { describe, expect, it } from "vitest";
import {
  creatorEmailSendingEnabled,
  deliverCreatorLeadEmails,
  getCreatorEmailConfiguration,
  type CreatorMailMessage,
} from "./emailDelivery";

const lead = {
  fullName: "Ralo Creator",
  brandName: "FAMGOON",
  email: "ralo@example.test",
  phone: "404-555-0101",
  creatorType: "Artist",
  projectPriority: "Build a strong booking and merch system.",
  budgetRange: "$2,500–$5,000",
  packageInterest: "Turbo Automations",
  submittedAt: "2026-09-05T03:00:00.000Z",
  leadId: 42,
};

const enabledEnvironment = {
  CREATOR_EMAIL_SENDING_ENABLED: "true",
  EMAIL_USER: "smtp@example.test",
  EMAIL_PASSWORD: "test-password",
  ZAKHY_EMAIL_FROM: "hello@zakhybuilds.ai",
  ZAKHY_ADMIN_EMAIL: "admin@zakhybuilds.ai",
  ZAKHY_FRONTEND_URL: "https://zakhybuilds.ai",
};

describe("Creator email delivery", () => {
  it("keeps the email gate off by default and suppresses delivery", async () => {
    expect(creatorEmailSendingEnabled({})).toBe(false);
    const result = await deliverCreatorLeadEmails(lead, { environment: {} });
    expect(result).toMatchObject({
      status: "suppressed",
      admin: "suppressed",
      creator: "suppressed",
    });
  });

  it("requires Creator-specific identity, recipient, and link configuration when enabled", () => {
    const result = getCreatorEmailConfiguration({
      CREATOR_EMAIL_SENDING_ENABLED: "true",
      EMAIL_USER: "smtp@example.test",
      EMAIL_PASSWORD: "test-password",
    });
    expect(result.configuration).toBeNull();
    expect(result.missingVariables).toEqual([
      "ZAKHY_EMAIL_FROM",
      "ZAKHY_ADMIN_EMAIL",
      "ZAKHY_FRONTEND_URL",
    ]);
  });

  it("sends the Zakhy admin notification and creator confirmation when explicitly enabled", async () => {
    const sent: CreatorMailMessage[] = [];
    const result = await deliverCreatorLeadEmails(lead, {
      environment: enabledEnvironment,
      transport: { sendMail: async (message) => { sent.push(message); } },
    });

    expect(result).toMatchObject({ status: "sent", admin: "sent", creator: "sent" });
    expect(sent).toHaveLength(2);
    expect(sent[0]).toMatchObject({
      from: '"Zakhy Builds AI" <hello@zakhybuilds.ai>',
      to: "admin@zakhybuilds.ai",
      subject: "New Creator Inquiry — FAMGOON",
    });
    expect(sent[0].html).toContain("https://zakhybuilds.ai/admin/creator/leads?lead=42");
    expect(sent[1]).toMatchObject({
      to: "ralo@example.test",
      subject: "We received your Creator Project request | Zakhy Builds AI",
    });
    expect(sent.every((message) => !message.html.includes("Turbo Response"))).toBe(true);
  });

  it("contains mail transport failures without throwing or losing the lead context", async () => {
    const result = await deliverCreatorLeadEmails(lead, {
      environment: enabledEnvironment,
      transport: { sendMail: async () => { throw new Error("SMTP unavailable"); } },
    });

    expect(result.status).toBe("failed");
    expect(result.admin).toBe("failed");
    expect(result.creator).toBe("failed");
    expect(result.failures).toHaveLength(2);
    expect(lead.leadId).toBe(42);
  });
});

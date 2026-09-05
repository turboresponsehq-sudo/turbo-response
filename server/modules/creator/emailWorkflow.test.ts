import { describe, expect, it } from "vitest";
import { processCreatorLeadEmailWorkflow } from "./emailWorkflow";

const lead = {
  fullName: "Ralo Creator",
  brandName: "FAMGOON",
  email: "ralo@example.test",
  creatorType: "Artist",
  projectPriority: "Build a strong booking and merch system.",
  leadId: 42,
};

describe("Creator email workflow events", () => {
  it("records one Creator-only suppression event while email is disabled", async () => {
    const events: any[] = [];
    const result = await processCreatorLeadEmailWorkflow(lead, {
      deliver: async () => ({
        status: "suppressed",
        admin: "suppressed",
        creator: "suppressed",
        missingVariables: [],
        failures: [],
      }),
      writeEvent: async (event) => { events.push(event); },
    });

    expect(result.status).toBe("suppressed");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      creatorLeadId: 42,
      eventType: "email_suppressed",
      actor: "creator_email_safety_gate",
    });
  });

  it("records successful admin and creator delivery events in Creator tables only", async () => {
    const events: any[] = [];
    await processCreatorLeadEmailWorkflow(lead, {
      deliver: async () => ({
        status: "sent",
        admin: "sent",
        creator: "sent",
        missingVariables: [],
        failures: [],
      }),
      writeEvent: async (event) => { events.push(event); },
    });

    expect(events.map((event) => event.eventType)).toEqual([
      "admin_email_sent",
      "creator_confirmation_sent",
    ]);
    expect(events.every((event) => event.creatorLeadId === 42)).toBe(true);
  });

  it("records failures but resolves so a previously saved lead remains accepted", async () => {
    const events: any[] = [];
    const result = await processCreatorLeadEmailWorkflow(lead, {
      deliver: async () => ({
        status: "failed",
        admin: "failed",
        creator: "failed",
        missingVariables: [],
        failures: [
          { recipient: "admin", reason: "SMTP unavailable" },
          { recipient: "creator", reason: "SMTP unavailable" },
        ],
      }),
      writeEvent: async (event) => { events.push(event); },
    });

    expect(result.status).toBe("failed");
    expect(events.map((event) => event.eventType)).toEqual(["email_failed", "email_failed"]);
    expect(events.every((event) => event.creatorLeadId === 42)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { clientMessageEvent, newChatLeadEvent, newIntakeEvent, xaiSyncFailureEvent } from "./operationalIntelligenceService";

describe("operational intelligence event definitions", () => {
  it("assigns a stable, lead-specific event key and pipeline behavior to a real intake", () => {
    const event = newIntakeEvent({ leadId: 42, fullName: "Jordan Doe", email: "jordan@example.com", source: "turbo-intake" });
    expect(event.eventKey).toBe("intake-lead:42");
    expect(event.createPipeline).toBe(true);
    expect(event.taskTitle).toContain("Jordan Doe");
  });

  it("uses independent, stable keys for chat leads, client messages, and sync failures", () => {
    expect(newChatLeadEvent({ leadId: 7, name: "Case Lead", email: "lead@example.com" }).eventKey).toBe("chat-lead:7");
    expect(clientMessageEvent({ caseId: 3, messageId: 11 }).eventKey).toBe("case-message:11");
    expect(xaiSyncFailureEvent({ documentId: 9, error: "upstream unavailable" }).eventKey).toBe("xai-sync:9");
  });
});

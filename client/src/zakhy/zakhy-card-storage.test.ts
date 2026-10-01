import { describe, expect, it } from "vitest";
import { findDuplicateContact, makeVCard, upsertLocalContact, type ZakhyCardContact } from "./zakhy-card-storage";

const existing: ZakhyCardContact = {
  id: "local-1", name: "Ari Stone", email: "ari@example.com", phone: "404-555-0100", company: "Stone Media", title: "Founder", identityCategory: "Business Owner", interestCategories: ["Automation / AI"], interest: "Automation / AI", notes: "Met at event", source: "Zakhy Card", sourceDetail: "In Person QR", capturedAt: "2026-10-01T12:00:00.000Z", lastContact: "2026-10-01T12:00:00.000Z", nextFollowUp: "", followUpStatus: "new", eventType: "contact_created",
};
const draft = { name: "Ari Stone", email: "ARI@example.com", phone: "404-555-0100", company: "Stone Media", title: "Founder", identityCategory: "Business Owner", interestCategories: ["Automation / AI", "Collaboration"], interest: "", notes: "Updated", sourceDetail: "In Person QR" as const };

describe("Zakhy Digital Card V1", () => {
  it("matches duplicate contacts by email before phone or name/company", () => expect(findDuplicateContact([existing], draft)?.match).toBe("email"));
  it("updates a matching record without increasing contact count", () => {
    const result = upsertLocalContact([existing], draft);
    expect(result.duplicate).toBe(true);
    expect(result.contacts).toHaveLength(1);
    expect(result.contact.notes).toBe("Updated");
    expect(result.contact.interest).toBe("Automation / AI, Collaboration");
  });
  it("creates a new card contact with the requested source defaults", () => {
    const result = upsertLocalContact([], draft);
    expect(result.duplicate).toBe(false);
    expect(result.contact.source).toBe("Zakhy Card");
    expect(result.contact.sourceDetail).toBe("In Person QR");
    expect(result.contact.followUpStatus).toBe("new");
    expect(result.contact.identityCategory).toBe("Business Owner");
  });
  it("creates a phone-saveable vCard", () => {
    expect(makeVCard()).toContain("BEGIN:VCARD");
    expect(makeVCard()).toContain("EMAIL:turboresponsehq@gmail.com");
    expect(makeVCard()).toContain("END:VCARD");
  });
});

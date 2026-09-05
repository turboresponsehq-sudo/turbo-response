import { afterEach, describe, expect, it } from "vitest";
import { creatorLeadCaptureEnabled } from "./featureGate";

const originalValue = process.env.CREATOR_LEAD_CAPTURE_ENABLED;

afterEach(() => {
  if (originalValue === undefined) {
    delete process.env.CREATOR_LEAD_CAPTURE_ENABLED;
  } else {
    process.env.CREATOR_LEAD_CAPTURE_ENABLED = originalValue;
  }
});

describe("Creator Lead Capture release gate", () => {
  it("defaults closed", () => {
    delete process.env.CREATOR_LEAD_CAPTURE_ENABLED;
    expect(creatorLeadCaptureEnabled()).toBe(false);
  });

  it("opens only when explicitly set to true", () => {
    process.env.CREATOR_LEAD_CAPTURE_ENABLED = "true";
    expect(creatorLeadCaptureEnabled()).toBe(true);

    process.env.CREATOR_LEAD_CAPTURE_ENABLED = "TRUE";
    expect(creatorLeadCaptureEnabled()).toBe(false);
  });
});

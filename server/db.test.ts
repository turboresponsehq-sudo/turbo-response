import { describe, expect, it } from "vitest";
import { isActiveOperationalCase } from "./db";

describe("isActiveOperationalCase", () => {
  it("keeps active and unset legacy case statuses visible", () => {
    expect(isActiveOperationalCase({ status: "open" })).toBe(true);
    expect(isActiveOperationalCase({ status: "  " })).toBe(true);
  });

  it("excludes terminal legacy case statuses", () => {
    expect(isActiveOperationalCase({ status: "closed" })).toBe(false);
    expect(isActiveOperationalCase({ status: "Completed" })).toBe(false);
    expect(isActiveOperationalCase({ status: "archived" })).toBe(false);
  });
});

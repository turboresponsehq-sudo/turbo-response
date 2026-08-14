import { describe, expect, it } from "vitest";
import { getSafeAdminReturnPath } from "./adminLoginRedirect";

describe("getSafeAdminReturnPath", () => {
  it("returns an approved internal admin route", () => {
    expect(getSafeAdminReturnPath("?next=%2Fadmin%2Fcommand-center")).toBe("/admin/command-center");
  });

  it("rejects external and non-admin redirect targets", () => {
    expect(getSafeAdminReturnPath("?next=https%3A%2F%2Fevil.example")).toBe("/admin");
    expect(getSafeAdminReturnPath("?next=%2Fclient-portal")).toBe("/admin");
  });
});

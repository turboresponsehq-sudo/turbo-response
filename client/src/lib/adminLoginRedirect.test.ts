import { describe, expect, it } from "vitest";
import { getAdminLoginUrl, getSafeAdminReturnPath } from "./adminLoginRedirect";

describe("getSafeAdminReturnPath", () => {
  it("returns an approved internal admin route", () => {
    expect(getSafeAdminReturnPath("?next=%2Fadmin%2Fcommand-center")).toBe("/admin/command-center");
  });

  it("rejects external and non-admin redirect targets", () => {
    expect(getSafeAdminReturnPath("?next=https%3A%2F%2Fevil.example")).toBe("/admin");
    expect(getSafeAdminReturnPath("?next=%2Fclient-portal")).toBe("/admin");
  });

  it("preserves an approved admin return path in the login URL", () => {
    expect(getAdminLoginUrl("/admin/creator/leads")).toBe("/admin/login?next=%2Fadmin%2Fcreator%2Fleads");
  });

  it("falls back to the admin home for an unsafe return path", () => {
    expect(getAdminLoginUrl("https://evil.example")).toBe("/admin/login?next=%2Fadmin");
  });
});

import { describe, expect, it } from "vitest";
import { getAdminSessionAuthorizationHeader } from "./adminSession";

describe("getAdminSessionAuthorizationHeader", () => {
  it("adds the existing signed admin session as a bearer header", () => {
    const storage = { getItem: () => " signed-session " };

    expect(getAdminSessionAuthorizationHeader(storage)).toEqual({
      Authorization: "Bearer signed-session",
    });
  });

  it("does not create an authorization header when no session exists", () => {
    const storage = { getItem: () => null };

    expect(getAdminSessionAuthorizationHeader(storage)).toEqual({});
  });
});

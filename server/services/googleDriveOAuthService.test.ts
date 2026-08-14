import { afterEach, describe, expect, it } from "vitest";
import { decryptGoogleDriveRefreshToken, encryptGoogleDriveRefreshToken } from "./googleDriveOAuthService";

const originalSecret = process.env.JWT_SECRET;

afterEach(() => {
  process.env.JWT_SECRET = originalSecret;
});

describe("Google Drive OAuth refresh-token encryption", () => {
  it("round-trips a refresh token without retaining plaintext in the encrypted payload", () => {
    process.env.JWT_SECRET = "test-jwt-secret-for-drive-oauth";
    const token = "refresh-token-value";
    const encrypted = encryptGoogleDriveRefreshToken(token);
    expect(encrypted).not.toContain(token);
    expect(decryptGoogleDriveRefreshToken(encrypted)).toBe(token);
  });

  it("rejects a malformed stored payload", () => {
    process.env.JWT_SECRET = "test-jwt-secret-for-drive-oauth";
    expect(() => decryptGoogleDriveRefreshToken("invalid")).toThrow("format is invalid");
  });
});

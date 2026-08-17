import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const entrySource = readFileSync(resolve(__dirname, "index.ts"), "utf8");

describe("retired emergency admin bypass", () => {
  it("keeps the former bypass path explicitly unavailable", () => {
    expect(entrySource).toContain('app.all("/api/admin/bypass-login"');
    expect(entrySource).toContain('res.status(404).json({ message: "Not found" })');
    expect(entrySource).not.toContain("x-bypass-key");
    expect(entrySource).not.toContain("Temporary admin bypass login successful");
  });

  it("binds the legacy administrator login email instead of interpolating it into SQL", () => {
    expect(entrySource).toContain("where(eq(usersTable.email, email))");
    expect(entrySource).not.toContain("SELECT * FROM users WHERE email = '${email}'");
  });

  it("does not install a permissive default CORS preflight handler or log administrator token diagnostics", () => {
    expect(entrySource).not.toContain('app.options("*", cors())');
    expect(entrySource).not.toContain("Generating token with secret length");
    expect(entrySource).not.toContain("Token generated successfully for:");
  });

  it("does not keep development bootstrap credentials in tracked source", () => {
    expect(entrySource).toContain("DEV_BOOTSTRAP_ADMIN_EMAIL");
    expect(entrySource).toContain("DEV_BOOTSTRAP_ADMIN_PASSWORD");
    expect(entrySource).not.toContain("Turbo123!");
    expect(entrySource).not.toContain("Admin123!");
  });
});

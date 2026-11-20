import { createServer, type Server } from "node:http";
import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import legacyAuthRouter from "./auth";

describe("deprecated administrator login", () => {
  let server: Server;
  let origin: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/auth", legacyAuthRouter);
    server = createServer(app);
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => {
        server.off("error", reject);
        resolve();
      });
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Test server did not acquire a TCP port");
    }
    origin = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    if (!server?.listening) return;
    await new Promise<void>((resolve, reject) =>
      server.close((error) => error ? reject(error) : resolve()),
    );
  });

  it.each([
    { email: "owner@example.test", password: "invalid" },
    { email: "owner@example.test", password: "" },
    {},
  ])("never returns an administrator JWT from the legacy route", async (payload) => {
    const response = await fetch(`${origin}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json() as Record<string, unknown>;
    expect(response.status).toBe(410);
    expect(result).toEqual({ message: "Legacy authentication endpoint is disabled" });
    expect(result).not.toHaveProperty("token");
  });
});

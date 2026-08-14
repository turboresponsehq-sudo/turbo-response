import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { eq } from "drizzle-orm";
import type { User } from "../../drizzle/schema";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Compatibility bridge for the established owner admin session.
 *
 * The browser only sends this header when an existing `admin_session` is
 * present. The token must verify against the current Render JWT secret, then
 * resolve to the same current database user with the admin role. Claims alone
 * are never treated as authorization.
 */
async function authenticateLegacyAdminSession(
  req: CreateExpressContextOptions["req"],
): Promise<User | null> {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const jwt = await import("jsonwebtoken");
    const claims = jwt.default.verify(authorization.slice(7), secret) as {
      userId?: unknown;
      email?: unknown;
      role?: unknown;
    };

    const userId =
      typeof claims.userId === "number"
        ? claims.userId
        : typeof claims.userId === "string" && /^\d+$/.test(claims.userId)
          ? Number(claims.userId)
          : NaN;

    if (claims.role !== "admin" || !Number.isSafeInteger(userId) || userId < 1) return null;

    const db = await getDb();
    if (!db) return null;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || user.role !== "admin") return null;

    if (
      typeof claims.email === "string" &&
      user.email?.toLowerCase() !== claims.email.toLowerCase()
    ) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  if (!user) {
    user = await authenticateLegacyAdminSession(opts.req);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

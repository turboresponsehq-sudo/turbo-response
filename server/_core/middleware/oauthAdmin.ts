import type { NextFunction, Request, Response } from "express";
import type { User } from "../../../drizzle/schema";
import { sdk } from "../sdk";

export type OAuthAdminRequest = Request & { user?: User };

/**
 * REST compatibility middleware for admin-only routes that have not yet moved
 * into a tRPC router. It uses the signed Manus OAuth session and never accepts
 * browser-supplied static tokens.
 */
export async function oauthAdminMiddleware(
  req: OAuthAdminRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await sdk.authenticateRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("[OAuth Admin] Session verification failed", error);
    return res.status(401).json({ error: "Authentication required" });
  }
}

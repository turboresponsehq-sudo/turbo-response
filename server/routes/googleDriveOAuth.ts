import type { Express, Request, Response } from "express";
import { completeGoogleDriveOAuth, getGoogleDriveOAuthCallbackPath } from "../services/googleDriveOAuthService";

export function registerGoogleDriveOAuthRoutes(app: Express) {
  app.get(getGoogleDriveOAuthCallbackPath(), async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const state = typeof req.query.state === "string" ? req.query.state : null;
    const baseUrl = (process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL || "https://turboresponsehq.ai").replace(/\/$/, "");

    if (!code || !state) {
      return res.redirect(`${baseUrl}/admin/command-center?drive=oauth_missing_parameters`);
    }

    try {
      await completeGoogleDriveOAuth(code, state);
      return res.redirect(`${baseUrl}/admin/command-center?drive=oauth_connected`);
    } catch (error) {
      console.error("[GoogleDriveOAuth] Callback failed:", error instanceof Error ? error.message : "unknown_error");
      return res.redirect(`${baseUrl}/admin/command-center?drive=oauth_failed`);
    }
  });
}

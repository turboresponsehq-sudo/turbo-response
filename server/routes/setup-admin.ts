import express from "express";

const router = express.Router();

/**
 * Retired legacy setup route.
 *
 * Administrator identity and password hashes are managed through Render
 * environment variables and the approved identity workflow. This route remains
 * intentionally unavailable so it cannot become a credential-bearing fallback.
 */
router.all("/setup-admin", (_req, res) => {
  return res.status(404).json({ error: "Not found" });
});

export default router;

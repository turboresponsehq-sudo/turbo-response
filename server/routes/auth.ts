import express from "express";

const router = express.Router();

/**
 * Deprecated legacy authentication router.
 *
 * The active administrator login is implemented elsewhere. This route used to
 * issue administrator JWTs without verifying the submitted password. Keep the
 * route explicitly disabled so it cannot become an unsafe fallback if mounted
 * again by accident.
 */
router.post("/login", (_req, res) => {
  return res.status(410).json({
    message: "Legacy authentication endpoint is disabled",
  });
});

export default router;

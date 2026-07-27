/**
 * Client Portal Authentication & Case Access
 * Restored from the original backend (src/controllers/clientAuthController.js)
 *
 * Flow: client requests login with email + case ID -> 6-digit code emailed ->
 * client verifies code -> JWT issued in httpOnly cookie -> client accesses case.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { sendRawEmail } from "../services/auditEmailService";

const router = Router();

// In-memory verification codes (single-instance deployment on Render)
const verificationCodes = new Map<
  string,
  { code: string; expiresAt: number; attempts: number }
>();

function rowsOf(result: any): any[] {
  return (result as any).rows ?? (result as any) ?? [];
}

/**
 * Middleware: authenticate client via client_token httpOnly cookie
 */
export function authenticateClient(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req as any).cookies?.client_token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }
    const decoded: any = jwt.verify(token, secret);
    if (decoded.type !== "client") {
      return res.status(403).json({ success: false, message: "Invalid token type" });
    }
    (req as any).clientAuth = { caseId: decoded.caseId, email: decoded.email };
    next();
  } catch (error: any) {
    if (error?.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ success: false, message: "Invalid authentication token" });
  }
}

/**
 * POST /api/client/login
 * Step 1: email + caseId -> send 6-digit verification code
 * caseId may be the numeric id OR the case_number (TR-...)
 */
router.post("/login", async (req: Request, res: Response) => {
  const body = req.body || {};
  const email = body.email;
  const caseId = body.caseId ?? body.case_id;
  try {
    if (!email || !caseId) {
      return res
        .status(400)
        .json({ success: false, message: "Email and case ID are required" });
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const emailLower = String(email).toLowerCase().trim();
    const caseIdNorm = String(caseId).trim();

    // Try consumer cases: match case_number OR numeric id, plus email
    let result = await db.execute(sql`
      SELECT id, case_number, email, portal_enabled, 'consumer' as case_type
      FROM cases
      WHERE (
        LOWER(TRIM(case_number)) = LOWER(${caseIdNorm})
        OR CAST(id AS TEXT) = ${caseIdNorm}
      )
      AND LOWER(TRIM(email)) = ${emailLower}
    `);
    let rows = rowsOf(result);

    // Fallback: business intakes (business_name acts as case number)
    if (rows.length === 0) {
      result = await db.execute(sql`
        SELECT id, business_name as case_number, email, portal_enabled, 'business' as case_type
        FROM business_intakes
        WHERE (
          LOWER(TRIM(business_name)) = LOWER(${caseIdNorm})
          OR CAST(id AS TEXT) = ${caseIdNorm}
        )
        AND LOWER(TRIM(email)) = ${emailLower}
      `);
      rows = rowsOf(result);
    }

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No case found with that email and case ID" });
    }

    const caseData = rows[0];

    if (!caseData.portal_enabled) {
      return res.status(403).json({
        success: false,
        message: "Client portal access is disabled for this case",
      });
    }

    // Generate 6-digit code, 10-minute expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `${emailLower}-${caseIdNorm}`;
    verificationCodes.set(key, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });

    const emailSent = await sendRawEmail({
      to: email,
      subject: `Turbo Response - Verification Code for Case ${caseData.case_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00BFFF;">Turbo Response - Client Portal Access</h2>
          <p>Your verification code is:</p>
          <div style="background: #F0F2F5; color: #0284c7; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 6px;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>Case Number: <strong>${caseData.case_number}</strong></p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    });

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please contact support.",
      });
    }

    res.json({
      success: true,
      message: "Verification code sent to your email",
      caseNumber: caseData.case_number,
    });
  } catch (error: any) {
    console.error("[Client Auth] Login request error:", error?.message || error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification code. Please try again or contact support.",
    });
  }
});

/**
 * POST /api/client/verify
 * Step 2: verify 6-digit code -> issue JWT in httpOnly cookie
 */
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const email = body.email;
    const caseId = body.caseId ?? body.case_id;
    const code = body.code;
    if (!email || !caseId || !code) {
      return res.status(400).json({
        success: false,
        message: "Email, case ID, and verification code are required",
      });
    }

    const emailLower = String(email).toLowerCase().trim();
    const caseIdNorm = String(caseId).trim();
    const key = `${emailLower}-${caseIdNorm}`;
    const stored = verificationCodes.get(key);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new code.",
      });
    }
    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(key);
      return res.status(400).json({
        success: false,
        message: "Verification code expired. Please request a new code.",
      });
    }
    if (stored.attempts >= 3) {
      verificationCodes.delete(key);
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new code.",
      });
    }
    if (stored.code !== String(code).trim()) {
      stored.attempts++;
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
        attemptsRemaining: 3 - stored.attempts,
      });
    }

    verificationCodes.delete(key);

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    let result = await db.execute(sql`
      SELECT id, case_number, email, full_name, 'consumer' as case_type
      FROM cases
      WHERE (
        LOWER(TRIM(case_number)) = LOWER(${caseIdNorm})
        OR CAST(id AS TEXT) = ${caseIdNorm}
      )
      AND LOWER(TRIM(email)) = ${emailLower}
    `);
    let rows = rowsOf(result);

    if (rows.length === 0) {
      result = await db.execute(sql`
        SELECT id, business_name as case_number, email, full_name, 'business' as case_type
        FROM business_intakes
        WHERE (
          LOWER(TRIM(business_name)) = LOWER(${caseIdNorm})
          OR CAST(id AS TEXT) = ${caseIdNorm}
        )
        AND LOWER(TRIM(email)) = ${emailLower}
      `);
      rows = rowsOf(result);
    }

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    const caseData = rows[0];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    const token = jwt.sign(
      { caseId: caseData.id, email: caseData.email, type: "client" },
      secret,
      { expiresIn: "24h" }
    );

    res.cookie("client_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful",
      caseId: caseData.id,
      caseNumber: caseData.case_number,
      clientName: caseData.full_name,
    });
  } catch (error: any) {
    console.error("[Client Auth] Verification error:", error?.message || error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
});

/**
 * Shared case fetch used by both GET /case/:id and GET /case?caseId=
 */
async function fetchClientCase(caseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let result = await db.execute(sql`
    SELECT
      id, case_number, category, status, client_status, client_notes,
      payment_link, payment_verified, payment_status, funnel_stage,
      pricing_tier, pricing_tier_amount, pricing_tier_name,
      full_name, email, phone, case_details, amount, deadline, documents,
      created_at, updated_at, 'consumer' as case_type
    FROM cases
    WHERE id = ${caseId} AND portal_enabled = TRUE
  `);
  let rows = rowsOf(result);

  if (rows.length === 0) {
    result = await db.execute(sql`
      SELECT
        id, business_name as case_number, NULL as category, status,
        NULL as client_status, NULL as client_notes, NULL as payment_link,
        NULL as payment_verified, NULL as payment_status, NULL as funnel_stage,
        NULL as pricing_tier, NULL as pricing_tier_amount, NULL as pricing_tier_name,
        full_name, email, phone, NULL as case_details, NULL as amount,
        NULL as deadline, NULL as documents, created_at, updated_at,
        'business' as case_type
      FROM business_intakes
      WHERE id = ${caseId} AND portal_enabled = TRUE
    `);
    rows = rowsOf(result);
  }

  if (rows.length === 0) return null;

  const caseData = rows[0];
  const isPaid =
    caseData.payment_status === "paid" || caseData.payment_verified === true;
  caseData.access_granted = isPaid;
  caseData.access_reason = isPaid ? "payment_confirmed" : "payment_pending";
  caseData.client_name = caseData.full_name;
  return caseData;
}

/**
 * GET /api/client/case/:id — authenticated client case access
 */
router.get("/case/:id", authenticateClient, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const clientCaseId = (req as any).clientAuth.caseId;
    if (id !== clientCaseId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const caseData = await fetchClientCase(id);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found or portal access disabled",
      });
    }
    res.json({ success: true, case: caseData });
  } catch (error: any) {
    console.error("[Client Auth] Get case error:", error?.message || error);
    res.status(500).json({ success: false, message: "Failed to retrieve case data" });
  }
});

/**
 * GET /api/client/case?caseId=N — used by the contract signing page (public,
 * limited fields; matches original behavior where SignContract loads basic info)
 */
router.get("/case", async (req: Request, res: Response) => {
  try {
    const caseId = parseInt(String(req.query.caseId || ""));
    if (isNaN(caseId)) {
      return res.status(400).json({ success: false, message: "caseId is required" });
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.execute(sql`
      SELECT id, case_number, full_name, full_name as client_name, email, category,
             funnel_stage, pricing_tier_amount, pricing_tier_name
      FROM cases WHERE id = ${caseId}
    `);
    const rows = rowsOf(result);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    res.json({ success: true, case: rows[0] });
  } catch (error: any) {
    console.error("[Client] Get case (public) error:", error?.message || error);
    res.status(500).json({ success: false, message: "Failed to retrieve case data" });
  }
});

/**
 * POST /api/client/logout
 */
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("client_token");
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;

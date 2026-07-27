import { Router } from "express";
import { saveIntakeLead } from "../intakeLeadsDb";
import { notifyOwner } from "../_core/notification";
import { sendOwnerNotification } from "../services/auditEmailService";

const router = Router();

/**
 * POST /api/case-brief
 * Case Documentation Brief ($299) intake form submission.
 * Follows the exact same pattern as /api/intake (defense) and /api/intake-offense:
 *   1. Save to intake_leads via saveIntakeLead()
 *   2. Derive case number from the returned insertId (TR-CB-XXXXX)
 *   3. Notify owner via Gmail + Manus push
 */
router.post("/case-brief", async (req, res) => {
  try {
    const { fullName, email, phone, caseType, description } = req.body;

    // Validate required fields
    if (!fullName || !email || !caseType || !description) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, email, caseType, description",
      });
    }

    const preview = `[Case Brief $299] Case Type: ${caseType} | ${String(description).slice(0, 200)}`;

    // Save to intake_leads — same as defense/offense routes
    const insertId = await saveIntakeLead({
      fullName,
      email,
      phone: phone || null,
      socialHandle: null,
      situationPreview: preview,
      fullSituation: JSON.stringify({
        caseType,
        description,
        submittedAt: new Date().toISOString(),
      }),
      source: "case-brief",
      status: "new_lead",
    });

    // Derive case number from insertId — same pattern as TR-DEF-XXXXX / TR-OFF-XXXXX
    const caseNumber = `TR-CB-${String(insertId).padStart(5, "0")}`;
    const caseId = String(insertId);

    // Notify owner — email (reliable) + Manus push (best-effort)
    sendOwnerNotification(
      `📁 New Case Documentation Brief Request ($299) — ${fullName}`,
      [
        `Name: ${fullName}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : `Phone: not provided`,
        `Case Type: ${caseType}`,
        `Case #: ${caseNumber}`,
        ``,
        `Situation:`,
        String(description).slice(0, 500),
      ],
      "https://turboresponsehq.ai/admin"
    ).catch((e: any) => console.error("[CaseBrief] Owner email failed:", e.message));

    try {
      await notifyOwner({
        title: "📁 New Case Documentation Brief Request ($299)",
        content: `${fullName} (${email}${phone ? `, ${phone}` : ""})\nCase Type: ${caseType}\nCase #: ${caseNumber}\nSituation: ${String(description).slice(0, 300)}\n\nView in Admin: https://turboresponsehq.ai/admin`,
      });
    } catch (notifyErr) {
      console.warn("[CaseBrief] Manus notification failed (non-fatal):", notifyErr);
    }

    res.status(201).json({
      success: true,
      message: "Your Case Documentation Brief request has been received.",
      case_number: caseNumber,
      case_id: caseId,
    });

  } catch (error: any) {
    console.error("[CaseBrief] Error processing submission:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process case brief submission",
    });
  }
});

export default router;

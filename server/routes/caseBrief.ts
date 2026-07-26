import { Router } from "express";
import { saveIntakeLead } from "../intakeLeadsDb";
import { notifyOwner } from "../_core/notification";

const router = Router();

/**
 * POST /api/case-brief
 * Case Documentation Brief ($299) intake form submission.
 * Stores the lead in intake_leads (same pattern as business audit) and notifies owner.
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

    const situationPreview = `[Case Brief $299] Case Type: ${caseType} | ${String(description).slice(0, 200)}`;

    const leadId = await saveIntakeLead({
      fullName,
      email,
      phone: phone || null,
      socialHandle: null,
      situationPreview,
      fullSituation: JSON.stringify({
        caseType,
        description,
        submittedAt: new Date().toISOString(),
      }),
      source: "case-brief",
      status: "new_lead",
    });

    res.status(201).json({
      success: true,
      message: "Your Case Documentation Brief request has been received.",
      leadId,
    });

    // Notify owner in background
    notifyOwner({
      title: "📁 New Case Documentation Brief Request ($299)",
      content: `${fullName} (${email}${phone ? `, ${phone}` : ""})\nCase Type: ${caseType}\nSituation: ${String(description).slice(0, 300)}`,
    }).catch(() => {});
  } catch (error: any) {
    console.error("[CaseBrief] Error processing submission:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process case brief submission",
    });
  }
});

export default router;

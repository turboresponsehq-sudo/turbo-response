import { Router } from "express";
import { notifyOwner } from "../_core/notification";
import { saveIntakeLead } from "../intakeLeadsDb";
import { syncContactToHubSpot } from "../hubspotSync";
import { sendOwnerNotification } from "../services/auditEmailService";
import { createCase } from "../db";

const router = Router();

/**
 * POST /api/turbo-intake  (legacy — kept for backwards compat)
 * POST /api/intake-offense
 * Offense intake form submission — saves to database + notifies owner
 */
async function handleOffenseIntake(req: any, res: any) {
  try {
    const {
      fullName: fullNameCamel,
      full_name: fullNameSnake,
      email,
      phone,
      businessName,
      business_name,
      primaryGoal,
      primary_goal,
      estimatedAmount,
      estimated_amount,
      caseDescription,
      case_description,
      action_type,
      actionType,
      target_entity,
      targetEntity,
      what_happened,
      whatHappened,
      desired_outcome,
      desiredOutcome,
      instagramUrl,
      tiktokUrl,
      facebookUrl,
    } = req.body;

    const fullName = fullNameCamel || fullNameSnake;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, email",
      });
    }

    const handles = [instagramUrl, tiktokUrl, facebookUrl].filter(Boolean).join(", ");
    const description = caseDescription || case_description || what_happened || whatHappened || "";
    const goal = primaryGoal || primary_goal || desiredOutcome || desired_outcome || "";
    const business = businessName || business_name || targetEntity || target_entity || "";
    const amount = estimatedAmount || estimated_amount || "";
    const actionTypeVal = actionType || action_type || "";

    const preview = description
      ? description.slice(0, 500)
      : `Goal: ${goal || "N/A"} | Business: ${business || "N/A"} | Action: ${actionTypeVal || "N/A"}`;

    const insertId = await saveIntakeLead({
      fullName,
      email,
      phone: phone || null,
      socialHandle: handles || null,
      situationPreview: preview,
      fullSituation: description || null,
      source: "turbo-intake",
      status: "new_lead",
    });

    const caseNumber = `TR-OFF-${String(insertId).padStart(5, "0")}`;
    let caseId = String(insertId);

    // Keep the intake_leads record used by Command Center, and also create the
    // established cases-table record used by /admin. Without this bridge,
    // offense submissions were emailed successfully but were invisible in the
    // main admin case list.
    try {
      const result = await createCase({
        caseNumber,
        clientName: fullName,
        clientEmail: email,
        clientPhone: phone || null,
        category: "offense",
        status: "Pending Review",
        title: `Offense Case — ${business || actionTypeVal || "New submission"}`,
        caseType: "offense",
        description: [
          `Action: ${actionTypeVal || "N/A"}`,
          `Target: ${business || "N/A"}`,
          `Goal: ${goal || "N/A"}`,
          `Amount: ${amount || "N/A"}`,
          "",
          description || "No narrative provided.",
        ].join("\n"),
      });
      const rows = (result as any).rows ?? result;
      if (rows?.[0]?.id != null) caseId = String(rows[0].id);
    } catch (caseError: any) {
      // Do not discard a valid intake lead if the legacy bridge is unavailable.
      console.error("[Intake] Failed to create admin case record:", caseError?.message || caseError);
    }

    // Sync to HubSpot (non-blocking — don't fail submission if HubSpot is down)
    try {
      const nameParts = fullName.split(" ", 1);
      const firstname = nameParts[0];
      const lastname = fullName.slice(firstname.length).trim();
      await syncContactToHubSpot({
        firstname,
        lastname,
        email,
        phone: phone || undefined,
        website: handles || undefined,
        description: `[Offense Case] ${preview}`,
        hs_lead_status: "NEW",
        lifecyclestage: "lead",
      });
    } catch (hubspotErr) {
      console.warn("[Intake] HubSpot sync failed (non-fatal):", hubspotErr);
    }

    // Notify owner — email (reliable) + Manus push (best-effort)
    sendOwnerNotification(
      `🚀 New Offense Case Submitted — ${fullName}`,
      [
        `Name: ${fullName}`, `Email: ${email}`,
        `Case #: ${caseNumber}`,
        `Action: ${actionTypeVal || "N/A"}`, `Target: ${business || "N/A"}`,
        `Goal: ${goal || "N/A"}`, `Amount: ${amount || "N/A"}`,
      ]
    ).catch((e: any) => console.warn("[Intake] Owner email failed:", e.message));

    try {
      await notifyOwner({
        title: "🚀 New Offense Case Submitted",
        content: `${fullName} (${email}) submitted an offense case.\n\nCase #: ${caseNumber}\nAction: ${actionTypeVal || "N/A"}\nTarget: ${business || "N/A"}\nGoal: ${goal || "N/A"}\nAmount: ${amount || "N/A"}\n\nView in Command Center: /admin/command-center`,
      });
    } catch (notifyErr) {
      console.warn("[Intake] Owner notification failed (non-fatal):", notifyErr);
    }

    res.status(201).json({
      success: true,
      message: "Offense intake received successfully",
      case_number: caseNumber,
      case_id: caseId,
    });
  } catch (error: any) {
    console.error("[Intake] Error processing offense intake:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process offense intake",
    });
  }
}

router.post("/turbo-intake", handleOffenseIntake);
router.post("/intake-offense", handleOffenseIntake);

/**
 * POST /api/intake
 * Defense intake form submission — saves to database + notifies owner
 */
router.post("/intake", async (req, res) => {
  try {
    const {
      fullName: fullNameCamel,
      full_name: fullNameSnake,
      email,
      phone,
      category,
      deadline,
      amount,
      description,
      caseDescription,
      case_details,
      instagramHandle,
      socialHandle,
    } = req.body;

    const fullName = fullNameCamel || fullNameSnake;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, email",
      });
    }

    const situation = description || caseDescription || case_details || "";
    const preview = situation.slice(0, 500) || `Category: ${category || "N/A"} | Amount: ${amount || "N/A"}`;

    const insertId = await saveIntakeLead({
      fullName,
      email,
      phone: phone || null,
      socialHandle: socialHandle || instagramHandle || null,
      situationPreview: preview,
      fullSituation: situation || null,
      source: "intake",
      status: "new_lead",
    });

    const caseNumber = `TR-DEF-${String(insertId).padStart(5, "0")}`;
    let caseId = String(insertId);

    // Mirror the Case Brief behavior so defense intake submissions are also
    // visible in the established /admin case list.
    try {
      const result = await createCase({
        caseNumber,
        clientName: fullName,
        clientEmail: email,
        clientPhone: phone || null,
        category: category || "consumer",
        status: "Pending Review",
        title: `Defense Case — ${category || "New submission"}`,
        caseType: "defense",
        description: [
          `Category: ${category || "N/A"}`,
          `Deadline: ${deadline || "N/A"}`,
          `Amount: ${amount || "N/A"}`,
          "",
          situation || "No narrative provided.",
        ].join("\n"),
      });
      const rows = (result as any).rows ?? result;
      if (rows?.[0]?.id != null) caseId = String(rows[0].id);
    } catch (caseError: any) {
      console.error("[Intake] Failed to create admin case record:", caseError?.message || caseError);
    }

    // Sync to HubSpot (non-blocking)
    try {
      const nameParts = fullName.split(" ", 1);
      const firstname = nameParts[0];
      const lastname = fullName.slice(firstname.length).trim();
      await syncContactToHubSpot({
        firstname,
        lastname,
        email,
        phone: phone || undefined,
        website: socialHandle || instagramHandle || undefined,
        description: `[Defense Case] ${preview}`,
        hs_lead_status: "NEW",
        lifecyclestage: "lead",
      });
    } catch (hubspotErr) {
      console.warn("[Intake] HubSpot sync failed (non-fatal):", hubspotErr);
    }

    // Notify owner — email (reliable) + Manus push (best-effort)
    sendOwnerNotification(
      `🛡️ New Defense Case Submitted — ${fullName}`,
      [
        `Name: ${fullName}`, `Email: ${email}`,
        `Case #: ${caseNumber}`,
        `Category: ${category || "N/A"}`, `Deadline: ${deadline || "N/A"}`,
        `Amount: ${amount || "N/A"}`,
      ]
    ).catch((e: any) => console.warn("[Intake] Owner email failed:", e.message));

    try {
      await notifyOwner({
        title: "🛡️ New Defense Case Submitted",
        content: `${fullName} (${email}) submitted a defense case.\n\nCase #: ${caseNumber}\nCategory: ${category || "N/A"}\nDeadline: ${deadline || "N/A"}\nAmount: ${amount || "N/A"}\n\nView in Command Center: /admin/command-center`,
      });
    } catch (notifyErr) {
      console.warn("[Intake] Owner notification failed (non-fatal):", notifyErr);
    }

    res.status(201).json({
      success: true,
      message: "Defense intake received successfully",
      case_number: caseNumber,
      case_id: caseId,
    });
  } catch (error: any) {
    console.error("[Intake] Error processing defense intake:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process defense intake",
    });
  }
});

export default router;

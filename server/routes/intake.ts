import { Router } from "express";
import { notifyOwner } from "../_core/notification";
import { saveIntakeLead } from "../intakeLeadsDb";
import { syncContactToHubSpot } from "../hubspotSync";

const router = Router();

/**
 * POST /api/turbo-intake
 * Offense intake form submission — saves to database + notifies owner
 */
router.post("/turbo-intake", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      businessName,
      primaryGoal,
      estimatedAmount,
      caseDescription,
      instagramUrl,
      tiktokUrl,
      facebookUrl,
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, email",
      });
    }

    const handles = [instagramUrl, tiktokUrl, facebookUrl].filter(Boolean).join(", ");
    const preview = caseDescription
      ? caseDescription.slice(0, 500)
      : `Goal: ${primaryGoal || "N/A"} | Business: ${businessName || "N/A"}`;

    await saveIntakeLead({
      fullName,
      email,
      phone: phone || null,
      socialHandle: handles || null,
      situationPreview: preview,
      fullSituation: caseDescription || null,
      source: "turbo-intake",
      status: "new_lead",
    });

    // Sync to HubSpot
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

    await notifyOwner({
      title: "🚀 New Offense Case Submitted",
      content: `${fullName} (${email}) submitted an offense case.\n\nBusiness: ${businessName || "N/A"}\nGoal: ${primaryGoal || "N/A"}\nAmount: ${estimatedAmount || "N/A"}\n\nView in Command Center: /admin/command-center`,
    });

    res.status(201).json({
      success: true,
      message: "Offense intake received successfully",
    });
  } catch (error: any) {
    console.error("[Intake] Error processing offense intake:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process offense intake",
    });
  }
});

/**
 * POST /api/intake
 * Defense intake form submission — saves to database + notifies owner
 */
router.post("/intake", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      category,
      deadline,
      amount,
      description,
      caseDescription,
      instagramHandle,
      socialHandle,
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, email",
      });
    }

    const situation = description || caseDescription || "";
    const preview = situation.slice(0, 500) || `Category: ${category || "N/A"} | Amount: ${amount || "N/A"}`;

    await saveIntakeLead({
      fullName,
      email,
      phone: phone || null,
      socialHandle: socialHandle || instagramHandle || null,
      situationPreview: preview,
      fullSituation: situation || null,
      source: "intake",
      status: "new_lead",
    });

    // Sync to HubSpot
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

    await notifyOwner({
      title: "🛡️ New Defense Case Submitted",
      content: `${fullName} (${email}) submitted a defense case.\n\nCategory: ${category || "N/A"}\nDeadline: ${deadline || "N/A"}\nAmount: ${amount || "N/A"}\n\nView in Command Center: /admin/command-center`,
    });

    res.status(201).json({
      success: true,
      message: "Defense intake received successfully",
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

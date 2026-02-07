import { Router } from "express";
import { notifyOwner } from "../_core/notification";

const router = Router();

/**
 * POST /api/turbo-intake
 * Offense intake form submission
 * Accepts business information and sends notification to owner
 * Note: Database storage temporarily disabled - cases table not in current schema
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
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, email, phone",
      });
    }

    // Send notification to owner
    await notifyOwner({
      title: "🚀 New Offense Case Submitted",
      content: `${fullName} (${email}) submitted an offense case.\n\nBusiness: ${businessName || "N/A"}\nGoal: ${primaryGoal || "N/A"}\nAmount: ${estimatedAmount || "N/A"}\n\nView in admin dashboard: https://turboresponsehq.ai/admin/cases`,
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
 * Defense intake form submission
 * Accepts defense case information and sends notification to owner
 * Note: Database storage temporarily disabled - cases table not in current schema
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
      eligibility_profile,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, email, phone",
      });
    }

    // Send notification to owner
    const profileStatus = eligibility_profile && eligibility_profile.benefits_consent 
      ? "✅ Eligibility profile provided (benefits matching enabled)" 
      : "❌ No eligibility profile";

    await notifyOwner({
      title: "🛡️ New Defense Case Submitted",
      content: `${fullName} (${email}) submitted a defense case.\n\nCategory: ${category || "N/A"}\nDeadline: ${deadline || "N/A"}\nAmount: ${amount || "N/A"}\n\n${profileStatus}\n\nView in admin dashboard: https://turboresponsehq.ai/admin/cases`,
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

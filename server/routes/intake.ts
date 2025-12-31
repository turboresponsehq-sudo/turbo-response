import { Router } from "express";
import { getDb } from "../db";
import { cases } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";

const router = Router();

/**
 * POST /api/turbo-intake
 * Offense intake form submission
 * Saves all case details: business name, description, amount, deadline, authority, etc.
 */
router.post("/turbo-intake", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      businessName,
      entityType,
      websiteUrl,
      instagramUrl,
      tiktokUrl,
      facebookUrl,
      youtubeUrl,
      linkInBio,
      primaryGoal,
      targetAuthority,
      stage,
      deadline,
      estimatedAmount,
      caseDescription,
      documents,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, email, phone",
      });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: "Database connection failed",
      });
    }

    // Create case record with all fields
    await db.insert(cases).values({
      title: businessName || fullName,
      category: "Offense",
      caseType: "offense",
      status: "open",
      description: caseDescription,
      clientName: fullName,
      clientEmail: email,
      clientPhone: phone,
      businessName: businessName || null,
      entityType: entityType || null,
      websiteUrl: websiteUrl || null,
      instagramUrl: instagramUrl || null,
      tiktokUrl: tiktokUrl || null,
      facebookUrl: facebookUrl || null,
      youtubeUrl: youtubeUrl || null,
      linkInBio: linkInBio || null,
      primaryGoal: primaryGoal || null,
      targetAuthority: targetAuthority || null,
      stage: stage || null,
      deadline: deadline || null,
      estimatedAmount: estimatedAmount || null,
    });

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
 * Saves all case details for defense cases
 */
router.post("/intake", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      category,
      actionDetails,
      deadline,
      amount,
      description,
      documents,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, email, phone",
      });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        success: false,
        error: "Database connection failed",
      });
    }

    // Create case record with all fields
    await db.insert(cases).values({
      title: `Defense - ${category}`,
      category: category || "Defense",
      caseType: "defense",
      status: "open",
      description: description,
      clientName: fullName,
      clientEmail: email,
      clientPhone: phone,
      clientAddress: address || null,
      targetAuthority: actionDetails || null,
      deadline: deadline || null,
      estimatedAmount: amount || null,
    });

    // Send notification to owner
    await notifyOwner({
      title: "🛡️ New Defense Case Submitted",
      content: `${fullName} (${email}) submitted a defense case.\n\nCategory: ${category || "N/A"}\nDeadline: ${deadline || "N/A"}\nAmount: ${amount || "N/A"}\n\nView in admin dashboard: https://turboresponsehq.ai/admin/cases`,
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

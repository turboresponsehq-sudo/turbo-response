import { Router } from "express";
import { getDb } from "../db";
import { cases, eligibilityProfiles } from "../../drizzle/schema";
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
      eligibility_profile,
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
    const [caseResult] = await db.insert(cases).values({
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

    const caseId = caseResult.insertId;

    // If eligibility profile provided and consent given, save it
    if (eligibility_profile && eligibility_profile.benefits_consent) {
      await db.insert(eligibilityProfiles).values({
        caseId: caseId,
        userEmail: email,
        zipCode: eligibility_profile.zip_code || null,
        state: null, // Will be derived later from ZIP lookup
        county: null, // Will be derived later from ZIP lookup
        householdSize: eligibility_profile.household_size || null,
        monthlyIncomeRange: eligibility_profile.monthly_income_range || null,
        housingStatus: eligibility_profile.housing_status || null,
        employmentStatus: eligibility_profile.employment_status || null,
        specialCircumstances: eligibility_profile.special_circumstances 
          ? JSON.stringify(eligibility_profile.special_circumstances) 
          : null,
        benefitsConsent: eligibility_profile.benefits_consent ? 1 : 0,
        matchCount: 0,
      });

      console.log(`[Intake] Eligibility profile saved for case ${caseId}`);
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

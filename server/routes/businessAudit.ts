import { Router } from "express";
import { saveIntakeLead } from "../intakeLeadsDb";
import { scrapeWebsite } from "../services/websiteScraper";
import { generateBusinessAudit } from "../services/businessAuditService";
import { generateAuditReportHtml } from "../services/auditReportHtml";
import { sendBusinessAuditReport } from "../services/auditEmailService";
import { notifyOwner } from "../_core/notification";

const router = Router();

/**
 * POST /api/business-audit
 * Business Intelligence Audit form submission.
 * Saves lead immediately, then processes report async in background.
 */
router.post("/business-audit", async (req, res) => {
  try {
    const {
      fullName,
      email,
      businessName,
      websiteUrl,
      instagramUrl,
      industry,
      biggestChallenge,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !businessName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, email, businessName",
      });
    }

    // Save lead to database immediately
    const situationPreview = `[Business Audit] Industry: ${industry || "N/A"} | Challenge: ${biggestChallenge?.slice(0, 200) || "N/A"}`;
    
    const leadId = await saveIntakeLead({
      fullName,
      email,
      phone: null,
      socialHandle: instagramUrl || null,
      situationPreview,
      fullSituation: JSON.stringify({
        businessName,
        websiteUrl,
        instagramUrl,
        industry,
        biggestChallenge,
        submittedAt: new Date().toISOString(),
      }),
      source: "business-audit",
      status: "new_lead",
    });

    // Return immediately — report generation happens async
    res.status(201).json({
      success: true,
      message: "Your Business Intelligence Report is being generated. Check your inbox within 10 minutes.",
      leadId,
    });

    // ========== ASYNC BACKGROUND PROCESSING ==========
    (async () => {
      try {
        console.log(`[BusinessAudit] Starting async processing for lead ${leadId} (${businessName})`);

        // Step 1: Scrape website
        let scrapedContent = undefined;
        if (websiteUrl) {
          console.log(`[BusinessAudit] Scraping website: ${websiteUrl}`);
          scrapedContent = await scrapeWebsite(websiteUrl);
          if (scrapedContent.success) {
            console.log(`[BusinessAudit] Scrape successful — title: "${scrapedContent.title}"`);
          } else {
            console.warn(`[BusinessAudit] Scrape failed: ${scrapedContent.error}`);
          }
        }

        // Step 2: Generate report via AI
        console.log(`[BusinessAudit] Generating AI report...`);
        const report = await generateBusinessAudit({
          fullName,
          email,
          businessName,
          websiteUrl: websiteUrl || "",
          instagramUrl: instagramUrl || "",
          industry: industry || "",
          biggestChallenge: biggestChallenge || "",
          scrapedContent,
        });
        console.log(`[BusinessAudit] AI report generated successfully`);

        // Step 3: Generate branded HTML
        const htmlReport = generateAuditReportHtml(report, businessName, fullName);

        // Step 4: Email the report
        console.log(`[BusinessAudit] Sending report email to ${email}`);
        const emailSent = await sendBusinessAuditReport(email, htmlReport);

        if (emailSent) {
          console.log(`[BusinessAudit] Report emailed successfully to ${email}`);
        } else {
          console.error(`[BusinessAudit] Failed to email report to ${email}`);
        }

        // Step 5: Update database record with report content
        try {
          const { getDb } = await import("../db");
          const { intakeLeads } = await import("../../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const db = await getDb();
          if (db) {
            await db
              .update(intakeLeads)
              .set({
                adminNotes: `[Report Generated ${new Date().toISOString()}]\nEmail Sent: ${emailSent ? "YES" : "FAILED"}\n\n${report.rawMarkdown}`,
                status: "follow_up",
              })
              .where(eq(intakeLeads.id, leadId));
            console.log(`[BusinessAudit] Database record updated for lead ${leadId}`);
          }
        } catch (dbErr: any) {
          console.error(`[BusinessAudit] Failed to update DB record:`, dbErr.message);
        }

        // Step 6: Notify owner
        await notifyOwner({
          title: "📊 New Business Audit Completed",
          content: `${fullName} (${email}) — ${businessName}\nIndustry: ${industry || "N/A"}\nChallenge: ${biggestChallenge?.slice(0, 100) || "N/A"}\nReport emailed: ${emailSent ? "YES" : "FAILED"}`,
        }).catch(() => {});

      } catch (asyncErr: any) {
        console.error(`[BusinessAudit] Async processing failed for lead ${leadId}:`, asyncErr.message);
      }
    })();

  } catch (error: any) {
    console.error("[BusinessAudit] Error processing submission:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process business audit submission",
    });
  }
});

export default router;

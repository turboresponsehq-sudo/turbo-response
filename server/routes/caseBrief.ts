import { Router } from "express";
import { sql } from "drizzle-orm";
import { getDb } from "../db";
import { saveIntakeLead } from "../intakeLeadsDb";
import { notifyOwner } from "../_core/notification";
import {
  sendOwnerNotification,
  sendCaseBriefClientConfirmation,
} from "../services/auditEmailService";

const router = Router();

/**
 * POST /api/case-brief
 * Case Documentation Brief ($299) intake form submission.
 *
 * 1. Save to intake_leads (intake leads view in admin)
 * 2. Insert into cases table (main admin dashboard — same as existing 7 cases)
 * 3. Send client confirmation email ("Case Received")
 * 4. Notify owner via branded Gmail + Manus push
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

    // ── Step 1: Save to intake_leads ─────────────────────────────────────────
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

    // Derive case number from insertId — same TR-XX-XXXXX pattern as other routes
    const caseNumber = `TR-CB-${String(insertId).padStart(5, "0")}`;

    // ── Step 2: Insert into cases table (admin dashboard) ────────────────────
    let caseId: number | null = null;
    try {
      const db = await getDb();
      if (db) {
        const caseDetails =
          `Case Type: ${caseType}\n\n${description}`;

        const result = await db.execute(sql`
          INSERT INTO cases (
            case_number, full_name, email, phone,
            category, status,
            case_details, title, case_type,
            payment_status, funnel_stage, portal_enabled
          ) VALUES (
            ${caseNumber}, ${fullName}, ${email}, ${phone || null},
            ${"case-brief"}, ${"Pending Review"},
            ${caseDetails}, ${`Case Brief — ${caseType}`}, ${"case-brief"},
            ${"unpaid"}, ${"Lead Submitted"}, ${false}
          )
          RETURNING id
        `);
        const rows = (result as any).rows ?? result;
        caseId = rows?.[0]?.id ?? null;
        console.log(`[CaseBrief] Case row created: id=${caseId}, case_number=${caseNumber}`);
      }
    } catch (caseErr: any) {
      // Non-fatal — intake_lead already saved; log and continue
      console.error("[CaseBrief] Failed to insert cases row:", caseErr.message);
    }

    // Return success immediately
    res.status(201).json({
      success: true,
      message: "Your Case Documentation Brief request has been received.",
      case_number: caseNumber,
      case_id: String(caseId ?? insertId),
    });

    // ── Step 3: Client confirmation email ────────────────────────────────────
    sendCaseBriefClientConfirmation({
      toEmail: email,
      fullName,
      caseNumber,
      caseType,
    }).catch((e: any) => console.error("[CaseBrief] Client confirmation email failed:", e.message));

    // ── Step 4: Owner notification ───────────────────────────────────────────
    const adminUrl = caseId
      ? `https://turboresponsehq.ai/admin/cases/${caseId}`
      : "https://turboresponsehq.ai/admin";

    sendOwnerNotification(
      `📁 New Case Documentation Brief ($299) — ${fullName}`,
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
      adminUrl
    ).catch((e: any) => console.error("[CaseBrief] Owner email failed:", e.message));

    notifyOwner({
      title: "📁 New Case Documentation Brief ($299)",
      content: `${fullName} (${email}${phone ? `, ${phone}` : ""})\nCase Type: ${caseType}\nCase #: ${caseNumber}\nSituation: ${String(description).slice(0, 300)}\n\nView in Admin: ${adminUrl}`,
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

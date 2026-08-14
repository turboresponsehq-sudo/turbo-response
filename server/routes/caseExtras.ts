/**
 * Case Extras: messaging, contract signing, payment page, document updates.
 * Restored from the original backend (src/controllers/messagingController.js,
 * contractController.js, paymentController.js).
 * Mounted at /api/case
 */
import { Router, type Request, type Response } from "express";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { sendRawEmail } from "../services/auditEmailService";
import { recordClientMessage, resolveOperationalEvent } from "../services/operationalIntelligenceService";

const router = Router();

function rowsOf(result: any): any[] {
  return (result as any).rows ?? (result as any) ?? [];
}

/* ============================ MESSAGING ============================ */

/**
 * GET /api/case/:id/messages
 */
router.get("/:id/messages", async (req: Request, res: Response) => {
  try {
    const caseId = parseInt(req.params.id);
    if (isNaN(caseId)) {
      return res.status(400).json({ success: false, message: "Invalid case ID" });
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.execute(sql`
      SELECT id, case_id, sender, sender_name, message_text,
             file_path, file_name, file_type, created_at
      FROM case_messages
      WHERE case_id = ${caseId}
      ORDER BY created_at ASC
    `);
    res.json({ success: true, messages: rowsOf(result) });
  } catch (error: any) {
    console.error("[Messaging] Failed to get messages:", error?.message || error);
    res.status(500).json({ success: false, message: "Failed to load messages" });
  }
});

/**
 * POST /api/case/:id/messages
 * Body: { sender: 'client'|'admin', senderName, messageText, filePath, fileName, fileType }
 */
router.post("/:id/messages", async (req: Request, res: Response) => {
  try {
    const caseId = parseInt(req.params.id);
    const { sender, senderName, messageText, filePath, fileName, fileType } =
      req.body || {};

    if (isNaN(caseId)) {
      return res.status(400).json({ success: false, message: "Invalid case ID" });
    }
    if (!sender || !["client", "admin"].includes(sender)) {
      return res.status(400).json({ success: false, message: "Invalid sender type" });
    }
    if (!messageText && !filePath) {
      return res
        .status(400)
        .json({ success: false, message: "Either message text or file is required" });
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.execute(sql`
      INSERT INTO case_messages
        (case_id, sender, sender_name, message_text, file_path, file_name, file_type)
      VALUES (${caseId}, ${sender}, ${senderName || null}, ${messageText || null},
              ${filePath || null}, ${fileName || null}, ${fileType || null})
      RETURNING *
    `);
    const message = rowsOf(result)[0];

    // Admin replied -> notify client by email (non-blocking)
    if (sender === "admin") {
      (async () => {
        try {
          const caseResult = await db.execute(sql`
            SELECT case_number, full_name, email FROM cases WHERE id = ${caseId}
          `);
          const caseRows = rowsOf(caseResult);
          if (caseRows.length > 0) {
            const info = caseRows[0];
            const preview = messageText
              ? messageText.length > 150
                ? messageText.substring(0, 150) + "..."
                : messageText
              : "Your case manager sent you a file attachment";
            await sendRawEmail({
              to: info.email,
              subject: `New message on your case ${info.case_number} — Turbo Response`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color:#00BFFF;">New Message from Turbo Response</h2>
                  <p>Hi ${info.full_name || "there"},</p>
                  <p>You have a new message on your case <strong>${info.case_number}</strong>:</p>
                  <blockquote style="background:#F0F2F5;border-left:4px solid #00BFFF;padding:14px;border-radius:6px;color:#333;">${preview}</blockquote>
                  <p><a href="${process.env.FRONTEND_URL || "https://turboresponsehq.ai"}/client/login?caseId=${caseId}&email=${encodeURIComponent(info.email)}" style="color:#0284c7;font-weight:700;">Log in to your portal to reply &rarr;</a></p>
                </div>`,
            });
          }
        } catch (e: any) {
          console.error("[Messaging] Client notification failed:", e?.message);
        }
      })();
    }

    // Client sent -> bump unread count for admin
      if (sender === "client") {
      const consumer = await db.execute(sql`SELECT id FROM cases WHERE id = ${caseId}`);
      if (rowsOf(consumer).length > 0) {
        await db.execute(sql`
          UPDATE cases
          SET unread_messages_count = COALESCE(unread_messages_count, 0) + 1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${caseId}
        `);
      } else {
        await db.execute(sql`
          UPDATE business_intakes
          SET unread_messages_count = COALESCE(unread_messages_count, 0) + 1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${caseId}
          `);
        }
        try {
          await recordClientMessage({ caseId, messageId: Number(message.id), senderName });
        } catch (intelligenceError) {
          console.warn("[Messaging] Operational intelligence failed (non-fatal):", intelligenceError);
        }
      }

    res.json({ success: true, message });
  } catch (error: any) {
    console.error("[Messaging] Failed to send message:", error?.message || error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

/**
 * POST /api/case/:id/messages/mark-read
 */
router.post("/:id/messages/mark-read", async (req: Request, res: Response) => {
  try {
    const caseId = parseInt(req.params.id);
    if (isNaN(caseId)) {
      return res.status(400).json({ success: false, message: "Invalid case ID" });
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const consumer = await db.execute(sql`SELECT id FROM cases WHERE id = ${caseId}`);
    if (rowsOf(consumer).length > 0) {
      await db.execute(sql`
        UPDATE cases SET unread_messages_count = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${caseId}
      `);
    } else {
      await db.execute(sql`
        UPDATE business_intakes SET unread_messages_count = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${caseId}
      `);
    }
    const latest = await db.execute(sql`
      SELECT id FROM case_messages WHERE case_id = ${caseId} AND sender = 'client' ORDER BY created_at DESC LIMIT 1
    `);
    const latestMessage = rowsOf(latest)[0];
    if (latestMessage?.id) {
      try {
        await resolveOperationalEvent(`case-message:${Number(latestMessage.id)}`);
      } catch (intelligenceError) {
        console.warn("[Messaging] Operational intelligence resolution failed (non-fatal):", intelligenceError);
      }
    }
    res.json({ success: true, message: "Messages marked as read" });
  } catch (error: any) {
    console.error("[Messaging] Failed to mark read:", error?.message || error);
    res.status(500).json({ success: false, message: "Failed to mark messages as read" });
  }
});

/* ============================ CONTRACT ============================ */

async function ensureContractsTable(db: any) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS client_contracts (
      id SERIAL PRIMARY KEY,
      case_id INTEGER NOT NULL,
      client_email VARCHAR(320) NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      ip_address VARCHAR(64),
      agreement_text TEXT,
      signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * GET /api/case/:id/contract-status
 */
router.get("/:id/contract-status", async (req: Request, res: Response) => {
  try {
    const caseId = parseInt(req.params.id);
    if (isNaN(caseId)) {
      return res.status(400).json({ success: false, message: "Invalid case ID" });
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await ensureContractsTable(db);
    const result = await db.execute(sql`
      SELECT id, signed_at FROM client_contracts WHERE case_id = ${caseId}
      ORDER BY signed_at DESC LIMIT 1
    `);
    const rows = rowsOf(result);
    res.json({
      success: true,
      contractSigned: rows.length > 0,
      signedAt: rows[0]?.signed_at || null,
    });
  } catch (error: any) {
    console.error("[Contract] Status check failed:", error?.message || error);
    res.status(500).json({ success: false, message: "Failed to check contract status" });
  }
});

/**
 * POST /api/case/:id/sign-contract
 */
router.post("/:id/sign-contract", async (req: Request, res: Response) => {
  try {
    const caseId = parseInt(req.params.id);
    const { clientName, clientEmail, agreementText, acknowledgments } = req.body || {};

    if (!clientName || !clientEmail || !agreementText) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: clientName, clientEmail, agreementText",
      });
    }
    if (
      !acknowledgments ||
      acknowledgments.length !== 6 ||
      !acknowledgments.every(Boolean)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All 6 acknowledgments must be checked" });
    }

    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket?.remoteAddress ||
      "unknown";

    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await ensureContractsTable(db);

    const caseCheck = await db.execute(sql`SELECT id, email FROM cases WHERE id = ${caseId}`);
    if (rowsOf(caseCheck).length === 0) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    const existing = await db.execute(sql`
      SELECT id FROM client_contracts WHERE case_id = ${caseId}
    `);
    if (rowsOf(existing).length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Contract already signed for this case" });
    }

    const contractResult = await db.execute(sql`
      INSERT INTO client_contracts (case_id, client_email, client_name, ip_address, agreement_text)
      VALUES (${caseId}, ${clientEmail}, ${clientName}, ${ipAddress}, ${agreementText})
      RETURNING id, signed_at
    `);
    const contract = rowsOf(contractResult)[0];

    // Record acceptance on the case (terms columns exist on cases table)
    await db.execute(sql`
      UPDATE cases
      SET terms_accepted_at = CURRENT_TIMESTAMP,
          terms_accepted_ip = ${ipAddress},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${caseId}
    `);

    res.json({
      success: true,
      message: "Contract signed successfully",
      data: { contractId: contract.id, signedAt: contract.signed_at },
    });
  } catch (error: any) {
    console.error("[Contract] Sign failed:", error?.message || error);
    res.status(500).json({ success: false, message: "Failed to sign contract" });
  }
});

/**
 * GET /api/case/:id/contract — returns the signed agreement text (plain text download)
 */
router.get("/:id/contract", async (req: Request, res: Response) => {
  try {
    const caseId = parseInt(req.params.id);
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await ensureContractsTable(db);
    const result = await db.execute(sql`
      SELECT id, case_id, client_email, client_name, ip_address, signed_at, agreement_text
      FROM client_contracts WHERE case_id = ${caseId}
      ORDER BY signed_at DESC LIMIT 1
    `);
    const rows = rowsOf(result);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "No signed contract found" });
    }
    const c = rows[0];
    const text = `TURBO RESPONSE — SERVICE AGREEMENT\n\nCase ID: ${c.case_id}\nSigned by: ${c.client_name} <${c.client_email}>\nSigned at: ${c.signed_at}\nIP address: ${c.ip_address}\n\n${c.agreement_text}`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Contract-Case-${c.case_id}.txt"`
    );
    res.send(Buffer.from(text, "utf-8"));
  } catch (error: any) {
    console.error("[Contract] Download failed:", error?.message || error);
    res.status(500).json({ success: false, message: "Failed to download contract" });
  }
});

/* ============================ PAYMENT PAGE ============================ */

/**
 * GET /api/case/:id/payment-info — public info for the payment page
 */
router.get("/:id/payment-info", async (req: Request, res: Response) => {
  try {
    const caseId = parseInt(req.params.id);
    if (isNaN(caseId)) {
      return res.status(400).json({ success: false, message: "Invalid case ID" });
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.execute(sql`
      SELECT id, case_number, full_name, email, category, amount, funnel_stage,
             pricing_tier, pricing_tier_amount, pricing_tier_name, payment_link
      FROM cases WHERE id = ${caseId}
    `);
    const rows = rowsOf(result);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    const caseData = rows[0];
    if (caseData.funnel_stage === "Active Case") {
      return res
        .status(400)
        .json({ success: false, message: "This case has already been activated" });
    }
    res.json({ success: true, case: caseData });
  } catch (error: any) {
    console.error("[Payment] Info fetch failed:", error?.message || error);
    res.status(500).json({ success: false, message: "Failed to load payment information" });
  }
});

/**
 * POST /api/case/:id/mark-payment-pending — client clicked "I Paid"
 */
router.post("/:id/mark-payment-pending", async (req: Request, res: Response) => {
  try {
    const caseId = parseInt(req.params.id);
    const { payment_method } = req.body || {};
    if (isNaN(caseId)) {
      return res.status(400).json({ success: false, message: "Invalid case ID" });
    }
    if (!payment_method) {
      return res
        .status(400)
        .json({ success: false, message: "Payment method is required" });
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.execute(sql`
      UPDATE cases
      SET funnel_stage = 'Payment Pending',
          payment_method = ${payment_method},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${caseId}
    `);
    await db.execute(sql`
      INSERT INTO case_timeline (case_id, event_type, description, metadata)
      VALUES (${caseId}, 'payment_pending', 'Client clicked I Paid button',
              ${JSON.stringify({ payment_method })}::jsonb)
    `);
    res.json({ success: true, message: "Payment confirmation received" });
  } catch (error: any) {
    console.error("[Payment] Mark pending failed:", error?.message || error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit payment confirmation" });
  }
});

/* ============================ DOCUMENTS ============================ */

/**
 * PATCH /api/case/:id/documents — client portal updates case documents list
 */
router.patch("/:id/documents", async (req: Request, res: Response) => {
  try {
    const caseId = parseInt(req.params.id);
    const { documents } = req.body || {};
    if (isNaN(caseId)) {
      return res.status(400).json({ success: false, message: "Invalid case ID" });
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.execute(sql`
      UPDATE cases
      SET documents = ${JSON.stringify(documents ?? [])}::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${caseId}
    `);
    res.json({ success: true, message: "Documents updated" });
  } catch (error: any) {
    console.error("[Documents] Update failed:", error?.message || error);
    res.status(500).json({ success: false, message: "Failed to update documents" });
  }
});

export default router;

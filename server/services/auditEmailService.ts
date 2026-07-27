// @ts-ignore - nodemailer has no type declarations in this project
import nodemailer from "nodemailer";

const OWNER_EMAIL = "turboresponsehq@gmail.com";

let transporter: any = null;

function getTransporter(): any {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn("[AuditEmail] Email credentials not configured. Email disabled.");
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transporter;
}

/** Shared branded email wrapper — dark navy + cyan, lightning bolt header */
function brandedEmail(headerTitle: string, headerSubtitle: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#03050F;border-radius:10px 10px 0 0;padding:32px 36px;text-align:center;border-bottom:2px solid #00BFFF;">
            <div style="font-size:36px;margin-bottom:12px;">⚡</div>
            <h1 style="margin:0 0 6px;color:#00BFFF;font-size:24px;font-weight:700;letter-spacing:0.5px;">${headerTitle}</h1>
            <p style="margin:0;color:#a0b4c8;font-size:15px;">${headerSubtitle}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#0d1526;padding:32px 36px;border-left:1px solid #1a2a3a;border-right:1px solid #1a2a3a;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#03050F;border-radius:0 0 10px 10px;padding:20px 36px;text-align:center;border-top:1px solid #1a2a3a;">
            <p style="margin:0;color:#4a6070;font-size:12px;">
              Need help? Reply to this email or contact us at
              <a href="mailto:support@turboresponsehq.ai" style="color:#00BFFF;text-decoration:none;">support@turboresponsehq.ai</a>
            </p>
            <p style="margin:8px 0 0;color:#2a3a4a;font-size:11px;">Turbo Response &mdash; We use records to fight back.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Shared detail row for email tables */
function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 12px;color:#7a9ab0;font-size:13px;font-weight:600;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:8px 12px;color:#e0eaf4;font-size:14px;vertical-align:top;">${value.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
    </tr>`;
}

/**
 * Send a raw email (generic helper for restored legacy flows).
 */
export async function sendRawEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[Email] Cannot send — transporter not available.");
    return false;
  }
  try {
    await transport.sendMail({
      from: `"Turbo Response" <${process.env.EMAIL_USER}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    console.log(`[Email] Sent "${opts.subject}" to ${opts.to}`);
    return true;
  } catch (err: any) {
    console.error("[Email] Send failed:", err?.message || err);
    return false;
  }
}

/**
 * Portal Activated email — restored from the original backend
 * (src/controllers/paymentVerificationController.js).
 * Sent to the client when admin verifies payment and enables the portal.
 */
export async function sendPortalActivatedEmail(opts: {
  toEmail: string;
  caseNumber: string;
  caseId: number;
}): Promise<boolean> {
  const loginUrl = `${process.env.FRONTEND_URL || "https://turboresponsehq.ai"}/client/login?caseId=${opts.caseId}&email=${encodeURIComponent(opts.toEmail)}`;

  const body = `
    <h2 style="color:#e0eaf4;margin:0 0 12px;font-size:20px;">Your Case is Now Active</h2>
    <p style="color:#a0b4c8;line-height:1.6;margin:0 0 20px;">
      Great news! Your payment has been verified and your client portal is now active.
      You can now access your case details, documents, and updates.
    </p>

    <div style="background:#0a1220;border:2px solid #00BFFF;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:0;color:#00BFFF;font-weight:600;font-size:13px;">Case Number:</p>
      <p style="margin:5px 0 0;color:#e0eaf4;font-size:18px;font-weight:700;letter-spacing:0.5px;">${opts.caseNumber}</p>
    </div>

    <div style="text-align:center;margin:30px 0;">
      <a href="${loginUrl}" style="display:inline-block;background:#00BFFF;color:#03050F;text-decoration:none;padding:15px 40px;border-radius:8px;font-weight:700;font-size:16px;">Access Your Portal &rarr;</a>
    </div>

    <div style="background:#fef3c7;border-left:4px solid #fbbf24;border-radius:0 6px 6px 0;padding:15px;margin-top:20px;">
      <p style="margin:0;color:#78350f;font-size:14px;line-height:1.7;">
        <strong>&#128231; How to log in:</strong><br>
        1. Click the button above<br>
        2. Enter your email: <strong>${opts.toEmail}</strong><br>
        3. Enter your case ID: <strong>${opts.caseId}</strong><br>
        4. Check your email for the 6-digit verification code
      </p>
    </div>
  `;

  return sendRawEmail({
    to: opts.toEmail,
    subject: `\u{1F389} Your Turbo Response Portal is Now Active - Case ${opts.caseNumber}`,
    html: brandedEmail("Portal Activated!", "Your Case is Now Active", body),
  });
}

/**
 * Send the Business Intelligence Audit report to the lead via email.
 */
export async function sendBusinessAuditReport(
  toEmail: string,
  htmlReport: string
): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    console.error("[AuditEmail] Cannot send — transporter not available.");
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your Turbo Systems Business Intelligence Report",
    html: htmlReport,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log("[AuditEmail] Report sent successfully:", {
      messageId: info.messageId,
      to: toEmail,
    });
    return true;
  } catch (error: any) {
    console.error("[AuditEmail] Failed to send report:", {
      error: error.message,
      to: toEmail,
    });
    return false;
  }
}

/**
 * Send a "Case Received" confirmation email to the client who submitted a case-brief.
 */
export async function sendCaseBriefClientConfirmation(opts: {
  toEmail: string;
  fullName: string;
  caseNumber: string;
  caseType: string;
}): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[ClientEmail] Cannot send — transporter not available.");
    return false;
  }

  const { toEmail, fullName, caseNumber, caseType } = opts;
  const firstName = fullName.split(" ")[0];

  const bodyHtml = `
    <p style="color:#c0d4e8;font-size:16px;line-height:1.6;margin:0 0 20px;">
      Hi ${firstName.replace(/</g, "&lt;")},
    </p>
    <p style="color:#c0d4e8;font-size:15px;line-height:1.7;margin:0 0 24px;">
      We've received your Case Documentation Brief request. Our team will review your records,
      notices, and documentation and prepare your brief. You'll hear from us within <strong style="color:#00BFFF;">1–2 business days</strong>.
    </p>

    <!-- Case number box -->
    <div style="background:#03050F;border:1px solid #00BFFF;border-radius:8px;padding:20px 24px;margin:0 0 28px;text-align:center;">
      <p style="margin:0 0 6px;color:#7a9ab0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your Case Number</p>
      <p style="margin:0;color:#00BFFF;font-size:22px;font-weight:700;letter-spacing:2px;">${caseNumber}</p>
      <p style="margin:6px 0 0;color:#4a6070;font-size:12px;">Case Type: ${caseType.replace(/</g, "&lt;")}</p>
    </div>

    <!-- What happens next -->
    <div style="background:#111d2e;border-left:3px solid #00BFFF;border-radius:0 6px 6px 0;padding:18px 20px;margin:0 0 28px;">
      <p style="margin:0 0 12px;color:#00BFFF;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">What Happens Next</p>
      <p style="margin:0 0 8px;color:#a0b8cc;font-size:14px;line-height:1.6;">
        1. Our team reviews your documentation and situation.
      </p>
      <p style="margin:0 0 8px;color:#a0b8cc;font-size:14px;line-height:1.6;">
        2. We cross-reference records, notices, and timelines to identify gaps and weak spots.
      </p>
      <p style="margin:0;color:#a0b8cc;font-size:14px;line-height:1.6;">
        3. You receive your Case Documentation Brief — a clear, structured summary of your position.
      </p>
    </div>

    <p style="color:#7a9ab0;font-size:13px;line-height:1.6;margin:0;">
      Keep this email for your records. Reference your case number <strong style="color:#c0d4e8;">${caseNumber}</strong>
      in any future correspondence with us.
    </p>
  `;

  const html = brandedEmail("Case Received", "Your documentation request is in.", bodyHtml);

  try {
    const info = await transport.sendMail({
      from: `"Turbo Response" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Case Received — ${caseNumber} | Turbo Response`,
      text: `Hi ${firstName},\n\nWe've received your Case Documentation Brief request (Case #: ${caseNumber}, Type: ${caseType}).\n\nOur team will review your records and prepare your brief within 1–2 business days.\n\nKeep this email for your records.\n\nTurbo Response\nsupport@turboresponsehq.ai`,
      html,
    });
    console.log("[ClientEmail] Confirmation sent:", { messageId: info.messageId, to: toEmail });
    return true;
  } catch (error: any) {
    console.error("[ClientEmail] Failed to send confirmation:", { error: error.message, to: toEmail });
    return false;
  }
}

/**
 * Send an owner notification email to turboresponsehq@gmail.com.
 * Uses the full branded dark-navy + cyan template with a "View Case in Admin" button.
 *
 * @param subject   Email subject line
 * @param fields    Key/value pairs to display as a detail table
 * @param adminUrl  URL for the "View Case in Admin →" button (defaults to /admin)
 */
export async function sendOwnerNotification(
  subject: string,
  lines: string[],
  adminUrl?: string
): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    console.warn("[OwnerEmail] Cannot send owner notification — email credentials not configured.");
    return false;
  }

  const resolvedAdminUrl = adminUrl || "https://turboresponsehq.ai/admin";
  const textBody = lines.join("\n") + `\n\nView in Admin Dashboard: ${resolvedAdminUrl}`;

  // Parse lines into label/value pairs where possible (lines containing ": ")
  const tableRows = lines
    .filter(l => l.trim())
    .map(l => {
      const colonIdx = l.indexOf(": ");
      if (colonIdx > 0) {
        return detailRow(l.slice(0, colonIdx), l.slice(colonIdx + 2));
      }
      // Plain line (e.g. "Situation:" header or description text)
      return `<tr><td colspan="2" style="padding:8px 12px;color:#c0d4e8;font-size:14px;line-height:1.6;">${l.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td></tr>`;
    })
    .join("");

  const bodyHtml = `
    <!-- Detail table -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#03050F;border:1px solid #1a2a3a;border-radius:8px;margin-bottom:28px;overflow:hidden;">
      ${tableRows}
    </table>

    <!-- CTA button -->
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${resolvedAdminUrl}"
         style="display:inline-block;background:#00BFFF;color:#03050F;font-weight:700;
                text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;
                letter-spacing:0.3px;">
        View Case in Admin &rarr;
      </a>
    </div>
    <p style="text-align:center;margin:0;font-size:12px;">
      <a href="${resolvedAdminUrl}" style="color:#4a6070;">${resolvedAdminUrl}</a>
    </p>
  `;

  const html = brandedEmail(subject, "New lead notification", bodyHtml);

  try {
    const info = await transport.sendMail({
      from: `"Turbo Response" <${process.env.EMAIL_USER}>`,
      to: OWNER_EMAIL,
      subject,
      text: textBody,
      html,
    });
    console.log("[OwnerEmail] Notification sent:", { messageId: info.messageId, subject });
    return true;
  } catch (error: any) {
    console.error("[OwnerEmail] Failed to send notification:", { error: error.message, subject });
    return false;
  }
}

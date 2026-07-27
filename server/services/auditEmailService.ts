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
 * Send an owner notification email to turboresponsehq@gmail.com.
 * Used as a reliable fallback when the Manus notification service is unavailable
 * (e.g., on Render where the forge API is not reachable).
 *
 * @param subject  Email subject line
 * @param lines    Array of plain-text lines to include in the email body
 */
export async function sendOwnerNotification(
  subject: string,
  lines: string[]
): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    console.warn("[OwnerEmail] Cannot send owner notification — email credentials not configured.");
    return false;
  }

  const textBody = lines.join("\n");
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
      <div style="background: #03050F; color: #00BFFF; padding: 16px 24px; border-radius: 6px 6px 0 0;">
        <h2 style="margin: 0; font-size: 18px;">${subject}</h2>
      </div>
      <div style="background: #ffffff; padding: 24px; border-radius: 0 0 6px 6px; border: 1px solid #e0e0e0; border-top: none;">
        ${lines.map(l => `<p style="margin: 6px 0; color: #333; font-size: 15px;">${l.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`).join("")}
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p style="color: #888; font-size: 12px; margin: 0;">Turbo Response — Automated Lead Notification</p>
      </div>
    </div>
  `;

  try {
    const info = await transport.sendMail({
      from: `"Turbo Response" <${process.env.EMAIL_USER}>`,
      to: OWNER_EMAIL,
      subject,
      text: textBody,
      html: htmlBody,
    });
    console.log("[OwnerEmail] Notification sent:", { messageId: info.messageId, subject });
    return true;
  } catch (error: any) {
    console.error("[OwnerEmail] Failed to send notification:", { error: error.message, subject });
    return false;
  }
}

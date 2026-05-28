// @ts-ignore - nodemailer has no type declarations in this project
import nodemailer from "nodemailer";

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

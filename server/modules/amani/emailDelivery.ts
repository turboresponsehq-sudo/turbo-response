// @ts-ignore - nodemailer has no type declarations in this project
import nodemailer from "nodemailer";

export type AmaniInquiryEmail = {
  fullName: string;
  email: string;
  organization?: string;
  goal: string;
  challenge: string;
  stage: string;
  timeline: string;
  investment?: string;
  source: string;
  phone?: string;
  submittedAt: string;
  opportunityId: number;
  adminReviewUrl?: string;
  relationshipOwner: "AMANI";
  implementationOwner: "AMANI";
  nextAction: string;
};

type DeliveryStatus = "sent" | "suppressed" | "failed";

export type AmaniEmailResult = {
  status: DeliveryStatus;
  visitor: DeliveryStatus;
  internal: DeliveryStatus;
  failures: string[];
};

function enabled() {
  return process.env.AMANI_EMAIL_SENDING_ENABLED === "true";
}

function settings() {
  const values = {
    smtpUser: process.env.EMAIL_USER?.trim(),
    smtpPassword: process.env.EMAIL_PASSWORD,
    from: process.env.AMANI_EMAIL_FROM?.trim(),
    amaniRecipient: process.env.AMANI_INTERNAL_NOTIFICATION_EMAIL?.trim(),
    zakhyRecipient: process.env.ZAKHY_ADMIN_EMAIL?.trim(),
  };
  const missing = Object.entries(values).filter(([, value]) => !value).map(([key]) => key);
  return { values, missing };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] || character);
}

export async function deliverAmaniInquiryEmails(inquiry: AmaniInquiryEmail): Promise<AmaniEmailResult> {
  if (!enabled()) return { status: "suppressed", visitor: "suppressed", internal: "suppressed", failures: [] };

  const { values, missing } = settings();
  if (missing.length) {
    return {
      status: "failed",
      visitor: "failed",
      internal: "failed",
      failures: [`Missing email configuration: ${missing.join(", ")}`],
    };
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: values.smtpUser, pass: values.smtpPassword },
  });
  const failures: string[] = [];
  let visitor: DeliveryStatus = "suppressed";
  let internal: DeliveryStatus = "sent";
  const adminUrl = `${inquiry.adminReviewUrl || process.env.AMANI_ADMIN_REVIEW_URL || "https://turboresponsehq.ai/admin/creator/amani"}/${inquiry.opportunityId}`;
  const internalHtml = `<h2>Amani website inquiry</h2><dl>
    <dt>Name</dt><dd>${escapeHtml(inquiry.fullName)}</dd>
    <dt>Organization</dt><dd>${escapeHtml(inquiry.organization || "Not provided")}</dd>
    <dt>Email</dt><dd>${escapeHtml(inquiry.email)}</dd>
    <dt>Phone</dt><dd>${escapeHtml(inquiry.phone || "Not provided")}</dd>
    <dt>Opportunity type</dt><dd>${escapeHtml(inquiry.goal)}</dd>
    <dt>What they want</dt><dd>${escapeHtml(inquiry.challenge)}</dd>
    <dt>Budget</dt><dd>${escapeHtml(inquiry.investment || "Not provided")}</dd>
    <dt>Timeline</dt><dd>${escapeHtml(inquiry.timeline)}</dd>
    <dt>Source</dt><dd>${escapeHtml(inquiry.source)}</dd>
    <dt>Date submitted</dt><dd>${escapeHtml(inquiry.submittedAt)}</dd>
    <dt>Relationship owner</dt><dd>${inquiry.relationshipOwner}</dd>
    <dt>Recommended implementation owner</dt><dd>${inquiry.implementationOwner}</dd>
    <dt>Next action</dt><dd>${escapeHtml(inquiry.nextAction)}</dd>
    <dt>Review record</dt><dd><a href="${escapeHtml(adminUrl)}">Open protected Amani review</a></dd>
  </dl>`;

  const recipients = [values.amaniRecipient, values.zakhyRecipient].filter(
    (recipient, index, all): recipient is string => Boolean(recipient) && all.indexOf(recipient) === index,
  );
  internal = "sent";
  for (const recipient of recipients) {
    try {
      await transport.sendMail({
        from: `Amani N. Mansur <${values.from}>`,
        to: recipient,
        subject: `New Amani inquiry — ${inquiry.fullName}`,
        html: internalHtml,
      });
    } catch (error) {
      internal = "failed";
      failures.push(`${recipient}: ${error instanceof Error ? error.message.slice(0, 300) : "Internal notification delivery failed"}`);
    }
  }

  return { status: failures.length ? "failed" : "sent", visitor, internal, failures };
}

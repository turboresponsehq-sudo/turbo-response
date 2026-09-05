type CreatorLeadEmailData = {
  fullName: string;
  brandName?: string | null;
  creatorType: string;
  projectPriority: string;
  budgetRange?: string | null;
  packageInterest?: string | null;
  leadId: number;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[character] ?? character));
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#101522;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px;background:#f4f6fb;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #dce4f3;border-radius:16px;overflow:hidden;">
          <tr><td style="padding:28px 34px;background:#071a42;color:#fff;">
            <div style="font-size:13px;font-weight:800;letter-spacing:2px;color:#6da6ff;">ZAKHY BUILDS AI</div>
            <h1 style="font-size:26px;line-height:1.15;margin:12px 0 0;color:#fff;">${escapeHtml(title)}</h1>
          </td></tr>
          <tr><td style="padding:32px 34px;">${body}</td></tr>
          <tr><td style="padding:20px 34px;background:#f7f9fd;border-top:1px solid #dce4f3;color:#60708c;font-size:12px;line-height:1.55;">
            Zakhy Builds AI · Creator websites, systems, and automation.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function buildCreatorLeadConfirmationEmail(lead: CreatorLeadEmailData) {
  const name = escapeHtml(firstName(lead.fullName));
  return {
    subject: "We received your Creator Project request | Zakhy Builds AI",
    html: layout("Your project request is in", `
      <p style="font-size:16px;line-height:1.65;margin:0 0 16px;">Hi ${name},</p>
      <p style="font-size:16px;line-height:1.65;margin:0 0 16px;">Thanks for telling us about your creator business. We received your project request and will review your goals, opportunities, and current systems.</p>
      <p style="font-size:16px;line-height:1.65;margin:0;">If there is a strong fit, a member of the Zakhy Builds AI team will follow up with the clearest next step.</p>
    `),
  };
}

export function buildCreatorLeadOwnerEmail(lead: CreatorLeadEmailData, adminUrl: string) {
  const details: Array<[string, string]> = [
    ["Creator", lead.fullName],
    ["Brand", lead.brandName || "Not provided"],
    ["Type", lead.creatorType],
    ["Package", lead.packageInterest || "Not sure yet"],
    ["Budget", lead.budgetRange || "Not provided"],
    ["Priority", lead.projectPriority],
  ];
  const rows = details.map(([label, value]) => `
    <tr><td style="padding:9px 0;color:#62718c;font-size:13px;font-weight:700;width:105px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:9px 0;color:#101522;font-size:14px;line-height:1.45;">${escapeHtml(value)}</td></tr>`).join("");

  return {
    subject: `New Creator Lead — ${lead.brandName || lead.fullName}`,
    html: layout("New creator lead", `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>
      <div style="margin-top:24px;"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#1155d9;color:#fff;padding:13px 18px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Review Creator Lead →</a></div>
    `),
  };
}

/**
 * Explicit V1 safety gate. Templates are built and covered by tests, but the
 * creator module cannot send mail until a future approved configuration phase.
 */
export function creatorEmailSendingEnabled(): false {
  return false;
}

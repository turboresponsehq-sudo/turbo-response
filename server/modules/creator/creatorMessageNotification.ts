import { sendRawEmail } from "../../services/auditEmailService";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character] || character));
}

/** Best-effort notification: never roll back a saved client message if mail fails. */
export async function workspaceEmailNotice(portal: any, text: string): Promise<boolean> {
  const to = process.env.CREATOR_PORTAL_NOTIFY_EMAIL ||
    process.env.ZAKHY_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "turboresponsehq@gmail.com";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return false;
  const name = escapeHtml(String(portal.brand_name || portal.full_name || "Creator client"));
  const message = escapeHtml(text).replace(/\n/g, "<br>");
  try {
    return await sendRawEmail({
      to,
      fromName: "Creator Automations",
      subject: "New client portal message - " + String(portal.brand_name || portal.full_name || "Creator").slice(0, 100).replace(/[\r\n]/g, " "),
      html: `<h2>New message from ${name}</h2><div style="white-space:pre-wrap">${message}</div>
        <p><a href="https://turboresponsehq.ai/admin/creator/leads?lead=${Number(portal.creator_lead_id)}">Open this client's project conversation</a></p>`,
    });
  } catch (err) {
    console.error("[Creator workspace] Message email notification failed", err);
    return false;
  }
}

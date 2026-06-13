import type { BusinessAuditReport } from "./businessAuditService";

/**
 * Convert a BusinessAuditReport into branded HTML email.
 * Premium executive styling with Turbo Systems branding.
 */
export function generateAuditReportHtml(
  report: BusinessAuditReport,
  businessName: string,
  ownerName: string
): string {
  const bulletList = (items: string[]) =>
    items.map((item) => `<li style="margin-bottom: 8px; line-height: 1.6;">${item}</li>`).join("");

  const numberedList = (items: string[]) =>
    items
      .map(
        (item, i) =>
          `<li style="margin-bottom: 10px; line-height: 1.6;"><strong>${i + 1}.</strong> ${item}</li>`
      )
      .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Business Intelligence Report - ${businessName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4285F4 0%, #1a56db 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">TURBO SYSTEMS</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Business Intelligence Report</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 36px 40px 20px;">
              <p style="margin: 0; color: #1e293b; font-size: 16px; line-height: 1.6;">
                ${ownerName},
              </p>
              <p style="margin: 12px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Below is your complimentary Business Intelligence Audit for <strong>${businessName}</strong>. This report identifies key opportunities for growth, efficiency, and revenue acceleration.
              </p>
            </td>
          </tr>

          <!-- Executive Summary -->
          <tr>
            <td style="padding: 10px 40px 20px;">
              <div style="background-color: #eff6ff; border-left: 4px solid #4285F4; padding: 20px 24px; border-radius: 0 8px 8px 0;">
                <h2 style="margin: 0 0 10px; color: #1e40af; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Executive Summary</h2>
                <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.7;">${report.executiveSummary}</p>
              </div>
            </td>
          </tr>

          <!-- Operational Gaps -->
          <tr>
            <td style="padding: 10px 40px 20px;">
              <h2 style="margin: 0 0 12px; color: #1e293b; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Key Operational Gaps</h2>
              <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px;">
                ${bulletList(report.operationalGaps)}
              </ul>
            </td>
          </tr>

          <!-- Customer Acquisition -->
          <tr>
            <td style="padding: 10px 40px 20px;">
              <h2 style="margin: 0 0 12px; color: #1e293b; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Customer Acquisition Observations</h2>
              <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px;">
                ${bulletList(report.customerAcquisition)}
              </ul>
            </td>
          </tr>

          <!-- Automation Opportunities -->
          <tr>
            <td style="padding: 10px 40px 20px;">
              <h2 style="margin: 0 0 12px; color: #1e293b; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Automation Opportunities</h2>
              <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px;">
                ${bulletList(report.automationOpportunities)}
              </ul>
            </td>
          </tr>

          <!-- Revenue Opportunities -->
          <tr>
            <td style="padding: 10px 40px 20px;">
              <h2 style="margin: 0 0 12px; color: #1e293b; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Revenue Opportunity Areas</h2>
              <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px;">
                ${bulletList(report.revenueOpportunities)}
              </ul>
            </td>
          </tr>

          <!-- Recommended Next Steps -->
          <tr>
            <td style="padding: 10px 40px 20px;">
              <h2 style="margin: 0 0 12px; color: #1e293b; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Recommended Next Steps</h2>
              <ol style="margin: 0; padding-left: 0; list-style: none; color: #334155; font-size: 14px;">
                ${numberedList(report.recommendedNextSteps)}
              </ol>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 30px 40px;">
              <div style="background: linear-gradient(135deg, #4285F4 0%, #1a56db 100%); border-radius: 10px; padding: 30px; text-align: center;">
                <h3 style="margin: 0 0 10px; color: #ffffff; font-size: 18px;">Ready to discuss these findings?</h3>
                <p style="margin: 0 0 20px; color: rgba(255,255,255,0.9); font-size: 14px;">Reply to this email or visit us online to schedule a strategy session.</p>
                <a href="https://turboresponsehq.ai" style="display: inline-block; padding: 14px 32px; background-color: #ffffff; color: #1a56db; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">Visit turboresponsehq.ai</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 30px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.6;">
                Prepared by <strong>Turbo Systems</strong> — AI-Powered Business Intelligence<br>
                This report was generated using proprietary analysis tools and publicly available information.<br>
                &copy; ${new Date().getFullYear()} Turbo Systems. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

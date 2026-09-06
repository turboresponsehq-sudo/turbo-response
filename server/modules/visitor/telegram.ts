export type VisitorAlertType =
  | "new_visitor"
  | "dwell_threshold"
  | "high_value_page"
  | "returning_visitor"
  | "inquiry_started"
  | "inquiry_submitted";

export type VisitorAlert = {
  type: VisitorAlertType;
  page: string;
  source?: string | null;
  device: string;
  secondsOnSite: number;
  returning: boolean;
  leadId?: number;
};

const HIGH_VALUE_ROUTES = new Set([
  "/zakhybuildsai/services",
  "/zakhybuildsai/automation-services",
  "/zakhybuildsai/portfolio",
  "/creator/start",
]);

export function isTelegramAlertsEnabled() {
  return process.env.ZAKHY_TELEGRAM_ALERTS_ENABLED === "true";
}

export function shouldAlertForRoute(route: string) {
  return HIGH_VALUE_ROUTES.has(route) || route.startsWith("/zakhybuildsai/portfolio/");
}

export function formatVisitorAlert(alert: VisitorAlert, dashboardUrl?: string) {
  const lines = [
    "🔵 LIVE VISITOR — ZAKHY",
    `Page: ${alert.page}`,
    `Source: ${alert.source || "Direct / unknown"}`,
    `Device: ${alert.device}`,
    `Time on site: ${Math.floor(alert.secondsOnSite / 60)}m ${alert.secondsOnSite % 60}s`,
    `Returning: ${alert.returning ? "Yes" : "No"}`,
  ];
  if (alert.leadId) lines.push(`Lead: #${alert.leadId}`);
  if (dashboardUrl) lines.push(`Dashboard: ${dashboardUrl}`);
  return lines.join("\n");
}

export async function sendTelegramVisitorAlert(alert: VisitorAlert) {
  if (!isTelegramAlertsEnabled()) {
    return { sent: false as const, suppressed: true as const, reason: "disabled" };
  }
  const token = process.env.ZAKHY_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ZAKHY_TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[Zakhy visitor] Telegram enabled but server configuration is incomplete");
    return { sent: false as const, suppressed: true as const, reason: "configuration" };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatVisitorAlert(alert, process.env.ZAKHY_LIVE_VISITORS_URL),
      disable_web_page_preview: true,
    }),
  });
  if (!response.ok) throw new Error(`Telegram alert failed with status ${response.status}`);
  return { sent: true as const, suppressed: false as const };
}

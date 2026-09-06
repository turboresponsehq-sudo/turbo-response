import { describe, expect, it } from "vitest";
import { formatVisitorAlert, isTelegramAlertsEnabled, shouldAlertForRoute } from "./telegram";

describe("Zakhy visitor Telegram adapter", () => {
  it("is disabled unless explicitly enabled", () => {
    delete process.env.ZAKHY_TELEGRAM_ALERTS_ENABLED;
    expect(isTelegramAlertsEnabled()).toBe(false);
  });

  it("formats the approved concise visitor alert", () => {
    const text = formatVisitorAlert({ type: "high_value_page", page: "Ralo Portfolio", source: "Instagram", device: "Mobile", secondsOnSite: 84, returning: true });
    expect(text).toContain("LIVE VISITOR — ZAKHY");
    expect(text).toContain("Page: Ralo Portfolio");
    expect(text).toContain("Time on site: 1m 24s");
    expect(text).toContain("Returning: Yes");
  });

  it("marks only approved high-value routes for route-level alert consideration", () => {
    expect(shouldAlertForRoute("/zakhybuildsai/portfolio/ralo")).toBe(true);
    expect(shouldAlertForRoute("/zakhybuildsai/about")).toBe(false);
  });
});

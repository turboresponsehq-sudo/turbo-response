import { useEffect } from "react";

const VISITOR_KEY = "zakhy_visitor_token";
const SESSION_KEY = "zakhy_session_token";
const HIGH_VALUE = new Set(["/zakhybuildsai/services", "/zakhybuildsai/automation-services", "/zakhybuildsai/portfolio", "/creator/start"]);

function token(prefix: string) {
  const value = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${value.replace(/-/g, "")}`;
}

function getTokens() {
  const previousVisitor = window.localStorage.getItem(VISITOR_KEY);
  const visitorToken = previousVisitor || token("visitor");
  const sessionToken = window.sessionStorage.getItem(SESSION_KEY) || token("session");
  window.localStorage.setItem(VISITOR_KEY, visitorToken);
  window.sessionStorage.setItem(SESSION_KEY, sessionToken);
  return { visitorToken, sessionToken, returning: Boolean(previousVisitor) };
}

function deviceType() {
  if (/Tablet|iPad/i.test(navigator.userAgent)) return "tablet";
  if (/Mobile|Android|iPhone/i.test(navigator.userAgent)) return "mobile";
  return "desktop";
}

function sourceValues() {
  const params = new URLSearchParams(window.location.search);
  return { source: params.get("source") || params.get("utm_source") || null, utmSource: params.get("utm_source"), utmMedium: params.get("utm_medium"), utmCampaign: params.get("utm_campaign") };
}

export default function ZakhyVisitorTracker() {
  useEffect(() => {
    const { visitorToken, sessionToken, returning } = getTokens();
    const startedAt = Date.now();
    const route = window.location.pathname;
    const source = sourceValues();
    const base = { visitorToken, sessionToken, route, deviceType: deviceType(), returning, ...source };
    let cancelled = false;

    const post = (path: string, body: Record<string, unknown>, keepalive = false) => {
      if (cancelled) return;
      void fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive }).catch(() => undefined);
    };

    post("/api/zakhy/visitor/session", { ...base, referrer: document.referrer || null });
    post("/api/zakhy/visitor/event", { ...base, eventType: "page_view", secondsOnSite: 0 });
    if (HIGH_VALUE.has(route) || route.startsWith("/zakhybuildsai/portfolio/")) {
      post("/api/zakhy/visitor/event", { ...base, eventType: "high_value_page", secondsOnSite: 0 });
    }
    if (returning) post("/api/zakhy/visitor/event", { ...base, eventType: "returning_visitor", secondsOnSite: 0 });

    const heartbeat = window.setInterval(() => {
      const secondsOnSite = Math.floor((Date.now() - startedAt) / 1000);
      post("/api/zakhy/visitor/heartbeat", { sessionToken, route });
      if (secondsOnSite >= 45 && secondsOnSite < 75) {
        post("/api/zakhy/visitor/event", { ...base, eventType: "dwell_threshold", secondsOnSite });
      }
    }, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(heartbeat);
    };
  }, []);

  return null;
}

export function getZakhyVisitorSessionToken() {
  return typeof window === "undefined" ? null : window.sessionStorage.getItem(SESSION_KEY);
}

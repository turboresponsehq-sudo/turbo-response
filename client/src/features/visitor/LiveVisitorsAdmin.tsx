import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { getAdminLoginUrl } from "@/lib/adminLoginRedirect";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import "./live-visitors.css";

type Session = { id: number; currentRoute: string; entryRoute: string; source: string | null; utmSource: string | null; deviceType: string; returning: boolean; startedAt: string; lastSeenAt: string; creatorLeadId: number | null };
type Event = { id: number; sessionId: number; eventType: string; route: string; metadata: Record<string, unknown>; createdAt: string };

function elapsed(startedAt: string) { return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)); }
function formatSeconds(value: number) { return `${Math.floor(value / 60)}m ${String(value % 60).padStart(2, "0")}s`; }

export default function LiveVisitorsAdmin({ preview = false }: { preview?: boolean }) {
  const [, setLocation] = useLocation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const load = async () => {
    if (preview) {
      setSessions([{ id: 101, currentRoute: "/zakhybuildsai/portfolio/ralo", entryRoute: "/zakhybuildsai", source: "Instagram", utmSource: "instagram", deviceType: "mobile", returning: true, startedAt: new Date(Date.now() - 84_000).toISOString(), lastSeenAt: new Date().toISOString(), creatorLeadId: null }]);
      setEvents([{ id: 201, sessionId: 101, eventType: "high_value_page", route: "/zakhybuildsai/portfolio/ralo", metadata: {}, createdAt: new Date(Date.now() - 22_000).toISOString() }, { id: 202, sessionId: 101, eventType: "dwell_threshold", route: "/zakhybuildsai/portfolio/ralo", metadata: {}, createdAt: new Date(Date.now() - 10_000).toISOString() }]);
      return;
    }
    setError("");
    const response = await fetch("/api/zakhy/admin/live-visitors", { headers: { "Content-Type": "application/json", ...getAdminSessionAuthorizationHeader() } });
    if (response.status === 401 || response.status === 403) return setLocation(getAdminLoginUrl("/admin/zakhy/live-visitors"));
    const body = await response.json();
    if (!response.ok) return setError(body.error || "Unable to load Live Visitors.");
    setSessions(body.sessions || []); setEvents(body.events || []);
  };
  useEffect(() => { void load(); const refresh = window.setInterval(() => { setNow(Date.now()); void load(); }, 30_000); return () => window.clearInterval(refresh); }, []);

  return <main className="live-visitors-shell">
    <header className="live-visitors-header"><div><p className="live-visitors-eyebrow">ZAKHY BUILDS AI · INTERNAL</p><h1>Live Visitors</h1><p>Anonymous first-party visitor visibility. Active status is approximate and based on the last 90 seconds.</p></div><Link href="/admin" className="live-visitors-back">← Admin home</Link></header>
    {error && <p className="live-visitors-error">{error}</p>}
    <section className="live-visitors-summary"><div><strong>{sessions.length}</strong><span>active sessions</span></div><div><strong>{events.length}</strong><span>recent events</span></div><div><strong>OFF</strong><span>Telegram alerts</span></div></section>
    <section className="live-visitors-card"><div className="live-visitors-card-head"><h2>Active now</h2><button onClick={() => void load()}>Refresh</button></div>
      {sessions.length === 0 ? <p className="live-visitors-empty">No active anonymous visitors in the last 90 seconds.</p> : <div className="live-visitors-grid">{sessions.map((session) => <article className="live-visitor-row" key={session.id}><div><strong>{session.currentRoute}</strong><span>{session.deviceType} · {session.returning ? "Returning" : "New"}{session.source ? ` · ${session.source}` : ""}</span></div><div><strong>{formatSeconds(Math.floor((now - new Date(session.startedAt).getTime()) / 1000))}</strong><span>last seen {new Date(session.lastSeenAt).toLocaleTimeString()}</span></div>{session.creatorLeadId && <small>Connected lead #{session.creatorLeadId}</small>}</article>)}</div>}
    </section>
    <section className="live-visitors-card"><div className="live-visitors-card-head"><h2>Recent engagement</h2><span>Internal preview</span></div><div className="live-events">{events.slice(0, 20).map((event) => <p key={event.id}><strong>{event.eventType.replaceAll("_", " ")}</strong><span>{event.route}</span><time>{new Date(event.createdAt).toLocaleTimeString()}</time></p>)}</div></section>
  </main>;
}

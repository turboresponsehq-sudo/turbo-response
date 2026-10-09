import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { getAdminLoginUrl } from "@/lib/adminLoginRedirect";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import "../styles/creator.css";

type Opportunity = {
  id: number;
  relationship_id: number;
  full_name: string;
  organization: string | null;
  email: string;
  opportunity_type: string;
  what_they_are_building: string;
  operating_stage: string;
  timeline: string;
  budget_range: string | null;
  source: string;
  status: string;
  created_at: string;
  is_internal_test: boolean;
};

type AmaniRecord = Opportunity & Record<string, unknown>;
type AmaniEvent = { id: number; opportunity_id: number; event_type: string; actor: string; payload: unknown; created_at: string };

const text = (value: unknown, fallback = "Not provided") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

const date = (value: unknown) => value ? new Date(String(value)).toLocaleString() : "Not provided";

function JsonValue({ value }: { value: unknown }) {
  if (!value || (typeof value === "object" && Object.keys(value as object).length === 0)) return <span>Not provided</span>;
  return <code className="amani-json">{typeof value === "string" ? value : JSON.stringify(value)}</code>;
}

export default function AmaniReviewAdmin() {
  const [, setLocation] = useLocation();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selected, setSelected] = useState<AmaniRecord | null>(null);
  const [events, setEvents] = useState<AmaniEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const request = (path: string) => fetch(path, {
    headers: { "Content-Type": "application/json", ...getAdminSessionAuthorizationHeader() },
  });

  async function loadList() {
    setLoading(true);
    setError("");
    try {
      const response = await request("/api/creator/admin/amani");
      if (response.status === 401 || response.status === 403) {
        setLocation(getAdminLoginUrl("/admin/creator/amani"));
        return;
      }
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load Amani opportunities.");
      setOpportunities(body.opportunities || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Amani opportunities.");
    } finally {
      setLoading(false);
    }
  }

  async function selectOpportunity(id: number) {
    setError("");
    try {
      const response = await request(`/api/creator/admin/amani/${id}`);
      if (response.status === 401 || response.status === 403) {
        setLocation(getAdminLoginUrl("/admin/creator/amani"));
        return;
      }
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load Amani opportunity.");
      setSelected(body.opportunity);
      setEvents(body.events || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Amani opportunity.");
    }
  }

  useEffect(() => { loadList(); }, []);

  return <main className="creator-admin-shell amani-admin-shell">
    <header className="creator-admin-header">
      <div><p className="creator-eyebrow">ZAKHY BUILDS AI · AMANI</p><h1>Amani Opportunities</h1></div>
      <Link href="/admin" className="creator-back">← Admin home</Link>
    </header>
    {error && <p className="creator-form-error">{error}</p>}
    <section className="creator-admin-layout amani-admin-layout">
      <div className="creator-admin-list">
        <div className="creator-admin-list-head"><span>{loading ? "Loading" : `${opportunities.length} opportunity${opportunities.length === 1 ? "" : "ies"}`}</span><button onClick={loadList}>Refresh</button></div>
        {loading ? <p className="creator-empty">Loading Amani opportunities…</p> : opportunities.length === 0 ? <p className="creator-empty">No Amani opportunities have been captured.</p> : opportunities.map((item) => <button className={`creator-lead-row ${selected?.id === item.id ? "is-selected" : ""}`} onClick={() => selectOpportunity(item.id)} key={item.id}>
          <div><strong>{item.organization || item.full_name}{item.is_internal_test ? " · TEST / INTERNAL" : ""}</strong><span>{item.full_name} · {item.opportunity_type}</span><span>{item.email}</span></div><span className={`creator-status ${item.status}`}>{item.status}</span>
        </button>)}
      </div>
      <aside className="creator-lead-detail">
        {!selected ? <div className="creator-empty"><p>Select an Amani opportunity to review its relationship, source, ownership, and event history.</p></div> : <>
          <div className="creator-detail-head"><div><p className="creator-eyebrow">AMANI OPPORTUNITY #{selected.id}</p><h2>{text(selected.organization, selected.full_name)}</h2><p>{text(selected.full_name)} · {text(selected.email)}</p></div><span className="creator-status new">{text(selected.status)}</span></div>
          <div className="creator-detail-grid amani-detail-grid">
            <article><span>Goal</span><strong>{text(selected.opportunity_type)}</strong></article><article><span>Stage</span><strong>{text(selected.operating_stage)}</strong></article>
            <article><span>Timeline</span><strong>{text(selected.timeline)}</strong></article><article><span>Budget</span><strong>{text(selected.budget_range)}</strong></article>
            <article><span>Source</span><strong>{text(selected.source)}</strong></article><article><span>Submitted</span><strong>{date(selected.created_at)}</strong></article>
          </div>
          <section className="creator-detail-section"><h3>Relationship</h3><div className="amani-detail-list"><p><b>Email</b>{text(selected.email)}</p><p><b>Phone</b>{text(selected.phone)}</p><p><b>Organization</b>{text(selected.organization)}</p><p><b>Role / city</b>{text(selected.contact_role)} · {text(selected.city)}</p><p><b>Brand / social</b>{text(selected.brand_or_social)}</p><p><b>Relationship type</b>{text(selected.relationship_type)}</p><p><b>Relationship strength</b>{text(selected.relationship_strength)}</p></div></section>
          <section className="creator-detail-section"><h3>Opportunity details</h3><p><b>What they are building</b><br />{text(selected.what_they_are_building)}</p><p><b>Primary challenge</b><br />{text(selected.primary_challenge)}</p><p><b>Business pathway</b><br />{text(selected.business_pathway)}</p><p><b>Notes</b><br />{text(selected.notes)}</p></section>
          <section className="creator-detail-section"><h3>Source and UTM</h3><p><b>Landing page</b><br />{text(selected.landing_page || selected.relationship_landing_page)}</p><p><b>Source path</b><br />{text(selected.source_path)}</p><p><b>UTM</b><br /><JsonValue value={selected.utm_data || selected.relationship_utm_data} /></p><p><b>Referrer</b><br />{text(selected.referrer)}</p></section>
          <section className="creator-detail-section"><h3>Ownership and handoff</h3><div className="amani-detail-list"><p><b>Opportunity owner</b>{text(selected.opportunity_owner)}</p><p><b>Relationship owner</b>{text(selected.relationship_owner)}</p><p><b>Implementation owner</b>{text(selected.implementation_owner)}</p><p><b>Handoff destination</b>{text(selected.handoff_destination)}</p><p><b>Next action</b>{text(selected.next_action || selected.relationship_next_action)}</p></div></section>
          <section className="creator-detail-section"><h3>Event history</h3><div className="creator-mini-list">{events.length ? events.map((event) => <p key={event.id}><b>{event.event_type}</b> · {event.actor} · {date(event.created_at)}<br /><JsonValue value={event.payload} /></p>) : <p>No events recorded.</p>}</div></section>
        </>}
      </aside>
    </section>
  </main>;
}

import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { getAdminLoginUrl } from "@/lib/adminLoginRedirect";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import "../styles/creator.css";

type Status = "new" | "reviewing" | "follow_up" | "converted" | "closed";
type Lead = {
  id: number; fullName: string; brandName: string | null; email: string; creatorType: string;
  packageInterest: string | null; budgetRange: string | null; status: Status; isInternalTest: boolean; submittedAt: string; nextAction: string | null; openTaskDueAt: string | null;
};
type LeadDetail = Lead & { goals?: string; challenges?: string; project_priority?: string; final_question?: string; notes: Array<{ id: number; note: string; created_at: string }>; tasks: Array<{ id: number; task_type: string; task_detail: string | null; due_at: string | null; status: string }>; events: Array<{ id: number; event_type: string; actor: string; created_at: string }> };

const statuses: Status[] = ["new", "reviewing", "follow_up", "converted", "closed"];
const label = (status: string) => status.replace("_", " ");

export default function CreatorLeadsAdmin() {
  const [, setLocation] = useLocation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [task, setTask] = useState("");
  const [saving, setSaving] = useState(false);
  const [includeInternalTests, setIncludeInternalTests] = useState(false);

  const request = (path: string, init?: RequestInit) => fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...getAdminSessionAuthorizationHeader(), ...(init?.headers || {}) },
  });

  async function loadLeads() {
    setLoading(true); setError("");
    try {
      const response = await request(`/api/creator/admin/leads${includeInternalTests ? "?includeInternalTests=true" : ""}`);
      if (response.status === 401 || response.status === 403) { setLocation(getAdminLoginUrl("/admin/creator/leads")); return; }
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load Creator Leads.");
      setLeads(body.leads || []);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load Creator Leads."); }
    finally { setLoading(false); }
  }

  async function selectLead(id: number) {
    try {
      const response = await request(`/api/creator/admin/leads/${id}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load lead details.");
      setSelected(body.lead);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load lead details."); }
  }

  async function updateStatus(status: Status) {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await request(`/api/creator/admin/leads/${selected.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Status update failed.");
      setSelected((current) => current ? { ...current, status } : current);
      setLeads((current) => current.map((lead) => lead.id === selected.id ? { ...lead, status } : lead));
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Status update failed."); }
    finally { setSaving(false); }
  }

  async function addNote(event: React.FormEvent) {
    event.preventDefault(); if (!selected || !note.trim()) return;
    setSaving(true);
    try {
      const response = await request(`/api/creator/admin/leads/${selected.id}/notes`, { method: "POST", body: JSON.stringify({ note }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Note save failed.");
      setSelected((current) => current ? { ...current, notes: [body.note, ...current.notes] } : current); setNote("");
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Note save failed."); }
    finally { setSaving(false); }
  }

  async function addTask(event: React.FormEvent) {
    event.preventDefault(); if (!selected || !task.trim()) return;
    setSaving(true);
    try {
      const response = await request(`/api/creator/admin/leads/${selected.id}/tasks`, { method: "POST", body: JSON.stringify({ taskType: "follow_up", taskDetail: task }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Follow-up save failed.");
      setSelected((current) => current ? { ...current, tasks: [body.task, ...current.tasks] } : current); setTask(""); await loadLeads();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Follow-up save failed."); }
    finally { setSaving(false); }
  }

  useEffect(() => { loadLeads(); }, [includeInternalTests]);

  return <main className="creator-admin-shell"><header className="creator-admin-header"><div><p className="creator-eyebrow">ZAKHY BUILDS AI · INTERNAL</p><h1>Creator Leads</h1></div><Link href="/admin" className="creator-back">← Admin home</Link></header>
    {error && <p className="creator-form-error">{error}</p>}
    <section className="creator-admin-layout">
      <div className="creator-admin-list"><div className="creator-admin-list-head"><span>{loading ? "Loading" : `${leads.length} lead${leads.length === 1 ? "" : "s"}`}</span><div><label><input type="checkbox" checked={includeInternalTests} onChange={(event) => setIncludeInternalTests(event.target.checked)} /> Show internal tests</label><button onClick={loadLeads}>Refresh</button></div></div>
      {loading ? <p className="creator-empty">Loading Creator Leads…</p> : leads.length === 0 ? <p className="creator-empty">No Creator Leads yet. Public requests will appear here after the migration is approved and applied.</p> : leads.map((lead) => <button className={`creator-lead-row ${selected?.id === lead.id ? "is-selected" : ""}`} onClick={() => selectLead(lead.id)} key={lead.id}>
        <div><strong>{lead.brandName || lead.fullName}{lead.isInternalTest ? " · TEST / INTERNAL" : ""}</strong><span>{lead.fullName} · {lead.creatorType}</span></div><span className={`creator-status ${lead.status}`}>{label(lead.status)}</span>
      </button>)}</div>
      <aside className="creator-lead-detail">{selected ? <>
        <div className="creator-detail-head"><div><p className="creator-eyebrow">LEAD #{selected.id}</p><h2>{selected.brandName || selected.fullName}</h2><p>{selected.fullName} · {selected.email}</p></div><select aria-label="Lead status" value={selected.status} disabled={saving} onChange={(event) => updateStatus(event.target.value as Status)}>{statuses.map((status) => <option value={status} key={status}>{label(status)}</option>)}</select></div>
        <div className="creator-detail-grid"><article><span>Package</span><strong>{selected.packageInterest || "Not sure yet"}</strong></article><article><span>Budget</span><strong>{selected.budgetRange || "Not provided"}</strong></article></div>
        <section className="creator-detail-section"><h3>Project priority</h3><p>{selected.project_priority || "Not provided"}</p><h3>Goals</h3><p>{selected.goals || "Not provided"}</p><h3>Challenges</h3><p>{selected.challenges || "Not provided"}</p></section>
        <section className="creator-detail-section"><h3>Next actions</h3><div className="creator-mini-list">{selected.tasks.length ? selected.tasks.map((item) => <p key={item.id}><b>{label(item.status)}</b> · {item.task_detail || item.task_type}</p>) : <p>No follow-up scheduled.</p>}</div><form className="creator-inline-form" onSubmit={addTask}><input value={task} onChange={(event) => setTask(event.target.value)} placeholder="Add a manual follow-up action" /><button disabled={saving}>Add</button></form></section>
        <section className="creator-detail-section"><h3>Internal notes</h3><div className="creator-mini-list">{selected.notes.length ? selected.notes.map((item) => <p key={item.id}>{item.note}</p>) : <p>No notes yet.</p>}</div><form className="creator-inline-form" onSubmit={addNote}><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add an internal note" /><button disabled={saving}>Save</button></form></section>
      </> : <div className="creator-empty"><p>Select a lead to review its project context, add notes, and schedule manual follow-up.</p></div>}</aside>
    </section>
  </main>;
}

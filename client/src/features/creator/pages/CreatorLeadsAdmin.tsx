import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { getAdminLoginUrl } from "@/lib/adminLoginRedirect";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import CreatorBusinessAssessment from "../components/CreatorBusinessAssessment";
import "../styles/creator.css";

type Status = "new" | "reviewing" | "follow_up" | "converted" | "closed";
type Lead = {
  id: number; fullName: string; brandName: string | null; email: string; creatorType: string;
  packageInterest: string | null; budgetRange: string | null; status: Status; isInternalTest: boolean; submittedAt: string; nextAction: string | null; openTaskDueAt: string | null;
};
type LeadDetail = Lead & { goals?: string; challenges?: string; automation_wish?: string; website_url?: string; revenue_streams?: string[] | string; audience_size?: string; collects_fan_contacts?: string; brand_assets?: string[] | string; brand_style?: string; business_systems?: string[] | string; opportunity_focus?: string[] | string; priority_platforms?: string[] | string; project_priority?: string; final_question?: string; notes: Array<{ id: number; note: string; created_at: string }>; tasks: Array<{ id: number; task_type: string; task_detail: string | null; due_at: string | null; status: string }>; events: Array<{ id: number; event_type: string; actor: string; created_at: string }> };
type Portal = { id: number; creator_lead_id: number; status: "disabled" | "invited" | "active"; current_status: string; current_phase: string; next_step: string | null; drive_folder_url: string | null; invitation_sent_at: string | null; last_access_at: string | null; };
type PortalMessage = { id: number; sender_type: "admin" | "creator"; message_text: string; visible_to_creator: boolean; created_at: string };

const statuses: Status[] = ["new", "reviewing", "follow_up", "converted", "closed"];
const label = (status: string) => status.replace("_", " ");

type TaskTemplate = {
  id: string;
  label: string;
  taskType: string;
  businessDays: number;
  detail: string;
};

const taskTemplates: TaskTemplate[] = [
  { id: "review_lead", label: "Review Lead", taskType: "review_lead", businessDays: 0, detail: "Review goals, offer fit, budget, timing, links, assets, and decision-maker. Record the qualification decision in an internal note." },
  { id: "initial_contact", label: "Initial Contact", taskType: "initial_contact", businessDays: 1, detail: "Prepare a personal, manual-send response. Confirm the primary goal, current links, launch timing, budget range, available assets, and decision-maker." },
  { id: "discovery_call", label: "Discovery Call", taskType: "discovery_call", businessDays: 0, detail: "Prepare discovery questions: 6–12 month goal, manual work, revenue, audience channels, assets, launch requirements, and approval process." },
  { id: "send_offer", label: "Send Offer", taskType: "send_offer", businessDays: 0, detail: "Prepare the selected offer, deliverables, timeline, review rounds, exclusions, client responsibilities, and payment terms for human approval." },
  { id: "first_follow_up", label: "First Follow-Up", taskType: "first_follow_up", businessDays: 2, detail: "Draft a concise manual check-in referencing the original goal and asking whether the project is still active. Do not send automatically." },
  { id: "final_follow_up", label: "Final Follow-Up", taskType: "final_follow_up", businessDays: 5, detail: "Draft a respectful final manual check-in with an easy reply path. Do not close the lead automatically." },
  { id: "onboarding_handoff", label: "Onboarding Handoff", taskType: "onboarding_handoff", businessDays: 0, detail: "Prepare the onboarding checklist: brand assets, links, domain, offers, CTA, access requirements, approval contact, and project scope." },
];

function addBusinessDays(date: Date, businessDays: number) {
  const next = new Date(date);
  let remaining = businessDays;
  while (remaining > 0) {
    next.setDate(next.getDate() + 1);
    if (next.getDay() !== 0 && next.getDay() !== 6) remaining -= 1;
  }
  return next;
}

function dateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function CreatorLeadsAdmin() {
  const [, setLocation] = useLocation();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<LeadDetail | null>(null);
  const selectionVersion = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [task, setTask] = useState("");
  const [taskType, setTaskType] = useState("follow_up");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [saving, setSaving] = useState(false);
  const [simpleView, setSimpleView] = useState(true);
  const [notice, setNotice] = useState("");
  const [includeInternalTests, setIncludeInternalTests] = useState(false);
  const [portal, setPortal] = useState<Portal | null>(null);
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [portalForm, setPortalForm] = useState({ status: "disabled", currentStatus: "Intake Received", currentPhase: "Discovery", nextStep: "", driveFolderUrl: "" });
  const [portalSaving, setPortalSaving] = useState(false);
  const [portalSaveNotice, setPortalSaveNotice] = useState("");
  const [portalMessages, setPortalMessages] = useState<PortalMessage[]>([]);
  const [portalMessagesReady, setPortalMessagesReady] = useState(false);
  const [portalMessage, setPortalMessage] = useState("");
  const [portalMessageVisible, setPortalMessageVisible] = useState(true);

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
    const version = ++selectionVersion.current;
    setSelected(null);
    setSimpleView(true); setNotice(""); setPortalSaveNotice(""); setError(""); setNote("");
    setPortal(null); setPortalMessages([]); setPortalEnabled(false); setPortalMessagesReady(false);
    try {
      const response = await request(`/api/creator/admin/leads/${id}`);
      const body = await response.json();
      if (version !== selectionVersion.current) return;
      if (!response.ok) throw new Error(body.error || "Unable to load lead details.");
      setSelected(body.lead);
      const portalResponse = await request(`/api/creator/admin/leads/${id}/portal`);
      if (portalResponse.ok) {
        const portalBody = await portalResponse.json();
        if (version !== selectionVersion.current) return;
        const nextPortal = portalBody.portal as Portal | null;
        setPortal(nextPortal);
        setPortalForm({ status: nextPortal?.status || "disabled", currentStatus: nextPortal?.current_status || "Intake Received", currentPhase: nextPortal?.current_phase || "Discovery", nextStep: nextPortal?.next_step || "", driveFolderUrl: nextPortal?.drive_folder_url || "" });
        setPortalEnabled(true);
        const messagesResponse = await request(`/api/creator/admin/leads/${id}/portal/messages`);
        if (messagesResponse.ok) {
          const messagesBody = await messagesResponse.json();
          if (version === selectionVersion.current) {
            setPortalMessages(messagesBody.messages || []);
            setPortalMessagesReady(true);
          }
        }
      } else {
        if (version !== selectionVersion.current) return;
        setPortal(null);
        setPortalMessages([]);
        setPortalEnabled(portalResponse.status !== 404);
      }
    } catch (loadError) { if (version === selectionVersion.current) setError(loadError instanceof Error ? loadError.message : "Unable to load lead details."); }
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
      setSelected((current) => current ? { ...current, notes: [body.note, ...current.notes] } : current); setNote(""); setNotice("Internal update saved.");
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Note save failed."); }
    finally { setSaving(false); }
  }

  async function addTask(event: React.FormEvent) {
    event.preventDefault(); if (!selected || !task.trim()) return;
    setSaving(true);
    try {
      const dueAt = taskDueAt ? new Date(taskDueAt).toISOString() : undefined;
      const response = await request(`/api/creator/admin/leads/${selected.id}/tasks`, { method: "POST", body: JSON.stringify({ taskType, taskDetail: task, dueAt }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Follow-up save failed.");
      setSelected((current) => current ? { ...current, tasks: [body.task, ...current.tasks] } : current); setTask(""); setTaskType("follow_up"); setTaskDueAt(""); setSelectedTemplate(""); await loadLeads();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Follow-up save failed."); }
    finally { setSaving(false); }
  }

  async function savePortal(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || portalSaving) return;
    const leadId = selected.id;
    const expected = { ...portalForm };
    setPortalSaving(true);
    setPortalSaveNotice("Saving project update…");
    setError("");
    try {
      const response = await request(`/api/creator/admin/leads/${leadId}/portal`, {
        method: "PATCH",
        body: JSON.stringify(expected),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Portal settings could not be saved.");

      // Read the value back instead of claiming success from the PATCH alone.
      const checkResponse = await request(`/api/creator/admin/leads/${leadId}/portal`);
      const checkBody = await checkResponse.json();
      if (!checkResponse.ok || !checkBody.portal) {
        throw new Error("The server accepted the update, but the saved value could not be verified.");
      }
      const saved = checkBody.portal as Portal;
      if ((saved.next_step || "").trim() !== expected.nextStep.trim()
        || (saved.current_phase || "").trim() !== expected.currentPhase.trim()
        || saved.current_status !== expected.currentStatus) {
        throw new Error("The saved project values do not match. Please refresh and try again.");
      }
      setPortal(saved);
      setPortalForm({
        status: saved.status,
        currentStatus: saved.current_status,
        currentPhase: saved.current_phase,
        nextStep: saved.next_step || "",
        driveFolderUrl: saved.drive_folder_url || "",
      });
      setPortalSaveNotice("Saved and verified. This next step will appear in the client's workspace when their access is active.");
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Portal settings could not be saved.";
      setError(message);
      setPortalSaveNotice(`Save not confirmed: ${message}`);
    } finally {
      setPortalSaving(false);
    }
  }

  async function createInvitation() {
    if (!selected) return;
    if (!portalMessagesReady) { setError("Portal setup is incomplete. Refresh after messages storage is available before sending an invitation."); return; }
    if (!window.confirm(`Send a private portal invitation email to ${selected.email}? This gives ${selected.brandName || selected.fullName} access to their project status and client-visible updates.`)) return;
    setPortalSaving(true); setError("");
    try {
      const response = await request(`/api/creator/admin/leads/${selected.id}/portal/invite`, { method: "POST", body: "{}" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Invitation could not be created.");
      setPortal(body.portal); setPortalForm((current) => ({ ...current, status: body.portal.status }));
      setNotice(body.emailSent ? "Portal invitation emailed to the client." : "Invitation created, but email delivery was not confirmed. Copy the link for manual sharing.");
      window.prompt("Private portal link — expires in 7 days. Share only with this client:", body.invitationUrl);
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Invitation could not be created."); }
    finally { setPortalSaving(false); }
  }

  async function revokePortal() {
    if (!selected || !window.confirm("Revoke this creator's portal access? Their current invitation will stop working.")) return;
    setPortalSaving(true); setError("");
    try {
      const response = await request(`/api/creator/admin/leads/${selected.id}/portal/revoke`, { method: "POST", body: "{}" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Portal access could not be revoked.");
      setPortal(body.portal); setPortalForm((current) => ({ ...current, status: "disabled" }));
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Portal access could not be revoked."); }
    finally { setPortalSaving(false); }
  }

  async function addPortalMessage(event: React.FormEvent) {
    event.preventDefault(); if (!selected || !portalMessage.trim()) return;
    if (!portalMessagesReady) { setError("Portal messages are unavailable. Your message has not been sent or saved."); return; }
    setPortalSaving(true); setError("");
    try {
      const response = await request(`/api/creator/admin/leads/${selected.id}/portal/messages`, { method: "POST", body: JSON.stringify({ text: portalMessage, visibleToCreator: portalMessageVisible }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Portal message could not be saved.");
      setPortalMessages((current) => [...current, body.message]); setPortalMessage("");
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Portal message could not be saved."); }
    finally { setPortalSaving(false); }
  }

  function applyTaskTemplate(templateId: string) {
    setSelectedTemplate(templateId);
    const template = taskTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setTaskType(template.taskType);
    setTask(template.detail);
    setTaskDueAt(dateTimeLocalValue(addBusinessDays(new Date(), template.businessDays)));
  }

  useEffect(() => { loadLeads(); }, [includeInternalTests]);
  useEffect(() => {
    const leadId = Number(new URLSearchParams(window.location.search).get("lead"));
    if (Number.isSafeInteger(leadId) && leadId > 0) selectLead(leadId);
  }, []);

  return <main className="creator-admin-shell"><header className="creator-admin-header"><div><p className="creator-eyebrow">CREATOR AUTOMATIONS · INTERNAL</p><h1>Leads & Clients</h1></div><Link href="/admin/zakhy" className="creator-back">← Creator dashboard</Link></header>
    {error && <p className="creator-form-error">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    <section className="creator-admin-layout">
      <div className="creator-admin-list"><div className="creator-admin-list-head"><span>{loading ? "Loading" : `${leads.length} lead${leads.length === 1 ? "" : "s"}`}</span><div><label><input type="checkbox" checked={includeInternalTests} onChange={(event) => setIncludeInternalTests(event.target.checked)} /> Show internal tests</label><button onClick={loadLeads}>Refresh</button></div></div>
      {loading ? <p className="creator-empty">Loading Creator Leads…</p> : leads.length === 0 ? <p className="creator-empty">No Creator Leads yet. Public requests will appear here after the migration is approved and applied.</p> : leads.map((lead) => <button className={`creator-lead-row ${selected?.id === lead.id ? "is-selected" : ""}`} onClick={() => selectLead(lead.id)} key={lead.id}>
        <div><strong>{lead.brandName || lead.fullName}{lead.isInternalTest ? " · TEST / INTERNAL" : ""}</strong><span>{lead.fullName} · {lead.creatorType}</span></div><span className={`creator-status ${lead.status}`}>{label(lead.status)}</span>
      </button>)}</div>
      <aside className="creator-lead-detail">{selected ? <>
        <div className="creator-detail-head"><div><p className="creator-eyebrow">LEAD #{selected.id}</p><h2>{selected.brandName || selected.fullName}</h2><p>{selected.fullName} · {selected.email}</p></div><select aria-label="Lead status" value={selected.status} disabled={saving} onChange={(event) => updateStatus(event.target.value as Status)}>{statuses.map((status) => <option value={status} key={status}>{label(status)}</option>)}</select></div>
        <div className="creator-portal-actions" aria-label="Client view"><button type="button" aria-pressed={simpleView} onClick={() => setSimpleView(true)}>Simple view</button><button type="button" aria-pressed={!simpleView} onClick={() => setSimpleView(false)}>Full record</button></div>
        <Link href={`/admin/creator/portal-preview?lead=${selected.id}`} className="creator-back">Preview client portal →</Link>
        {portalEnabled && !portalMessagesReady && <p role="status" className="creator-form-error">Portal setup is incomplete: messages are unavailable. Invitations are on hold. Status and internal notes still work.</p>}
        {simpleView ? <>
          <section className="creator-detail-section"><h3>At a glance</h3><div className="creator-detail-grid"><article><span>Service requested</span><strong>{selected.packageInterest || "Not recorded"}</strong></article><article><span>Portal access</span><strong>{portalEnabled ? portal?.status || "Not invited" : "Unavailable"}</strong></article></div><p>{selected.status === "converted" ? "Active client" : "Use the status selector above to move a lead to converted when they become a client."}</p></section>
          <section className="creator-detail-section"><h3>What happens next?</h3>{portalEnabled ? <form className="creator-task-template-form" onSubmit={savePortal}><label>Project stage<select value={portalForm.currentStatus} onChange={(event) => setPortalForm({ ...portalForm, currentStatus: event.target.value })}>{["Intake Received", "Reviewing", "Awaiting Client", "Planning", "In Progress", "Ready for Review", "Completed"].map(status => <option key={status}>{status}</option>)}</select></label><label>Working on<input value={portalForm.currentPhase} onChange={(event) => setPortalForm({ ...portalForm, currentPhase: event.target.value })} /></label><label>Next step for the client<textarea value={portalForm.nextStep} onChange={(event) => setPortalForm({ ...portalForm, nextStep: event.target.value })} placeholder="For example: send your logo and product photos." /></label><p className="creator-task-safety">Visible in the client's portal when access is enabled. Saving does not send an email.</p><button disabled={portalSaving}>{portalSaving ? "Saving…" : "Save project update"}</button>{portalSaveNotice && <p role="status" className="creator-task-safety">{portalSaveNotice}</p>}</form> : <p>Portal details are not available yet. You can still update status and save an internal note.</p>}</section>
          <section className="creator-detail-section"><h3>Quick internal update</h3><form className="creator-task-template-form" onSubmit={addNote}><label>What changed?<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Email recap, agreed scope, payment confirmed, or what you need next…" /></label><p className="creator-task-safety">Internal only. This does not message the client.</p><button disabled={saving || !note.trim()}>Save internal update</button></form>{selected.notes[0] && <p><strong>Latest update:</strong> {selected.notes[0].note}</p>}</section>
          <section className="creator-detail-section"><h3>Client portal</h3><p>{portal?.last_access_at ? `Last opened ${new Date(portal.last_access_at).toLocaleDateString()}.` : "No portal visit recorded."}</p><p>The client sees their project progress, next step, and shared messages. Internal notes stay private.</p><button type="button" disabled={portalSaving || !portalEnabled} onClick={createInvitation}>{portal?.status === "active" || portal?.status === "invited" ? "Send new portal invitation" : "Invite client to portal"}</button><p className="creator-task-safety">You will confirm the recipient before an invitation email is sent. A new invitation replaces the previous link.</p><button type="button" className="creator-secondary-button" onClick={() => setSimpleView(false)}>Messages, tasks & full details</button></section>
        </> : <>
        <div className="creator-detail-grid"><article><span>Package</span><strong>{selected.packageInterest || "Not sure yet"}</strong></article><article><span>Budget</span><strong>{selected.budgetRange || "Not provided"}</strong></article></div>
        <CreatorBusinessAssessment lead={selected} />
        <section className="creator-detail-section creator-portal-access-panel"><div className="creator-section-heading"><div><p className="creator-eyebrow">CREATOR WORKSPACE</p><h3>Portal access</h3></div><span className={`creator-status ${portalForm.status}`}>{portalForm.status}</span></div>{!portalEnabled ? <p className="creator-task-safety">Portal storage is prepared but not enabled yet. Production migration and feature-flag activation are still required.</p> : <form onSubmit={savePortal}><div className="creator-task-fields"><label>Portal status<select value={portalForm.status} onChange={(event) => setPortalForm({ ...portalForm, status: event.target.value })}><option value="disabled">Disabled</option><option value="invited">Invited</option><option value="active">Active</option></select></label><label>Project status<select value={portalForm.currentStatus} onChange={(event) => setPortalForm({ ...portalForm, currentStatus: event.target.value })}>{["Intake Received", "Reviewing", "Awaiting Client", "Planning", "In Progress", "Ready for Review", "Completed"].map((status) => <option value={status} key={status}>{status}</option>)}</select></label></div><div className="creator-task-fields"><label>Current phase<input value={portalForm.currentPhase} onChange={(event) => setPortalForm({ ...portalForm, currentPhase: event.target.value })} /></label><label>Next step<input value={portalForm.nextStep} onChange={(event) => setPortalForm({ ...portalForm, nextStep: event.target.value })} placeholder="What happens next?" /></label></div><label>Dedicated Google Drive folder URL<input type="url" value={portalForm.driveFolderUrl} onChange={(event) => setPortalForm({ ...portalForm, driveFolderUrl: event.target.value })} placeholder="https://drive.google.com/drive/folders/..." /></label><p className="creator-task-safety">Only this dedicated folder link is stored. No Drive sync or permission changes are performed.</p><div className="creator-portal-actions"><button type="submit" disabled={portalSaving}>{portalSaving ? "Saving…" : "Save portal settings"}</button><button type="button" disabled={portalSaving} onClick={createInvitation}>Send invitation</button><button type="button" className="creator-secondary-button" disabled={portalSaving || !portal} onClick={revokePortal}>Revoke access</button></div>{portalSaveNotice && <p role="status" className="creator-task-safety">{portalSaveNotice}</p>}</form>}</section>
        <section className="creator-detail-section creator-portal-message-card"><div className="creator-portal-message-card-head"><div><p className="creator-eyebrow">PROJECT RECORD</p><h3>Messages & important decisions</h3></div><span className="creator-portal-muted-action">{portalMessages.length} saved</span></div><div className="creator-portal-thread">{portalMessages.length ? portalMessages.map((item) => <article className={`creator-portal-message ${item.sender_type === "creator" ? "from-creator" : "from-zakhy"}`} key={item.id}><div className="creator-portal-message-meta"><strong>{item.sender_type === "creator" ? selected.fullName : "Zakhy Builds AI"}</strong><span>{new Date(item.created_at).toLocaleString()}</span>{!item.visible_to_creator && <em>Internal only</em>}</div><p>{item.message_text}</p></article>) : <p>No project messages yet.</p>}</div><form className="creator-portal-message-form" onSubmit={addPortalMessage}><label>Add an update or message<textarea value={portalMessage} onChange={(event) => setPortalMessage(event.target.value)} placeholder="Share a next step, decision, or request…" /></label><label className="creator-portal-checkbox"><input type="checkbox" checked={portalMessageVisible} onChange={(event) => setPortalMessageVisible(event.target.checked)} /> Visible to creator</label><button type="submit" disabled={portalSaving}>Save message</button></form></section>
        <section className="creator-detail-section"><h3>Project priority</h3><p>{selected.project_priority || "Not provided"}</p><h3>Goals</h3><p>{selected.goals || "Not provided"}</p><h3>Challenges</h3><p>{selected.challenges || "Not provided"}</p></section>
        <section className="creator-detail-section"><h3>Next actions</h3><div className="creator-mini-list">{selected.tasks.length ? selected.tasks.map((item) => <p key={item.id}><b>{label(item.status)}</b> · {item.task_detail || item.task_type}</p>) : <p>No follow-up scheduled.</p>}</div><form className="creator-task-template-form" onSubmit={addTask}><label className="creator-template-label">Task template<select aria-label="Task template" value={selectedTemplate} onChange={(event) => applyTaskTemplate(event.target.value)}><option value="">Manual task</option>{taskTemplates.map((template) => <option value={template.id} key={template.id}>{template.label}</option>)}</select></label><div className="creator-task-fields"><label>Task type<input value={taskType} onChange={(event) => setTaskType(event.target.value)} placeholder="Task type" /></label><label>Suggested due date<input type="datetime-local" value={taskDueAt} onChange={(event) => setTaskDueAt(event.target.value)} /></label></div><label>Task detail<textarea value={task} onChange={(event) => setTask(event.target.value)} placeholder="Add a manual follow-up action" /></label><p className="creator-task-safety">Templates only pre-fill a manual internal task. No customer message is sent automatically.</p><button type="submit" disabled={saving}>Create manual task</button></form></section>
        <section className="creator-detail-section"><h3>Internal notes</h3><div className="creator-mini-list">{selected.notes.length ? selected.notes.map((item) => <p key={item.id}>{item.note}</p>) : <p>No notes yet.</p>}</div><form className="creator-inline-form" onSubmit={addNote}><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add an internal note" /><button disabled={saving}>Save</button></form></section>
        </>}
      </> : <div className="creator-empty"><p>Select a lead or client to update their project or manage portal access.</p></div>}</aside>
    </section>
  </main>;
}

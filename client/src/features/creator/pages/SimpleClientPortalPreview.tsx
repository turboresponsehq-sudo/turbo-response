import { useEffect, useState } from "react";
import { Link } from "wouter";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import "../styles/simpleClientPortal.css";

type Project = { fullName: string; brandName: string | null; status: string; phase: string; nextStep: string; driveFolderUrl: string | null; items: { id: number; label: string; status: string }[]; };

export default function SimpleClientPortalPreview() {
  const leadId = Number(new URLSearchParams(window.location.search).get("lead"));
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [owner, setOwner] = useState("Your team");
  useEffect(() => {
    let active = true;
    async function load() {
      if (!Number.isSafeInteger(leadId) || leadId <= 0) { setError("Open a client record and choose Preview client portal."); return; }
      try {
        const headers = getAdminSessionAuthorizationHeader();
        const [leadResponse, portalResponse] = await Promise.all([
          fetch(`/api/creator/admin/leads/${leadId}`, { headers }),
          fetch(`/api/creator/admin/leads/${leadId}/portal`, { headers }),
        ]);
        if (!leadResponse.ok || !portalResponse.ok) throw new Error("Unable to load this preview. Check your admin session and try again.");
        const { lead } = await leadResponse.json();
        const { portal } = await portalResponse.json();
        if (!active) return;
        setProject({ fullName: lead.fullName, brandName: lead.brandName, status: portal?.current_status || "Planning", phase: portal?.current_phase || "Project setup", nextStep: portal?.next_step || "", driveFolderUrl: portal?.drive_folder_url || null, items: [] });
        setNextStep(portal?.next_step || "");
      } catch (err) { if (active) setError(err instanceof Error ? err.message : "Unable to open preview."); }
    }
    load();
    return () => { active = false; };
  }, [leadId]);
  const dateLabel = dueDate ? new Date(`${dueDate}T12:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "Not recorded yet";
  return <main className="scp-page">
    <aside className="scp-review"><span><b>Private client-view preview</b> · Admin only · Nothing is saved or sent</span><div className="scp-review-links"><a href="https://calendar.google.com/calendar/u/0/r/day" target="_blank" rel="noopener noreferrer">Today’s calendar</a><Link href={leadId > 0 ? `/admin/creator/leads?lead=${leadId}` : "/admin/creator/leads"}>← Back to client</Link></div></aside>
    {error ? <p role="alert" className="scp-loading">{error}</p> : !project ? <p className="scp-loading">Loading project preview…</p> : <>
      <div className="scp-workspace">
        <header className="scp-header"><span className="scp-brand">⚡ CREATOR AUTOMATIONS</span><span>YOUR PROJECT</span></header>
        <section className="scp-intro"><p className="scp-kicker">LET’S KEEP THINGS MOVING</p><h1>{project.brandName || project.fullName}</h1><p>A clear place to see where your project stands. Keep replying by email whenever you need us.</p></section>
        <section className="scp-progress" aria-label="Project progress"><div><span className="scp-label">PROJECT STATUS</span><h2>{project.status}</h2><p>{project.phase}</p></div><span className="scp-status">{project.status}</span></section>
        <section className="scp-next"><h2><span>01</span> What happens next</h2><p className="scp-next-text">{nextStep || "Your team will confirm the next step here."}</p><div className="scp-meta"><div><span className="scp-label">WHO’S ON IT</span><strong>{owner}</strong></div><div><span className="scp-label">DUE DATE</span><strong>{dateLabel}</strong></div></div></section>
        <section className="scp-grid"><article className="scp-card"><h2><span>02</span> Files & review</h2><p>{project.driveFolderUrl ? "Your team has added a shared files folder. Open it to review available materials." : "Approved files and review links will appear here after your team shares them."}</p>{project.driveFolderUrl && /^https:\/\//i.test(project.driveFolderUrl) ? <a className="scp-card-action" href={project.driveFolderUrl} target="_blank" rel="noopener noreferrer">Open shared files</a> : <span className="scp-card-inactive">No shared files added yet</span>}</article><article className="scp-card"><h2><span>03</span> Have a question?</h2><p>Use this preview to see how a client can contact your team. Real client messages are saved in their private workspace.</p><a className="scp-card-action scp-email" href="mailto:turboresponsehq@gmail.com?subject=Creator%20Automations%20Project%20Question">Write an email</a><Link className="scp-card-secondary" href="/creator/portal/login">Client invitation access</Link></article></section>
        <footer>One project. A clear next step. Email when you need us.</footer>
      </div>
      <details className="scp-controls"><summary>Try a next step and due date</summary><p>These are preview drafts only. Internal notes, payments, and your private Drive folder are excluded from the client view.</p><div className="scp-edit"><label>Next step<textarea value={nextStep} onChange={event => setNextStep(event.target.value)} placeholder="What should happen next?" /></label><label>Who is responsible?<select value={owner} onChange={event => setOwner(event.target.value)}><option>Your team</option><option>You</option></select></label><label>Due date<input type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} /></label></div><p>Email-to-task suggestions, saved deadlines, and reminders are future additions. None run in this preview.</p></details>
    </>}
  </main>;
}

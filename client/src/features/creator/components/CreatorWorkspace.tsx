import { useEffect, useState, type FormEvent } from "react";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";
import "../styles/simpleClientPortal.css";

export type CreatorWorkspaceData = {
  id: number;
  project_goal?: string;
  next_step?: string | null;
  full_name?: string;
  brand_name?: string;
  current_status?: string;
  current_phase?: string;
  package_interest?: string;
  drive_folder_url?: string | null;
  tasks?: Array<{ id: number; label: string; status: string; owner: "team" | "client"; priority: "urgent" | "normal" }>;
  messages?: Array<{ id: number; sender_type: "admin" | "creator"; message_text: string; created_at: string }>;
  attachments?: Array<{ id: number; kind: "file" | "link"; name: string; url?: string; created_at: string }>;
};

export default function CreatorWorkspace({ initial, mode, leadId, clientName }: {
  initial: CreatorWorkspaceData;
  mode: "admin" | "client" | "demo";
  leadId?: number;
  clientName?: string;
}) {
  const admin = mode === "admin";
  const demo = mode === "demo";
  const [project, setProject] = useState<CreatorWorkspaceData>(initial);
  const [goalText, setGoalText] = useState(initial.project_goal || "");
  const [editingGoal, setEditingGoal] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [taskOwner, setTaskOwner] = useState<"team" | "client">("client");
  const [taskPriority, setTaskPriority] = useState<"normal" | "urgent">("normal");
  const [message, setMessage] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setProject(initial);
    setGoalText(initial.project_goal || "");
    setNotice("");
  }, [initial]);

  const base = admin ? `/api/creator/admin/leads/${leadId}/portal` : "/api/creator/portal";
  const headers = () => admin ? getAdminSessionAuthorizationHeader() : {};
  async function send(path: string, method: string, body?: unknown, multipart?: boolean) {
    const response = await fetch(base + path, {
      method, credentials: "include",
      headers: multipart ? headers() : { "Content-Type": "application/json", ...headers() },
      body: multipart ? body as FormData : body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    let data: any;
    try { data = await response.json(); } catch { throw new Error("The server did not return a valid response."); }
    if (!response.ok) throw new Error(data.error || "The update could not be saved.");
    return data;
  }

  async function refreshConversation() {
    if (demo) return;
    try {
      const url = admin ? base + "/messages" : "/api/creator/portal/me";
      const response = await fetch(url, { credentials: "include", headers: headers(), cache: "no-store" });
      if (!response.ok) return;
      const body = await response.json();
      const messages = admin ? body.messages : body.portal?.messages;
      if (Array.isArray(messages)) setProject(p => ({ ...p, messages: messages.filter((m: any) => m.visible_to_creator !== false) }));
    } catch { /* Keep the currently displayed conversation if disconnected. */ }
  }

  useEffect(() => {
    if (demo) return;
    const interval = window.setInterval(() => { void refreshConversation(); }, 25000);
    return () => window.clearInterval(interval);
  }, [base, admin]);

  async function saveGoal(event: FormEvent) {
    event.preventDefault();
    const title = goalText.trim();
    if (!admin || !title) return;
    setBusy("goal"); setNotice("");
    try {
      const data = await send("/goal", "PATCH", { title });
      setProject(p => ({ ...p, project_goal: data.project_goal }));
      setEditingGoal(false);
      setNotice("Project goal saved.");
    } catch (e) { setNotice(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(""); }
  }

  async function addTask(event: FormEvent) {
    event.preventDefault();
    if (!admin || !taskText.trim()) return;
    setBusy("task"); setNotice("");
    try {
      const data = await send("/tasks", "POST", { title: taskText.trim(), owner: taskOwner, priority: taskPriority });
      setProject(p => ({ ...p, tasks: [...(p.tasks || []), data.task] }));
      setTaskText("");
      setNotice("Task added.");
    } catch (e) { setNotice(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(""); }
  }

  async function checkTask(id: number, done: boolean) {
    if (demo) {
      setProject(p => ({ ...p, tasks: (p.tasks || []).map(t => t.id === id ? { ...t, status: done ? "complete" : "needed" } : t) }));
      setNotice("Sample checklist updated. Real projects save changes securely.");
      return;
    }
    setBusy("task-" + id); setNotice("");
    try {
      const data = await send("/tasks/" + id, "PATCH", { done });
      setProject(p => ({ ...p, tasks: (p.tasks || []).map(t => t.id === id ? data.task : t) }));
    } catch (e) { setNotice(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(""); }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    if (demo) {
      setProject(p => ({ ...p, messages: [...(p.messages || []), { id: -(Date.now()), sender_type: "creator", message_text: message.trim(), created_at: new Date().toISOString() }] }));
      setMessage("");
      setNotice("Sample message added here only. No email was sent.");
      return;
    }
    setBusy("message"); setNotice("");
    try {
      const data = await send("/messages", "POST", { text: message.trim(), ...(admin ? { visibleToCreator: true } : {}) });
      setProject(p => ({ ...p, messages: [...(p.messages || []), data.message] }));
      setMessage("");
      setNotice(admin ? "Message saved for the client." : data.emailSent ? "Message sent. Your team was notified by email." : "Message saved. Email delivery could not be confirmed.");
    } catch (e) { setNotice(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(""); }
  }

  async function addLink(event: FormEvent) {
    event.preventDefault();
    if (!linkUrl.trim()) return;
    if (demo) {
      try { const u = new URL(linkUrl); if (!["https:", "http:"].includes(u.protocol)) throw new Error(); }
      catch { setNotice("Enter a valid website link."); return; }
      setProject(p => ({ ...p, attachments: [{ id: -(Date.now()), kind: "link", name: linkName || linkUrl, url: linkUrl.trim(), created_at: new Date().toISOString() }, ...(p.attachments || [])] }));
      setLinkUrl(""); setLinkName("");
      setNotice("Sample link added to this preview only.");
      return;
    }
    setBusy("link"); setNotice("");
    try {
      const data = await send("/attachments/link", "POST", { name: linkName || linkUrl, url: linkUrl.trim() });
      setProject(p => ({ ...p, attachments: [data.attachment, ...(p.attachments || [])] }));
      setLinkUrl(""); setLinkName("");
      setNotice("Link added to the project.");
    } catch (e) { setNotice(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(""); }
  }

  async function uploadFile(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    if (demo) {
      setProject(p => ({ ...p, attachments: [{ id: -(Date.now()), kind: "file", name: file.name, created_at: new Date().toISOString() }, ...(p.attachments || [])] }));
      setFile(null);
      const input = document.getElementById("workspace-file-input") as HTMLInputElement | null;
      if (input) input.value = "";
      setNotice("Sample file listed here only. No file was uploaded.");
      return;
    }
    setBusy("file"); setNotice("");
    try {
      if (file.size > 8 * 1024 * 1024) throw new Error("Please use a file under 8 MB.");
      const form = new FormData();
      form.append("file", file);
      const data = await send("/attachments/file", "POST", form, true);
      setProject(p => ({ ...p, attachments: [data.attachment, ...(p.attachments || [])] }));
      setFile(null);
      const input = document.getElementById("workspace-file-input") as HTMLInputElement | null;
      if (input) input.value = "";
      setNotice("File uploaded privately.");
    } catch (e) { setNotice(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(""); }
  }

  async function downloadFile(id: number, name: string) {
    if (demo) { setNotice("This is a demo. No real file was uploaded."); return; }
    setBusy("download-" + id);
    try {
      const response = await fetch(base + "/attachments/" + id, { credentials: "include", headers: headers(), cache: "no-store" });
      if (!response.ok) throw new Error("File unavailable");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (e) { setNotice(String(e instanceof Error ? e.message : e)); }
    finally { setBusy(""); }
  }

  function taskBox(owner: "team" | "client") {
    const tasks = (project.tasks || []).filter(t => t.owner === owner).sort((a, b) => {
      const done = (a.status === "complete" ? 1 : 0) - (b.status === "complete" ? 1 : 0);
      return done || (a.priority === "urgent" ? -1 : 1) - (b.priority === "urgent" ? -1 : 1);
    });
    const title = owner === "team" ? (admin ? "My Team's Tasks" : "Creator Automations Tasks") : (admin ? "Client's Tasks" : "Your Tasks");
    return <article className="scp-project-card scp-task-panel" key={owner}>
      <div className="scp-panel-heading"><div><span className="scp-label">{owner === "team" ? "CREATOR AUTOMATIONS" : "CLIENT"}</span><h2>{title}</h2></div><span className="scp-task-count">{tasks.filter(t => t.status === "complete").length}/{tasks.length} done</span></div>
      {tasks.length ? <div className="scp-task-list">{tasks.map(t => {
        const done = t.status === "complete";
        const canCheck = demo || admin || owner === "client";
        return <label className={`scp-task ${done ? "is-done" : ""} ${!canCheck ? "is-readonly" : ""}`} key={t.id}>
          <input type="checkbox" checked={done} disabled={!canCheck || busy === "task-" + t.id} onChange={e => checkTask(t.id, e.target.checked)} />
          <span className="scp-task-content"><strong>{t.label}</strong><small>{done ? "Completed" : t.priority === "urgent" ? "Urgent" : "Normal priority"}</small></span>
          {t.priority === "urgent" && !done ? <span className="scp-urgent">URGENT</span> : null}
        </label>;
      })}</div> : <p className="scp-empty">No tasks assigned yet.</p>}
      {!admin && !demo && owner === "team" ? <p className="scp-task-hint">Your team checks these off as work is completed.</p> : null}
    </article>;
  }

  return <main className="scp-page scp-project-workspace">
    <div className="scp-workspace">
      <header className="scp-header"><span className="scp-brand">⚡ CREATOR AUTOMATIONS</span><span>{admin ? "ADMIN PROJECT VIEW" : demo ? "SAMPLE PROJECT · NOT SAVED" : "CLIENT PROJECT"}</span></header>
      <section className="scp-intro"><p className="scp-kicker">PROJECT WORKSPACE</p><h1>{clientName || project.brand_name || project.full_name || "Your project"}</h1><p>One project. Clear responsibilities. Everything in one place.</p></section>
      <section className="scp-project-hero">
        <span className="scp-label">THE PROJECT</span>
        {editingGoal && admin ? <form onSubmit={saveGoal} className="scp-goal-edit"><input autoFocus value={goalText} maxLength={180} onChange={e => setGoalText(e.target.value)} placeholder="e.g. Get the website live on the internet" /><button disabled={busy === "goal" || !goalText.trim()}>Save goal</button><button type="button" className="scp-minor" onClick={() => setEditingGoal(false)}>Cancel</button></form>
          : <div className="scp-goal-line"><h2>{project.project_goal || "Project setup"}</h2>{admin && <button type="button" className="scp-text-link" onClick={() => setEditingGoal(true)}>Edit project</button>}</div>}
        <p className="scp-project-stage">Current stage: {project.current_status || "Planning"}{project.current_phase ? ` · ${project.current_phase}` : ""}</p>
        {!project.tasks?.length && project.next_step ? <p className="scp-project-stage">Previous next step: {project.next_step} · Add it to the appropriate task list below.</p> : null}
      </section>

      <section className="scp-task-columns" aria-label="Project to-do lists">
        {taskBox("team")}{taskBox("client")}
      </section>

      {admin && <form className="scp-add-task" onSubmit={addTask}>
        <label><span>Add a task</span><input value={taskText} onChange={e => setTaskText(e.target.value)} placeholder="e.g. Purchase website hosting" maxLength={255} /></label>
        <label><span>Assigned to</span><select value={taskOwner} onChange={e => setTaskOwner(e.target.value as "team" | "client")}><option value="team">My team</option><option value="client">Client</option></select></label>
        <label><span>Priority</span><select value={taskPriority} onChange={e => setTaskPriority(e.target.value as "normal" | "urgent")}><option value="normal">Normal</option><option value="urgent">Urgent</option></select></label>
        <button disabled={busy === "task" || !taskText.trim()}>Add task</button>
      </form>}

      <section className="scp-project-section scp-conversation">
        <div className="scp-panel-heading"><div><span className="scp-label">PROJECT CONVERSATION</span><h2>Have a question?</h2></div><button type="button" className="scp-refresh-chat" onClick={() => void refreshConversation()}>Refresh chat</button></div>
        <p className="scp-section-note">Write here instead of sending a separate email. {admin ? "Your replies appear in the client's workspace." : demo ? "Try this chat below. Demo messages are never sent." : "When you message us, we also receive an email with your message."}</p>
        <div className="scp-chat-thread" role="log" aria-label="Project messages">{project.messages?.length ? project.messages.map(m => <article key={m.id} className={`scp-chat-bubble ${m.sender_type === "creator" ? "from-client" : "from-team"}`}><b>{m.sender_type === "creator" ? "Client" : "Creator Automations"}</b><p>{m.message_text}</p><small>{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</small></article>) : <p className="scp-empty">Start the project conversation here.</p>}</div>
        <form onSubmit={sendMessage} className="scp-chat-form"><label htmlFor="scp-message">Message</label><textarea id="scp-message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Write a question, update, or feedback…" maxLength={10000} rows={3} /><button disabled={busy === "message" || !message.trim()}>{busy === "message" ? "Sending…" : "Send message"}</button></form>
      </section>

      <section className="scp-project-section scp-attachments">
        <div className="scp-panel-heading"><div><span className="scp-label">PROJECT MATERIALS</span><h2>Files, screenshots & links</h2></div></div>
        <p className="scp-section-note">{demo ? "Try a screenshot or link below. No files are uploaded or stored in this demo." : "Add screenshots, approved photos, PDFs, or a link. Files remain private to this project."}</p>
        <div className="scp-attachment-forms">
          <form onSubmit={uploadFile}><label htmlFor="workspace-file-input">Upload a file (up to 8 MB)</label><input id="workspace-file-input" type="file" accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,.txt" onChange={e => setFile(e.target.files?.[0] || null)} /><button disabled={!file || busy === "file"}>{busy === "file" ? "Uploading…" : "Upload file"}</button></form>
          <form onSubmit={addLink}><label htmlFor="scp-link">Share a link</label><input id="scp-link" type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://…" required /><input value={linkName} onChange={e => setLinkName(e.target.value)} placeholder="Link description (optional)" maxLength={160} /><button disabled={!linkUrl.trim() || busy === "link"}>Add link</button></form>
        </div>
        {project.attachments?.length ? <ul className="scp-attachment-list">{project.attachments.map(a => <li key={a.id}><span>{a.kind === "link" ? "🔗" : "📎"} {a.name}</span>{a.kind === "link" && a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer">Open link</a> : demo ? <span className="scp-demo-file">Sample file</span> : <button type="button" disabled={busy === "download-" + a.id} onClick={() => downloadFile(a.id, a.name)}>Download</button>}</li>)}</ul> : <p className="scp-empty">No materials shared yet.</p>}
        {project.drive_folder_url && /^https:\/\//.test(project.drive_folder_url) ? <p className="scp-drive-link"><a href={project.drive_folder_url} target="_blank" rel="noopener noreferrer">Open shared Google Drive folder</a></p> : null}
      </section>
      {demo && <p className="scp-demo-disclaimer">Interactive demo only. Checkboxes, questions, and attachments are not saved or sent to anyone.</p>}
      {notice && <p className="scp-workspace-notice" role="status">{notice}</p>}
      <footer>One project. Two task lists. Everything moves forward together.</footer>
    </div>
  </main>;
}

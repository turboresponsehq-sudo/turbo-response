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
  attachments?: Array<{ id: number; message_id?: number; kind: "file" | "link"; name: string; url?: string; created_at: string }>;
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
  const [showLink, setShowLink] = useState(false);
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
      const url = admin ? base : "/api/creator/portal/me";
      const response = await fetch(url, { credentials: "include", headers: headers(), cache: "no-store" });
      if (!response.ok) return;
      const body = await response.json();
      const latest = body.portal;
      if (latest) setProject(p => ({
        ...p,
        messages: Array.isArray(latest.messages) ? latest.messages.filter((m: any) => m.visible_to_creator !== false) : p.messages,
        attachments: Array.isArray(latest.attachments) ? latest.attachments : p.attachments,
        tasks: Array.isArray(latest.tasks) ? latest.tasks : p.tasks,
      }));
    } catch { /* Retain the existing conversation on a temporary disconnection. */ }
  }

  useEffect(() => {
    if (demo) return;
    const interval = window.setInterval(() => { void refreshConversation(); }, 25000);
    return () => window.clearInterval(interval);
  }, [base, admin]);

  async function createTextInvite() {
    if (!admin || !leadId || !window.confirm("Create a 24-hour private link? The client must set a password, and any previous login or invitation for this client will be reset.")) return;
    setBusy("invite"); setNotice("");
    try {
      const result = await send("/invite", "POST", { channel: "text" });
      const smsText = String(result.invitationUrl || "");
      try {
        await navigator.clipboard.writeText(smsText);
        setNotice("24-hour invitation copied. Paste it into a text to the correct client.");
      } catch {
        setNotice("Invitation created. Copy the text from the message box.");
      }
      window.prompt("Copy this private invitation to send by SMS. The link expires in 24 hours:", smsText);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not generate an invitation.");
    } finally { setBusy(""); }
  }

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
    const text = message.trim();
    const attachmentFile = file;
    const attachedLink = linkUrl.trim();
    if (!text && !attachmentFile && !attachedLink) return;
    if (attachmentFile && attachedLink) { setNotice("Choose either a file or a link for this message."); return; }
    setBusy("message"); setNotice("");
    try {
      let attachment: NonNullable<CreatorWorkspaceData["attachments"]>[number] | undefined;
      if (attachmentFile) {
        if (attachmentFile.size > 8 * 1024 * 1024) throw new Error("Choose a file smaller than 8 MB.");
        if (demo) {
          attachment = { id: -Date.now(), kind: "file", name: attachmentFile.name, created_at: new Date().toISOString() };
        } else {
          const form = new FormData();
          form.append("file", attachmentFile);
          attachment = (await send("/attachments/file", "POST", form, true)).attachment;
        }
      } else if (attachedLink) {
        const parsed = new URL(attachedLink);
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Please use an http or https link.");
        attachment = demo
          ? { id: -Date.now(), kind: "link", url: attachedLink, name: linkName.trim() || attachedLink, created_at: new Date().toISOString() }
          : (await send("/attachments/link", "POST", { name: linkName.trim() || attachedLink, url: attachedLink })).attachment;
      }
      const textToSend = text || (attachment ? "Shared " + attachment.name : "");
      let savedMessage: NonNullable<CreatorWorkspaceData["messages"]>[number];
      let emailSent: boolean | undefined;
      if (demo) {
        savedMessage = { id: -Date.now(), sender_type: "creator", message_text: textToSend, created_at: new Date().toISOString() };
      } else {
        const result = await send("/messages", "POST", {
          text: textToSend, ...(admin ? { visibleToCreator: true } : {}),
          ...(attachment ? { attachmentId: attachment.id } : {}),
        });
        savedMessage = result.message;
        emailSent = result.emailSent;
      }
      const linkedAttachment = attachment ? { ...attachment, message_id: savedMessage.id } : undefined;
      setProject(p => ({
        ...p,
        messages: [...(p.messages || []), savedMessage],
        attachments: linkedAttachment ? [linkedAttachment, ...(p.attachments || [])] : p.attachments,
      }));
      setMessage(""); setFile(null); setLinkUrl(""); setLinkName(""); setShowLink(false);
      const chooser = document.getElementById("workspace-file-input") as HTMLInputElement | null;
      if (chooser) chooser.value = "";
      setNotice(demo ? "Added to the demo chat only. Nothing was sent or saved."
        : admin ? "Message added to the client's project."
        : emailSent ? "Sent. Your team was notified by email."
        : "Saved in the project. Email delivery was not confirmed.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not send your message.");
      // If an upload succeeded but a message failed, the uploaded file stays
      // securely in project storage; it can be recovered via Shared files.
      if (!demo) await refreshConversation();
    } finally { setBusy(""); }
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
      <header className="scp-header"><span className="scp-brand">⚡ CREATOR AUTOMATIONS</span><div className="scp-header-actions">{admin && <button type="button" className="scp-text-invite" disabled={busy === "invite"} onClick={createTextInvite}>{busy === "invite" ? "Creating link…" : "Create text invite · 24h"}</button>}<span>{admin ? "ADMIN PROJECT VIEW" : demo ? "SAMPLE PROJECT · NOT SAVED" : "CLIENT PROJECT"}</span></div></header>
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
        <div className="scp-panel-heading"><div><span className="scp-label">PROJECT CHAT</span><h2>Messages & attachments</h2></div><button type="button" className="scp-refresh-chat" onClick={() => void refreshConversation()} disabled={demo}>Refresh</button></div>
        <p className="scp-section-note">{demo ? "Try writing a question or attaching a sample file. Nothing is sent in this demo." : admin ? "Reply here. The client can read this on their project page." : "Write your question or attach a screenshot. Your team receives an email with your message."}</p>
        <div className="scp-chat-thread" role="log" aria-label="Project messages">
          {project.messages?.length ? project.messages.map(m => {
            const attached = (project.attachments || []).filter(a => a.message_id === m.id);
            return <article key={m.id} className={`scp-chat-bubble ${m.sender_type === "creator" ? "from-client" : "from-team"}`}>
              <b>{m.sender_type === "creator" ? "Client" : "Creator Automations"}</b>
              <p>{m.message_text}</p>
              {attached.map(a => <div className="scp-chat-attachment" key={a.id}>
                <span>{a.kind === "file" ? "📎" : "🔗"} {a.name}</span>
                {a.kind === "link" && a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer">Open link</a>
                  : demo ? <small>Sample file</small> : <button type="button" onClick={() => downloadFile(a.id, a.name)}>Download</button>}
              </div>)}
              <small>{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</small>
            </article>;
          }) : <p className="scp-empty">No messages yet. Start the conversation below.</p>}
        </div>
        <form onSubmit={sendMessage} className="scp-chat-form">
          <label htmlFor="scp-message">Ask a question or describe what you are sending</label>
          <textarea id="scp-message" value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Example: Here is the logo you asked for…" maxLength={10000} rows={3} />
          <div className="scp-chat-toolbar">
            <label className="scp-attach-button" htmlFor="workspace-file-input">📎 Attach screenshot or file</label>
            <input id="workspace-file-input" className="scp-hidden-file" type="file"
              accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,.txt"
              onChange={e => { setFile(e.target.files?.[0] || null); if (e.target.files?.[0]) { setLinkUrl(""); setShowLink(false); } }} />
            <button type="button" className="scp-link-toggle" onClick={() => { setShowLink(v => !v); setFile(null); }}>🔗 Add link</button>
            <button type="submit" className="scp-chat-send" disabled={busy === "message" || (!message.trim() && !file && !linkUrl.trim())}>{busy === "message" ? "Sending…" : "Send"}</button>
          </div>
          {file && <div className="scp-selected-attachment"><span>📎 {file.name}</span><button type="button" onClick={() => { setFile(null); const chooser = document.getElementById("workspace-file-input") as HTMLInputElement | null; if (chooser) chooser.value = ""; }}>Remove</button></div>}
          {showLink && <div className="scp-inline-link"><input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="Paste the website link here" /><input value={linkName} onChange={e => setLinkName(e.target.value)} placeholder="What is this link? (optional)" maxLength={160} /></div>}
        </form>
        {(project.attachments || []).length > 0 && <details className="scp-shared-files">
          <summary>Shared files & links ({project.attachments?.length})</summary>
          <ul className="scp-attachment-list">{(project.attachments || []).map(a => <li key={a.id}>
            <span>{a.kind === "file" ? "📎" : "🔗"} {a.name}</span>
            {a.kind === "link" && a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer">Open link</a>
              : demo ? <span>Sample file</span> : <button type="button" onClick={() => downloadFile(a.id, a.name)}>Download</button>}
          </li>)}</ul>
        </details>}
        {project.drive_folder_url && /^https:\/\//.test(project.drive_folder_url) && <p className="scp-drive-link"><a href={project.drive_folder_url} target="_blank" rel="noopener noreferrer">Shared Google Drive folder</a></p>}
      </section>
      {demo && <p className="scp-demo-disclaimer">Interactive demo only. Checkboxes, questions, and attachments are not saved or sent to anyone.</p>}
      {notice && <p className="scp-workspace-notice" role="status">{notice}</p>}
      <footer>One project. Two task lists. Everything moves forward together.</footer>
    </div>
  </main>;
}

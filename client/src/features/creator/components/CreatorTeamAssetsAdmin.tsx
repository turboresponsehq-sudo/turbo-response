import { useEffect, useState } from "react";
import { getAdminSessionAuthorizationHeader } from "@/lib/adminSession";

export default function CreatorTeamAssetsAdmin({ leadId }: { leadId: number }) {
  const [calendar, setCalendar] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const root = "/api/creator/admin/leads/" + leadId + "/portal";
  const call = async (path: string, options?: RequestInit) => {
    const response = await fetch(root + path, {
      ...options,
      headers: {
        ...getAdminSessionAuthorizationHeader(),
        ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(options?.headers || {}),
      },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to update workspace.");
    return result;
  };
  async function refresh() {
    const [content, discussion] = await Promise.all([
      call("/team-content"), call("/messages"),
    ]);
    setCalendar(content.calendar || []);
    setFiles(content.files || []);
    setMessages((discussion.messages || []).filter((m: any) => m.visible_to_creator));
    setReady(true);
  }
  useEffect(() => {
    setReady(false); setStatus("");
    refresh().catch(() => setStatus("Team content is unavailable until the workspace is activated."));
  }, [leadId]);
  async function postMessage(event: React.FormEvent) {
    event.preventDefault(); if (!message.trim()) return;
    setBusy(true); setStatus("");
    try {
      await call("/messages", { method: "POST", body: JSON.stringify({ text: message, visibleToCreator: true }) });
      setMessage(""); await refresh(); setStatus("Message posted.");
    } catch(e) { setStatus(e instanceof Error ? e.message : "Unable to post."); }
    finally { setBusy(false); }
  }
  async function addEvent(event: React.FormEvent) {
    event.preventDefault(); if (!title || !startsAt || !endsAt) return;
    setBusy(true); setStatus("");
    try {
      await call("/team-calendar", { method: "POST", body: JSON.stringify({
        title, description, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString(),
      }) });
      setTitle(""); setStartsAt(""); setEndsAt(""); setDescription("");
      await refresh(); setStatus("Project event added.");
    } catch(e) { setStatus(e instanceof Error ? e.message : "Unable to add event."); }
    finally { setBusy(false); }
  }
  async function addFile(event: React.FormEvent) {
    event.preventDefault(); if (!file) return;
    setBusy(true); setStatus("");
    try {
      const form = new FormData(); form.append("file", file);
      await call("/team-files", { method: "POST", body: form });
      setFile(null); await refresh(); setStatus("File shared with the team.");
    } catch(e) { setStatus(e instanceof Error ? e.message : "Unable to upload file."); }
    finally { setBusy(false); }
  }
  async function openFile(id: number) {
    try { const result = await call("/team-files/" + id); window.open(result.url, "_blank", "noopener,noreferrer"); }
    catch(e) { setStatus(e instanceof Error ? e.message : "Unable to open file."); }
  }
  return <section className="creator-detail-section" aria-label="Shared team project workspace">
    <h3>Shared team project workspace</h3>
    <p className="creator-task-safety">Approved team members can see shared messages, calendar events and files.</p>
    {!ready ? <p className="creator-task-safety">Team content is unavailable until the secure portal is activated.</p> : <>
      <h4>Messages and decisions</h4>
      <div className="creator-mini-list">{messages.length ? messages.map(m =>
        <p key={m.id}><b>{m.sender_name || (m.sender_type === "admin" ? "Creator Automations" : "Team")}</b>
          {" · "}{m.message_text}</p>) : <p>No messages yet.</p>}</div>
      <form className="creator-task-template-form" onSubmit={postMessage}>
        <label>Post a team message<textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={5000}/></label>
        <button disabled={busy || !message.trim()}>Post to workspace</button>
      </form>
      <h4>Shared project calendar</h4>
      <div className="creator-mini-list">{calendar.length ? calendar.map(x =>
        <p key={x.id}><b>{x.title}</b> · {new Date(x.starts_at).toLocaleString()}</p>) : <p>No project events yet.</p>}</div>
      <form className="creator-task-template-form" onSubmit={addEvent}>
        <label>Event<input required value={title} onChange={e => setTitle(e.target.value)} /></label>
        <div className="creator-task-fields">
          <label>Start<input type="datetime-local" required value={startsAt} onChange={e => setStartsAt(e.target.value)}/></label>
          <label>End<input type="datetime-local" required value={endsAt} onChange={e => setEndsAt(e.target.value)}/></label>
        </div>
        <label>Details<input value={description} onChange={e => setDescription(e.target.value)}/></label>
        <button disabled={busy}>Add shared event</button>
      </form>
      <h4>Project files</h4>
      <div className="creator-mini-list">{files.length ? files.map(x =>
        <p key={x.id}><button type="button" className="creator-secondary-button" onClick={() => openFile(x.id)}>
          {x.file_name}</button> · {x.uploaded_by}</p>) : <p>No shared files yet.</p>}</div>
      <form className="creator-task-template-form" onSubmit={addFile}>
        <label>Upload a project file (15 MB max)<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
          onChange={e => setFile(e.target.files?.[0] || null)} /></label>
        <button disabled={busy || !file}>Upload for team</button>
      </form>
    </>}
    {status && <p role="status" className="creator-task-safety">{status}</p>}
  </section>;
}

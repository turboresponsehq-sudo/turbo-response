import { useEffect, useState } from "react";
import "../styles/creator-team-portal.css";

type Screen = "join" | "verify" | "login" | "home";
const api = async (path: string, options?: RequestInit) => {
  const r = await fetch("/api/creator/portal/team/" + path, {
    credentials: "include",
    ...options,
    headers: { ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(options?.headers || {}) },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Please try again.");
  return data;
};
const go = (url: string) => { window.location.assign(url); };
const message = (e: unknown) => e instanceof Error ? e.message : "Something went wrong.";

function TeamHeader({ subtitle }: { subtitle: string }) {
  return <header className="ctp-header"><span>CREATOR <b>AUTOMATIONS</b></span><small>PRIVATE CLIENT WORKSPACE</small><h1>{subtitle}</h1></header>;
}
export default function CreatorTeamPortal({ screen }: { screen: Screen }) {
  const invite = new URLSearchParams(window.location.search).get("invite") || "";
  const verify = new URLSearchParams(window.location.search).get("token") || "";
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [passcode,setPasscode] = useState("");
  const [feedback,setFeedback] = useState("");
  const [busy,setBusy] = useState(false);
  const [workspace,setWorkspace] = useState<any>(null);
  const [text,setText] = useState("");
  const [title,setTitle] = useState("");
  const [startsAt,setStartsAt] = useState("");
  const [endsAt,setEndsAt] = useState("");
  const [eventDescription,setEventDescription] = useState("");
  const [file,setFile] = useState<File | null>(null);

  async function refresh() {
    const data = await api("me");
    setWorkspace(data);
    return data;
  }
  useEffect(() => {
    if(screen === "verify" && verify) {
      api("verify",{method:"POST",body:JSON.stringify({token:verify})})
        .then(d=>setFeedback(d.message))
        .catch(e=>setFeedback(message(e)));
    } else if (screen === "home") {
      refresh().catch(()=>go("/creator/portal/login"));
    }
  },[screen]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();setBusy(true);setFeedback("");
    try {
      if(screen === "join") {
        const d = await api("request",{method:"POST",body:JSON.stringify({invite,name,email,passcode})});
        setPasscode("");setFeedback(d.message);
      } else if(screen === "login") {
        await api("login",{method:"POST",body:JSON.stringify({email,passcode})});
        setPasscode("");go("/creator/portal/team");
      }
    }catch(e){setFeedback(message(e));}finally{setBusy(false);}
  }
  async function postMessage(e: React.FormEvent) {
    e.preventDefault();if(!text.trim())return;
    setBusy(true);setFeedback("");
    try{await api("messages",{method:"POST",body:JSON.stringify({text})});setText("");await refresh();}
    catch(e){setFeedback(message(e));}finally{setBusy(false);}
  }
  async function postEvent(e: React.FormEvent) {
    e.preventDefault();if(!title||!startsAt||!endsAt)return;
    setBusy(true);setFeedback("");
    try {
      await api("calendar",{method:"POST",body:JSON.stringify({
        title, startsAt:new Date(startsAt).toISOString(),endsAt:new Date(endsAt).toISOString(),description:eventDescription
      })});
      setTitle("");setStartsAt("");setEndsAt("");setEventDescription("");await refresh();
    }catch(e){setFeedback(message(e));}finally{setBusy(false);}
  }
  async function uploadFile(e: React.FormEvent) {
    e.preventDefault();if(!file)return;
    setBusy(true);setFeedback("");
    try {
      const body = new FormData();body.append("file",file);
      await api("files",{method:"POST",body});
      setFile(null);await refresh();
    }catch(e){setFeedback(message(e));}finally{setBusy(false);}
  }
  async function openFile(id:number){
    try { const { url } = await api("files/"+id); window.open(url,"_blank","noopener,noreferrer"); }
    catch(e){setFeedback(message(e));}
  }

  if(screen==="join") return <main className="ctp-shell">
    <TeamHeader subtitle="Request access" />
    <section className="ctp-card">
      <p>This link lets you request access to a private client project. Each person must verify their email and be approved by Creator Automations before entering.</p>
      {!invite ? <p className="ctp-error">Request a current invitation link from the project owner.</p> :
      <form onSubmit={submit} className="ctp-form">
        <label>Full name<input required maxLength={150} value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label>
        <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
        <label>Create your private login code<input required type="password" minLength={12} maxLength={128} value={passcode} onChange={e=>setPasscode(e.target.value)} autoComplete="new-password" placeholder="At least 12 characters"/></label>
        <p className="ctp-hint">Keep this code private. Don't send passwords in the group text.</p>
        <button disabled={busy}>{busy?"Submitting…":"Request access"}</button>
      </form>}
      {feedback && <p role="status" className="ctp-status">{feedback}</p>}
      <a href="/creator/portal/login">Already approved? Log in</a>
    </section></main>;

  if(screen==="verify") return <main className="ctp-shell"><TeamHeader subtitle="Email verification" />
    <section className="ctp-card"><p role="status">{feedback||"Checking your verification link…"}</p>
    <a href="/creator/portal/login">Go to login</a></section></main>;

  if(screen==="login") return <main className="ctp-shell"><TeamHeader subtitle="Team login" />
    <section className="ctp-card"><p>Only approved collaborators can open the project workspace.</p>
    <form className="ctp-form" onSubmit={submit}>
      <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
      <label>Your private code<input required type="password" value={passcode} onChange={e=>setPasscode(e.target.value)} autoComplete="current-password"/></label>
      <button disabled={busy}>{busy?"Checking…":"Log in"}</button>
    </form>{feedback && <p role="alert" className="ctp-error">{feedback}</p>}</section></main>;

  return <main className="ctp-shell ctp-workspace">
    <TeamHeader subtitle={workspace?.portal?.brand_name || "Your project"} />
    {!workspace ? <p className="ctp-loading">Loading your private workspace…</p> : <>
      <div className="ctp-user"><span>Welcome, {workspace.member.name}</span>
        <button type="button" className="ctp-quiet" onClick={async()=>{await api("logout",{method:"POST"});go("/creator/portal/login");}}>Log out</button></div>
      <section className="ctp-grid">
        <article className="ctp-card"><h2>Project status</h2><strong>{workspace.portal.current_status}</strong>
          <p>{workspace.portal.current_phase}</p><h3>Next step</h3><p>{workspace.portal.next_step || "Awaiting an update from Creator Automations."}</p></article>
        <article className="ctp-card"><h2>Action items & updates</h2>
          {workspace.items.length===0 && workspace.updates.length===0 && <p>No action items yet.</p>}
          {workspace.items.map((x:any)=><p key={"item"+x.id}>☐ {x.label} <small>({x.status})</small></p>)}
          {workspace.updates.map((x:any)=><p key={"update"+x.id}>{x.update_text}</p>)}</article>
      </section>
      <section className="ctp-card"><h2>Team conversation</h2>
        <div className="ctp-thread">{workspace.messages.length===0 ? <p>No messages yet. Start the conversation below.</p>
          :workspace.messages.map((m:any)=><div key={m.id}><small>{m.sender_name} · {new Date(m.created_at).toLocaleDateString()}</small><p>{m.message_text}</p></div>)}</div>
        <form className="ctp-form" onSubmit={postMessage}><label>Write a project message
          <textarea required maxLength={5000} value={text} onChange={e=>setText(e.target.value)} /></label>
          <button disabled={busy||!text.trim()}>Post message</button></form>
      </section>
      <section className="ctp-grid">
        <article className="ctp-card"><h2>Project calendar</h2>
          {workspace.calendar.length===0 && <p>No upcoming project dates yet.</p>}
          {workspace.calendar.map((x:any)=><div className="ctp-event" key={x.id}><b>{x.title}</b>
            <small>{new Date(x.starts_at).toLocaleString()} · {x.created_by}</small>
            <p>{x.description}</p></div>)}
          <h3>Add an event</h3><form className="ctp-form" onSubmit={postEvent}>
            <label>Event title<input required value={title} onChange={e=>setTitle(e.target.value)}/></label>
            <label>Start<input required type="datetime-local" value={startsAt} onChange={e=>setStartsAt(e.target.value)}/></label>
            <label>End<input required type="datetime-local" value={endsAt} onChange={e=>setEndsAt(e.target.value)}/></label>
            <label>Details<input value={eventDescription} onChange={e=>setEventDescription(e.target.value)}/></label>
            <button disabled={busy}>Add to project calendar</button></form></article>
        <article className="ctp-card"><h2>Shared files</h2>
          {workspace.files.length===0 && <p>No files uploaded yet.</p>}
          {workspace.files.map((x:any)=><p key={x.id}><button className="ctp-file-link" type="button" onClick={()=>openFile(x.id)}>{x.file_name}</button><br/>
            <small>Shared by {x.uploaded_by}</small></p>)}
          <form className="ctp-form" onSubmit={uploadFile}>
            <label>Upload image, PDF or Word (15 MB max)
              <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
            <button disabled={busy||!file}>Upload file</button></form>
          {workspace.portal.drive_folder_url && <p><a href={workspace.portal.drive_folder_url} target="_blank" rel="noreferrer">Open project Drive folder</a></p>}
        </article>
      </section>
      {feedback && <p className="ctp-status" role="status">{feedback}</p>}
    </>}
  </main>;
}

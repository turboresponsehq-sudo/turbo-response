import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import "../styles/creator.css";
import "../styles/creator-portal-preview.css";

type PortalStatus = "disabled" | "invited" | "active";

const mockLead = {
  fullName: "Amani Mansur",
  brandName: "Amani Mansur",
  email: "amani@example.com",
  creatorType: "Artist / Creator",
  services: ["Creator Website", "Automation & AI Systems"],
  status: "Discovery scheduled",
  nextStep: "Confirm your goals, brand assets, and preferred launch window.",
  requestedItems: ["Logo or brand mark", "Social links", "Current website or profile links", "Primary project goal"],
  updates: [
    { date: "Oct 20, 2026", text: "Your intake was received and is ready for review." },
    { date: "Next step", text: "Zakhy will review your goals and prepare the first project direction." },
  ],
};

function makePreviewLink() {
  // Preview-only opaque token. Production will use a server-generated, expiring token.
  const token = "cpv_demo_7f3a9b2c";
  return `${window.location.origin}/creator/portal/preview?invite=${token}`;
}

export default function CreatorPortalPreview({ view = "admin" }: { view?: "admin" | "portal" }) {
  const [portalStatus, setPortalStatus] = useState<PortalStatus>("disabled");
  const [notice, setNotice] = useState("");
  const portalLink = useMemo(makePreviewLink, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(portalLink);
      setNotice("Preview portal link copied");
    } catch {
      setNotice("Copy is unavailable in this browser. Use the visible preview link.");
    }
  };

  if (view === "portal") {
    return <CreatorPortalScreen />;
  }

  const enablePortal = () => {
    setPortalStatus("invited");
    setNotice("Portal enabled in preview. Invitation is ready to send.");
  };

  const revokePortal = () => {
    setPortalStatus("disabled");
    setNotice("Portal access revoked in preview.");
  };

  const sendInvitation = () => {
    if (portalStatus === "disabled") {
      setNotice("Enable portal access before sending an invitation.");
      return;
    }
    setPortalStatus("invited");
    setNotice("Invitation marked ready for manual send in preview.");
  };

  return (
    <main className="creator-admin-shell creator-portal-preview-shell">
      <header className="creator-admin-header creator-portal-preview-header">
        <div>
          <p className="creator-eyebrow">ZAKHY BUILDS AI · LOCAL PREVIEW</p>
          <h1>Creator Portal Access</h1>
          <p className="creator-portal-preview-subtitle">A separate creator workspace — not the legacy consumer case portal.</p>
        </div>
        <Link href="/creator/portal/preview" className="creator-back">Open creator view →</Link>
      </header>

      {notice && <div className="creator-portal-notice" role="status">{notice}</div>}

      <section className="creator-portal-admin-card">
        <div className="creator-portal-admin-topline">
          <div>
            <p className="creator-eyebrow">CREATOR LEAD · PREVIEW RECORD</p>
            <h2>{mockLead.brandName}</h2>
            <p>{mockLead.fullName} · {mockLead.email}</p>
          </div>
          <span className={`creator-portal-status ${portalStatus}`}>{portalStatus}</span>
        </div>

        <div className="creator-portal-admin-grid">
          <article><span>Requested services</span><strong>{mockLead.services.join(" + ")}</strong></article>
          <article><span>Lead status</span><strong>{mockLead.status}</strong></article>
          <article><span>Portal status</span><strong>{portalStatus === "disabled" ? "Disabled" : portalStatus === "invited" ? "Invited" : "Active"}</strong></article>
        </div>

        <section className="creator-portal-access-panel">
          <div>
            <p className="creator-eyebrow">ACCESS CONTROL</p>
            <h3>Keep access intentional</h3>
            <p>Enable or revoke this creator’s separate portal. Invitations remain manual in V1.</p>
          </div>
          <div className="creator-portal-actions">
            {portalStatus === "disabled" ? <button className="creator-button" onClick={enablePortal}>Enable Portal Access</button> : <button className="creator-button creator-button-secondary" onClick={revokePortal}>Revoke Portal Access</button>}
            <button className="creator-button creator-button-dark" onClick={sendInvitation}>Send Invitation</button>
            <button className="creator-button creator-button-outline" onClick={copyLink}>Copy Portal Link</button>
          </div>
        </section>

        <div className="creator-portal-link-preview">
          <span>Opaque preview invitation link</span>
          <code>{portalLink}</code>
          <small>Production will use a server-generated, expiring token. Creator Lead IDs will not appear in the URL.</small>
        </div>
      </section>

      <section className="creator-portal-design-notes">
        <div><span>V1 boundary</span><strong>No payments, contracts, analytics, or full messaging.</strong></div>
        <div><span>Data boundary</span><strong>Separate creator portal records; no consumer case reuse.</strong></div>
        <div><span>Access model</span><strong>Invite → secure token login → creator workspace.</strong></div>
      </section>
    </main>
  );
}

function CreatorPortalScreen() {
  const [, setLocation] = useLocation();
  const [portal, setPortal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageNotice, setMessageNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = new URLSearchParams(window.location.search).get("token") || new URLSearchParams(window.location.search).get("invite");
        if (token) {
          // Remove the secret from the address bar before issuing any API requests.
          window.history.replaceState({}, "", "/creator/portal");
          const accepted = await fetch("/api/creator/portal/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }), credentials: "include", cache: "no-store" });
          if (!accepted.ok) throw new Error((await accepted.json()).error || "This invitation is invalid, expired, or already used.");
        }
        const response = await fetch("/api/creator/portal/me", { credentials: "include" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Creator Portal access is required.");
        if (!cancelled) setPortal(body.portal);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load Creator Portal.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const logout = async () => {
    await fetch("/api/creator/portal/logout", { method: "POST", credentials: "include" });
    setLocation("/creator/portal/login");
  };

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    const response = await fetch("/api/creator/portal/messages", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ text }) });
    const body = await response.json();
    if (!response.ok) { setMessageNotice(body.error || "Unable to save your message."); return; }
    setPortal((current: any) => ({ ...current, messages: [...(current.messages || []), body.message] }));
    setMessage("");
    setMessageNotice("Your message was saved to the project record.");
  };

  if (loading) return <main className="creator-portal-screen"><section className="creator-portal-welcome"><p className="creator-eyebrow">ZAKHY BUILDS AI</p><h1>Loading your workspace.</h1><p>Preparing your private Creator Portal.</p></section></main>;
  if (error || !portal) return <main className="creator-portal-screen"><section className="creator-portal-support"><div><p className="creator-eyebrow">PRIVATE CREATOR PORTAL</p><h2>Use your invitation to open your project.</h2><p>This workspace requires a private invitation. Invitation links can be used once; if yours is expired or already used, request a fresh link.</p></div><Link className="creator-button" href="/creator/portal/login">Enter invitation</Link></section></main>;

  return (
    <main className="creator-portal-screen">
      <header className="creator-portal-screen-header"><Link href="/zakhybuildsai" className="creator-brand">ZAKHY <span>BUILDS AI</span></Link><div className="creator-portal-header-actions"><span className="creator-portal-chip">CREATOR PORTAL · V1</span><button className="creator-portal-logout" onClick={logout}>Log out</button></div></header>
      <section className="creator-portal-welcome"><p className="creator-eyebrow">WELCOME BACK, {String(portal.full_name || "CREATOR").split(" ")[0].toUpperCase()}</p><h1>Your project home.</h1><p>Your private workspace for clear next steps, requested materials, project updates, and shared files.</p></section>
      <section className="creator-portal-card-grid"><article className="creator-portal-card creator-portal-card-wide"><span>YOUR BRAND</span><h2>{portal.brand_name || portal.full_name}</h2><p>{portal.creator_type}</p><div className="creator-portal-service-pills">{portal.package_interest && <b>{portal.package_interest}</b>}<b>Creator project</b></div></article><article className="creator-portal-card"><span>CURRENT STATUS</span><h3>{portal.current_status}</h3><p>Current phase: {portal.current_phase}</p></article><article className="creator-portal-card"><span>NEXT STEP</span><h3>Keep moving forward</h3><p>{portal.next_step || "Zakhy will update your next step here."}</p></article></section>
      <section className="creator-portal-content-grid"><article className="creator-portal-card"><span>ITEMS WE NEED FROM YOU</span>{portal.items?.length ? <ul>{portal.items.map((item: any) => <li key={item.id}>{item.label} <small>{item.status}</small></li>)}</ul> : <p>No requested items yet.</p>}</article><article className="creator-portal-card"><span>PROJECT UPDATES</span>{portal.updates?.length ? <div className="creator-portal-updates">{portal.updates.map((update: any) => <div key={update.id}><b>{new Date(update.created_at).toLocaleDateString()}</b><p>{update.update_text}</p></div>)}</div> : <p>No creator-visible updates yet.</p>}</article></section>
      <section className="creator-portal-card creator-portal-message-card"><div className="creator-portal-message-card-head"><div><span>PROJECT RECORD</span><h2>Messages & important decisions</h2></div><small>Creator-visible</small></div><div className="creator-portal-thread">{portal.messages?.length ? portal.messages.map((item: any) => <article className={`creator-portal-message ${item.sender_type === "creator" ? "from-creator" : "from-zakhy"}`} key={item.id}><div className="creator-portal-message-meta"><strong>{item.sender_type === "creator" ? "You" : "Zakhy Builds AI"}</strong><span>{new Date(item.created_at).toLocaleString()}</span></div><p>{item.message_text}</p></article>) : <p>No messages yet.</p>}</div><form className="creator-portal-message-form" onSubmit={sendMessage}><label>Reply to Zakhy<textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask a question or share an update…" /></label><button className="creator-button" type="submit">Save message</button>{messageNotice && <small role="status">{messageNotice}</small>}</form></section>
      <section className="creator-portal-support"><div><p className="creator-eyebrow">SHARED FILES</p><h2>Everything for your project, in one place.</h2><p>Your Zakhy team will add approved files to your dedicated Google Drive folder.</p></div>{portal.drive_folder_url ? <a className="creator-button" href={portal.drive_folder_url} target="_blank" rel="noreferrer">Open shared files</a> : <span className="creator-portal-muted-action">Shared files folder coming soon</span>}</section>
      <section className="creator-portal-support"><div><p className="creator-eyebrow">NEED HELP?</p><h2>Have a question about your project?</h2><p>Contact the Zakhy team and we’ll help with the next step.</p></div><a className="creator-button" href="mailto:turboresponsehq@gmail.com?subject=Creator%20Portal%20Support">Contact Support</a></section>
    </main>
  );
}

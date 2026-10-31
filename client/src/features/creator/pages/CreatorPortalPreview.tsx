import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import "../styles/creator.css";
import "../styles/creator-portal-preview.css";
import CreatorWorkspace from "../components/CreatorWorkspace";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token") || params.get("invite");
        if (token) {
          window.history.replaceState({}, "", "/creator/portal");
          const response = await fetch("/api/creator/portal/accept", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }), credentials: "include", cache: "no-store",
          });
          if (!response.ok) throw new Error("Invitation expired or already used. Please request a new one.");
        }
        const response = await fetch("/api/creator/portal/me", { credentials: "include", cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Client sign-in required");
        if (active) setPortal(body.portal);
      } catch (e) { if (active) setError(e instanceof Error ? e.message : "Could not open workspace"); }
      finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, []);
  async function logout() {
    await fetch("/api/creator/portal/logout", { method: "POST", credentials: "include" });
    setLocation("/creator/portal/login");
  }
  if (loading) return <main className="scp-loading">Opening your private project…</main>;
  if (error || !portal) return <main className="creator-portal-screen"><section className="creator-portal-support"><div><p className="creator-eyebrow">PRIVATE CLIENT PROJECT</p><h2>Sign in with your invitation.</h2><p>{error || "Your private invitation is required."}</p></div><Link className="creator-button" href="/creator/portal/login">Enter invitation</Link></section></main>;
  return <>
    <div className="scp-client-top"><span>PRIVATE CLIENT WORKSPACE</span><button type="button" onClick={logout}>Log out</button></div>
    <CreatorWorkspace initial={portal} mode="client" />
  </>;
}

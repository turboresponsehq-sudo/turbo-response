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
  const [inviteToken, setInviteToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || params.get("invite") || "";
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [working, setWorking] = useState(false);
  const [portal, setPortal] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // Remove the secret from the browser address bar before any network request.
    if (inviteToken) {
      window.history.replaceState({}, "", "/creator/portal/invite");
      setLoading(false);
      return;
    }
    async function loadSession() {
      try {
        const response = await fetch("/api/creator/portal/me", { credentials: "include", cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Sign in to your workspace.");
        if (active) setPortal(body.portal);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Sign in to your workspace.");
      } finally { if (active) setLoading(false); }
    }
    void loadSession();
    return () => { active = false; };
  }, []);

  async function setUpPassword(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8 || password !== confirmPassword) {
      setError("Use at least 8 characters and make sure both passwords match.");
      return;
    }
    setWorking(true); setError("");
    try {
      const response = await fetch("/api/creator/portal/auth/claim", {
        method: "POST", credentials: "include", cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: inviteToken, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to create password.");
      setPassword(""); setConfirmPassword(""); setInviteToken("");
      window.history.replaceState({}, "", "/creator/portal");
      const workspaceResponse = await fetch("/api/creator/portal/me", { credentials: "include", cache: "no-store" });
      const workspaceBody = await workspaceResponse.json();
      if (!workspaceResponse.ok) throw new Error("Password created. Please sign in using your email and password.");
      setPortal(workspaceBody.portal);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create password.");
    } finally { setWorking(false); }
  }

  async function logout() {
    await fetch("/api/creator/portal/logout", { method: "POST", credentials: "include" });
    setLocation("/creator/portal/login");
  }

  if (loading) return <main className="scp-loading">Opening your private project…</main>;
  if (inviteToken) return <main className="cap-shell cap-client-setup">
    <section className="cap-login-panel">
      <p className="cap-eyebrow">FIRST-TIME PROJECT ACCESS</p>
      <h1>Create your password.</h1>
      <p>This private invitation works one time and expires after 24 hours. Choose a password of at least 8 characters. You'll use your project email and this password whenever you return.</p>
      <form onSubmit={setUpPassword} className="cap-access-form">
        <label htmlFor="creator-new-password">Create password</label>
        <input id="creator-new-password" type="password" value={password}
          onChange={event => setPassword(event.target.value)}
          autoComplete="new-password" minLength={8} maxLength={72} required />
        <label htmlFor="creator-confirm-password">Confirm password</label>
        <input id="creator-confirm-password" type="password" value={confirmPassword}
          onChange={event => setConfirmPassword(event.target.value)}
          autoComplete="new-password" minLength={8} maxLength={72} required />
        {error && <p className="cap-error" role="alert">{error}</p>}
        <button type="submit" disabled={working}>{working ? "Creating password…" : "Create password and open project"}</button>
      </form>
      <p className="cap-footnote">Already set up your password? <Link href="/creator/portal/login">Sign in here</Link>.</p>
      <p className="cap-footnote">Only use this invitation if it was sent to you directly by Creator Automations.</p>
    </section>
  </main>;
  if (error || !portal) return <main className="creator-portal-screen"><section className="creator-portal-support"><div>
    <p className="creator-eyebrow">PRIVATE CLIENT PROJECT</p>
    <h2>Sign in to your workspace.</h2>
    <p>{error || "Enter the email and password for your project."}</p>
  </div><Link className="creator-button" href="/creator/portal/login">Sign in</Link></section></main>;
  return <>
    <div className="scp-client-top"><span>PRIVATE CLIENT WORKSPACE</span><button type="button" onClick={logout}>Log out</button></div>
    <CreatorWorkspace initial={portal} mode="client" />
  </>;
}

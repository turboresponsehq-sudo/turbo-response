import { useMemo, useState } from "react";
import { Link } from "wouter";
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
  return (
    <main className="creator-portal-screen">
      <header className="creator-portal-screen-header">
        <Link href="/admin/creator/portal-preview" className="creator-brand">ZAKHY <span>BUILDS AI</span></Link>
        <span className="creator-portal-chip">CREATOR PORTAL · V1</span>
      </header>

      <section className="creator-portal-welcome">
        <p className="creator-eyebrow">WELCOME BACK, AMANI</p>
        <h1>Build what’s next.</h1>
        <p>Your private project home for clear next steps, requested materials, and progress updates.</p>
      </section>

      <section className="creator-portal-card-grid">
        <article className="creator-portal-card creator-portal-card-wide"><span>YOUR BRAND</span><h2>{mockLead.brandName}</h2><p>{mockLead.creatorType}</p><div className="creator-portal-service-pills">{mockLead.services.map((service) => <b key={service}>{service}</b>)}</div></article>
        <article className="creator-portal-card"><span>CURRENT STATUS</span><h3>{mockLead.status}</h3><p>We’re organizing the first project direction.</p></article>
        <article className="creator-portal-card"><span>NEXT STEP</span><h3>Confirm your direction</h3><p>{mockLead.nextStep}</p></article>
      </section>

      <section className="creator-portal-content-grid">
        <article className="creator-portal-card"><span>ITEMS WE NEED FROM YOU</span><ul>{mockLead.requestedItems.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article className="creator-portal-card"><span>PROJECT UPDATES</span><div className="creator-portal-updates">{mockLead.updates.map((update) => <div key={update.date}><b>{update.date}</b><p>{update.text}</p></div>)}</div></article>
      </section>

      <section className="creator-portal-support"><div><p className="creator-eyebrow">NEED HELP?</p><h2>Have a question about your project?</h2><p>Contact the Zakhy team and we’ll help with the next step.</p></div><a className="creator-button" href="mailto:turboresponsehq@gmail.com?subject=Creator%20Portal%20Support">Contact Support</a></section>
      <p className="creator-portal-preview-footnote">Preview only · no live project data or messages are connected.</p>
    </main>
  );
}

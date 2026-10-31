import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import "../styles/creator-portal-access.css";

type AccessMode = "preview" | "login";

function invitationToken(value: string): string {
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    return url.searchParams.get("token") || url.searchParams.get("invite") || "";
  } catch {
    return trimmed;
  }
}

/**
 * Public, sample-data-only preview and invitation entry.
 * Actual client workspaces remain protected by /creator/portal and the server.
 */
export default function CreatorPortalAccess({ mode = "preview" }: { mode?: AccessMode }) {
  const [invite, setInvite] = useState("");
  const [notice, setNotice] = useState("");

  function openInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = invitationToken(invite);
    if (!/^[a-zA-Z0-9_-]{20,150}$/.test(token)) {
      setNotice("Enter the invitation link or access token from your project email.");
      return;
    }
    window.location.assign(`/creator/portal?token=${encodeURIComponent(token)}`);
  }

  return (
    <main className="cap-shell">
      <header className="cap-header">
        <Link className="cap-wordmark" href="/zakhybuildsai">CREATOR <span>AUTOMATIONS</span></Link>
        <div className="cap-header-right">
          <span>CLIENT WORKSPACE</span>
          <Link href={mode === "login" ? "/creator/portal/preview" : "/creator/portal/login"}>
            {mode === "login" ? "View demo" : "Client access"}
          </Link>
        </div>
      </header>

      {mode === "login" ? (
        <section className="cap-login-panel">
          <p className="cap-eyebrow">PRIVATE PROJECT ACCESS</p>
          <h1>Welcome to your workspace.</h1>
          <p>Open your project using the secure invitation link sent by the Creator Automations team. Invitations expire and are unique to each client.</p>
          <form onSubmit={openInvitation} className="cap-access-form">
            <label htmlFor="cap-token">Invitation link or access token</label>
            <input
              id="cap-token"
              value={invite}
              onChange={(event) => { setInvite(event.target.value); setNotice(""); }}
              placeholder="Paste your private invitation link"
              autoComplete="off"
              required
            />
            {notice && <p role="alert" className="cap-error">{notice}</p>}
            <button type="submit">Open my workspace</button>
          </form>
          <div className="cap-footnote">
            Don't have an invitation? <a href="mailto:turboresponsehq@gmail.com?subject=Creator%20Portal%20Invitation">Contact Creator Automations</a>.
          </div>
          <Link className="cap-underlink" href="/creator/portal/preview">See a sample workspace</Link>
        </section>
      ) : (
        <>
          <section className="cap-hero">
            <div>
              <p className="cap-eyebrow">INTERACTIVE LOOK · SAMPLE DATA ONLY</p>
              <h1>Your project.<br/><em>One place.</em></h1>
              <p>A simple client home for project milestones, requested materials, progress updates, and important next steps.</p>
              <Link className="cap-primary-link" href="/creator/portal/login">Open your own workspace</Link>
            </div>
            <div className="cap-preview-label">PORTAL PREVIEW <span>01 / 01</span></div>
          </section>

          <section className="cap-demo-heading">
            <div><p className="cap-eyebrow">DEMO CREATOR</p><h2>Welcome back.</h2><p>Here's where your project stands today.</p></div>
            <span className="cap-stage"><i/> In progress</span>
          </section>

          <section className="cap-grid">
            <article className="cap-tile cap-tile-wide">
              <span className="cap-label">YOUR PROJECT</span>
              <h3>Your Brand Website + Automation</h3>
              <p>Current phase: Website concept &amp; content collection</p>
              <div className="cap-meter" aria-label="Project demo progress: 3 of 5 stages"><span /></div>
              <small>3 OF 5 MILESTONES · SAMPLE</small>
            </article>
            <article className="cap-tile">
              <span className="cap-label">NEXT STEP</span>
              <h3>Send your brand assets.</h3>
              <p>Share your logo, biography, and approved photographs to prepare your first review.</p>
            </article>
            <article className="cap-tile">
              <span className="cap-label">REQUESTED ITEMS</span>
              <ul className="cap-items">
                <li><span>Brand logo</span><b>Received</b></li>
                <li><span>Social media links</span><b>Received</b></li>
                <li><span>Approved photos</span><b className="cap-pending">Needed</b></li>
              </ul>
            </article>
            <article className="cap-tile">
              <span className="cap-label">LATEST UPDATE</span>
              <h3>Your concept is being prepared.</h3>
              <p>We'll share the first website direction after the remaining materials are received.</p>
            </article>
          </section>

          <p className="cap-demo-disclaimer">This is a public illustration with fictional project details. Real client projects and files are only visible through a valid private invitation.</p>
        </>
      )}
      <footer className="cap-footer"><span>CREATOR AUTOMATIONS · ZAKHY BUILDS AI</span><a href="mailto:turboresponsehq@gmail.com?subject=Creator%20Portal%20Support">Contact support</a></footer>
    </main>
  );
}

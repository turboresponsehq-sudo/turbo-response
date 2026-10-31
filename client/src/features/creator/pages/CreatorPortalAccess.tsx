import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import "../styles/creator-portal-access.css";
import CreatorWorkspace from "../components/CreatorWorkspace";

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
    <div className="cap-shell">
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
          <section className="cap-one-page-intro">
            <div>
              <p className="cap-eyebrow">INTERACTIVE DEMO · SAMPLE DATA ONLY</p>
              <h1>One project. <em>One page.</em></h1>
              <p>Project goal, both checklists, chat and file uploads, all together. This demo does not send messages or store files.</p>
            </div>
            <Link className="cap-primary-link" href="/creator/portal/login">Private client sign-in</Link>
          </section>
          <CreatorWorkspace
            key="demo-workspace"
            mode="demo"
            clientName="Sample Website Project"
            initial={{
              id: -1,
              brand_name: "Sample Website Project",
              project_goal: "Get the website live on the internet",
              current_status: "In Progress",
              current_phase: "Hosting and launch",
              tasks: [
                { id: 1, label: "Prepare and test the website", status: "complete", owner: "team", priority: "normal" },
                { id: 2, label: "Connect hosting and publish the approved website", status: "needed", owner: "team", priority: "normal" },
                { id: 3, label: "Choose and purchase a website hosting platform", status: "needed", owner: "client", priority: "urgent" },
                { id: 4, label: "Approve the final website", status: "needed", owner: "client", priority: "normal" },
              ],
              messages: [
                { id: 1, sender_type: "admin", message_text: "The website is ready for hosting. Please choose a hosting platform so we can launch it.", created_at: "2026-10-31T14:00:00-04:00" },
              ],
              attachments: [],
            }}
          />
          <p className="cap-demo-disclaimer">Demo data only. Nothing typed here is saved, emailed, or shared. Real client projects remain private.</p>
        </>
      )}
      <footer className="cap-footer"><span>CREATOR AUTOMATIONS · ZAKHY BUILDS AI</span><a href="mailto:turboresponsehq@gmail.com?subject=Creator%20Portal%20Support">Contact support</a></footer>
    </div>
  );
}

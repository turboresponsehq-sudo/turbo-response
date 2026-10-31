import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import "../styles/creator-portal-access.css";
import CreatorWorkspace from "../components/CreatorWorkspace";

type AccessMode = "preview" | "login";

/**
 * Public, sample-data-only preview and invitation entry.
 * Actual client workspaces remain protected by /creator/portal and the server.
 */
export default function CreatorPortalAccess({ mode = "preview" }: { mode?: AccessMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/creator/portal/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", cache: "no-store",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      window.location.assign("/creator/portal");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to sign in.");
      setBusy(false);
    }
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
          <h1>Welcome back.</h1>
          <p>Sign in with the email address on your project and the password you created from your invitation.</p>
          <form onSubmit={signIn} className="cap-access-form">
            <label htmlFor="cap-email">Email address</label>
            <input id="cap-email" type="email" value={email}
              onChange={event => { setEmail(event.target.value); setNotice(""); }}
              placeholder="you@example.com" autoComplete="username" required />
            <label htmlFor="cap-password">Password</label>
            <input id="cap-password" type="password" value={password}
              onChange={event => { setPassword(event.target.value); setNotice(""); }}
              placeholder="Your private password" autoComplete="current-password" required />
            {notice && <p role="alert" className="cap-error">{notice}</p>}
            <button disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in to my project"}</button>
          </form>
          <div className="cap-footnote">
            First visit? Open the private invitation link we sent you by text or email to create your password. Invitations expire in 24 hours.
          </div>
          <div className="cap-footnote">
            Need a fresh invitation? <a href="mailto:turboresponsehq@gmail.com?subject=Creator%20Portal%20Access%20Reset">Contact Creator Automations</a>.
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

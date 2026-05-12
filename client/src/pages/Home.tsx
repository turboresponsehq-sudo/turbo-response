import { useState, useEffect } from "react";
import { Link } from "wouter";
import "./Home.css";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Turbo Response — AI Operational Intelligence & Workflow Systems";
  }, []);

  return (
    <div className="hp-root">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="hp-header">
        <div className="hp-nav-inner">
          <Link href="/" className="hp-logo">
            <span className="hp-logo-bolt">⚡</span>
            <span className="hp-logo-text">TURBO RESPONSE</span>
          </Link>
          <button
            className={`hp-hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span /><span /><span />
          </button>
          <nav className={`hp-nav${menuOpen ? " open" : ""}`}>
            <Link href="/services" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Services</Link>
            <Link href="/pricing" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link href="/turbo-systems" className="hp-nav-link hp-nav-systems" onClick={() => setMenuOpen(false)}>⚡ Turbo Systems</Link>
            <Link href="/turbo-intake" className="hp-nav-cta" onClick={() => setMenuOpen(false)}>Get Started</Link>
          </nav>
        </div>
      </header>

      {/* ── SECTION 1: HERO ────────────────────────────────────────────────── */}
      <section className="hp-hero">
        <div className="hp-hero-inner">
          <div className="hp-hero-badge">
            <span className="hp-badge-dot" />
            AI Operational Intelligence Platform
          </div>
          <h1 className="hp-hero-h1">
            AI-Powered Workflow &amp;<br className="hp-br" /> Document Operations
          </h1>
          <p className="hp-hero-sub">
            Turbo Response helps businesses organize information, structure workflows, process documents, and improve operational clarity using AI-assisted systems — so decisions are made with the right records in place.
          </p>
          <div className="hp-hero-btns">
            <div className="hp-btn-group">
              <Link href="/turbo-intake" className="hp-btn hp-btn-primary">
                Offense Intake
              </Link>
              <p className="hp-btn-hint">Initiate an application, dispute, or claim</p>
            </div>
            <div className="hp-btn-group">
              <Link href="/intake" className="hp-btn hp-btn-secondary">
                Defense Intake
              </Link>
              <p className="hp-btn-hint">Respond to a notice, denial, or enforcement action</p>
            </div>
          </div>
          <div className="hp-hero-systems-row">
            <span className="hp-hero-systems-label">Building AI infrastructure for businesses →</span>
            <Link href="/turbo-systems" className="hp-hero-systems-link">⚡ Turbo Systems</Link>
          </div>
        </div>
        {/* Dashboard mockup visual */}
        <div className="hp-hero-visual">
          <div className="hp-dash-mock">
            <div className="hp-dash-topbar">
              <span className="hp-dash-dot red" /><span className="hp-dash-dot yellow" /><span className="hp-dash-dot green" />
              <span className="hp-dash-title">Turbo Operations Dashboard</span>
            </div>
            <div className="hp-dash-body">
              <div className="hp-dash-sidebar">
                <div className="hp-dash-sitem active">⚡ CEO Home</div>
                <div className="hp-dash-sitem">📁 Projects</div>
                <div className="hp-dash-sitem">✅ Tasks</div>
                <div className="hp-dash-sitem">📥 Cases</div>
              </div>
              <div className="hp-dash-main">
                <div className="hp-dash-stat-row">
                  <div className="hp-dash-stat"><div className="hp-dash-stat-val">24</div><div className="hp-dash-stat-label">Active Cases</div></div>
                  <div className="hp-dash-stat"><div className="hp-dash-stat-val">98%</div><div className="hp-dash-stat-label">Doc Accuracy</div></div>
                  <div className="hp-dash-stat"><div className="hp-dash-stat-val">4h</div><div className="hp-dash-stat-label">Avg Response</div></div>
                </div>
                <div className="hp-dash-bar-row">
                  <div className="hp-dash-bar-label">Credit Disputes</div>
                  <div className="hp-dash-bar"><div className="hp-dash-bar-fill" style={{ width: "78%" }} /></div>
                  <span className="hp-dash-bar-pct">78%</span>
                </div>
                <div className="hp-dash-bar-row">
                  <div className="hp-dash-bar-label">Eviction Defense</div>
                  <div className="hp-dash-bar"><div className="hp-dash-bar-fill" style={{ width: "62%" }} /></div>
                  <span className="hp-dash-bar-pct">62%</span>
                </div>
                <div className="hp-dash-bar-row">
                  <div className="hp-dash-bar-label">IRS Responses</div>
                  <div className="hp-dash-bar"><div className="hp-dash-bar-fill" style={{ width: "91%" }} /></div>
                  <span className="hp-dash-bar-pct">91%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: THE PROBLEM ─────────────────────────────────────────── */}
      <section className="hp-section hp-problems">
        <div className="hp-section-inner">
          <div className="hp-section-label">The Problem</div>
          <h2 className="hp-section-h2">Most businesses lose not because they're wrong — but because their records are wrong.</h2>
          <div className="hp-problems-grid">
            {[
              { icon: "📂", title: "Scattered Documents", body: "Critical records spread across emails, drives, and desks — impossible to find when it matters." },
              { icon: "🔀", title: "Workflow Chaos", body: "No clear process for intake, review, or response. Every case handled differently." },
              { icon: "🕳️", title: "Missing Records", body: "Incomplete documentation creates gaps that reviewers, auditors, and courts exploit." },
              { icon: "⚖️", title: "Compliance Pressure", body: "Regulatory deadlines and procedural requirements demand precision most teams can't maintain." },
              { icon: "🗃️", title: "Disorganized Information", body: "Data exists but isn't structured in a way that supports decisions or submissions." },
              { icon: "⏱️", title: "Operational Inefficiency", body: "Manual processes slow response times and increase error rates across every workflow." },
            ].map(p => (
              <div className="hp-problem-card" key={p.title}>
                <div className="hp-problem-icon">{p.icon}</div>
                <div className="hp-problem-title">{p.title}</div>
                <div className="hp-problem-body">{p.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: WHAT WE DO ──────────────────────────────────────────── */}
      <section className="hp-section hp-what hp-bg-blue-tint">
        <div className="hp-section-inner">
          <div className="hp-section-label">What Turbo Response Does</div>
          <h2 className="hp-section-h2">AI-assisted operational systems for document-heavy environments</h2>
          <div className="hp-what-grid">
            {[
              { icon: "🗂️", title: "Document Organization", body: "Structure, categorize, and prepare records so they're submission-ready and audit-proof." },
              { icon: "⚙️", title: "Workflow Systems", body: "Build repeatable intake, review, and response workflows that scale without adding headcount." },
              { icon: "📋", title: "Evidence & Timeline Structuring", body: "Organize facts, dates, and supporting materials into clear, defensible sequences." },
              { icon: "🤖", title: "AI-Assisted Processing", body: "Leverage AI to accelerate document review, drafting, and case preparation at scale." },
              { icon: "📊", title: "Operational Intelligence", body: "Surface the right information at the right time — so decisions are made with full context." },
              { icon: "🔒", title: "Information Management", body: "Maintain organized, accessible, and secure records across all active cases and projects." },
            ].map(w => (
              <div className="hp-what-card" key={w.title}>
                <div className="hp-what-icon">{w.icon}</div>
                <div className="hp-what-title">{w.title}</div>
                <div className="hp-what-body">{w.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: INDUSTRIES ──────────────────────────────────────────── */}
      <section className="hp-section hp-industries">
        <div className="hp-section-inner">
          <div className="hp-section-label">Industries We Serve</div>
          <h2 className="hp-section-h2">Built for any environment where documentation drives outcomes</h2>
          <div className="hp-industries-grid">
            {[
              "Credit Repair", "Insurance Claims", "Tax Professionals", "Legal Operations",
              "Housing & Eviction", "Compliance", "Healthcare Admin", "Case Management",
              "Consultants", "Service Businesses",
            ].map(ind => (
              <div className="hp-industry-chip" key={ind}>{ind}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: OFFENSE / DEFENSE ──────────────────────────────────── */}
      <section className="hp-section hp-od hp-bg-blue-tint">
        <div className="hp-section-inner">
          <div className="hp-section-label">Operational Pathways</div>
          <h2 className="hp-section-h2">Two modes. One system. Built for every scenario.</h2>
          <div className="hp-od-grid">
            <div className="hp-od-card hp-od-offense">
              <div className="hp-od-icon">🚀</div>
              <div className="hp-od-tag">Offense</div>
              <h3 className="hp-od-title">Proactive Operational Action</h3>
              <p className="hp-od-body">
                Use when you are initiating action — applying for funding, filing a dispute, submitting a claim, or pursuing a recovery. Turbo Response structures your documentation to maximize approval and outcome probability.
              </p>
              <ul className="hp-od-list">
                <li>Grant &amp; funding applications</li>
                <li>Credit &amp; capital disputes</li>
                <li>Formal complaints &amp; claims</li>
                <li>Settlement &amp; recovery efforts</li>
                <li>Contract challenges</li>
              </ul>
              <Link href="/turbo-intake" className="hp-btn hp-btn-primary hp-od-btn">
                Offense Intake →
              </Link>
            </div>
            <div className="hp-od-card hp-od-defense">
              <div className="hp-od-icon">🛡️</div>
              <div className="hp-od-tag">Defense</div>
              <h3 className="hp-od-title">Response &amp; Protection Workflows</h3>
              <p className="hp-od-body">
                Use when you have received a notice, demand, denial, or enforcement action. Turbo Response builds your response documentation to contain the situation and protect your position.
              </p>
              <ul className="hp-od-list">
                <li>Eviction &amp; housing defense</li>
                <li>IRS notices &amp; audits</li>
                <li>Debt collection violations</li>
                <li>Wage garnishments &amp; levies</li>
                <li>Benefit denials &amp; appeals</li>
              </ul>
              <Link href="/intake" className="hp-btn hp-btn-secondary hp-od-btn">
                Defense Intake →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: HOW IT WORKS ────────────────────────────────────────── */}
      <section className="hp-section hp-how">
        <div className="hp-section-inner">
          <div className="hp-section-label">How It Works</div>
          <h2 className="hp-section-h2">From intake to organized, submission-ready documentation</h2>
          <div className="hp-how-steps">
            {[
              { step: "01", title: "Intake", body: "Submit your situation through the offense or defense intake form. AI begins processing immediately." },
              { step: "02", title: "Organize", body: "Your documents, facts, and timeline are structured into a clear, reviewable case file." },
              { step: "03", title: "Process", body: "AI-assisted systems draft responses, identify gaps, and prepare submission-ready materials." },
              { step: "04", title: "Operationalize", body: "Receive organized documentation, response packages, and operational guidance for your next step." },
            ].map(s => (
              <div className="hp-how-step" key={s.step}>
                <div className="hp-how-step-num">{s.step}</div>
                <div className="hp-how-step-title">{s.title}</div>
                <div className="hp-how-step-body">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="hp-workflow-strip">
            <div className="hp-wf-node">📥 Intake</div>
            <div className="hp-wf-arrow">→</div>
            <div className="hp-wf-node">🤖 AI Processing</div>
            <div className="hp-wf-arrow">→</div>
            <div className="hp-wf-node">📋 Structured Docs</div>
            <div className="hp-wf-arrow">→</div>
            <div className="hp-wf-node">✅ Submission Ready</div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: CTA ─────────────────────────────────────────────────── */}
      <section className="hp-cta hp-bg-dark">
        <div className="hp-cta-inner">
          <h2 className="hp-cta-h2">
            If your business depends on information, workflows, records, or documentation — we should talk.
          </h2>
          <p className="hp-cta-sub">
            Choose the pathway that matches your situation:
          </p>
          <div className="hp-cta-btns">
            <div className="hp-btn-group">
              <Link href="/turbo-intake" className="hp-btn hp-btn-primary hp-btn-lg">
                Offense Intake
              </Link>
              <p className="hp-btn-hint light">Apply, file, or take action</p>
            </div>
            <div className="hp-btn-group">
              <Link href="/intake" className="hp-btn hp-btn-outline hp-btn-lg">
                Defense Intake
              </Link>
              <p className="hp-btn-hint light">Respond to a notice or issue</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-brand">
            <span className="hp-logo-bolt">⚡</span>
            <span>Turbo Response — AI Operational Intelligence &amp; Workflow Systems</span>
          </div>
          <div className="hp-footer-links">
            <Link href="/turbo-systems" className="hp-footer-link-systems">⚡ Turbo Systems</Link>
            <Link href="/services" className="hp-footer-link">Services</Link>
            <Link href="/pricing" className="hp-footer-link">Pricing</Link>
            <Link href="/disclaimer" className="hp-footer-link">Disclaimer</Link>
          </div>
          <div className="hp-footer-copy">
            © 2026 Turbo Response HQ. Documentation and procedural support. Not a law firm.
          </div>
        </div>
      </footer>

    </div>
  );
}

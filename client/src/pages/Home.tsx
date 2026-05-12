import { useState, useEffect } from "react";
import { Link } from "wouter";
import "./Home.css";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Turbo Response — Intelligent Operational Systems for Document-Heavy Environments";
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
            <Link href="/industries" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Industries</Link>
            <Link href="/turbo-systems" className="hp-nav-link hp-nav-systems" onClick={() => setMenuOpen(false)}>⚡ Turbo Systems</Link>
            <Link href="/turbo-intake" className="hp-nav-cta" onClick={() => setMenuOpen(false)}>Get Started</Link>
          </nav>
        </div>
      </header>

      {/* ── SECTION 1: HERO ────────────────────────────────────────────────── */}
      <section className="hp-hero">
        <div className="hp-hero-content">
          <div className="hp-hero-badge">
            <span className="hp-badge-dot" />
            Intelligent Operational Systems
          </div>
          <h1 className="hp-hero-h1">
            If Your Business Revenue<br />
            <span className="hp-hero-blue">Depends on Documents…</span>
          </h1>
          <p className="hp-hero-tagline">We Should Talk. ⚡</p>
          <p className="hp-hero-sub">
            Turbo Response helps businesses organize large document sets, build timelines, extract critical information, identify missing items, structure evidence, and prepare operational workflows — using intelligent AI systems.
          </p>
          <div className="hp-hero-btns">
            <div className="hp-btn-group">
              <Link href="/turbo-intake" className="hp-btn hp-btn-primary hp-btn-lg">
                Offense Intake
              </Link>
              <p className="hp-btn-hint">Initiate an application, dispute, or claim</p>
            </div>
            <div className="hp-btn-group">
              <Link href="/intake" className="hp-btn hp-btn-secondary hp-btn-lg">
                Defense Intake
              </Link>
              <p className="hp-btn-hint">Respond to a notice, denial, or enforcement action</p>
            </div>
          </div>
        </div>
        <div className="hp-hero-industries-panel">
          <div className="hp-hip-label">Built for Document-Heavy Industries</div>
          {[
            { icon: "🎯", name: "Credit Repair" },
            { icon: "🧮", name: "Tax Professionals" },
            { icon: "🛡️", name: "Insurance Claims" },
            { icon: "⚖️", name: "Legal Services" },
            { icon: "💬", name: "Consumer Disputes" },
            { icon: "📁", name: "Case Management" },
            { icon: "✅", name: "Compliance Work" },
            { icon: "🏥", name: "Medical Records" },
            { icon: "🏠", name: "Housing / Real Estate" },
          ].map(i => (
            <div className="hp-hip-item" key={i.name}>
              <span className="hp-hip-icon">{i.icon}</span>
              <span className="hp-hip-name">{i.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: DROWNING IN ─────────────────────────────────────────── */}
      <section className="hp-section hp-bg-dark">
        <div className="hp-section-inner hp-drowning-inner">
          <div>
            <div className="hp-section-label-dark">The Reality</div>
            <h2 className="hp-section-h2 hp-white">
              Most Businesses Are<br />
              <span className="hp-blue">Drowning In:</span>
            </h2>
            <div className="hp-drowning-list">
              {["PDFs", "Screenshots", "Emails", "Case Files", "Disputes", "Timelines", "Evidence", "Forms", "Compliance Paperwork"].map(item => (
                <div className="hp-drowning-item" key={item}>
                  <span className="hp-drowning-check">⚡</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hp-drowning-solution">
            <div className="hp-ds-box">
              <div className="hp-ds-headline">Turbo Response helps organize, structure, analyze, and process document-heavy workflows using <span className="hp-blue">AI systems.</span></div>
              <div className="hp-ds-divider" />
              <div className="hp-ds-outcomes">
                <div className="hp-ds-outcome"><span className="hp-ds-arrow">→</span> Structure</div>
                <div className="hp-ds-outcome"><span className="hp-ds-arrow">→</span> Organization</div>
                <div className="hp-ds-outcome"><span className="hp-ds-arrow">→</span> Workflows</div>
                <div className="hp-ds-outcome"><span className="hp-ds-arrow">→</span> Intelligent Processing</div>
                <div className="hp-ds-outcome"><span className="hp-ds-arrow">→</span> Operational Leverage</div>
                <div className="hp-ds-outcome"><span className="hp-ds-arrow">→</span> Clarity</div>
              </div>
              <div className="hp-ds-tagline">Built for High-Volume Information Environments.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: WHAT WE CAN HELP WITH ──────────────────────────────── */}
      <section className="hp-section">
        <div className="hp-section-inner">
          <div className="hp-section-label">Turbo Response Can Help</div>
          <h2 className="hp-section-h2">Smarter Workflow. Stronger Cases. Better Outcomes.</h2>
          <div className="hp-services-grid">
            {[
              {
                icon: "📂",
                title: "Organize Large Document Sets",
                body: "Structure chaos into clean, searchable, submission-ready systems.",
              },
              {
                icon: "📅",
                title: "Build Timelines",
                body: "Automatically create accurate, visual timelines from your documents and records.",
              },
              {
                icon: "🔍",
                title: "Extract Important Information",
                body: "Pull key data, dates, parties, and critical details fast — without manual review.",
              },
              {
                icon: "⚠️",
                title: "Identify Missing Items",
                body: "Spot gaps and missing documentation before they become problems.",
              },
              {
                icon: "📋",
                title: "Structure Evidence",
                body: "Organize evidence logically and persuasively for any submission or review.",
              },
              {
                icon: "⚙️",
                title: "Prepare Operational Workflows",
                body: "Build repeatable systems and processes that scale without adding headcount.",
              },
              {
                icon: "⏱️",
                title: "Reduce Manual Review Time",
                body: "Save hours. Increase accuracy. Handle more cases with less effort.",
              },
              {
                icon: "🧠",
                title: "Improve Operational Clarity",
                body: "Surface the right information at the right time so decisions are made with full context.",
              },
            ].map(s => (
              <div className="hp-service-card" key={s.title}>
                <div className="hp-service-icon">{s.icon}</div>
                <div className="hp-service-title">{s.title}</div>
                <div className="hp-service-body">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: THE GOAL IS OPERATIONAL LEVERAGE ────────────────────── */}
      <section className="hp-section hp-bg-blue-tint">
        <div className="hp-section-inner">
          <div className="hp-section-label">The Bigger Picture</div>
          <h2 className="hp-section-h2">
            The Goal Isn't Just AI.<br />
            The Goal Is <span className="hp-blue-text">Operational Leverage.</span>
          </h2>
          <p className="hp-leverage-intro">
            Turbo Response combines AI + systems to turn document chaos into clarity, speed, and results.
          </p>
          <div className="hp-leverage-grid">
            {[
              { icon: "🗂️", title: "Organized", body: "Centralize all your documents in one intelligent system." },
              { icon: "⚙️", title: "Workflows", body: "Build repeatable processes that scale." },
              { icon: "📅", title: "Timelines", body: "Create accurate, visual timelines in seconds." },
              { icon: "⚡", title: "Efficiency", body: "Save hours of manual review time." },
              { icon: "🔍", title: "Extraction", body: "Pull critical data and insights automatically." },
              { icon: "🎯", title: "Focus", body: "Focus on strategy. We handle the heavy lifting." },
              { icon: "✅", title: "Accuracy", body: "Reduce errors and ensure nothing is overlooked." },
              { icon: "📈", title: "Results", body: "More cases resolved. More revenue retained." },
            ].map(l => (
              <div className="hp-leverage-card" key={l.title}>
                <div className="hp-leverage-icon">{l.icon}</div>
                <div className="hp-leverage-title">{l.title}</div>
                <div className="hp-leverage-body">{l.body}</div>
              </div>
            ))}
          </div>
          <div className="hp-leverage-tagline">
            <span>Better Systems.</span>
            <span className="hp-lev-sep">·</span>
            <span>Better Decisions.</span>
            <span className="hp-lev-sep">·</span>
            <span>Better Outcomes.</span>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: OFFENSE / DEFENSE ──────────────────────────────────── */}
      <section className="hp-section">
        <div className="hp-section-inner">
          <div className="hp-section-label">Operational Pathways</div>
          <h2 className="hp-section-h2">Two Modes. One System. Built for Every Scenario.</h2>
          <div className="hp-od-grid">
            <div className="hp-od-card hp-od-offense">
              <div className="hp-od-tag">🚀 Offense</div>
              <h3 className="hp-od-title">Proactive Operational Action</h3>
              <p className="hp-od-body">
                Use when you are initiating action — applying for funding, filing a dispute, submitting a claim, or pursuing a recovery. We structure your documentation to maximize approval and outcome probability.
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
              <div className="hp-od-tag">🛡️ Defense</div>
              <h3 className="hp-od-title">Response &amp; Protection Workflows</h3>
              <p className="hp-od-body">
                Use when you have received a notice, demand, denial, or enforcement action. We build your response documentation to contain the situation and protect your position.
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

      {/* ── SECTION 6: OUTCOMES ────────────────────────────────────────────── */}
      <section className="hp-section hp-bg-dark">
        <div className="hp-section-inner">
          <div className="hp-section-label-dark">What You Get</div>
          <h2 className="hp-section-h2 hp-white">
            If Your Business Runs on Paperwork, Records,<br />
            Evidence, or Documentation…<br />
            <span className="hp-blue">Turbo Response May Be Able to Help.</span>
          </h2>
          <div className="hp-outcomes-grid">
            {[
              { icon: "🎯", title: "More Accuracy", body: "Reduce errors and deliver higher quality results." },
              { icon: "⚡", title: "More Efficiency", body: "Save time and scale without adding headcount." },
              { icon: "📈", title: "More Capacity", body: "Handle more cases, clients, and workload." },
              { icon: "✅", title: "More Compliance", body: "Stronger documentation. Lower risk." },
              { icon: "💰", title: "More Profitability", body: "Better systems lead to a better bottom line." },
            ].map(o => (
              <div className="hp-outcome-card" key={o.title}>
                <div className="hp-outcome-icon">{o.icon}</div>
                <div className="hp-outcome-title">{o.title}</div>
                <div className="hp-outcome-body">{o.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: CTA ─────────────────────────────────────────────────── */}
      <section className="hp-cta">
        <div className="hp-cta-inner">
          <div className="hp-cta-bolt">⚡</div>
          <h2 className="hp-cta-h2">
            Let's Build Smarter Systems.<br />
            Let's Win More.<br />
            <span className="hp-blue">Let's Talk.</span>
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
          <div className="hp-cta-url">www.turboresponsehq.ai</div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-brand">
            <span className="hp-logo-bolt">⚡</span>
            <span>Turbo Response — Intelligent Operational Systems for Document-Heavy Environments</span>
          </div>
          <div className="hp-footer-links">
            <Link href="/turbo-systems" className="hp-footer-link-systems">⚡ Turbo Systems</Link>
            <Link href="/services" className="hp-footer-link">Services</Link>
            <Link href="/industries" className="hp-footer-link">Industries</Link>
            <Link href="/disclaimer" className="hp-footer-link">Disclaimer</Link>
          </div>
          <div className="hp-footer-copy">
            © 2026 Turbo Response HQ · www.turboresponsehq.ai · Documentation and procedural support. Not a law firm.
          </div>
        </div>
      </footer>

    </div>
  );
}

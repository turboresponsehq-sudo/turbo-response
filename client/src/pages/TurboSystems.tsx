import { useState, useEffect } from "react";
import { Link } from "wouter";
import "./TurboSystems.css";

const services = [
  {
    icon: "⚡",
    title: "Automated Intelligence Pipelines",
    description:
      "Daily scanning, classification, and delivery of actionable intelligence from regulatory bodies, market signals, and custom data sources — fully automated, zero manual work.",
    tags: ["GitHub Actions", "Node.js", "SendGrid", "RSS/API"],
  },
  {
    icon: "🤖",
    title: "AI Agent Deployment",
    description:
      "Custom Manus-powered agents that execute multi-step workflows: intake processing, document generation, case routing, client communication, and more.",
    tags: ["Manus AI", "tRPC", "React", "Express"],
  },
  {
    icon: "🏗️",
    title: "Production Infrastructure Builds",
    description:
      "Full-stack systems built to production standards: authentication, database schema, API layer, client portals, admin dashboards, and CI/CD pipelines.",
    tags: ["Render", "MySQL/TiDB", "Drizzle ORM", "Vite"],
  },
  {
    icon: "📊",
    title: "Business Intelligence Systems",
    description:
      "End-to-end BI pipelines that scan sources, classify priority, generate structured reports, create tasks, and deliver insights on schedule — every day.",
    tags: ["P0/P1/P2 Triage", "Auto-task Creation", "Email Delivery"],
  },
  {
    icon: "🔒",
    title: "Incident Response & Stability Protocols",
    description:
      "Production stability frameworks: drift guards, proof-first deploy standards, version beacons, smoke tests, and structured incident response templates.",
    tags: ["/api/version", "Drift Guard", "SEV1 Protocol"],
  },
  {
    icon: "🔗",
    title: "System Integration & Automation",
    description:
      "Connect your existing tools — CRMs, payment processors, document systems, notification channels — into a unified automated workflow with no manual handoffs.",
    tags: ["Stripe", "SendGrid", "S3", "Notion", "Google Calendar"],
  },
];

const proofPoints = [
  { stat: "0", label: "Manual steps", detail: "in the daily intel pipeline" },
  { stat: "6", label: "Hours", detail: "to pivot a full intelligence domain" },
  { stat: "100%", label: "Free infra", detail: "via GitHub Actions automation" },
  { stat: "<5min", label: "Deploy time", detail: "with proof-first CI/CD" },
];

const systemFlow = [
  {
    step: "01",
    icon: "📡",
    title: "Data Ingestion",
    description:
      "Ingested from federal databases, APIs, RSS feeds, and internal systems — on schedule or event-driven.",
  },
  {
    step: "02",
    icon: "🧠",
    title: "AI Classification",
    description:
      "Signals ranked P0/P1/P2, structured, and routed to the appropriate workflow automatically.",
  },
  {
    step: "03",
    icon: "⚙️",
    title: "Workflow Execution",
    description:
      "Agents generate documents, create tasks, send notifications, and trigger downstream actions.",
  },
  {
    step: "04",
    icon: "📤",
    title: "Output Delivery",
    description:
      "Reports emailed, tasks created, dashboards updated, clients notified — zero human intervention.",
  },
];

const infraStack = [
  { label: "Daily intel pipeline", detail: "Scans 6 federal sources, classifies P0/P1/P2, delivers at 6am ET" },
  { label: "Production stability", detail: "Drift guards, version beacons, smoke tests, incident templates" },
  { label: "Client portal", detail: "Payment gate, document management, real-time messaging" },
  { label: "CI/CD pipeline", detail: "Auto-deploy, proof-first deploys, zero manual steps" },
];

export default function TurboSystems() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Turbo Systems ⚡ AI Infrastructure — Turbo Response HQ";
  }, []);

  return (
    <div className="ts-root">
      {/* Animated background */}
      <div className="ts-bg">
        <div className="ts-grid" />
        <div className="ts-orb ts-orb-1" />
        <div className="ts-orb ts-orb-2" />
        <div className="ts-orb ts-orb-3" />
      </div>

      {/* Navigation */}
      <header className="ts-header">
        <div className="ts-nav">
          <Link href="/" className="ts-logo">
            <span className="ts-logo-icon">⚡</span>
            <span className="ts-logo-text">
              TURBO <span className="ts-logo-accent">SYSTEMS</span>
            </span>
          </Link>
          <button
            className={`ts-hamburger${menuOpen ? " ts-is-open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span /><span /><span />
          </button>
          <nav className={`ts-nav-links${menuOpen ? " ts-mobile-open" : ""}`}>
            <Link href="/" className="ts-nav-link" onClick={() => setMenuOpen(false)}>
              ← Back to Turbo Response
            </Link>
            <a href="#services" className="ts-nav-link" onClick={() => setMenuOpen(false)}>
              What We Build
            </a>
            <a href="#how-it-works" className="ts-nav-link" onClick={() => setMenuOpen(false)}>
              How It Works
            </a>
            <a href="#contact" className="ts-nav-cta" onClick={() => setMenuOpen(false)}>
              Build With Us
            </a>
          </nav>
        </div>
      </header>

      {/* ── SECTION 1: HERO ── */}
      <section className="ts-hero">
        <div className="ts-hero-badge">⚡ AI Infrastructure Platform</div>
        <h1 className="ts-hero-title">
          Build Systems That
          <br />
          <span className="ts-gradient-text">Run Without You</span>
        </h1>
        <p className="ts-hero-sub">
          Turbo Systems designs and deploys automated business infrastructure —
          intelligence pipelines, AI agents, and production-grade systems that
          execute without manual intervention.
        </p>
        <div className="ts-hero-actions">
          <a href="#contact" className="ts-btn-primary">
            Book a Strategy Call
          </a>
          <a href="#services" className="ts-btn-ghost">
            What We Build →
          </a>
        </div>

        {/* Proof bar */}
        <div className="ts-proof-bar">
          {proofPoints.map((p) => (
            <div key={p.label} className="ts-proof-item">
              <span className="ts-proof-stat">{p.stat}</span>
              <span className="ts-proof-label">{p.label}</span>
              <span className="ts-proof-detail">{p.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="ts-divider" />

      {/* ── SECTION 2: WHAT WE BUILD ── */}
      <section id="services" className="ts-section">
        <div className="ts-container">
          <div className="ts-section-header">
            <span className="ts-section-tag">What We Build</span>
            <h2 className="ts-section-title">AI Infrastructure Services</h2>
            <p className="ts-section-sub">
              We design and deploy production-grade systems — intelligence pipelines,
              AI agents, and automated workflows — built to run without you.
              Every build is version-controlled, monitored, and shipped with stability protocols.
            </p>
          </div>

          {/* Three pillars */}
          <div className="ts-pillars">
            <div className="ts-pillar">
              <span className="ts-pillar-icon">🧠</span>
              <h4>Intelligence Layer</h4>
              <p>AI pipelines that classify, prioritize, and act on real-world data streams</p>
            </div>
            <div className="ts-pillar">
              <span className="ts-pillar-icon">⚙️</span>
              <h4>Automation Engine</h4>
              <p>Multi-agent workflows that execute tasks, generate outputs, and trigger actions</p>
            </div>
            <div className="ts-pillar">
              <span className="ts-pillar-icon">🏗️</span>
              <h4>Production Infrastructure</h4>
              <p>Deployed systems with CI/CD, monitoring, drift guards, and incident protocols</p>
            </div>
          </div>

          {/* Service cards */}
          <div className="ts-services-grid">
            {services.map((s) => (
              <div key={s.title} className="ts-service-card">
                <div className="ts-service-icon">{s.icon}</div>
                <h3 className="ts-service-title">{s.title}</h3>
                <p className="ts-service-desc">{s.description}</p>
                <div className="ts-service-tags">
                  {s.tags.map((t) => (
                    <span key={t} className="ts-tag">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="ts-divider" />

      {/* ── SECTION 3: HOW IT WORKS ── */}
      <section id="how-it-works" className="ts-section">
        <div className="ts-container">
          <div className="ts-section-header">
            <span className="ts-section-tag">How It Works</span>
            <h2 className="ts-section-title">Data → AI → Execution → Output</h2>
            <p className="ts-section-sub">
              Every Turbo Systems build follows the same production-proven flow.
            </p>
          </div>

          <div className="ts-flow-grid">
            {systemFlow.map((f, i) => (
              <div key={f.step} className="ts-flow-card">
                <div className="ts-flow-step">{f.step}</div>
                <div className="ts-flow-icon">{f.icon}</div>
                <h3 className="ts-flow-title">{f.title}</h3>
                <p className="ts-flow-desc">{f.description}</p>
                {i < systemFlow.length - 1 && (
                  <div className="ts-flow-arrow">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: INFRASTRUCTURE / PROOF ── */}
      <section className="ts-infra-section">
        <div className="ts-container">
          <div className="ts-infra-inner">
            <div className="ts-infra-left">
              <span className="ts-section-tag">Infrastructure / Proof</span>
              <h2 className="ts-infra-title">
                This site runs on<br />
                <span className="ts-gradient-text">Turbo Systems infrastructure.</span>
              </h2>
              <p className="ts-infra-body">
                The platform you're on right now — client portals, admin dashboards,
                automated intelligence delivery, payment processing, and production
                stability monitoring — was built using the same methodology we apply
                to every client engagement.
              </p>
            </div>
            <div className="ts-infra-right">
              {infraStack.map((item) => (
                <div key={item.label} className="ts-infra-item">
                  <div className="ts-infra-check">✓</div>
                  <div>
                    <div className="ts-infra-label">{item.label}</div>
                    <div className="ts-infra-detail">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: BUILD WITH US ── */}
      <section id="contact" className="ts-cta-section">
        <div className="ts-container">
          <div className="ts-cta-card">
            <div className="ts-cta-glow" />

            {/* Founder identity */}
            <div className="ts-founder-row">
              <div className="ts-founder-avatar">DC</div>
              <div className="ts-founder-meta">
                <div className="ts-founder-name">Demarcus Collins</div>
                <div className="ts-founder-role">Founder · Turbo Response &amp; Turbo Systems</div>
                <div className="ts-founder-tags">
                  <span className="ts-tag">Google Developer</span>
                  <span className="ts-tag">Manus AI Builder</span>
                  <span className="ts-tag">Production Systems</span>
                </div>
              </div>
            </div>

            <div className="ts-cta-divider" />

            <span className="ts-section-tag">Build With Us</span>
            <h2 className="ts-cta-title">
              Let's Design Your<br />
              <span className="ts-gradient-text">AI Infrastructure</span>
            </h2>
            <p className="ts-cta-sub">
              Book a 30-minute strategy call. We'll map your highest-value automation
              targets and define a build plan — before any commitment.
            </p>
            <div className="ts-cta-actions">
              <a
                href="mailto:turboresponsehq@gmail.com?subject=Turbo Systems - Strategy Call Request"
                className="ts-btn-primary ts-btn-large"
              >
                Book a Strategy Call
              </a>
              <Link href="/intake-offense" className="ts-btn-ghost">
                Submit a Project Brief →
              </Link>
            </div>
            <p className="ts-cta-note">
              No sales pitch. No commitment. Just a clear picture of what's possible.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ts-footer">
        <div className="ts-container">
          <div className="ts-footer-inner">
            <div className="ts-footer-brand">
              <span className="ts-logo-icon">⚡</span>
              <span>
                Turbo Systems is the AI infrastructure layer of{" "}
                <Link href="/" className="ts-footer-link">
                  Turbo Response HQ
                </Link>
              </span>
            </div>
            <div className="ts-footer-links">
              <Link href="/" className="ts-footer-link">Home</Link>
              <Link href="/services" className="ts-footer-link">Services</Link>
              <Link href="/pricing" className="ts-footer-link">Pricing</Link>
              <Link href="/intake-offense" className="ts-footer-link">Submit Brief</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

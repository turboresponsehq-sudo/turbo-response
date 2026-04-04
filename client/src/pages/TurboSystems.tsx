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
  {
    stat: "0",
    label: "Manual steps",
    detail: "in the daily intel pipeline",
  },
  {
    stat: "6",
    label: "Hours",
    detail: "to pivot a full intelligence domain",
  },
  {
    stat: "100%",
    label: "Free infra",
    detail: "via GitHub Actions automation",
  },
  {
    stat: "<5min",
    label: "Deploy time",
    detail: "with proof-first CI/CD",
  },
];

const systemFlow = [
  {
    step: "01",
    icon: "📡",
    title: "Data Ingestion",
    description:
      "Data is ingested from multiple sources — federal databases, APIs, RSS feeds, web sources, and internal systems — on a scheduled or event-driven basis.",
  },
  {
    step: "02",
    icon: "🧠",
    title: "AI Classification",
    description:
      "AI pipelines classify, prioritize, and structure the incoming data. Signals are ranked P0/P1/P2 and routed to the appropriate workflow automatically.",
  },
  {
    step: "03",
    icon: "⚙️",
    title: "Workflow Execution",
    description:
      "Automation agents execute multi-step workflows — generating documents, creating tasks, sending notifications, updating records, and triggering downstream actions.",
  },
  {
    step: "04",
    icon: "📤",
    title: "Output Delivery",
    description:
      "Outputs are delivered to their destinations: reports emailed, tasks created, dashboards updated, clients notified — all without human intervention.",
  },
];

export default function TurboSystems() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Turbo Systems ⚡ AI Infrastructure Platform — Turbo Response HQ";
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
            <a href="#product" className="ts-nav-link" onClick={() => setMenuOpen(false)}>
              The Platform
            </a>
            <a href="#services" className="ts-nav-link" onClick={() => setMenuOpen(false)}>
              Services
            </a>
            <a href="#how-it-works" className="ts-nav-link" onClick={() => setMenuOpen(false)}>
              How It Works
            </a>
            <a href="#contact" className="ts-nav-cta" onClick={() => setMenuOpen(false)}>
              Book a Call
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="ts-hero">
        <div className="ts-hero-badge">⚡ AI Infrastructure Platform</div>
        <h1 className="ts-hero-title">
          Build Systems That
          <br />
          <span className="ts-gradient-text">Run Without You</span>
        </h1>
        <p className="ts-hero-sub">
          Turbo Systems is an AI infrastructure platform that designs and deploys
          automated business systems — intelligence pipelines, AI agents, and
          production-grade infrastructure that operates without manual intervention.
        </p>
        <div className="ts-hero-actions">
          <a href="#contact" className="ts-btn-primary">
            Book a Strategy Call
          </a>
          <a href="#product" className="ts-btn-ghost">
            What This Product Is →
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

      {/* Divider */}
      <div className="ts-divider" />

      {/* What This Product Is */}
      <section id="product" className="ts-section ts-product-section">
        <div className="ts-container">
          <div className="ts-section-header">
            <span className="ts-section-tag">The Platform</span>
            <h2 className="ts-section-title">What This Product Is</h2>
          </div>
          <div className="ts-product-body">
            <p className="ts-product-lead">
              Turbo Systems is an AI infrastructure platform that builds and deploys
              automated business systems.
            </p>
            <p className="ts-product-desc">
              We don't just implement tools — we design production-grade systems that
              ingest data, execute multi-step workflows, and deliver measurable outcomes
              automatically. Every system is version-controlled, monitored, and shipped
              with stability protocols so it runs without manual intervention.
            </p>
            <div className="ts-product-pillars">
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
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="ts-section">
        <div className="ts-container">
          <div className="ts-section-header">
            <span className="ts-section-tag">What We Build</span>
            <h2 className="ts-section-title">AI Infrastructure Services</h2>
            <p className="ts-section-sub">
              Every system is built to production standards, documented, and
              shipped with monitoring. No prototypes. No guessing.
            </p>
          </div>

          <div className="ts-services-grid">
            {services.map((s) => (
              <div key={s.title} className="ts-service-card">
                <div className="ts-service-icon">{s.icon}</div>
                <h3 className="ts-service-title">{s.title}</h3>
                <p className="ts-service-desc">{s.description}</p>
                <div className="ts-service-tags">
                  {s.tags.map((t) => (
                    <span key={t} className="ts-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Product / System in Action */}
      <section className="ts-proof-section">
        <div className="ts-container">
          <div className="ts-proof-card">
            <div className="ts-proof-label-top">Live Product / System in Action</div>
            <h2 className="ts-proof-title">
              This site runs on Turbo Systems infrastructure.
            </h2>
            <p className="ts-proof-body">
              The platform you're on right now — client portals, admin
              dashboards, automated daily intelligence delivery, payment
              processing, document management, and production stability
              monitoring — was designed and deployed using the same methodology
              we apply to client engagements.
            </p>
            <div className="ts-proof-items">
              <div className="ts-proof-line">
                <span className="ts-check">✓</span>
                <span>
                  Daily intel pipeline: scans 6 federal sources, classifies
                  P0/P1/P2, delivers email + creates tasks at 6am ET
                </span>
              </div>
              <div className="ts-proof-line">
                <span className="ts-check">✓</span>
                <span>
                  Production stability protocol: drift guards, version beacons,
                  smoke tests, incident templates
                </span>
              </div>
              <div className="ts-proof-line">
                <span className="ts-check">✓</span>
                <span>
                  Client portal with payment gate, document management, and
                  real-time messaging
                </span>
              </div>
              <div className="ts-proof-line">
                <span className="ts-check">✓</span>
                <span>
                  Full CI/CD with auto-deploy, proof-first deploys, and zero
                  manual steps
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — System Flow */}
      <section id="how-it-works" className="ts-section">
        <div className="ts-container">
          <div className="ts-section-header">
            <span className="ts-section-tag">How It Works</span>
            <h2 className="ts-section-title">Data → AI System → Execution → Output</h2>
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

      {/* Founder / Team */}
      <section id="founder" className="ts-section ts-founder-section">
        <div className="ts-container">
          <div className="ts-section-header">
            <span className="ts-section-tag">The Team</span>
            <h2 className="ts-section-title">Who Builds This</h2>
          </div>
          <div className="ts-founder-card">
            <div className="ts-founder-avatar">DC</div>
            <div className="ts-founder-info">
              <h3 className="ts-founder-name">Demarcus Collins</h3>
              <p className="ts-founder-title">Founder, Turbo Response &amp; Turbo Systems</p>
              <p className="ts-founder-bio">
                AI systems builder focused on automation, document intelligence, and
                multi-agent workflows. Google developer and active builder of production
                AI infrastructure. Demarcus designed and shipped the entire Turbo Response
                platform — including client portals, automated intelligence pipelines,
                payment systems, and production stability protocols — using Manus AI and
                modern full-stack tooling.
              </p>
              <div className="ts-founder-tags">
                <span className="ts-tag">Google Developer</span>
                <span className="ts-tag">Manus AI Builder</span>
                <span className="ts-tag">Production Systems</span>
                <span className="ts-tag">Multi-Agent Workflows</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="ts-cta-section">
        <div className="ts-container">
          <div className="ts-cta-card">
            <div className="ts-cta-glow" />
            <span className="ts-section-tag">Ready to Build?</span>
            <h2 className="ts-cta-title">
              Let's Design Your AI Infrastructure
            </h2>
            <p className="ts-cta-sub">
              Book a 30-minute strategy call. We'll map your highest-value
              automation targets and define a build plan before any commitment.
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
              No sales pitch. No commitment. Just a clear picture of what's
              possible.
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
              <Link href="/" className="ts-footer-link">
                Consumer Defense
              </Link>
              <Link href="/services" className="ts-footer-link">
                Services
              </Link>
              <Link href="/intake-offense" className="ts-footer-link">
                Submit Brief
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

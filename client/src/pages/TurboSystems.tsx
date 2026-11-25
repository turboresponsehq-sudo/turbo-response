import { useState, useEffect } from "react";
import { Link } from "wouter";
import "./TurboSystems.css";

const services = [
  { icon: "📥", title: "Customer Intake & Lead Capture", description: "Collect customer inquiries through a branded form, organize contact details, and route each lead to the right next step.", tags: ["Forms", "Lead Tracking", "Routing"] },
  { icon: "💬", title: "Automated Follow-Ups", description: "Reduce missed opportunities with timely appointment reminders, response workflows, and customer follow-up sequences.", tags: ["Email", "Reminders", "Scheduling"] },
  { icon: "🗂️", title: "CRM & Client Management", description: "Bring leads, appointments, client files, and task statuses into one organized view for your team.", tags: ["CRM", "Client Portals", "Tasks"] },
  { icon: "🤖", title: "AI Assistants & Business Workflows", description: "Use AI to help triage requests, summarize information, draft responses, and support repeatable business processes with human oversight.", tags: ["AI Assistants", "Documents", "Review"] },
  { icon: "📊", title: "Business Intelligence Dashboards", description: "See the information that matters: inquiry volume, workflow bottlenecks, customer activity, and other available business metrics.", tags: ["Dashboards", "Reporting", "Data"] },
  { icon: "🔗", title: "Custom Integrations & Automation", description: "Connect the tools your business already uses, such as forms, calendars, email, and customer-management systems.", tags: ["Integrations", "APIs", "Workflows"] },
];

const proofPoints = [
  { stat: "AI", label: "Practical tools", detail: "Focused on everyday work" },
  { stat: "CRM", label: "Customer visibility", detail: "Leads and follow-up organized" },
  { stat: "OPS", label: "Connected workflows", detail: "Less repetitive admin" },
  { stat: "DATA", label: "Clearer insights", detail: "Make use of business records" },
];

const systemFlow = [
  { step: "01", icon: "📝", title: "Understand Your Workflow", description: "Identify repetitive tasks, missed follow-ups, and information scattered across apps." },
  { step: "02", icon: "🔗", title: "Connect Your Tools", description: "Bring together the data, systems, and processes your business already uses." },
  { step: "03", icon: "⚙️", title: "Automate Practical Steps", description: "Route inquiries, create tasks, send appropriate reminders, and keep people involved where needed." },
  { step: "04", icon: "📈", title: "Track & Improve", description: "Use dashboards and periodic reviews to see what's working and refine the process." },
];

const infraStack = [
  { label: "Customer intake", detail: "Forms, contact capture, qualification, and organized leads" },
  { label: "Business workflows", detail: "Follow-up sequences, assignments, reminders, and process routing" },
  { label: "Operational dashboards", detail: "Relevant metrics and workflow status in one place" },
  { label: "Custom integrations", detail: "Connect existing systems without forcing a new software stack" },
];

export default function TurboSystems() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Turbo Response — AI Systems for Small Businesses";
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
              TURBO <span className="ts-logo-accent">RESPONSE</span>
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
        <div className="ts-hero-badge">⚡ TURBO SYSTEMS / SMALL BUSINESS AUTOMATION</div>
        <h1 className="ts-hero-title">
          Make Your Business
          <br />
          <span className="ts-gradient-text">Run Smarter With AI</span>
        </h1>
        <p className="ts-hero-sub">
          Turbo Response helps small businesses organize customer inquiries,
          automate routine follow-ups, connect existing tools, and streamline
          day-to-day operations with practical AI systems.
        </p>
        <div className="ts-hero-actions">
          <a href="#contact" className="ts-btn-primary">
            Discuss Your Business
          </a>
          <a href="#services" className="ts-btn-ghost">
            Explore Services →
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
            <h2 className="ts-section-title">Small Business AI & Automation Services</h2>
            <p className="ts-section-sub">
              From capturing new leads to organizing customer information and repetitive
              administrative work, we help local businesses create simpler processes.
              Every project is scoped to the tools and budget of the business.
            </p>
          </div>

          {/* Three pillars */}
          <div className="ts-pillars">
            <div className="ts-pillar">
              <span className="ts-pillar-icon">🧠</span>
              <h4>Business Intelligence</h4>
              <p>Find useful insights in the customer and operations data you already collect</p>
            </div>
            <div className="ts-pillar">
              <span className="ts-pillar-icon">⚙️</span>
              <h4>Workflow Automation</h4>
              <p>Make intake, follow-up, and task handoffs more consistent with less manual work</p>
            </div>
            <div className="ts-pillar">
              <span className="ts-pillar-icon">🏗️</span>
              <h4>Connected Systems</h4>
              <p>Link the forms, calendars, email, and customer tools your team relies on</p>
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
              We start with the problem, then connect tools and build a workflow your team can actually use.
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
                Better operations start<br />
                <span className="ts-gradient-text">with connected systems.</span>
              </h2>
              <p className="ts-infra-body">
                We can combine intake, dashboards, AI assistance, and automated
                workflows into one practical system. We build around the needs of
                your business instead of selling a one-size-fits-all package.
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
                <div className="ts-founder-role">Founder · Turbo Response</div>
                <div className="ts-founder-tags">
                  <span className="ts-tag">AI Systems</span>
                  <span className="ts-tag">Business Automation</span>
                  <span className="ts-tag">Workflow Design</span>
                </div>
              </div>
            </div>

            <div className="ts-cta-divider" />

            <span className="ts-section-tag">Build With Us</span>
            <h2 className="ts-cta-title">
              Let's Simplify Your<br />
              <span className="ts-gradient-text">Business Operations</span>
            </h2>
            <p className="ts-cta-sub">
              Tell us what slows your business down. We'll discuss where a
              practical AI workflow or connected system could help.
            </p>
            <div className="ts-cta-actions">
              <a
                href="mailto:turboresponsehq@gmail.com?subject=Turbo%20Response%20Small%20Business%20AI%20Consultation"
                className="ts-btn-primary ts-btn-large"
              >
                Email Us About Your Business
              </a>
              <a href="mailto:turboresponsehq@gmail.com?subject=Small%20Business%20Workflow%20Review" className="ts-btn-ghost">
                Describe Your Workflow →
              </a>
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
                Turbo Systems is the small-business automation practice of{" "}
                <Link href="/" className="ts-footer-link">
                  Turbo Response HQ
                </Link>
              </span>
            </div>
            <div className="ts-footer-links">
              <Link href="/" className="ts-footer-link">Home</Link>
              <a href="#services" className="ts-footer-link">Services</a>
              <a href="#how-it-works" className="ts-footer-link">Our Process</a>
              <a href="#contact" className="ts-footer-link">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

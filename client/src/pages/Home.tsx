import { useState, useEffect } from "react";
import { Link } from "wouter";
import "./Home.css";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Turbo Response — Operational Intelligence Infrastructure for Ambitious Builders";
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
            <Link href="/services" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Infrastructure</Link>
            <Link href="/industries" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Industries</Link>
            <Link href="/turbo-systems" className="hp-nav-link hp-nav-systems" onClick={() => setMenuOpen(false)}>⚡ Turbo Systems</Link>
            <Link href="/turbo-intake" className="hp-nav-cta" onClick={() => setMenuOpen(false)}>Build With Us</Link>
          </nav>
        </div>
      </header>

      {/* ── SECTION 1: HERO ────────────────────────────────────────────────── */}
      <section className="hp-hero">
        <div className="hp-hero-content">
          <div className="hp-hero-badge">
            <span className="hp-badge-dot" />
            Operational Intelligence Infrastructure
          </div>
          <h1 className="hp-hero-h1">
            The Infrastructure Layer<br />
            <span className="hp-hero-accent">for Ambitious Builders.</span>
          </h1>
          <p className="hp-hero-sub">
            Turbo Response designs, deploys, and scales AI-powered operational systems — intelligent workflows, automation pipelines, and infrastructure that runs without manual intervention. Built for founders, operators, and organizations serious about scale.
          </p>
          <div className="hp-hero-btns">
            <Link href="/turbo-systems" className="hp-btn hp-btn-primary hp-btn-lg">
              Enter the Ecosystem ⚡
            </Link>
            <Link href="/turbo-intake" className="hp-btn hp-btn-ghost hp-btn-lg">
              Start a Build →
            </Link>
          </div>
        </div>
        <div className="hp-hero-panel">
          <div className="hp-hip-label">Operational Capabilities</div>
          {[
            { icon: "⚡", name: "AI Workflow Automation" },
            { icon: "🧠", name: "Operational Intelligence" },
            { icon: "⚙️", name: "Multi-Agent Systems" },
            { icon: "📡", name: "Intelligence Pipelines" },
            { icon: "🏗️", name: "Infrastructure Builds" },
            { icon: "🔁", name: "Automated Intake Systems" },
            { icon: "📊", name: "Document Intelligence" },
            { icon: "🛰️", name: "Ecosystem Architecture" },
          ].map(i => (
            <div className="hp-hip-item" key={i.name}>
              <span className="hp-hip-icon">{i.icon}</span>
              <span className="hp-hip-name">{i.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: ECOSYSTEM IDENTITY ─────────────────────────────────── */}
      <section className="hp-section hp-bg-dark">
        <div className="hp-section-inner hp-ecosystem-inner">
          <div className="hp-section-label-dark">The Ecosystem</div>
          <h2 className="hp-section-h2 hp-white">
            Two Layers.<br />
            <span className="hp-accent">One Ecosystem.</span>
          </h2>
          <div className="hp-ecosystem-grid">
            <div className="hp-eco-card hp-eco-turbo">
              <div className="hp-eco-tag">⚡ Turbo Response</div>
              <h3 className="hp-eco-title">The Operational Engine</h3>
              <p className="hp-eco-body">
                AI systems, automation infrastructure, intelligent workflows, and production-grade operational architecture. The engine that powers ambitious organizations.
              </p>
              <div className="hp-eco-pillars">
                <span>AI Systems</span>
                <span>Automation</span>
                <span>Infrastructure</span>
                <span>Intelligence</span>
              </div>
            </div>
            <div className="hp-eco-card hp-eco-bf">
              <div className="hp-eco-tag hp-eco-tag-purple">◈ Black Future</div>
              <h3 className="hp-eco-title">The Cultural Layer</h3>
              <p className="hp-eco-body">
                The founder movement, the community, and the cultural identity. Black Future is where builders, creators, and operators come together to build what comes next.
              </p>
              <div className="hp-eco-pillars hp-eco-pillars-purple">
                <span>Founder Culture</span>
                <span>Community</span>
                <span>Vision</span>
                <span>Movement</span>
              </div>
            </div>
          </div>
          <p className="hp-ecosystem-tagline">
            Together: <span className="hp-accent">Operational Sovereignty.</span>
          </p>
        </div>
      </section>

      {/* ── SECTION 3: OPERATIONAL INTELLIGENCE ───────────────────────────── */}
      <section className="hp-section">
        <div className="hp-section-inner">
          <div className="hp-section-label">Operational Intelligence</div>
          <h2 className="hp-section-h2">
            Real Infrastructure.<br />
            <span className="hp-accent-text">Not Just Tools.</span>
          </h2>
          <p className="hp-oi-intro">
            We don't implement software. We design and deploy production-grade systems — AI pipelines, multi-agent workflows, and automated infrastructure that operates without manual intervention.
          </p>
          <div className="hp-services-grid">
            {[
              {
                icon: "⚡",
                title: "AI Workflow Automation",
                body: "Multi-step AI pipelines that classify, prioritize, and execute tasks automatically — zero manual intervention.",
              },
              {
                icon: "🧠",
                title: "Document Intelligence",
                body: "Intelligent systems that ingest, structure, extract, and act on document-heavy data at scale.",
              },
              {
                icon: "⚙️",
                title: "Multi-Agent Systems",
                body: "Autonomous agents that execute complex workflows — intake processing, document generation, routing, and communication.",
              },
              {
                icon: "📡",
                title: "Intelligence Pipelines",
                body: "Daily scanning, classification, and delivery of actionable intelligence from regulatory, market, and custom data sources.",
              },
              {
                icon: "🏗️",
                title: "Full-Stack Infrastructure",
                body: "Production-grade systems with authentication, database architecture, API layers, client portals, and CI/CD pipelines.",
              },
              {
                icon: "🔁",
                title: "Operational Automation",
                body: "Connect your existing tools into unified automated workflows — no manual handoffs, no operational drag.",
              },
              {
                icon: "📊",
                title: "Stability Protocols",
                body: "Drift guards, version beacons, smoke tests, and structured incident response — built for systems that cannot fail.",
              },
              {
                icon: "🛰️",
                title: "Ecosystem Architecture",
                body: "Design the operational infrastructure layer that your entire organization builds on top of.",
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

      {/* ── SECTION 4: FOUNDER INFRASTRUCTURE ─────────────────────────────── */}
      <section className="hp-section hp-bg-founder">
        <div className="hp-section-inner">
          <div className="hp-section-label">Founder Infrastructure</div>
          <h2 className="hp-section-h2">
            Built for Builders.<br />
            <span className="hp-accent-text">Designed for Scale.</span>
          </h2>
          <p className="hp-leverage-intro">
            Operational sovereignty is not a product. It is the state of having systems so well-built that your organization operates with precision, speed, and leverage — regardless of headcount.
          </p>
          <div className="hp-leverage-grid">
            {[
              { icon: "⚡", title: "Velocity", body: "Systems that execute faster than manual operations can compete with." },
              { icon: "🎯", title: "Precision", body: "Structured intelligence that surfaces the right information at the right time." },
              { icon: "📈", title: "Scale", body: "Infrastructure that grows with your ambition, not against it." },
              { icon: "🔒", title: "Stability", body: "Production-grade systems built to run without intervention or failure." },
              { icon: "🧠", title: "Intelligence", body: "AI that learns your operational patterns and compounds over time." },
              { icon: "🏗️", title: "Architecture", body: "Systems designed from the ground up, not duct-taped together." },
              { icon: "🔁", title: "Automation", body: "Workflows that execute while you focus on strategy and vision." },
              { icon: "🛰️", title: "Sovereignty", body: "Full operational control. No dependencies. No bottlenecks." },
            ].map(l => (
              <div className="hp-leverage-card" key={l.title}>
                <div className="hp-leverage-icon">{l.icon}</div>
                <div className="hp-leverage-title">{l.title}</div>
                <div className="hp-leverage-body">{l.body}</div>
              </div>
            ))}
          </div>
          <div className="hp-leverage-tagline">
            <span>Operational Clarity.</span>
            <span className="hp-lev-sep">·</span>
            <span>Founder Leverage.</span>
            <span className="hp-lev-sep">·</span>
            <span>Infrastructure That Scales.</span>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: APPLICATION LAYER ───────────────────────────────────── */}
      <section className="hp-section">
        <div className="hp-section-inner">
          <div className="hp-section-label">Application Layer</div>
          <h2 className="hp-section-h2">Infrastructure Applied.<br />
            <span className="hp-accent-text">Across Every Scenario.</span>
          </h2>
          <p className="hp-oi-intro">
            The same operational intelligence infrastructure powers two distinct modes of action — whether you are initiating a strategic move or responding to an external challenge.
          </p>
          <div className="hp-od-grid">
            <div className="hp-od-card hp-od-offense">
              <div className="hp-od-tag">⚡ Offense Mode</div>
              <h3 className="hp-od-title">Proactive Operational Action</h3>
              <p className="hp-od-body">
                Deploy when initiating action — applying for capital, filing a dispute, submitting a claim, or pursuing a recovery. We structure your documentation and workflows to maximize approval and outcome probability.
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
              <div className="hp-od-tag hp-od-tag-dim">🛡️ Defense Mode</div>
              <h3 className="hp-od-title">Response &amp; Protection Workflows</h3>
              <p className="hp-od-body">
                Deploy when responding to a notice, demand, denial, or enforcement action. We build your response documentation and workflows to contain the situation and protect your position.
              </p>
              <ul className="hp-od-list">
                <li>Eviction &amp; housing defense</li>
                <li>IRS notices &amp; audits</li>
                <li>Debt collection violations</li>
                <li>Wage garnishments &amp; levies</li>
                <li>Benefit denials &amp; appeals</li>
              </ul>
              <Link href="/intake" className="hp-btn hp-btn-ghost hp-od-btn">
                Defense Intake →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: GATEWAY CTA ─────────────────────────────────────────── */}
      <section className="hp-cta">
        <div className="hp-cta-inner">
          <div className="hp-cta-bolt">⚡</div>
          <h2 className="hp-cta-h2">
            The Infrastructure Is Ready.<br />
            <span className="hp-accent">Are You?</span>
          </h2>
          <p className="hp-cta-sub">
            Turbo Response builds the operational systems that ambitious founders, creators, and organizations run on. If you are serious about scale, let's build.
          </p>
          <div className="hp-cta-btns">
            <Link href="/turbo-systems" className="hp-btn hp-btn-primary hp-btn-lg">
              ⚡ Explore Turbo Systems
            </Link>
            <Link href="/turbo-intake" className="hp-btn hp-btn-ghost hp-btn-lg">
              Start a Build →
            </Link>
          </div>
          <div className="hp-cta-url">turboresponsehq.ai</div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-brand">
            <span className="hp-logo-bolt">⚡</span>
            <span>Turbo Response — Operational Intelligence Infrastructure</span>
          </div>
          <div className="hp-footer-links">
            <Link href="/turbo-systems" className="hp-footer-link-systems">⚡ Turbo Systems</Link>
            <Link href="/services" className="hp-footer-link">Infrastructure</Link>
            <Link href="/industries" className="hp-footer-link">Industries</Link>
            <Link href="/disclaimer" className="hp-footer-link">Disclaimer</Link>
          </div>
          <div className="hp-footer-copy">
            © 2026 Turbo Response HQ · turboresponsehq.ai · Operational intelligence and AI infrastructure systems.
          </div>
        </div>
      </footer>

    </div>
  );
}

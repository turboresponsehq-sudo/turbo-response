import { useState, useEffect } from "react";
import { Link } from "wouter";
import "./Home.css";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Turbo Response — Legal Technology for Complex Matters";
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
            <Link href="/consumer-solutions" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Consumer Solutions</Link>
            <Link href="/black-future" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Black Future</Link>
            <Link href="/turbo-intake" className="hp-nav-cta" onClick={() => setMenuOpen(false)}>Start Your Matter →</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="hp-hero">
        {/* Deep atmosphere layers */}
        <div className="hp-hero-bg-gradient" aria-hidden="true" />
        <div className="hp-hero-grid" aria-hidden="true" />
        <div className="hp-hero-scanline" aria-hidden="true" />

        {/* Cinematic founder image — blended into the environment */}
        <div className="hp-founder-wrap" aria-hidden="true">
          <div className="hp-founder-ring hp-founder-ring-1" />
          <div className="hp-founder-ring hp-founder-ring-2" />
          <div className="hp-founder-ring hp-founder-ring-3" />
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663092269987/czaSglOLnIKAHYxV.png"
            alt=""
            className="hp-founder-img"
            aria-hidden="true"
          />
          <div className="hp-founder-overlay-left" />
          <div className="hp-founder-overlay-bottom" />
          <div className="hp-founder-overlay-top" />
          <div className="hp-founder-glow-blue" />
          <div className="hp-founder-glow-purple" />
          <div className="hp-orb-particles" aria-hidden="true">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`hp-particle hp-particle-${i + 1}`} />
            ))}
          </div>
        </div>

        {/* Light beam streaks */}
        <div className="hp-light-trail hp-trail-1" aria-hidden="true" />
        <div className="hp-light-trail hp-trail-2" aria-hidden="true" />
        <div className="hp-light-trail hp-trail-3" aria-hidden="true" />

        <div className="hp-hero-inner">
          <div className="hp-hero-content">
            <div className="hp-hero-eyebrow">
              <span className="hp-badge-dot" />
              ⚡ AI-POWERED CASE OPERATIONS
            </div>

            <h1 className="hp-hero-h1">
              Complex Cases Need Better Operations.<br />
              <span className="hp-hero-accent">Not More Paperwork.</span>
            </h1>

            <p className="hp-hero-sub">
              Turbo Response helps organizations that manage complex cases organize documents, build timelines, manage evidence, research regulations, and prepare stronger case files with AI. We transform scattered information into organized action so teams can process complex matters faster and with greater confidence.
            </p>

            <p className="hp-hero-tagline">Organize the case. Accelerate the workflow. Strengthen every response.</p>

            <div className="hp-hero-btns">
              <Link href="/turbo-intake" className="hp-btn hp-btn-primary hp-btn-lg">
                Start Your Matter →
              </Link>
              <Link href="/services" className="hp-btn hp-btn-ghost hp-btn-lg">
                Explore Services →
              </Link>
            </div>

            {/* Status panel — horizontal, left-aligned, below CTAs */}
            <div className="hp-status-panel">
              <div className="hp-status-header">
                <span className="hp-status-title">Verified Systems Portfolio</span>
                <span className="hp-status-live">● ACTIVE</span>
              </div>
              <p className="hp-status-tagline">Built, documented, and continuously refined through real-world operational use.</p>
              <div className="hp-status-divider" />
              <div className="hp-status-metrics-row">
                <div className="hp-status-metric">
                  <span className="hp-status-label">Operational Systems</span>
                  <span className="hp-status-number">41</span>
                </div>
                <div className="hp-status-metric">
                  <span className="hp-status-label">Workflows</span>
                  <span className="hp-status-number">14</span>
                </div>
                <div className="hp-status-metric">
                  <span className="hp-status-label">Automations</span>
                  <span className="hp-status-number">11</span>
                </div>
                <div className="hp-status-metric">
                  <span className="hp-status-label">AI Agents</span>
                  <span className="hp-status-online">9</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only founder image — rendered in flow below the content */}
        <div className="hp-founder-mobile" aria-hidden="true">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663092269987/czaSglOLnIKAHYxV.png"
            alt=""
            className="hp-founder-mobile-img"
          />
          <div className="hp-founder-mobile-fade-top" />
          <div className="hp-founder-mobile-fade-bottom" />
        </div>

        {/* Bottom horizon fade */}
        <div className="hp-hero-horizon" aria-hidden="true" />
      </section>

      {/* ── SECTION DIVIDER ────────────────────────────────────────────────── */}
      <div className="hp-divider hp-divider-blue" aria-hidden="true" />

      {/* ── 3 SERVICE PILLARS ──────────────────────────────────────────────── */}
      <section className="hp-pillars">
        <div className="hp-pillars-bg" aria-hidden="true" />
        <div className="hp-section-inner">
              <div className="hp-eyebrow hp-eyebrow-center">Built for Organizations Managing Complex Cases</div>
              <p className="hp-pillars-tagline">Better case operations create better outcomes.</p>
              <h2 className="hp-section-h2 hp-h2-center">
                From Scattered Information to Organized Action.
              </h2>
              <p className="hp-pillars-sub">
                Three capabilities. One platform. Built for organizations managing complex cases and high-volume documentation.
              </p>

          <div className="hp-pillars-grid">

            {/* Pillar 1 */}
            <div className="hp-pillar hp-pillar-blue">
              <div className="hp-pillar-glow" aria-hidden="true" />
              <div className="hp-pillar-number">01</div>
              <div className="hp-pillar-icon">⚡</div>
              <h3 className="hp-pillar-title">Organize Every Document Into One Intelligent Case File.</h3>
              <p className="hp-pillar-body">
                Turbo Response organizes records, builds timelines, extracts key facts, and connects supporting evidence so your organization spends less time searching and more time moving cases forward.
              </p>
              <ul className="hp-pillar-list">
                <li>Document analysis</li>
                <li>Timeline creation</li>
                <li>Evidence organization</li>
                <li>Contract &amp; notice review</li>
                <li>Key fact extraction</li>
              </ul>
              <Link href="/services" className="hp-pillar-cta">Explore Services →</Link>
            </div>

            {/* Pillar 2 */}
            <div className="hp-pillar hp-pillar-purple">
              <div className="hp-pillar-glow hp-pillar-glow-purple" aria-hidden="true" />
              <div className="hp-pillar-number">02</div>
              <div className="hp-pillar-icon">◈</div>
              <h3 className="hp-pillar-title">AI Research That Supports Better Case Decisions.</h3>
              <p className="hp-pillar-body">
                Research regulations, agency guidance, policies, procedures, and public records without wasting hours searching manually.
              </p>
              <ul className="hp-pillar-list">
                <li>Regulatory research</li>
                <li>Agency guidance</li>
                <li>Policy analysis</li>
                <li>Public records</li>
                <li>Compliance research</li>
                <li>Supporting documentation</li>
              </ul>
              <Link href="/services" className="hp-pillar-cta hp-pillar-cta-purple">Explore Services →</Link>
            </div>

            {/* Pillar 3 */}
            <div className="hp-pillar hp-pillar-green">
              <div className="hp-pillar-glow hp-pillar-glow-green" aria-hidden="true" />
              <div className="hp-pillar-number">03</div>
              <div className="hp-pillar-icon">◉</div>
              <h3 className="hp-pillar-title">Move Cases Forward With Confidence.</h3>
              <p className="hp-pillar-body">
                Prepare organized documentation, strengthen supporting evidence, and create structured case files that improve operational efficiency from intake through resolution.
              </p>
              <ul className="hp-pillar-list">
                <li>Claim preparation</li>
                <li>Response preparation</li>
                <li>Evidence organization</li>
                <li>Investigation support</li>
                <li>Administrative response</li>
                <li>Matter organization</li>
              </ul>
              <Link href="/services" className="hp-pillar-cta hp-pillar-cta-green">Explore Services →</Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION DIVIDER ────────────────────────────────────────────────── */}
      <div className="hp-divider hp-divider-purple" aria-hidden="true" />

      {/* ── CAPABILITY STRIP ───────────────────────────────────────────────── */}
      <section className="hp-strip">
        <div className="hp-strip-inner">
          <div className="hp-strip-item">
            <div className="hp-strip-icon">⚡</div>
            <div className="hp-strip-title">Built for Organizations Managing Consumer Matters</div>
            <div className="hp-strip-body">Organizations that manage consumer disputes, investigations, regulatory matters, administrative complaints, and complex documentation.</div>
          </div>
          <div className="hp-strip-sep" />
          <div className="hp-strip-item">
          <div className="hp-strip-icon">📁</div>
          <div className="hp-strip-title">Built for Operational Teams</div>
            <div className="hp-strip-body">Case Managers, Intake Teams, Documentation Specialists, Operations Managers, Investigation Teams, and Client Success professionals responsible for managing complex case workflows.</div>
          </div>
          <div className="hp-strip-sep" />
          <div className="hp-strip-item">
          <div className="hp-strip-icon">🤖</div>
          <div className="hp-strip-title">Powered by AI</div>
            <div className="hp-strip-body">Transform documents, timelines, evidence, regulations, and workflows into one organized operational system that helps teams process more cases with less manual work.</div>
          </div>

        </div>
      </section>

      {/* ── GATEWAY ────────────────────────────────────────────────────────── */}
      <section className="hp-gateway">
        <div className="hp-gateway-bg" aria-hidden="true" />
        <div className="hp-gateway-grid" aria-hidden="true" />
        <div className="hp-gateway-orb-blue" aria-hidden="true" />
        <div className="hp-gateway-orb-purple" aria-hidden="true" />
        <div className="hp-gateway-horizon-top" aria-hidden="true" />
        <div className="hp-gateway-inner">
          <div className="hp-eyebrow hp-eyebrow-center">AI-Powered Case Operations</div>
          <h2 className="hp-gateway-h2">
            When Case Operations Matter,<br />
            <span className="hp-gateway-accent">Choose Turbo Response.</span>
          </h2>
          <p className="hp-gateway-sub">
            Turbo Response is the AI-powered case operations platform for organizations managing complex matters. We help organizations organize information, accelerate workflows, improve documentation, and prepare stronger responses.
          </p>
          <Link href="/turbo-intake" className="hp-btn hp-btn-primary hp-btn-xl">
            Start Your Matter →
          </Link>
          <p className="hp-gateway-url">turboresponsehq.ai</p>
        </div>
        <div className="hp-gateway-horizon-bottom" aria-hidden="true" />
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-brand">
            <span>⚡</span>
            <span>TURBO RESPONSE</span>
          </div>
          <nav className="hp-footer-links">
            <Link href="/services" className="hp-footer-link">Services</Link>
            <Link href="/consumer-solutions" className="hp-footer-link">Consumer Solutions</Link>
            <Link href="/black-future" className="hp-footer-link">Black Future</Link>
            <Link href="/privacy-policy" className="hp-footer-link">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hp-footer-link">Terms of Service</Link>
          </nav>
          <p className="hp-footer-copy">
            © {new Date().getFullYear()} Turbo Response · AI-Powered Case Operations · turboresponsehq.ai<br />
            Turbo Response is an AI-powered case operations platform that helps organizations organize documentation, manage evidence, build timelines, research regulations, and improve operational workflows. Turbo Response does not provide legal advice or legal representation.
          </p>
        </div>
      </footer>

    </div>
  );
}

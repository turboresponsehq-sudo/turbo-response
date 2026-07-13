import { useState, useEffect } from "react";
import { Link } from "wouter";
import "./Home.css";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Turbo Response — AI-Powered Legal Technology";
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
            <Link href="/solutions" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Solutions</Link>
            <Link href="/use-cases" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Use Cases</Link>
            <Link href="/research" className="hp-nav-link hp-nav-systems" onClick={() => setMenuOpen(false)}>⚡ Research</Link>
            <Link href="/compliance" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Compliance</Link>
            <Link href="/contact" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link href="/demo" className="hp-nav-cta" onClick={() => setMenuOpen(false)}>Request Demo →</Link>
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
              ⚡ AI-POWERED LEGAL TECHNOLOGY
            </div>

            <h1 className="hp-hero-h1">
              From Complexity<br />
              To<br />
              <span className="hp-hero-accent">Clarity.</span>
            </h1>

            <p className="hp-hero-sub">
              Turbo Response empowers legal professionals and organizations to navigate
              complex, documentation-heavy matters with unparalleled speed and precision.
              Transform overwhelming information into actionable intelligence.
            </p>

            <p className="hp-hero-sub-2">
              We don't just automate tasks. We provide the strategic advantage needed
              to build stronger cases, ensure compliance, and respond with confidence.
            </p>

            <div className="hp-hero-btns">
              <Link href="/request-demo" className="hp-btn hp-btn-primary hp-btn-lg">
                Request Demo →
              </Link>
              <Link href="/solutions" className="hp-btn hp-btn-ghost hp-btn-lg">
                Explore Solutions →
              </Link>
            </div>

            {/* Status panel — horizontal, left-aligned, below CTAs */}
            <div className="hp-status-panel">
              <div className="hp-status-header">
                <span className="hp-status-title">Operational Advantage</span>
                <span className="hp-status-live">● ACTIVE</span>
              </div>
              <div className="hp-status-divider" />
              <div className="hp-status-metrics-row">
                <div className="hp-status-metric">
                  <span className="hp-status-label">Cases Managed</span>
                  <span className="hp-status-number">500+</span>
                </div>
                <div className="hp-status-metric">
                  <span className="hp-status-label">Documents Analyzed</span>
                  <span className="hp-status-number">100K+</span>
                </div>
                <div className="hp-status-metric">
                  <span className="hp-status-label">Compliance Checks</span>
                  <span className="hp-status-number">99.9%</span>
                </div>
                <div className="hp-status-metric">
                  <span className="hp-status-label">Response Time</span>
                  <span className="hp-status-online">MINUTES</span>
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
              <div className="hp-eyebrow hp-eyebrow-center">Our Core Capabilities</div>
              <h2 className="hp-section-h2 hp-h2-center">
                Intelligent Solutions for Complex Legal Matters.
              </h2>
              <p className="hp-pillars-sub">
                Three pillars of operational intelligence. One unified platform for clarity and control.
              </p>

          <div className="hp-pillars-grid">

            {/* Pillar 1 */}
            <div className="hp-pillar hp-pillar-blue">
              <div className="hp-pillar-glow" aria-hidden="true" />
              <div className="hp-pillar-number">01</div>
              <div className="hp-pillar-icon">⚡</div>
              <h3 className="hp-pillar-title">Document Intelligence &amp; Organization</h3>
              <p className="hp-pillar-body">
                Transform overwhelming volumes of legal documents into organized, actionable intelligence.
                Our AI-powered platform extracts key data, identifies patterns, and structures information
                for rapid analysis and strategic decision-making.
              </p>
              <ul className="hp-pillar-list">
                <li>Automated document analysis</li>
                <li>Evidence organization</li>
                <li>Contract review &amp; extraction</li>
                <li>Policy &amp; regulation mapping</li>
                <li>Data extraction &amp; structuring</li>
              </ul>
              <Link href="/solutions" className="hp-pillar-cta">Explore Solutions →</Link>
            </div>

            {/* Pillar 2 */}
            <div className="hp-pillar hp-pillar-purple">
              <div className="hp-pillar-glow hp-pillar-glow-purple" aria-hidden="true" />
              <div className="hp-pillar-number">02</div>
              <div className="hp-pillar-icon">◈</div>
              <h3 className="hp-pillar-title">Intelligent Research &amp; Compliance</h3>
              <p className="hp-pillar-body">
                Go beyond simple searches. Our platform conducts deep, AI-powered research into laws,
                regulations, agency guidance, and historical records. Ensure compliance and build
                unassailable arguments with precise, verifiable intelligence.
              </p>
              <ul className="hp-pillar-list">
                <li>Legal &amp; regulatory research</li>
                <li>Compliance monitoring</li>
                <li>Agency guidance analysis</li>
                <li>Public records investigation</li>
                <li>Historical documentation review</li>
              </ul>
              <Link href="/research" className="hp-pillar-cta hp-pillar-cta-purple">Explore Research →</Link>
            </div>

            {/* Pillar 3 */}
            <div className="hp-pillar hp-pillar-green">
              <div className="hp-pillar-glow hp-pillar-glow-green" aria-hidden="true" />
              <div className="hp-pillar-number">03</div>
              <div className="hp-pillar-icon">◉</div>
              <h3 className="hp-pillar-title">Strategic Response &amp; Case Building</h3>
              <p className="hp-pillar-body">
                Prepare for any matter, offensive or defensive. Turbo Response provides the tools
                to build stronger claims, organize evidence, and craft administrative responses
                with speed, precision, and unwavering confidence.
              </p>
              <ul className="hp-pillar-list">
                <li>Offensive &amp; defensive matter prep</li>
                <li>Claim &amp; complaint building</li>
                <li>Evidence organization &amp; analysis</li>
                <li>Administrative response drafting</li>
                <li>Investigation support</li>
              </ul>
              <Link href="/use-cases" className="hp-pillar-cta hp-pillar-cta-green">Explore Use Cases →</Link>
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
            <div className="hp-strip-icon">⚙️</div>
            <div className="hp-strip-title">AI-Powered Legal Intelligence</div>
            <div className="hp-strip-body">Rapidly analyze documents. Automate compliance. Gain strategic insights.</div>
          </div>
          <div className="hp-strip-sep" />
          <div className="hp-strip-item">
            <div className="hp-strip-icon">🏗️</div>
            <div className="hp-strip-title">Scalable Legal Infrastructure</div>
            <div className="hp-strip-body">From case management to regulatory tracking, build systems that grow with your practice.</div>
          </div>
          <div className="hp-strip-sep" />
          <div className="hp-strip-item">
            <div className="hp-strip-icon">🌐</div>
            <div className="hp-strip-title">Strategic Legal Advantage</div>
            <div className="hp-strip-body">Empowering legal professionals with tools for precision, speed, and confidence.</div>
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
          <div className="hp-eyebrow hp-eyebrow-center">Your Legal Edge</div>
          <h2 className="hp-gateway-h2">
            Transforming Legal Practice.<br />
            <span className="hp-gateway-accent">Delivering Unmatched Clarity.</span>
          </h2>
          <p className="hp-gateway-sub">
            Experience the future of legal technology. Request a demo to see Turbo Response in action.
          </p>
          <Link href="/request-demo" className="hp-btn hp-btn-primary hp-btn-xl">
            Request a Demo →
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
            <Link href="/solutions" className="hp-footer-link">Solutions</Link>
            <Link href="/use-cases" className="hp-footer-link">Use Cases</Link>
            <Link href="/research" className="hp-footer-link">Research</Link>
            <Link href="/compliance" className="hp-footer-link">Compliance</Link>
            <Link href="/contact" className="hp-footer-link">Contact</Link>
            <Link href="/privacy-policy" className="hp-footer-link">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hp-footer-link">Terms of Service</Link>
          </nav>
          <p className="hp-footer-copy">
            © {new Date().getFullYear()} Turbo Response. AI-powered legal technology.
            Not a law firm. No legal advice.
          </p>
        </div>
      </footer>

    </div>
  );
}

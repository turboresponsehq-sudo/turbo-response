import { useState, useEffect } from "react";
import { Link } from "wouter";
import "./Home.css";
import "./BusinessHome.css";

export default function BusinessHome() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Turbo Response — The Future of Business";
  }, []);

  return (
    <div className="hp-root hp-business-home">

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
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
          <nav className={`hp-nav${menuOpen ? " open" : ""}`}>
            <Link href="/services" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Services</Link>
            <Link href="/turbo-systems" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Turbo Systems</Link>
            <a href="#capabilities" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Capabilities</a>
            <a href={window.location.hostname === "turbo-response-smallbiz-preview.onrender.com" ? "/?page=business-inquiry" : "/business-inquiry"} className="hp-nav-cta" onClick={() => setMenuOpen(false)}>Discuss Your Business →</a>
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
              ⚡ AI SYSTEMS · BUSINESS AUTOMATION
            </div>

            <h1 className="hp-hero-h1">
              The Future of<br />
              <span className="hp-hero-accent">Business.</span>
            </h1>

            <p className="hp-hero-sub">
              We build AI-powered systems that help businesses capture more opportunities, automate everyday operations and make better use of their information.
            </p>

            <p className="hp-hero-tagline">Increase sales. Increase productivity.</p>

            <div className="hp-hero-btns">
              <a href={window.location.hostname === "turbo-response-smallbiz-preview.onrender.com" ? "/?page=business-inquiry" : "/business-inquiry"} className="hp-btn hp-btn-primary hp-btn-lg">
                Discuss Your Business →
              </a>
              <Link href="/services" className="hp-btn hp-btn-ghost hp-btn-lg">
                Explore Services →
              </Link>
            </div>

            {/* Status panel — horizontal, left-aligned, below CTAs */}
            <div className="hp-status-panel">
              <div className="hp-status-header">
                <span className="hp-status-title">The Turbo Systems Foundation</span>
                <span className="hp-status-live">AI + OPERATIONS</span>
              </div>
              <p className="hp-status-tagline">A foundation of reusable technology, adapted to the needs of each business.</p>
              <div className="hp-status-divider" />
              <div className="hp-status-metrics-row">
                <div className="hp-status-metric">
                  <span className="hp-status-label">Intelligence</span>
                  <span className="hp-status-number">AI</span>
                </div>
                <div className="hp-status-metric">
                  <span className="hp-status-label">Automation</span>
                  <span className="hp-status-number">OPS</span>
                </div>
                <div className="hp-status-metric">
                  <span className="hp-status-label">Customers</span>
                  <span className="hp-status-number">CRM</span>
                </div>
                <div className="hp-status-metric">
                  <span className="hp-status-label">Infrastructure</span>
                  <span className="hp-status-number">DATA</span>
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
      <section id="capabilities" className="hp-pillars">
        <div className="hp-pillars-bg" aria-hidden="true" />
        <div className="hp-section-inner">
              <div className="hp-eyebrow hp-eyebrow-center">Built for the Businesses of Tomorrow</div>
              <p className="hp-pillars-tagline">Better systems create better business outcomes.</p>
              <h2 className="hp-section-h2 hp-h2-center">
                Technology That Moves Your Business Forward.
              </h2>
              <p className="hp-pillars-sub">
                Three core capabilities. One purpose: help your business grow and operate more efficiently.
              </p>

          <div className="hp-pillars-grid">

            {/* Pillar 1 */}
            <div className="hp-pillar hp-pillar-blue">
              <div className="hp-pillar-glow" aria-hidden="true" />
              <div className="hp-pillar-number">01</div>
              <div className="hp-pillar-icon">⚡</div>
              <h3 className="hp-pillar-title">Capture More Business.</h3>
              <p className="hp-pillar-body">
                Design customer-facing systems that help you respond to inquiries, capture leads and organize opportunities in one place.
              </p>
              <ul className="hp-pillar-list">
                <li>AI phone assistants</li>
                <li>Website chatbots</li>
                <li>Lead capture</li>
                <li>CRM systems</li>
                <li>Sales follow-up</li>
              </ul>
              <Link href="/services" className="hp-pillar-cta">Explore Services →</Link>
            </div>

            {/* Pillar 2 */}
            <div className="hp-pillar hp-pillar-purple">
              <div className="hp-pillar-glow hp-pillar-glow-purple" aria-hidden="true" />
              <div className="hp-pillar-number">02</div>
              <div className="hp-pillar-icon">◈</div>
              <h3 className="hp-pillar-title">Automate the Way You Work.</h3>
              <p className="hp-pillar-body">
                Connect everyday tools and automate repetitive work so your team can focus on the activities that matter.
              </p>
              <ul className="hp-pillar-list">
                <li>Workflow automation</li>
                <li>Email and notifications</li>
                <li>Task routing</li>
                <li>Software integrations</li>
                <li>Client portals</li>
                <li>Custom business platforms</li>
              </ul>
              <Link href="/services" className="hp-pillar-cta hp-pillar-cta-purple">Explore Services →</Link>
            </div>

            {/* Pillar 3 */}
            <div className="hp-pillar hp-pillar-green">
              <div className="hp-pillar-glow hp-pillar-glow-green" aria-hidden="true" />
              <div className="hp-pillar-number">03</div>
              <div className="hp-pillar-icon">◉</div>
              <h3 className="hp-pillar-title">Make Better Business Decisions.</h3>
              <p className="hp-pillar-body">
                Bring information together through business intelligence, structured reporting and dashboards designed around your operations.
              </p>
              <ul className="hp-pillar-list">
                <li>AI business assessments</li>
                <li>Automated research</li>
                <li>Business reporting</li>
                <li>Knowledge bases</li>
                <li>Operational dashboards</li>
                <li>Custom data systems</li>
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
            <div className="hp-strip-title">Built for Business Owners</div>
            <div className="hp-strip-body">Established businesses, local service companies, entrepreneurs and professional organizations ready to improve their operations.</div>
          </div>
          <div className="hp-strip-sep" />
          <div className="hp-strip-item">
          <div className="hp-strip-icon">📁</div>
          <div className="hp-strip-title">Built for Operational Teams</div>
            <div className="hp-strip-body">Sales teams, customer service staff, operations managers and business leaders who need better connected systems.</div>
          </div>
          <div className="hp-strip-sep" />
          <div className="hp-strip-item">
          <div className="hp-strip-icon">🤖</div>
          <div className="hp-strip-title">Powered by AI</div>
            <div className="hp-strip-body">Combine AI, existing business tools and reusable technology into solutions designed around specific business needs.</div>
          </div>

        </div>
      </section>

      {/* ── GATEWAY ────────────────────────────────────────────────────────── */}
      <section id="contact" className="hp-gateway">
        <div className="hp-gateway-bg" aria-hidden="true" />
        <div className="hp-gateway-grid" aria-hidden="true" />
        <div className="hp-gateway-orb-blue" aria-hidden="true" />
        <div className="hp-gateway-orb-purple" aria-hidden="true" />
        <div className="hp-gateway-horizon-top" aria-hidden="true" />
        <div className="hp-gateway-inner">
          <div className="hp-eyebrow hp-eyebrow-center">The Future of Business Operations</div>
          <h2 className="hp-gateway-h2">
            Build the Business<br />
            <span className="hp-gateway-accent">of the Future.</span>
          </h2>
          <p className="hp-gateway-sub">
            Tell us what slows your business down or where you want to grow. We’ll review your needs and scope the AI systems, workflows and integrations that can help.
          </p>
          <a href={window.location.hostname === "turbo-response-smallbiz-preview.onrender.com" ? "/?page=business-inquiry" : "/business-inquiry"} className="hp-btn hp-btn-primary hp-btn-xl">
            Request a Consultation →
          </a>
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
            <Link href="/turbo-systems" className="hp-footer-link">Turbo Systems</Link>
            <a href={window.location.hostname === "turbo-response-smallbiz-preview.onrender.com" ? "/?page=business-inquiry" : "/business-inquiry"} className="hp-footer-link">Contact</a>
            <Link href="/privacy-policy" className="hp-footer-link">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hp-footer-link">Terms of Service</Link>
          </nav>
          <p className="hp-footer-copy">
            © {new Date().getFullYear()} Turbo Response · AI Systems &amp; Business Automation · turboresponsehq.ai<br />
            Custom systems and integrations are scoped, configured and tested for each business engagement.
          </p>
        </div>
      </footer>

    </div>
  );
}

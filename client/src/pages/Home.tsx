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
            <Link href="/industries" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Industries</Link>
            <Link href="/turbo-systems" className="hp-nav-link hp-nav-systems" onClick={() => setMenuOpen(false)}>⚡ Turbo Systems</Link>
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
              ⚡ LEGAL TECHNOLOGY FOR COMPLEX MATTERS
            </div>

            <h1 className="hp-hero-h1">
              From Complexity<br />
              To<br />
              <span className="hp-hero-accent">Clarity.</span>
            </h1>

            <p className="hp-hero-sub">
              When the stakes are high, the documents are overwhelming, and the rules are complex, Turbo Response helps consumers and organizations organize information, identify what matters, and respond with speed, precision, and confidence.
            </p>

            <p className="hp-hero-sub-2 hp-hide-mobile">
              From claims and investigations to compliance, contracts, code enforcement, and complex documentation, Turbo Response turns information into intelligent action.
            </p>
            <p className="hp-hero-sub-2 hp-show-mobile">
              From claims and investigations to compliance, contracts, and complex documentation, Turbo Response turns information into intelligent action.
            </p>

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
              <div className="hp-eyebrow hp-eyebrow-center">How Turbo Response Helps</div>
              <p className="hp-pillars-tagline">Better information leads to better decisions. Better decisions lead to better outcomes.</p>
              <h2 className="hp-section-h2 hp-h2-center">
                From Complexity to Clarity. From Information to Action.
              </h2>
              <p className="hp-pillars-sub">
                Three capabilities. One platform. Built for the matters that demand more than a simple answer.
              </p>

          <div className="hp-pillars-grid">

            {/* Pillar 1 */}
            <div className="hp-pillar hp-pillar-blue">
              <div className="hp-pillar-glow" aria-hidden="true" />
              <div className="hp-pillar-number">01</div>
              <div className="hp-pillar-icon">⚡</div>
              <h3 className="hp-pillar-title">Review Hundreds of Pages in Minutes, Not Days.</h3>
              <p className="hp-pillar-body">
                When documents pile up, clarity disappears.
              </p>
              <p className="hp-pillar-body">
                Turbo Response helps organize records, build timelines, identify key facts, and surface the information that actually matters.
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
              <h3 className="hp-pillar-title">Find the Regulations, Policies, and Evidence That Actually Matter.</h3>
              <p className="hp-pillar-body">
                Real research goes beyond internet searches.
              </p>
              <p className="hp-pillar-body">
                Turbo Response researches laws, regulations, agency guidance, policies, procedures, public records, and supporting documentation that directly impact your matter.
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
              <h3 className="hp-pillar-title">Build Stronger Claims. Prepare Stronger Responses.</h3>
              <p className="hp-pillar-body">
                Whether you’re bringing a claim or responding to one, Turbo Response helps organize evidence, structure documentation, prepare supporting materials, and strengthen your overall position.
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
            <div className="hp-strip-title">Consumer Matters</div>
            <div className="hp-strip-body">Disputes. Credit reporting. Banking. Insurance. Housing. Debt collection. IRS notices. Code enforcement. Administrative matters.</div>
          </div>
          <div className="hp-strip-sep" />
          <div className="hp-strip-item">
            <div className="hp-strip-icon">🏗️</div>
            <div className="hp-strip-title">Business &amp; Compliance</div>
            <div className="hp-strip-body">Compliance. Regulatory response. Merchant account disputes. Contract documentation. Internal investigations. Vendor disputes. Arbitration preparation. Operational documentation.</div>
          </div>
          <div className="hp-strip-sep" />
          <div className="hp-strip-item">
            <div className="hp-strip-icon">🌐</div>
            <div className="hp-strip-title">High-Stakes Matters</div>
            <div className="hp-strip-body">When documentation becomes overwhelming, regulations become complicated, and outcomes matter—Turbo Response helps organize the information, identify what matters, and prepare the strongest possible response.</div>
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
          <div className="hp-eyebrow hp-eyebrow-center">Legal Technology for Complex Matters</div>
          <h2 className="hp-gateway-h2">
            When the Matter Is Complex,<br />
            <span className="hp-gateway-accent">Call Turbo Response.</span>
          </h2>
          <p className="hp-gateway-sub">
            Turbo Response brings together research, documentation, evidence, compliance, and intelligent systems to help you move forward with clarity, confidence, and control.
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
            <Link href="/industries" className="hp-footer-link">Industries</Link>
            <Link href="/turbo-systems" className="hp-footer-link">⚡ Turbo Systems</Link>
            <Link href="/consumer-solutions" className="hp-footer-link">Consumer Solutions</Link>
            <Link href="/black-future" className="hp-footer-link">Black Future</Link>
            <Link href="/privacy-policy" className="hp-footer-link">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hp-footer-link">Terms of Service</Link>
          </nav>
          <p className="hp-footer-copy">
            © {new Date().getFullYear()} Turbo Response · Legal Technology for Complex Matters · turboresponsehq.ai<br />
            Turbo Response is a legal technology and operational support platform. We provide intelligent research, documentation, workflow, organization, compliance support, and matter preparation.
            We do not provide legal advice or legal representation.
          </p>
        </div>
      </footer>

    </div>
  );
}

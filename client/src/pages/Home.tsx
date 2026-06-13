import { useState, useEffect } from "react";
import { Link } from "wouter";
import "./Home.css";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Turbo Response — Operational Intelligence Infrastructure";
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
            <Link href="/turbo-intake" className="hp-nav-cta" onClick={() => setMenuOpen(false)}>Start Your Build →</Link>
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
              AI Systems. Operational Intelligence. Built for Builders.
            </div>

            <h1 className="hp-hero-h1">
              We Build<br />
              What's<br />
              <span className="hp-hero-accent">Next.</span>
            </h1>

            <p className="hp-hero-sub">
              Turbo Response designs AI-powered operational systems, intelligent
              workflows, and infrastructure for founders, creators, and organizations
              building the future economy.
            </p>

            <p className="hp-hero-sub-2">
              The next generation of innovators will not just use AI.
              They will build entirely new systems with it.
            </p>

            <div className="hp-hero-btns">
              <Link href="/turbo-intake" className="hp-btn hp-btn-primary hp-btn-lg">
                Start Your Build →
              </Link>
              <Link href="/services" className="hp-btn hp-btn-ghost hp-btn-lg">
                View Services →
              </Link>
            </div>

            {/* Status panel — horizontal, left-aligned, below CTAs */}
            <div className="hp-status-panel">
              <div className="hp-status-header">
                <span className="hp-status-title">Ecosystem Status</span>
                <span className="hp-status-live">● LIVE</span>
              </div>
              <div className="hp-status-divider" />
              <div className="hp-status-metrics-row">
                <div className="hp-status-metric">
                  <span className="hp-status-label">Systems Deployed</span>
                  <span className="hp-status-number">47+</span>
                </div>
                <div className="hp-status-metric">
                  <span className="hp-status-label">Workflows Active</span>
                  <span className="hp-status-number">128+</span>
                </div>
                <div className="hp-status-metric">
                  <span className="hp-status-label">Intelligence Pipes</span>
                  <span className="hp-status-number">23+</span>
                </div>
                <div className="hp-status-metric">
                  <span className="hp-status-label">Infrastructure</span>
                  <span className="hp-status-online">ONLINE</span>
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
          <div className="hp-eyebrow hp-eyebrow-center">What We Build</div>
          <h2 className="hp-section-h2 hp-h2-center">
            The Systems Behind Modern Builders.
          </h2>
          <p className="hp-pillars-sub">
            Three core infrastructure pillars. One operational ecosystem.
          </p>

          <div className="hp-pillars-grid">

            {/* Pillar 1 */}
            <div className="hp-pillar hp-pillar-blue">
              <div className="hp-pillar-glow" aria-hidden="true" />
              <div className="hp-pillar-number">01</div>
              <div className="hp-pillar-icon">⚡</div>
              <h3 className="hp-pillar-title">AI Systems &amp; Automation</h3>
              <p className="hp-pillar-body">
                Intelligent workflows, automation pipelines, and operational infrastructure
                built to run without you. From document intelligence to full-stack AI systems.
              </p>
              <ul className="hp-pillar-list">
                <li>Intelligent workflow design</li>
                <li>Automation pipelines</li>
                <li>Document intelligence</li>
                <li>AI-powered operations</li>
                <li>Infrastructure builds</li>
              </ul>
              <Link href="/services" className="hp-pillar-cta">Explore Systems →</Link>
            </div>

            {/* Pillar 2 */}
            <div className="hp-pillar hp-pillar-purple">
              <div className="hp-pillar-glow hp-pillar-glow-purple" aria-hidden="true" />
              <div className="hp-pillar-number">02</div>
              <div className="hp-pillar-icon">◈</div>
              <h3 className="hp-pillar-title">Research &amp; Opportunity Intelligence</h3>
              <p className="hp-pillar-body">
                Strategic research, funding intelligence, and ecosystem visibility
                for founders and organizations building toward the future economy.
              </p>
              <ul className="hp-pillar-list">
                <li>Funding &amp; grant intelligence</li>
                <li>Opportunity research</li>
                <li>Ecosystem intelligence</li>
                <li>Lead intelligence systems</li>
                <li>Strategic operational visibility</li>
              </ul>
              <Link href="/services" className="hp-pillar-cta hp-pillar-cta-purple">Explore Intelligence →</Link>
            </div>

            {/* Pillar 3 */}
            <div className="hp-pillar hp-pillar-green">
              <div className="hp-pillar-glow hp-pillar-glow-green" aria-hidden="true" />
              <div className="hp-pillar-number">03</div>
              <div className="hp-pillar-icon">◉</div>
              <h3 className="hp-pillar-title">Brand, Content &amp; Ecosystem Building</h3>
              <p className="hp-pillar-body">
                Founder brand architecture, content infrastructure, and the cultural layer
                that turns operational systems into a movement. Powered by Black Future.
              </p>
              <ul className="hp-pillar-list">
                <li>Founder brand architecture</li>
                <li>Content &amp; media systems</li>
                <li>Visual identity direction</li>
                <li>Ecosystem storytelling</li>
                <li>Black Future cultural layer</li>
              </ul>
              <Link href="/services" className="hp-pillar-cta hp-pillar-cta-green">Explore Brand →</Link>
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
            <div className="hp-strip-title">AI-Powered Operations</div>
            <div className="hp-strip-body">Smarter systems. Automated workflows. Operational excellence.</div>
          </div>
          <div className="hp-strip-sep" />
          <div className="hp-strip-item">
            <div className="hp-strip-icon">🏗️</div>
            <div className="hp-strip-title">Infrastructure That Scales</div>
            <div className="hp-strip-body">From documents to deployments, we build what businesses need to run and grow.</div>
          </div>
          <div className="hp-strip-sep" />
          <div className="hp-strip-item">
            <div className="hp-strip-icon">🌐</div>
            <div className="hp-strip-title">Creator &amp; Founder Ecosystem</div>
            <div className="hp-strip-body">Resources, visibility, collaborations, and opportunities for the next generation.</div>
          </div>
          <div className="hp-strip-sep" />
          <div className="hp-strip-item">
            <div className="hp-strip-icon">🚀</div>
            <div className="hp-strip-title">Movement Over Everything</div>
            <div className="hp-strip-body">We're not just building companies, we're building a future.</div>
          </div>
          <div className="hp-strip-sep" />
          <div className="hp-strip-statement">
            <p className="hp-strip-line">This isn't just software.</p>
            <p className="hp-strip-accent">This is Sovereignty.</p>
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
          <div className="hp-eyebrow hp-eyebrow-center">The Gateway</div>
          <h2 className="hp-gateway-h2">
            Built for This Generation.<br />
            <span className="hp-gateway-accent">Designed for What's Next.</span>
          </h2>
          <p className="hp-gateway-sub">
            Join the ecosystem. Build differently. Build Black Future.
          </p>
          <Link href="/turbo-intake" className="hp-btn hp-btn-primary hp-btn-xl">
            Start Your Build →
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
            <Link href="/turbo-systems" className="hp-footer-link-systems">⚡ Turbo Systems</Link>
            <Link href="/pricing" className="hp-footer-link">Pricing</Link>
            <Link href="/disclaimer" className="hp-footer-link">Disclaimer</Link>
          </nav>
          <p className="hp-footer-copy">
            © {new Date().getFullYear()} Turbo Response. AI systems and operational infrastructure.
            Not a law firm. No legal representation.
          </p>
        </div>
      </footer>

    </div>
  );
}

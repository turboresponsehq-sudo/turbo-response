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
            <Link href="/services" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Infrastructure</Link>
            <Link href="/industries" className="hp-nav-link" onClick={() => setMenuOpen(false)}>Industries</Link>
            <Link href="/turbo-systems" className="hp-nav-link hp-nav-systems" onClick={() => setMenuOpen(false)}>⚡ Turbo Systems</Link>
            <Link href="/turbo-intake" className="hp-nav-cta" onClick={() => setMenuOpen(false)}>Enter the Future →</Link>
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
          {/* Atmospheric rings layered over the image */}
          <div className="hp-founder-ring hp-founder-ring-1" />
          <div className="hp-founder-ring hp-founder-ring-2" />
          <div className="hp-founder-ring hp-founder-ring-3" />
          {/* The image itself */}
          <img
            src="/images/founder-hero.png"
            alt=""
            className="hp-founder-img"
            aria-hidden="true"
          />
          {/* Overlay layers that blend the image into the environment */}
          <div className="hp-founder-overlay-left" />
          <div className="hp-founder-overlay-bottom" />
          <div className="hp-founder-overlay-top" />
          <div className="hp-founder-glow-blue" />
          <div className="hp-founder-glow-purple" />
          {/* Floating particles */}
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
          {/* Left: content */}
          <div className="hp-hero-content">
            <div className="hp-hero-eyebrow">
              <span className="hp-badge-dot" />
              Culture. Systems. Impact.
            </div>

            <h1 className="hp-hero-h1">
              We Build<br />
              What's<br />
              <span className="hp-hero-accent">Next.</span>
            </h1>

            <p className="hp-hero-sub">
              Black Future is a movement, ecosystem, and intelligence network
              building the infrastructure for creators, founders, and innovators.
            </p>

            <div className="hp-hero-powered">
              <span className="hp-powered-label">Powered by</span>
              <span className="hp-powered-badge">⚡ TURBO RESPONSE</span>
            </div>

            <div className="hp-hero-btns">
              <Link href="/turbo-systems" className="hp-btn hp-btn-primary hp-btn-lg">
                Explore the Ecosystem →
              </Link>
              <Link href="/services" className="hp-btn hp-btn-ghost hp-btn-lg">
                See Our Systems →
              </Link>
            </div>
          </div>

          {/* Right: status panel */}
          <div className="hp-status-panel">
            <div className="hp-status-header">
              <span className="hp-status-title">Ecosystem Status</span>
              <span className="hp-status-live">● LIVE</span>
            </div>
            <div className="hp-status-divider" />
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
            <div className="hp-status-divider" />
            <div className="hp-status-footer">
              <span className="hp-status-label">Infrastructure</span>
              <span className="hp-status-online">ONLINE</span>
            </div>
          </div>
        </div>

        {/* Bottom horizon fade */}
        <div className="hp-hero-horizon" aria-hidden="true" />
      </section>

      {/* ── SECTION DIVIDER ────────────────────────────────────────────────── */}
      <div className="hp-divider hp-divider-blue" aria-hidden="true" />

      {/* ── TWO MODES ──────────────────────────────────────────────────────── */}
      <section className="hp-modes">
        <div className="hp-modes-bg" aria-hidden="true" />
        <div className="hp-section-inner">
          <div className="hp-eyebrow hp-eyebrow-center">Application Layer</div>
          <h2 className="hp-section-h2 hp-h2-center">
            Two Modes. One Infrastructure.
          </h2>
          <p className="hp-modes-sub">
            The operational engine for building, solving, and scaling what matters most.
          </p>

          <div className="hp-modes-grid">
            <div className="hp-mode-card hp-mode-build">
              <div className="hp-mode-glow hp-mode-glow-blue" aria-hidden="true" />
              <div className="hp-mode-header">
                <div className="hp-mode-icon hp-mode-icon-blue">⚡</div>
                <div>
                  <div className="hp-mode-tag">Build Mode</div>
                  <div className="hp-mode-tagline">Proactive infrastructure creation.</div>
                </div>
              </div>
              <ul className="hp-mode-list">
                <li><span className="hp-dot hp-dot-blue" />AI workflow setup</li>
                <li><span className="hp-dot hp-dot-blue" />Operational systems</li>
                <li><span className="hp-dot hp-dot-blue" />Document intelligence</li>
                <li><span className="hp-dot hp-dot-blue" />Founder operating systems</li>
                <li><span className="hp-dot hp-dot-blue" />Content &amp; media systems</li>
                <li><span className="hp-dot hp-dot-blue" />Research &amp; opportunity intelligence</li>
              </ul>
              <Link href="/turbo-intake" className="hp-mode-cta">Start a Build →</Link>
            </div>

            <div className="hp-mode-card hp-mode-response">
              <div className="hp-mode-glow hp-mode-glow-purple" aria-hidden="true" />
              <div className="hp-mode-header">
                <div className="hp-mode-icon hp-mode-icon-purple">🛡</div>
                <div>
                  <div className="hp-mode-tag hp-mode-tag-purple">Response Mode</div>
                  <div className="hp-mode-tagline">Operational problem solving.</div>
                </div>
              </div>
              <ul className="hp-mode-list">
                <li><span className="hp-dot hp-dot-purple" />Document-heavy situations</li>
                <li><span className="hp-dot hp-dot-purple" />Deadline-driven workflows</li>
                <li><span className="hp-dot hp-dot-purple" />Compliance responses</li>
                <li><span className="hp-dot hp-dot-purple" />Funding &amp; application prep</li>
                <li><span className="hp-dot hp-dot-purple" />Client intake challenges</li>
                <li><span className="hp-dot hp-dot-purple" />Operational breakdown recovery</li>
              </ul>
              <Link href="/turbo-intake" className="hp-mode-cta hp-mode-cta-purple">Get Operational Support →</Link>
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
      {/* ── CONSUMER SOLUTIONS ───────────────────────────────────────────────── */}
      <section className="hp-consumer-section">
        <div className="hp-consumer-inner">
          <h2 className="hp-consumer-title">Consumer Solutions</h2>
          <p className="hp-consumer-subtitle">Modern tools for modern challenges.</p>
          <p className="hp-consumer-description">
            Navigate credit, debt, housing, IRS matters, banking issues, and other real-world situations using structured support and AI-powered workflows.
          </p>
          <Link href="/consumer-solutions" className="hp-btn hp-btn-secondary hp-btn-lg">
            Explore Consumer Solutions →
          </Link>
        </div>
      </section>

      {/* ── GATEWAY ──────────────────────────────────────────────────────────── */}
      <section className="hp-gateway">        <div className="hp-gateway-bg" aria-hidden="true" />
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
            Enter the Future →
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
            <Link href="/services" className="hp-footer-link">Infrastructure</Link>
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

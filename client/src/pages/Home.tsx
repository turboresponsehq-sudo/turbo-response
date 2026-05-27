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

      {/* ── SECTION 1: HERO ────────────────────────────────────────────────── */}
      <section className="hp-hero">
        <div className="hp-hero-glow-blue" aria-hidden="true" />
        <div className="hp-hero-glow-purple" aria-hidden="true" />
        <div className="hp-hero-grid" aria-hidden="true" />

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
            <div className="hp-status-row">
              <span className="hp-status-label">Ecosystem Status</span>
              <span className="hp-status-value hp-status-green">● OPERATIONAL</span>
            </div>
            <div className="hp-status-divider" />
            <div className="hp-status-row">
              <span className="hp-status-label">Systems Deployed</span>
              <span className="hp-status-number">47+</span>
            </div>
            <div className="hp-status-divider" />
            <div className="hp-status-row">
              <span className="hp-status-label">Workflows Active</span>
              <span className="hp-status-number">128+</span>
            </div>
            <div className="hp-status-divider" />
            <div className="hp-status-row">
              <span className="hp-status-label">Intelligence Pipes</span>
              <span className="hp-status-number">23+</span>
            </div>
            <div className="hp-status-divider" />
            <div className="hp-status-row">
              <span className="hp-status-label">Infrastructure</span>
              <span className="hp-status-value hp-status-blue">ONLINE</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TWO MODES ───────────────────────────────────────────── */}
      <section className="hp-modes">
        <div className="hp-modes-glow" aria-hidden="true" />
        <div className="hp-section-inner">

          <div className="hp-eyebrow hp-eyebrow-center">Application Layer</div>
          <h2 className="hp-section-h2 hp-section-h2-center">
            Two Modes. One Infrastructure.
          </h2>
          <p className="hp-modes-sub">
            The operational engine for building, solving, and scaling what matters most.
          </p>

          <div className="hp-modes-grid">
            {/* Build Mode */}
            <div className="hp-mode-card hp-mode-build">
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

            {/* Response Mode */}
            <div className="hp-mode-card hp-mode-response">
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

      {/* ── SECTION 3: CAPABILITY STRIP ────────────────────────────────────── */}
      <section className="hp-strip">
        <div className="hp-strip-inner">
          <div className="hp-strip-item">
            <div className="hp-strip-icon">⚙️</div>
            <div className="hp-strip-title">AI-Powered Operations</div>
            <div className="hp-strip-body">Smarter systems. Automated workflows. Operational excellence.</div>
          </div>
          <div className="hp-strip-item">
            <div className="hp-strip-icon">🏗️</div>
            <div className="hp-strip-title">Infrastructure That Scales</div>
            <div className="hp-strip-body">From documents to deployments, we build what businesses need to run and grow.</div>
          </div>
          <div className="hp-strip-item">
            <div className="hp-strip-icon">🌐</div>
            <div className="hp-strip-title">Creator &amp; Founder Ecosystem</div>
            <div className="hp-strip-body">Resources, visibility, collaborations, and opportunities for the next generation.</div>
          </div>
          <div className="hp-strip-item">
            <div className="hp-strip-icon">🚀</div>
            <div className="hp-strip-title">Movement Over Everything</div>
            <div className="hp-strip-body">We're not just building companies, we're building a future.</div>
          </div>
          <div className="hp-strip-statement">
            <p className="hp-strip-statement-line">This isn't just software.</p>
            <p className="hp-strip-statement-accent">This is Sovereignty.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: GATEWAY CTA ─────────────────────────────────────────── */}
      <section className="hp-gateway">
        <div className="hp-gateway-horizon" aria-hidden="true" />
        <div className="hp-gateway-glow-blue" aria-hidden="true" />
        <div className="hp-gateway-glow-purple" aria-hidden="true" />
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
        </div>
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

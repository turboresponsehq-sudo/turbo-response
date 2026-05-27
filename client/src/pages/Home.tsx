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
            <Link href="/turbo-intake" className="hp-nav-cta" onClick={() => setMenuOpen(false)}>Build With Us</Link>
          </nav>
        </div>
      </header>

      {/* ── SECTION 1: HERO ────────────────────────────────────────────────── */}
      <section className="hp-hero">
        {/* Atmosphere layers */}
        <div className="hp-hero-glow-blue" aria-hidden="true" />
        <div className="hp-hero-glow-purple" aria-hidden="true" />
        <div className="hp-hero-grid" aria-hidden="true" />

        <div className="hp-hero-inner">
          <div className="hp-hero-eyebrow">
            <span className="hp-badge-dot" />
            Operational Intelligence Infrastructure
          </div>

          <h1 className="hp-hero-h1">
            We Build<br />
            <span className="hp-hero-accent">What's Next.</span>
          </h1>

          <p className="hp-hero-sub">
            AI systems, operational infrastructure, and intelligent workflows
            for founders, operators, and organizations serious about scale.
          </p>

          <div className="hp-hero-btns">
            <Link href="/turbo-systems" className="hp-btn hp-btn-primary hp-btn-lg">
              Enter the Ecosystem ⚡
            </Link>
            <Link href="/turbo-intake" className="hp-btn hp-btn-ghost hp-btn-lg">
              Start a Build →
            </Link>
          </div>

          <div className="hp-hero-meta">
            <span>Turbo Response</span>
            <span className="hp-meta-sep">·</span>
            <span>Black Future</span>
            <span className="hp-meta-sep">·</span>
            <span className="hp-meta-accent">Operational Sovereignty</span>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: THE ECOSYSTEM ───────────────────────────────────────── */}
      <section className="hp-ecosystem">
        <div className="hp-ecosystem-glow" aria-hidden="true" />
        <div className="hp-section-inner">

          <div className="hp-eyebrow">The Ecosystem</div>
          <h2 className="hp-section-h2">
            Two Layers.<br />
            <span className="hp-accent-text">One Vision.</span>
          </h2>

          <div className="hp-eco-split">
            <div className="hp-eco-block hp-eco-block-blue">
              <div className="hp-eco-block-label">⚡ Turbo Response</div>
              <h3 className="hp-eco-block-title">The Operational Engine</h3>
              <p className="hp-eco-block-body">
                AI systems, automation infrastructure, and production-grade operational architecture.
                The engine that powers ambitious organizations.
              </p>
              <Link href="/turbo-systems" className="hp-eco-link">Explore Systems →</Link>
            </div>
            <div className="hp-eco-divider" aria-hidden="true" />
            <div className="hp-eco-block hp-eco-block-purple">
              <div className="hp-eco-block-label hp-eco-block-label-purple">◈ Black Future</div>
              <h3 className="hp-eco-block-title">The Cultural Layer</h3>
              <p className="hp-eco-block-body">
                The founder movement, the community, and the cultural identity.
                Where builders and operators come together to build what comes next.
              </p>
              <Link href="/turbo-intake" className="hp-eco-link hp-eco-link-purple">Join the Movement →</Link>
            </div>
          </div>

          <p className="hp-eco-tagline">
            Together: <span className="hp-accent-text">Operational Sovereignty.</span>
          </p>
        </div>
      </section>

      {/* ── SECTION 3: WHAT WE BUILD ───────────────────────────────────────── */}
      <section className="hp-build">
        <div className="hp-build-glow" aria-hidden="true" />
        <div className="hp-section-inner">

          <div className="hp-eyebrow">What We Build</div>
          <h2 className="hp-section-h2">
            Real Infrastructure.<br />
            <span className="hp-accent-text">Not Just Tools.</span>
          </h2>

          <p className="hp-build-intro">
            We don't implement software. We design and deploy production-grade systems —
            AI pipelines, multi-agent workflows, and automated infrastructure
            that operates without manual intervention.
          </p>

          <div className="hp-build-grid">
            <div className="hp-build-card">
              <div className="hp-build-number">01</div>
              <h3 className="hp-build-title">AI Systems &amp; Automation</h3>
              <p className="hp-build-body">Multi-agent workflows, intelligent pipelines, and automated infrastructure that runs without manual intervention.</p>
            </div>
            <div className="hp-build-card">
              <div className="hp-build-number">02</div>
              <h3 className="hp-build-title">Operational Intelligence</h3>
              <p className="hp-build-body">Document intelligence, research systems, and opportunity pipelines that surface the right information at the right time.</p>
            </div>
            <div className="hp-build-card">
              <div className="hp-build-number">03</div>
              <h3 className="hp-build-title">Founder Infrastructure</h3>
              <p className="hp-build-body">Operating systems for founders — brand architecture, content infrastructure, and ecosystem organization built for scale.</p>
            </div>
          </div>

          <div className="hp-build-cta">
            <Link href="/services" className="hp-btn hp-btn-ghost">View All Infrastructure →</Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: TWO MODES ───────────────────────────────────────────── */}
      <section className="hp-modes">
        <div className="hp-section-inner">

          <div className="hp-eyebrow">How We Deploy</div>
          <h2 className="hp-section-h2">
            Two Modes.<br />
            <span className="hp-accent-text">One Infrastructure.</span>
          </h2>

          <div className="hp-modes-grid">
            <div className="hp-mode-card hp-mode-build">
              <div className="hp-mode-tag">⚡ Build Mode</div>
              <h3 className="hp-mode-title">Proactive Infrastructure Creation</h3>
              <p className="hp-mode-body">
                Deploy when you are building — AI workflows, operational systems, founder infrastructure,
                and the foundation your organization runs on.
              </p>
              <Link href="/turbo-intake" className="hp-btn hp-btn-primary">Start a Build →</Link>
            </div>
            <div className="hp-mode-card hp-mode-response">
              <div className="hp-mode-tag hp-mode-tag-dim">🛡️ Response Mode</div>
              <h3 className="hp-mode-title">Operational Problem Solving</h3>
              <p className="hp-mode-body">
                Deploy when you are reacting — deadline-driven situations, administrative challenges,
                or operational support under pressure.
              </p>
              <Link href="/turbo-intake" className="hp-btn hp-btn-ghost">Get Operational Support →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: GATEWAY CTA ─────────────────────────────────────────── */}
      <section className="hp-gateway">
        <div className="hp-gateway-glow-blue" aria-hidden="true" />
        <div className="hp-gateway-glow-purple" aria-hidden="true" />
        <div className="hp-gateway-inner">
          <div className="hp-eyebrow hp-eyebrow-center">Built For What's Next</div>
          <h2 className="hp-gateway-h2">
            The Infrastructure<br />
            <span className="hp-gateway-accent">Is Ready.</span>
          </h2>
          <p className="hp-gateway-sub">
            Turbo Response builds the operational systems that ambitious founders,
            creators, and organizations run on.
          </p>
          <div className="hp-gateway-btns">
            <Link href="/turbo-systems" className="hp-btn hp-btn-primary hp-btn-lg">
              Enter the Ecosystem ⚡
            </Link>
            <Link href="/turbo-intake" className="hp-btn hp-btn-ghost hp-btn-lg">
              Start a Build →
            </Link>
          </div>
          <p className="hp-gateway-url">turboresponsehq.ai</p>
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

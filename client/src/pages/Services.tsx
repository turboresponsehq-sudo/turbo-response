import { useEffect } from "react";
import { Link } from "wouter";
import "./Services.css";

const serviceCategories = [
  {
    id: "ai-systems",
    tag: "⚡ Service 01",
    title: "AI Systems & Automation",
    headline: "Infrastructure That Operates Without You.",
    body: "We design and deploy production-grade AI systems — intelligent workflows, multi-agent pipelines, and automation environments that execute complex operations without manual intervention. This is not task automation. This is operational infrastructure.",
    capabilities: [
      { icon: "⚙️", name: "Multi-Agent Workflow Systems", desc: "Autonomous agents that execute multi-step operations — intake, routing, document generation, and communication — end to end." },
      { icon: "📡", name: "Intelligence Pipelines", desc: "Daily scanning, classification, and delivery of actionable intelligence from regulatory, market, and custom data sources — fully automated." },
      { icon: "🧠", name: "Document Intelligence", desc: "AI systems that ingest, structure, extract, and act on document-heavy data at scale. No manual review required." },
      { icon: "🏗️", name: "Full-Stack Infrastructure Builds", desc: "Production-grade systems with authentication, database architecture, API layers, client portals, and CI/CD pipelines." },
      { icon: "🔁", name: "Operational Automation", desc: "Connect your existing tools — CRMs, payment systems, document platforms — into unified automated workflows with zero manual handoffs." },
      { icon: "📊", name: "Stability & Monitoring Protocols", desc: "Drift guards, version beacons, smoke tests, and structured incident response — built for systems that cannot afford to fail." },
    ],
    cta: { label: "Start an AI Systems Build →", href: "/turbo-intake" },
    accentClass: "sv-cat-blue",
  },
  {
    id: "research-intelligence",
    tag: "◈ Service 02",
    title: "Research & Opportunity Intelligence",
    headline: "Visibility Is Leverage.",
    body: "Most organizations are operating blind — unaware of the grants, programs, relationships, and market signals that could change their trajectory. We build intelligence systems that surface high-signal opportunities and deliver them on a schedule, automatically.",
    capabilities: [
      { icon: "💰", name: "Grant & Funding Intelligence", desc: "Automated scanning of SBA, federal, state, and private grant databases. Classified by relevance and delivered with action context." },
      { icon: "🔭", name: "Opportunity Research", desc: "Strategic research into accelerators, incubators, ecosystem programs, and capital sources aligned with your organization's direction." },
      { icon: "🤝", name: "Relationship Intelligence", desc: "Map high-value ecosystem contacts, strategic collaborators, and founder networks. Build relationship infrastructure, not random contact lists." },
      { icon: "📈", name: "Market & Ecosystem Intelligence", desc: "Ongoing monitoring of competitive signals, regulatory changes, and ecosystem shifts relevant to your operational environment." },
      { icon: "🎯", name: "Lead Intelligence Systems", desc: "AI-powered lead identification and qualification pipelines that surface high-probability opportunities before your competitors see them." },
      { icon: "🗺️", name: "Ecosystem Mapping", desc: "Visual and structural mapping of the organizations, programs, and relationships that constitute your strategic ecosystem." },
    ],
    cta: { label: "Start an Intelligence Build →", href: "/turbo-intake" },
    accentClass: "sv-cat-purple",
  },
  {
    id: "brand-media",
    tag: "◉ Service 03",
    title: "Brand, Content & Media Systems",
    headline: "Founder Identity. Built to Last.",
    body: "Your brand is infrastructure. It is the perception layer that determines who takes you seriously, who partners with you, and who follows your vision. We build founder brands and content systems that communicate operational intelligence, cultural depth, and ecosystem authority.",
    capabilities: [
      { icon: "🎬", name: "Founder Brand Architecture", desc: "Define and build your founder identity — positioning, voice, visual direction, and ecosystem narrative — from the ground up." },
      { icon: "📱", name: "Content System Design", desc: "Build repeatable content infrastructure: hooks, scripts, formats, and distribution systems that operate on a schedule without creative burnout." },
      { icon: "🎨", name: "Visual Identity & Direction", desc: "Cinematic, founder-oriented visual systems — dark mode aesthetics, color architecture, typography, and brand energy that signals operational seriousness." },
      { icon: "📡", name: "Social Media Infrastructure", desc: "Systematic social presence — not random posting. Platform-specific content strategies built around signal density and founder authority." },
      { icon: "✍️", name: "Ecosystem Storytelling", desc: "Narrative systems that communicate your vision, your systems, and your cultural identity to founders, collaborators, and communities." },
      { icon: "◈", name: "Black Future Cultural Direction", desc: "For founders building at the intersection of technology and culture — brand energy that reflects ambition, intelligence, and the future being built." },
    ],
    cta: { label: "Start a Brand Build →", href: "/turbo-intake" },
    accentClass: "sv-cat-green",
  },
];

export default function Services() {
  useEffect(() => {
    document.title = "Infrastructure Services — Turbo Response";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="sv-root">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="sv-header">
        <div className="sv-nav-inner">
          <Link href="/" className="sv-logo">
            <span>⚡</span>
            <span>TURBO RESPONSE</span>
          </Link>
          <nav className="sv-nav">
            <Link href="/services" className="sv-nav-link sv-nav-active">Infrastructure</Link>
            <Link href="/industries" className="sv-nav-link">Industries</Link>
            <Link href="/turbo-systems" className="sv-nav-link sv-nav-systems">⚡ Turbo Systems</Link>
            <Link href="/turbo-intake" className="sv-nav-cta">Build With Us</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="sv-hero">
        <div className="sv-hero-inner">
          <div className="sv-section-label">What We Build</div>
          <h1 className="sv-hero-h1">
            Operational Systems<br />
            <span className="sv-accent">for Ambitious Builders.</span>
          </h1>
          <p className="sv-hero-sub">
            Turbo Response builds AI systems, intelligence infrastructure, and brand architecture for founders, operators, and organizations that are serious about scale. Three service categories. One operational philosophy.
          </p>
          <div className="sv-hero-cats">
            <a href="#ai-systems" className="sv-cat-pill sv-cat-pill-blue">⚡ AI Systems & Automation</a>
            <a href="#research-intelligence" className="sv-cat-pill sv-cat-pill-purple">◈ Research & Opportunity Intelligence</a>
            <a href="#brand-media" className="sv-cat-pill sv-cat-pill-green">◉ Brand, Content & Media Systems</a>
          </div>
        </div>
      </section>

      {/* ── SERVICE CATEGORIES ─────────────────────────────────────────────── */}
      {serviceCategories.map((cat, idx) => (
        <section
          key={cat.id}
          id={cat.id}
          className={`sv-section ${idx % 2 === 1 ? "sv-bg-alt" : ""}`}
        >
          <div className="sv-section-inner">
            <div className={`sv-cat-tag ${cat.accentClass}`}>{cat.tag}</div>
            <h2 className="sv-cat-title">{cat.title}</h2>
            <p className="sv-cat-headline">{cat.headline}</p>
            <p className="sv-cat-body">{cat.body}</p>
            <div className="sv-cap-grid">
              {cat.capabilities.map(cap => (
                <div className="sv-cap-card" key={cap.name}>
                  <div className="sv-cap-icon">{cap.icon}</div>
                  <div className="sv-cap-name">{cap.name}</div>
                  <div className="sv-cap-desc">{cap.desc}</div>
                </div>
              ))}
            </div>
            <div className="sv-cat-cta">
              <Link href={cat.cta.href} className="sv-btn sv-btn-primary">
                {cat.cta.label}
              </Link>
            </div>
          </div>
        </section>
      ))}

      {/* ── POSITIONING STATEMENT ──────────────────────────────────────────── */}
      <section className="sv-section sv-bg-dark">
        <div className="sv-section-inner sv-statement-inner">
          <div className="sv-statement-left">
            <div className="sv-section-label-dark">The Philosophy</div>
            <h2 className="sv-statement-h2">
              We Don't Implement Tools.<br />
              <span className="sv-accent">We Build Infrastructure.</span>
            </h2>
            <p className="sv-statement-body">
              Every system we build is production-grade, version-controlled, monitored, and shipped with stability protocols. No prototypes. No guessing. No manual intervention required after deployment.
            </p>
            <Link href="/turbo-systems" className="sv-btn sv-btn-primary sv-mt">
              ⚡ See Turbo Systems →
            </Link>
          </div>
          <div className="sv-statement-right">
            {[
              "Production-grade. Not prototypes.",
              "Monitored. Not set-and-forget.",
              "Documented. Not tribal knowledge.",
              "Automated. Not manually operated.",
              "Scalable. Not duct-taped together.",
              "Operational sovereignty. Not dependency.",
            ].map(item => (
              <div className="sv-statement-item" key={item}>
                <span className="sv-statement-check">⚡</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GATEWAY CTA ────────────────────────────────────────────────────── */}
      <section className="sv-cta">
        <div className="sv-cta-inner">
          <div className="sv-cta-bolt">⚡</div>
          <h2 className="sv-cta-h2">
            Ready to Build Real Infrastructure?
          </h2>
          <p className="sv-cta-sub">
            Tell us what you are building. We will map the highest-leverage operational systems and define a build plan before any commitment.
          </p>
          <div className="sv-cta-btns">
            <Link href="/turbo-intake" className="sv-btn sv-btn-primary sv-btn-lg">
              Start a Build →
            </Link>
            <Link href="/turbo-systems" className="sv-btn sv-btn-ghost sv-btn-lg">
              ⚡ Explore Turbo Systems
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="sv-footer">
        <div className="sv-footer-inner">
          <div className="sv-footer-brand">⚡ Turbo Response — Operational Intelligence Infrastructure</div>
          <div className="sv-footer-links">
            <Link href="/" className="sv-footer-link">Home</Link>
            <Link href="/industries" className="sv-footer-link">Industries</Link>
            <Link href="/turbo-systems" className="sv-footer-link sv-footer-link-systems">⚡ Turbo Systems</Link>
            <Link href="/disclaimer" className="sv-footer-link">Disclaimer</Link>
          </div>
          <div className="sv-footer-copy">© 2026 Turbo Response HQ · turboresponsehq.ai · Operational intelligence and AI infrastructure systems.</div>
        </div>
      </footer>

    </div>
  );
}

import { useEffect } from "react";
import { Link } from "wouter";
import "./Pricing.css";

const tiers = [
  {
    tag: "01",
    name: "Starter Build",
    price: "$349",
    priceNote: "one-time",
    tagline: "For founders and creators who need a foundation.",
    description: "Your first operational system. Ideal for solo founders, creators, and operators who need to get organized, automate a workflow, or build a basic intelligence system from the ground up.",
    features: [
      "AI workflow design and setup",
      "Document organization and structuring",
      "Single automation or intelligence pipeline",
      "Operational intake or onboarding system",
      "Delivery within 5–7 business days",
    ],
    cta: "Start a Starter Build",
    href: "/turbo-intake",
    popular: false,
    accentClass: "pr-tier-dim",
  },
  {
    tag: "02",
    name: "Growth Infrastructure",
    price: "$997",
    priceNote: "starting at",
    tagline: "For operators ready to build serious systems.",
    description: "A full operational infrastructure engagement. Designed for businesses, agencies, and founders who need stronger AI workflows, research intelligence, document processing, or multi-system automation.",
    features: [
      "Multi-system AI workflow architecture",
      "Research or opportunity intelligence pipeline",
      "Document intelligence and extraction systems",
      "Operational dashboard or reporting layer",
      "Brand or content infrastructure setup",
      "Delivery within 10–14 business days",
    ],
    cta: "Build Your Infrastructure",
    href: "/turbo-intake",
    popular: true,
    accentClass: "pr-tier-blue",
  },
  {
    tag: "03",
    name: "Custom Ecosystem Build",
    price: "Custom",
    priceNote: "scoped per project",
    tagline: "For organizations building at scale.",
    description: "Full-stack operational infrastructure. For organizations that need multi-agent systems, intelligence pipelines, dashboards, automation environments, or complete ecosystem architecture. Scoped individually.",
    features: [
      "Full operational ecosystem architecture",
      "Multi-agent AI systems and pipelines",
      "Custom dashboards and intelligence environments",
      "Stability protocols and monitoring systems",
      "Ongoing infrastructure support and iteration",
      "Timeline and scope defined per engagement",
    ],
    cta: "Talk Through Your Ecosystem",
    href: "/turbo-intake",
    popular: false,
    accentClass: "pr-tier-purple",
  },
];

const faqs = [
  {
    q: "What happens after I submit an intake?",
    a: "We review your operational context, identify the highest-leverage systems, and send you a clear build plan before any commitment is required.",
  },
  {
    q: "Can I start with a Starter Build and scale up?",
    a: "Yes. Most clients start with a focused Starter Build to establish a foundation, then expand into Growth Infrastructure as their operational needs grow.",
  },
  {
    q: "What does 'Custom Ecosystem Build' include?",
    a: "Custom builds are scoped individually based on your operational environment. This may include multi-agent systems, intelligence pipelines, dashboards, automation environments, or full ecosystem architecture. We define the scope together before any work begins.",
  },
  {
    q: "Do you offer ongoing support after a build?",
    a: "Yes. Ongoing infrastructure support, iteration, and monitoring protocols are available as part of Custom Ecosystem engagements or as a separate retainer arrangement.",
  },
];

export default function Pricing() {
  useEffect(() => {
    document.title = "Pricing — Turbo Response";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pr-root">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="pr-header">
        <div className="pr-nav-inner">
          <Link href="/" className="pr-logo">
            <span>⚡</span>
            <span>TURBO RESPONSE</span>
          </Link>
          <nav className="pr-nav">
            <Link href="/services" className="pr-nav-link">Infrastructure</Link>
            <Link href="/industries" className="pr-nav-link">Industries</Link>
            <Link href="/turbo-systems" className="pr-nav-link pr-nav-systems">⚡ Turbo Systems</Link>
            <Link href="/turbo-intake" className="pr-nav-cta">Build With Us</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="pr-hero">
        <div className="pr-hero-inner">
          <div className="pr-section-label">Pricing</div>
          <h1 className="pr-hero-h1">
            Scalable Infrastructure.<br />
            <span className="pr-accent">Clear Pricing.</span>
          </h1>
          <p className="pr-hero-sub">
            Three tiers. One philosophy: build operational systems that create real leverage. Choose the engagement that fits your current stage and scale from there.
          </p>
        </div>
      </section>

      {/* ── PRICING TIERS ──────────────────────────────────────────────────── */}
      <section className="pr-section">
        <div className="pr-section-inner">
          <div className="pr-tiers-grid">
            {tiers.map(tier => (
              <div className={`pr-tier-card ${tier.accentClass} ${tier.popular ? "pr-tier-featured" : ""}`} key={tier.name}>
                {tier.popular && (
                  <div className="pr-tier-badge">⚡ Most Selected</div>
                )}
                <div className="pr-tier-tag">{tier.tag}</div>
                <h2 className="pr-tier-name">{tier.name}</h2>
                <div className="pr-tier-price-row">
                  <span className="pr-tier-price">{tier.price}</span>
                  <span className="pr-tier-price-note">{tier.priceNote}</span>
                </div>
                <p className="pr-tier-tagline">{tier.tagline}</p>
                <p className="pr-tier-desc">{tier.description}</p>
                <ul className="pr-tier-features">
                  {tier.features.map(f => (
                    <li key={f}>
                      <span className="pr-tier-check">→</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={tier.href} className={`pr-btn ${tier.popular ? "pr-btn-primary" : "pr-btn-ghost"} pr-tier-cta`}>
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RETAINER STRIP ─────────────────────────────────────────────────── */}
      <section className="pr-retainer">
        <div className="pr-retainer-inner">
          <div className="pr-retainer-left">
            <div className="pr-section-label-dark">Ongoing Infrastructure</div>
            <h2 className="pr-retainer-h2">Monthly Infrastructure Retainer</h2>
            <p className="pr-retainer-body">
              For founders and organizations that need continuous operational support, system iteration, intelligence updates, and ongoing infrastructure maintenance. Available by application.
            </p>
            <Link href="/turbo-intake" className="pr-btn pr-btn-ghost pr-mt">
              Apply for Retainer →
            </Link>
          </div>
          <div className="pr-retainer-right">
            <div className="pr-retainer-price">$297<span>/mo</span></div>
            <div className="pr-retainer-or">or $3,000/year</div>
            <ul className="pr-retainer-features">
              {[
                "Ongoing system iteration and updates",
                "Priority infrastructure support",
                "Monthly operational strategy session",
                "Intelligence pipeline maintenance",
                "Emergency system analysis",
              ].map(f => (
                <li key={f}>
                  <span className="pr-ret-check">→</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="pr-retainer-note">By application only</div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="pr-section">
        <div className="pr-section-inner pr-faq-inner">
          <div className="pr-section-label">Common Questions</div>
          <h2 className="pr-faq-h2">Before You Build</h2>
          <div className="pr-faq-grid">
            {faqs.map(faq => (
              <div className="pr-faq-card" key={faq.q}>
                <div className="pr-faq-q">{faq.q}</div>
                <div className="pr-faq-a">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GATEWAY CTA ────────────────────────────────────────────────────── */}
      <section className="pr-cta">
        <div className="pr-cta-inner">
          <div className="pr-cta-bolt">⚡</div>
          <h2 className="pr-cta-h2">
            Not Sure Which Tier Fits?
          </h2>
          <p className="pr-cta-sub">
            Submit an intake. We will review your operational context and recommend the right build before any commitment is required.
          </p>
          <div className="pr-cta-btns">
            <Link href="/turbo-intake" className="pr-btn pr-btn-primary pr-btn-lg">
              Start a Build →
            </Link>
            <Link href="/turbo-systems" className="pr-btn pr-btn-ghost pr-btn-lg">
              ⚡ Explore Turbo Systems
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="pr-footer">
        <div className="pr-footer-inner">
          <div className="pr-footer-brand">⚡ Turbo Response — Operational Intelligence Infrastructure</div>
          <div className="pr-footer-links">
            <Link href="/" className="pr-footer-link">Home</Link>
            <Link href="/services" className="pr-footer-link">Infrastructure</Link>
            <Link href="/industries" className="pr-footer-link">Industries</Link>
            <Link href="/turbo-systems" className="pr-footer-link pr-footer-link-systems">⚡ Turbo Systems</Link>
            <Link href="/disclaimer" className="pr-footer-link">Disclaimer</Link>
          </div>
          <div className="pr-footer-copy">© 2026 Turbo Response HQ · turboresponsehq.ai · Operational intelligence and AI infrastructure systems.</div>
        </div>
      </footer>

    </div>
  );
}

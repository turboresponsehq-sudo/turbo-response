import { useEffect } from "react";
import { Link } from "wouter";
import "./InfoPage.css";

const industries = [
  {
    icon: "🎯",
    name: "Credit Repair",
    body: "Organize disputes, timelines, credit records, and compliance workflows. Structure evidence for bureau and creditor submissions.",
  },
  {
    icon: "🧮",
    name: "Tax Professionals",
    body: "Process large volumes of tax documents, extract key figures, build client timelines, and prepare organized audit-ready files.",
  },
  {
    icon: "🛡️",
    name: "Insurance Claims",
    body: "Organize claim documentation, build incident timelines, identify missing records, and structure evidence for adjuster review.",
  },
  {
    icon: "⚖️",
    name: "Legal Services",
    body: "Manage case files, structure discovery documents, build chronologies, and prepare organized submission packages.",
  },
  {
    icon: "✅",
    name: "Compliance Work",
    body: "Organize regulatory documentation, track compliance timelines, identify gaps, and maintain audit-ready operational records.",
  },
  {
    icon: "🏥",
    name: "Medical Records",
    body: "Process patient documentation, extract critical information, build care timelines, and organize records for review or appeal.",
  },
  {
    icon: "🏠",
    name: "Housing / Real Estate",
    body: "Organize lease agreements, eviction records, correspondence, and property documentation into structured operational files.",
  },
  {
    icon: "💬",
    name: "Consumer Disputes",
    body: "Structure consumer complaint records, build dispute timelines, organize evidence, and prepare response documentation.",
  },
  {
    icon: "📁",
    name: "Case Management",
    body: "Centralize case files, track status, organize communications, and build repeatable intake and review workflows.",
  },
  {
    icon: "💼",
    name: "Consultants",
    body: "Build client deliverable systems, organize project documentation, and create repeatable operational workflows at scale.",
  },
  {
    icon: "🔧",
    name: "Service Businesses",
    body: "Organize operational records, client files, contracts, and compliance documentation into intelligent, searchable systems.",
  },
];

export default function Industries() {
  useEffect(() => {
    document.title = "Industries — Turbo Response";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="ip-root">

      {/* HEADER */}
      <header className="ip-header">
        <div className="ip-nav-inner">
          <Link href="/" className="ip-logo">
            <span>⚡</span>
            <span>TURBO RESPONSE</span>
          </Link>
          <nav className="ip-nav">
            <Link href="/services" className="ip-nav-link">Services</Link>
            <Link href="/industries" className="ip-nav-link ip-nav-active">Industries</Link>
            <Link href="/turbo-systems" className="ip-nav-link ip-nav-systems">⚡ Turbo Systems</Link>
            <Link href="/turbo-intake" className="ip-nav-cta">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="ip-hero">
        <div className="ip-section-label">Who We Serve</div>
        <h1 className="ip-hero-h1">Built for Document-Heavy Industries</h1>
        <p className="ip-hero-sub">
          Turbo Response helps organizations organize, process, structure, and operationalize information using intelligent systems — regardless of industry.
        </p>
      </section>

      {/* INDUSTRIES GRID */}
      <section className="ip-section">
        <div className="ip-section-inner">
          <div className="ip-grid">
            {industries.map(ind => (
              <div className="ip-card" key={ind.name}>
                <div className="ip-card-icon">{ind.icon}</div>
                <div className="ip-card-title">{ind.name}</div>
                <div className="ip-card-body">{ind.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ip-cta">
        <div className="ip-cta-inner">
          <h2 className="ip-cta-h2">
            If Your Business Runs on Documents,<br />
            <span className="ip-blue">We Should Talk.</span>
          </h2>
          <div className="ip-cta-btns">
            <Link href="/turbo-intake" className="ip-btn ip-btn-primary">Offense Intake →</Link>
            <Link href="/intake" className="ip-btn ip-btn-outline">Defense Intake →</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ip-footer">
        <div className="ip-footer-inner">
          <div className="ip-footer-brand">⚡ Turbo Response — Intelligent Operational Systems</div>
          <div className="ip-footer-links">
            <Link href="/" className="ip-footer-link">Home</Link>
            <Link href="/services" className="ip-footer-link">Services</Link>
            <Link href="/disclaimer" className="ip-footer-link">Disclaimer</Link>
          </div>
          <div className="ip-footer-copy">© 2026 Turbo Response HQ · www.turboresponsehq.ai</div>
        </div>
      </footer>

    </div>
  );
}

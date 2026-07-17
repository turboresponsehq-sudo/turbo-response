import { useEffect } from "react";
import { Link } from "wouter";
import "./Services.css";

const services = [
  {
    number: "01",
    title: "Document & Evidence Organization",
    description:
      "Transform scattered documents into organized, searchable, and actionable case files.",
    examples: [
      "Document review",
      "Evidence organization",
      "Timeline creation",
      "Fact extraction",
      "Contract review",
    ],
    accent: "#00BFFF",
  },
  {
    number: "02",
    title: "Research & Regulatory Intelligence",
    description:
      "Research regulations, agency guidance, policies, procedures, and public records that support better case decisions.",
    examples: [
      "Agency research",
      "Public records",
      "Policy research",
      "Regulatory guidance",
      "Compliance requirements",
    ],
    accent: "#8B5CF6",
  },
  {
    number: "03",
    title: "Case Preparation & Response Support",
    description:
      "Prepare organized documentation, supporting evidence, and structured case files before submission or review.",
    examples: [
      "Claim preparation",
      "Response drafting",
      "Administrative responses",
      "Complaint preparation",
      "Arbitration preparation",
    ],
    accent: "#10B981",
  },
  {
    number: "04",
    title: "Operational Workflow Support",
    description:
      "Improve documentation workflows, operational processes, and AI-assisted case management across your organization.",
    examples: [
      "Internal documentation",
      "Compliance reviews",
      "Process documentation",
      "Operational records",
      "Audit preparation",
    ],
    accent: "#F59E0B",
  },
  {
    number: "05",
    title: "Consumer Case Operations",
    description:
      "Support organizations managing consumer disputes, investigations, complaints, and documentation-intensive matters.",
    examples: [
      "Credit",
      "Housing",
      "Insurance",
      "Banking",
      "Employment",
      "Education",
      "Benefits",
      "Code Enforcement",
    ],
    accent: "#00BFFF",
  },
  {
    number: "06",
    title: "Organization Operations",
    description: "Support organizations managing complex documentation, investigations, compliance, and operational case workflows.",
    examples: [
      "Contracts",
      "Vendors",
      "Merchant accounts",
      "Internal investigations",
      "Risk documentation",
      "Regulatory matters",
      "Operations",
      "Arbitration",
    ],
    accent: "#8B5CF6",
  },
];

const howItWorks = [
  { step: "01", label: "Organize the information." },
  { step: "02", label: "Build the timeline." },
  { step: "03", label: "Research the regulations." },
  { step: "04", label: "Prepare the case." },
  { step: "05", label: "Move the case forward." },
];

const industries = [
  "Consumer Law Support Companies",
  "Case Operations Teams",
  "Intake Teams",
  "Documentation Specialists",
  "Operations Managers",
  "Investigation Teams",
  "Compliance Teams",
  "Organizations Managing Complex Cases",
];

export default function Services() {
  useEffect(() => {
    document.title = "Services — Turbo Response";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="sv-root">
      {/* Background */}
      <div className="sv-bg">
        <div className="sv-grid" />
        <div className="sv-orb sv-orb-1" />
        <div className="sv-orb sv-orb-2" />
      </div>

      {/* Header */}
      <header className="sv-header">
        <div className="sv-nav-inner">
          <Link href="/" className="sv-logo">
            <span className="sv-logo-icon">⚡</span>
            <span className="sv-logo-text">
              TURBO<span className="sv-logo-accent"> RESPONSE</span>
            </span>
          </Link>
          <nav className="sv-nav">
            <Link href="/" className="sv-nav-link">Home</Link>
            <Link href="/industries" className="sv-nav-link">Industries</Link>
            <Link href="/turbo-systems" className="sv-nav-link sv-nav-systems">⚡ Turbo Systems</Link>
            <Link href="/turbo-intake" className="sv-nav-cta">Start Your Matter →</Link>
          </nav>
        </div>
      </header>

      <main className="sv-main">
        {/* Page Header */}
        <section className="sv-hero">
          <div className="sv-hero-inner">
            <span className="sv-badge">⚡ AI-POWERED CASE OPERATIONS</span>
            <h1 className="sv-hero-h1">From Scattered Information to Organized Action.</h1>
            <p className="sv-hero-sub">
              Turbo Response helps organizations managing complex cases organize documentation,
              build timelines, manage evidence, research regulations, and prepare stronger case files with AI.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="sv-services-section">
          <h2 className="sv-section-heading">Case Operations Services</h2>
          <div className="sv-cards-grid">
            {services.map((s) => (
              <div
                className="sv-service-card"
                key={s.number}
                style={{ "--sv-accent": s.accent } as React.CSSProperties}
              >
                <div className="sv-card-num">{s.number}</div>
                <h3 className="sv-card-title">{s.title}</h3>
                <p className="sv-card-desc">{s.description}</p>
                <ul className="sv-card-examples">
                  {s.examples.map((ex) => (
                    <li key={ex}>
                      <span className="sv-dot" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="sv-hiw-section">
          <h2 className="sv-section-heading">How Turbo Response Helps</h2>
          <div className="sv-hiw-track">
            {howItWorks.map((item, idx) => (
              <div className="sv-hiw-item" key={item.step}>
                <div className="sv-hiw-circle">
                  <span>{item.step}</span>
                </div>
                <p className="sv-hiw-label">{item.label}</p>
                {idx < howItWorks.length - 1 && (
                  <div className="sv-hiw-connector">↓</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Industries */}
        <section className="sv-industries-section">
          <h2 className="sv-section-heading">Industries We Support</h2>
          <div className="sv-industries-grid">
            {industries.map((ind) => (
              <div className="sv-industry-chip" key={ind}>
                <span className="sv-industry-dot" />
                {ind}
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="sv-cta-section">
          <div className="sv-cta-inner">
            <h2 className="sv-cta-title">
              When Case Operations Matter,<br />Choose Turbo Response.
            </h2>
            <p className="sv-cta-body">
              Turbo Response helps organizations transform scattered information into organized action through AI-powered case operations, intelligent research, documentation management, and workflow support.
            </p>
            <Link href="/turbo-intake" className="sv-cta-btn">
              Start Your Matter →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="sv-footer">
        <div className="sv-footer-inner">
          <div className="sv-footer-logo">
            <span>⚡</span>
            <span>TURBO<span className="sv-logo-accent"> RESPONSE</span></span>
          </div>
          <p className="sv-footer-disclaimer">
            Turbo Response is an AI-powered case operations platform that helps organizations organize documentation, manage evidence, build timelines, research regulations, and improve operational workflows. Turbo Response does not provide legal advice or legal representation.
          </p>
          <div className="sv-footer-links">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </div>
          <p className="sv-footer-copy">© {new Date().getFullYear()} Turbo Response HQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

import { useEffect } from "react";
import { Link } from "wouter";
import "./Services.css";

const services = [
  {
    number: "01",
    title: "Document Intelligence & Organization",
    description:
      "Organize hundreds of pages of documentation into structured, actionable information.",
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
      "Research the laws, regulations, agency guidance, public records, and policies that apply to your situation.",
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
    title: "Claims & Response Preparation",
    description:
      "Prepare stronger documentation before submitting a complaint, claim, dispute, appeal, or response.",
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
    title: "Compliance & Documentation Support",
    description:
      "Help organizations manage documentation-heavy compliance and operational requirements.",
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
    title: "Consumer Solutions",
    description:
      "Support for individuals dealing with documentation-heavy situations.",
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
    title: "Business & Organization Solutions",
    description: "Support for companies and organizations.",
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
  { step: "01", label: "Review the documents." },
  { step: "02", label: "Identify what matters." },
  { step: "03", label: "Research the rules." },
  { step: "04", label: "Build a stronger response." },
  { step: "05", label: "Move forward with confidence." },
];

const industries = [
  "Consumers",
  "Small Businesses",
  "Contractors",
  "Property Owners",
  "Professional Services",
  "Compliance Teams",
  "Organizations",
  "Operations Leaders",
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
            <span className="sv-badge">⚡ LEGAL TECHNOLOGY FOR COMPLEX MATTERS</span>
            <h1 className="sv-hero-h1">From Information to Action.</h1>
            <p className="sv-hero-sub">
              Turbo Response helps consumers, businesses, and organizations organize documentation,
              identify what matters, conduct research, prepare stronger claims, and respond with confidence.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="sv-services-section">
          <h2 className="sv-section-heading">Our Services</h2>
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
              When the Matter Is Complex,<br />Call Turbo Response.
            </h2>
            <p className="sv-cta-body">
              Whether you're bringing a claim, responding to one, preparing documentation, conducting research,
              or navigating compliance, Turbo Response helps turn complexity into clarity.
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
            Turbo Response is a legal technology and operational support platform. We provide intelligent research,
            documentation, workflow, organization, compliance support, and matter preparation. We do not provide
            legal advice or legal representation. No attorney-client relationship is formed by use of this platform.
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

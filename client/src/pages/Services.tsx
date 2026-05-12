import { useEffect } from "react";
import { Link } from "wouter";
import "./InfoPage.css";

const services = [
  {
    icon: "📂",
    title: "Document Organization",
    body: "Transform scattered files, PDFs, emails, and records into structured, searchable, submission-ready operational systems. Stop losing time hunting for documents.",
    tags: ["File Structuring", "Categorization", "Searchable Systems"],
  },
  {
    icon: "📅",
    title: "Timeline Building",
    body: "Create organized, accurate visual timelines for cases, operations, and workflows. Automatically sequence events, dates, and actions from your documents.",
    tags: ["Event Sequencing", "Visual Timelines", "Case Chronology"],
  },
  {
    icon: "🔍",
    title: "Information Extraction",
    body: "Identify important dates, entities, parties, issues, and operational details quickly — without hours of manual review. Pull what matters, fast.",
    tags: ["Key Data Extraction", "Entity Detection", "Date Identification"],
  },
  {
    icon: "⚙️",
    title: "Workflow Preparation",
    body: "Build repeatable operational processes and intelligent workflows that scale. Move from ad hoc case handling to structured, consistent systems.",
    tags: ["Process Design", "Repeatable Systems", "Operational Scaling"],
  },
  {
    icon: "📋",
    title: "Evidence Structuring",
    body: "Organize records, communications, and supporting documentation logically and persuasively. Ensure nothing is missing before submission or review.",
    tags: ["Evidence Organization", "Gap Identification", "Submission Prep"],
  },
  {
    icon: "🧠",
    title: "Operational Intelligence",
    body: "Turn operational chaos into structured, decision-ready information. Surface the right context at the right time so your team can act with confidence.",
    tags: ["Information Architecture", "Decision Support", "Operational Clarity"],
  },
  {
    icon: "⏱️",
    title: "Process Support",
    body: "Help businesses reduce manual review time, improve accuracy, and handle more cases with less effort. More capacity. Less overhead. Better outcomes.",
    tags: ["Efficiency Gains", "Manual Review Reduction", "Capacity Building"],
  },
];

export default function Services() {
  useEffect(() => {
    document.title = "Services — Turbo Response";
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
            <Link href="/services" className="ip-nav-link ip-nav-active">Services</Link>
            <Link href="/industries" className="ip-nav-link">Industries</Link>
            <Link href="/turbo-systems" className="ip-nav-link ip-nav-systems">⚡ Turbo Systems</Link>
            <Link href="/turbo-intake" className="ip-nav-cta">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="ip-hero">
        <div className="ip-section-label">What We Do</div>
        <h1 className="ip-hero-h1">Intelligent Systems for<br />Document-Heavy Operations</h1>
        <p className="ip-hero-sub">
          Turbo Response helps businesses organize information, structure workflows, process documents, and improve operational clarity using AI-assisted systems.
        </p>
      </section>

      {/* SERVICES GRID */}
      <section className="ip-section">
        <div className="ip-section-inner">
          <div className="ip-services-grid">
            {services.map(s => (
              <div className="ip-service-card" key={s.title}>
                <div className="ip-service-icon">{s.icon}</div>
                <div className="ip-service-title">{s.title}</div>
                <div className="ip-service-body">{s.body}</div>
                <div className="ip-service-tags">
                  {s.tags.map(t => (
                    <span className="ip-service-tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS STRIP */}
      <section className="ip-section ip-bg-blue-tint">
        <div className="ip-section-inner">
          <div className="ip-section-label">The Process</div>
          <h2 className="ip-section-h2">From Intake to Organized, Submission-Ready Documentation</h2>
          <div className="ip-steps">
            {[
              { n: "01", title: "Intake", body: "Submit your situation through offense or defense intake. AI begins processing immediately." },
              { n: "02", title: "Organize", body: "Documents, facts, and timelines are structured into a clear, reviewable case file." },
              { n: "03", title: "Process", body: "AI-assisted systems draft responses, identify gaps, and prepare submission-ready materials." },
              { n: "04", title: "Deliver", body: "Receive organized documentation, response packages, and operational guidance." },
            ].map(s => (
              <div className="ip-step" key={s.n}>
                <div className="ip-step-num">{s.n}</div>
                <div className="ip-step-title">{s.title}</div>
                <div className="ip-step-body">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POSITIONING STATEMENT */}
      <section className="ip-section ip-bg-dark">
        <div className="ip-section-inner ip-statement-inner">
          <div className="ip-statement-left">
            <div className="ip-section-label-dark">The Goal</div>
            <h2 className="ip-section-h2 ip-white">The Goal Isn't Just AI.<br />The Goal Is <span className="ip-blue">Operational Leverage.</span></h2>
            <p className="ip-statement-body">
              Turbo Response combines AI + systems to turn document chaos into clarity, speed, and results. Better systems lead to better decisions and better outcomes.
            </p>
          </div>
          <div className="ip-statement-right">
            {[
              "Smarter Workflow.",
              "Stronger Cases.",
              "Better Outcomes.",
              "More Accuracy.",
              "More Efficiency.",
              "More Capacity.",
            ].map(item => (
              <div className="ip-statement-item" key={item}>
                <span className="ip-statement-arrow">⚡</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ip-cta">
        <div className="ip-cta-inner">
          <h2 className="ip-cta-h2">
            Ready to Build Smarter Systems?<br />
            <span className="ip-blue">Let's Talk.</span>
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
            <Link href="/industries" className="ip-footer-link">Industries</Link>
            <Link href="/disclaimer" className="ip-footer-link">Disclaimer</Link>
          </div>
          <div className="ip-footer-copy">© 2026 Turbo Response HQ · www.turboresponsehq.ai</div>
        </div>
      </footer>

    </div>
  );
}

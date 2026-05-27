import { useEffect } from "react";
import { Link } from "wouter";
import "./Industries.css";

const environments = [
  {
    id: "founders-creators",
    tag: "01",
    icon: "⚡",
    title: "Founders & Creators",
    headline: "Build the infrastructure behind the vision.",
    body: "Founders and creators operate in high-velocity environments where operational drag is the enemy. Turbo Response builds the systems that let you move faster — founder operating systems, content infrastructure, automation pipelines, and ecosystem organization.",
    applications: [
      "Founder operating systems and workflow architecture",
      "Content infrastructure and distribution automation",
      "Ecosystem organization and relationship intelligence",
      "Intake and onboarding automation",
      "Operational leverage systems",
      "Brand and media infrastructure",
    ],
    accentClass: "ind-blue",
  },
  {
    id: "agencies-service",
    tag: "02",
    icon: "🏗️",
    title: "Agencies & Service Businesses",
    headline: "Scale operations without scaling headcount.",
    body: "Agencies and service businesses are built on repeatable processes — but most still run on manual effort. We build the operational infrastructure that replaces manual workflows with intelligent automation, giving your team capacity to focus on high-value work.",
    applications: [
      "Client intake and onboarding pipeline automation",
      "Workflow automation and process standardization",
      "Operational systems and capacity infrastructure",
      "AI-assisted client communication and routing",
      "Document processing and delivery automation",
      "Reporting and operational intelligence dashboards",
    ],
    accentClass: "ind-blue",
  },
  {
    id: "legal-document",
    tag: "03",
    icon: "📋",
    title: "Legal & Document-Heavy Operations",
    headline: "Turn document chaos into operational clarity.",
    body: "Legal, compliance, and document-intensive operations require precision at scale. Turbo Response deploys document intelligence systems that ingest, extract, structure, and process large volumes of information — without the manual review bottleneck.",
    applications: [
      "Document intelligence and automated extraction",
      "Case file organization and timeline construction",
      "Evidence structuring and submission preparation",
      "Compliance workflow automation and gap identification",
      "Operational visibility across large document sets",
      "AI-powered processing for high-volume case environments",
    ],
    accentClass: "ind-purple",
  },
  {
    id: "funding-opportunity",
    tag: "04",
    icon: "🎯",
    title: "Funding & Opportunity-Driven Organizations",
    headline: "Intelligence is the competitive advantage.",
    body: "Organizations pursuing grants, capital, and strategic opportunities need more than research — they need intelligence systems that surface opportunities automatically, structure applications efficiently, and track outcomes operationally.",
    applications: [
      "Grant and funding intelligence automation",
      "Opportunity research and classification pipelines",
      "Application workflow organization and preparation",
      "Strategic information gathering and delivery",
      "Ecosystem and relationship intelligence systems",
      "Opportunity tracking and outcome management",
    ],
    accentClass: "ind-purple",
  },
  {
    id: "operations-heavy",
    tag: "05",
    icon: "⚙️",
    title: "Operations-Heavy Businesses",
    headline: "Infrastructure for organizations built on process.",
    body: "High-volume operational environments — logistics, healthcare administration, real estate, financial services — require systems that can process, organize, and act on large information flows without manual intervention. We build that infrastructure.",
    applications: [
      "Operational automation and workflow management",
      "Intelligence pipelines for high-volume data environments",
      "Organizational systems and information architecture",
      "Automated intake, routing, and processing workflows",
      "Operational visibility and decision-support systems",
      "Scalable infrastructure for growing operational complexity",
    ],
    accentClass: "ind-green",
  },
  {
    id: "consumer-rights",
    tag: "06",
    icon: "🛡️",
    title: "Consumer Rights & Advocacy",
    headline: "The same infrastructure, applied to individual leverage.",
    body: "Consumer rights is one application of the Turbo Response operational intelligence infrastructure. The same systems that power enterprise workflows — document organization, timeline construction, evidence structuring, and response automation — are applied here to help individuals and advocates navigate disputes, complaints, and recovery processes.",
    applications: [
      "Dispute documentation and evidence organization",
      "Response workflow construction and preparation",
      "Complaint and recovery process automation",
      "Defense documentation for notices and enforcement actions",
      "Operational documentation support for self-advocacy",
      "Timeline and chronology construction for submissions",
    ],
    accentClass: "ind-dim",
  },
];

export default function Industries() {
  useEffect(() => {
    document.title = "Operational Environments — Turbo Response";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="ind-root">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="ind-header">
        <div className="ind-nav-inner">
          <Link href="/" className="ind-logo">
            <span>⚡</span>
            <span>TURBO RESPONSE</span>
          </Link>
          <nav className="ind-nav">
            <Link href="/services" className="ind-nav-link">Infrastructure</Link>
            <Link href="/industries" className="ind-nav-link ind-nav-active">Industries</Link>
            <Link href="/turbo-systems" className="ind-nav-link ind-nav-systems">⚡ Turbo Systems</Link>
            <Link href="/turbo-intake" className="ind-nav-cta">Build With Us</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="ind-hero">
        <div className="ind-hero-inner">
          <div className="ind-section-label">Operational Environments</div>
          <h1 className="ind-hero-h1">
            One Infrastructure.<br />
            <span className="ind-accent">Applied Everywhere.</span>
          </h1>
          <p className="ind-hero-sub">
            Turbo Response operational intelligence infrastructure is not industry-specific. It is environment-specific. The same AI systems, automation pipelines, and workflow architecture are applied across six distinct operational environments — each with its own leverage points and outcomes.
          </p>
        </div>
      </section>

      {/* ── ENVIRONMENT CARDS ──────────────────────────────────────────────── */}
      <section className="ind-section">
        <div className="ind-section-inner">
          <div className="ind-env-grid">
            {environments.map(env => (
              <div className={`ind-env-card ${env.accentClass}`} key={env.id} id={env.id}>
                <div className="ind-env-header">
                  <div className="ind-env-tag">{env.tag}</div>
                  <div className="ind-env-icon">{env.icon}</div>
                </div>
                <h2 className="ind-env-title">{env.title}</h2>
                <p className="ind-env-headline">{env.headline}</p>
                <p className="ind-env-body">{env.body}</p>
                <div className="ind-env-apps">
                  {env.applications.map(app => (
                    <div className="ind-env-app" key={app}>
                      <span className="ind-env-arrow">→</span>
                      <span>{app}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POSITIONING STATEMENT ──────────────────────────────────────────── */}
      <section className="ind-statement">
        <div className="ind-statement-inner">
          <div className="ind-section-label-dark">The Core Principle</div>
          <h2 className="ind-statement-h2">
            The Infrastructure Is the Same.<br />
            <span className="ind-accent">The Application Changes.</span>
          </h2>
          <p className="ind-statement-body">
            Whether you are a founder building an ecosystem, an agency scaling operations, or an individual navigating a dispute — the underlying systems are identical. AI workflows, document intelligence, automation pipelines, and operational architecture. Built once. Applied everywhere.
          </p>
          <div className="ind-statement-ctas">
            <Link href="/services" className="ind-btn ind-btn-primary">
              Explore the Infrastructure →
            </Link>
            <Link href="/turbo-systems" className="ind-btn ind-btn-ghost">
              ⚡ See Turbo Systems
            </Link>
          </div>
        </div>
      </section>

      {/* ── GATEWAY CTA ────────────────────────────────────────────────────── */}
      <section className="ind-cta">
        <div className="ind-cta-inner">
          <div className="ind-cta-bolt">⚡</div>
          <h2 className="ind-cta-h2">
            Which Environment Are You Operating In?
          </h2>
          <p className="ind-cta-sub">
            Tell us your operational context. We will identify the highest-leverage systems and define a build plan.
          </p>
          <div className="ind-cta-btns">
            <Link href="/turbo-intake" className="ind-btn ind-btn-primary ind-btn-lg">
              Start a Build →
            </Link>
            <Link href="/intake" className="ind-btn ind-btn-ghost ind-btn-lg">
              Defense Intake →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="ind-footer">
        <div className="ind-footer-inner">
          <div className="ind-footer-brand">⚡ Turbo Response — Operational Intelligence Infrastructure</div>
          <div className="ind-footer-links">
            <Link href="/" className="ind-footer-link">Home</Link>
            <Link href="/services" className="ind-footer-link">Infrastructure</Link>
            <Link href="/turbo-systems" className="ind-footer-link ind-footer-link-systems">⚡ Turbo Systems</Link>
            <Link href="/disclaimer" className="ind-footer-link">Disclaimer</Link>
          </div>
          <div className="ind-footer-copy">© 2026 Turbo Response HQ · turboresponsehq.ai · Operational intelligence and AI infrastructure systems.</div>
        </div>
      </footer>

    </div>
  );
}

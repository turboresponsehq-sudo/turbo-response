import { Link } from "wouter";
import "./Home.css"; // Reuse homepage styling

export default function Services() {
  const services = [
    {
      icon: "🏠",
      title: "Eviction Defense",
      description: "Stop unlawful evictions with AI-generated legal responses citing tenant rights, habitability laws, and procedural violations."
    },
    {
      icon: "🚗",
      title: "Repossession Defense",
      description: "Challenge illegal repo attempts with detailed responses citing UCC violations, breach of peace, and consumer protection laws."
    },
    {
      icon: "🏛️",
      title: "IRS & Tax Issues",
      description: "Respond to IRS notices with professional game plans covering payment plans, penalty abatement, and taxpayer rights."
    },
    {
      icon: "📞",
      title: "Debt Collector Harassment",
      description: "Stop illegal collection tactics with FDCPA-based responses documenting violations and demanding cease communication."
    },
    {
      icon: "💳",
      title: "Credit Report Disputes",
      description: "Challenge inaccurate credit reporting with FCRA-compliant dispute letters demanding investigation and correction."
    },
    {
      icon: "💰",
      title: "Billing Disputes",
      description: "Contest unfair charges with detailed responses citing billing errors, unauthorized charges, and consumer protection laws."
    },
    {
      icon: "🔒",
      title: "Fraud & Identity Theft",
      description: "Combat fraud with comprehensive response packages including police reports, creditor notifications, and dispute letters."
    },
    {
      icon: "⚖️",
      title: "CFPB Complaints",
      description: "File professional CFPB complaints with detailed narratives, supporting evidence, and regulatory citations."
    },
    {
      icon: "📄",
      title: "Contract Disputes",
      description: "Challenge unfair contract terms with legal analysis citing unconscionability, misrepresentation, and breach of contract."
    },
    {
      icon: "🛡️",
      title: "General Consumer Defense",
      description: "Defend against any consumer rights violation with custom AI-generated legal strategies tailored to your situation."
    }
  ];

  return (
    <>
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="bg-grid"></div>
        <div className="floating-elements">
          <div className="floating-element"></div>
          <div className="floating-element"></div>
          <div className="floating-element"></div>
          <div className="floating-element"></div>
          <div className="floating-element"></div>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="nav-container">
          <Link href="/" className="logo">
            <div className="logo-icon">⚡</div>
            TURBO RESPONSE
          </Link>
          <nav className="nav-menu">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/services" className="nav-link">Services</Link>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/results" className="nav-link">Results</Link>
            <Link href="/testimonials" className="nav-link">Testimonials</Link>
            <Link href="/intake" className="nav-link nav-link-cta">Start Your Case</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            🤖 AI-Powered Legal Defense Services
          </div>
          <h1 className="hero-title">
            OUR SERVICES
          </h1>
          <p className="hero-description">
            We provide AI-powered legal game plans for every consumer rights situation. From evictions to debt collectors, our advanced technology delivers professional responses in minutes.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="features">
        <h2 className="features-title">Complete Consumer Protection Coverage</h2>
        <div className="features-grid">
          {services.map((service, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero" style={{ paddingTop: "60px", paddingBottom: "100px" }}>
        <div className="hero-content">
          <h2 className="features-title" style={{ marginBottom: "30px" }}>
            Ready to Defend Your Rights?
          </h2>
          <p className="hero-description" style={{ marginBottom: "40px" }}>
            Start your case now and get your AI-powered legal game plan in minutes.
          </p>
          <Link href="/intake" className="cta-button">
            🚀 START YOUR CASE
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: "rgba(15, 23, 42, 0.9)",
        borderTop: "1px solid rgba(26, 63, 199, 0.2)",
        padding: "40px 20px",
        textAlign: "center",
        color: "#cbd5e1"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p>© 2025 Turbo Response HQ. All rights reserved.</p>
          <div style={{ marginTop: "20px", display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/terms-of-service" style={{ color: "#1A3FC7", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/disclaimer" style={{ color: "#1A3FC7", textDecoration: "none" }}>Disclaimer</Link>
            <Link href="/service-agreement" style={{ color: "#1A3FC7", textDecoration: "none" }}>Service Agreement</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

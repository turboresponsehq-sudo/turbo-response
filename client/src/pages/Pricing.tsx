import { Link } from "wouter";

export default function Pricing() {
  const tiers = [
    {
      name: "Foundation Case Strategy",
      price: "$349",
      description: "Perfect for simple consumer disputes",
      features: [
        "Basic intake strategy",
        "Evidence review (light)",
        "Rights-based approach",
        "Great for simple disputes",
        "Entry-level tier"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Premium Case Architecture",
      price: "$997+",
      description: "Our core offering for complex cases",
      features: [
        "Full strategic case build",
        "Deep evidence mapping",
        "Timeline construction",
        "Legal rights pathway",
        "AI-powered analysis + human interpretation"
      ],
      cta: "Choose Premium",
      popular: true
    },
    {
      name: "Executive Case Buildout",
      price: "$2,500+",
      description: "For multi-agency and high-stakes disputes",
      features: [
        "Complex case handling",
        "Multi-agency disputes (IRS, fraud, banking, insurance)",
        "Full professional case file",
        "Strategy flows, evidence vault, rights maps",
        "Attorney-ready case package"
      ],
      cta: "Go Executive",
      popular: false
    }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Navigation */}
      <nav style={{
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)"
      }}>
        <Link href="/" style={{ color: "white", fontSize: "1.5rem", fontWeight: 700, textDecoration: "none" }}>
          Turbo Response
        </Link>
        <div style={{ display: "flex", gap: "2rem" }}>
          <Link href="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
          <Link href="/pricing" style={{ color: "white", textDecoration: "none", fontWeight: 600 }}>Pricing</Link>
          <Link href="/intake" style={{ color: "white", textDecoration: "none" }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ textAlign: "center", padding: "4rem 2rem 2rem 2rem", color: "white" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ fontSize: "1.25rem", opacity: 0.9, maxWidth: "600px", margin: "0 auto" }}>
          Choose the package that fits your case complexity. Final pricing depends on case details.
        </p>
      </div>

      {/* Pricing Cards */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "2rem"
      }}>
        {tiers.map((tier, index) => (
          <div
            key={index}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: tier.popular ? "0 20px 60px rgba(0,0,0,0.3)" : "0 10px 30px rgba(0,0,0,0.2)",
              transform: tier.popular ? "scale(1.05)" : "scale(1)",
              border: tier.popular ? "3px solid #fbbf24" : "none",
              position: "relative"
            }}
          >
            {tier.popular && (
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#fbbf24",
                color: "#000",
                padding: "0.5rem 1.5rem",
                borderRadius: "20px",
                fontWeight: 700,
                fontSize: "0.875rem"
              }}>
                ⭐ MOST POPULAR
              </div>
            )}

            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#212529", marginTop: tier.popular ? "1rem" : 0 }}>
              {tier.name}
            </h3>
            <div style={{ fontSize: "3rem", fontWeight: 700, color: "#667eea", margin: "1rem 0" }}>
              {tier.price}
            </div>
            <p style={{ color: "#6c757d", marginBottom: "1.5rem" }}>{tier.description}</p>

            <ul style={{ listStyle: "none", padding: 0, margin: "1.5rem 0" }}>
              {tier.features.map((feature, i) => (
                <li key={i} style={{ padding: "0.5rem 0", color: "#212529", display: "flex", alignItems: "flex-start" }}>
                  <span style={{ color: "#10b981", marginRight: "0.5rem", fontSize: "1.25rem" }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/intake">
              <button style={{
                width: "100%",
                padding: "1rem",
                background: tier.popular ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s"
              }}>
                {tier.cta}
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* Corporate Retainer Section */}
      <div style={{
        maxWidth: "800px",
        margin: "3rem auto",
        padding: "2rem",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        color: "white",
        textAlign: "center"
      }}>
        <h3 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>
          Corporate Monthly Retainer
        </h3>
        <div style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          $297/month or $3,000/year
        </div>
        <p style={{ fontSize: "1.125rem", opacity: 0.9, marginBottom: "1.5rem" }}>
          For entrepreneurs or clients with recurring issues
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "1.5rem auto", maxWidth: "500px", textAlign: "left" }}>
          {[
            "Unlimited document reviews",
            "Priority dispute building",
            "Monthly strategy sessions",
            "Emergency analysis",
            "Ongoing case tracking"
          ].map((feature, i) => (
            <li key={i} style={{ padding: "0.5rem 0", display: "flex", alignItems: "flex-start" }}>
              <span style={{ color: "#fbbf24", marginRight: "0.5rem", fontSize: "1.25rem" }}>✓</span>
              {feature}
            </li>
          ))}
        </ul>
        <div style={{
          display: "inline-block",
          padding: "0.75rem 2rem",
          background: "rgba(251, 191, 36, 0.2)",
          border: "2px solid #fbbf24",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "1rem"
        }}>
          📋 By Application Only
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "3rem 2rem", color: "white" }}>
        <p style={{ fontSize: "1.125rem", opacity: 0.9, marginBottom: "1.5rem" }}>
          Ready to defend your rights?
        </p>
        <Link href="/intake">
          <button style={{
            padding: "1rem 3rem",
            background: "white",
            color: "#667eea",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.125rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            Start Your Case Now →
          </button>
        </Link>
      </div>
    </div>
  );
}

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
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated background grid */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
        opacity: 0.3,
        zIndex: 0
      }} />

      {/* Navigation */}
      <nav style={{
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(10px)",
        position: "relative",
        zIndex: 10
      }}>
        <Link href="/" style={{ 
          color: "white", 
          fontSize: "1.5rem", 
          fontWeight: 700, 
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          ⚡ TURBO RESPONSE
        </Link>
        <div style={{ display: "flex", gap: "2rem" }}>
          <Link href="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
          <Link href="/pricing" style={{ color: "#06b6d4", textDecoration: "none", fontWeight: 600 }}>Pricing</Link>
          <Link href="/intake" style={{ color: "white", textDecoration: "none" }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ 
        textAlign: "center", 
        padding: "4rem 2rem 2rem 2rem", 
        color: "white",
        position: "relative",
        zIndex: 1
      }}>
        <h1 style={{ 
          fontSize: "3rem", 
          fontWeight: 700, 
          margin: 0, 
          marginBottom: "1rem",
          background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ fontSize: "1.25rem", opacity: 0.9, maxWidth: "600px", margin: "0 auto", color: "#e0e6ed" }}>
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
        gap: "2rem",
        position: "relative",
        zIndex: 1
      }}>
        {tiers.map((tier, index) => (
          <div
            key={index}
            style={{
              background: tier.popular ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)" : "#0f1e35",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: tier.popular ? "0 20px 60px rgba(6, 182, 212, 0.3)" : "0 10px 30px rgba(0,0,0,0.3)",
              transform: tier.popular ? "scale(1.05)" : "scale(1)",
              border: tier.popular ? "2px solid #06b6d4" : "1px solid rgba(6, 182, 212, 0.2)",
              position: "relative"
            }}
          >
            {tier.popular && (
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#06b6d4",
                color: "#0f172a",
                padding: "0.5rem 1.5rem",
                borderRadius: "20px",
                fontWeight: 700,
                fontSize: "0.875rem"
              }}>
                ⭐ MOST POPULAR
              </div>
            )}

            <h3 style={{ 
              fontSize: "1.5rem", 
              fontWeight: 700, 
              color: "white", 
              marginTop: tier.popular ? "1rem" : 0 
            }}>
              {tier.name}
            </h3>
            <div style={{ 
              fontSize: "3rem", 
              fontWeight: 700, 
              color: "#06b6d4", 
              margin: "1rem 0" 
            }}>
              {tier.price}
            </div>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>{tier.description}</p>

            <ul style={{ listStyle: "none", padding: 0, margin: "1.5rem 0" }}>
              {tier.features.map((feature, i) => (
                <li key={i} style={{ 
                  padding: "0.5rem 0", 
                  color: "#e0e6ed", 
                  display: "flex", 
                  alignItems: "flex-start" 
                }}>
                  <span style={{ color: "#06b6d4", marginRight: "0.5rem", fontSize: "1.25rem" }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/intake">
              <button style={{
                width: "100%",
                padding: "1rem",
                background: tier.popular 
                  ? "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" 
                  : "rgba(6, 182, 212, 0.1)",
                color: "white",
                border: tier.popular ? "none" : "2px solid #06b6d4",
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
        background: "rgba(15, 30, 53, 0.8)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        border: "2px solid rgba(6, 182, 212, 0.3)",
        color: "white",
        textAlign: "center",
        position: "relative",
        zIndex: 1
      }}>
        <h3 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem", color: "#06b6d4" }}>
          Corporate Monthly Retainer
        </h3>
        <div style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          $297/month or $3,000/year
        </div>
        <p style={{ fontSize: "1.125rem", opacity: 0.9, marginBottom: "1.5rem", color: "#94a3b8" }}>
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
              <span style={{ color: "#06b6d4", marginRight: "0.5rem", fontSize: "1.25rem" }}>✓</span>
              {feature}
            </li>
          ))}
        </ul>
        <div style={{
          display: "inline-block",
          padding: "0.75rem 2rem",
          background: "rgba(6, 182, 212, 0.1)",
          border: "2px solid #06b6d4",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "1rem"
        }}>
          📋 By Application Only
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: "center", 
        padding: "3rem 2rem", 
        color: "white",
        position: "relative",
        zIndex: 1
      }}>
        <p style={{ fontSize: "1.125rem", opacity: 0.9, marginBottom: "1.5rem", color: "#e0e6ed" }}>
          Ready to defend your rights?
        </p>
        <Link href="/intake">
          <button style={{
            padding: "1rem 3rem",
            background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.125rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(6, 182, 212, 0.3)"
          }}>
            Start Your Case Now →
          </button>
        </Link>
      </div>
    </div>
  );
}

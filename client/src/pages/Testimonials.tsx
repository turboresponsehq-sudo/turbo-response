import { Link } from "wouter";
import "./Home.css"; // Reuse homepage styling

export default function Testimonials() {
  const testimonials = [
    {
      name: "Marcus Johnson",
      location: "Los Angeles, CA",
      avatar: "👨🏾‍💼",
      category: "Eviction Defense",
      testimonial: "I was about to lose my apartment of 8 years over a bogus lease violation. Turbo Response generated a legal response in 6 hours that cited every tenant right I had. The eviction was dismissed and my landlord backed down completely. Worth every penny.",
      result: "Eviction dismissed. Stayed in home.",
      rating: 5
    },
    {
      name: "Sarah Chen",
      location: "Houston, TX",
      avatar: "👩‍💻",
      category: "Debt Collection Harassment",
      testimonial: "A debt collector was calling me 20 times a day and threatened to have me arrested. Turbo Response documented every FDCPA violation and helped me file a CFPB complaint. I got a $3,500 settlement and they never called again. This service is a game-changer.",
      result: "$3,500 settlement + harassment stopped",
      rating: 5
    },
    {
      name: "David Rodriguez",
      location: "Phoenix, AZ",
      avatar: "👨‍🔧",
      category: "Repossession Defense",
      testimonial: "My car was repo'd from my driveway at 2 AM without notice. Turbo Response identified the breach of peace violations and got my car back in 48 hours. They even got the lender to pay for my damaged fence. I couldn't believe how fast it worked.",
      result: "Vehicle returned + $2,800 damages",
      rating: 5
    },
    {
      name: "Jennifer Williams",
      location: "Atlanta, GA",
      avatar: "👩‍⚕️",
      category: "Credit Report Dispute",
      testimonial: "Three false late payments destroyed my credit score and I got denied for a mortgage. Turbo Response filed disputes with all three bureaus and every single one was removed. My score went up 95 points and I got my mortgage approved. Thank you!",
      result: "Credit score +95 points. Mortgage approved.",
      rating: 5
    },
    {
      name: "Michael Thompson",
      location: "Chicago, IL",
      avatar: "👨‍💼",
      category: "IRS Tax Relief",
      testimonial: "I owed $28,000 to the IRS and they were about to garnish my wages. Turbo Response prepared an Offer in Compromise that got my debt reduced to $8,500. The AI knew exactly what documentation I needed and how to present my case. Absolutely worth it.",
      result: "$19,500 debt reduction",
      rating: 5
    },
    {
      name: "Lisa Anderson",
      location: "Miami, FL",
      avatar: "👩‍🏫",
      category: "Hospital Billing Dispute",
      testimonial: "I was charged $47,000 for an emergency surgery with tons of billing errors. Turbo Response identified $23,000 in duplicate charges and helped me appeal to insurance. My bill went from $47k to $1,700 out of pocket. This saved my financial life.",
      result: "$45,300 in charges eliminated",
      rating: 5
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
            ⭐ 5-Star Reviews
          </div>
          <h1 className="hero-title">
            WHAT OUR<br />
            CLIENTS SAY
          </h1>
          <p className="hero-description">
            Real people, real results. See how Turbo Response has helped hundreds of consumers defend their rights against evictions, debt collectors, IRS threats, and unfair practices.
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="features">
        <h2 className="features-title">Client Success Stories</h2>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto", 
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "30px"
        }}>
          {testimonials.map((testimonial, index) => (
            <div key={index} style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              borderRadius: "16px",
              padding: "30px",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              position: "relative"
            }}>
              {/* Rating Stars */}
              <div style={{ 
                position: "absolute",
                top: "20px",
                right: "20px",
                color: "#eab308",
                fontSize: "18px"
              }}>
                {"⭐".repeat(testimonial.rating)}
              </div>

              {/* Avatar & Name */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ 
                  fontSize: "48px", 
                  marginRight: "15px",
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(6, 182, 212, 0.1)",
                  borderRadius: "50%"
                }}>
                  {testimonial.avatar}
                </div>
                <div>
                  <h3 style={{ 
                    color: "#f8fafc", 
                    fontSize: "18px", 
                    fontWeight: "700",
                    marginBottom: "5px"
                  }}>
                    {testimonial.name}
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>
                    {testimonial.location}
                  </p>
                </div>
              </div>

              {/* Category Badge */}
              <div style={{
                display: "inline-block",
                background: "rgba(6, 182, 212, 0.2)",
                color: "#06b6d4",
                padding: "6px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "15px"
              }}>
                {testimonial.category}
              </div>

              {/* Testimonial Text */}
              <p style={{ 
                color: "#cbd5e1", 
                fontSize: "15px", 
                lineHeight: "1.7",
                marginBottom: "20px",
                fontStyle: "italic"
              }}>
                "{testimonial.testimonial}"
              </p>

              {/* Result Box */}
              <div style={{
                background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))",
                borderRadius: "12px",
                padding: "15px",
                marginTop: "20px"
              }}>
                <strong style={{ color: "#06b6d4", display: "block", marginBottom: "5px", fontSize: "14px" }}>
                  ✅ Result:
                </strong>
                <p style={{ color: "#f8fafc", fontSize: "15px", fontWeight: "600" }}>
                  {testimonial.result}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="hero" style={{ paddingTop: "60px", paddingBottom: "40px" }}>
        <div className="hero-content">
          <h2 className="features-title" style={{ marginBottom: "30px" }}>
            Trusted by Hundreds of Consumers
          </h2>
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "60px", 
            flexWrap: "wrap",
            marginBottom: "40px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", fontWeight: "700", color: "#06b6d4" }}>500+</div>
              <div style={{ color: "#cbd5e1", fontSize: "16px" }}>Cases Resolved</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", fontWeight: "700", color: "#06b6d4" }}>$500K+</div>
              <div style={{ color: "#cbd5e1", fontSize: "16px" }}>Saved for Clients</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", fontWeight: "700", color: "#06b6d4" }}>4.9/5</div>
              <div style={{ color: "#cbd5e1", fontSize: "16px" }}>Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero" style={{ paddingTop: "20px", paddingBottom: "100px" }}>
        <div className="hero-content">
          <h2 className="features-title" style={{ marginBottom: "20px" }}>
            Join Our Success Stories
          </h2>
          <p className="hero-description" style={{ marginBottom: "40px" }}>
            Get your own AI-powered legal game plan and start defending your rights today.
          </p>
          <Link href="/intake" className="cta-button">
            🚀 START YOUR CASE NOW
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: "rgba(15, 23, 42, 0.9)",
        borderTop: "1px solid rgba(6, 182, 212, 0.2)",
        padding: "40px 20px",
        textAlign: "center",
        color: "#cbd5e1"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p>© 2025 Turbo Response HQ. All rights reserved.</p>
          <div style={{ marginTop: "20px", display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/terms-of-service" style={{ color: "#06b6d4", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/disclaimer" style={{ color: "#06b6d4", textDecoration: "none" }}>Disclaimer</Link>
            <Link href="/service-agreement" style={{ color: "#06b6d4", textDecoration: "none" }}>Service Agreement</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

import { Link } from "wouter";
import "./Home.css"; // Reuse homepage styling

export default function Pricing() {
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
            💰 Transparent Pricing
          </div>
          <h1 className="hero-title">
            CHOOSE YOUR<br />
            DEFENSE PLAN
          </h1>
          <p className="hero-description">
            Get professional AI-powered legal game plans at a fraction of traditional attorney costs. No hidden fees, no surprises — just fast, effective consumer defense.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <h2 className="pricing-title">Select Your Package</h2>
        <div className="pricing-grid">
          
          {/* Standard Plan */}
          <div className="pricing-card">
            <div className="pricing-badge" style={{ 
              background: "rgba(6, 182, 212, 0.1)", 
              color: "#06b6d4",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "20px",
              display: "inline-block"
            }}>
              MOST POPULAR
            </div>
            <div className="pricing-price">$349</div>
            <div className="pricing-name">Standard Legal Game Plan</div>
            <div className="pricing-description">
              <strong>Perfect for most consumer defense cases</strong>
              <ul style={{ textAlign: "left", marginTop: "20px", lineHeight: "1.8" }}>
                <li>✅ Full AI-powered case analysis</li>
                <li>✅ Custom legal response strategy</li>
                <li>✅ Specific law citations & precedents</li>
                <li>✅ Step-by-step action plan</li>
                <li>✅ Document templates & letters</li>
                <li>✅ Success probability scoring</li>
                <li>✅ Expert review included</li>
                <li>✅ Delivered within 24-48 hours</li>
              </ul>
            </div>
            <Link href="/intake" className="cta-button" style={{ marginTop: "30px" }}>
              Start Your Case
            </Link>
          </div>

          {/* Urgent Plan */}
          <div className="pricing-card" style={{
            border: "2px solid #06b6d4",
            boxShadow: "0 0 30px rgba(6, 182, 212, 0.3)"
          }}>
            <div className="pricing-badge" style={{ 
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)", 
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "20px",
              display: "inline-block"
            }}>
              ⚡ URGENT
            </div>
            <div className="pricing-price">$499</div>
            <div className="pricing-name">Same-Day Urgent Plan</div>
            <div className="pricing-description">
              <strong>For time-sensitive emergencies</strong>
              <ul style={{ textAlign: "left", marginTop: "20px", lineHeight: "1.8" }}>
                <li>✅ Everything in Standard Plan</li>
                <li>✅ <strong>Same-day delivery (8-12 hours)</strong></li>
                <li>✅ Priority AI processing</li>
                <li>✅ Expedited expert review</li>
                <li>✅ Direct email support</li>
                <li>✅ Emergency response templates</li>
                <li>✅ Court deadline assistance</li>
                <li>✅ 24/7 case submission</li>
              </ul>
            </div>
            <Link href="/intake" className="cta-button" style={{ marginTop: "30px" }}>
              Get Urgent Help
            </Link>
          </div>

          {/* Subscription Plan (Coming Soon) */}
          <div className="pricing-card" style={{ opacity: 0.7 }}>
            <div className="pricing-badge" style={{ 
              background: "rgba(139, 92, 246, 0.2)", 
              color: "#8b5cf6",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "20px",
              display: "inline-block"
            }}>
              COMING SOON
            </div>
            <div className="pricing-price">$99<span style={{ fontSize: "24px", fontWeight: "400" }}>/mo</span></div>
            <div className="pricing-name">Unlimited Subscription</div>
            <div className="pricing-description">
              <strong>Ongoing protection for active cases</strong>
              <ul style={{ textAlign: "left", marginTop: "20px", lineHeight: "1.8" }}>
                <li>✅ Unlimited case submissions</li>
                <li>✅ Monthly strategy updates</li>
                <li>✅ Priority support</li>
                <li>✅ Case progress tracking</li>
                <li>✅ Document library access</li>
                <li>✅ AI chat assistant</li>
                <li>✅ Cancel anytime</li>
                <li>✅ Best value for multiple cases</li>
              </ul>
            </div>
            <button 
              disabled 
              className="cta-button" 
              style={{ 
                marginTop: "30px",
                opacity: 0.5,
                cursor: "not-allowed"
              }}
            >
              Coming Soon
            </button>
          </div>

        </div>
      </section>

      {/* Money-Back Guarantee */}
      <section className="hero" style={{ paddingTop: "60px", paddingBottom: "100px" }}>
        <div className="hero-content">
          <div className="hero-badge" style={{ background: "rgba(234, 179, 8, 0.2)", color: "#eab308" }}>
            🛡️ 100% SATISFACTION GUARANTEE
          </div>
          <h2 className="features-title" style={{ marginBottom: "20px", marginTop: "20px" }}>
            Risk-Free Legal Defense
          </h2>
          <p className="hero-description" style={{ marginBottom: "40px" }}>
            If you're not completely satisfied with your AI-generated legal game plan, we'll revise it for free or provide a full refund. No questions asked.
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

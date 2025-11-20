import { Link } from "wouter";
import "../styles/Pricing.css";

export default function Pricing() {
  return (
    <div className="pricing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Turbo Response</span>
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/services" className="nav-link">Services</Link>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/results" className="nav-link">Results</Link>
            <Link href="/testimonials" className="nav-link">Testimonials</Link>
          </div>
          <Link href="/intake" className="cta-button">
            Start Your Case
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pricing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Professional Case Strategy<br />
            <span className="gradient-text">At a Fraction of Attorney Costs</span>
          </h1>
          <p className="hero-description">
            Get AI-powered legal game plans backed by professional analysis. No hidden fees, no surprises — just fast, effective consumer defense. Final pricing determined after case review.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <h2 className="pricing-title">Select Your Package</h2>
        <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "3rem", fontSize: "1.125rem" }}>
          All packages include AI-powered analysis. Final pricing depends on case complexity.
        </p>
        
        <div className="pricing-grid">
          
          {/* Foundation Tier */}
          <div className="pricing-card">
            <div className="pricing-badge" style={{ 
              background: "rgba(139, 92, 246, 0.1)", 
              color: "#8b5cf6",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "1px",
              marginBottom: "20px"
            }}>
              ENTRY LEVEL
            </div>
            <div className="pricing-price">$349</div>
            <div className="pricing-name">Foundation Case Strategy</div>
            <div className="pricing-description">
              <strong>Perfect for simple disputes</strong>
              <ul style={{ textAlign: "left", marginTop: "20px", lineHeight: "1.8" }}>
                <li>✓ Basic intake strategy</li>
                <li>✓ Evidence review (light)</li>
                <li>✓ Rights-based approach</li>
                <li>✓ AI-powered document analysis</li>
                <li>✓ Clear action steps</li>
                <li>✓ 48-hour turnaround</li>
              </ul>
            </div>
            <Link href="/intake" className="pricing-button">Get Started</Link>
          </div>

          {/* Premium Tier - MOST POPULAR */}
          <div className="pricing-card" style={{
            border: "2px solid #06b6d4",
            boxShadow: "0 0 30px rgba(6, 182, 212, 0.3)",
            transform: "scale(1.05)"
          }}>
            <div className="pricing-badge" style={{ 
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)", 
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "1px",
              marginBottom: "20px"
            }}>
              ⭐ MOST POPULAR
            </div>
            <div className="pricing-price">$997<span style={{ fontSize: "24px", fontWeight: "400" }}>+</span></div>
            <div className="pricing-name">Premium Case Architecture</div>
            <div className="pricing-description">
              <strong>Our core professional offering</strong>
              <ul style={{ textAlign: "left", marginTop: "20px", lineHeight: "1.8" }}>
                <li>✓ Full strategic case build</li>
                <li>✓ Deep evidence mapping</li>
                <li>✓ Timeline construction</li>
                <li>✓ Legal rights pathway</li>
                <li>✓ AI + human interpretation</li>
                <li>✓ Professional case file</li>
                <li>✓ 24-hour turnaround</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
            <Link href="/intake" className="pricing-button" style={{
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)"
            }}>Start Premium Case</Link>
          </div>

          {/* Executive Tier */}
          <div className="pricing-card">
            <div className="pricing-badge" style={{ 
              background: "linear-gradient(135deg, #f59e0b, #ef4444)", 
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "1px",
              marginBottom: "20px"
            }}>
              🏆 EXECUTIVE
            </div>
            <div className="pricing-price">$2,500<span style={{ fontSize: "24px", fontWeight: "400" }}>+</span></div>
            <div className="pricing-name">Executive Case Buildout</div>
            <div className="pricing-description">
              <strong>Complex multi-agency disputes</strong>
              <ul style={{ textAlign: "left", marginTop: "20px", lineHeight: "1.8" }}>
                <li>✓ IRS, fraud, banking issues</li>
                <li>✓ Insurance claims, repos, evictions</li>
                <li>✓ Full professional case file</li>
                <li>✓ Strategy flows + evidence vault</li>
                <li>✓ Rights maps + legal pathways</li>
                <li>✓ "Attorney-ready" package</li>
                <li>✓ Same-day turnaround</li>
                <li>✓ White-glove support</li>
              </ul>
            </div>
            <Link href="/intake" className="pricing-button">Start Executive Case</Link>
          </div>

        </div>

        {/* Retainer Option */}
        <div style={{ 
          maxWidth: "800px", 
          margin: "4rem auto 0", 
          padding: "2rem", 
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))",
          borderRadius: "16px",
          border: "2px solid rgba(139, 92, 246, 0.3)"
        }}>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ 
              fontSize: "1.75rem", 
              fontWeight: "700", 
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Corporate / Monthly Retainer
            </h3>
            <p style={{ fontSize: "2rem", fontWeight: "700", color: "#fff", marginBottom: "0.5rem" }}>
              $297/month <span style={{ fontSize: "1.25rem", fontWeight: "400", color: "#94a3b8" }}>or</span> $3,000/year
            </p>
            <p style={{ 
              display: "inline-block",
              padding: "6px 16px",
              background: "rgba(139, 92, 246, 0.2)",
              border: "1px solid rgba(139, 92, 246, 0.4)",
              borderRadius: "20px",
              fontSize: "0.875rem",
              fontWeight: "700",
              color: "#a78bfa",
              marginBottom: "1.5rem"
            }}>
              BY APPLICATION ONLY
            </p>
            <ul style={{ 
              textAlign: "left", 
              maxWidth: "500px", 
              margin: "0 auto", 
              lineHeight: "1.8",
              color: "#cbd5e1"
            }}>
              <li>✓ For entrepreneurs with recurring issues</li>
              <li>✓ Unlimited document reviews</li>
              <li>✓ Priority dispute building</li>
              <li>✓ Monthly strategy sessions</li>
              <li>✓ Emergency analysis</li>
              <li>✓ Ongoing case tracking</li>
            </ul>
            <a 
              href="mailto:support@turboresponsehq.com?subject=Corporate%20Retainer%20Application"
              style={{
                display: "inline-block",
                marginTop: "2rem",
                padding: "14px 32px",
                background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "1rem"
              }}
            >
              Apply for Retainer
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ 
        maxWidth: "900px", 
        margin: "6rem auto", 
        padding: "0 2rem" 
      }}>
        <h2 style={{ 
          fontSize: "2.5rem", 
          fontWeight: "700", 
          textAlign: "center", 
          marginBottom: "3rem",
          color: "#fff"
        }}>
          Frequently Asked Questions
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ 
            padding: "2rem", 
            background: "rgba(30, 41, 59, 0.5)", 
            borderRadius: "12px",
            border: "1px solid rgba(148, 163, 184, 0.1)"
          }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem", color: "#fff" }}>
              How is final pricing determined?
            </h3>
            <p style={{ color: "#cbd5e1", lineHeight: "1.8" }}>
              After you submit your intake form, our team reviews your case complexity, evidence volume, and urgency. We then assign the appropriate tier and send you a payment link with the exact amount.
            </p>
          </div>

          <div style={{ 
            padding: "2rem", 
            background: "rgba(30, 41, 59, 0.5)", 
            borderRadius: "12px",
            border: "1px solid rgba(148, 163, 184, 0.1)"
          }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem", color: "#fff" }}>
              What if my case doesn't fit a tier?
            </h3>
            <p style={{ color: "#cbd5e1", lineHeight: "1.8" }}>
              We offer custom pricing for unique situations. After reviewing your case, we'll provide a tailored quote based on the specific work required.
            </p>
          </div>

          <div style={{ 
            padding: "2rem", 
            background: "rgba(30, 41, 59, 0.5)", 
            borderRadius: "12px",
            border: "1px solid rgba(148, 163, 184, 0.1)"
          }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem", color: "#fff" }}>
              Do you offer refunds?
            </h3>
            <p style={{ color: "#cbd5e1", lineHeight: "1.8" }}>
              We stand behind our work. If you're not satisfied with your case strategy, contact us within 7 days for a full refund—no questions asked.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        textAlign: "center", 
        padding: "6rem 2rem",
        background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))",
        borderTop: "1px solid rgba(148, 163, 184, 0.1)"
      }}>
        <h2 style={{ 
          fontSize: "3rem", 
          fontWeight: "700", 
          marginBottom: "1.5rem",
          color: "#fff"
        }}>
          Ready to Defend Your Rights?
        </h2>
        <p style={{ 
          fontSize: "1.25rem", 
          color: "#cbd5e1", 
          marginBottom: "2rem",
          maxWidth: "600px",
          margin: "0 auto 2rem"
        }}>
          Get your professional case strategy in 24-48 hours. No hidden fees, no surprises.
        </p>
        <Link 
          href="/intake" 
          style={{
            display: "inline-block",
            padding: "18px 48px",
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "1.125rem",
            boxShadow: "0 10px 30px rgba(6, 182, 212, 0.3)"
          }}
        >
          Start Your Case Now →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ 
        textAlign: "center", 
        padding: "3rem 2rem",
        borderTop: "1px solid rgba(148, 163, 184, 0.1)",
        color: "#94a3b8"
      }}>
        <p>© 2025 Turbo Response. All rights reserved.</p>
        <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
          Professional consumer defense strategies powered by AI.
        </p>
      </footer>
    </div>
  );
}

import { Link } from "wouter";
import "./Home.css";

export default function Home() {
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
            🤖 Powered by Advanced AI Technology
          </div>
          <h1 className="hero-title">
            AI-POWERED<br />
            CONSUMER DEFENSE
          </h1>
          <p className="hero-description">
            We are a next-generation, AI-powered consumer rights platform that delivers rapid legal responses in minutes — not days. Built with cutting-edge technology, our platform empowers everyday people to stand up against unfair practices, while giving them a seamless, modern experience.
          </p>
          <p className="hero-subtitle">
            Stop evictions, IRS threats, and debt collectors with professional legal game plans generated in minutes using cutting-edge AI
          </p>
          <Link href="/intake" className="cta-button">
            🚀 GET STARTED
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="features-title">Next-Generation Legal Defense</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>AI-Powered Analysis</h3>
            <p>Advanced machine learning analyzes your case and generates the perfect legal response game plan</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Get professional legal game plans in minutes, not days. Our AI works 24/7 to protect your rights</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Expert Reviewed</h3>
            <p>Every AI-generated game plan is reviewed by consumer rights specialists for maximum effectiveness</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Precision Targeting</h3>
            <p>AI identifies the exact laws and regulations to cite for your specific situation and jurisdiction</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Bank-Level Security</h3>
            <p>Your sensitive information is protected with military-grade encryption and secure processing</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Success Analytics</h3>
            <p>Track your case progress with real-time analytics and success probability scoring</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <h2 className="pricing-title">Choose Your Case Defense Package</h2>
        <div className="pricing-grid pricing-grid-four">
          <div className="pricing-card">
            <div className="pricing-price">$349</div>
            <div className="pricing-name">Foundation Case Strategy</div>
            <div className="pricing-description">
              Perfect for straightforward consumer disputes. AI-powered case analysis, custom response letter, legal strategy outline, one round of revisions
            </div>
            <Link href="/intake" className="cta-button">
              Get Started
            </Link>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-price">$997+</div>
            <div className="pricing-name">Premium Case Architecture</div>
            <div className="pricing-description">
              For complex disputes requiring multi-stage defense. Complete case buildout, multiple response letters, escalation strategy, 60-day support
            </div>
            <Link href="/intake" className="cta-button">
              Get Started
            </Link>
          </div>
          <div className="pricing-card">
            <div className="pricing-price">$2,500+</div>
            <div className="pricing-name">Executive Case Buildout</div>
            <div className="pricing-description">
              For high-stakes cases with significant financial impact. Full legal team coordination, expert witness preparation, court-ready documentation, priority 24/7 support
            </div>
            <Link href="/intake" className="cta-button">
              Get Started
            </Link>
          </div>
          <div className="pricing-card">
            <div className="pricing-price">$297/mo</div>
            <div className="pricing-name">Corporate Monthly Retainer</div>
            <div className="pricing-description">
              Ongoing protection for businesses. Unlimited case consultations, priority response times, dedicated account manager, quarterly strategy reviews
            </div>
            <Link href="/intake" className="cta-button">
              Get Started
            </Link>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/pricing" className="cta-button" style={{ background: 'transparent', border: '2px solid #06b6d4', color: '#06b6d4' }}>
            View Full Pricing Details →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-text">
          © 2025 Rapid Response AI. Advanced consumer defense technology.
        </div>
        <div className="footer-text">
          🔒 Secure • 🤖 AI-Powered • ⚡ Lightning Fast
        </div>
      </footer>
    </>
  );
}

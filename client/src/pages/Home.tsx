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
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-price">$149</div>
            <div className="pricing-name">Case Starter Plan</div>
            <div className="pricing-description">
              For light disputes or single-notice responses. One case review + AI-assisted response, personalized legal strategy outline, email follow-up + one revision
            </div>
            <Link href="/intake" className="cta-button">
              Start Your Case
            </Link>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-price">$349</div>
            <div className="pricing-name">Standard Defense Plan</div>
            <div className="pricing-description">
              For multi-step disputes or recurring issues. Full AI + expert-reviewed case defense, 30-day follow-up & resubmission support, document prep + escalation guidance
            </div>
            <Link href="/intake" className="cta-button">
              Most Popular
            </Link>
          </div>
          <div className="pricing-card">
            <div className="pricing-price">Starting at $699</div>
            <div className="pricing-name">Comprehensive Case Management</div>
            <div className="pricing-description">
              For complex or high-value cases. End-to-end case handling, multi-stage dispute letters + appeals, ongoing updates + analytics dashboard access, priority support
            </div>
            <Link href="/intake" className="cta-button">
              Start Your Case
            </Link>
          </div>
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

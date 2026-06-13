import { Link } from "wouter";
import "./ConsumerSolutions.css";

export default function ConsumerSolutions() {
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
            <Link href="/violations" className="nav-link">Consumer Rights</Link>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/results" className="nav-link">Results</Link>
            <Link href="/testimonials" className="nav-link">Testimonials</Link>
            <Link href="/" className="nav-link nav-link-cta">Back to Home</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Practical Solutions for Real-World Challenges
          </h1>
          <p className="hero-description">
            Turbo Response helps consumers navigate credit, debt, housing, IRS, banking, and other real-world challenges through document preparation, research support, action plans, and practical guidance designed to help you move forward.
          </p>

          {/* Two Direct Action Buttons — no extra steps */}
          <div className="decision-grid" style={{ marginTop: '2rem' }}>
            <div className="decision-card defense-card">
              <div className="decision-icon">🛡️</div>
              <h3 className="decision-heading">I'm Responding to Something</h3>
              <p className="decision-label">Defense</p>
              <div className="examples">
                <p className="examples-title">Examples:</p>
                <ul>
                  <li>Eviction notice</li>
                  <li>Debt collection letter</li>
                  <li>IRS notice</li>
                  <li>Wage garnishment</li>
                  <li>Benefits denial</li>
                  <li>Repossession</li>
                  <li>Enforcement action</li>
                </ul>
              </div>
              <Link href="/intake" className="cta-button primary-button">
                Respond to a Notice →
              </Link>
            </div>
            <div className="decision-card offense-card">
              <div className="decision-icon">⚔️</div>
              <h3 className="decision-heading">I'm Taking Action</h3>
              <p className="decision-label">Offense</p>
              <div className="examples">
                <p className="examples-title">Examples:</p>
                <ul>
                  <li>Filing a dispute</li>
                  <li>Requesting reconsideration</li>
                  <li>Applying for relief</li>
                  <li>Seeking compensation</li>
                  <li>Submitting a complaint</li>
                  <li>Recovering funds</li>
                  <li>Initiating a claim</li>
                </ul>
              </div>
              <Link href="/intake-offense" className="cta-button secondary-button">
                Apply, File, or Take Action →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What We Help With */}
      <section className="what-we-help">
            <div className="section-container">
              <h2 className="section-title">What We Help With</h2>
              <div className="help-grid">
                <div className="help-card">
                  <div className="help-icon">🏠</div>
                  <h3>Housing & Eviction</h3>
                  <p>Navigate eviction notices, wrongful evictions, and housing disputes with proper documentation and defense strategies.</p>
                </div>
                <div className="help-card">
                  <div className="help-icon">💳</div>
                  <h3>Debt & Collections</h3>
                  <p>Challenge illegal debt collection practices, dispute debts you don't owe, and protect your rights under the FDCPA.</p>
                </div>
                <div className="help-card">
                  <div className="help-icon">📋</div>
                  <h3>IRS & Tax Issues</h3>
                  <p>Respond to IRS notices, audits, and assessments with organized documentation and clear action plans.</p>
                </div>
                <div className="help-card">
                  <div className="help-icon">💰</div>
                  <h3>Wage Garnishment</h3>
                  <p>Challenge improper wage garnishments and protect your income with proper legal responses.</p>
                </div>
                <div className="help-card">
                  <div className="help-icon">🛡️</div>
                  <h3>Credit & Reporting</h3>
                  <p>Dispute inaccurate credit reports and challenge violations of the Fair Credit Reporting Act.</p>
                </div>
                <div className="help-card">
                  <div className="help-icon">⚖️</div>
                  <h3>Consumer Rights</h3>
                  <p>Understand your rights and take action against unfair, deceptive, or illegal business practices.</p>
                </div>
              </div>
            </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
            <div className="section-container">
              <h2 className="section-title">How It Works</h2>
              <div className="steps-grid">
                <div className="step">
                  <div className="step-number">1</div>
                  <h3>Tell Us Your Situation</h3>
                  <p>Submit your case details through our intake form. The more information you provide, the better we can help.</p>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <h3>We Analyze & Plan</h3>
                  <p>Our AI-powered system analyzes your situation and creates a structured action plan tailored to your needs.</p>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <h3>Get Documentation</h3>
                  <p>Receive professionally prepared documents, response letters, and guidance to move your case forward.</p>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <h3>Take Action</h3>
                  <p>Submit your documentation with confidence. We provide ongoing support as your situation evolves.</p>
                </div>
              </div>
            </div>
      </section>

      {/* Why Choose Turbo Response */}
      <section className="why-choose">
            <div className="section-container">
              <h2 className="section-title">Why Choose Turbo Response</h2>
              <div className="benefits-grid">
                <div className="benefit">
                  <div className="benefit-icon">⚡</div>
                  <h3>Fast & Efficient</h3>
                  <p>AI-driven processing means faster turnaround times and more organized documentation.</p>
                </div>
                <div className="benefit">
                  <div className="benefit-icon">📊</div>
                  <h3>Structured & Complete</h3>
                  <p>Nothing critical is missed. We ensure your documentation is complete, organized, and submission-ready.</p>
                </div>
                <div className="benefit">
                  <div className="benefit-icon">🎯</div>
                  <h3>Clear & Compelling</h3>
                  <p>Your case is framed clearly so decision-makers can easily understand and act on your documentation.</p>
                </div>
                <div className="benefit">
                  <div className="benefit-icon">✓</div>
                  <h3>Procedurally Sound</h3>
                  <p>We follow all rules, standards, and deadlines so your documentation withstands review.</p>
                </div>
              </div>
            </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 Turbo Response. All rights reserved.</p>
          <div className="footer-links">
            <Link href="/disclaimer" className="footer-link">Disclaimer</Link>
            <Link href="/terms-of-service" className="footer-link">Terms of Service</Link>
            <Link href="/" className="footer-link">Home</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

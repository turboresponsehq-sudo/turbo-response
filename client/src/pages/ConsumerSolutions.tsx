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
          </nav>
        </div>
      </header>

      {/* Page Header */}
      <section className="hero" style={{ minHeight: 'auto', paddingBottom: '2rem' }}>
        <div className="hero-content">
          <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
            Consumer Solutions
          </h1>
          <p style={{ color: '#06b6d4', fontWeight: '600', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Modern tools for modern challenges.
          </p>
          <p className="hero-description">
            Turbo Response uses structured support, AI-powered workflows, and practical guidance to help everyday people navigate difficult situations with clarity and confidence.
          </p>
        </div>
      </section>

      {/* Choose Your Path */}
      <section className="decision-section">
        <div className="decision-container">
          <h2 className="decision-title">Choose Your Path</h2>

          <div className="decision-grid">
            {/* Defense */}
            <div className="decision-card defense-card">
              <div className="decision-icon">🛡</div>
              <h3 className="decision-heading">Defense</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>
                Someone is taking action against you.
              </p>

              <div className="examples">
                <p className="examples-title">Examples:</p>
                <ul>
                  <li>IRS Notices</li>
                  <li>Debt Collection</li>
                  <li>Evictions</li>
                  <li>Wage Garnishments</li>
                  <li>Repossessions</li>
                  <li>Benefits Denials</li>
                  <li>Enforcement Actions</li>
                </ul>
              </div>

              <Link href="/intake" className="cta-button primary-button">
                Respond to a Notice
              </Link>
            </div>

            {/* Offense */}
            <div className="decision-card offense-card">
              <div className="decision-icon">⚔</div>
              <h3 className="decision-heading">Offense</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>
                You are taking action against someone else.
              </p>

              <div className="examples">
                <p className="examples-title">Examples:</p>
                <ul>
                  <li>Consumer Complaints</li>
                  <li>Credit Disputes</li>
                  <li>Appeals</li>
                  <li>Recovery Efforts</li>
                  <li>Administrative Requests</li>
                  <li>Documentation Requests</li>
                  <li>Applications</li>
                  <li>Reconsideration Requests</li>
                </ul>
              </div>

              <Link href="/intake-offense" className="cta-button secondary-button">
                Apply, File, or Take Action
              </Link>
            </div>
          </div>

          {/* Compliance Language */}
          <div style={{
            marginTop: '2.5rem',
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.78rem',
            lineHeight: '1.6',
            maxWidth: '720px',
            margin: '2.5rem auto 0'
          }}>
            <strong style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.5rem' }}>
              Important Notice
            </strong>
            Turbo Response is not a law firm and does not provide legal advice, legal representation, or attorney-client services of any kind. The information, documents, and support provided through this platform are for general informational and document preparation purposes only and do not constitute legal advice. No attorney-client relationship is formed by using this service. For legal advice specific to your situation, please consult a licensed attorney in your jurisdiction. By proceeding, you acknowledge that Turbo Response is a document preparation and support service, not a legal services provider.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Turbo Response. All rights reserved.</p>
          <div className="footer-links">
            <Link href="/disclaimer" className="footer-link">Disclaimer</Link>
            <Link href="/terms" className="footer-link">Terms of Service</Link>
            <Link href="/" className="footer-link">Home</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

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
            <Link href="/black-future" className="nav-link">Black Future</Link>
            <Link href="/turbo-systems" className="nav-link nav-link-systems">⚡ Turbo Systems</Link>
            <Link href="/consumer-solutions" className="nav-link nav-link-cta">Start Your Case</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        {/* Founder Image Wrap with Galaxy Effects */}
        <div className="founder-wrap" aria-hidden="true">
          <div className="founder-ring founder-ring-1" />
          <div className="founder-ring founder-ring-2" />
          <div className="founder-ring founder-ring-3" />
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663092269987/afnNMAcQqXaUjWRx.png"
            alt=""
            className="founder-img"
            aria-hidden="true"
          />
          <div className="founder-overlay-left" />
          <div className="founder-overlay-bottom" />
          <div className="founder-overlay-top" />
          <div className="founder-glow-blue" />
          <div className="founder-glow-purple" />
          <div className="orb-particles" aria-hidden="true">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`} />
            ))}
          </div>
        </div>

        {/* Light beam streaks */}
        <div className="light-trail trail-1" aria-hidden="true" />
        <div className="light-trail trail-2" aria-hidden="true" />
        <div className="light-trail trail-3" aria-hidden="true" />

        <div className="hero-content">
          <h1 className="hero-title">
            ⚡ TURBO RESPONSE
          </h1>
          <p className="hero-subtitle">Modern Problems. Modern Solutions.</p>
          <p className="hero-description">
            We combine AI, automation, and structured guidance to help businesses operate smarter and everyday people navigate life's toughest challenges with confidence.
          </p>

          {/* Dual Value Propositions */}
          <div className="hero-propositions">
            {/* Business Proposition */}
            <div className="proposition business-prop">
              <div className="prop-icon">⚡</div>
              <h3 className="prop-title">TURBO SYSTEMS</h3>
              <p className="prop-text">
                Use AI agents, automation, and streamlined workflows to eliminate busy work, improve efficiency, and get more done—without adding more hours to the day.
              </p>
              <p className="prop-subtext">
                Businesses shouldn't have to choose between growth and burnout.
              </p>
              <Link href="/turbo-systems" className="cta-button primary-button">
                Explore Turbo Systems
              </Link>
            </div>

            {/* Consumer Proposition */}
            <div className="proposition consumer-prop">
              <div className="prop-icon">🛡️</div>
              <h3 className="prop-title">CONSUMER SOLUTIONS</h3>
              <p className="prop-text">
                You don't have to fight yesterday's battles with yesterday's tools.
              </p>
              <p className="prop-subtext">
                Turbo Response combines AI agents, structured workflows, and practical support to help people navigate credit, debt, housing, IRS, banking, and other real-world challenges with greater clarity, speed, and confidence.
              </p>
              <p className="prop-subtext">
                We help organize information, prepare documentation, and identify practical next steps when the stakes are high.
              </p>
              <p className="prop-subtext">
                For too long, large organizations have benefited from better systems and faster processes. We believe everyday people deserve access to leverage too.
              </p>
              <Link href="/consumer-solutions" className="cta-button primary-button">
                Explore Consumer Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Actions */}
      <section className="secondary-actions">
        <div className="section-container">
          <h2 className="section-title">TAKE ACTION NOW</h2>
          <div className="secondary-actions-grid">
            <div className="action-card">
              <h3 className="action-title">RESPOND TO A NOTICE OR ISSUE</h3>
              <p className="action-description">
                For people reacting to a problem, deadline, notice, or enforcement action.
              </p>
              <Link href="/intake" className="cta-button secondary-button">
                Consumer Defense Intake
              </Link>
            </div>
            <div className="action-card">
              <h3 className="action-title">APPLY, FILE, OR TAKE ACTION</h3>
              <p className="action-description">
                For people initiating disputes, complaints, recovery efforts, applications, appeals, or other actions.
              </p>
              <Link href="/intake-offense" className="cta-button secondary-button">
                Consumer Offense Intake
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="results-section">
        <div className="section-container">
          <h2 className="section-title">RESULTS MATTER</h2>
          <p className="section-subtitle">Modern tools only matter if they produce outcomes.</p>
          <div className="results-list">
            <div className="result-item">✔ Consumer disputes and documentation support</div>
            <div className="result-item">✔ Credit-related victories and structured case preparation</div>
            <div className="result-item">✔ IRS and administrative response preparation</div>
            <div className="result-item">✔ Business systems designed to save time and increase efficiency</div>
          </div>
          <p className="results-closing">People trust outcomes.</p>
          <Link href="/results" className="cta-button primary-button">
            See Results
          </Link>
        </div>
      </section>

      {/* What We Help With */}
      <section className="what-we-help-section">
        <div className="section-container">
          <h2 className="section-title">WHAT WE HELP WITH</h2>
          <div className="help-grid">
            <div className="help-card">
              <h3 className="help-title">RESPOND TO PROBLEMS</h3>
              <p className="help-description">
                When notices, deadlines, and enforcement actions appear, speed and structure matter.
              </p>
              <p className="help-subtitle">Examples:</p>
              <ul className="help-list">
                <li>IRS notices and audits</li>
                <li>Debt collection issues</li>
                <li>Evictions and housing matters</li>
                <li>Wage garnishments</li>
                <li>Auto repossessions</li>
              </ul>
              <Link href="/intake" className="cta-button secondary-button">
                Respond to a Notice
              </Link>
            </div>
            <div className="help-card">
              <h3 className="help-title">CREATE OPPORTUNITIES</h3>
              <p className="help-description">
                Sometimes leverage comes from taking action first.
              </p>
              <p className="help-subtitle">Examples:</p>
              <ul className="help-list">
                <li>Disputes and complaints</li>
                <li>Administrative appeals</li>
                <li>Funding opportunities</li>
                <li>Recovery efforts</li>
                <li>Requests for reconsideration</li>
              </ul>
              <Link href="/intake-offense" className="cta-button secondary-button">
                Apply, File, or Take Action
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Turbo Response */}
      <section className="why-section">
        <div className="section-container">
          <h2 className="section-title">WHY TURBO RESPONSE</h2>
          <p className="why-subtitle">
            Most people don't lose because they aren't qualified.
          </p>
          <p className="why-body">
            They lose because information is disorganized, incomplete, late, or difficult to understand.
          </p>
          <p className="why-body">
            Turbo Response combines modern technology with practical execution to help people and businesses move forward with clarity, confidence, and leverage.
          </p>
          <p className="why-closing">
            Because old problems deserve modern solutions.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <h2 className="pricing-title">PRICING</h2>
        <div className="pricing-grid pricing-grid-four">
          <div className="pricing-card">
            <div className="pricing-price">$349</div>
            <div className="pricing-name">FOUNDATION CASE STRATEGY</div>
            <div className="pricing-description">
              For straightforward matters requiring structure and a clear plan.
            </div>
            <Link href="/intake" className="cta-button">
              Get Started
            </Link>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-price">$997+</div>
            <div className="pricing-name">PREMIUM CASE ARCHITECTURE</div>
            <div className="pricing-description">
              For complex matters requiring stronger buildout and support.
            </div>
            <Link href="/intake" className="cta-button">
              Get Started
            </Link>
          </div>
          <div className="pricing-card">
            <div className="pricing-price">$2,500+</div>
            <div className="pricing-name">EXECUTIVE CASE BUILDOUT</div>
            <div className="pricing-description">
              For high‑stakes matters with significant impact.
            </div>
            <Link href="/intake" className="cta-button">
              Get Started
            </Link>
          </div>
          <div className="pricing-card">
            <div className="pricing-price">$297/mo</div>
            <div className="pricing-name">CORPORATE MONTHLY RETAINER</div>
            <div className="pricing-description">
              Ongoing documentation and response support for organizations.
            </div>
            <Link href="/intake" className="cta-button">
              Get Started
            </Link>
          </div>
        </div>
        <p className="pricing-footnote">
          Final pricing depends on complexity, urgency, and scope. Turbo Response is not a law firm and provides documentation and procedural support.
        </p>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/pricing" className="cta-button" style={{ background: 'transparent', border: '2px solid #06b6d4', color: '#06b6d4' }}>
            VIEW FULL PRICING DETAILS
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="section-container">
          <h2 className="section-title">START HERE</h2>
          <p className="cta-subtitle">Choose the option that matches your situation:</p>
          
          <div className="final-buttons">
            <Link href="/intake" className="cta-button primary-button">
              RESPOND TO A NOTICE OR ISSUE
            </Link>
            <Link href="/intake-offense" className="cta-button secondary-button">
              APPLY, FILE, OR TAKE ACTION
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-text">
          © 2025 Turbo Response. Documentation and procedural support.
        </div>
      </footer>
    </>
  );
}

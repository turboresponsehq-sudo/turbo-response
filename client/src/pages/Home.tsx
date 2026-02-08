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
            <Link href="/resources" className="nav-link">Resources</Link>
            <Link href="/intake" className="nav-link nav-link-cta">Start Your Case</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            AI‑DRIVEN DOCUMENTATION & RESPONSE
          </h1>
          <p className="hero-description">
            Turbo Response helps clients prepare, organize, and respond when entities require proof, records, or formal responses. We use AI‑driven systems to move faster, stay consistent, and keep documentation structured — so clients are positioned correctly before decisions are made.
          </p>

          {/* Dual Intake Buttons */}
          <div className="intake-buttons-container">
            <div className="intake-button-group">
              <Link href="/turbo-intake" className="cta-button primary-button">
                APPLY, FILE, OR TAKE ACTION
              </Link>
              <p className="button-helper">Use this if you are initiating an application, request, dispute, or claim.</p>
            </div>
            <div className="intake-button-group">
              <Link href="/intake" className="cta-button secondary-button">
                RESPOND TO A NOTICE OR ISSUE
              </Link>
              <p className="button-helper">Use this if you received a notice, denial, demand, or enforcement action.</p>
            </div>
          </div>
        </div>
      </section>



      {/* Problems We Solve. Results We Deliver */}
      <section className="problems-section">
        <div className="section-container">
          <h2 className="section-title">PROBLEMS WE SOLVE. RESULTS WE DELIVER.</h2>
          
          <div className="problems-grid">
            {/* Card 1: When Records Are an Emergency */}
            <div className="problem-card">
              <h3 className="problem-title">WHEN RECORDS ARE AN EMERGENCY</h3>
              <p className="problem-body">
                Turbo Response helps clients prepare documentation in cases where the wrong response — or no response — can create immediate consequences.
              </p>
              <p className="problem-subtitle">We support situations involving:</p>
              <ul className="problem-list">
                <li>Wrongful or improper evictions</li>
                <li>IRS notices, audits, assessments, and enforcement</li>
                <li>Wage garnishments and bank levies</li>
                <li>Illegal auto repossessions</li>
                <li>Yo‑yo financing and deceptive dealership practices</li>
                <li>Debt collection violations</li>
                <li>Benefit denials and administrative actions</li>
                <li>Regulatory and compliance issues</li>
              </ul>
              <p className="problem-closing">
                In these moments, speed, structure, and accuracy matter. Poorly prepared records can escalate situations that could have been contained.
              </p>
            </div>

            {/* Card 2: When Necessary Documentation Unlocks Opportunity */}
            <div className="problem-card">
              <h3 className="problem-title">WHEN NECESSARY DOCUMENTATION UNLOCKS OPPORTUNITY</h3>
              <p className="problem-body">
                Turbo Response also works with clients who are initiating action to secure outcomes — not just reacting to problems.
              </p>
              <p className="problem-subtitle">We prepare documentation for:</p>
              <ul className="problem-list">
                <li>Grant and funding opportunities</li>
                <li>Credit, capital, and approval requests</li>
                <li>Formal disputes and complaints</li>
                <li>Settlement and recovery efforts</li>
                <li>Contract challenges and corrections</li>
                <li>Administrative reviews and appeals</li>
              </ul>
              <p className="problem-closing">
                Here, documentation isn't defensive. It's what creates leverage, access, and opportunity.
              </p>
            </div>
          </div>

          {/* Full-width closing section */}
          <div className="problems-close">
            <h3 className="close-title">WHY TURBO RESPONSE DELIVERS RESULTS</h3>
            <p className="close-body">
              The majority of people don't lose because they aren't qualified. They lose because their records are disorganized, incomplete, late, or misaligned with what the system requires.
            </p>
            <p className="close-body">
              Turbo Response delivers results by combining:
            </p>
            <ul className="close-list">
              <li>AI‑driven processing to move faster than manual workflows</li>
              <li>Strong structure and organization so nothing critical is missed</li>
              <li>Clear case framing so information is easy to review and understand</li>
              <li>Procedural discipline around rules, standards, and deadlines</li>
            </ul>
            <p className="close-body">
              This is not basic form filling. This is preparation built to withstand review and produce outcomes.
            </p>
            <p className="close-closing">
              When information is prepared correctly, outcomes change.
            </p>
          </div>
        </div>
      </section>

      {/* How Results Are Produced */}
      <section className="how-results-section">
        <div className="section-container">
          <div className="how-results-card">
            <h3 className="how-results-title">HOW RESULTS ARE PRODUCED</h3>
            <p className="how-results-text">
              AI-driven processing • Structured case framing • Submission readiness • Response & escalation support
            </p>
          </div>
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
            <Link href="/turbo-intake" className="cta-button primary-button">
              APPLY, FILE, OR TAKE ACTION
            </Link>
            <Link href="/intake" className="cta-button secondary-button">
              RESPOND TO A NOTICE OR ISSUE
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

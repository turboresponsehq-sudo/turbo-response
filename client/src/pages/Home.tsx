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

      {/* Who This Is For */}
      <section className="who-section">
        <div className="section-container">
          <h2 className="section-title">WHO THIS IS FOR</h2>
          <p className="section-description">
            For individuals, entrepreneurs, and organizations dealing with banks, agencies, landlords, insurers, schools, employers, vendors, regulators, or any institution that requires formal documentation.
          </p>
        </div>
      </section>

      {/* Why Clients Come To Us */}
      <section className="why-section">
        <div className="section-container">
          <h2 className="section-title">WHY CLIENTS COME TO US</h2>
          <p className="section-description">
            Most outcomes aren't decided by intent — they're decided by what's submitted, how it's structured, and whether it meets the requirements. Turbo Response exists to help clients build the right structure, present the right records, and respond the right way — with speed and consistency powered by AI.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="services">
        <h2 className="services-title">WHAT WE DO</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3>DOCUMENT PROCESSING</h3>
            <p>Organize and standardize records into clear, usable documentation.</p>
          </div>
          <div className="service-card">
            <h3>CASE BUILDING</h3>
            <p>Structure the facts, records, and narrative into a coherent case.</p>
          </div>
          <div className="service-card">
            <h3>SUBMISSION READINESS</h3>
            <p>Prepare materials so they are complete, properly formatted, and ready for review.</p>
          </div>
          <div className="service-card">
            <h3>RESPONSE & ESCALATION SUPPORT</h3>
            <p>Coordinate structured responses to notices, denials, disputes, or enforcement actions.</p>
          </div>
        </div>
      </section>

      {/* Choose Your Path */}
      <section className="choose-path">
        <div className="section-container">
          <h2 className="section-title">CHOOSE YOUR PATH</h2>
          
          <div className="path-grid">
            <div className="path-card">
              <h3 className="path-title">INITIATING ACTION</h3>
              <p className="path-items">Grants • funding • approvals • disputes • complaints • settlements • corrections</p>
              <Link href="/turbo-intake" className="cta-button">
                APPLY, FILE, OR TAKE ACTION
              </Link>
            </div>
            <div className="path-card">
              <h3 className="path-title">RESPONDING TO ACTION</h3>
              <p className="path-items">Notices • denials • enforcement • demands • compliance issues • collections</p>
              <Link href="/intake" className="cta-button">
                RESPOND TO A NOTICE OR ISSUE
              </Link>
            </div>
          </div>

          <p className="path-footer">Same system. Same standards. Different situation.</p>
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

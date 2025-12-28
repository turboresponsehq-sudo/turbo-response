import { Link } from "wouter";
import "./EvictionDemo.css";

export default function EvictionDemo() {
  return (
    <>
      {/* Header */}
      <header className="eviction-header">
        <div className="eviction-nav-container">
          <Link href="/" className="eviction-logo">
            ⚡ TURBO RESPONSE
          </Link>
        </div>
      </header>

      {/* Section 1: Hero */}
      <section className="eviction-hero">
        <div className="eviction-hero-content">
          <h1 className="eviction-hero-title">
            STOP YOUR EVICTION
          </h1>
          <p className="eviction-hero-subtitle">
            You have rights. We prepare the legal response that protects them.
          </p>
          <Link href="/intake" className="eviction-cta-button">
            RESPOND TO YOUR EVICTION NOTICE
          </Link>
        </div>
      </section>

      {/* Section 2: Timeline */}
      <section className="eviction-timeline">
        <div className="eviction-container">
          <h2 className="eviction-section-title">EVICTION TIMELINES ARE TIGHT</h2>
          <p className="eviction-section-subtitle">
            Most jurisdictions give you 3-7 days to respond. Delay = default judgment.
          </p>
          
          <div className="eviction-timeline-items">
            <div className="timeline-item">
              <div className="timeline-day">DAY 1-3</div>
              <h3>Notice Served</h3>
              <p>Eviction notice is delivered. Clock starts now.</p>
            </div>
            <div className="timeline-arrow">→</div>
            <div className="timeline-item">
              <div className="timeline-day">DAY 4-7</div>
              <h3>Response Required</h3>
              <p>You must file a response or lose by default.</p>
            </div>
            <div className="timeline-arrow">→</div>
            <div className="timeline-item">
              <div className="timeline-day">DAY 8+</div>
              <h3>Court Hearing</h3>
              <p>Your defense must be prepared and filed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: What We Do */}
      <section className="eviction-what-we-do">
        <div className="eviction-container">
          <h2 className="eviction-section-title">WHAT WE PREPARE FOR YOU</h2>
          
          <div className="eviction-services">
            <div className="service-item">
              <div className="service-icon">📋</div>
              <h3>LEGAL RESPONSE</h3>
              <p>Professional court filing that protects your rights and addresses the landlord's claims.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">📄</div>
              <h3>SUPPORTING DOCUMENTATION</h3>
              <p>Organized evidence of repairs, payments, lease violations, or illegal procedures.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">⚖️</div>
              <h3>DEFENSE STRATEGY</h3>
              <p>Clear strategy based on your jurisdiction's tenant rights and the specific violations.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">✅</div>
              <h3>COURT-READY PACKAGE</h3>
              <p>Everything formatted, filed, and ready for your hearing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: CTA */}
      <section className="eviction-final-cta">
        <div className="eviction-container">
          <h2 className="eviction-cta-title">DON'T WAIT. RESPOND NOW.</h2>
          <p className="eviction-cta-text">
            Every day you delay is a day closer to losing your home. We prepare your response immediately.
          </p>
          <Link href="/intake" className="eviction-cta-button eviction-cta-large">
            START YOUR EVICTION DEFENSE
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="eviction-footer">
        <p>© 2025 Turbo Response. Eviction defense and tenant rights support.</p>
      </footer>
    </>
  );
}

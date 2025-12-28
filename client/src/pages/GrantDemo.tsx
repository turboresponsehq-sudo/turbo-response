import { Link } from "wouter";
import "./GrantDemo.css";

export default function GrantDemo() {
  return (
    <>
      {/* Header */}
      <header className="grant-header">
        <div className="grant-nav-container">
          <Link href="/" className="grant-logo">
            ⚡ TURBO RESPONSE
          </Link>
        </div>
      </header>

      {/* Section 1: Hero */}
      <section className="grant-hero">
        <div className="grant-hero-content">
          <h1 className="grant-hero-title">
            SECURE YOUR GRANT
          </h1>
          <p className="grant-hero-subtitle">
            Your application deserves a professional strategy. We prepare documentation that gets approved.
          </p>
          <Link href="/turbo-intake" className="grant-cta-button">
            START YOUR GRANT APPLICATION
          </Link>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section className="grant-how-it-works">
        <div className="grant-container">
          <h2 className="grant-section-title">HOW WE SECURE YOUR GRANT</h2>
          
          <div className="grant-steps">
            <div className="grant-step">
              <div className="grant-step-number">01</div>
              <h3 className="grant-step-title">ORGANIZE YOUR DOCUMENTATION</h3>
              <p className="grant-step-text">
                We collect, standardize, and structure all your supporting materials into a clear, professional package.
              </p>
            </div>

            <div className="grant-step">
              <div className="grant-step-number">02</div>
              <h3 className="grant-step-title">BUILD YOUR CASE</h3>
              <p className="grant-step-text">
                We frame your qualifications, financial need, and project impact in a way that aligns with grant requirements.
              </p>
            </div>

            <div className="grant-step">
              <div className="grant-step-number">03</div>
              <h3 className="grant-step-title">SUBMIT WITH CONFIDENCE</h3>
              <p className="grant-step-text">
                Your application is complete, properly formatted, and positioned to stand out. Ready for approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Why Turbo Response */}
      <section className="grant-why">
        <div className="grant-container">
          <h2 className="grant-section-title">WHY GRANTS GET DENIED</h2>
          
          <div className="grant-reasons">
            <div className="grant-reason">
              <div className="grant-reason-icon">❌</div>
              <p>Applications are incomplete or missing critical documents</p>
            </div>
            <div className="grant-reason">
              <div className="grant-reason-icon">❌</div>
              <p>Documentation doesn't align with what reviewers are looking for</p>
            </div>
            <div className="grant-reason">
              <div className="grant-reason-icon">❌</div>
              <p>Deadlines are missed or submissions are disorganized</p>
            </div>
            <div className="grant-reason">
              <div className="grant-reason-icon">❌</div>
              <p>Qualifications aren't presented clearly or persuasively</p>
            </div>
          </div>

          <div className="grant-solution">
            <h3 className="grant-solution-title">✅ TURBO RESPONSE ELIMINATES THESE PROBLEMS</h3>
            <p className="grant-solution-text">
              We handle the structure, the timing, and the presentation. Your grant application gets the professional treatment it deserves.
            </p>
          </div>

          <Link href="/turbo-intake" className="grant-cta-button grant-cta-secondary">
            PREPARE YOUR GRANT APPLICATION
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="grant-footer">
        <p>© 2025 Turbo Response. Grant preparation and documentation support.</p>
      </footer>
    </>
  );
}

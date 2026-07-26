import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import "./CaseBrief.css";

const CASE_TYPES = [
  "IRS/Tax Notice",
  "Bank Levy/Freeze",
  "Wage Garnishment",
  "Debt Collection",
  "Creditor Dispute",
  "Other",
];

export default function CaseBrief() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    caseType: "",
    description: "",
  });
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Case Documentation Brief — Turbo Response";
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getApiUrl = () => {
    return (import.meta as any).env?.VITE_BACKEND_URL || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${getApiUrl()}/api/case-brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Submission failed");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cb-root">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="cb-header">
        <div className="cb-nav-inner">
          <Link href="/" className="cb-logo">
            <span className="cb-logo-bolt">⚡</span>
            <span className="cb-logo-text">TURBO RESPONSE</span>
          </Link>
          <button
            className={`cb-hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span /><span /><span />
          </button>
          <nav className={`cb-nav${menuOpen ? " open" : ""}`}>
            <Link href="/services" className="cb-nav-link" onClick={() => setMenuOpen(false)}>Services</Link>
            <Link href="/consumer-solutions" className="cb-nav-link" onClick={() => setMenuOpen(false)}>Consumer Solutions</Link>
            <button className="cb-nav-cta" onClick={() => { setMenuOpen(false); scrollToForm(); }}>
              Start My Brief — $299
            </button>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="cb-hero">
        <div className="cb-hero-bg" aria-hidden="true" />
        <div className="cb-hero-grid" aria-hidden="true" />
        <div className="cb-hero-inner">
          <h1 className="cb-hero-h1">
            They have rules to follow.<br />
            <span className="cb-hero-accent">We use records to fight back.</span>
          </h1>
          <p className="cb-hero-sub">
            Facing a levy, garnishment, account freeze, IRS notice, collection notice, or serious financial dispute?
          </p>
          <p className="cb-hero-sub2">
            Turbo Response helps you cross-reference your records, notices, statements, letters, and timelines to find gaps, contradictions, missing proof, and weak spots in the documentation.
          </p>
          <button className="cb-btn cb-btn-primary cb-btn-xl" onClick={scrollToForm}>
            Start My Case Documentation Brief — $299
          </button>
        </div>
      </section>

      {/* ── SECTION 2 ──────────────────────────────────────────────────────── */}
      <section className="cb-section">
        <div className="cb-section-inner">
          <h2 className="cb-h2">When they come after your money, the records matter.</h2>
          <p className="cb-body">
            Agencies, banks, collectors, and creditors usually have to prove what they claim.
          </p>
          <p className="cb-body">
            The problem is most people do not know how to read the records, compare the timeline, or spot what is missing.
          </p>
          <p className="cb-body">
            Turbo Response turns scattered documentation into a clear Case Documentation Brief so you can better understand your position before your next move.
          </p>
        </div>
      </section>

      {/* ── SECTION 3 ──────────────────────────────────────────────────────── */}
      <section className="cb-section cb-section-alt">
        <div className="cb-section-inner">
          <h2 className="cb-h2">What we look for</h2>
          <ul className="cb-list">
            <li>What they claim</li>
            <li>What records support the claim</li>
            <li>What notices were sent</li>
            <li>When those notices were sent</li>
            <li>Whether the timeline makes sense</li>
            <li>Whether the documentation matches</li>
            <li>Whether proof is missing</li>
            <li>Whether there are contradictions or weak spots</li>
          </ul>
        </div>
      </section>

      {/* ── SECTION 4 ──────────────────────────────────────────────────────── */}
      <section className="cb-section">
        <div className="cb-section-inner">
          <h2 className="cb-h2">What you receive</h2>
          <p className="cb-price-line">Case Documentation Brief — $299</p>
          <ul className="cb-list cb-list-check">
            <li>Timeline of events</li>
            <li>Key facts summary</li>
            <li>Records cross-reference</li>
            <li>Missing proof checklist</li>
            <li>Contradictions or weak spots</li>
            <li>Evidence summary</li>
            <li>Deadline and urgency notes</li>
            <li>Questions for your next step</li>
          </ul>
          <div className="cb-cta-row">
            <button className="cb-btn cb-btn-primary cb-btn-lg" onClick={scrollToForm}>
              Start My Case Documentation Brief — $299
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 5 ──────────────────────────────────────────────────────── */}
      <section className="cb-section cb-section-alt">
        <div className="cb-section-inner">
          <h2 className="cb-h2">Built for situations like:</h2>
          <ul className="cb-list cb-list-grid">
            <li>IRS notices</li>
            <li>Tax debt letters</li>
            <li>Bank levies</li>
            <li>Bank account freezes</li>
            <li>Wage garnishments</li>
            <li>Debt collection notices</li>
            <li>Creditor disputes</li>
            <li>Serious financial documentation problems</li>
          </ul>
        </div>
      </section>

      {/* ── SECTION 6 ──────────────────────────────────────────────────────── */}
      <section className="cb-section">
        <div className="cb-section-inner">
          <h2 className="cb-h2">Important</h2>
          <p className="cb-body">
            Turbo Response does not promise outcomes and does not provide legal, tax, or financial advice.
          </p>
          <p className="cb-body">
            We provide documentation strategy, case intelligence, records review, and structured summaries so you can better understand the documentation and prepare for your next step.
          </p>
          <div className="cb-cta-row">
            <button className="cb-btn cb-btn-primary cb-btn-xl" onClick={scrollToForm}>
              Start My Case Documentation Brief — $299
            </button>
          </div>
        </div>
      </section>

      {/* ── INTAKE FORM ────────────────────────────────────────────────────── */}
      <section className="cb-section cb-section-form" ref={formRef}>
        <div className="cb-form-inner">
          {success ? (
            <div className="cb-success-card">
              <div className="cb-success-icon">✓</div>
              <h2 className="cb-success-title">Request Received</h2>
              <p className="cb-success-text">
                Your Case Documentation Brief request has been received. We will follow up at{" "}
                <strong>{formData.email}</strong> with next steps.
              </p>
            </div>
          ) : (
            <>
              <h2 className="cb-h2 cb-form-title">Start My Case Documentation Brief</h2>
              <p className="cb-form-sub">Case Documentation Brief — $299</p>
              <form onSubmit={handleSubmit} className="cb-form">
                {error && <div className="cb-error-box">{error}</div>}
                <div className="cb-field">
                  <label className="cb-label" htmlFor="cb-fullName">Full Name *</label>
                  <input
                    id="cb-fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="cb-input"
                  />
                </div>
                <div className="cb-field">
                  <label className="cb-label" htmlFor="cb-email">Email *</label>
                  <input
                    id="cb-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@email.com"
                    className="cb-input"
                  />
                </div>
                <div className="cb-field">
                  <label className="cb-label" htmlFor="cb-phone">Phone (optional)</label>
                  <input
                    id="cb-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 555-5555"
                    className="cb-input"
                  />
                </div>
                <div className="cb-field">
                  <label className="cb-label" htmlFor="cb-caseType">Case Type *</label>
                  <select
                    id="cb-caseType"
                    name="caseType"
                    value={formData.caseType}
                    onChange={handleChange}
                    required
                    className="cb-input cb-select"
                  >
                    <option value="" disabled>Select your case type</option>
                    {CASE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="cb-field">
                  <label className="cb-label" htmlFor="cb-description">Brief description of the situation *</label>
                  <textarea
                    id="cb-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="What happened, what notices you received, and any deadlines you know of."
                    className="cb-input cb-textarea"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="cb-btn cb-btn-primary cb-btn-submit"
                >
                  {loading ? "Submitting..." : "Start My Case Documentation Brief — $299"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="cb-footer">
        <div className="cb-footer-inner">
          <div className="cb-footer-brand">
            <span>⚡</span>
            <span>TURBO RESPONSE</span>
          </div>
          <nav className="cb-footer-links">
            <Link href="/services" className="cb-footer-link">Services</Link>
            <Link href="/consumer-solutions" className="cb-footer-link">Consumer Solutions</Link>
            <Link href="/privacy-policy" className="cb-footer-link">Privacy Policy</Link>
            <Link href="/terms-of-service" className="cb-footer-link">Terms of Service</Link>
          </nav>
          <p className="cb-footer-copy">
            © {new Date().getFullYear()} Turbo Response · turboresponsehq.ai<br />
            Turbo Response does not promise outcomes and does not provide legal, tax, or financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

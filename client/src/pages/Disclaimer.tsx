import { useEffect } from "react";
import { Link } from "wouter";
import "./Disclaimer.css";

export default function Disclaimer() {
  useEffect(() => {
    document.title = "Disclaimer — Turbo Response";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="disc-root">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="disc-header">
        <div className="disc-nav-inner">
          <Link href="/" className="disc-logo">
            <span>⚡</span>
            <span>TURBO RESPONSE</span>
          </Link>
          <nav className="disc-nav">
            <Link href="/solutions" className="disc-nav-link">Solutions</Link>
            <Link href="/use-cases" className="disc-nav-link">Use Cases</Link>
            <Link href="/research" className="disc-nav-link disc-nav-systems">⚡ Research</Link>
            <Link href="/compliance" className="disc-nav-link">Compliance</Link>
            <Link href="/contact" className="disc-nav-link">Contact</Link>
            <Link href="/demo" className="disc-nav-cta">Request Demo</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="disc-hero">
        <div className="disc-hero-inner">
          <div className="disc-section-label">Legal Disclaimer</div>
          <h1 className="disc-hero-h1">Platform Disclaimer &amp; Limitations</h1>
          <p className="disc-hero-sub">
            Turbo Response is an AI systems and operational infrastructure company. Please read the following carefully before using this platform.
          </p>
        </div>
      </section>

      {/* ── DISCLAIMER CONTENT ─────────────────────────────────────────────── */}
      <section className="disc-section">
        <div className="disc-section-inner">

          {/* Primary notice */}
          <div className="disc-notice">
            <div className="disc-notice-icon">⚡</div>
            <div className="disc-notice-body">
              <strong>Turbo Response is NOT a law firm.</strong> Turbo Response is an AI systems and operational infrastructure platform. We provide workflow automation, document intelligence, operational organization systems, and AI-assisted infrastructure tools. We do not provide legal advice, and no attorney-client relationship is formed by using our platform or services.
            </div>
          </div>

          {/* Sections */}
          <div className="disc-blocks">

            <div className="disc-block">
              <h2 className="disc-block-title">What Turbo Response Is</h2>
              <p className="disc-block-body">
                Turbo Response is an operational intelligence and AI infrastructure platform. We build and deploy AI systems, automation workflows, document intelligence pipelines, and organizational infrastructure for founders, operators, agencies, and organizations. Where applicable, these systems may assist users in organizing, structuring, and preparing operational documentation — including documentation relevant to disputes, complaints, or administrative processes. This constitutes operational and organizational support only.
              </p>
            </div>

            <div className="disc-block">
              <h2 className="disc-block-title">What Turbo Response Is Not</h2>
              <ul className="disc-list">
                <li>Turbo Response is <strong>not a law firm</strong> and does not practice law.</li>
                <li>We do <strong>not provide legal advice</strong> of any kind.</li>
                <li>We do <strong>not provide legal representation</strong>.</li>
                <li>No attorney-client relationship is created by using this platform.</li>
                <li>We are <strong>not a substitute</strong> for qualified legal counsel.</li>
              </ul>
            </div>

            <div className="disc-block">
              <h2 className="disc-block-title">Informational &amp; Operational Use Only</h2>
              <p className="disc-block-body">
                All content, systems, outputs, and materials provided through the Turbo Response platform are for informational and operational support purposes only. They do not constitute legal, financial, regulatory, or professional advice. Results and outcomes vary based on the specific facts, circumstances, and jurisdictions applicable to each situation. Turbo Response makes no guarantees regarding specific outcomes.
              </p>
            </div>

            <div className="disc-block">
              <h2 className="disc-block-title">User Responsibilities</h2>
              <ul className="disc-list">
                <li>You are responsible for the accuracy of all information you provide to the platform.</li>
                <li>You are responsible for the appropriate use of any outputs, documents, or materials generated.</li>
                <li>You are representing yourself in any matter — Turbo Response does not represent you.</li>
                <li>Your use of this platform is subject to our <Link href="/terms-of-service" className="disc-link">Terms of Service</Link>.</li>
              </ul>
            </div>

            <div className="disc-block">
              <h2 className="disc-block-title">Professional Counsel Recommendation</h2>
              <p className="disc-block-body">
                For any matter involving legal rights, obligations, disputes, regulatory compliance, or financial decisions, Turbo Response strongly recommends consulting with a licensed professional — including a licensed attorney, financial advisor, or relevant subject-matter expert — for advice specific to your situation. Our platform is an operational infrastructure tool, not a replacement for professional counsel.
              </p>
            </div>

            <div className="disc-block">
              <h2 className="disc-block-title">Contact</h2>
              <p className="disc-block-body">
                For questions regarding this disclaimer or our platform, contact us at <a href="mailto:TurboResponseHQ@gmail.com" className="disc-link">TurboResponseHQ@gmail.com</a> or review our <Link href="/terms-of-service" className="disc-link">Terms of Service</Link>.
              </p>
            </div>

          </div>

          <div className="disc-back">
            <Link href="/" className="disc-back-link">← Back to Homepage</Link>
          </div>

        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="disc-footer">
        <div className="disc-footer-inner">
          <div className="disc-footer-brand">⚡ Turbo Response — AI-Powered Legal Technology</div>
          <div className="disc-footer-links">
            <Link href="/" className="disc-footer-link">Home</Link>
            <Link href="/solutions" className="disc-footer-link">Solutions</Link>
            <Link href="/use-cases" className="disc-footer-link">Use Cases</Link>
            <Link href="/research" className="disc-footer-link">Research</Link>
            <Link href="/compliance" className="disc-footer-link">Compliance</Link>
            <Link href="/contact" className="disc-footer-link">Contact</Link>
            <Link href="/privacy-policy" className="disc-footer-link">Privacy Policy</Link>
            <Link href="/terms-of-service" className="disc-footer-link">Terms of Service</Link>
          </div>
          <div className="disc-footer-copy">© {new Date().getFullYear()} Turbo Response. AI-powered legal technology. Not a law firm. No legal advice.</div>
        </div>
      </footer>

    </div>
  );
}

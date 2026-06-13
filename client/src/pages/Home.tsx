import { Link } from "wouter";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-content">
          {/* LEFT SIDE - Content (60%) */}
          <div className="hero-left">
            <div className="hero-logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">TURBO RESPONSE</span>
            </div>

            <h1 className="hero-headline">
              Modern Problems.<br />
              Modern Solutions.
            </h1>

            <p className="hero-subheadline">
              Turbo Response combines AI, automation, and structured guidance to help businesses work smarter and everyday people navigate life's toughest challenges with confidence.
            </p>

            <div className="hero-buttons">
              <Link href="/turbo-intake">
                <button className="btn btn-primary">
                  Explore Turbo Systems
                </button>
              </Link>
              <Link href="/consumer-solutions">
                <button className="btn btn-secondary">
                  Explore Consumer Solutions
                </button>
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE - Samsung Image (40%) */}
          <div className="hero-right">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663092269987/MUfsIbZkaSBDMvzF.png"
              alt="Samsung VR Glasses - Built for What's Next"
              className="hero-image"
            />
          </div>
        </div>

        {/* Background Elements */}
        <div className="hero-glow hero-glow-cyan"></div>
        <div className="hero-glow hero-glow-purple"></div>
      </section>

      {/* ===== SERVICE PATHWAYS SECTION ===== */}
      <section className="service-pathways">
        <div className="section-container">
          <div className="pathways-grid">
            {/* TURBO SYSTEMS */}
            <div className="pathway-card turbo-systems">
              <div className="pathway-icon">⚡</div>
              <h2 className="pathway-title">TURBO SYSTEMS</h2>
              <p className="pathway-tagline">Build. Automate. Strengthen Your Brand. Scale.</p>

              <p className="pathway-description">
                Use AI agents, workflows, automations, and strategic systems to help businesses save time, improve efficiency, and grow without unnecessary complexity.
              </p>

              <Link href="/turbo-intake">
                <button className="btn btn-pathway">
                  Explore Turbo Systems
                </button>
              </Link>

              <div className="pathway-examples">
                <h3>Examples:</h3>
                <ul>
                  <li>AI Agents</li>
                  <li>Automations</li>
                  <li>Workflows</li>
                  <li>Brand Building</li>
                  <li>Operational Efficiency</li>
                </ul>
              </div>
            </div>

            {/* CONSUMER SOLUTIONS */}
            <div className="pathway-card consumer-solutions">
              <div className="pathway-icon">🛡️</div>
              <h2 className="pathway-title">CONSUMER SOLUTIONS</h2>
              <p className="pathway-tagline">Respond. Protect. Recover. Take Action.</p>

              <p className="pathway-description">
                Use AI-powered workflows and structured support to navigate credit, debt, housing, IRS matters, banking issues, and other real-world challenges.
              </p>

              <p className="pathway-belief">
                For too long, large organizations have benefited from better systems and faster processes. We believe everyday people deserve access to leverage too.
              </p>

              <Link href="/consumer-solutions">
                <button className="btn btn-pathway">
                  Explore Consumer Solutions
                </button>
              </Link>

              <div className="pathway-examples">
                <div className="example-group">
                  <h3>Defense:</h3>
                  <ul>
                    <li>Notices</li>
                    <li>Enforcement actions</li>
                    <li>Deadlines</li>
                    <li>Disputes</li>
                  </ul>
                </div>
                <div className="example-group">
                  <h3>Offense:</h3>
                  <ul>
                    <li>Complaints</li>
                    <li>Recovery efforts</li>
                    <li>Appeals</li>
                    <li>Applications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Link } from "wouter";
import "./Home.css"; // Reuse homepage styling

export default function Results() {
  const caseResults = [
    {
      icon: "🏠",
      category: "Eviction Defense",
      problem: "Client received 3-day eviction notice for alleged lease violation without proper notice or opportunity to cure.",
      action: "Turbo Response generated comprehensive response citing California Civil Code §1161 procedural violations and tenant rights under habitability laws.",
      result: "Eviction dismissed. Landlord agreed to 60-day extension and repairs.",
      savings: "$12,000 in moving costs + legal fees avoided"
    },
    {
      icon: "📞",
      title: "Debt Collection Harassment",
      problem: "Debt collector called client 15+ times daily, threatened arrest, and contacted employer despite cease & desist.",
      action: "Turbo Response documented FDCPA violations (§§ 806, 807, 808) and filed CFPB complaint with detailed evidence.",
      result: "Collection agency paid $3,500 settlement. Debt marked as disputed.",
      savings: "$3,500 settlement + $4,200 debt forgiven"
    },
    {
      icon: "🚗",
      category: "Repossession Defense",
      problem: "Lender repossessed vehicle from client's driveway at 2 AM without notice, damaging property fence.",
      action: "Turbo Response cited UCC breach of peace violations and demanded return of vehicle with damages.",
      result: "Vehicle returned within 48 hours. Lender paid $2,800 for fence repair.",
      savings: "$18,000 vehicle value + $2,800 damages recovered"
    },
    {
      icon: "💳",
      category: "Credit Report Dispute",
      problem: "Three inaccurate late payments on credit report causing 80-point score drop and loan denial.",
      action: "Turbo Response filed FCRA-compliant disputes with all three bureaus citing documentation proving on-time payments.",
      result: "All three late payments removed. Credit score increased 95 points.",
      savings: "$45,000 mortgage approved at 2% lower rate"
    },
    {
      icon: "🏛️",
      category: "IRS Tax Relief",
      problem: "Client owed $28,000 in back taxes with wage garnishment notice and bank levy threat.",
      action: "Turbo Response prepared Offer in Compromise package with financial hardship documentation and payment plan proposal.",
      result: "IRS accepted $8,500 settlement. Wage garnishment cancelled.",
      savings: "$19,500 debt reduction + $650/mo wage garnishment stopped"
    },
    {
      icon: "💰",
      category: "Billing Dispute",
      problem: "Hospital charged $47,000 for emergency surgery that insurance should have covered. Multiple billing errors found.",
      action: "Turbo Response identified $23,000 in duplicate charges and out-of-network billing errors, filed insurance appeal with medical necessity documentation.",
      result: "Bill reduced to $8,200. Insurance covered $6,500.",
      savings: "$38,800 in erroneous charges eliminated"
    },
    {
      icon: "🔒",
      category: "Identity Theft Defense",
      problem: "Fraudulent credit cards opened in client's name totaling $34,000 in charges. Credit ruined.",
      action: "Turbo Response filed FTC identity theft report, police report, and comprehensive creditor dispute package citing FCRA §605B.",
      result: "All fraudulent accounts removed. Credit restored. $0 liability.",
      savings: "$34,000 fraudulent debt eliminated + credit restored"
    },
    {
      icon: "⚖️",
      category: "CFPB Complaint Success",
      problem: "Bank refused to reverse $8,900 in unauthorized ACH withdrawals despite fraud report and police documentation.",
      action: "Turbo Response filed detailed CFPB complaint with transaction timeline, fraud evidence, and Regulation E violations.",
      result: "Bank reversed all charges within 10 days of CFPB intervention.",
      savings: "$8,900 recovered + account restored"
    },
    {
      icon: "📄",
      category: "Contract Dispute",
      problem: "Home improvement contractor demanded $15,000 final payment for incomplete work with major defects.",
      action: "Turbo Response documented breach of contract, cited state contractor licensing laws, and demanded completion or refund.",
      result: "Contractor completed repairs and reduced final payment to $6,000.",
      savings: "$9,000 saved + work completed properly"
    }
  ];

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
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            🏆 Proven Results
          </div>
          <h1 className="hero-title">
            REAL CASES<br />
            REAL WINS
          </h1>
          <p className="hero-description">
            See how Turbo Response has helped consumers save over $500,000 in the past year. Our AI-powered legal game plans deliver real results against evictions, debt collectors, IRS threats, and more.
          </p>
        </div>
      </section>

      {/* Case Results Grid */}
      <section className="features">
        <h2 className="features-title">Success Stories</h2>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto", 
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "30px"
        }}>
          {caseResults.map((caseItem, index) => (
            <div key={index} style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              borderRadius: "16px",
              padding: "30px",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>{caseItem.icon}</div>
              <h3 style={{ 
                color: "#06b6d4", 
                fontSize: "20px", 
                fontWeight: "700",
                marginBottom: "20px"
              }}>
                {caseItem.category}
              </h3>
              
              <div style={{ marginBottom: "15px" }}>
                <strong style={{ color: "#f8fafc", display: "block", marginBottom: "8px" }}>❌ Problem:</strong>
                <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                  {caseItem.problem}
                </p>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <strong style={{ color: "#f8fafc", display: "block", marginBottom: "8px" }}>⚡ Turbo Action:</strong>
                <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                  {caseItem.action}
                </p>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <strong style={{ color: "#f8fafc", display: "block", marginBottom: "8px" }}>✅ Result:</strong>
                <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                  {caseItem.result}
                </p>
              </div>

              <div style={{
                background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))",
                borderRadius: "12px",
                padding: "15px",
                marginTop: "20px"
              }}>
                <strong style={{ color: "#06b6d4", display: "block", marginBottom: "5px" }}>💰 Savings:</strong>
                <p style={{ color: "#f8fafc", fontSize: "16px", fontWeight: "600" }}>
                  {caseItem.savings}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero" style={{ paddingTop: "60px", paddingBottom: "100px" }}>
        <div className="hero-content">
          <h2 className="features-title" style={{ marginBottom: "20px" }}>
            Get Your Own Success Story
          </h2>
          <p className="hero-description" style={{ marginBottom: "40px" }}>
            Join hundreds of consumers who have successfully defended their rights with Turbo Response. Start your case today and get your AI-powered legal game plan in minutes.
          </p>
          <Link href="/intake" className="cta-button">
            🚀 START YOUR CASE NOW
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: "rgba(15, 23, 42, 0.9)",
        borderTop: "1px solid rgba(6, 182, 212, 0.2)",
        padding: "40px 20px",
        textAlign: "center",
        color: "#cbd5e1"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p>© 2025 Turbo Response HQ. All rights reserved.</p>
          <div style={{ marginTop: "20px", display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/terms-of-service" style={{ color: "#06b6d4", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/disclaimer" style={{ color: "#06b6d4", textDecoration: "none" }}>Disclaimer</Link>
            <Link href="/service-agreement" style={{ color: "#06b6d4", textDecoration: "none" }}>Service Agreement</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

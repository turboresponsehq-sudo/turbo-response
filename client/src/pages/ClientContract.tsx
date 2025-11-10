import { useState, useEffect } from "react";
import { Link } from "wouter";
import "./ClientContract.css";

export default function ClientContract() {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);
  const [agree4, setAgree4] = useState(false);
  const [agree5, setAgree5] = useState(false);
  const [agree6, setAgree6] = useState(false);

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="contract-page">
      <div className="contract-container">
        <h1>📝 Client Service Contract</h1>

        <div className="warning-box">
          <strong>⚠️ LEGALLY BINDING AGREEMENT</strong><br />
          This is a legally binding contract. By signing below, you agree to all terms and conditions. Read carefully before proceeding.
        </div>

        <p><strong>Contract Date:</strong> {dateString}</p>
        <p><strong>Service Provider:</strong> Turbo Response HQ</p>
        <p><strong>Client Name:</strong> {clientName || "[To be filled]"}</p>

        <h2>Agreement Terms</h2>

        <p>This Client Service Contract ("Contract") is entered into between Turbo Response HQ ("Provider") and the client identified above ("Client") for consumer defense document preparation services.</p>

        <h2>1. Scope of Services</h2>
        <p>Provider agrees to prepare response documents and provide strategic guidance for Client's consumer defense case as described in the submitted case details. Services include:</p>
        <ul>
          <li>Review of client-provided documents and correspondence</li>
          <li>Preparation of response letters using AI-powered analysis</li>
          <li>Strategic recommendations for case resolution</li>
          <li>One round of revisions (if requested within 7 days of delivery)</li>
        </ul>

        <h2>2. What We Do NOT Provide</h2>
        <div className="warning-box">
          <strong>IMPORTANT LIMITATIONS:</strong>
          <ul style={{ marginTop: "10px" }}>
            <li>We are NOT attorneys and do NOT provide legal advice or legal representation</li>
            <li>We do NOT practice law</li>
            <li>We do NOT represent you in court, legal proceedings, or any legal matter</li>
            <li>We do NOT guarantee any specific outcome</li>
            <li>We do NOT communicate with creditors, courts, or agencies on your behalf</li>
            <li>We provide document preparation and consumer advocacy support services ONLY</li>
          </ul>
        </div>

        <h2>3. Payment Terms</h2>
        <ul>
          <li><strong>Payment Required:</strong> Full payment must be received before work begins</li>
          <li><strong>Pricing:</strong> As quoted after situation review (Starter $149, Standard Support $349, Comprehensive $699+)</li>
          <li><strong>NO REFUNDS:</strong> All sales are final - no refunds, exchanges, or chargebacks permitted</li>
          <li><strong>Rush Fees:</strong> Expedited service requests incur additional fees</li>
        </ul>

        <h2>4. Client Acknowledgments</h2>
        <div className="highlight">
          <p><strong>Client expressly acknowledges and agrees:</strong></p>
          <ul>
            <li>✓ No attorney-client relationship exists</li>
            <li>✓ Provider does NOT practice law and does NOT provide legal advice</li>
            <li>✓ No guarantees are made about outcomes</li>
            <li>✓ Results depend on third-party decisions beyond Provider's control</li>
            <li>✓ Client is responsible for reviewing and submitting all documents</li>
            <li>✓ Client MUST consult a licensed attorney for legal advice</li>
            <li>✓ Provider provides document preparation services ONLY</li>
            <li>✓ Payment is non-refundable once services are initiated</li>
          </ul>
        </div>

        <h2>5. Limitation of Liability</h2>
        <p>Provider's total liability shall not exceed the amount paid by Client for services. Provider is not liable for:</p>
        <ul>
          <li>Outcomes determined by creditors, courts, or government agencies</li>
          <li>Delays caused by Client or third parties</li>
          <li>Consequential, indirect, or punitive damages</li>
          <li>Client's failure to follow recommendations or submit documents</li>
        </ul>

        <h2>6. Dispute Resolution</h2>
        <p>Any disputes arising from this Contract shall be resolved through binding arbitration in accordance with American Arbitration Association rules. Client waives the right to jury trial and class action participation.</p>

        <h2>7. Termination</h2>
        <p>Provider reserves the right to terminate services if:</p>
        <ul>
          <li>Client provides false or fraudulent information</li>
          <li>Client fails to cooperate or respond to communications</li>
          <li>Client uses services for illegal purposes</li>
          <li>Client initiates a chargeback or payment dispute</li>
        </ul>
        <p><strong>No refunds will be issued upon termination.</strong></p>

        <h2>8. Entire Agreement</h2>
        <p>This Contract, together with the Service Agreement available at our website, constitutes the entire agreement between the parties and supersedes all prior agreements or understandings.</p>

        <div className="signature-section">
          <h2>📋 Client Signature & Acknowledgment</h2>
          
          <p style={{ textAlign: "center", marginBottom: "30px" }}>By checking the boxes below and providing your electronic signature, you agree to be legally bound by this Contract.</p>

          <div className="checkbox-group">
            <div className="checkbox-item">
              <input type="checkbox" id="agree1" checked={agree1} onChange={(e) => setAgree1(e.target.checked)} />
              <label htmlFor="agree1">I have read and understand this entire Contract and the Service Agreement</label>
            </div>

            <div className="checkbox-item">
              <input type="checkbox" id="agree2" checked={agree2} onChange={(e) => setAgree2(e.target.checked)} />
              <label htmlFor="agree2">I acknowledge that Turbo Response HQ is NOT a law firm and does NOT provide legal advice</label>
            </div>

            <div className="checkbox-item">
              <input type="checkbox" id="agree3" checked={agree3} onChange={(e) => setAgree3(e.target.checked)} />
              <label htmlFor="agree3">I understand that NO REFUNDS will be provided under any circumstances</label>
            </div>

            <div className="checkbox-item">
              <input type="checkbox" id="agree4" checked={agree4} onChange={(e) => setAgree4(e.target.checked)} />
              <label htmlFor="agree4">I understand that NO GUARANTEES are made about my case outcome</label>
            </div>

            <div className="checkbox-item">
              <input type="checkbox" id="agree5" checked={agree5} onChange={(e) => setAgree5(e.target.checked)} />
              <label htmlFor="agree5">I agree to resolve disputes through binding arbitration (no court, no jury trial, no class action)</label>
            </div>

            <div className="checkbox-item">
              <input type="checkbox" id="agree6" checked={agree6} onChange={(e) => setAgree6(e.target.checked)} />
              <label htmlFor="agree6">I have provided accurate and truthful information about my case</label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="clientName">Full Legal Name (Electronic Signature) *</label>
            <input 
              type="text" 
              id="clientName" 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Type your full legal name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signatureDate">Date *</label>
            <input type="text" id="signatureDate" value={dateString} readOnly />
          </div>

          <div className="form-group">
            <label htmlFor="clientEmail">Email Address *</label>
            <input 
              type="email" 
              id="clientEmail" 
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <p style={{ marginTop: "30px", fontSize: "0.9rem", color: "var(--text-secondary)", textAlign: "center" }}>
            Electronic signatures are legally binding. By typing your name above, you agree that it constitutes your legal signature.
          </p>
        </div>

        <div className="back-link">
          <Link href="/">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
}

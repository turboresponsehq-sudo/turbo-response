import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import axios from "axios";
import "./ClientContract.css";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://turboresponsehq.ai";

export default function SignContract() {
  const [, params] = useRoute("/sign-contract/:caseId");
  const [, setLocation] = useLocation();
  
  const caseId = params?.caseId;
  
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);
  const [agree4, setAgree4] = useState(false);
  const [agree5, setAgree5] = useState(false);
  const [agree6, setAgree6] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [caseData, setCaseData] = useState<any>(null);

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Fetch case data
  useEffect(() => {
    if (!caseId) return;
    
    const fetchCase = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/client/case`, {
          params: { caseId }
        });
        
        if (response.data.success) {
          setCaseData(response.data.case);
          setClientEmail(response.data.case.email || "");
          setClientName(response.data.case.client_name || "");
        }
      } catch (err: any) {
        console.error("Error fetching case:", err);
        setError("Failed to load case information");
      }
    };
    
    fetchCase();
  }, [caseId]);

  // Check if contract already signed
  useEffect(() => {
    if (!caseId) return;
    
    const checkContractStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/case/${caseId}/contract-status`);
        
        if (response.data.success && response.data.contractSigned) {
          // Contract already signed, redirect to payment
          setLocation(`/payment/${caseId}`);
        }
      } catch (err) {
        console.error("Error checking contract status:", err);
      }
    };
    
    checkContractStatus();
  }, [caseId, setLocation]);

  const agreementText = `
CLIENT SERVICE CONTRACT

Contract Date: ${dateString}
Service Provider: Turbo Response HQ
Client Name: ${clientName}
Client Email: ${clientEmail}
Case ID: ${caseId}

This Client Service Contract ("Contract") is entered into between Turbo Response HQ ("Provider") and the client identified above ("Client") for consumer defense document preparation services.

1. SCOPE OF SERVICES
Provider agrees to prepare response documents and provide strategic guidance for Client's consumer defense case as described in the submitted case details. Services include:
• Review of client-provided documents and correspondence
• Preparation of response letters using AI-powered analysis
• Strategic recommendations for case resolution
• One round of revisions (if requested within 7 days of delivery)

2. WHAT WE DO NOT PROVIDE
IMPORTANT LIMITATIONS:
• We are NOT attorneys and do NOT provide legal advice or legal representation
• We do NOT practice law
• We do NOT represent you in court, legal proceedings, or any legal matter
• We do NOT guarantee any specific outcome
• We do NOT communicate with creditors, courts, or agencies on your behalf
• We provide document preparation and consumer advocacy support services ONLY

3. PAYMENT TERMS
• Payment Required: Full payment must be received before work begins
• Pricing: As quoted after situation review
• NO REFUNDS: All sales are final - no refunds, exchanges, or chargebacks permitted
• Rush Fees: Expedited service requests incur additional fees

4. CLIENT ACKNOWLEDGMENTS
Client expressly acknowledges and agrees:
• No attorney-client relationship exists
• Provider does NOT practice law and does NOT provide legal advice
• No guarantees are made about outcomes
• Results depend on third-party decisions beyond Provider's control
• Client is responsible for reviewing and submitting all documents
• Client MUST consult a licensed attorney for legal advice
• Provider provides document preparation services ONLY
• Payment is non-refundable once services are initiated

5. LIMITATION OF LIABILITY
Provider's total liability shall not exceed the amount paid by Client for services. Provider is not liable for:
• Outcomes determined by creditors, courts, or government agencies
• Delays caused by Client or third parties
• Consequential, indirect, or punitive damages
• Client's failure to follow recommendations or submit documents

6. DISPUTE RESOLUTION
Any disputes arising from this Contract shall be resolved through binding arbitration in accordance with American Arbitration Association rules. Client waives the right to jury trial and class action participation.

7. TERMINATION
Provider reserves the right to terminate services if:
• Client provides false or fraudulent information
• Client fails to cooperate or respond to communications
• Client uses services for illegal purposes
• Client initiates a chargeback or payment dispute
No refunds will be issued upon termination.

8. ENTIRE AGREEMENT
This Contract constitutes the entire agreement between the parties and supersedes all prior agreements or understandings.

CLIENT ACKNOWLEDGMENTS:
☑ I have read and understand this entire Contract
☑ I acknowledge that Turbo Response HQ is NOT a law firm and does NOT provide legal advice
☑ I understand that NO REFUNDS will be provided under any circumstances
☑ I understand that NO GUARANTEES are made about my case outcome
☑ I agree to resolve disputes through binding arbitration (no court, no jury trial, no class action)
☑ I have provided accurate and truthful information about my case

Electronic Signature: ${clientName}
Date: ${dateString}
IP Address: [Captured at time of signing]
`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!clientName.trim()) {
      setError("Please enter your full legal name");
      return;
    }
    
    if (!clientEmail.trim() || !clientEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!agree1 || !agree2 || !agree3 || !agree4 || !agree5 || !agree6) {
      setError("You must check all 6 acknowledgment boxes to proceed");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post(`${API_URL}/api/case/${caseId}/sign-contract`, {
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        agreementText,
        acknowledgments: [agree1, agree2, agree3, agree4, agree5, agree6]
      });
      
      if (response.data.success) {
        // Contract signed successfully, redirect to payment
        setLocation(`/payment/${caseId}`);
      } else {
        setError(response.data.message || "Failed to sign contract");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Error signing contract:", err);
      setError(err.response?.data?.message || "Failed to sign contract. Please try again.");
      setLoading(false);
    }
  };

  if (!caseId) {
    return (
      <div className="contract-page">
        <div className="contract-container">
          <h1>❌ Invalid Request</h1>
          <p>No case ID provided. Please access this page from your client portal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contract-page">
      <div className="contract-container">
        <h1>📝 Client Service Contract</h1>

        <div className="warning-box">
          <strong>⚠️ LEGALLY BINDING AGREEMENT</strong><br />
          This is a legally binding contract. By signing below, you agree to all terms and conditions. Read carefully before proceeding.
        </div>

        {error && (
          <div className="warning-box" style={{ background: "rgba(239, 68, 68, 0.1)", borderColor: "#ef4444" }}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        <p><strong>Contract Date:</strong> {dateString}</p>
        <p><strong>Service Provider:</strong> Turbo Response HQ</p>
        <p><strong>Case ID:</strong> {caseId}</p>
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
          <li><strong>Pricing:</strong> As quoted after situation review</li>
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
        <p>This Contract constitutes the entire agreement between the parties and supersedes all prior agreements or understandings.</p>

        <form onSubmit={handleSubmit}>
          <div className="signature-section">
            <h2>📋 Client Signature & Acknowledgment</h2>
            
            <p style={{ textAlign: "center", marginBottom: "30px" }}>By checking the boxes below and providing your electronic signature, you agree to be legally bound by this Contract.</p>

            <div className="checkbox-group">
              <div className="checkbox-item">
                <input type="checkbox" id="agree1" checked={agree1} onChange={(e) => setAgree1(e.target.checked)} required />
                <label htmlFor="agree1">I have read and understand this entire Contract</label>
              </div>

              <div className="checkbox-item">
                <input type="checkbox" id="agree2" checked={agree2} onChange={(e) => setAgree2(e.target.checked)} required />
                <label htmlFor="agree2">I acknowledge that Turbo Response HQ is NOT a law firm and does NOT provide legal advice</label>
              </div>

              <div className="checkbox-item">
                <input type="checkbox" id="agree3" checked={agree3} onChange={(e) => setAgree3(e.target.checked)} required />
                <label htmlFor="agree3">I understand that NO REFUNDS will be provided under any circumstances</label>
              </div>

              <div className="checkbox-item">
                <input type="checkbox" id="agree4" checked={agree4} onChange={(e) => setAgree4(e.target.checked)} required />
                <label htmlFor="agree4">I understand that NO GUARANTEES are made about my case outcome</label>
              </div>

              <div className="checkbox-item">
                <input type="checkbox" id="agree5" checked={agree5} onChange={(e) => setAgree5(e.target.checked)} required />
                <label htmlFor="agree5">I agree to resolve disputes through binding arbitration (no court, no jury trial, no class action)</label>
              </div>

              <div className="checkbox-item">
                <input type="checkbox" id="agree6" checked={agree6} onChange={(e) => setAgree6(e.target.checked)} required />
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
                required
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
                required
              />
            </div>

            <p style={{ marginTop: "30px", fontSize: "0.9rem", color: "var(--text-secondary)", textAlign: "center" }}>
              Electronic signatures are legally binding. By typing your name above, you agree that it constitutes your legal signature.
            </p>

            <button 
              type="submit" 
              className="cta-button" 
              disabled={loading}
              style={{ 
                width: "100%", 
                marginTop: "30px",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Signing Contract..." : "Sign Contract & Proceed to Payment →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

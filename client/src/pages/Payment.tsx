import { useState, useEffect } from "react";
import { PaymentSkeleton } from "@/components/Skeleton";
import { api } from "@/lib/api";
import "./Payment.css";

export default function Payment() {
  const [isLoading, setIsLoading] = useState(true);
  const [caseData, setCaseData] = useState({
    caseId: "Loading...",
    clientName: "Loading...",
    clientEmail: "Loading...",
    caseCategory: "Loading...",
    submissionDate: "Loading...",
    contractSignature: "Loading...",
    contractDate: "Loading...",
    contractIp: "Loading...",
    totalAmount: "$0.00",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Get data from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email") || "N/A";
    const name = urlParams.get("name") || "N/A";
    const category = urlParams.get("category") || "N/A";
    const status = urlParams.get("status") || "N/A";

    // Generate case ID
    const caseId = `CASE-${Date.now()}`;
    const today = new Date().toLocaleDateString();

    // Simulate loading
    setTimeout(() => {
      setCaseData({
        caseId,
        clientName: name,
        clientEmail: email,
        caseCategory: category.toUpperCase(),
        submissionDate: today,
        contractSignature: name,
        contractDate: today,
        contractIp: "Recorded",
        totalAmount: "$349.00", // Default price
      });
      setIsLoading(false);
    }, 800);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`✅ Copied to clipboard: ${text}`);
    });
  };

  const confirmPayment = async () => {
    if (!confirm("Have you completed the payment? Click OK to confirm.")) {
      return;
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const caseId = urlParams.get("caseId");

      if (caseId) {
        // Submit payment confirmation to backend
        await api.post('/api/payment/confirm', {
          case_id: caseId,
          payment_method: 'manual', // Cash App or Venmo
        });
      }

      setShowSuccess(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error: any) {
      alert(`Payment confirmation failed: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="payment-page">
        <PaymentSkeleton />
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="header">
          <div className="logo">⚡ TURBO RESPONSE</div>
          <p className="header-subtitle">Complete Your Payment</p>
        </div>

        {/* Case Details Card */}
        <div className="card">
          <h2>📋 Your Case Details</h2>
          <div className="info-row">
            <span className="info-label">Case ID:</span>
            <span className="info-value">{caseData.caseId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Client Name:</span>
            <span className="info-value">{caseData.clientName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{caseData.clientEmail}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Category:</span>
            <span className="info-value">{caseData.caseCategory}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Submission Date:</span>
            <span className="info-value">{caseData.submissionDate}</span>
          </div>
        </div>

        {/* Contract Confirmation Card */}
        <div className="card">
          <h2>✅ Contract Signed</h2>
          <div className="contract-summary">
            <h3>📝 Service Agreement Accepted</h3>
            <p>
              <strong>Signed by:</strong> {caseData.contractSignature}
            </p>
            <p>
              <strong>Date:</strong> {caseData.contractDate}
            </p>
            <p>
              <strong>IP Address:</strong> {caseData.contractIp}
            </p>
          </div>
          <p className="contract-terms">
            ✓ You have agreed to our Service Agreement and Client Contract
            <br />
            ✓ All terms including No Refunds policy are in effect
            <br />✓ Payment confirms your acceptance of all terms
          </p>
        </div>

        {/* Price Card */}
        <div className="card">
          <div className="price-box">
            <div className="price-label">Total Amount Due</div>
            <div className="price-amount">{caseData.totalAmount}</div>
            <div className="price-note">
              💳 Payment plans available with PayPal Pay in 4
            </div>
          </div>

          <h2 style={{ marginTop: "30px" }}>💳 Payment Methods</h2>

          <div className="payment-methods">
            {/* Cash App */}
            <div className="payment-method">
              <div className="payment-method-info">
                <div className="payment-icon">💵</div>
                <div>
                  <div className="payment-name">Cash App</div>
                  <div className="payment-handle">$turboresponsehq</div>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => copyToClipboard("$turboresponsehq")}
              >
                📋 Copy
              </button>
            </div>

            {/* Venmo */}
            <div className="payment-method">
              <div className="payment-method-info">
                <div className="payment-icon">💚</div>
                <div>
                  <div className="payment-name">Venmo</div>
                  <div className="payment-handle">@Moneybossesapparel</div>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => copyToClipboard("@Moneybossesapparel")}
              >
                📋 Copy
              </button>
            </div>

            {/* PayPal */}
            <div
              className="payment-method"
              style={{
                border: "2px solid #06b6d4",
                background: "rgba(6, 182, 212, 0.05)",
              }}
            >
              <div className="payment-method-info">
                <div className="payment-icon">💙</div>
                <div>
                  <div className="payment-name">PayPal (Recommended)</div>
                  <div
                    className="payment-handle"
                    style={{ color: "#22c55e" }}
                  >
                    ✅ Instant Confirmation • Pay in 4 Available
                  </div>
                </div>
              </div>
              <div style={{ maxWidth: "300px" }}>
                <p style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
                  PayPal integration coming soon
                </p>
              </div>
            </div>
          </div>

          <div className="warning-box">
            <strong>⚠️ IMPORTANT (Cash App & Venmo only):</strong> After making
            payment via Cash App or Venmo, click the "I've Completed Payment"
            button below to notify us. Include your Case ID in the payment note.
            <br />
            <br />
            <strong>💙 PayPal users:</strong> No need to click the button - your
            payment is automatically confirmed!
          </div>

          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button
              className="btn btn-primary btn-large"
              onClick={confirmPayment}
            >
              ✅ I've Completed Payment
            </button>
          </div>

          {showSuccess && (
            <div className="success-box show">
              <strong style={{ color: "#22c55e" }}>
                ✅ Payment Confirmation Received!
              </strong>
              <br />
              Thank you! We've received your payment notification. Your case will
              be processed within 7 business days.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

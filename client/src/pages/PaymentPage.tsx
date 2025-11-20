/**
 * Public Payment Page
 * Allows clients to select payment method and confirm payment
 */

import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://turbo-response-backend.onrender.com";

interface CaseData {
  id: number;
  case_number: string;
  full_name: string;
  email: string;
  category: string;
  amount?: string;
  funnel_stage: string;
  pricing_tier?: string;
  pricing_tier_amount?: number;
  pricing_tier_name?: string;
}

export default function PaymentPage() {
  const params = useParams<{ caseId: string }>();
  const [, setLocation] = useLocation();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/case/${params?.caseId}/payment-info`);
        setCaseData(res.data.case);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load case information");
      } finally {
        setLoading(false);
      }
    };

    if (params?.caseId) {
      fetchCase();
    }
  }, [params?.caseId]);

  const handleIPaid = async () => {
    if (!selectedMethod) {
      setError("Please select a payment method");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/api/case/${params?.caseId}/mark-payment-pending`, {
        payment_method: selectedMethod
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit payment confirmation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <div style={{
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
        }}>
          <p style={{ margin: 0, fontSize: "1.125rem" }}>Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (error && !caseData) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <div style={{
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          maxWidth: "400px",
          textAlign: "center"
        }}>
          <h2 style={{ color: "#dc3545", marginTop: 0 }}>⚠️ Error</h2>
          <p style={{ color: "#6c757d" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <div style={{
          background: "white",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          maxWidth: "500px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ color: "#28a745", marginTop: 0 }}>Payment Confirmation Received!</h2>
          <p style={{ color: "#6c757d", lineHeight: 1.6 }}>
            Thank you! Your payment confirmation has been submitted. Our team will verify your payment and activate your case within 24 hours.
          </p>
          <p style={{ color: "#6c757d", lineHeight: 1.6, marginTop: "1.5rem" }}>
            You will receive an email with your client portal login credentials once payment is verified.
          </p>
          <p style={{ 
            marginTop: "2rem", 
            padding: "1rem", 
            background: "#f8f9fa", 
            borderRadius: "8px",
            fontSize: "0.875rem",
            color: "#495057"
          }}>
            <strong>Case Number:</strong> {caseData?.case_number}
          </p>
        </div>
      </div>
    );
  }

  // Use pricing_tier_amount if available, otherwise fall back to amount or default
  const displayAmount = caseData?.pricing_tier_amount 
    ? `$${caseData.pricing_tier_amount}` 
    : (caseData?.amount || "$349");
  
  const paymentMethods = [
    {
      id: "paypal",
      name: "PayPal",
      icon: "💳",
      instructions: "Send payment to: payments@turboresponsehq.com",
      amount: displayAmount
    },
    {
      id: "cashapp",
      name: "Cash App",
      icon: "💵",
      instructions: "Send payment to: $TurboResponseHQ",
      amount: displayAmount
    },
    {
      id: "venmo",
      name: "Venmo",
      icon: "💰",
      instructions: "Send payment to: @TurboResponseHQ",
      amount: displayAmount
    }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "2rem 1rem",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "2rem",
          color: "white",
          textAlign: "center"
        }}>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700 }}>Complete Your Payment</h1>
          <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>Case #{caseData?.case_number}</p>
        </div>

        {/* Case Info */}
        <div style={{ padding: "2rem", borderBottom: "1px solid #e9ecef" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#6c757d" }}>Client Name</p>
              <p style={{ margin: "0.25rem 0 0 0", fontWeight: 600, color: "#212529" }}>{caseData?.full_name}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#6c757d" }}>Category</p>
              <p style={{ margin: "0.25rem 0 0 0", fontWeight: 600, color: "#212529" }}>{caseData?.category}</p>
            </div>
          </div>
          
          {/* Pricing Tier Display */}
          {caseData?.pricing_tier_name && (
            <div style={{ 
              padding: "1rem", 
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
              borderRadius: "8px",
              border: "2px solid rgba(102, 126, 234, 0.3)"
            }}>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#667eea", fontWeight: 600 }}>Selected Package</p>
              <p style={{ margin: "0.5rem 0 0 0", fontSize: "1.25rem", fontWeight: 700, color: "#212529" }}>
                {caseData.pricing_tier_name}
              </p>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", fontWeight: 700, color: "#667eea" }}>
                {displayAmount}
              </p>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div style={{ padding: "2rem" }}>
          <h3 style={{ marginTop: 0, color: "#212529", fontSize: "1.25rem" }}>Select Payment Method</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                style={{
                  border: selectedMethod === method.id ? "3px solid #667eea" : "2px solid #dee2e6",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: selectedMethod === method.id ? "#f8f9ff" : "white"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "2rem" }}>{method.icon}</span>
                  <div>
                    <h4 style={{ margin: 0, color: "#212529" }}>{method.name}</h4>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.25rem", fontWeight: 700, color: "#667eea" }}>
                      {method.amount}
                    </p>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6c757d" }}>{method.instructions}</p>
              </div>
            ))}
          </div>

          {error && (
            <div style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#f8d7da",
              color: "#721c24",
              borderRadius: "8px",
              fontSize: "0.875rem"
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleIPaid}
            disabled={!selectedMethod || submitting}
            style={{
              width: "100%",
              marginTop: "2rem",
              padding: "1rem",
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "white",
              background: selectedMethod && !submitting ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#6c757d",
              border: "none",
              borderRadius: "12px",
              cursor: selectedMethod && !submitting ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: selectedMethod && !submitting ? "0 4px 15px rgba(102, 126, 234, 0.4)" : "none"
            }}
          >
            {submitting ? "Submitting..." : "✓ I Paid"}
          </button>

          <p style={{
            marginTop: "1.5rem",
            fontSize: "0.75rem",
            color: "#6c757d",
            textAlign: "center",
            lineHeight: 1.6
          }}>
            After clicking "I Paid", our team will verify your payment within 24 hours and send you portal access credentials.
          </p>
        </div>
      </div>
    </div>
  );
}

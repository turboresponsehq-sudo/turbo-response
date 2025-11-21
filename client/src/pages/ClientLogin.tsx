/**
 * Client Portal Login Page
 * Two-step authentication: Email + Case ID → Verification Code
 */

import { useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://turbo-response-backend.onrender.com";

export default function ClientLogin() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  
  // Step 1: Request code
  const [email, setEmail] = useState('');
  const [caseId, setCaseId] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [caseNumber, setCaseNumber] = useState<string | null>(null);
  
  // Step 2: Verify code
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequesting(true);
    setRequestError(null);

    try {
      const response = await axios.post(`${API_URL}/api/client/login`, {
        email: email.trim(),
        caseId: caseId.trim()
      });

      setCaseNumber(response.data.caseNumber);
      setStep('verify');
    } catch (error: any) {
      setRequestError(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setRequesting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError(null);

    try {
      const response = await axios.post(`${API_URL}/api/client/verify`, {
        email: email.trim(),
        caseId: caseId.trim(),
        code: code.trim()
      }, {
        withCredentials: true // Important: Send cookies
      });

      // Redirect to client portal
      setLocation(`/client/case/${response.data.caseId}`);
    } catch (error: any) {
      setVerifyError(error.response?.data?.message || 'Verification failed');
      if (error.response?.data?.attemptsRemaining !== undefined) {
        setAttemptsRemaining(error.response.data.attemptsRemaining);
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1628 0%, #1e293b 50%, #334155 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Animated Background Grid */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        opacity: 0.3,
        pointerEvents: "none"
      }} />

      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        maxWidth: "450px",
        width: "100%",
        padding: "2rem",
        position: "relative",
        zIndex: 1
      }}>
        {/* Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            fontSize: "3rem",
            marginBottom: "0.5rem"
          }}>⚡</div>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #06b6d4, #0284c7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 0.5rem 0"
          }}>
            Client Portal
          </h1>
          <p style={{
            color: "#64748b",
            fontSize: "0.875rem",
            margin: 0
          }}>
            Turbo Response HQ
          </p>
        </div>

        {step === 'request' ? (
          // Step 1: Request Verification Code
          <form onSubmit={handleRequestCode}>
            <h2 style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: "1.5rem"
            }}>
              Access Your Case
            </h2>

            {requestError && (
              <div style={{
                padding: "1rem",
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
                border: "1px solid #fecaca"
              }}>
                {requestError}
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "0.5rem"
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  fontSize: "1rem",
                  color: "#1e293b",
                  backgroundColor: "#ffffff",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#06b6d4"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "0.5rem"
              }}>
                Case ID
              </label>
              <input
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                required
                placeholder="Enter your case ID number"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  fontSize: "1rem",
                  color: "#1e293b",
                  backgroundColor: "#ffffff",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#06b6d4"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
              <p style={{
                fontSize: "0.75rem",
                color: "#64748b",
                marginTop: "0.5rem",
                marginBottom: 0
              }}>
                Your case ID was provided in your confirmation email
              </p>
            </div>

            <button
              type="submit"
              disabled={requesting}
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "1rem",
                fontWeight: 600,
                color: "white",
                background: requesting ? "#94a3b8" : "linear-gradient(135deg, #06b6d4, #0284c7)",
                border: "none",
                borderRadius: "8px",
                cursor: requesting ? "not-allowed" : "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)"
              }}
              onMouseEnter={(e) => {
                if (!requesting) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(6, 182, 212, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(6, 182, 212, 0.3)";
              }}
            >
              {requesting ? "Sending Code..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          // Step 2: Verify Code
          <form onSubmit={handleVerifyCode}>
            <button
              type="button"
              onClick={() => {
                setStep('request');
                setCode('');
                setVerifyError(null);
                setAttemptsRemaining(null);
              }}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                color: "#64748b",
                backgroundColor: "transparent",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                cursor: "pointer",
                marginBottom: "1rem"
              }}
            >
              ← Back
            </button>

            <h2 style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: "1rem"
            }}>
              Enter Verification Code
            </h2>

            <p style={{
              fontSize: "0.875rem",
              color: "#64748b",
              marginBottom: "1.5rem"
            }}>
              We sent a 6-digit code to <strong>{email}</strong>
              {caseNumber && <><br />Case: <strong>{caseNumber}</strong></>}
            </p>

            {verifyError && (
              <div style={{
                padding: "1rem",
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
                border: "1px solid #fecaca"
              }}>
                {verifyError}
                {attemptsRemaining !== null && attemptsRemaining > 0 && (
                  <div style={{ marginTop: "0.5rem", fontWeight: 600 }}>
                    {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "0.5rem"
              }}>
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                placeholder="000000"
                maxLength={6}
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  textAlign: "center",
                  letterSpacing: "0.5rem",
                  color: "#1e293b",
                  backgroundColor: "#ffffff",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontFamily: "monospace",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#06b6d4"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                autoFocus
              />
              <p style={{
                fontSize: "0.75rem",
                color: "#64748b",
                marginTop: "0.5rem",
                marginBottom: 0
              }}>
                Code expires in 10 minutes
              </p>
            </div>

            <button
              type="submit"
              disabled={verifying || code.length !== 6}
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "1rem",
                fontWeight: 600,
                color: "white",
                background: (verifying || code.length !== 6) ? "#94a3b8" : "linear-gradient(135deg, #06b6d4, #0284c7)",
                border: "none",
                borderRadius: "8px",
                cursor: (verifying || code.length !== 6) ? "not-allowed" : "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)"
              }}
              onMouseEnter={(e) => {
                if (!verifying && code.length === 6) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(6, 182, 212, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(6, 182, 212, 0.3)";
              }}
            >
              {verifying ? "Verifying..." : "Access Portal"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('request');
                setCode('');
                setVerifyError(null);
                setAttemptsRemaining(null);
              }}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "0.875rem",
                color: "#64748b",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "1rem",
                textDecoration: "underline"
              }}
            >
              Didn't receive code? Request new one
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "2rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid #e2e8f0",
          textAlign: "center"
        }}>
          <p style={{
            fontSize: "0.75rem",
            color: "#94a3b8",
            margin: 0
          }}>
            Need help? Contact us at{" "}
            <a href="mailto:support@turboresponsehq.ai" style={{ color: "#06b6d4", textDecoration: "none" }}>
              support@turboresponsehq.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

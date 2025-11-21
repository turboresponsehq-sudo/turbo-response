/**
 * Client Portal Dashboard
 * Shows case status, notes, documents, and payment link
 */

import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import axios from "axios";
import ClientMessaging from "../components/ClientMessaging";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://turbo-response-backend.onrender.com";

const CATEGORY_NAMES: Record<string, string> = {
  eviction: "Eviction & Housing",
  debt: "Debt Collection",
  irs: "IRS & Tax Issues",
  wage: "Wage Garnishment",
  medical: "Medical Bills",
  benefits: "Benefits Denial",
  auto: "Auto Repossession",
  consumer: "Consumer Rights"
};

export default function ClientPortal() {
  const [, params] = useRoute("/client/case/:id");
  const [, setLocation] = useLocation();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchCaseData();
  }, [params?.id]);

  const fetchCaseData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/client/case/${params?.id}`, {
        withCredentials: true
      });
      setCaseData(response.data.case);
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Not authenticated - redirect to login
        setLocation('/client/login');
      } else {
        setError(error.response?.data?.message || 'Failed to load case data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await axios.post(`${API_URL}/api/upload/single`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update case documents
      const updatedDocuments = [...(caseData.documents || []), response.data.file_url];
      
      // Update case in database
      await axios.patch(
        `${API_URL}/api/case/${params?.id}`,
        { documents: updatedDocuments },
        { withCredentials: true }
      );

      // Refresh case data
      await fetchCaseData();
    } catch (error: any) {
      setUploadError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/client/logout`, {}, { withCredentials: true });
      setLocation('/client/login');
    } catch (error) {
      // Redirect anyway
      setLocation('/client/login');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a1628 0%, #1e293b 50%, #334155 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚡</div>
          <div>Loading your case...</div>
        </div>
      </div>
    );
  }

  if (error) {
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
        <div style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          maxWidth: "500px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
          <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>Error</h2>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>{error}</p>
          <button
            onClick={() => setLocation('/client/login')}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#06b6d4",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const documents = caseData?.documents || [];

  // Payment Gating: Check if payment is required
  const isPaymentRequired = !caseData?.payment_verified;
  const isPaymentPending = caseData?.funnel_stage === 'Payment Pending';
  const hasPaymentLink = caseData?.payment_link;

  // If payment not verified, show payment required screen
  if (isPaymentRequired && !loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a1628 0%, #1e293b 50%, #334155 100%)",
        padding: "2rem 1rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
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
          maxWidth: "600px",
          width: "100%",
          position: "relative",
          zIndex: 1
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <div style={{ fontSize: "2rem" }}>⚡</div>
                <h1 style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #06b6d4, #0284c7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: 0
                }}>
                  Client Portal
                </h1>
              </div>
              <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
                Case: <strong>{caseData?.case_number}</strong>
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600
              }}
            >
              Logout
            </button>
          </div>

          {/* Payment Required Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            textAlign: "center"
          }}>
            {isPaymentPending ? (
              // Payment Pending State
              <>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⏳</div>
                <h2 style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#f59e0b",
                  marginBottom: "1rem"
                }}>
                  Payment Verification in Progress
                </h2>
                <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                  Thank you for submitting your payment! Our team is verifying your payment and will unlock your portal access within 24 hours.
                </p>
                <div style={{
                  padding: "1rem",
                  backgroundColor: "#fef3c7",
                  border: "1px solid #fbbf24",
                  borderRadius: "8px",
                  marginBottom: "1.5rem"
                }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#92400e", marginBottom: "0.5rem" }}>
                    📧 We'll notify you via email once verified
                  </div>
                  <div style={{ color: "#78350f", fontSize: "0.875rem" }}>
                    Case: {caseData?.case_number}
                  </div>
                </div>
              </>
            ) : (
              // Payment Required State
              <>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💳</div>
                <h2 style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#dc2626",
                  marginBottom: "1rem"
                }}>
                  Payment Required
                </h2>
                <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                  Your case has been reviewed and pricing has been assigned. Please complete payment to unlock full portal access.
                </p>

                {/* Pricing Display */}
                {caseData?.pricing_tier_name && (
                  <div style={{
                    padding: "1.5rem",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                    borderRadius: "12px",
                    marginBottom: "1.5rem",
                    color: "white"
                  }}>
                    <div style={{ fontSize: "0.875rem", color: "#06b6d4", marginBottom: "0.5rem", fontWeight: 600 }}>
                      Your Package
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                      {caseData.pricing_tier_name}
                    </div>
                    <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#06b6d4" }}>
                      ${caseData.pricing_tier_amount}
                    </div>
                  </div>
                )}

                {hasPaymentLink ? (
                  <button
                    onClick={() => setLocation(`/sign-contract/${caseData.id}`)}
                    style={{
                      display: "inline-block",
                      padding: "1rem 2rem",
                      background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      textDecoration: "none",
                      cursor: "pointer",
                      boxShadow: "0 10px 30px rgba(6, 182, 212, 0.3)"
                    }}
                  >
                    📝 Sign Contract & Proceed to Payment →
                  </button>
                ) : (
                  <div style={{
                    padding: "1rem",
                    backgroundColor: "#fef3c7",
                    border: "1px solid #fbbf24",
                    borderRadius: "8px"
                  }}>
                    <div style={{ color: "#78350f", fontSize: "0.875rem" }}>
                      Payment link will be provided by our team shortly. Please check back soon or contact us for assistance.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1628 0%, #1e293b 50%, #334155 100%)",
      padding: "2rem 1rem",
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
        maxWidth: "900px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "2rem" }}>⚡</div>
              <h1 style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #06b6d4, #0284c7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0
              }}>
                Client Portal
              </h1>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
              Case: <strong>{caseData?.case_number}</strong>
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600
            }}
          >
            Logout
          </button>
        </div>

        {/* Status Card */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)"
        }}>
          <h2 style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1e293b",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            📊 Case Status
          </h2>
          
          <div style={{
            padding: "1rem",
            backgroundColor: "#f0f9ff",
            border: "2px solid #06b6d4",
            borderRadius: "8px",
            marginBottom: "1rem"
          }}>
            <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>
              Current Status
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0284c7" }}>
              {caseData?.client_status || caseData?.status || 'Under Review'}
            </div>
          </div>

          {/* Pricing Tier Display */}
          {caseData?.pricing_tier_name && (
            <div style={{
              padding: "1rem",
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
              border: "2px solid rgba(102, 126, 234, 0.3)",
              borderRadius: "8px",
              marginBottom: "1rem"
            }}>
              <div style={{ fontSize: "0.875rem", color: "#667eea", marginBottom: "0.5rem", fontWeight: 600 }}>
                Your Package
              </div>
              <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#212529", marginBottom: "0.25rem" }}>
                {caseData.pricing_tier_name}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#667eea" }}>
                ${caseData.pricing_tier_amount}
              </div>
            </div>
          )}

          {caseData?.client_notes && (
            <div style={{
              padding: "1rem",
              backgroundColor: "#fef3c7",
              border: "1px solid #fbbf24",
              borderRadius: "8px"
            }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#92400e", marginBottom: "0.5rem" }}>
                📝 Updates from Turbo Response
              </div>
              <div style={{ color: "#78350f", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                {caseData.client_notes}
              </div>
            </div>
          )}
        </div>

        {/* Case Information */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)"
        }}>
          <h2 style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1e293b",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            📋 Case Information
          </h2>

          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>
                Category
              </div>
              <div style={{ fontSize: "1rem", color: "#1e293b", fontWeight: 500 }}>
                {CATEGORY_NAMES[caseData?.category] || caseData?.category || 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>
                Submitted
              </div>
              <div style={{ fontSize: "1rem", color: "#1e293b" }}>
                {caseData?.created_at ? new Date(caseData.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </div>
            </div>

            {caseData?.amount && (
              <div>
                <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>
                  Amount
                </div>
                <div style={{ fontSize: "1rem", color: "#1e293b", fontWeight: 500 }}>
                  ${parseFloat(caseData.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signed Contract */}
        {caseData?.contract_signed && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)"
          }}>
            <h2 style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              📝 Signed Contract
            </h2>
            <div style={{
              padding: "1rem",
              backgroundColor: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "8px",
              marginBottom: "1rem"
            }}>
              <div style={{ color: "#166534", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                ✅ Contract signed on {new Date(caseData.contract_signed_at).toLocaleDateString()}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
                Your signed service agreement is stored securely and can be downloaded at any time.
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  const response = await axios.get(`${API_URL}/api/case/${caseData.id}/contract`, {
                    responseType: 'blob'
                  });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `Contract-${caseData.case_number}.pdf`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                } catch (error) {
                  alert('Failed to download contract');
                }
              }}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)"
              }}
            >
              💾 Download Contract PDF
            </button>
          </div>
        )}

        {/* Documents */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)"
        }}>
          <h2 style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1e293b",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            📎 Documents ({documents.length})
          </h2>

          {documents.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {documents.map((doc: string, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    gap: "0.75rem"
                  }}
                >
                  <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: "0.875rem", color: "#1e293b" }}>
                      Document {idx + 1}
                    </div>
                    <div style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {doc.split('/').pop()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <a
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#06b6d4",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        whiteSpace: "nowrap"
                      }}
                    >
                      📄 View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
              No documents uploaded yet.
            </p>
          )}

          {/* Upload Button */}
          <div>
            <label style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "2px dashed #cbd5e1",
              borderRadius: "8px",
              cursor: uploading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              transition: "all 0.2s"
            }}>
              {uploading ? "Uploading..." : "📤 Upload Additional Document"}
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                accept=".pdf,.jpg,.jpeg,.png,.heic,.webp,.tiff,.bmp"
                style={{ display: "none" }}
              />
            </label>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem", marginBottom: 0 }}>
              Supported: PDF, JPG, PNG, HEIC, WEBP, TIFF, BMP
            </p>
            {uploadError && (
              <p style={{ fontSize: "0.875rem", color: "#dc2626", marginTop: "0.5rem", marginBottom: 0 }}>
                {uploadError}
              </p>
            )}
          </div>
        </div>

        {/* Payment Link */}
        {caseData?.payment_link && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            border: "2px solid #10b981"
          }}>
            <h2 style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#1e293b",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              💳 Payment
            </h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
              Your payment link is ready. Click below to complete payment.
            </p>
            <a
              href={caseData.payment_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "1rem 2rem",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              💰 Pay Now
            </a>
          </div>
        )}

        {/* Messaging Section */}
        <div style={{ marginBottom: "1.5rem" }}>
          <ClientMessaging 
            caseId={parseInt(params?.id || "0")} 
            clientName={caseData?.full_name || "Client"}
          />
        </div>

        {/* Help Section */}
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          padding: "1.5rem",
          textAlign: "center",
          color: "white"
        }}>
          <p style={{ marginBottom: "0.5rem" }}>
            Need help or have questions?
          </p>
          <a
            href="mailto:support@turboresponsehq.ai"
            style={{
              color: "#06b6d4",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            support@turboresponsehq.ai
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Admin Case Detail Page
 * Restored to match authoritative specification
 * Shows full case info + attachments + status dropdown editor
 * NO AI analysis, NO pricing, NO contract elements
 * PHASE 1: Mobile responsive with proper breakpoints
 */

import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://turbo-response-backend.onrender.com";

const STATUS_OPTIONS = [
  'Pending Review',
  'In Review',
  'Awaiting Client',
  'Completed',
  'Rejected'
];

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

export default function AdminCaseDetail() {
  const [, params] = useRoute("/admin/case/:id");
  const [, setLocation] = useLocation();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_session");
    if (!storedToken) {
      window.location.replace("/admin/login");
      return;
    }

    const fetchCase = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/case/${params?.id}`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        console.log('🔍 API Response:', res.data);
        console.log('🔍 Case Data:', res.data.case);
        console.log('🔍 Case Number:', res.data.case?.case_number);
        console.log('🔍 Full Name:', res.data.case?.full_name);
        setCaseData(res.data.case);
        setSelectedStatus(res.data.case.status);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || "Could not load case details");
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) fetchCase();
  }, [params?.id]);

  const handleStatusUpdate = async () => {
    const storedToken = localStorage.getItem("admin_session");
    setUpdating(true);
    setUpdateMessage(null);

    try {
      await axios.patch(
        `${API_URL}/api/case/${params?.id}`,
        { status: selectedStatus },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
      
      setUpdateMessage({ type: 'success', text: 'Status updated successfully' });
      setCaseData({ ...caseData, status: selectedStatus });
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to update status";
      setUpdateMessage({ type: 'error', text: errorMsg });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCase = async () => {
    if (!confirm(`Are you sure you want to delete case ${caseData.case_number}? This action cannot be undone.`)) {
      return;
    }

    const storedToken = localStorage.getItem("admin_session");
    setDeleting(true);

    try {
      await axios.delete(
        `${API_URL}/api/case/${params?.id}`,
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
      
      // Redirect to dashboard after successful deletion
      setLocation("/admin");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to delete case";
      alert(`Error: ${errorMsg}`);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <p>Loading case details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button
          onClick={() => setLocation("/admin")}
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1.5rem",
            minHeight: "48px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem"
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div style={{ padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <p>Case not found</p>
        <button
          onClick={() => setLocation("/admin")}
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1.5rem",
            minHeight: "48px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem"
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // documents is already parsed by pg driver (JSONB type)
  const documents = Array.isArray(caseData.documents) ? caseData.documents : [];
  
  // Helper function to ensure document URLs are absolute
  const getDocumentUrl = (doc: string) => {
    // If localhost URL, replace with production backend URL
    if (doc.includes('localhost')) {
      // Extract the path after localhost:PORT
      const match = doc.match(/localhost:\d+(\/.*)/)
      if (match) {
        return `${API_URL}${match[1]}`;
      }
    }
    // If already absolute production URL, return as-is
    if (doc.startsWith('https://') && !doc.includes('localhost')) {
      return doc;
    }
    // If relative path, prepend backend URL
    return `${API_URL}${doc.startsWith('/') ? '' : '/'}${doc}`;
  };

  return (
    <div style={{ 
      padding: "1rem", 
      fontFamily: "system-ui, -apple-system, sans-serif", 
      maxWidth: "900px", 
      margin: "0 auto" 
    }}>
      {/* Header with Back Button */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={() => setLocation("/admin")}
          style={{
            padding: "0.5rem 1rem",
            minHeight: "48px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.875rem",
            marginBottom: "1rem"
          }}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{ margin: "0.5rem 0 0 0", fontSize: "1.5rem", color: "#212529" }}>
          Case Details
        </h1>
      </div>

      {/* Status Update Message */}
      {updateMessage && (
        <div style={{
          padding: "1rem",
          marginBottom: "1.5rem",
          borderRadius: "6px",
          backgroundColor: updateMessage.type === 'success' ? '#d4edda' : '#f8d7da',
          color: updateMessage.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${updateMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {updateMessage.text}
        </div>
      )}

      {/* Case Information Card */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "1rem", 
        borderRadius: "8px", 
        marginBottom: "1rem",
        border: "1px solid #dee2e6"
      }}>
        <h2 style={{ marginTop: 0, fontSize: "1.125rem", color: "#212529" }}>Case Information</h2>
        
        {/* Responsive grid - 2 columns on desktop, 1 on mobile */}
        <div className="info-grid" style={{ display: "grid", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Case ID:</strong>
            </p>
            <p style={{ margin: 0, fontFamily: "monospace", fontSize: "1rem", color: "#212529" }}>
              {caseData.case_number || 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Category:</strong>
            </p>
            <p style={{ margin: 0, fontSize: "1rem", color: "#212529" }}>
              {caseData.category ? (CATEGORY_NAMES[caseData.category] || caseData.category) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="info-grid" style={{ display: "grid", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Created:</strong>
            </p>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#212529" }}>
              {caseData.created_at ? new Date(caseData.created_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'}
            </p>
          </div>
          {caseData.updated_at && caseData.updated_at !== caseData.created_at && (
            <div>
              <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
                <strong>Last Updated:</strong>
              </p>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#212529" }}>
                {new Date(caseData.updated_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Status Editor - Stacks on mobile */}
        <div style={{ 
          borderTop: "1px solid #dee2e6", 
          paddingTop: "1rem",
          marginTop: "1rem"
        }}>
          <label style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            fontWeight: 600,
            color: "#495057",
            fontSize: "0.875rem"
          }}>
            Case Status:
          </label>
          <div className="status-controls" style={{ display: "flex", gap: "0.75rem", alignItems: "stretch" }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: "0.75rem",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ced4da",
                backgroundColor: "white",
                flex: "1 1 auto",
                minHeight: "48px"
              }}
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={updating || selectedStatus === caseData.status}
              style={{
                padding: "0.75rem 1rem",
                minHeight: "48px",
                backgroundColor: selectedStatus === caseData.status ? "#e9ecef" : "#007bff",
                color: selectedStatus === caseData.status ? "#6c757d" : "white",
                border: "none",
                borderRadius: "4px",
                cursor: selectedStatus === caseData.status ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
                flex: "0 0 auto"
              }}
            >
            {updating ? "Updating..." : "Update"}
          </button>
          </div>

          {/* Delete Case Button */}
          <div style={{ marginTop: "1rem" }}>
            <button
              onClick={handleDeleteCase}
              disabled={deleting}
              style={{
                padding: "0.75rem 1rem",
                minHeight: "48px",
                backgroundColor: deleting ? "#e9ecef" : "#dc3545",
                color: deleting ? "#6c757d" : "white",
                border: "none",
                borderRadius: "4px",
                cursor: deleting ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                width: "100%"
              }}
            >
              {deleting ? "Deleting..." : "🗑️ Delete Case"}
            </button>
          </div>
        </div>
      </div>

      {/* AI Analysis Panel */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "1rem", 
        borderRadius: "8px", 
        marginBottom: "1rem",
        border: "1px solid #dee2e6"
      }}>
        <h2 style={{ marginTop: 0, fontSize: "1.125rem", color: "#212529" }}>AI Analysis & Pricing</h2>
        
        {!aiAnalysis && (
          <div>
            <p style={{ margin: "0.5rem 0 1rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              Run AI analysis to get pricing suggestion and case insights.
            </p>
            <button
              onClick={async () => {
                const storedToken = localStorage.getItem("admin_session");
                setAnalyzingAI(true);
                setAiError(null);
                try {
                  const res = await axios.post(
                    `${API_URL}/api/case/${params?.id}/analyze`,
                    {},
                    { headers: { Authorization: `Bearer ${storedToken}` } }
                  );
                  setAiAnalysis(res.data.analysis);
                } catch (err: any) {
                  console.error(err);
                  setAiError(err.response?.data?.error || "Failed to run AI analysis");
                } finally {
                  setAnalyzingAI(false);
                }
              }}
              disabled={analyzingAI}
              style={{
                padding: "0.75rem 1.5rem",
                minHeight: "48px",
                backgroundColor: analyzingAI ? "#6c757d" : "#06b6d4",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: analyzingAI ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: 500,
                width: "100%"
              }}
            >
              {analyzingAI ? "Analyzing..." : "🤖 Run AI Analysis"}
            </button>
            {aiError && (
              <p style={{ margin: "0.75rem 0 0 0", color: "#dc3545", fontSize: "0.875rem" }}>
                {aiError}
              </p>
            )}
          </div>
        )}

        {aiAnalysis && (
          <div>
            {/* Pricing Display */}
            <div style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "6px",
              border: "2px solid #06b6d4",
              marginBottom: "1rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <p style={{ margin: 0, color: "#6c757d", fontSize: "0.875rem" }}>Suggested Price</p>
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "2rem", fontWeight: "bold", color: "#212529" }}>
                    ${aiAnalysis.pricing_suggestion || 0}
                  </p>
                </div>
                <div>
                  <span style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    backgroundColor: 
                      aiAnalysis.pricing_tier === 'extreme' ? '#dc3545' :
                      aiAnalysis.pricing_tier === 'high' ? '#fd7e14' :
                      '#28a745',
                    color: "white",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    {aiAnalysis.pricing_tier === 'extreme' && '⚡ EXTREME'}
                    {aiAnalysis.pricing_tier === 'high' && '🔥 HIGH'}
                    {aiAnalysis.pricing_tier === 'standard' && '✓ STANDARD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Success Probability */}
            {aiAnalysis.success_probability !== undefined && (
              <div style={{ marginBottom: "1rem" }}>
                <p style={{ margin: "0 0 0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
                  <strong>Success Probability:</strong>
                </p>
                <div style={{
                  backgroundColor: "#e9ecef",
                  borderRadius: "4px",
                  height: "24px",
                  overflow: "hidden",
                  position: "relative"
                }}>
                  <div style={{
                    backgroundColor: "#28a745",
                    height: "100%",
                    width: `${(aiAnalysis.success_probability * 100).toFixed(0)}%`,
                    transition: "width 0.3s ease"
                  }} />
                  <span style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#212529"
                  }}>
                    {(aiAnalysis.success_probability * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}

            {/* Potential Violations */}
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ margin: "0 0 0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
                <strong>Potential Violations:</strong>
              </p>
              {aiAnalysis?.potential_violations?.length ? (
                <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#212529" }}>
                  {aiAnalysis.potential_violations.map((v: { label: string; citation?: string }, i: number) => (
                    <li key={i} style={{ marginBottom: "0.25rem" }}>
                      {v.label}{v.citation ? ` (${v.citation})` : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, color: "#6c757d", fontSize: "0.875rem" }}>
                  No specific laws flagged yet. Ask for more documents if needed.
                </p>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => setAiAnalysis(null)}
              style={{
                padding: "0.5rem 1rem",
                minHeight: "40px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.875rem",
                width: "100%"
              }}
            >
              Run New Analysis
            </button>
          </div>
        )}
      </div>

      {/* Client Portal Controls Card */}
      <div style={{ 
        backgroundColor: "#e7f3ff", 
        padding: "1rem", 
        borderRadius: "8px", 
        marginBottom: "1rem",
        border: "2px solid #007bff"
      }}>
        <h2 style={{ marginTop: 0, fontSize: "1.125rem", color: "#007bff" }}>🔐 Client Portal Settings</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Portal Enabled Toggle */}
          <div>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#495057"
            }}>
              <input 
                type="checkbox" 
                checked={caseData.portal_enabled !== false}
                onChange={(e) => {
                  setCaseData({ ...caseData, portal_enabled: e.target.checked });
                  // TODO: Add API call to update portal_enabled
                }}
                style={{ width: "20px", height: "20px" }}
              />
              Enable Client Portal Access
            </label>
            <p style={{ margin: "0.25rem 0 0 1.75rem", fontSize: "0.75rem", color: "#6c757d" }}>
              When enabled, client can log in with email + verification code
            </p>
          </div>

          {/* Client Status */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: 600,
              color: "#495057",
              fontSize: "0.875rem"
            }}>
              Client-Facing Status:
            </label>
            <input
              type="text"
              value={caseData.client_status || ''}
              onChange={(e) => setCaseData({ ...caseData, client_status: e.target.value })}
              placeholder="e.g., Under Review, Documents Received, Awaiting Payment"
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ced4da",
                boxSizing: "border-box"
              }}
            />
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem", color: "#6c757d" }}>
              This status is shown to the client in their portal
            </p>
          </div>

          {/* Client Notes */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: 600,
              color: "#495057",
              fontSize: "0.875rem"
            }}>
              Notes for Client:
            </label>
            <textarea
              value={caseData.client_notes || ''}
              onChange={(e) => setCaseData({ ...caseData, client_notes: e.target.value })}
              placeholder="Updates, next steps, or messages for the client..."
              rows={4}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ced4da",
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box"
              }}
            />
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem", color: "#6c757d" }}>
              These notes will be visible to the client in their portal
            </p>
          </div>

          {/* Payment Link */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontWeight: 600,
              color: "#495057",
              fontSize: "0.875rem"
            }}>
              Payment Link:
            </label>
            <input
              type="url"
              value={caseData.payment_link || ''}
              onChange={(e) => setCaseData({ ...caseData, payment_link: e.target.value })}
              placeholder="https://cash.app/$turboresponsehq or Stripe link"
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ced4da",
                boxSizing: "border-box"
              }}
            />
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem", color: "#6c757d" }}>
              If provided, client will see a "Pay Now" button in their portal
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={async () => {
              const storedToken = localStorage.getItem("admin_session");
              try {
                await axios.patch(
                  `${API_URL}/api/case/${params?.id}`,
                  {
                    client_status: caseData.client_status,
                    client_notes: caseData.client_notes,
                    payment_link: caseData.payment_link,
                    portal_enabled: caseData.portal_enabled
                  },
                  { headers: { Authorization: `Bearer ${storedToken}` } }
                );
                setUpdateMessage({ type: 'success', text: 'Client portal settings saved' });
                setTimeout(() => setUpdateMessage(null), 3000);
              } catch (err: any) {
                setUpdateMessage({ type: 'error', text: 'Failed to save portal settings' });
              }
            }}
            style={{
              padding: "0.75rem 1rem",
              minHeight: "48px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
              width: "100%"
            }}
          >
            💾 Save Portal Settings
          </button>
        </div>
      </div>

      {/* Client Information Card */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "1rem", 
        borderRadius: "8px", 
        marginBottom: "1rem",
        border: "1px solid #dee2e6"
      }}>
        <h2 style={{ marginTop: 0, fontSize: "1.125rem", color: "#212529" }}>Client Information</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Full Name:</strong>
            </p>
            <p style={{ margin: 0, fontSize: "1rem", color: "#212529" }}>{caseData.full_name || 'N/A'}</p>
          </div>
          
          <div>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Email:</strong>
            </p>
            <p style={{ margin: 0, fontSize: "1rem", wordBreak: "break-word" }}>
              <a href={`mailto:${caseData.email || ''}`} style={{ color: "#007bff", textDecoration: "none" }}>
                {caseData.email || 'N/A'}
              </a>
            </p>
          </div>
          
          {caseData.phone && (
            <div>
              <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
                <strong>Phone:</strong>
              </p>
              <p style={{ margin: 0, fontSize: "1rem" }}>
                <a href={`tel:${caseData.phone || ''}`} style={{ color: "#007bff", textDecoration: "none" }}>
                  {caseData.phone || 'N/A'}
                </a>
              </p>
            </div>
          )}
          
          {caseData.address && (
            <div>
              <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
                <strong>Address:</strong>
              </p>
              <p style={{ margin: 0, fontSize: "1rem", color: "#212529" }}>{caseData.address || 'N/A'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Case Details Card */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "1rem", 
        borderRadius: "8px", 
        marginBottom: "1rem",
        border: "1px solid #dee2e6"
      }}>
        <h2 style={{ marginTop: 0, fontSize: "1.125rem", color: "#212529" }}>Case Details</h2>
        
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
            <strong>Description:</strong>
          </p>
          <p style={{ 
            margin: 0, 
            fontSize: "1rem", 
            whiteSpace: "pre-wrap",
            lineHeight: "1.6",
            color: "#212529"
          }}>
            {caseData.case_details || 'No description provided'}
          </p>
        </div>
        
        {caseData.amount && (
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Amount:</strong>
            </p>
            <p style={{ margin: 0, fontSize: "1rem", color: "#212529" }}>
              ${parseFloat(caseData.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}
        
        {caseData.deadline && (
          <div>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Deadline:</strong>
            </p>
            <p style={{ margin: 0, fontSize: "1rem", color: "#212529" }}>
              {new Date(caseData.deadline).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Document List UI - Enhanced for Phase 1 */}
      {documents.length > 0 && (
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "1rem", 
          borderRadius: "8px",
          border: "1px solid #dee2e6"
        }}>
          <h2 style={{ marginTop: 0, fontSize: "1.125rem", color: "#212529" }}>
            Attachments ({documents.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {documents.map((doc: string, idx: number) => (
              <div 
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem",
                  backgroundColor: "white",
                  borderRadius: "4px",
                  border: "1px solid #dee2e6",
                  gap: "0.75rem"
                }}
              >
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: 500, 
                    fontSize: "0.875rem",
                    color: "#212529",
                    marginBottom: "0.25rem"
                  }}>
                    Document {idx + 1}
                  </div>
                  <div style={{ 
                    fontSize: "0.75rem", 
                    color: "#6c757d",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {doc.split('/').pop() || 'Attachment'}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <a 
                    href={getDocumentUrl(doc)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      padding: "0.5rem 1rem",
                      minHeight: "44px",
                      backgroundColor: "#007bff",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    📄 View PDF
                  </a>
                  <a 
                    href={getDocumentUrl(doc)}
                    download
                    style={{ 
                      padding: "0.5rem 1rem",
                      minHeight: "44px",
                      backgroundColor: "#28a745",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    ⬇️ Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        /* Desktop: 2 columns */
        @media (min-width: 769px) {
          .info-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .status-controls {
            flex-direction: row !important;
          }
        }

        /* Mobile: 1 column, stack status controls */
        @media (max-width: 768px) {
          .info-grid {
            grid-template-columns: 1fr !important;
          }
          .status-controls {
            flex-direction: column !important;
          }
          .status-controls select,
          .status-controls button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

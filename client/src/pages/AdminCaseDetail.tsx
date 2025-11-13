/**
 * Admin Case Detail Page
 * Restored to match authoritative specification
 * Shows full case info + attachments + status dropdown editor
 * NO AI analysis, NO pricing, NO contract elements
 */

import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://turbo-response-backend.onrender.com";

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

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <p>Loading case details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button
          onClick={() => setLocation("/admin")}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <p>Case not found</p>
        <button
          onClick={() => setLocation("/admin")}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const documents = caseData.documents ? JSON.parse(caseData.documents) : [];

  return (
    <div style={{ 
      padding: "2rem", 
      fontFamily: "system-ui, -apple-system, sans-serif", 
      maxWidth: "900px", 
      margin: "0 auto" 
    }}>
      {/* Header with Back Button */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => setLocation("/admin")}
          style={{
            padding: "0.5rem 1rem",
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
        <h1 style={{ margin: "0.5rem 0 0 0", fontSize: "1.75rem", color: "#212529" }}>
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
        padding: "1.5rem", 
        borderRadius: "8px", 
        marginBottom: "1.5rem",
        border: "1px solid #dee2e6"
      }}>
        <h2 style={{ marginTop: 0, fontSize: "1.25rem", color: "#212529" }}>Case Information</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Case ID:</strong>
            </p>
            <p style={{ margin: 0, fontFamily: "monospace", fontSize: "1rem" }}>
              {caseData.case_number}
            </p>
          </div>
          <div>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Category:</strong>
            </p>
            <p style={{ margin: 0, fontSize: "1rem" }}>
              {CATEGORY_NAMES[caseData.category] || caseData.category}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Created:</strong>
            </p>
            <p style={{ margin: 0, fontSize: "1rem" }}>
              {new Date(caseData.created_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          {caseData.updated_at && caseData.updated_at !== caseData.created_at && (
            <div>
              <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
                <strong>Last Updated:</strong>
              </p>
              <p style={{ margin: 0, fontSize: "1rem" }}>
                {new Date(caseData.updated_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Status Editor */}
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
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: "0.5rem",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ced4da",
                backgroundColor: "white",
                flex: "0 0 auto",
                minWidth: "200px"
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
                padding: "0.5rem 1rem",
                backgroundColor: selectedStatus === caseData.status ? "#e9ecef" : "#007bff",
                color: selectedStatus === caseData.status ? "#6c757d" : "white",
                border: "none",
                borderRadius: "4px",
                cursor: selectedStatus === caseData.status ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 500
              }}
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      </div>

      {/* Client Information Card */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "1.5rem", 
        borderRadius: "8px", 
        marginBottom: "1.5rem",
        border: "1px solid #dee2e6"
      }}>
        <h2 style={{ marginTop: 0, fontSize: "1.25rem", color: "#212529" }}>Client Information</h2>
        
        <div style={{ display: "grid", gap: "1rem" }}>
          <div>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Full Name:</strong>
            </p>
            <p style={{ margin: 0, fontSize: "1rem" }}>{caseData.full_name}</p>
          </div>
          
          <div>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Email:</strong>
            </p>
            <p style={{ margin: 0, fontSize: "1rem" }}>
              <a href={`mailto:${caseData.email}`} style={{ color: "#007bff", textDecoration: "none" }}>
                {caseData.email}
              </a>
            </p>
          </div>
          
          {caseData.phone && (
            <div>
              <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
                <strong>Phone:</strong>
              </p>
              <p style={{ margin: 0, fontSize: "1rem" }}>
                <a href={`tel:${caseData.phone}`} style={{ color: "#007bff", textDecoration: "none" }}>
                  {caseData.phone}
                </a>
              </p>
            </div>
          )}
          
          {caseData.address && (
            <div>
              <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
                <strong>Address:</strong>
              </p>
              <p style={{ margin: 0, fontSize: "1rem" }}>{caseData.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Case Details Card */}
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: "1.5rem", 
        borderRadius: "8px", 
        marginBottom: "1.5rem",
        border: "1px solid #dee2e6"
      }}>
        <h2 style={{ marginTop: 0, fontSize: "1.25rem", color: "#212529" }}>Case Details</h2>
        
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
            <strong>Description:</strong>
          </p>
          <p style={{ 
            margin: 0, 
            fontSize: "1rem", 
            whiteSpace: "pre-wrap",
            lineHeight: "1.6"
          }}>
            {caseData.case_details}
          </p>
        </div>
        
        {caseData.amount && (
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Amount:</strong>
            </p>
            <p style={{ margin: 0, fontSize: "1rem" }}>
              ${parseFloat(caseData.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}
        
        {caseData.deadline && (
          <div>
            <p style={{ margin: "0.5rem 0", color: "#6c757d", fontSize: "0.875rem" }}>
              <strong>Deadline:</strong>
            </p>
            <p style={{ margin: 0, fontSize: "1rem" }}>
              {new Date(caseData.deadline).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Attachments Card */}
      {documents.length > 0 && (
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "1.5rem", 
          borderRadius: "8px",
          border: "1px solid #dee2e6"
        }}>
          <h2 style={{ marginTop: 0, fontSize: "1.25rem", color: "#212529" }}>
            Attachments ({documents.length})
          </h2>
          <ul style={{ margin: 0, padding: "0 0 0 1.5rem" }}>
            {documents.map((doc: string, idx: number) => (
              <li key={idx} style={{ marginBottom: "0.5rem" }}>
                <a 
                  href={doc} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: "#007bff", 
                    textDecoration: "none",
                    fontSize: "1rem"
                  }}
                >
                  Document {idx + 1} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

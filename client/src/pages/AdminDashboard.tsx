/**
 * Admin Dashboard - Consumer Defense Cases
 * Restored to match authoritative specification
 * Simple case list only - no AI features, no pricing, no analysis
 * PHASE 1: Mobile responsive with proper breakpoints
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://turboresponsehq.ai";

interface CaseItem {
  id: number;
  case_number: string;
  full_name: string;
  email: string;
  phone?: string;
  category: string;
  status: string;
  funnel_stage?: string;
  payment_verified?: boolean;
  unread_messages_count?: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_session");
    if (!storedToken) {
      window.location.replace("/admin/login");
      return;
    }

    const fetchCases = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/cases/admin/all`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setCases(res.data.cases || []);
      } catch (err) {
        console.error(err);
        setError("Could not load cases");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const handleCaseClick = (caseId: number) => {
    setLocation(`/admin/cases/${caseId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_user");
    setLocation("/admin/login");
  };

  const getFunnelStageColor = (stage: string) => {
    switch (stage) {
      case 'Active Case':
        return { bg: '#d4edda', color: '#155724', icon: '✅' };
      case 'Payment Pending':
        return { bg: '#fff3cd', color: '#856404', icon: '⏳' };
      case 'Awaiting Payment':
        return { bg: '#cce5ff', color: '#004085', icon: '💳' };
      case 'Lead Submitted':
      default:
        return { bg: '#d1ecf1', color: '#0c5460', icon: '📝' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <p>Loading cases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "1rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button
          onClick={() => setLocation("/admin/login")}
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1.5rem",
            minHeight: "48px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem"
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "1rem", 
      fontFamily: "system-ui, -apple-system, sans-serif",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        gap: "1rem",
        marginBottom: "1.5rem",
        borderBottom: "2px solid #e9ecef",
        paddingBottom: "1rem"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#212529" }}>
              Admin Dashboard
            </h1>
            <p style={{ margin: "0.5rem 0 0 0", color: "#6c757d", fontSize: "0.875rem" }}>
              Consumer Defense Cases
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setLocation("/admin/brain")}
              style={{
                padding: "0.5rem 1rem",
                minHeight: "48px",
                backgroundColor: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}
            >
              🧠 Brain Upload
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.5rem 1rem",
                minHeight: "48px",
                backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.875rem",
              whiteSpace: "nowrap"
            }}
          >
            Logout
          </button>
          </div>
        </div>
      </div>

      {/* Case Count */}
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ margin: 0, fontSize: "1rem", color: "#495057" }}>
          <strong>Total Cases:</strong> {cases.length}
        </p>
      </div>

      {/* Cases - Desktop Table / Mobile Cards */}
      {cases.length === 0 ? (
        <div style={{
          padding: "2rem 1rem",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6"
        }}>
          <p style={{ margin: 0, color: "#6c757d", fontSize: "1rem" }}>
            No cases submitted yet.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table (hidden on mobile) */}
          <div style={{ 
            display: "none",
            border: "1px solid #dee2e6", 
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "white"
          }}
          className="desktop-table">
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                  <th style={{ 
                    padding: "0.75rem", 
                    textAlign: "left", 
                    fontWeight: 600,
                    color: "#495057",
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Case ID
                  </th>
                  <th style={{ 
                    padding: "0.75rem", 
                    textAlign: "left", 
                    fontWeight: 600,
                    color: "#495057",
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Client Name
                  </th>
                  <th style={{ 
                    padding: "0.75rem", 
                    textAlign: "left", 
                    fontWeight: 600,
                    color: "#495057",
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Category
                  </th>
                  <th style={{ 
                    padding: "0.75rem", 
                    textAlign: "left", 
                    fontWeight: 600,
                    color: "#495057",
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: "0.75rem", 
                    textAlign: "left", 
                    fontWeight: 600,
                    color: "#495057",
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Created
                  </th>
                  <th style={{ 
                    padding: "0.75rem", 
                    textAlign: "center", 
                    fontWeight: 600,
                    color: "#495057",
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c, index) => {
                  const stageInfo = getFunnelStageColor(c.funnel_stage || c.status);
                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: index < cases.length - 1 ? "1px solid #dee2e6" : "none",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                    >
                      <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#212529" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>
                          {c.case_number}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#212529" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div>
                            <div style={{ fontWeight: 500 }}>{c.full_name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: "0.25rem" }}>
                              {c.email}
                            </div>
                          </div>
                          {c.unread_messages_count && c.unread_messages_count > 0 && (
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "1.5rem",
                              height: "1.5rem",
                              padding: "0 0.4rem",
                              backgroundColor: "#dc3545",
                              color: "white",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              marginLeft: "auto"
                            }}>
                              {c.unread_messages_count}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#495057" }}>
                        {c.category}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: stageInfo.bg,
                          color: stageInfo.color,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}>
                          {stageInfo.icon} {c.funnel_stage || c.status}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#495057" }}>
                        {new Date(c.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleCaseClick(c.id)}
                          style={{
                            padding: "0.375rem 0.75rem",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            transition: "background-color 0.15s ease"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
                        >
                          View Case
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout (hidden on desktop) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }} className="mobile-cards">
            {cases.map((c) => {
                  const stageInfo = getFunnelStageColor(c.funnel_stage || c.status);
              return (
                <div
                  key={c.id}
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem"
                  }}
                >
                  {/* Case Number */}
                  <div style={{ 
                    fontFamily: "monospace", 
                    fontWeight: 600, 
                    fontSize: "0.875rem",
                    color: "#495057"
                  }}>
                    {c.case_number}
                  </div>

                  {/* Client Name */}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "1rem", color: "#212529" }}>
                      {c.full_name}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6c757d", marginTop: "0.25rem" }}>
                      {c.email}
                    </div>
                  </div>

                  {/* Category & Status */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ 
                      fontSize: "0.875rem", 
                      color: "#495057",
                      fontWeight: 500
                    }}>
                      {c.category}
                    </span>
                    <span style={{ color: "#dee2e6" }}>•</span>
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: stageInfo.bg,
                      color: stageInfo.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      {stageInfo.icon} {c.funnel_stage || c.status}
                    </span>
                  </div>

                  {/* Created Date */}
                  <div style={{ fontSize: "0.875rem", color: "#6c757d" }}>
                    {new Date(c.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => handleCaseClick(c.id)}
                    style={{
                      padding: "0.75rem",
                      minHeight: "48px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: 500,
                      width: "100%"
                    }}
                  >
                    View Case Details
                  </button>
                </div>
              );
            })}
          </div>

          {/* Responsive CSS */}
          <style>{`
            /* Desktop: Show table, hide cards */
            @media (min-width: 769px) {
              .desktop-table {
                display: block !important;
              }
              .mobile-cards {
                display: none !important;
              }
            }

            /* Mobile: Show cards, hide table */
            @media (max-width: 768px) {
              .desktop-table {
                display: none !important;
              }
              .mobile-cards {
                display: flex !important;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

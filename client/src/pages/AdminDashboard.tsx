/**
 * Admin Dashboard - Consumer Defense Cases
 * Restored to match authoritative specification
 * Simple case list only - no AI features, no pricing, no analysis
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://turbo-response-backend.onrender.com";

interface CaseItem {
  id: number;
  case_number: string;
  full_name: string;
  email: string;
  phone?: string;
  category: string;
  status: string;
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
    setLocation(`/admin/case/${caseId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_user");
    setLocation("/admin/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: '#d4edda', color: '#155724' };
      case 'Rejected':
        return { bg: '#f8d7da', color: '#721c24' };
      case 'In Review':
        return { bg: '#fff3cd', color: '#856404' };
      case 'Awaiting Client':
        return { bg: '#cce5ff', color: '#004085' };
      case 'Pending Review':
      default:
        return { bg: '#d1ecf1', color: '#0c5460' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <p>Loading cases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button
          onClick={() => setLocation("/admin/login")}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "2rem", 
      fontFamily: "system-ui, -apple-system, sans-serif",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "2rem",
        borderBottom: "2px solid #e9ecef",
        paddingBottom: "1rem"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.75rem", color: "#212529" }}>
            Admin Dashboard
          </h1>
          <p style={{ margin: "0.5rem 0 0 0", color: "#6c757d" }}>
            Consumer Defense Cases - All cases, newest first
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.875rem"
          }}
        >
          Logout
        </button>
      </div>

      {/* Case Count */}
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ margin: 0, fontSize: "1rem", color: "#495057" }}>
          <strong>Total Cases:</strong> {cases.length}
        </p>
      </div>

      {/* Cases Table */}
      {cases.length === 0 ? (
        <div style={{
          padding: "3rem",
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6"
        }}>
          <p style={{ margin: 0, color: "#6c757d", fontSize: "1.125rem" }}>
            No cases submitted yet.
          </p>
        </div>
      ) : (
        <div style={{ 
          border: "1px solid #dee2e6", 
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "white"
        }}>
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
                const statusColors = getStatusColor(c.status);
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
                      <div>
                        <div style={{ fontWeight: 500 }}>{c.full_name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: "0.25rem" }}>
                          {c.email}
                        </div>
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
                        backgroundColor: statusColors.bg,
                        color: statusColors.color,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        {c.status}
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
      )}
    </div>
  );
}

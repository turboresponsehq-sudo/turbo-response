import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://turbo-response-backend.onrender.com";

interface CaseItem {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  category: string;
  description?: string;
  amount?: string;
  deadline?: string;
  created_at: string;
  status?: string;
}

interface CaseAnalysis {
  violations?: string;
  laws_cited?: string;
  recommended_actions?: string;
  urgency_level?: string;
  estimated_value?: string;
  success_probability?: string;
  pricing_suggestion?: string;
  summary?: string;
}

export default function AdminDashboard() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  
  // Modal state
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [caseAnalysis, setCaseAnalysis] = useState<CaseAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_session");
    const storedUser = localStorage.getItem("admin_user");

    if (!storedToken || !storedUser) {
      window.location.replace("/admin/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/consumer/cases`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setCases(res.data.cases || []);
      } catch (err) {
        console.error(err);
        setError("Could not load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCaseClick = async (caseItem: CaseItem) => {
    setSelectedCase(caseItem);
    setCaseAnalysis(null);
    setAnalysisError(null);
    
    // Fetch case details including existing analysis
    const storedToken = localStorage.getItem("admin_session");
    try {
      const res = await axios.get(`${API_URL}/api/admin/consumer/case/${caseItem.id}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (res.data.analysis) {
        setCaseAnalysis(res.data.analysis);
      }
    } catch (err) {
      console.error("Error fetching case details:", err);
    }
  };

  const handleGenerateAnalysis = async () => {
    if (!selectedCase) return;
    
    setAnalyzing(true);
    setAnalysisError(null);
    const storedToken = localStorage.getItem("admin_session");
    
    try {
      const res = await axios.post(
        `${API_URL}/api/admin/consumer/analyze-case/${selectedCase.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      
      if (res.data.success) {
        setCaseAnalysis(res.data.analysis);
      } else {
        setAnalysisError(res.data.error || "Analysis failed");
      }
    } catch (err: any) {
      console.error("Error generating analysis:", err);
      setAnalysisError(err.response?.data?.error || "Failed to generate analysis");
    } finally {
      setAnalyzing(false);
    }
  };

  const closeModal = () => {
    setSelectedCase(null);
    setCaseAnalysis(null);
    setAnalysisError(null);
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
  if (error) return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;

  return (
    <div className="admin-dashboard" style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Welcome, {user?.email || "Admin"}</h1>
      <h3>Case Submissions:</h3>
      
      {cases.length === 0 ? (
        <p>No cases submitted yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => handleCaseClick(c)}
              style={{
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: "#f9f9f9",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e9e9e9")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f9f9f9")}
            >
              <strong>{c.full_name || "Unnamed"}</strong> — {c.category || "N/A"}
              <br />
              <small>{c.email || "No email"} | {new Date(c.created_at).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}

      {/* Case Detail Modal */}
      {selectedCase && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Case Details</h2>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <h3>Client Information</h3>
              <p><strong>Name:</strong> {selectedCase.full_name}</p>
              <p><strong>Email:</strong> {selectedCase.email}</p>
              {selectedCase.phone && <p><strong>Phone:</strong> {selectedCase.phone}</p>}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <h3>Case Information</h3>
              <p><strong>Type:</strong> {selectedCase.category}</p>
              <p><strong>Date Submitted:</strong> {new Date(selectedCase.created_at).toLocaleString()}</p>
              {selectedCase.amount && <p><strong>Amount:</strong> ${selectedCase.amount}</p>}
              {selectedCase.deadline && <p><strong>Deadline:</strong> {selectedCase.deadline}</p>}
              {selectedCase.description && (
                <div>
                  <strong>Description:</strong>
                  <p style={{ whiteSpace: "pre-wrap" }}>{selectedCase.description}</p>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <button
                onClick={handleGenerateAnalysis}
                disabled={analyzing}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: analyzing ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: analyzing ? "not-allowed" : "pointer",
                  marginRight: "1rem",
                }}
              >
                {analyzing ? "Generating..." : "Generate AI Analysis"}
              </button>
              
              <button
                onClick={() => alert("Demand letter generation coming soon!")}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Create Demand Letter
              </button>
            </div>

            {analysisError && (
              <div style={{ padding: "1rem", backgroundColor: "#ffebee", borderRadius: "6px", marginBottom: "1rem" }}>
                <strong>Error:</strong> {analysisError}
              </div>
            )}

            {caseAnalysis && (
              <div style={{ backgroundColor: "#f0f8ff", padding: "1rem", borderRadius: "8px" }}>
                <h3>AI Analysis Results</h3>
                {caseAnalysis.summary && (
                  <div style={{ marginBottom: "1rem" }}>
                    <strong>Summary:</strong>
                    <p>{caseAnalysis.summary}</p>
                  </div>
                )}
                {caseAnalysis.violations && (
                  <div style={{ marginBottom: "1rem" }}>
                    <strong>Violations:</strong>
                    <p style={{ whiteSpace: "pre-wrap" }}>{caseAnalysis.violations}</p>
                  </div>
                )}
                {caseAnalysis.laws_cited && (
                  <div style={{ marginBottom: "1rem" }}>
                    <strong>Laws Cited:</strong>
                    <p style={{ whiteSpace: "pre-wrap" }}>{caseAnalysis.laws_cited}</p>
                  </div>
                )}
                {caseAnalysis.recommended_actions && (
                  <div style={{ marginBottom: "1rem" }}>
                    <strong>Recommended Actions:</strong>
                    <p style={{ whiteSpace: "pre-wrap" }}>{caseAnalysis.recommended_actions}</p>
                  </div>
                )}
                {caseAnalysis.urgency_level && (
                  <p><strong>Urgency:</strong> {caseAnalysis.urgency_level}</p>
                )}
                {caseAnalysis.success_probability && (
                  <p><strong>Success Probability:</strong> {caseAnalysis.success_probability}</p>
                )}
                {caseAnalysis.estimated_value && (
                  <p><strong>Estimated Value:</strong> ${caseAnalysis.estimated_value}</p>
                )}
                {caseAnalysis.pricing_suggestion && (
                  <p><strong>Pricing Suggestion:</strong> ${caseAnalysis.pricing_suggestion}</p>
                )}
              </div>
            )}

            <button
              onClick={closeModal}
              style={{
                marginTop: "1.5rem",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

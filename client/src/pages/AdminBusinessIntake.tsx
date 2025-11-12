import { useState, useEffect } from "react";
import { Link } from "wouter";
import "./AdminBusinessIntake.css";

interface BusinessSubmission {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  website_url: string;
  status: string;
  blueprint_generated: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminBusinessIntake() {
  const [submissions, setSubmissions] = useState<BusinessSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(
        "https://turbo-response-backend.onrender.com/api/business-intake/admin/submissions"
      );
      const data = await response.json();

      if (data.success) {
        setSubmissions(data.submissions);
      } else {
        setError(data.error || "Failed to load submissions");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "status-pending",
      reviewed: "status-reviewed",
      blueprint_generated: "status-blueprint",
      completed: "status-completed",
      archived: "status-archived",
    };
    return statusMap[status] || "status-pending";
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      pending: "Pending Review",
      reviewed: "Reviewed",
      blueprint_generated: "Blueprint Generated",
      completed: "Completed",
      archived: "Archived",
    };
    return labelMap[status] || status;
  };

  if (isLoading) {
    return (
      <div className="admin-business-intake">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading business submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-business-intake">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchSubmissions} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-business-intake">
      <div className="header">
        <div>
          <h1>Business Intake Submissions</h1>
          <p className="subtitle">
            {submissions.length} total submission{submissions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={fetchSubmissions} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state">
          <h2>No Submissions Yet</h2>
          <p>Business intake submissions will appear here</p>
        </div>
      ) : (
        <div className="submissions-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Business Name</th>
                <th>Owner</th>
                <th>Email</th>
                <th>Website</th>
                <th>Status</th>
                <th>Blueprint</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>#{submission.id}</td>
                  <td className="business-name">{submission.business_name}</td>
                  <td>{submission.full_name}</td>
                  <td>{submission.email}</td>
                  <td>
                    <a
                      href={submission.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      Visit →
                    </a>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(submission.status)}`}>
                      {getStatusLabel(submission.status)}
                    </span>
                  </td>
                  <td>
                    {submission.blueprint_generated ? (
                      <span className="blueprint-yes">✅ Yes</span>
                    ) : (
                      <span className="blueprint-no">❌ No</span>
                    )}
                  </td>
                  <td>{new Date(submission.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link
                      href={`/admin/business-intake/${submission.id}`}
                      className="btn-view"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

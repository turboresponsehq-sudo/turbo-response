import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import "./AdminBusinessIntakeDetail.css";

interface BusinessSubmission {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  website_url: string;
  instagram_url?: string;
  tiktok_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  link_in_bio?: string;
  what_you_sell: string;
  ideal_customer: string;
  biggest_struggle: string;
  short_term_goal: string;
  long_term_vision: string;
  brand_assets_url?: string;
  pricing_sheet_url?: string;
  consent_given: boolean;
  blueprint_generated: boolean;
  blueprint_data?: Blueprint;
  blueprint_generated_at?: string;
  status: string;
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}

interface Blueprint {
  executive_summary: string;
  brand_positioning: string;
  funnel_website_strategy: string;
  social_strategy: string;
  action_plan: string;
}

export default function AdminBusinessIntakeDetail() {
  const [, params] = useRoute("/admin/business-intake/:id");
  const [, setLocation] = useLocation();
  const [submission, setSubmission] = useState<BusinessSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [showBlueprint, setShowBlueprint] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchSubmission(params.id);
    }
  }, [params?.id]);

  const fetchSubmission = async (id: string) => {
    try {
      const response = await fetch(
        `https://turbo-response-backend.onrender.com/api/business-intake/admin/submission/${id}`
      );
      const data = await response.json();

      if (data.success) {
        setSubmission(data.submission);
        setShowBlueprint(data.submission.blueprint_generated);
      } else {
        setError(data.error || "Failed to load submission");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBlueprint = async () => {
    if (!params?.id) return;

    const confirmed = window.confirm(
      "Generate AI Strategy Blueprint for this business?\n\nThis will use OpenAI API credits and take 10-30 seconds."
    );

    if (!confirmed) return;

    setIsGeneratingBlueprint(true);

    try {
      const response = await fetch(
        `https://turbo-response-backend.onrender.com/api/business-intake/admin/generate-blueprint/${params.id}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        // Refresh submission to get the blueprint
        await fetchSubmission(params.id);
        setShowBlueprint(true);
        alert("Blueprint generated successfully!");
      } else {
        alert("Failed to generate blueprint: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate blueprint. Please try again.");
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-business-detail">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="admin-business-detail">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || "Submission not found"}</p>
          <button onClick={() => setLocation("/admin/business-intake")} className="btn-back">
            ← Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-business-detail">
      <div className="header">
        <div>
          <h1>{submission.business_name}</h1>
          <p className="subtitle">Submission #{submission.id}</p>
        </div>
        <button onClick={() => setLocation("/admin/business-intake")} className="btn-back">
          ← Back to List
        </button>
      </div>

      {/* Business Information */}
      <div className="info-card">
        <h2>Business Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Owner Name</label>
            <p>{submission.full_name}</p>
          </div>
          <div className="info-item">
            <label>Email</label>
            <p>{submission.email}</p>
          </div>
          <div className="info-item">
            <label>Phone</label>
            <p>{submission.phone}</p>
          </div>
          <div className="info-item">
            <label>Business Name</label>
            <p>{submission.business_name}</p>
          </div>
        </div>
      </div>

      {/* Digital Presence */}
      <div className="info-card">
        <h2>Digital Presence</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Website</label>
            <p>
              <a href={submission.website_url} target="_blank" rel="noopener noreferrer">
                {submission.website_url}
              </a>
            </p>
          </div>
          {submission.instagram_url && (
            <div className="info-item">
              <label>Instagram</label>
              <p>
                <a href={submission.instagram_url} target="_blank" rel="noopener noreferrer">
                  {submission.instagram_url}
                </a>
              </p>
            </div>
          )}
          {submission.tiktok_url && (
            <div className="info-item">
              <label>TikTok</label>
              <p>
                <a href={submission.tiktok_url} target="_blank" rel="noopener noreferrer">
                  {submission.tiktok_url}
                </a>
              </p>
            </div>
          )}
          {submission.facebook_url && (
            <div className="info-item">
              <label>Facebook</label>
              <p>
                <a href={submission.facebook_url} target="_blank" rel="noopener noreferrer">
                  {submission.facebook_url}
                </a>
              </p>
            </div>
          )}
          {submission.youtube_url && (
            <div className="info-item">
              <label>YouTube</label>
              <p>
                <a href={submission.youtube_url} target="_blank" rel="noopener noreferrer">
                  {submission.youtube_url}
                </a>
              </p>
            </div>
          )}
          {submission.link_in_bio && (
            <div className="info-item">
              <label>Link-in-Bio</label>
              <p>
                <a href={submission.link_in_bio} target="_blank" rel="noopener noreferrer">
                  {submission.link_in_bio}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Business Snapshot */}
      <div className="info-card">
        <h2>Business Snapshot</h2>
        <div className="info-item">
          <label>What They Sell</label>
          <p>{submission.what_you_sell}</p>
        </div>
        <div className="info-item">
          <label>Ideal Customer</label>
          <p>{submission.ideal_customer}</p>
        </div>
        <div className="info-item">
          <label>Biggest Struggle</label>
          <p>{submission.biggest_struggle}</p>
        </div>
        <div className="info-item">
          <label>Short-Term Goal (60-90 days)</label>
          <p>{submission.short_term_goal}</p>
        </div>
        <div className="info-item">
          <label>Long-Term Vision</label>
          <p>{submission.long_term_vision}</p>
        </div>
      </div>

      {/* Blueprint Generation */}
      <div className="blueprint-section">
        <div className="blueprint-header">
          <h2>AI Strategy Blueprint</h2>
          {!submission.blueprint_generated ? (
            <button
              onClick={handleGenerateBlueprint}
              disabled={isGeneratingBlueprint}
              className="btn-generate"
            >
              {isGeneratingBlueprint ? "Generating..." : "🤖 Generate Blueprint"}
            </button>
          ) : (
            <button onClick={() => setShowBlueprint(!showBlueprint)} className="btn-toggle">
              {showBlueprint ? "Hide Blueprint" : "Show Blueprint"}
            </button>
          )}
        </div>

        {isGeneratingBlueprint && (
          <div className="generating-notice">
            <div className="spinner"></div>
            <p>AI is generating the strategy blueprint... This may take 10-30 seconds.</p>
          </div>
        )}

        {showBlueprint && submission.blueprint_data && (
          <div className="blueprint-content">
            <div className="blueprint-section-item">
              <h3>1. Executive Summary</h3>
              <p>{submission.blueprint_data.executive_summary}</p>
            </div>

            <div className="blueprint-section-item">
              <h3>2. Brand Positioning</h3>
              <p>{submission.blueprint_data.brand_positioning}</p>
            </div>

            <div className="blueprint-section-item">
              <h3>3. Funnel & Website Strategy</h3>
              <p>{submission.blueprint_data.funnel_website_strategy}</p>
            </div>

            <div className="blueprint-section-item">
              <h3>4. Social Strategy</h3>
              <p>{submission.blueprint_data.social_strategy}</p>
            </div>

            <div className="blueprint-section-item">
              <h3>5. Action Plan</h3>
              <p>{submission.blueprint_data.action_plan}</p>
            </div>

            {submission.blueprint_generated_at && (
              <div className="blueprint-footer">
                <p>
                  Generated on:{" "}
                  {new Date(submission.blueprint_generated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

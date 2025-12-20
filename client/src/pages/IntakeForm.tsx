import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { IntakeFormSkeleton } from "@/components/Skeleton";
import { api } from "@/lib/api";
import MultiFileUploader from "@/components/MultiFileUploader";
import "./IntakeForm.css";

const categories = [
  { id: "eviction", icon: "🏠", name: "Eviction & Housing" },
  { id: "debt", icon: "💳", name: "Debt Collection" },
  { id: "irs", icon: "📋", name: "IRS & Tax Issues" },
  { id: "wage", icon: "💰", name: "Wage Garnishment" },
  { id: "medical", icon: "🏥", name: "Medical Bills" },
  { id: "benefits", icon: "🛡️", name: "Benefits Denial" },
  { id: "auto", icon: "🚗", name: "Auto Repossession" },
  { id: "consumer", icon: "⚖️", name: "Consumer Rights" },
  { id: "notice", icon: "📬", name: "Notice / Enforcement Action" },
  { id: "denial", icon: "🚫", name: "Application Denial / Adverse Decision" },
];

export default function IntakeForm() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [caseNumber, setCaseNumber] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    address: "",
    caseDescription: "",
    amount: "",
    deadline: "",
    whoIsActing: "",
    noticeType: "",
  });

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Calculate progress
  useEffect(() => {
    let filledFields = 0;
    const totalFields = 7; // 6 required fields + 1 category (amount, deadline, noticeType are optional)

    if (formData.email.trim()) filledFields++;
    if (formData.fullName.trim()) filledFields++;
    if (formData.phone.trim()) filledFields++;
    if (formData.address.trim()) filledFields++;
    if (formData.caseDescription.trim()) filledFields++;
    if (selectedCategory) filledFields++;
    if (termsAccepted) filledFields++;

    const newProgress = (filledFields / totalFields) * 100;
    setProgress(newProgress);
  }, [formData, selectedCategory, termsAccepted]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle multi-file upload completion from MultiFileUploader
  const handleUploadComplete = (uploadedFilesData: any[]) => {
    try {
      // Extract file URLs from uploaded files
      const newFileUrls = uploadedFilesData
        .filter((file) => file.success !== false && file.file_url)
        .map((file) => ({ url: file.file_url, name: file.original_name || file.originalname }));

      if (newFileUrls.length > 0) {
        setUploadedFiles((prev) => [...prev, ...newFileUrls]);
      }
    } catch (error: any) {
      console.error("Failed to process uploaded files:", error);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getApiUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || "https://turboresponsehq.ai";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      alert("Please select a case category");
      return;
    }

    if (!termsAccepted) {
      alert("Please accept the terms and conditions");
      return;
    }

    setIsSubmitting(true);

    try {
      // Capture client IP address for terms acceptance proof
      let clientIP = null;
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        clientIP = ipData.ip;
      } catch (ipError) {
        console.warn("Failed to capture IP address:", ipError);
        // Continue without IP - not critical
      }

      // Get already-uploaded file URLs from state
      const documentUrls = uploadedFiles
        .filter(f => f.url) // Only include successfully uploaded files
        .map(f => f.url);

      // Submit intake form to backend with document URLs and terms acceptance
      const response = await api.post("/api/intake", {
        email: formData.email,
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        category: selectedCategory,
        case_details: formData.caseDescription,
        who_is_acting: formData.whoIsActing || null,
        notice_type: formData.noticeType || null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        deadline: formData.deadline || null,
        documents: documentUrls,
        terms_accepted_at: new Date().toISOString(),
        terms_accepted_ip: clientIP,
      });

      // Show success message
      setSubmitSuccess(true);
      setCaseNumber(response.case_number);
      
      // Wait 3 seconds before redirecting to consumer confirmation
      setTimeout(() => {
        const params = new URLSearchParams({
          caseId: response.case_id,
          category: selectedCategory,
        });
        setLocation(`/consumer/confirmation?${params.toString()}`);
      }, 3000);
    } catch (error: any) {
      alert(`Submission failed: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  const isFormComplete = progress === 100;

  if (isLoading) {
    return (
      <div className="intake-page">
        <div className="bg-animation">
          <div className="bg-grid"></div>
        </div>
        <header className="header">
          <div className="nav-container">
            <a href="/" className="logo">
              <div className="logo-icon">⚡</div>
              TURBO RESPONSE
            </a>
          </div>
        </header>
        <IntakeFormSkeleton />
      </div>
    );
  }

  return (
    <div className="intake-page">
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="bg-grid"></div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="nav-container">
          <a href="/" className="logo">
            <div className="logo-icon">⚡</div>
            TURBO RESPONSE
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="container">
        <div className="intake-header" style={{
          backgroundColor: '#ffffff',
          padding: '2.5rem 1.5rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #e5e7eb',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <h1 className="intake-title" style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '0.5rem',
            letterSpacing: '-0.5px'
          }}>DEFENSE INTAKE</h1>
          <p className="intake-subtitle" style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '1rem'
          }}>
            RESPOND TO AN ACTION TAKEN AGAINST YOU
          </p>
          <p style={{ fontSize: '0.95rem', color: '#666', marginTop: '0.75rem', lineHeight: '1.6', maxWidth: '800px' }}>
            Use this intake if an agency, institution, or authority has taken action against you and requires a formal response.
          </p>
          <div className="progress-bar" style={{ marginTop: '1.5rem' }}>
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <form className="intake-form" onSubmit={handleSubmit}>
          {/* Contact Information */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">👤</span>
              Contact Information
            </h2>

            <div className="form-group">
              <label className="form-label required" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                required
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="fullName">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="form-input"
                required
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                required
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="address">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className="form-input"
                required
                placeholder="123 Main St, City, State 12345"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Case Category */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">🎯</span>
              Case Category
            </h2>

            <div className="category-grid">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`category-option ${
                    selectedCategory === category.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <div className="category-name">{category.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Details */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">⚠️</span>
              Action Details
            </h2>

            <div className="form-group">
              <label className="form-label required" htmlFor="whoIsActing">
                Who is taking action?
              </label>
              <input
                type="text"
                id="whoIsActing"
                name="whoIsActing"
                className="form-input"
                required
                placeholder="Agency, creditor, landlord, institution"
                value={formData.whoIsActing}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="noticeType">
                Type of notice received
              </label>
              <input
                type="text"
                id="noticeType"
                name="noticeType"
                className="form-input"
                placeholder="Optional: describe the notice type"
                value={formData.noticeType}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="deadline">
                Response Deadline (if any)
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                className="form-input"
                value={formData.deadline}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="amount">
                Amount Involved (if applicable)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="form-input"
                placeholder="1500"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Case Description */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">📝</span>
              Case Description
            </h2>

            <div className="form-group">
              <label className="form-label required" htmlFor="caseDescription">
                Describe Your Situation
              </label>
              <textarea
                id="caseDescription"
                name="caseDescription"
                className="form-textarea"
                required
                placeholder="Please describe what happened, when you received the notice, and what action is being threatened..."
                value={formData.caseDescription}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Document Upload */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">📎</span>
              Upload Documents
            </h2>

            <div className="form-group">
              <MultiFileUploader
                onUploadComplete={handleUploadComplete}
                apiUrl={getApiUrl()}
                uploadEndpoint="/api/upload/multiple"
                maxConcurrency={3}
                acceptedTypes=".pdf,.jpg,.jpeg,.png,.heic,.webp,.tiff,.bmp,.doc,.docx"
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="file-list">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">✅ {file.name}</span>
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Terms of Service Acceptance */}
          <div className="form-section">
            <div className="terms-acceptance" style={{
              padding: '1.5rem',
              backgroundColor: '#f9fafb',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  style={{
                    marginTop: '0.25rem',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#10b981'
                  }}
                />
                <span style={{ color: '#374151' }}>
                  I understand Turbo Response is not a law firm and provides document preparation and advocacy support only.
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={!isFormComplete || isSubmitting}
          >
            {isSubmitting
              ? "🤖 AI Analyzing..."
              : isFormComplete
              ? "🚀 Submit Defense Intake"
              : `🚀 Complete Form (${Math.round(progress)}%)`}
          </button>
        </form>

        {/* Success Message Overlay */}
        {submitSuccess && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "3rem",
                borderRadius: "16px",
                maxWidth: "500px",
                width: "90%",
                textAlign: "center",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div
                style={{
                  fontSize: "4rem",
                  marginBottom: "1rem",
                  animation: "bounce 0.6s ease-in-out",
                }}
              >
                ✅
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "1rem",
                  color: "#1a1a1a",
                }}
              >
                Defense Intake Received!
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#666",
                  marginBottom: "1.5rem",
                }}
              >
                Your case has been submitted successfully. Case #: {caseNumber}
              </p>
              <p style={{ fontSize: "0.9rem", color: "#999" }}>
                Redirecting to portal...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

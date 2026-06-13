import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { IntakeFormSkeleton } from "@/components/Skeleton";
import { api } from "@/lib/api";
import MultiFileUploader from "@/components/MultiFileUploader";
import "./IntakeForm.css";

const actionTypes = [
  { id: "credit-dispute", icon: "💳", name: "Credit Dispute" },
  { id: "debt-validation", icon: "📋", name: "Debt Validation Request" },
  { id: "banking-complaint", icon: "🏦", name: "Banking Complaint" },
  { id: "irs-request", icon: "📄", name: "IRS Request or Appeal" },
  { id: "housing-complaint", icon: "🏠", name: "Housing Complaint" },
  { id: "benefits-appeal", icon: "🛡️", name: "Benefits Appeal" },
  { id: "insurance-claim", icon: "📑", name: "Insurance Claim/Dispute" },
  { id: "identity-theft", icon: "🔐", name: "Identity Theft Report" },
  { id: "consumer-complaint", icon: "⚖️", name: "Consumer Complaint" },
  { id: "other", icon: "📌", name: "Other" },
];

const outcomes = [
  "Correction",
  "Deletion",
  "Refund",
  "Reconsideration",
  "Payment Arrangement",
  "Complaint Filing",
  "Account Review",
  "Documentation Request",
  "Other",
];

const urgencyLevels = [
  { id: "not-urgent", name: "Not Urgent" },
  { id: "30-days", name: "Within 30 Days" },
  { id: "14-days", name: "Within 14 Days" },
  { id: "7-days", name: "Within 7 Days" },
  { id: "immediate", name: "Immediate" },
];

export default function OffenseIntakeForm() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActionType, setSelectedActionType] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [caseNumber, setCaseNumber] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    actionType: "",
    targetEntity: "",
    whatHappened: "",
    desiredOutcome: "",
    urgency: "not-urgent",
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
    const totalFields = 8;

    if (formData.fullName.trim()) filledFields++;
    if (formData.email.trim()) filledFields++;
    if (formData.phone.trim()) filledFields++;
    if (selectedActionType) filledFields++;
    if (formData.targetEntity.trim()) filledFields++;
    if (formData.whatHappened.trim()) filledFields++;
    if (formData.desiredOutcome) filledFields++;
    if (termsAccepted) filledFields++;

    const newProgress = (filledFields / totalFields) * 100;
    setProgress(newProgress);
  }, [formData, selectedActionType, termsAccepted]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadComplete = (uploadedFilesData: any[]) => {
    try {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedActionType) {
      alert("Please select an action type");
      return;
    }

    if (!formData.desiredOutcome) {
      alert("Please select a desired outcome");
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
      }

      // Get already-uploaded file URLs from state
      const documentUrls = uploadedFiles
        .filter(f => f.url)
        .map(f => f.url);

      // Submit offense intake form to backend
      const response = await api.post("/api/intake-offense", {
        email: formData.email,
        full_name: formData.fullName,
        phone: formData.phone,
        action_type: selectedActionType,
        target_entity: formData.targetEntity,
        what_happened: formData.whatHappened,
        desired_outcome: formData.desiredOutcome,
        urgency: formData.urgency,
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
          type: "offense",
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
      <main className="intake-main">
        <div className="intake-container">
          {submitSuccess ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Case Submitted Successfully</h2>
              <p>Case Number: <strong>{caseNumber}</strong></p>
              <p>Redirecting to confirmation page...</p>
            </div>
          ) : (
            <>
              <div className="intake-header">
                <h1 className="intake-title">⚔️ Apply, File, or Take Action</h1>
                <p className="intake-subtitle">
                  Tell us about the action you're taking. We'll help you organize your documentation and prepare your case.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="intake-form">
                {/* Contact Information */}
                <section className="form-section">
                  <h2 className="section-title">Contact Information</h2>
                  <div className="form-group">
                    <label htmlFor="fullName" className="form-label">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      required
                      className="form-input"
                    />
                  </div>
                </section>

                {/* Action Type */}
                <section className="form-section">
                  <h2 className="section-title">What type of action are you taking? *</h2>
                  <div className="category-grid">
                    {actionTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className={`category-card ${selectedActionType === type.id ? "selected" : ""}`}
                        onClick={() => setSelectedActionType(type.id)}
                      >
                        <div className="category-icon">{type.icon}</div>
                        <div className="category-name">{type.name}</div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Target Entity */}
                <section className="form-section">
                  <h2 className="section-title">Who is the issue with? *</h2>
                  <div className="form-group">
                    <input
                      type="text"
                      name="targetEntity"
                      value={formData.targetEntity}
                      onChange={handleInputChange}
                      placeholder="Company name, agency, creditor, bank, etc."
                      required
                      className="form-input"
                    />
                  </div>
                </section>

                {/* What Happened */}
                <section className="form-section">
                  <h2 className="section-title">What happened? *</h2>
                  <div className="form-group">
                    <textarea
                      name="whatHappened"
                      value={formData.whatHappened}
                      onChange={handleInputChange}
                      placeholder="Briefly describe the situation and why you're taking action..."
                      required
                      rows={5}
                      className="form-textarea"
                    />
                  </div>
                </section>

                {/* Desired Outcome */}
                <section className="form-section">
                  <h2 className="section-title">What outcome are you seeking? *</h2>
                  <div className="form-group">
                    <select
                      name="desiredOutcome"
                      value={formData.desiredOutcome}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select an outcome...</option>
                      {outcomes.map((outcome) => (
                        <option key={outcome} value={outcome}>
                          {outcome}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>

                {/* Urgency */}
                <section className="form-section">
                  <h2 className="section-title">How urgent is this?</h2>
                  <div className="form-group">
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {urgencyLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>

                {/* Document Upload */}
                <section className="form-section">
                  <h2 className="section-title">Do you have documents to upload?</h2>
                  <MultiFileUploader onUploadComplete={handleUploadComplete} />
                  {uploadedFiles.length > 0 && (
                    <div className="uploaded-files">
                      <h3>Uploaded Files ({uploadedFiles.length})</h3>
                      <ul>
                        {uploadedFiles.map((file, index) => (
                          <li key={index}>
                            <span>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="remove-file-btn"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                {/* Terms Acceptance */}
                <section className="form-section">
                  <div className="terms-checkbox">
                    <input
                      type="checkbox"
                      id="termsAccepted"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                    />
                    <label htmlFor="termsAccepted">
                      I understand Turbo Response is not a law firm and provides document preparation, research support, and advocacy assistance only. I understand Turbo Response does not provide legal advice and no attorney-client relationship is formed.
                    </label>
                  </div>
                </section>

                {/* Progress Bar */}
                <div className="progress-container">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="progress-text">{Math.round(progress)}% Complete</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isFormComplete || isSubmitting}
                  className="submit-button"
                >
                  {isSubmitting ? "Submitting..." : "Submit Your Case"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import "./IntakeForm.css";

interface FileUpload {
  file: File;
  name: string;
}

const categories = [
  { id: "eviction", icon: "🏠", name: "Eviction & Housing" },
  { id: "debt", icon: "💳", name: "Debt Collection" },
  { id: "irs", icon: "📋", name: "IRS & Tax Issues" },
  { id: "wage", icon: "💰", name: "Wage Garnishment" },
  { id: "medical", icon: "🏥", name: "Medical Bills" },
  { id: "benefits", icon: "🛡️", name: "Benefits Denial" },
  { id: "auto", icon: "🚗", name: "Auto Repossession" },
  { id: "consumer", icon: "⚖️", name: "Consumer Rights" },
];

export default function IntakeForm() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    address: "",
    caseDescription: "",
    amount: "",
    deadline: "",
  });

  // Calculate progress
  useEffect(() => {
    let filledFields = 0;
    const totalFields = 8; // 7 form fields + 1 category

    if (formData.email.trim()) filledFields++;
    if (formData.fullName.trim()) filledFields++;
    if (formData.phone.trim()) filledFields++;
    if (formData.address.trim()) filledFields++;
    if (formData.caseDescription.trim()) filledFields++;
    if (selectedCategory) filledFields++;

    const newProgress = (filledFields / totalFields) * 100;
    setProgress(newProgress);
  }, [formData, selectedCategory]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((file) => ({
      file,
      name: file.name,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      alert("Please select a case category");
      return;
    }

    setIsSubmitting(true);

    // Simulate AI processing
    setTimeout(() => {
      const params = new URLSearchParams({
        email: formData.email,
        name: formData.fullName,
        category: selectedCategory,
        status: "form_submitted",
      });

      setLocation(`/payment?${params.toString()}`);
    }, 3000);
  };

  const isFormComplete = progress === 100;

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
        <div className="intake-header">
          <h1 className="intake-title">Case Intake Form</h1>
          <p className="intake-subtitle">
            AI-Powered Consumer Defense - Get Your Professional Response in 24 Hours
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <form className="intake-form" onSubmit={handleSubmit}>
          {/* Contact Information */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">👤</span>
              Contact Information
              <span className="ai-badge">🤖 AI Secure</span>
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
              <span className="ai-badge">🤖 AI Powered</span>
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

          {/* Case Details */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">📝</span>
              Case Details
              <span className="ai-badge">🤖 AI Analysis</span>
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
          </div>

          {/* Document Upload */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">📎</span>
              Upload Documents
              <span className="ai-badge">🤖 AI Scan</span>
            </h2>

            <div className="form-group">
              <label className="file-upload" htmlFor="documents">
                <input
                  type="file"
                  id="documents"
                  name="documents"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                />
                <div className="file-upload-icon">📄</div>
                <div className="file-upload-text">
                  Click to upload or drag and drop
                  <br />
                  <small>PDF, Images, Word documents</small>
                </div>
              </label>

              {uploadedFiles.length > 0 && (
                <div className="file-list">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">📄 {file.name}</span>
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
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={!isFormComplete || isSubmitting}
          >
            {isSubmitting
              ? "🤖 AI Analyzing..."
              : isFormComplete
              ? "🚀 Submit for AI Analysis"
              : `🚀 Complete Form (${Math.round(progress)}%)`}
          </button>
        </form>
      </div>
    </div>
  );
}

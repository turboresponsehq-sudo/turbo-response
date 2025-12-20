import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import './TurboIntakeForm.css';
import MultiFileUploader from '@/components/MultiFileUploader';

export default function TurboIntakeForm() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    entityType: 'Individual',
    websiteUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    linkInBio: '',
    primaryGoal: 'Grant / Funding Approval',
    targetAuthority: '',
    stage: 'Preparing application',
    deadline: '',
    estimatedAmount: '',
    caseDescription: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let value = e.target.value;
    
    // Auto-fix URLs: add https:// if missing protocol
    const urlFields = ['websiteUrl', 'instagramUrl', 'tiktokUrl', 'facebookUrl', 'youtubeUrl', 'linkInBio'];
    if (urlFields.includes(e.target.name) && value && !value.match(/^https?:\/\//i)) {
      value = 'https://' + value;
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
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
      console.error('Failed to process uploaded files:', error);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getApiUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || 'https://turboresponsehq.ai';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError('');
    
    // Clean up URLs before submission
    const cleanedData = { ...formData };
    const urlFields: Array<keyof typeof formData> = ['websiteUrl', 'instagramUrl', 'tiktokUrl', 'facebookUrl', 'youtubeUrl', 'linkInBio'];
    urlFields.forEach(field => {
      if (cleanedData[field] && typeof cleanedData[field] === 'string' && !cleanedData[field].match(/^https?:\/\//i)) {
        cleanedData[field] = 'https://' + cleanedData[field];
      }
    });

    // Get uploaded file URLs
    const documentUrls = uploadedFiles
      .filter(f => f.url)
      .map(f => f.url);

    try {
      const response = await fetch('/api/turbo-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...cleanedData,
          documents: documentUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit offense intake');
      }

      setSuccess(true);
      setTimeout(() => {
        setLocation('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="turbo-intake-page">
        <div className="bg-animation">
          <div className="bg-grid"></div>
        </div>
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h1>Offense Intake Received!</h1>
            <p>
              Thank you for submitting your offense intake. Our team will review your case
              and prepare a comprehensive strategy within 24-48 hours.
            </p>
            <p className="redirect-text">Redirecting to homepage...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="turbo-intake-page">
      <div className="bg-animation">
        <div className="bg-grid"></div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="nav-container">
          <div className="logo" onClick={() => setLocation('/')}>
            <span className="logo-icon">⚡</span>
            <span className="logo-text">TURBO RESPONSE</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="form-container">
          <div className="form-header">
            <h1 className="form-title">OFFENSE INTAKE</h1>
            <p className="form-subtitle">
              INITIATE AN ACTION TO PURSUE APPROVAL OR RECOVERY
            </p>
            <p style={{ fontSize: '0.95rem', color: '#666', marginTop: '0.75rem', lineHeight: '1.6' }}>
              Use this intake to initiate an application, claim, dispute, or formal request intended to secure approval, funding, recovery, or corrective action.
            </p>
            <p style={{ fontSize: '0.95rem', color: '#666', marginTop: '0.5rem', lineHeight: '1.6' }}>
              This intake may request business or entity information. If certain fields do not apply to your situation, you may leave them blank.
            </p>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="intake-form">
            {/* Contact Information */}
            <section className="form-section">
              <h2 className="section-title">Contact Information</h2>

              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="John Smith"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                />
              </div>
            </section>

            {/* Entity Information */}
            <section className="form-section">
              <h2 className="section-title">Entity Information</h2>

              <div className="form-group">
                <label htmlFor="businessName">Business / Entity Name *</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  placeholder="Your Business Name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="entityType">Entity Type *</label>
                <select
                  id="entityType"
                  name="entityType"
                  value={formData.entityType}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #d0d0d0',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    color: '#1a1a1a',
                  }}
                >
                  <option value="Individual">Individual</option>
                  <option value="LLC">LLC</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Nonprofit">Nonprofit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="websiteUrl">Website URL</label>
                <input
                  type="url"
                  id="websiteUrl"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </section>

            {/* Social Media */}
            <section className="form-section">
              <h2 className="section-title">Social Media Presence (Optional)</h2>

              <div className="form-group">
                <label htmlFor="instagramUrl">Instagram URL</label>
                <input
                  type="url"
                  id="instagramUrl"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleChange}
                  placeholder="https://instagram.com/yourbusiness"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tiktokUrl">TikTok URL</label>
                <input
                  type="url"
                  id="tiktokUrl"
                  name="tiktokUrl"
                  value={formData.tiktokUrl}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@yourbusiness"
                />
              </div>

              <div className="form-group">
                <label htmlFor="facebookUrl">Facebook URL</label>
                <input
                  type="url"
                  id="facebookUrl"
                  name="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={handleChange}
                  placeholder="https://facebook.com/yourbusiness"
                />
              </div>

              <div className="form-group">
                <label htmlFor="youtubeUrl">YouTube URL</label>
                <input
                  type="url"
                  id="youtubeUrl"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/@yourbusiness"
                />
              </div>

              <div className="form-group">
                <label htmlFor="linkInBio">Link-in-Bio URL</label>
                <input
                  type="url"
                  id="linkInBio"
                  name="linkInBio"
                  value={formData.linkInBio}
                  onChange={handleChange}
                  placeholder="https://linktr.ee/yourbusiness"
                />
              </div>
            </section>

            {/* Offense Objective */}
            <section className="form-section">
              <h2 className="section-title">Offense Objective</h2>

              <div className="form-group">
                <label htmlFor="primaryGoal">Primary Goal *</label>
                <select
                  id="primaryGoal"
                  name="primaryGoal"
                  value={formData.primaryGoal}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #d0d0d0',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    color: '#1a1a1a',
                  }}
                >
                  <option value="Grant / Funding Approval">Grant / Funding Approval</option>
                  <option value="Credit Line / Capital Access">Credit Line / Capital Access</option>
                  <option value="Contract Dispute">Contract Dispute</option>
                  <option value="Complaint / Regulatory Filing">Complaint / Regulatory Filing</option>
                  <option value="Settlement / Recovery">Settlement / Recovery</option>
                  <option value="Other">Other (free text)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="targetAuthority">Target Authority / Counterparty *</label>
                <input
                  type="text"
                  id="targetAuthority"
                  name="targetAuthority"
                  value={formData.targetAuthority}
                  onChange={handleChange}
                  required
                  placeholder="Agency, bank, company, program, or institution"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stage">Stage *</label>
                <select
                  id="stage"
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #d0d0d0',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    color: '#1a1a1a',
                  }}
                >
                  <option value="Preparing application">Preparing application</option>
                  <option value="Submitted / Pending">Submitted / Pending</option>
                  <option value="Rejected / Denied">Rejected / Denied</option>
                  <option value="Pre-dispute">Pre-dispute</option>
                  <option value="Active dispute">Active dispute</option>
                </select>
              </div>
            </section>

            {/* Timing & Stakes */}
            <section className="form-section">
              <h2 className="section-title">Timing & Stakes</h2>

              <div className="form-group">
                <label htmlFor="deadline">Deadline / Timeline</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  placeholder="Select a date or leave blank if none"
                />
              </div>

              <div className="form-group">
                <label htmlFor="estimatedAmount">Estimated Amount at Stake</label>
                <input
                  type="number"
                  id="estimatedAmount"
                  name="estimatedAmount"
                  value={formData.estimatedAmount}
                  onChange={handleChange}
                  placeholder="Optional: Enter amount"
                  step="0.01"
                />
              </div>
            </section>

            {/* Case Summary */}
            <section className="form-section">
              <h2 className="section-title">Case Summary</h2>

              <div className="form-group">
                <label htmlFor="caseDescription">Short Description *</label>
                <textarea
                  id="caseDescription"
                  name="caseDescription"
                  value={formData.caseDescription}
                  onChange={handleChange}
                  rows={4}
                  required
                  placeholder="What are you trying to get approved, recovered, or enforced?"
                />
              </div>
            </section>

            {/* Document Upload */}
            <section className="form-section">
              <h2 className="section-title">Upload Documents</h2>
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
            </section>

            {/* Terms Acceptance */}
            <section className="form-section">
              <div style={{
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
                      accentColor: '#667eea'
                    }}
                  />
                  <span style={{ color: '#374151' }}>
                    I understand Turbo Response is not a law firm and provides document preparation and advocacy support only.
                  </span>
                </label>
              </div>
            </section>

            {/* Submit Button */}
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading || !termsAccepted}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span>Submit Offense Intake</span>
                    <span className="arrow">→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

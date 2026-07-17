import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
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
    entityType: 'Consumer Law Support Company',
    websiteUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    linkInBio: '',
    primaryGoal: 'Document and Evidence Organization',
    targetAuthority: '',
    stage: 'Building the Process',
    deadline: '',
    estimatedAmount: '',
    caseDescription: '',
  });

  useEffect(() => {
    document.title = 'Turbo Response — Case Operations Discovery';
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let value = e.target.value;
    const urlFields = ['websiteUrl', 'instagramUrl', 'tiktokUrl', 'facebookUrl', 'youtubeUrl', 'linkInBio'];
    if (urlFields.includes(e.target.name) && value && !value.match(/^https?:\/\//i)) {
      value = 'https://' + value;
    }
    setFormData({ ...formData, [e.target.name]: value });
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
      setError('Please confirm your understanding before submitting.');
      return;
    }
    setLoading(true);
    setError('');

    const cleanedData = { ...formData };
    const urlFields: Array<keyof typeof formData> = ['websiteUrl', 'instagramUrl', 'tiktokUrl', 'facebookUrl', 'youtubeUrl', 'linkInBio'];
    urlFields.forEach(field => {
      if (cleanedData[field] && typeof cleanedData[field] === 'string' && !cleanedData[field].match(/^https?:\/\//i)) {
        cleanedData[field] = 'https://' + cleanedData[field];
      }
    });

    const documentUrls = uploadedFiles.filter(f => f.url).map(f => f.url);

    try {
      const response = await fetch('/api/turbo-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cleanedData,
          documentUrls,
          source: 'build-intake',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      setSuccess(true);
      setLocation('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bi-root">
        <div className="bi-bg"><div className="bi-grid" /></div>
        <div className="bi-success-wrap">
          <div className="bi-success-card">
            <div className="bi-success-icon">✓</div>
            <h2>Case Operations Review Requested</h2>
            <p>No commitment. We'll review your submission and follow up within 1–2 business days.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bi-root">
      <div className="bi-bg">
        <div className="bi-grid" />
        <div className="bi-orb bi-orb-1" />
        <div className="bi-orb bi-orb-2" />
      </div>

      <header className="bi-header">
        <div className="bi-nav">
          <Link href="/" className="bi-logo">
            <span className="bi-logo-icon">⚡</span>
            <span className="bi-logo-text">TURBO <span className="bi-logo-accent">RESPONSE</span></span>
          </Link>
          <Link href="/" className="bi-back-link">← Back to Home</Link>
        </div>
      </header>

      <main className="bi-main">
        <div className="bi-container">

          <div className="bi-page-header">
            <span className="bi-badge">⚡ Case Operations Discovery</span>
            <h1 className="bi-title">Tell Us About Your Case Operations</h1>
            <p className="bi-subtitle">
              Tell us how your team currently manages intake, documents, evidence, research, timelines, and case workflows. We'll review your process and identify where Turbo Response may be able to improve efficiency, organization, and case capacity.
            </p>
          </div>

          {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
          <div className="bi-how-it-works">
            <h2 className="bi-hiw-title">How It Works</h2>
            <div className="bi-hiw-steps">
              <div className="bi-hiw-step">
                <span className="bi-hiw-num">1</span>
                <div>
                  <strong>Tell Us About Your Operations</strong>
                  <p>Share how your team manages cases, documentation, research, evidence, and follow-up.</p>
                </div>
              </div>
              <div className="bi-hiw-arrow">↓</div>
              <div className="bi-hiw-step">
                <span className="bi-hiw-num">2</span>
                <div>
                  <strong>We Review Your Workflow</strong>
                  <p>We identify bottlenecks, repetitive work, documentation gaps, and opportunities for AI-assisted case operations.</p>
                </div>
              </div>
              <div className="bi-hiw-arrow">↓</div>
              <div className="bi-hiw-step">
                <span className="bi-hiw-num">3</span>
                <div>
                  <strong>Receive a Recommended Next Step</strong>
                  <p>If there is a strong fit, we'll recommend the most practical service, workflow, or implementation approach for your team.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="bi-form-tagline">Better case operations begin with understanding how the work is currently being done.</p>

          {error && (
            <div className="bi-error-banner">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bi-form">

            <div className="bi-card">
              <h2 className="bi-section-title">Contact Information</h2>
              <div className="bi-field-grid">
                <div className="bi-field">
                  <label htmlFor="fullName">Full Name *</label>
                  <input type="text" id="fullName" name="fullName" value={formData.fullName}
                    onChange={handleChange} required placeholder="Your name" />
                </div>
                <div className="bi-field">
                  <label htmlFor="email">Email Address *</label>
                  <input type="email" id="email" name="email" value={formData.email}
                    onChange={handleChange} required placeholder="you@yourbusiness.com" />
                </div>
                <div className="bi-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone}
                    onChange={handleChange} placeholder="(555) 123-4567" />
                </div>
              </div>
            </div>

            <div className="bi-card">
              <h2 className="bi-section-title">Company or Organization</h2>
              <div className="bi-field-grid">
                <div className="bi-field">
                  <label htmlFor="businessName">Company or Organization Name</label>
                  <input type="text" id="businessName" name="businessName" value={formData.businessName}
                    onChange={handleChange} placeholder="Enter your company or organization name" />
                </div>
                <div className="bi-field">
                  <label htmlFor="entityType">Organization Type</label>
                  <select id="entityType" name="entityType" value={formData.entityType} onChange={handleChange}>
                    <option value="Consumer Law Support Company">Consumer Law Support Company</option>
                    <option value="Legal Support Company">Legal Support Company</option>
                    <option value="Claims or Dispute Support Company">Claims or Dispute Support Company</option>
                    <option value="Advocacy Organization">Advocacy Organization</option>
                    <option value="Compliance Team">Compliance Team</option>
                    <option value="Investigation Company">Investigation Company</option>
                    <option value="Professional Services Company">Professional Services Company</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="bi-field">
                  <label htmlFor="websiteUrl">Website URL</label>
                  <input type="url" id="websiteUrl" name="websiteUrl" value={formData.websiteUrl}
                    onChange={handleChange} placeholder="https://yourbusiness.com" />
                </div>
              </div>
            </div>

            <div className="bi-card">
              <h2 className="bi-section-title">Social Presence <span className="bi-optional">(Optional)</span></h2>
              <div className="bi-field-grid bi-field-grid-2">
                <div className="bi-field">
                  <label htmlFor="instagramUrl">Instagram</label>
                  <input type="url" id="instagramUrl" name="instagramUrl" value={formData.instagramUrl}
                    onChange={handleChange} placeholder="https://instagram.com/yourbusiness" />
                </div>
                <div className="bi-field">
                  <label htmlFor="tiktokUrl">TikTok</label>
                  <input type="url" id="tiktokUrl" name="tiktokUrl" value={formData.tiktokUrl}
                    onChange={handleChange} placeholder="https://tiktok.com/@yourbusiness" />
                </div>
                <div className="bi-field">
                  <label htmlFor="youtubeUrl">YouTube</label>
                  <input type="url" id="youtubeUrl" name="youtubeUrl" value={formData.youtubeUrl}
                    onChange={handleChange} placeholder="https://youtube.com/@yourbusiness" />
                </div>
                <div className="bi-field">
                  <label htmlFor="linkInBio">Link-in-Bio</label>
                  <input type="url" id="linkInBio" name="linkInBio" value={formData.linkInBio}
                    onChange={handleChange} placeholder="https://linktr.ee/yourbusiness" />
                </div>
              </div>
            </div>

            <div className="bi-card">
              <h2 className="bi-section-title">Operations Overview</h2>
              <div className="bi-field-grid">
                <div className="bi-field">
                  <label htmlFor="primaryGoal">What Area of Case Operations Needs the Most Support? *</label>
                  <select id="primaryGoal" name="primaryGoal" value={formData.primaryGoal} onChange={handleChange} required>
                    <option value="Document and Evidence Organization">Document and Evidence Organization</option>
                    <option value="Case Intake and Qualification">Case Intake and Qualification</option>
                    <option value="Timeline and Chronology Creation">Timeline and Chronology Creation</option>
                    <option value="Research and Regulatory Intelligence">Research and Regulatory Intelligence</option>
                    <option value="Claims and Response Preparation">Claims and Response Preparation</option>
                    <option value="Case Tracking and Follow-Up">Case Tracking and Follow-Up</option>
                    <option value="Workflow Automation">Workflow Automation</option>
                    <option value="Full Case Operations Support">Full Case Operations Support</option>
                    <option value="Not Sure Yet">Not Sure Yet</option>
                  </select>
                </div>
                <div className="bi-field">
                  <label htmlFor="targetAuthority">What Types of Cases or Matters Does Your Team Manage?</label>
                  <input type="text" id="targetAuthority" name="targetAuthority" value={formData.targetAuthority}
                    onChange={handleChange} placeholder="Example: consumer disputes, financial claims, regulatory complaints, investigations, housing matters, employment matters, or administrative cases" />
                </div>
                <div className="bi-field">
                  <label htmlFor="stage">Current Operations Stage</label>
                  <select id="stage" name="stage" value={formData.stage} onChange={handleChange}>
                    <option value="Building the Process">Building the Process</option>
                    <option value="Managing Cases Manually">Managing Cases Manually</option>
                    <option value="Using Multiple Disconnected Tools">Using Multiple Disconnected Tools</option>
                    <option value="Need Immediate Operational Support">Need Immediate Operational Support</option>
                    <option value="Preparing to Scale">Preparing to Scale</option>
                    <option value="Not Sure">Not Sure</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bi-card">
              <h2 className="bi-section-title">Implementation Timeline</h2>
              <div className="bi-field-grid bi-field-grid-2">
                <div className="bi-field">
                  <label htmlFor="deadline">When Would You Like Support to Begin?</label>
                  <input type="date" id="deadline" name="deadline" value={formData.deadline}
                    onChange={handleChange} />
                </div>
                <div className="bi-field">
                  <label htmlFor="estimatedAmount">Estimated Monthly Budget</label>
                  <select id="estimatedAmount" name="estimatedAmount" value={formData.estimatedAmount} onChange={handleChange}>
                    <option value="">Select a range</option>
                    <option value="Under $2,500">Under $2,500</option>
                    <option value="$2,500–$5,000">$2,500–$5,000</option>
                    <option value="$5,000–$10,000">$5,000–$10,000</option>
                    <option value="$10,000–$20,000">$10,000–$20,000</option>
                    <option value="$20,000+">$20,000+</option>
                    <option value="Not Sure Yet">Not Sure Yet</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bi-card">
              <h2 className="bi-section-title">Current Workflow and Challenges</h2>
              <div className="bi-field">
                <label htmlFor="caseDescription">Tell Us How Your Team Currently Manages Cases *</label>
                <textarea id="caseDescription" name="caseDescription" value={formData.caseDescription}
                  onChange={handleChange} rows={5} required
                  placeholder="Describe your current workflow, team size, case volume, tools being used, documentation challenges, repetitive tasks, bottlenecks, and the outcome you want Turbo Response to help create." />
              </div>
            </div>

            <div className="bi-card">
              <h2 className="bi-section-title">Supporting Files <span className="bi-optional">(Optional)</span></h2>
              <p className="bi-field-hint">Upload sample intake forms, workflows, SOPs, case templates, dashboards, reports, screenshots, document structures, or other materials that help us understand your current operations.</p>
              <p className="bi-trust-statement">🔒 Your business information and uploaded materials remain confidential and are used only to evaluate your operational needs.</p>
              <MultiFileUploader
                onUploadComplete={handleUploadComplete}
                apiUrl={getApiUrl()}
                uploadEndpoint="/api/upload/multiple"
                maxConcurrency={3}
                acceptedTypes=".pdf,.jpg,.jpeg,.png,.heic,.webp,.doc,.docx"
              />
              {uploadedFiles.length > 0 && (
                <div className="bi-file-list">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="bi-file-item">
                      <span className="bi-file-name">✅ {file.name}</span>
                      <button type="button" className="bi-file-remove" onClick={() => removeFile(index)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bi-card bi-terms-card">
              <label className="bi-terms-label">
                <input type="checkbox" checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)} required />
                <span>
                  I understand that Turbo Response provides AI-powered case operations, documentation, research, workflow, automation, and operational support. Turbo Response is not a law firm and does not provide legal advice or legal representation. This form is for business discovery, service evaluation, and project scoping only.
                </span>
              </label>
            </div>

            <div className="bi-submit-row">
              <button type="submit" className="bi-submit-btn" disabled={loading || !termsAccepted}>
                {loading ? (
                  <><span className="bi-spinner" /> Submitting...</>
                ) : (
                  <>Request a Case Operations Review <span className="bi-arrow">→</span></>
                )}
              </button>
              <p className="bi-submit-note">No commitment. We'll review your submission and follow up within 1–2 business days.</p>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

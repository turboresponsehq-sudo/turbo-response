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
    entityType: 'Individual',
    websiteUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    linkInBio: '',
    primaryGoal: 'AI System Build',
    targetAuthority: '',
    stage: 'Exploring options',
    deadline: '',
    estimatedAmount: '',
    caseDescription: '',
  });

  useEffect(() => {
    document.title = 'Build Intake — Turbo Response HQ';
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
            <h2>Build Intake Received</h2>
            <p>We'll review your brief and follow up within 24–48 hours with next steps.</p>
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
            <span className="bi-badge">⚡ Build Intake</span>
            <h1 className="bi-title">Start Your Build</h1>
            <p className="bi-subtitle">
              Tell us what you're building. We'll map your highest-value automation targets
              and define a build plan — before any commitment.
            </p>
          </div>

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
              <h2 className="bi-section-title">Organization</h2>
              <div className="bi-field-grid">
                <div className="bi-field">
                  <label htmlFor="businessName">Business / Entity Name</label>
                  <input type="text" id="businessName" name="businessName" value={formData.businessName}
                    onChange={handleChange} placeholder="Your Business or Project Name" />
                </div>
                <div className="bi-field">
                  <label htmlFor="entityType">Entity Type</label>
                  <select id="entityType" name="entityType" value={formData.entityType} onChange={handleChange}>
                    <option value="Individual">Individual / Solo Founder</option>
                    <option value="LLC">LLC</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Nonprofit">Nonprofit</option>
                    <option value="Creator / Brand">Creator / Brand</option>
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
              <h2 className="bi-section-title">Build Objective</h2>
              <div className="bi-field-grid">
                <div className="bi-field">
                  <label htmlFor="primaryGoal">What Are You Building? *</label>
                  <select id="primaryGoal" name="primaryGoal" value={formData.primaryGoal} onChange={handleChange} required>
                    <option value="AI System Build">AI System Build</option>
                    <option value="Automation Workflow">Automation Workflow</option>
                    <option value="Intelligence Pipeline">Intelligence Pipeline</option>
                    <option value="Production Infrastructure">Production Infrastructure</option>
                    <option value="Content / Media System">Content / Media System</option>
                    <option value="Founder OS / Operations">Founder OS / Operations</option>
                    <option value="Research / Data Intelligence">Research / Data Intelligence</option>
                    <option value="Ecosystem / Community Build">Ecosystem / Community Build</option>
                    <option value="Workflow Optimization">Workflow Optimization</option>
                    <option value="Other">Other (describe below)</option>
                  </select>
                </div>
                <div className="bi-field">
                  <label htmlFor="targetAuthority">Target Platform / Tool / Integration</label>
                  <input type="text" id="targetAuthority" name="targetAuthority" value={formData.targetAuthority}
                    onChange={handleChange} placeholder="e.g. Notion, Airtable, Stripe, custom API..." />
                </div>
                <div className="bi-field">
                  <label htmlFor="stage">Where Are You Now?</label>
                  <select id="stage" name="stage" value={formData.stage} onChange={handleChange}>
                    <option value="Exploring options">Exploring options</option>
                    <option value="Have a clear vision">Have a clear vision</option>
                    <option value="Partially built">Partially built — need to finish or fix</option>
                    <option value="Ready to deploy">Ready to deploy</option>
                    <option value="Need to scale">Already running — need to scale</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bi-card">
              <h2 className="bi-section-title">Timeline & Budget</h2>
              <div className="bi-field-grid bi-field-grid-2">
                <div className="bi-field">
                  <label htmlFor="deadline">Target Launch Date</label>
                  <input type="date" id="deadline" name="deadline" value={formData.deadline}
                    onChange={handleChange} />
                </div>
                <div className="bi-field">
                  <label htmlFor="estimatedAmount">Estimated Budget</label>
                  <input type="number" id="estimatedAmount" name="estimatedAmount" value={formData.estimatedAmount}
                    onChange={handleChange} placeholder="Optional" step="0.01" />
                </div>
              </div>
            </div>

            <div className="bi-card">
              <h2 className="bi-section-title">Project Brief</h2>
              <div className="bi-field">
                <label htmlFor="caseDescription">Describe What You're Building *</label>
                <textarea id="caseDescription" name="caseDescription" value={formData.caseDescription}
                  onChange={handleChange} rows={5} required
                  placeholder="What operational problem are you solving? What does success look like? What's the bottleneck right now?" />
              </div>
            </div>

            <div className="bi-card">
              <h2 className="bi-section-title">Supporting Files <span className="bi-optional">(Optional)</span></h2>
              <p className="bi-field-hint">Upload any relevant documents, wireframes, screenshots, or reference materials.</p>
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
                  I understand that Turbo Response provides AI systems, automation, and infrastructure
                  build services. This intake is for project scoping only — no commitment required.
                </span>
              </label>
            </div>

            <div className="bi-submit-row">
              <button type="submit" className="bi-submit-btn" disabled={loading || !termsAccepted}>
                {loading ? (
                  <><span className="bi-spinner" /> Submitting...</>
                ) : (
                  <>Submit Build Intake <span className="bi-arrow">→</span></>
                )}
              </button>
              <p className="bi-submit-note">No commitment. We'll follow up within 24–48 hours.</p>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

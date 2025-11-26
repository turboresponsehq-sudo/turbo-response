import { useState } from 'react';
import { useLocation } from 'wouter';
import './TurboIntakeForm.css';

export default function TurboIntakeForm() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    websiteUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    linkInBio: '',
    whatYouSell: '',
    idealCustomer: '',
    biggestStruggle: '',
    shortTermGoal: '',
    longTermVision: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Clean up URLs before submission
    const cleanedData = { ...formData };
    const urlFields: Array<keyof typeof formData> = ['websiteUrl', 'instagramUrl', 'tiktokUrl', 'facebookUrl', 'youtubeUrl', 'linkInBio'];
    urlFields.forEach(field => {
      if (cleanedData[field] && !cleanedData[field].match(/^https?:\/\//i)) {
        cleanedData[field] = 'https://' + cleanedData[field];
      }
    });

    try {
      const response = await fetch('/api/turbo-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit business intake');
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
            <h1>Business Audit Request Received!</h1>
            <p>
              Thank you for submitting your business information. Our team will analyze your
              business and create a strategic blueprint within 24-48 hours.
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
            <h1 className="form-title">Business Audit Request</h1>
            <p className="form-subtitle">
              Get a comprehensive AI-powered analysis of your business with strategic recommendations
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

            {/* Business Information */}
            <section className="form-section">
              <h2 className="section-title">Business Information</h2>

              <div className="form-group">
                <label htmlFor="businessName">Business Name</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Your Business Name"
                />
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
              <h2 className="section-title">Social Media Presence</h2>

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

            {/* Business Snapshot */}
            <section className="form-section">
              <h2 className="section-title">Business Snapshot</h2>

              <div className="form-group">
                <label htmlFor="whatYouSell">What do you sell?</label>
                <textarea
                  id="whatYouSell"
                  name="whatYouSell"
                  value={formData.whatYouSell}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your products or services..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="idealCustomer">Who is your ideal customer?</label>
                <textarea
                  id="idealCustomer"
                  name="idealCustomer"
                  value={formData.idealCustomer}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your target audience..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="biggestStruggle">What's your biggest struggle right now?</label>
                <textarea
                  id="biggestStruggle"
                  name="biggestStruggle"
                  value={formData.biggestStruggle}
                  onChange={handleChange}
                  rows={3}
                  placeholder="What challenges are you facing?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="shortTermGoal">Short-term goal (next 30-90 days)</label>
                <textarea
                  id="shortTermGoal"
                  name="shortTermGoal"
                  value={formData.shortTermGoal}
                  onChange={handleChange}
                  rows={3}
                  placeholder="What do you want to achieve soon?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="longTermVision">Long-term vision (1-3 years)</label>
                <textarea
                  id="longTermVision"
                  name="longTermVision"
                  value={formData.longTermVision}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Where do you see your business in the future?"
                />
              </div>
            </section>

            {/* Submit Button */}
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span>Submit Business Audit Request</span>
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

import { useState, useEffect } from "react";
import { IntakeFormSkeleton } from "@/components/Skeleton";
import "./TurboIntake.css";

export default function TurboIntake() {
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    websiteUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
    linkInBio: "",
    whatYouSell: "",
    idealCustomer: "",
    biggestStruggle: "",
    shortTermGoal: "",
    longTermVision: "",
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consent) {
      alert("Please agree to the consent terms");
      return;
    }

    setIsSubmitting(true);
    setFormStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('https://turbo-response-backend.onrender.com/api/turbo-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      setFormStatus('success');
      setIsSubmitting(false);

      // Redirect to home after 4 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 4000);
    } catch (error: any) {
      setFormStatus('error');
      setErrorMessage(error.message || 'Failed to submit form');
      setIsSubmitting(false);
    }
  };

  // Auto-dismiss success message after 4 seconds
  useEffect(() => {
    if (formStatus === 'success') {
      const timer = setTimeout(() => setFormStatus('idle'), 4000);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  if (isLoading) {
    return (
      <div className="turbo-intake-page">
        <IntakeFormSkeleton />
      </div>
    );
  }

  return (
    <div className="turbo-intake-page">
      <div className="container">
        <div className="header">
          <h1>Turbo Intake</h1>
        </div>

        <div className="intro-box">
          <h2>🚀 AI-Powered Business Audit</h2>
          <p>
            Before we schedule a call, my system runs a fast AI analysis of your
            website, social pages, messaging, and overall digital footprint. Your
            answers feed directly into the audit engine so the AI can prepare a
            clear breakdown of what's working, what's missing, and the biggest
            growth opportunities.
          </p>
          <strong>The more accurate your answers, the sharper the report.</strong>
        </div>

        <form id="turboIntakeForm" onSubmit={handleSubmit}>
          {/* Basic Contact */}
          <div className="form-section">
            <h3 className="section-title">Basic Contact</h3>

            <div className="form-group">
              <label htmlFor="fullName">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                required
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your.email@example.com"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="(555) 123-4567"
                required
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="businessName">
                Business Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                placeholder="Your Company Name"
                required
                value={formData.businessName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Digital Presence */}
          <div className="form-section">
            <h3 className="section-title">Digital Presence</h3>

            <div className="form-group">
              <label htmlFor="websiteUrl">
                Website URL <span className="required">*</span>
              </label>
              <input
                type="url"
                id="websiteUrl"
                name="websiteUrl"
                placeholder="https://example.com"
                required
                value={formData.websiteUrl}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="instagramUrl">Instagram URL</label>
              <input
                type="url"
                id="instagramUrl"
                name="instagramUrl"
                placeholder="https://instagram.com/username"
                value={formData.instagramUrl}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tiktokUrl">TikTok URL</label>
              <input
                type="url"
                id="tiktokUrl"
                name="tiktokUrl"
                placeholder="https://tiktok.com/@username"
                value={formData.tiktokUrl}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="facebookUrl">Facebook URL</label>
              <input
                type="url"
                id="facebookUrl"
                name="facebookUrl"
                placeholder="https://facebook.com/page"
                value={formData.facebookUrl}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="youtubeUrl">YouTube URL</label>
              <input
                type="url"
                id="youtubeUrl"
                name="youtubeUrl"
                placeholder="https://youtube.com/@channel"
                value={formData.youtubeUrl}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkInBio">Link-in-Bio (Linktree/Beacons, optional)</label>
              <input
                type="url"
                id="linkInBio"
                name="linkInBio"
                placeholder="https://linktr.ee/username"
                value={formData.linkInBio}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Business Snapshot */}
          <div className="form-section">
            <h3 className="section-title">Business Snapshot</h3>

            <div className="form-group">
              <label htmlFor="whatYouSell">
                What do you sell? <span className="required">*</span>
              </label>
              <input
                type="text"
                id="whatYouSell"
                name="whatYouSell"
                placeholder="Short description"
                required
                value={formData.whatYouSell}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="idealCustomer">
                Who is your ideal customer? <span className="required">*</span>
              </label>
              <input
                type="text"
                id="idealCustomer"
                name="idealCustomer"
                placeholder="Short description"
                required
                value={formData.idealCustomer}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="biggestStruggle">
                What's your biggest struggle right now? <span className="required">*</span>
              </label>
              <input
                type="text"
                id="biggestStruggle"
                name="biggestStruggle"
                placeholder="Short description"
                required
                value={formData.biggestStruggle}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="shortTermGoal">
                What's your goal for the next 60–90 days? <span className="required">*</span>
              </label>
              <input
                type="text"
                id="shortTermGoal"
                name="shortTermGoal"
                placeholder="Short description"
                required
                value={formData.shortTermGoal}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Vision */}
          <div className="form-section">
            <h3 className="section-title">Vision</h3>

            <div className="form-group">
              <label htmlFor="longTermVision">
                In 1–2 sentences, what's your long-term vision? <span className="required">*</span>
              </label>
              <textarea
                id="longTermVision"
                name="longTermVision"
                placeholder="Describe your vision..."
                required
                value={formData.longTermVision}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Consent */}
          <div className="form-section">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="consent"
                name="consent"
                required
                checked={formData.consent}
                onChange={handleInputChange}
              />
              <label htmlFor="consent">
                I agree to let Turbo Response analyze my publicly available digital
                platforms to generate an AI audit report. <span className="required">*</span>
              </label>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for AI Audit"}
          </button>
        </form>

        {/* Success Banner */}
        {formStatus === 'success' && (
          <div
            style={{
              backgroundColor: "#0CBA70",
              color: "white",
              padding: "12px 16px",
              borderRadius: "6px",
              marginTop: "16px",
              textAlign: "center",
              fontWeight: "500",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
              transition: "opacity 0.5s ease-in-out"
            }}
          >
            ✅ Submission received! Our team will contact you soon.
          </div>
        )}

        {/* Error Banner */}
        {formStatus === 'error' && (
          <div
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              padding: "12px 16px",
              borderRadius: "6px",
              marginTop: "16px",
              textAlign: "center",
              fontWeight: "500",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            ❌ {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

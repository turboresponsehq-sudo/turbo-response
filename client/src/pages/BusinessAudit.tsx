import { useState } from "react";

export default function BusinessAudit() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    businessName: "",
    websiteUrl: "",
    instagramUrl: "",
    industry: "",
    biggestChallenge: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getApiUrl = () => {
    return (import.meta as any).env?.VITE_BACKEND_URL || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${getApiUrl()}/api/business-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Submission failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div style={styles.root}>
        <div style={styles.container}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.successTitle}>Your Report is On Its Way</h1>
            <p style={styles.successText}>
              Your Business Intelligence Report is being generated and will arrive in your inbox within 10 minutes.
            </p>
            <p style={styles.successSubtext}>
              Check your email at <strong>{formData.email}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.logo}>TURBO SYSTEMS</h1>
          <p style={styles.subtitle}>Business Intelligence Audit</p>
          <p style={styles.description}>
            Get a complimentary executive-level analysis of your business operations, 
            customer acquisition, and revenue opportunities — delivered to your inbox in minutes.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="John Smith"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@company.com"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Business Name *</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
              placeholder="Acme Corp"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Website URL</label>
            <input
              type="text"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              placeholder="www.yoursite.com"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Instagram URL</label>
            <input
              type="text"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleChange}
              placeholder="instagram.com/yourbusiness"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Industry *</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Select your industry</option>
              <option value="E-commerce / Retail">E-commerce / Retail</option>
              <option value="Professional Services">Professional Services</option>
              <option value="Health & Wellness">Health & Wellness</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Beauty & Personal Care">Beauty & Personal Care</option>
              <option value="Construction / Trades">Construction / Trades</option>
              <option value="Technology / SaaS">Technology / SaaS</option>
              <option value="Education / Coaching">Education / Coaching</option>
              <option value="Marketing / Creative Agency">Marketing / Creative Agency</option>
              <option value="Finance / Insurance">Finance / Insurance</option>
              <option value="Automotive">Automotive</option>
              <option value="Entertainment / Media">Entertainment / Media</option>
              <option value="Non-Profit">Non-Profit</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Biggest Business Challenge *</label>
            <textarea
              name="biggestChallenge"
              value={formData.biggestChallenge}
              onChange={handleChange}
              required
              placeholder="What's the #1 thing slowing down your business right now?"
              rows={3}
              style={{ ...styles.input, resize: "vertical" as any, minHeight: "80px" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Submitting..." : "Get My Free Business Audit"}
          </button>

          <p style={styles.disclaimer}>
            Your information is secure and will only be used to generate your report.
          </p>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "520px",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logo: {
    margin: "0 0 4px",
    fontSize: "28px",
    fontWeight: 800,
    color: "#4285F4",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "0 0 12px",
    fontSize: "15px",
    color: "#64748b",
    textTransform: "uppercase" as any,
    letterSpacing: "1px",
    fontWeight: 500,
  },
  description: {
    margin: 0,
    fontSize: "16px",
    color: "#475569",
    lineHeight: 1.6,
  },
  form: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  fieldGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#1e293b",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: "16px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box" as any,
    background: "#f8fafc",
    color: "#1e293b",
  },
  submitBtn: {
    width: "100%",
    padding: "18px",
    fontSize: "17px",
    fontWeight: 700,
    color: "#ffffff",
    background: "#4285F4",
    border: "none",
    borderRadius: "12px",
    marginTop: "8px",
    letterSpacing: "-0.3px",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  disclaimer: {
    textAlign: "center",
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "16px",
    marginBottom: 0,
  },
  successCard: {
    textAlign: "center",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "48px 32px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  successIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "#4285F4",
    color: "#ffffff",
    fontSize: "32px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    lineHeight: 1,
  },
  successTitle: {
    margin: "0 0 12px",
    fontSize: "24px",
    fontWeight: 700,
    color: "#1e293b",
  },
  successText: {
    margin: "0 0 8px",
    fontSize: "16px",
    color: "#475569",
    lineHeight: 1.6,
  },
  successSubtext: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
  },
};

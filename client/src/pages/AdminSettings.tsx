import { useState, useEffect } from "react";
import "./AdminSettings.css";

const sections = [
  { id: "mission", title: "🎯 Core Mission & Values", placeholder: "Your mission statement and core values..." },
  { id: "tiers", title: "🧠 4-Tier Classification System", placeholder: "Emergency, Recovery, Rebuilding, Empowerment tiers..." },
  { id: "pricing", title: "💰 Pricing Strategy & Logic", placeholder: "Pricing ranges, factors, adjustments..." },
  { id: "legal", title: "⚖️ Legal Strategy & Laws", placeholder: "FDCPA, FCRA, TCPA, violation detection..." },
  { id: "communication", title: "💬 Communication & Tone", placeholder: "Tone, emotional intelligence, ERBN/LRBN/DRAB..." },
  { id: "website", title: "🌐 Website-Specific Instructions", placeholder: "Website features, forms, payment options, unique selling points..." },
];

export default function AdminSettings() {
  const [sectionData, setSectionData] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Initialize empty sections
    const initial: Record<string, string> = {};
    sections.forEach((section) => {
      initial[section.id] = "";
    });
    setSectionData(initial);
  }, []);

  const handleChange = (sectionId: string, value: string) => {
    setSectionData((prev) => ({
      ...prev,
      [sectionId]: value,
    }));
  };

  const clearSection = (sectionId: string) => {
    setSectionData((prev) => ({
      ...prev,
      [sectionId]: "",
    }));
  };

  const saveAllSections = () => {
    // Save to localStorage for demo
    localStorage.setItem("admin_settings", JSON.stringify(sectionData));

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="admin-settings-page">
      <div className="container">
        <div className="header">
          <h1>⚙️ Business Philosophy Settings</h1>
          <a href="/admin" className="back-btn">
            ← Back to Dashboard
          </a>
        </div>

        {showSuccess && (
          <div className="success-message">✅ All sections saved successfully!</div>
        )}

        <div className="info-box">
          <strong>📝 Instructions:</strong> Each section controls a specific aspect of
          how the AI analyzes cases. You can edit text directly. Click{" "}
          <strong>💾 Save All Changes</strong> when done. The AI will use the updated
          philosophy immediately.
        </div>

        <div className="sections-grid">
          {sections.map((section) => (
            <div key={section.id} className="section-card">
              <div className="section-header">
                <div className="section-title">{section.title}</div>
                <div className="section-actions">
                  <button
                    className="btn-icon"
                    onClick={() => clearSection(section.id)}
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>
              <textarea
                id={section.id}
                placeholder={section.placeholder}
                value={sectionData[section.id] || ""}
                onChange={(e) => handleChange(section.id, e.target.value)}
              />
              <div className="char-count">
                {(sectionData[section.id] || "").length} characters
              </div>
            </div>
          ))}
        </div>

        <button className="save-all-btn" onClick={saveAllSections}>
          💾 Save All Changes
        </button>
      </div>
    </div>
  );
}

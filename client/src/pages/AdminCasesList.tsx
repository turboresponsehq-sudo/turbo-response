import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import './AdminCasesList.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function AdminCasesList() {
  const [, setLocation] = useLocation();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'IRS',
    description: '',
    client_name: '',
    client_email: '',
    client_phone: ''
  });

  const categories = [
    'IRS',
    'Debt Collection',
    'Credit Reporting',
    'Fraud',
    'Repo',
    'Banking Reports (EWS/Chex)',
    'Unemployment',
    'Business Disputes',
    'General Evidence'
  ];

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin-cases`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCases(data.cases);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/admin-cases/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setFormData({
          title: '',
          category: 'IRS',
          description: '',
          client_name: '',
          client_email: '',
          client_phone: ''
        });
        fetchCases();
      }
    } catch (error) {
      console.error('Failed to create case:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="admin-cases-container">
        <div className="loading">Loading cases...</div>
      </div>
    );
  }

  return (
    <div className="admin-cases-container">
      <div className="admin-cases-header">
        <h1>Case File Upload Center</h1>
        <button className="btn-create" onClick={() => setShowModal(true)}>
          + New Case
        </button>
      </div>

      {cases.length === 0 ? (
        <div className="empty-state">
          <p>No cases yet. Create your first case to get started.</p>
        </div>
      ) : (
        <div className="cases-grid">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="case-card"
              onClick={() => setLocation(`/admin/cases/${caseItem.id}`)}
            >
              <div className="case-header">
                <h3>{caseItem.title}</h3>
                <span className="case-category">{caseItem.category}</span>
              </div>
              {caseItem.description && (
                <p className="case-description">{caseItem.description}</p>
              )}
              {caseItem.client_name && (
                <div className="case-client">
                  <strong>Client:</strong> {caseItem.client_name}
                </div>
              )}
              <div className="case-meta">
                <span className="case-status">{caseItem.status}</span>
                <span className="case-date">
                  {new Date(caseItem.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Case</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Case Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., IRS Notice CP2000"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief case description..."
                />
              </div>

              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </div>

              <div className="form-group">
                <label>Client Email</label>
                <input
                  type="email"
                  name="client_email"
                  value={formData.client_email}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </div>

              <div className="form-group">
                <label>Client Phone</label>
                <input
                  type="tel"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

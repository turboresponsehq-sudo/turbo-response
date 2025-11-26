import React, { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import './AdminCaseDetail.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://turboresponsehq.ai';

export default function AdminCaseDetail() {
  const [, params] = useRoute('/admin/cases/:id');
  const [, setLocation] = useLocation();
  const caseId = params?.id;

  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (caseId) {
      fetchCaseData();
      fetchDocuments();
    }
  }, [caseId]);

  const fetchCaseData = async () => {
    try {
      const token = localStorage.getItem('admin_session');
      console.log('[AdminCaseDetail] Fetching case:', caseId);
      console.log('[AdminCaseDetail] Token exists:', !!token);
      console.log('[AdminCaseDetail] API URL:', `${API_BASE}/api/admin/cases/${caseId}`);
      
      if (!token) {
        console.error('[AdminCaseDetail] No auth token found');
        setLocation('/admin/login');
        return;
      }
      
      const response = await fetch(`${API_BASE}/api/admin/cases/${caseId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[AdminCaseDetail] Response status:', response.status);
      
      if (!response.ok) {
        console.error('[AdminCaseDetail] Response not OK:', response.status, response.statusText);
        if (response.status === 401) {
          console.error('[AdminCaseDetail] Unauthorized - redirecting to login');
          localStorage.removeItem('admin_session');
          localStorage.removeItem('admin_user');
          setLocation('/admin/login');
          return;
        }
      }
      
      const data = await response.json();
      console.log('[AdminCaseDetail] Response data:', data);
      
      if (data.success) {
        setCaseData(data.case);
      } else {
        console.error('[AdminCaseDetail] API returned success=false:', data);
      }
    } catch (error) {
      console.error('[AdminCaseDetail] Failed to fetch case:', error);
      alert(`Could not load the case. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('admin_session');
      const response = await fetch(`${API_BASE}/api/admin/cases/${caseId}/documents`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        if (note) {
          formData.append('note', note);
        }

        const token = localStorage.getItem('admin_session');
        const response = await fetch(`${API_BASE}/api/admin/cases/${caseId}/upload`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();
        if (!data.success) {
          console.error('Upload failed:', data.error);
        }
      }

      setNote('');
      fetchDocuments();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const token = localStorage.getItem('admin_session');
      const response = await fetch(`${API_BASE}/api/admin/cases/documents/${docId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleDeleteCase = async () => {
    if (!confirm('Are you sure you want to delete this entire case? This will also delete all associated documents. This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('admin_session');
      const response = await fetch(`${API_BASE}/api/admin/cases/${caseId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Case deleted successfully');
        setLocation('/admin/cases');
      } else {
        alert('Failed to delete case: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete case failed:', error);
      alert('Failed to delete case');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="admin-case-detail-container">
        <div className="loading">Loading case...</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="admin-case-detail-container">
        <div className="error">Case not found</div>
      </div>
    );
  }

  return (
    <div className="admin-case-detail-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="btn-back" onClick={() => setLocation('/admin/cases')}>
          ← Back to Cases
        </button>
        <button 
          className="btn-delete" 
          onClick={handleDeleteCase}
          style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
        >
          🗑️ Delete Case
        </button>
      </div>

      <div className="case-info">
        <h1>{caseData.case_number || caseData.title}</h1>
        <span className="case-category">{caseData.category}</span>
      </div>

      {caseData.case_details && (
        <div className="case-description-box">
          <p>{caseData.case_details}</p>
        </div>
      )}

      {caseData.full_name && (
        <div className="client-info">
          <h3>Client Information</h3>
          <p><strong>Name:</strong> {caseData.full_name}</p>
          {caseData.email && <p><strong>Email:</strong> {caseData.email}</p>}
          {caseData.phone && <p><strong>Phone:</strong> {caseData.phone}</p>}
          {caseData.address && <p><strong>Address:</strong> {caseData.address}</p>}
        </div>
      )}

      {/* Business Intake Information */}
      {caseData.case_type === 'business' && (
        <>
          {(caseData.business_name || caseData.website_url) && (
            <div className="client-info">
              <h3>Business Information</h3>
              {caseData.business_name && <p><strong>Business Name:</strong> {caseData.business_name}</p>}
              {caseData.website_url && <p><strong>Website:</strong> <a href={caseData.website_url} target="_blank" rel="noopener noreferrer">{caseData.website_url}</a></p>}
            </div>
          )}

          {(caseData.instagram_url || caseData.tiktok_url || caseData.facebook_url || caseData.youtube_url || caseData.link_in_bio) && (
            <div className="client-info">
              <h3>Social Media</h3>
              {caseData.instagram_url && <p><strong>Instagram:</strong> <a href={caseData.instagram_url} target="_blank" rel="noopener noreferrer">{caseData.instagram_url}</a></p>}
              {caseData.tiktok_url && <p><strong>TikTok:</strong> <a href={caseData.tiktok_url} target="_blank" rel="noopener noreferrer">{caseData.tiktok_url}</a></p>}
              {caseData.facebook_url && <p><strong>Facebook:</strong> <a href={caseData.facebook_url} target="_blank" rel="noopener noreferrer">{caseData.facebook_url}</a></p>}
              {caseData.youtube_url && <p><strong>YouTube:</strong> <a href={caseData.youtube_url} target="_blank" rel="noopener noreferrer">{caseData.youtube_url}</a></p>}
              {caseData.link_in_bio && <p><strong>Link in Bio:</strong> <a href={caseData.link_in_bio} target="_blank" rel="noopener noreferrer">{caseData.link_in_bio}</a></p>}
            </div>
          )}

          {(caseData.what_you_sell || caseData.ideal_customer || caseData.biggest_struggle) && (
            <div className="client-info">
              <h3>Business Details</h3>
              {caseData.what_you_sell && <p><strong>What You Sell:</strong> {caseData.what_you_sell}</p>}
              {caseData.ideal_customer && <p><strong>Ideal Customer:</strong> {caseData.ideal_customer}</p>}
              {caseData.biggest_struggle && <p><strong>Biggest Struggle:</strong> {caseData.biggest_struggle}</p>}
            </div>
          )}

          {(caseData.short_term_goal || caseData.long_term_vision) && (
            <div className="client-info">
              <h3>Goals & Vision</h3>
              {caseData.short_term_goal && <p><strong>Short-term Goal:</strong> {caseData.short_term_goal}</p>}
              {caseData.long_term_vision && <p><strong>Long-term Vision:</strong> {caseData.long_term_vision}</p>}
            </div>
          )}
        </>
      )}

      {/* Consumer Case Information */}
      {caseData.case_type === 'consumer' && (
        <>
          {(caseData.amount || caseData.deadline) && (
            <div className="client-info">
              <h3>Case Details</h3>
              {caseData.amount && <p><strong>Amount:</strong> ${caseData.amount}</p>}
              {caseData.deadline && <p><strong>Deadline:</strong> {new Date(caseData.deadline).toLocaleDateString()}</p>}
            </div>
          )}

          {/* AI Analysis Section */}
          {(caseData.violations || caseData.laws_cited || caseData.recommended_actions || caseData.summary) && (
            <div className="client-info" style={{ backgroundColor: '#f0f9ff', borderLeft: '4px solid #3b82f6' }}>
              <h3>🤖 AI Analysis</h3>
              {caseData.summary && <p><strong>Summary:</strong> {caseData.summary}</p>}
              {caseData.violations && <p><strong>Potential Violations:</strong> {caseData.violations}</p>}
              {caseData.laws_cited && <p><strong>Laws Cited:</strong> {caseData.laws_cited}</p>}
              {caseData.recommended_actions && <p><strong>Recommended Actions:</strong> {caseData.recommended_actions}</p>}
              {caseData.urgency_level && <p><strong>Urgency Level:</strong> {caseData.urgency_level}</p>}
              {caseData.estimated_value && <p><strong>Estimated Value:</strong> ${caseData.estimated_value}</p>}
              {caseData.success_probability && <p><strong>Success Probability:</strong> {caseData.success_probability}%</p>}
            </div>
          )}
        </>
      )}

      <div className="upload-section">
        <h2>Upload Documents</h2>
        <div
          className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
          onDrop={handleDrop}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.heic,.webp,.docx,.txt"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <div className="upload-icon">📁</div>
          <h3>Drag & drop files here</h3>
          <p>or click to browse</p>
          <p className="upload-hint">
            Supports: PDF, Images (JPG, PNG, HEIC, WebP), DOCX, TXT
          </p>
        </div>

        <div className="note-input-group">
          <label>Add a note (optional)</label>
          <textarea
            className="note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add context or notes for this document..."
            rows="2"
          />
        </div>

        {uploading && (
          <div className="upload-progress">
            <div className="progress-spinner"></div>
            <span>Uploading...</span>
          </div>
        )}
      </div>

      <div className="documents-section">
        <h2>Uploaded Documents ({documents.length})</h2>
        {documents.length === 0 ? (
          <div className="empty-state">
            <p>No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="documents-grid">
            {documents.map((doc) => (
              <div key={doc.id} className="document-card">
                <div className="document-header">
                  <div className="file-icon">📄</div>
                  <div className="document-info">
                    <h4 className="document-name">{doc.file_name}</h4>
                    <p className="document-size">{formatFileSize(doc.file_size)}</p>
                  </div>
                </div>

                {doc.note && (
                  <div className="document-note">
                    <strong>Note:</strong> {doc.note}
                  </div>
                )}

                <div className="document-meta">
                  <p className="document-date">
                    {new Date(doc.uploaded_at).toLocaleString()}
                  </p>
                </div>

                <div className="document-actions">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-download"
                  >
                    Download
                  </a>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

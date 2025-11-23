import React, { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import './AdminCaseDetail.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

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
      const response = await fetch(`${API_BASE}/api/admin-cases/${caseId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCaseData(data.case);
      }
    } catch (error) {
      console.error('Failed to fetch case:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('admin_session');
      const response = await fetch(`${API_BASE}/api/admin-cases/${caseId}/documents`, {
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
        const response = await fetch(`${API_BASE}/api/admin-cases/${caseId}/upload`, {
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
      const response = await fetch(`${API_BASE}/api/admin-cases/documents/${docId}`, {
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
      const response = await fetch(`${API_BASE}/api/admin-cases/${caseId}`, {
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
        <h1>{caseData.title}</h1>
        <span className="case-category">{caseData.category}</span>
      </div>

      {caseData.description && (
        <div className="case-description-box">
          <p>{caseData.description}</p>
        </div>
      )}

      {caseData.client_name && (
        <div className="client-info">
          <h3>Client Information</h3>
          <p><strong>Name:</strong> {caseData.client_name}</p>
          {caseData.client_email && <p><strong>Email:</strong> {caseData.client_email}</p>}
          {caseData.client_phone && <p><strong>Phone:</strong> {caseData.client_phone}</p>}
        </div>
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

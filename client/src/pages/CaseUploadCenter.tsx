import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import './CaseUploadCenter.css';

interface UploadedDocument {
  id: number;
  case_type: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  extracted_data: any;
  created_at: string;
}

const CASE_TYPES = [
  'IRS',
  'Debt Collection',
  'Credit Reporting',
  'Fraud',
  'Repo',
  'Banking Reports (EWS/Chex)',
  'Unemployment',
  'Business Disputes',
  'General Evidence',
];

export default function CaseUploadCenter() {
  const [, setLocation] = useLocation();
  const [files, setFiles] = useState<File[]>([]);
  const [caseType, setCaseType] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError('');
    const uploaded: UploadedDocument[] = [];

    try {
      const token = localStorage.getItem('admin_session');

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        if (caseType) formData.append('caseType', caseType);
        if (description) formData.append('description', description);

        const response = await fetch('/api/case-upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        }

        const data = await response.json();
        uploaded.push(data.document);
      }

      setUploadedDocs(uploaded);
      setFiles([]);
      setCaseType('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="case-upload-page">
      <div className="bg-animation">
        <div className="bg-grid"></div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="nav-container">
          <div className="logo" onClick={() => setLocation('/admin')}>
            <span className="logo-icon">⚡</span>
            <span className="logo-text">CASE UPLOAD CENTER</span>
          </div>
          <button className="back-button" onClick={() => setLocation('/admin')}>
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="upload-container">
          <div className="upload-header">
            <h1 className="upload-title">📁 Upload Case Documents</h1>
            <p className="upload-subtitle">
              Drag & drop files, or use your camera. AI will detect case type and extract key information.
            </p>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Upload Area */}
          <div
            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div className="drop-zone-content">
              <div className="upload-icon">📤</div>
              <h3>Drop files here or click to browse</h3>
              <p>Supports: Images (JPG, PNG, HEIC) and PDFs</p>
              <p className="mobile-hint">📱 Mobile: Tap to use camera or photo library</p>
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="selected-files">
              <h3>Selected Files ({files.length})</h3>
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <span className="file-icon">
                        {file.type.startsWith('image/') ? '🖼️' : '📄'}
                      </span>
                      <div className="file-details">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    <button
                      className="remove-button"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Metadata */}
          <div className="metadata-section">
            <h3>Optional Information</h3>
            <p className="metadata-hint">
              Leave blank for AI auto-detection, or specify manually
            </p>

            <div className="form-group">
              <label htmlFor="caseType">Case Type</label>
              <select
                id="caseType"
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                disabled={uploading}
              >
                <option value="">🤖 AI Auto-Detect</option>
                {CASE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Short Note</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional: Add context or notes about these documents..."
                rows={3}
                disabled={uploading}
              />
            </div>
          </div>

          {/* Upload Button */}
          <div className="upload-actions">
            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading ? (
                <>
                  <span className="spinner"></span>
                  Uploading {files.length} file(s)...
                </>
              ) : (
                <>
                  <span>🚀 Upload Documents</span>
                  <span className="arrow">→</span>
                </>
              )}
            </button>
          </div>

          {/* Upload Results */}
          {uploadedDocs.length > 0 && (
            <div className="upload-results">
              <div className="success-header">
                <span className="success-icon">✅</span>
                <h3>Successfully Uploaded {uploadedDocs.length} Document(s)</h3>
              </div>
              <div className="results-list">
                {uploadedDocs.map((doc) => (
                  <div key={doc.id} className="result-item">
                    <div className="result-header">
                      <span className="result-icon">
                        {doc.mime_type.startsWith('image/') ? '🖼️' : '📄'}
                      </span>
                      <div className="result-info">
                        <span className="result-name">{doc.file_name}</span>
                        <span className="result-type">{doc.case_type}</span>
                      </div>
                    </div>
                    {doc.extracted_data?.summary && (
                      <div className="result-summary">
                        <strong>AI Summary:</strong> {doc.extracted_data.summary}
                      </div>
                    )}
                    {doc.extracted_data?.amount && (
                      <div className="result-detail">
                        <strong>Amount:</strong> {doc.extracted_data.amount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="view-all-button"
                onClick={() => setLocation('/admin/case-files')}
              >
                View All Case Files →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

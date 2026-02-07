/**
 * Admin Brain Upload - Document Management
 * Mobile-friendly interface for uploading and managing Brain System documents
 */

import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminBrainUpload.css";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://turboresponsehq.ai";
const BRAIN_ACCESS_TOKEN = "TR-SECURE-2025";

interface BrainDocument {
  id: number;
  title: string;
  description: string | null;
  file_name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  source: string;
  created_at: string;
  indexing_status?: string;
  chunk_count?: number;
  indexed_at?: string;
}

interface IndexingStatus {
  total: number;
  indexed: number;
  pending: number;
  indexing: number;
  failed: number;
}

export default function AdminBrainUpload() {
  const [documents, setDocuments] = useState<BrainDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [indexingStatus, setIndexingStatus] = useState<IndexingStatus | null>(null);
  const [bulkIndexing, setBulkIndexing] = useState(false);

  // Check admin authentication
  useEffect(() => {
    const storedToken = localStorage.getItem("admin_session");
    if (!storedToken) {
      window.location.replace("/admin/login");
      return;
    }
    fetchDocuments();
    fetchIndexingStatus();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/brain/list`, {
        headers: {
          "x-access-token": BRAIN_ACCESS_TOKEN,
        },
      });
      setDocuments(res.data.documents || []);
    } catch (err: any) {
      console.error("Failed to fetch documents:", err);
      setUploadStatus(`Error loading documents: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndexingStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/brain/index/status`, {
        headers: {
          "x-access-token": BRAIN_ACCESS_TOKEN,
        },
      });
      setIndexingStatus(res.data);
    } catch (err: any) {
      console.error("Failed to fetch indexing status:", err);
    }
  };

  const handleBulkIndex = async () => {
    if (!confirm(`Start bulk indexing of all unindexed documents?\n\nThis will process documents in the background and may take several minutes.`)) {
      return;
    }

    try {
      setBulkIndexing(true);
      setUploadStatus("🔄 Starting bulk indexing...");

      const res = await axios.post(`${API_URL}/api/brain/index/bulk`, {}, {
        headers: {
          "x-access-token": BRAIN_ACCESS_TOKEN,
        },
      });

      if (res.data.success) {
        setUploadStatus(`✅ Bulk indexing started! Processing ${res.data.total} documents in background.`);
        // Poll for status updates
        const interval = setInterval(async () => {
          await fetchIndexingStatus();
          const status = await axios.get(`${API_URL}/api/brain/index/status`, {
            headers: { "x-access-token": BRAIN_ACCESS_TOKEN }
          });
          if (status.data.indexing === 0 && status.data.pending === 0) {
            clearInterval(interval);
            setBulkIndexing(false);
            setUploadStatus(`✅ Bulk indexing complete! ${status.data.indexed} documents indexed.`);
            await fetchDocuments();
          }
        }, 5000); // Check every 5 seconds
      }
    } catch (err: any) {
      console.error("Bulk indexing error:", err);
      setUploadStatus(`❌ Bulk indexing failed: ${err.response?.data?.error || err.message}`);
      setBulkIndexing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Auto-fill title from filename if empty
      if (!title) {
        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      setUploadStatus("Uploading...");

      const formData = new FormData();
      formData.append("file", selectedFile);
      if (title) formData.append("title", title);
      if (description) formData.append("description", description);

      const res = await axios.post(`${API_URL}/api/brain/upload`, formData, {
        headers: {
          "x-access-token": BRAIN_ACCESS_TOKEN,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setUploadStatus("✅ Upload complete!");
        setSelectedFile(null);
        setTitle("");
        setDescription("");
        // Clear file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        // Refresh document list
        await fetchDocuments();
      } else {
        setUploadStatus(`❌ Upload failed: ${res.data.error}`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadStatus(`❌ Upload failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number, fileName: string) => {
    if (!confirm(`Delete "${fileName}"?`)) return;

    try {
      await axios.delete(`${API_URL}/api/brain/delete/${id}`, {
        headers: {
          "x-access-token": BRAIN_ACCESS_TOKEN,
        },
      });
      setUploadStatus(`✅ Deleted "${fileName}"`);
      await fetchDocuments();
    } catch (err: any) {
      console.error("Delete error:", err);
      setUploadStatus(`❌ Delete failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="admin-brain-upload">
      <div className="brain-header">
        <h1>🧠 Turbo Brain – Document Upload</h1>
        <a href="/admin" className="back-link">← Back to Dashboard</a>
      </div>

      {/* Indexing Status Section */}
      {indexingStatus && (
        <div className="indexing-status-section">
          <h2>📊 RAG Indexing Status</h2>
          <div className="status-grid">
            <div className="status-card">
              <div className="status-label">Total Documents</div>
              <div className="status-value">{indexingStatus.total}</div>
            </div>
            <div className="status-card success">
              <div className="status-label">Indexed</div>
              <div className="status-value">{indexingStatus.indexed}</div>
            </div>
            <div className="status-card warning">
              <div className="status-label">Pending</div>
              <div className="status-value">{indexingStatus.pending}</div>
            </div>
            <div className="status-card info">
              <div className="status-label">Processing</div>
              <div className="status-value">{indexingStatus.indexing}</div>
            </div>
            <div className="status-card error">
              <div className="status-label">Failed</div>
              <div className="status-value">{indexingStatus.failed}</div>
            </div>
          </div>
          <button
            onClick={handleBulkIndex}
            disabled={bulkIndexing || indexingStatus.pending === 0}
            className="bulk-index-button"
          >
            {bulkIndexing ? "🔄 Indexing in Progress..." : `🚀 Bulk Index ${indexingStatus.pending} Documents`}
          </button>
          {indexingStatus.pending === 0 && indexingStatus.indexing === 0 && (
            <div className="all-indexed-message">✅ All documents are indexed!</div>
          )}
        </div>
      )}

      {/* Upload Section */}
      <div className="upload-section">
        <h2>Upload Document</h2>
        <div className="upload-form">
          <div className="form-group">
            <label htmlFor="file-input">Select File</label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.doc,.docx"
              disabled={uploading}
            />
            {selectedFile && (
              <div className="file-info">
                Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="title-input">Title (optional)</label>
            <input
              id="title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description-input">Description (optional)</label>
            <textarea
              id="description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Document description"
              rows={3}
              disabled={uploading}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="upload-button"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>

          {uploadStatus && (
            <div className={`upload-status ${uploadStatus.includes("❌") ? "error" : "success"}`}>
              {uploadStatus}
            </div>
          )}
        </div>
      </div>

      {/* Document List Section */}
      <div className="documents-section">
        <h2>Uploaded Documents ({documents.length})</h2>
        {loading ? (
          <div className="loading">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="empty-state">No documents uploaded yet</div>
        ) : (
          <div className="documents-table-wrapper">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        {doc.title || doc.file_name}
                      </a>
                      {doc.description && (
                        <div className="doc-description">{doc.description}</div>
                      )}
                    </td>
                    <td>{doc.mime_type}</td>
                    <td>{formatBytes(doc.size_bytes)}</td>
                    <td>{formatDate(doc.created_at)}</td>
                    <td>{doc.source}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(doc.id, doc.file_name)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

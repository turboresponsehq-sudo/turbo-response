import { useState, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, Image, File, Trash2, Download, ArrowLeft, Camera } from 'lucide-react';
import './CaseFileUpload.css';

export default function CaseFileUpload() {
  const [, params] = useRoute('/admin/case/:id/files');
  const [, setLocation] = useLocation();
  const caseId = params?.id ? parseInt(params.id) : 0;
  
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [note, setNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch case details
  const { data: caseData } = trpc.case.getById.useQuery({ id: caseId });
  
  // Fetch case documents
  const { data: documents, refetch } = trpc.case.getDocuments.useQuery({ caseId });
  
  // Upload mutation
  const uploadMutation = trpc.case.uploadDocument.useMutation({
    onSuccess: () => {
      refetch();
      setNote('');
      setUploading(false);
    },
    onError: (error) => {
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
    },
  });

  // Delete mutation
  const deleteMutation = trpc.case.deleteDocument.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64Content = base64Data.split(',')[1]; // Remove data:image/png;base64, prefix
        
        try {
          await uploadMutation.mutateAsync({
            caseId,
            fileName: file.name,
            fileData: base64Content,
            mimeType: file.type,
            note: note || undefined,
          });
        } catch (error) {
          console.error('Upload error:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="file-icon" />;
    if (mimeType === 'application/pdf') return <FileText className="file-icon" />;
    return <File className="file-icon" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="case-file-upload-container">
      {/* Header */}
      <div className="case-file-header">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/admin/cases')}
          className="back-btn"
        >
          <ArrowLeft className="btn-icon" />
          Back to Cases
        </Button>
        
        <div className="case-info">
          <h1 className="case-title">{caseData?.title || 'Loading...'}</h1>
          {caseData?.category && (
            <span className="case-category">{caseData.category}</span>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <Card className="upload-card">
        <div
          className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="upload-icon" />
          <h3>Drag & Drop Files Here</h3>
          <p>or click to browse</p>
          <p className="upload-hint">Supports: PDF, Images (JPG, PNG, HEIC, WebP), DOCX, TXT</p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.heic,.webp,.doc,.docx,.txt"
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
          />
        </div>

        {/* Mobile Camera Button */}
        <div className="mobile-camera-btn">
          <Button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.capture = 'environment';
              input.multiple = true;
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                handleFileSelect(target.files);
              };
              input.click();
            }}
          >
            <Camera className="btn-icon" />
            Take Photo
          </Button>
        </div>

        {/* Note Input */}
        <div className="note-input-group">
          <label>Add Note/Tag (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., IRS Notice 2024, Bank Statement March"
            className="note-input"
          />
        </div>

        {uploading && (
          <div className="upload-progress">
            <div className="progress-spinner"></div>
            <span>Uploading files...</span>
          </div>
        )}
      </Card>

      {/* Documents List */}
      <div className="documents-section">
        <h2 className="section-title">
          Uploaded Documents ({documents?.length || 0})
        </h2>

        {documents && documents.length === 0 && (
          <div className="empty-state">
            <FileText className="empty-icon" />
            <p>No documents uploaded yet</p>
          </div>
        )}

        <div className="documents-grid">
          {documents?.map((doc) => (
            <Card key={doc.id} className="document-card">
              <div className="document-header">
                {getFileIcon(doc.mimeType || '')}
                <div className="document-info">
                  <h4 className="document-name">{doc.fileName}</h4>
                  <span className="document-size">
                    {formatFileSize(doc.fileSize || 0)}
                  </span>
                </div>
              </div>

              {doc.note && (
                <p className="document-note">{doc.note}</p>
              )}

              <div className="document-meta">
                <span className="document-date">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="document-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(doc.fileUrl, '_blank')}
                >
                  <Download className="action-icon" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this document?')) {
                      deleteMutation.mutate({ id: doc.id });
                    }
                  }}
                >
                  <Trash2 className="action-icon" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

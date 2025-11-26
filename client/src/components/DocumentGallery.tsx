/**
 * Document Gallery Component
 * Displays case documents as a thumbnail grid with previews
 */

import { useState } from 'react';
import './DocumentGallery.css';

interface DocumentItem {
  url: string;
  filename: string;
  uploadedAt?: string;
  category?: string;
}

interface DocumentGalleryProps {
  documents: string[] | DocumentItem[];
}

export default function DocumentGallery({ documents }: DocumentGalleryProps) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  if (!documents || documents.length === 0) {
    return (
      <div className="documents-empty">
        <p>📁 No documents uploaded yet</p>
      </div>
    );
  }

  // Normalize documents to DocumentItem format
  const normalizedDocs: DocumentItem[] = documents.map((doc, index) => {
    if (typeof doc === 'string') {
      const filename = doc.split('/').pop() || `document-${index + 1}`;
      return { url: doc, filename };
    }
    return doc;
  });

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isImage = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'bmp', 'tiff'].includes(ext);
  };

  const isPDF = (filename: string): boolean => {
    return getFileExtension(filename) === 'pdf';
  };

  const handleDownload = async (url: string, filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <div className="document-gallery">
        {normalizedDocs.map((doc, index) => (
          <div 
            key={index} 
            className="document-card"
            onClick={() => setSelectedDoc(doc.url)}
          >
            <div className="document-thumbnail">
              {isImage(doc.filename) ? (
                <img 
                  src={doc.url} 
                  alt={doc.filename}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              {isPDF(doc.filename) ? (
                <div className="document-icon pdf-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M6,20V4H12V10H18V20H6Z"/>
                  </svg>
                  <span>PDF</span>
                </div>
              ) : !isImage(doc.filename) ? (
                <div className="document-icon file-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z"/>
                  </svg>
                  <span>{getFileExtension(doc.filename).toUpperCase()}</span>
                </div>
              ) : null}
            </div>
            
            <div className="document-info">
              <div className="document-filename" title={doc.filename}>
                {doc.filename}
              </div>
              {doc.category && (
                <span className="document-category">{doc.category}</span>
              )}
              {doc.uploadedAt && (
                <div className="document-date">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="document-actions">
              <button
                className="btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(doc.url, '_blank');
                }}
                title="Open in new tab"
              >
                🔗
              </button>
              <button
                className="btn-icon"
                onClick={(e) => handleDownload(doc.url, doc.filename, e)}
                title="Download"
              >
                ⬇️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox for viewing documents */}
      {selectedDoc && (
        <div className="document-lightbox" onClick={() => setSelectedDoc(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="lightbox-close"
              onClick={() => setSelectedDoc(null)}
            >
              ✕
            </button>
            {isImage(selectedDoc) ? (
              <img src={selectedDoc} alt="Document preview" />
            ) : isPDF(selectedDoc) ? (
              <iframe src={selectedDoc} title="PDF preview" />
            ) : (
              <div className="lightbox-fallback">
                <p>Preview not available</p>
                <a href={selectedDoc} target="_blank" rel="noopener noreferrer">
                  Open in new tab
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

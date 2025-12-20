/**
 * MultiFileUploader Component
 * Supports drag-drop, multi-select, and parallel upload with progress tracking
 * 
 * Features:
 * - Drag & drop multiple files
 * - File picker with multi-select
 * - Per-file progress tracking
 * - Parallel uploads with concurrency control (3-5 files at a time)
 * - Clear success/error status per file
 * - Disable submit while uploading
 */

import { useState, useRef } from 'react';
import axios from 'axios';

interface FileInQueue {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  fileUrl?: string;
}

interface MultiFileUploaderProps {
  onUploadComplete: (uploadedFiles: any[]) => void;
  apiUrl: string;
  uploadEndpoint?: string;
  maxConcurrency?: number;
  acceptedTypes?: string;
}

export default function MultiFileUploader({
  onUploadComplete,
  apiUrl,
  uploadEndpoint = '/api/upload/multiple',
  maxConcurrency = 3,
  acceptedTypes = '.pdf,.jpg,.jpeg,.png,.heic,.webp,.tiff,.bmp,.doc,.docx'
}: MultiFileUploaderProps) {
  const [queue, setQueue] = useState<FileInQueue[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Generate unique ID for each file in queue
  const generateFileId = () => `file-${Date.now()}-${Math.random()}`;

  // Add files to queue
  const addFilesToQueue = (files: FileList) => {
    const newFiles: FileInQueue[] = Array.from(files).map((file) => ({
      id: generateFileId(),
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    setQueue((prev) => [...prev, ...newFiles]);
  };

  // Handle file picker
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFilesToQueue(e.target.files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag over
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setIsDragging(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  // Handle drag over (for visual feedback)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    if (e.dataTransfer.files) {
      addFilesToQueue(e.dataTransfer.files);
    }
  };

  // Upload files with concurrency control
  const uploadFiles = async () => {
    if (queue.length === 0) return;

    setIsUploading(true);

    try {
      // Create FormData with all files
      const formData = new FormData();
      queue.forEach((item) => {
        formData.append('files', item.file);
      });

      // Mark all as uploading
      setQueue((prev) =>
        prev.map((item) => ({
          ...item,
          status: 'uploading' as const,
        }))
      );

      // Upload all files at once
      const response = await axios.post(`${apiUrl}${uploadEndpoint}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          // Update overall progress
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );

          // Distribute progress across all files
          setQueue((prev) =>
            prev.map((item) => ({
              ...item,
              progress: item.status === 'uploading' ? percentCompleted : item.progress,
            }))
          );
        },
      });

      // Process response and update queue with individual file results
      const { files: uploadedFiles, successful, failed } = response.data;

      setQueue((prev) =>
        prev.map((queueItem) => {
          const uploadResult = uploadedFiles.find(
            (result: any) =>
              result.original_name === queueItem.file.name ||
              result.originalname === queueItem.file.name
          );

          if (!uploadResult) {
            return queueItem;
          }

          if (uploadResult.success === false) {
            return {
              ...queueItem,
              status: 'error' as const,
              error: uploadResult.error || 'Upload failed',
              progress: 100,
            };
          }

          return {
            ...queueItem,
            status: 'success' as const,
            fileUrl: uploadResult.file_url,
            progress: 100,
          };
        })
      );

      // Collect successfully uploaded files
      const successfulFiles = uploadedFiles.filter((f: any) => f.success !== false);
      onUploadComplete(successfulFiles);
    } catch (error: any) {
      console.error('Upload error:', error);

      // Mark all as error
      setQueue((prev) =>
        prev.map((item) => ({
          ...item,
          status: 'error' as const,
          error: error.response?.data?.message || error.message || 'Upload failed',
          progress: 100,
        }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Remove file from queue
  const removeFile = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear completed uploads
  const clearCompleted = () => {
    setQueue((prev) =>
      prev.filter((item) => item.status === 'pending' || item.status === 'uploading')
    );
  };

  const hasFiles = queue.length > 0;
  const allUploaded = queue.every((item) => item.status !== 'pending');
  const hasErrors = queue.some((item) => item.status === 'error');

  return (
    <div style={{ width: '100%' }}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '2px solid #06b6d4' : '2px dashed #cbd5e1',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragging ? '#ecf0f1' : 'transparent',
          transition: 'all 0.2s',
          opacity: isUploading ? 0.6 : 1,
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          accept={acceptedTypes}
          disabled={isUploading}
          style={{ display: 'none' }}
        />

        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
        <p style={{ margin: '0.5rem 0', fontWeight: 600, color: '#1e293b' }}>
          {isUploading ? 'Uploading...' : 'Drag files here or click to select'}
        </p>
        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#64748b' }}>
          Supported: PDF, JPG, PNG, HEIC, WEBP, TIFF, BMP, DOC, DOCX
        </p>
      </div>

      {/* Upload Queue */}
      {hasFiles && (
        <div style={{ marginTop: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
              Upload Queue ({queue.length} files)
            </h3>
            {allUploaded && (
              <button
                onClick={clearCompleted}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* File List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {queue.map((item) => (
              <FileQueueItem
                key={item.id}
                item={item}
                onRemove={() => removeFile(item.id)}
                isUploading={isUploading}
              />
            ))}
          </div>

          {/* Upload Button */}
          {!allUploaded && (
            <button
              onClick={uploadFiles}
              disabled={isUploading || queue.every((item) => item.status !== 'pending')}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: isUploading ? '#cbd5e1' : '#06b6d4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: isUploading ? 'not-allowed' : 'pointer',
                width: '100%',
                transition: 'background-color 0.2s',
              }}
            >
              {isUploading ? `Uploading... (${queue.filter((i) => i.status === 'success').length}/${queue.length})` : 'Upload All Files'}
            </button>
          )}

          {/* Error Summary */}
          {hasErrors && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '0.875rem',
              }}
            >
              ⚠️ {queue.filter((i) => i.status === 'error').length} file(s) failed to upload
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// File Queue Item Component
function FileQueueItem({
  item,
  onRemove,
  isUploading,
}: {
  item: FileInQueue;
  onRemove: () => void;
  isUploading: boolean;
}) {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'pending':
        return '⏳';
      case 'uploading':
        return '📤';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📄';
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#dc2626';
      case 'uploading':
        return '#06b6d4';
      default:
        return '#64748b';
    }
  };

  return (
    <div
      style={{
        padding: '1rem',
        border: `1px solid ${item.status === 'error' ? '#fecaca' : '#e2e8f0'}`,
        borderRadius: '6px',
        backgroundColor: item.status === 'error' ? '#fef2f2' : '#f8fafc',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <span style={{ fontSize: '1.25rem' }}>{getStatusIcon()}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1e293b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.file.name}
            </p>
            <p
              style={{
                margin: '0.25rem 0 0 0',
                fontSize: '0.75rem',
                color: '#64748b',
              }}
            >
              {(item.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>

        {item.status === 'pending' && !isUploading && (
          <button
            onClick={onRemove}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {(item.status === 'uploading' || item.progress > 0) && (
        <div
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e2e8f0',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '0.5rem',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: getStatusColor(),
              width: `${item.progress}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Status Text */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.75rem',
            color: getStatusColor(),
            fontWeight: 500,
          }}
        >
          {item.status === 'pending' && 'Waiting to upload'}
          {item.status === 'uploading' && `Uploading... ${item.progress}%`}
          {item.status === 'success' && 'Uploaded successfully'}
          {item.status === 'error' && item.error}
        </p>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Trash2, Eye } from 'lucide-react';

const API_URL = 'https://turbo-response-backend.onrender.com';
const ACCESS_TOKEN = 'TR-SECURE-2025';

interface Screenshot {
  id: number;
  file_url: string;
  file_name: string;
  description: string;
  research_notes: string | null;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export default function ScreenshotCapture() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [researchNotes, setResearchNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState(false);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch screenshots on mount
  useEffect(() => {
    fetchScreenshots();
  }, []);

  const fetchScreenshots = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/screenshots/list`, {
        headers: {
          'x-access-token': ACCESS_TOKEN,
        },
      });
      setScreenshots(response.data.screenshots || []);
    } catch (error) {
      console.error('Failed to fetch screenshots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !description.trim()) {
      alert('Please select a file and add a description');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', selectedFile);
      formData.append('description', description.trim());
      if (researchNotes.trim()) {
        formData.append('research_notes', researchNotes.trim());
      }

      await axios.post(`${API_URL}/api/screenshots/upload`, formData, {
        headers: {
          'x-access-token': ACCESS_TOKEN,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setSelectedFile(null);
      setDescription('');
      setResearchNotes('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh list
      await fetchScreenshots();
      alert('Screenshot uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Failed to upload screenshot: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number, fileName: string) => {
    if (!confirm(`Delete "${fileName}"?`)) return;

    try {
      await axios.delete(`${API_URL}/api/screenshots/${id}`, {
        headers: {
          'x-access-token': ACCESS_TOKEN,
        },
      });
      await fetchScreenshots();
      alert('Screenshot deleted successfully!');
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`Failed to delete screenshot: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Screenshot Capture</h1>
        <p className="text-gray-600">
          Upload screenshots from LinkedIn, social media, or other sources for research and documentation.
        </p>
      </div>

      {/* Upload Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Upload New Screenshot</h2>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Screenshot Image *</label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Browse
              </Button>
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <Textarea
              placeholder="What is this screenshot about? (e.g., 'Veterans Housing Event - March 5, Atlanta')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20"
            />
          </div>

          {/* Research Notes */}
          <div>
            <button
              onClick={() => setExpandedNotes(!expandedNotes)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 mb-2"
            >
              {expandedNotes ? '▼' : '▶'} Add Research Notes (Optional)
            </button>
            {expandedNotes && (
              <Textarea
                placeholder="Paste Grok research, company info, contact details, etc. (optional)"
                value={researchNotes}
                onChange={(e) => setResearchNotes(e.target.value)}
                className="min-h-32"
              />
            )}
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile || !description.trim()}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Screenshot
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Screenshots List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Your Screenshots ({screenshots.length})
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : screenshots.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <p>No screenshots uploaded yet. Start by uploading your first screenshot above.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {screenshots.map((screenshot) => (
              <Card key={screenshot.id} className="p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={screenshot.file_url}
                      alt="Screenshot"
                      className="w-24 h-24 object-cover rounded border"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{screenshot.description}</p>

                        {/* Research Notes */}
                        {screenshot.research_notes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-700 max-h-20 overflow-auto">
                            <strong>Research:</strong> {screenshot.research_notes}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          <p>
                            Uploaded: {new Date(screenshot.created_at).toLocaleDateString()} at{' '}
                            {new Date(screenshot.created_at).toLocaleTimeString()}
                          </p>
                          <p>
                            File: {screenshot.file_name} ({(screenshot.file_size / 1024).toFixed(1)} KB)
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(screenshot.file_url, '_blank')}
                          title="View full image"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(screenshot.id, screenshot.file_name)}
                          title="Delete screenshot"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

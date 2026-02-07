import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Trash2, Save, Eye } from 'lucide-react';

export default function ScreenshotCapture() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [researchNotes, setResearchNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const uploadMutation = trpc.screenshots.upload.useMutation();
  const listQuery = trpc.screenshots.list.useQuery();
  const deleteMutation = trpc.screenshots.delete.useMutation();
  const saveMutation = trpc.screenshots.save.useMutation();

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
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        await uploadMutation.mutateAsync({
          imageBase64: base64,
          mimeType: selectedFile.type,
          description: description.trim(),
          researchNotes: researchNotes.trim() || undefined,
        });

        // Reset form
        setSelectedFile(null);
        setDescription('');
        setResearchNotes('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Refresh list
        await utils.screenshots.list.invalidate();
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload screenshot');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this screenshot?')) return;

    try {
      await deleteMutation.mutateAsync({ id });
      await utils.screenshots.list.invalidate();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete screenshot');
    }
  };

  const handleSave = async (id: number) => {
    try {
      await saveMutation.mutateAsync({ id });
      await utils.screenshots.list.invalidate();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save screenshot');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      grant: 'bg-green-100 text-green-800',
      partnership: 'bg-blue-100 text-blue-800',
      lead: 'bg-purple-100 text-purple-800',
      alert: 'bg-red-100 text-red-800',
      event: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Screenshot Capture</h1>
        <p className="text-gray-600">
          Upload screenshots from LinkedIn, social media, or other sources. The system will extract text, dates, contacts, and research notes.
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
            onTouchEnd={(e) => {
              if (!isUploading && selectedFile && description.trim()) {
                e.preventDefault();
                handleUpload();
              }
            }}
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
          Your Screenshots ({listQuery.data?.data?.length || 0})
        </h2>

        {listQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : listQuery.data?.data?.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <p>No screenshots uploaded yet. Start by uploading your first screenshot above.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {listQuery.data?.data?.map((screenshot) => (
              <Card key={screenshot.id} className="p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={screenshot.imageUrl}
                      alt="Screenshot"
                      className="w-24 h-24 object-cover rounded border"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{screenshot.description}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge className={getCategoryColor(screenshot.category)}>
                            {screenshot.category}
                          </Badge>
                          {screenshot.isSaved && (
                            <Badge variant="outline" className="bg-green-50">
                              ✓ Saved
                            </Badge>
                          )}
                        </div>

                        {/* Extracted Data */}
                        {screenshot.extractedText && (
                          <div className="mt-3 text-xs text-gray-600 space-y-1">
                            {screenshot.extractedDates && (
                              <p>
                                <strong>Dates:</strong> {screenshot.extractedDates}
                              </p>
                            )}
                            {screenshot.extractedContacts && (
                              <p>
                                <strong>Contacts:</strong>{' '}
                                {typeof screenshot.extractedContacts === 'string'
                                  ? screenshot.extractedContacts.substring(0, 100) + '...'
                                  : 'Found'}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Research Notes */}
                        {screenshot.researchNotes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-700 max-h-20 overflow-hidden">
                            <strong>Research:</strong> {screenshot.researchNotes.substring(0, 150)}...
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          <p>
                            Uploaded: {new Date(screenshot.createdAt).toLocaleDateString()}
                          </p>
                          <p>
                            Expires: {new Date(screenshot.expiresAt).toLocaleDateString()}
                            {screenshot.isSaved ? ' (Saved - No auto-delete)' : ' (Auto-delete)'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(screenshot.imageUrl, '_blank')}
                          title="View full image"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!screenshot.isSaved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSave(screenshot.id)}
                            title="Save to prevent auto-delete"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(screenshot.id)}
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

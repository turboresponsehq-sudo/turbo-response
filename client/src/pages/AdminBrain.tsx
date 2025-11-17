import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  Brain,
  BarChart3,
  Loader2,
  X
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Domain options
const DOMAINS = [
  { value: 'consumer-rights', label: 'Consumer Rights' },
  { value: 'business-client', label: 'Business Client' },
  { value: 'internal-strategy', label: 'Internal Strategy' },
  { value: 'legal', label: 'Legal' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'automation', label: 'Automation' },
  { value: 'training', label: 'Training' },
  { value: 'industry-specific', label: 'Industry Specific' },
];

// Visibility options
const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private' },
  { value: 'internal', label: 'Internal' },
  { value: 'public', label: 'Public' },
];

interface Document {
  id: number;
  title: string;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string;
  subcategory?: string;
  tags: string[];
  domain: string;
  visibility: string;
  processing_status: string;
  uploaded_by: string;
  created_at: string;
  access_count: number;
}

interface Stats {
  total: number;
  byDomain: Array<{ domain: string; count: string }>;
  byStatus: Array<{ processing_status: string; count: string }>;
  storage: {
    totalBytes: number;
    totalMB: number;
  };
  topDocuments: Array<{
    id: number;
    title: string;
    domain: string;
    access_count: number;
  }>;
}

export default function AdminBrain() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('private');
  
  // Documents list state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Stats state
  const [stats, setStats] = useState<Stats | null>(null);
  
  // Selected document for preview/edit
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterDomain) params.append('domain', filterDomain);
      if (filterCategory) params.append('category', filterCategory);
      
      const response = await axios.get(
        `${API_URL}/api/brain/documents?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setDocuments(response.data.documents);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/api/brain/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error: any) {
      toast.error('Failed to fetch stats');
    }
  };

  // Upload document
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title || !domain || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('adminToken');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('domain', domain);
      formData.append('category', category);
      if (subcategory) formData.append('subcategory', subcategory);
      if (tags) formData.append('tags', tags);
      formData.append('visibility', visibility);
      formData.append('uploadedBy', 'admin');
      
      await axios.post(`${API_URL}/api/brain/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Document uploaded successfully');
      
      // Reset form
      setFile(null);
      setTitle('');
      setDomain('');
      setCategory('');
      setSubcategory('');
      setTags('');
      setVisibility('private');
      
      // Refresh documents
      fetchDocuments();
      fetchStats();
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // Delete document
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/api/brain/document/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Document deleted successfully');
      fetchDocuments();
      fetchStats();
      setSelectedDoc(null);
    } catch (error: any) {
      toast.error('Failed to delete document');
    }
  };

  // Update document
  const handleUpdate = async () => {
    if (!selectedDoc) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_URL}/api/brain/document/${selectedDoc.id}`,
        {
          title: selectedDoc.title,
          category: selectedDoc.category,
          subcategory: selectedDoc.subcategory,
          tags: selectedDoc.tags,
          domain: selectedDoc.domain,
          visibility: selectedDoc.visibility
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Document updated successfully');
      setEditMode(false);
      fetchDocuments();
    } catch (error: any) {
      toast.error('Failed to update document');
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchDocuments();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery, filterDomain, filterCategory]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">Brain Upload System</h1>
          </div>
          <p className="text-slate-300">
            Multi-domain knowledge repository for Turbo Response AI
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="upload" className="data-[state=active]:bg-cyan-500">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-cyan-500">
              <FileText className="w-4 h-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-500">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Upload Document</CardTitle>
                <CardDescription className="text-slate-400">
                  Add new knowledge to the Brain system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <Label htmlFor="file" className="text-white">File *</Label>
                    <div className="mt-2">
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.txt,.jpg,.jpeg,.png,.docx"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                      {file && (
                        <p className="mt-2 text-sm text-slate-400">
                          Selected: {file.name} ({formatFileSize(file.size)})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <Label htmlFor="title" className="text-white">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Document title"
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>

                  {/* Domain */}
                  <div>
                    <Label htmlFor="domain" className="text-white">Domain *</Label>
                    <Select value={domain} onValueChange={setDomain} required>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOMAINS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div>
                    <Label htmlFor="category" className="text-white">Category *</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., debt-collection, website-audit, sales-scripts"
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>

                  {/* Subcategory */}
                  <div>
                    <Label htmlFor="subcategory" className="text-white">Subcategory</Label>
                    <Input
                      id="subcategory"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="Optional subcategory"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <Label htmlFor="tags" className="text-white">Tags</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Comma-separated tags (e.g., fdcpa, cease-and-desist, legal)"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  {/* Visibility */}
                  <div>
                    <Label htmlFor="visibility" className="text-white">Visibility</Label>
                    <Select value={visibility} onValueChange={setVisibility}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VISIBILITY_OPTIONS.map((v) => (
                          <SelectItem key={v.value} value={v.value}>
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Document Library</CardTitle>
                <CardDescription className="text-slate-400">
                  Browse and manage uploaded documents
                </CardDescription>
                
                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <Select value={filterDomain} onValueChange={setFilterDomain}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Filter by domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Domains</SelectItem>
                      {DOMAINS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Filter by category"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No documents found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-cyan-500 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-2">{doc.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300 border-cyan-500">
                                {doc.domain}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500">
                                {doc.category}
                              </Badge>
                              {doc.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="bg-slate-600 text-slate-300">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-sm text-slate-400 space-y-1">
                              <p>File: {doc.filename} ({formatFileSize(doc.file_size)})</p>
                              <p>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
                              <p>Access count: {doc.access_count}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedDoc(doc)}
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(doc.file_url, '_blank')}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(doc.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Documents */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Total Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-cyan-400">
                    {stats?.total || 0}
                  </div>
                  <p className="text-slate-400 mt-2">
                    {stats?.storage.totalMB.toFixed(2) || 0} MB total storage
                  </p>
                </CardContent>
              </Card>

              {/* By Domain */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">By Domain</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.byDomain.map((item) => (
                      <div key={item.domain} className="flex justify-between items-center">
                        <span className="text-slate-300">{item.domain}</span>
                        <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* By Status */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Processing Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.byStatus.map((item) => (
                      <div key={item.processing_status} className="flex justify-between items-center">
                        <span className="text-slate-300">{item.processing_status}</span>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-300">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Documents */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Most Accessed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.topDocuments.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center">
                        <span className="text-slate-300 truncate flex-1">{doc.title}</span>
                        <Badge variant="outline" className="bg-green-500/20 text-green-300 ml-2">
                          {doc.access_count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Document Preview/Edit Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-slate-800 border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editMode ? (
                      <Input
                        value={selectedDoc.title}
                        onChange={(e) => setSelectedDoc({ ...selectedDoc, title: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white mb-2"
                      />
                    ) : (
                      <CardTitle className="text-white">{selectedDoc.title}</CardTitle>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedDoc(null);
                      setEditMode(false);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode ? (
                  <>
                    <div>
                      <Label className="text-white">Domain</Label>
                      <Select
                        value={selectedDoc.domain}
                        onValueChange={(value) => setSelectedDoc({ ...selectedDoc, domain: value })}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DOMAINS.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Category</Label>
                      <Input
                        value={selectedDoc.category}
                        onChange={(e) => setSelectedDoc({ ...selectedDoc, category: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Tags (comma-separated)</Label>
                      <Input
                        value={selectedDoc.tags.join(', ')}
                        onChange={(e) =>
                          setSelectedDoc({
                            ...selectedDoc,
                            tags: e.target.value.split(',').map((t) => t.trim()),
                          })
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdate} className="bg-cyan-500 hover:bg-cyan-600">
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditMode(false)}
                        className="border-slate-600 text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 text-slate-300">
                      <p><strong>Filename:</strong> {selectedDoc.filename}</p>
                      <p><strong>Domain:</strong> {selectedDoc.domain}</p>
                      <p><strong>Category:</strong> {selectedDoc.category}</p>
                      {selectedDoc.subcategory && (
                        <p><strong>Subcategory:</strong> {selectedDoc.subcategory}</p>
                      )}
                      <p><strong>File Size:</strong> {formatFileSize(selectedDoc.file_size)}</p>
                      <p><strong>Visibility:</strong> {selectedDoc.visibility}</p>
                      <p><strong>Status:</strong> {selectedDoc.processing_status}</p>
                      <p><strong>Access Count:</strong> {selectedDoc.access_count}</p>
                      <p><strong>Uploaded:</strong> {new Date(selectedDoc.created_at).toLocaleString()}</p>
                      <div>
                        <strong>Tags:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedDoc.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="bg-slate-600 text-slate-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditMode(true)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => window.open(selectedDoc.file_url, '_blank')}
                        className="bg-cyan-500 hover:bg-cyan-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(selectedDoc.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

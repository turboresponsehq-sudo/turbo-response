import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Eye, Mail, Phone, Calendar, StickyNote, Edit, BarChart3, Search } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Notes modal state
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<string>("general");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bestTimeToCall: "",
    category: "",
  });

  const { data: leads, isLoading: leadsLoading, refetch } = trpc.admin.getLeads.useQuery();
  const { data: leadDetails } = trpc.admin.getLeadDetails.useQuery(
    { leadId: selectedLeadId! },
    { enabled: !!selectedLeadId }
  );
  const { data: leadNotes } = trpc.admin.getLeadNotes.useQuery(
    { leadId: selectedLeadId! },
    { enabled: !!selectedLeadId && notesModalOpen }
  );

  const updateStatusMutation = trpc.admin.updateLeadStatus.useMutation();
  const addNoteMutation = trpc.admin.addLeadNote.useMutation();
  const updateLeadMutation = trpc.admin.updateLead.useMutation();

  const handleStatusChange = async (leadId: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        leadId,
        status: status as any,
      });
      toast.success("Status updated");
      refetch();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleAddNote = async () => {
    if (!selectedLeadId || !noteContent.trim()) {
      toast.error("Please enter note content");
      return;
    }

    try {
      await addNoteMutation.mutateAsync({
        leadId: selectedLeadId,
        content: noteContent,
        noteType: noteType as any,
        createdBy: user?.name || "Admin",
      });
      toast.success("Note added");
      setNoteContent("");
      setNoteType("general");
      refetch();
    } catch (error) {
      toast.error("Failed to add note");
    }
  };

  const handleEditLead = async () => {
    if (!selectedLeadId) return;

    try {
      await updateLeadMutation.mutateAsync({
        leadId: selectedLeadId,
        ...editFormData,
      });
      toast.success("Lead updated");
      setEditModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to update lead");
    }
  };

  const openEditModal = (lead: any) => {
    setSelectedLeadId(lead.id);
    setEditFormData({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      bestTimeToCall: lead.bestTimeToCall || "",
      category: lead.category || "",
    });
    setEditModalOpen(true);
  };

  // Filter leads
  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchQuery));

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || lead.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access the admin dashboard.
          </p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "contacted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "qualified":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "converted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closed":
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return "Unknown";
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case "phone_call":
        return "bg-blue-100 text-blue-800";
      case "follow_up":
        return "bg-yellow-100 text-yellow-800";
      case "important":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage leads and conversations</p>
          </div>
          <Link href="/analytics">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
            <p className="text-2xl font-bold">{leads?.length || 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">New</p>
            <p className="text-2xl font-bold">
              {leads?.filter((l) => l.status === "new").length || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Contacted</p>
            <p className="text-2xl font-bold">
              {leads?.filter((l) => l.status === "contacted").length || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Converted</p>
            <p className="text-2xl font-bold">
              {leads?.filter((l) => l.status === "converted").length || 0}
            </p>
          </Card>
        </div>

        {/* Search and Filter Bar - Phase 3 */}
        <Card className="p-4 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="debt_collection">Debt Collection</SelectItem>
                  <SelectItem value="eviction">Eviction</SelectItem>
                  <SelectItem value="credit_errors">Credit Errors</SelectItem>
                  <SelectItem value="unemployment">Unemployment</SelectItem>
                  <SelectItem value="bank_issues">Bank Issues</SelectItem>
                  <SelectItem value="wage_garnishment">Wage Garnishment</SelectItem>
                  <SelectItem value="discrimination">Discrimination</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Leads Table */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            All Leads ({filteredLeads?.length || 0})
          </h2>

          {leadsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !filteredLeads || filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                ? "No leads match your filters"
                : "No leads yet"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{lead.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{lead.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryLabel(lead.category)}</Badge>
                      </TableCell>
                      <TableCell>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-md border-0 ${getStatusColor(
                            lead.status
                          )}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* View Details */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLeadId(lead.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Lead Details: {lead.name}</DialogTitle>
                              </DialogHeader>

                              {leadDetails && (
                                <div className="space-y-6">
                                  {/* Contact Info */}
                                  <div>
                                    <h3 className="font-semibold mb-2">Contact Information</h3>
                                    <div className="space-y-1 text-sm">
                                      <p>
                                        <strong>Email:</strong> {leadDetails.lead.email}
                                      </p>
                                      <p>
                                        <strong>Phone:</strong> {leadDetails.lead.phone || "N/A"}
                                      </p>
                                      <p>
                                        <strong>Best Time:</strong>{" "}
                                        {leadDetails.lead.bestTimeToCall || "N/A"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Case Summary */}
                                  {leadDetails.conversation?.summary && (
                                    <div>
                                      <h3 className="font-semibold mb-2">Case Summary</h3>
                                      <p className="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded">
                                        {leadDetails.conversation.summary}
                                      </p>
                                    </div>
                                  )}

                                  {/* Conversation History */}
                                  <div>
                                    <h3 className="font-semibold mb-2">Conversation History</h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                      {leadDetails.messages?.map((msg, idx) => (
                                        <div
                                          key={idx}
                                          className={`text-sm p-2 rounded ${
                                            msg.role === "user"
                                              ? "bg-blue-50 dark:bg-blue-900/20"
                                              : msg.role === "system"
                                              ? "bg-green-50 dark:bg-green-900/20"
                                              : "bg-slate-50 dark:bg-slate-800"
                                          }`}
                                        >
                                          <p className="font-medium text-xs mb-1">
                                            {msg.role === "user"
                                              ? "User"
                                              : msg.role === "system"
                                              ? "System"
                                              : "AI"}
                                          </p>
                                          <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Evidence Files */}
                                  {leadDetails.evidence && leadDetails.evidence.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold mb-2">Evidence Files</h3>
                                      <div className="space-y-2">
                                        {leadDetails.evidence.map((file, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-800 p-2 rounded"
                                          >
                                            <span>{file.filename || "Unnamed file"}</span>
                                            <Button
                                              variant="link"
                                              size="sm"
                                              onClick={() => window.open(file.fileUrl, "_blank")}
                                            >
                                              View
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {/* Edit Lead - Phase 3 */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(lead)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Notes - Phase 3 */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              setNotesModalOpen(true);
                            }}
                          >
                            <StickyNote className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Edit Lead Modal - Phase 3 */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-time">Best Time to Call</Label>
                <Select
                  value={editFormData.bestTimeToCall}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, bestTimeToCall: value })
                  }
                >
                  <SelectTrigger id="edit-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, category: value })
                  }
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debt_collection">Debt Collection</SelectItem>
                    <SelectItem value="eviction">Eviction</SelectItem>
                    <SelectItem value="credit_errors">Credit Errors</SelectItem>
                    <SelectItem value="unemployment">Unemployment</SelectItem>
                    <SelectItem value="bank_issues">Bank Issues</SelectItem>
                    <SelectItem value="wage_garnishment">Wage Garnishment</SelectItem>
                    <SelectItem value="discrimination">Discrimination</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditLead}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notes Modal - Phase 3 */}
        <Dialog open={notesModalOpen} onOpenChange={setNotesModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Lead Notes</DialogTitle>
            </DialogHeader>

            {/* Existing Notes */}
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {leadNotes && leadNotes.length > 0 ? (
                leadNotes.map((note) => (
                  <div key={note.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getNoteTypeColor(note.noteType)}>
                        {note.noteType.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      By: {note.createdBy}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notes yet
                </p>
              )}
            </div>

            {/* Add New Note */}
            <div className="space-y-3 border-t pt-4">
              <div>
                <Label htmlFor="note-type">Note Type</Label>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger id="note-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="phone_call">Phone Call</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="note-content">Note Content</Label>
                <Textarea
                  id="note-content"
                  placeholder="Enter note content..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleAddNote} className="w-full">
                Add Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


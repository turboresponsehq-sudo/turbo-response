import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import "./AdminDashboard.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Eye, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  // Validate admin session
  const { data: session, isLoading: sessionLoading } = trpc.adminAuth.validateSession.useQuery();
  const logoutMutation = trpc.adminAuth.logout.useMutation({
    onSuccess: () => {
      setLocation("/admin/login");
    },
  });

  const { data: leads, isLoading: leadsLoading } = trpc.admin.getLeads.useQuery();
  const { data: leadDetails } = trpc.admin.getLeadDetails.useQuery(
    { leadId: selectedLeadId! },
    { enabled: !!selectedLeadId }
  );
  const updateStatusMutation = trpc.admin.updateLeadStatus.useMutation();

  const handleStatusChange = async (leadId: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        leadId,
        status: status as any,
      });
      toast.success("Status updated");
      window.location.reload(); // Refresh data
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Auth check
  useEffect(() => {
    if (!sessionLoading && (!session || !session.valid)) {
      setLocation("/admin/login");
    }
  }, [session, sessionLoading, setLocation]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || !session.valid) {
    return null; // Will redirect via useEffect
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
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage leads and conversations</p>
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
              {leads?.filter(l => l.status === "new").length || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Contacted</p>
            <p className="text-2xl font-bold">
              {leads?.filter(l => l.status === "contacted").length || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Converted</p>
            <p className="text-2xl font-bold">
              {leads?.filter(l => l.status === "converted").length || 0}
            </p>
          </Card>
        </div>

        {/* Leads Table */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">All Leads</h2>

          {leadsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !leads || leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No leads yet</div>
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
                  {leads.map(lead => (
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
                          onChange={e => handleStatusChange(lead.id, e.target.value)}
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


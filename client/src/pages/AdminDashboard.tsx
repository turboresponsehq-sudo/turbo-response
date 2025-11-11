import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import "./AdminDashboard.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Phone, Calendar } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check for simple admin session
    const session = localStorage.getItem("admin_session");
    if (session) {
      setIsAuthenticated(true);
    } else {
      setLocation("/admin/login");
    }
    setAuthLoading(false);
  }, [setLocation]);

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Mock data for display
  const leads: any[] = [];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Admin Dashboard</h1>
          <p className="text-slate-400">Manage leads and conversations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <p className="text-sm text-slate-400 mb-1">Total Leads</p>
            <p className="text-2xl font-bold text-white">{leads.length || 0}</p>
          </Card>
          <Card className="p-4 bg-slate-800 border-slate-700">
            <p className="text-sm text-slate-400 mb-1">New</p>
            <p className="text-2xl font-bold text-white">
              {leads.filter(l => l.status === "new").length || 0}
            </p>
          </Card>
          <Card className="p-4 bg-slate-800 border-slate-700">
            <p className="text-sm text-slate-400 mb-1">Contacted</p>
            <p className="text-2xl font-bold text-white">
              {leads.filter(l => l.status === "contacted").length || 0}
            </p>
          </Card>
          <Card className="p-4 bg-slate-800 border-slate-700">
            <p className="text-sm text-slate-400 mb-1">Converted</p>
            <p className="text-2xl font-bold text-white">
              {leads.filter(l => l.status === "converted").length || 0}
            </p>
          </Card>
        </div>

        {/* Leads Table */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-white">All Leads</h2>

          {leads.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No leads yet. Backend functionality is currently disabled in static deployment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Phone</TableHead>
                    <TableHead className="text-slate-300">Category</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map(lead => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium text-white">{lead.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-300">{lead.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-300">{lead.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-slate-300 border-slate-600">
                          {lead.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-600 text-white">{lead.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="h-4 w-4" />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("admin_session");
              setLocation("/admin/login");
            }}
            className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

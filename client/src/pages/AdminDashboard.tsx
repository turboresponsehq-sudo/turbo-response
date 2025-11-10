// TEMPORARY: Backend calls removed to fix static build
// TODO: Re-add backend integration after setting up separate backend service

import { useState } from "react";
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
import { Loader2, Eye } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  // PLACEHOLDER: Replace with real auth check
  const isAuthenticated = false;

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    setLocation("/admin/login");
    return null;
  }

  // PLACEHOLDER: Mock data
  const leads = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-300">Manage leads and conversations</p>
          </div>
          <Button
            onClick={() => {
              // PLACEHOLDER: Add logout logic
              setLocation("/admin/login");
            }}
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white/10 border-white/20">
            <div className="text-sm text-slate-300 mb-1">Total Leads</div>
            <div className="text-3xl font-bold text-white">0</div>
          </Card>
          <Card className="p-6 bg-white/10 border-white/20">
            <div className="text-sm text-slate-300 mb-1">New</div>
            <div className="text-3xl font-bold text-white">0</div>
          </Card>
          <Card className="p-6 bg-white/10 border-white/20">
            <div className="text-sm text-slate-300 mb-1">Contacted</div>
            <div className="text-3xl font-bold text-white">0</div>
          </Card>
          <Card className="p-6 bg-white/10 border-white/20">
            <div className="text-sm text-slate-300 mb-1">Converted</div>
            <div className="text-3xl font-bold text-white">0</div>
          </Card>
        </div>

        {/* Leads Table */}
        <Card className="bg-white/10 border-white/20">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">All Leads</h2>
            {leads.length === 0 ? (
              <div className="text-center py-12 text-slate-300">
                No leads yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Email</TableHead>
                    <TableHead className="text-white">Category</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Created</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Placeholder for leads */}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

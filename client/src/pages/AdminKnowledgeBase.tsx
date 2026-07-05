/**
 * Turbo Response — Knowledge Base Admin
 * Admin-only page for managing the Knowledge Base document library.
 * Route: /admin/knowledge-base
 * Uses tRPC for all data operations.
 */

import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SourceSystem = "google_drive" | "upload" | "xai_collection" | "manual";
type DocStatus = "active" | "archived" | "needs_review";

interface DocFormData {
  title: string;
  category: string;
  subcategory: string;
  source: string;
  sourceUrl: string;
  fileType: string;
  content: string;
  summary: string;
  status: DocStatus;
  source_system: SourceSystem;
  adminNotes: string;
}

const EMPTY_FORM: DocFormData = {
  title: "",
  category: "",
  subcategory: "",
  source: "",
  sourceUrl: "",
  fileType: "",
  content: "",
  summary: "",
  status: "needs_review",
  source_system: "manual",
  adminNotes: "",
};

const STATUS_COLORS: Record<DocStatus, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  archived: "bg-gray-100 text-gray-600 border-gray-200",
  needs_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const SOURCE_ICONS: Record<SourceSystem, string> = {
  google_drive: "📁",
  upload: "⬆️",
  xai_collection: "🤖",
  manual: "✏️",
};

export default function AdminKnowledgeBase() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DocFormData>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "needs_review" | "pending_sync">("all");

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // tRPC queries
  const { data: stats, refetch: refetchStats } = trpc.knowledgeBase.getStats.useQuery();
  const { data: documents = [], isLoading, refetch: refetchDocs } = trpc.knowledgeBase.list.useQuery({
    search: search || undefined,
    status: filterStatus || undefined,
    category: filterCategory || undefined,
  });
  const { data: pendingSync = [] } = trpc.knowledgeBase.getPendingSync.useQuery();
  const { data: needsReview = [] } = trpc.knowledgeBase.getNeedingReview.useQuery();

  const utils = trpc.useUtils();

  const createMutation = trpc.knowledgeBase.create.useMutation({
    onSuccess: () => {
      utils.knowledgeBase.list.invalidate();
      utils.knowledgeBase.getStats.invalidate();
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
  });

  const updateMutation = trpc.knowledgeBase.update.useMutation({
    onSuccess: () => {
      utils.knowledgeBase.list.invalidate();
      utils.knowledgeBase.getStats.invalidate();
      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
  });

  const deleteMutation = trpc.knowledgeBase.delete.useMutation({
    onSuccess: () => {
      utils.knowledgeBase.list.invalidate();
      utils.knowledgeBase.getStats.invalidate();
      setDeleteConfirmId(null);
    },
  });

  const syncToXAIMutation = trpc.knowledgeBase.syncToXAI.useMutation({
    onSuccess: () => {
      utils.knowledgeBase.list.invalidate();
      utils.knowledgeBase.getPendingSync.invalidate();
      utils.knowledgeBase.getStats.invalidate();
    },
  });

  const syncPendingMutation = trpc.knowledgeBase.syncPendingToXAI.useMutation({
    onSuccess: () => {
      utils.knowledgeBase.list.invalidate();
      utils.knowledgeBase.getPendingSync.invalidate();
      utils.knowledgeBase.getStats.invalidate();
    },
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const handleOpenEdit = (doc: any) => {
    setEditingId(doc.id);
    setForm({
      title: doc.title || "",
      category: doc.category || "",
      subcategory: doc.subcategory || "",
      source: doc.source || "",
      sourceUrl: doc.sourceUrl || "",
      fileType: doc.fileType || "",
      content: doc.content || "",
      summary: doc.summary || "",
      status: doc.status || "needs_review",
      source_system: doc.source_system || "manual",
      adminNotes: doc.adminNotes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate({
        title: form.title,
        category: form.category,
        subcategory: form.subcategory || undefined,
        source: form.source,
        sourceUrl: form.sourceUrl || undefined,
        fileType: form.fileType || undefined,
        content: form.content || undefined,
        summary: form.summary || undefined,
        status: form.status,
        source_system: form.source_system,
      });
    }
  };

  const displayDocs =
    activeTab === "needs_review"
      ? needsReview
      : activeTab === "pending_sync"
      ? pendingSync
      : documents;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/admin")}
            className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Admin
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Knowledge Base</h1>
            <p className="text-xs text-gray-400">Document management & xAI sync control</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLocation("/admin/knowledge-base/import")}
            className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors flex items-center gap-1"
          >
            📁 Import from Drive
          </button>
          <button
            onClick={() => syncPendingMutation.mutate()}
            disabled={syncPendingMutation.isPending || (stats?.syncPending ?? 0) === 0}
            className="px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center gap-1"
          >
            {syncPendingMutation.isPending ? "🔄 Syncing..." : "🚀 Sync Pending"}
          </button>
          <Button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            + Add Document
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total", value: stats?.total ?? "—", color: "text-white" },
            { label: "Active", value: stats?.active ?? "—", color: "text-green-400" },
            { label: "Needs Review", value: stats?.needsReview ?? "—", color: "text-yellow-400" },
            { label: "Archived", value: stats?.archived ?? "—", color: "text-gray-400" },
            { label: "Pending xAI Sync", value: stats?.syncPending ?? "—", color: "text-blue-400" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-800 pb-2">
          {(["all", "needs_review", "pending_sync"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab === "all" ? "All Documents" : tab === "needs_review" ? "Needs Review" : "Pending xAI Sync"}
            </button>
          ))}
        </div>

        {/* Filters (only on All tab) */}
        {activeTab === "all" && (
          <div className="flex flex-wrap gap-3 mb-5">
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 w-64 focus:outline-none focus:border-blue-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="needs_review">Needs Review</option>
              <option value="archived">Archived</option>
            </select>
            <input
              type="text"
              placeholder="Filter by category..."
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 w-48 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Documents Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading documents...</div>
          ) : displayDocs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-3">📚</div>
              <div className="text-sm">No documents found.</div>
              {activeTab === "all" && (
                <button
                  onClick={handleOpenCreate}
                  className="mt-3 text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Add the first document
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Source</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">xAI Sync</th>
                  <th className="text-left px-4 py-3">Hash</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayDocs.map((doc: any) => (
                  <tr
                    key={doc.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white max-w-xs truncate">{doc.title}</div>
                      {doc.subcategory && (
                        <div className="text-xs text-gray-500">{doc.subcategory}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{doc.category}</td>
                    <td className="px-4 py-3">
                      <span className="text-base mr-1">
                        {SOURCE_ICONS[doc.source_system as SourceSystem] || "📄"}
                      </span>
                      <span className="text-gray-400 text-xs">{doc.source_system}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          STATUS_COLORS[doc.status as DocStatus] || "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {doc.synced_to_xai ? (
                        <span className="text-xs text-green-400">✓ Synced</span>
                      ) : (
                        <span className="text-xs text-yellow-500">⏳ Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {doc.content_hash ? (
                        <span className="text-xs text-gray-500 font-mono">
                          {doc.content_hash.slice(0, 8)}…
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        {!doc.synced_to_xai && (
                          <button
                            onClick={() => syncToXAIMutation.mutate({ id: doc.id })}
                            disabled={syncToXAIMutation.isPending}
                            className="text-xs text-purple-400 hover:text-purple-300 disabled:text-gray-500 px-2 py-1 rounded border border-purple-800 hover:border-purple-600 disabled:border-gray-700 transition-colors"
                          >
                            {syncToXAIMutation.isPending ? "Syncing..." : "Sync"}
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-blue-800 hover:border-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(doc.id)}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-900 hover:border-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">
                {editingId !== null ? "Edit Document" : "Add Document"}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM); }}
                className="text-gray-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Document title"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category *</label>
                  <input
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Legal, Policy, FAQ"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Subcategory</label>
                  <input
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Optional subcategory"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Source System *</label>
                  <select
                    value={form.source_system}
                    onChange={(e) => setForm({ ...form, source_system: e.target.value as SourceSystem })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="google_drive">Google Drive</option>
                    <option value="upload">Upload</option>
                    <option value="xai_collection">xAI Collection</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as DocStatus })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="needs_review">Needs Review</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Source Label</label>
                  <input
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. google_drive, manual"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">File Type</label>
                  <input
                    value={form.fileType}
                    onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. pdf, docx, txt"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Source URL</label>
                  <input
                    value={form.sourceUrl}
                    onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="https://docs.google.com/..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Summary</label>
                  <textarea
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Brief description of this document"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Content</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={5}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500 resize-none font-mono"
                    placeholder="Paste document content here (used for embeddings and change detection)"
                  />
                </div>
                {editingId !== null && (
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Admin Notes</label>
                    <textarea
                      value={form.adminNotes}
                      onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
                      rows={2}
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Internal notes for admin use"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM); }}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingId !== null
                    ? "Save Changes"
                    : "Create Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-900 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-2">Delete Document?</h3>
            <p className="text-gray-400 text-sm mb-5">
              This action cannot be undone. The document will be permanently removed from the Knowledge Base.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate({ id: deleteConfirmId })}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-700 hover:bg-red-600 text-white rounded disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

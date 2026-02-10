/**
 * Admin Resource Submissions Panel
 * Manage grant/resource intake submissions
 * Features: list, search, filter, status workflow, soft delete, audit trail
 */
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://turboresponsehq.ai";

interface Submission {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  resources: string;
  income_level: string;
  household_size: string;
  description: string;
  demographics: string;
  status: string;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
  delete_reason: string | null;
  ip_address: string | null;
  honeypot_triggered: boolean;
}

interface Stats {
  total_active: string;
  new_count: string;
  reviewed_count: string;
  matched_count: string;
  closed_count: string;
  spam_count: string;
  deleted_count: string;
  total_all: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  reviewed: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  matched: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  closed: { bg: '#e5e7eb', text: '#374151', border: '#9ca3af' },
  spam: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  deleted: { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  pending: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
};

export default function AdminResourceSubmissions() {
  const [, setLocation] = useLocation();
  const { token, isAuthenticated, clearTokenAndRedirect } = useAdminAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Detail view
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  
  // Status update
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        showDeleted: showDeleted.toString(),
        page: page.toString(),
        limit: '25'
      });

      const res = await axios.get(`${API_URL}/api/admin/resources?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubmissions(res.data.submissions || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotal(res.data.pagination?.total || 0);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        clearTokenAndRedirect();
        return;
      }
      setError(err.response?.data?.error || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter, showDeleted, page, clearTokenAndRedirect]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/admin/resources/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/admin/login");
      return;
    }
    fetchSubmissions();
    fetchStats();
  }, [isAuthenticated, fetchSubmissions, fetchStats, setLocation]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      setUpdatingStatus(id);
      await axios.patch(`${API_URL}/api/admin/resources/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchSubmissions();
      await fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API_URL}/api/admin/resources/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { reason: deleteReason || 'No reason provided' }
      });
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      setDeleteReason('');
      await fetchSubmissions();
      await fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete submission');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await axios.post(`${API_URL}/api/admin/resources/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchSubmissions();
      await fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to restore submission');
    }
  };

  const openDetail = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowDetail(true);
  };

  const openDeleteDialog = (submission: Submission, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(submission);
    setShowDeleteDialog(true);
  };

  const parseResources = (resources: string): string[] => {
    try {
      const parsed = JSON.parse(resources);
      return Array.isArray(parsed) ? parsed : [resources];
    } catch {
      return resources ? [resources] : [];
    }
  };

  const parseDemographics = (demographics: string): string[] => {
    try {
      const parsed = JSON.parse(demographics);
      return Array.isArray(parsed) ? parsed : [demographics];
    } catch {
      return demographics ? [demographics] : [];
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) + ' EST';
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
    return (
      <span style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {status}
      </span>
    );
  };

  // ─── Styles ────────────────────────────────────────────────────
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#111827',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#f3f4f6'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    backgroundColor: '#1f2937',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    flexWrap: 'wrap',
    gap: '12px'
  };

  const statsBarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  };

  const statCardStyle = (color: string): React.CSSProperties => ({
    flex: '1',
    minWidth: '120px',
    backgroundColor: '#1f2937',
    padding: '16px',
    borderRadius: '10px',
    borderLeft: `4px solid ${color}`,
    textAlign: 'center'
  });

  const filterBarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    alignItems: 'center'
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #374151',
    backgroundColor: '#1f2937',
    color: '#f3f4f6',
    fontSize: '14px',
    outline: 'none',
    flex: '1',
    minWidth: '200px'
  };

  const selectStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #374151',
    backgroundColor: '#1f2937',
    color: '#f3f4f6',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
  };

  const btnStyle = (bg: string): React.CSSProperties => ({
    padding: '8px 16px',
    backgroundColor: bg,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'opacity 0.2s'
  });

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  };

  const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#9ca3af',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #374151'
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #1f2937',
    color: '#e5e7eb'
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#1f2937',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    border: '1px solid #374151'
  };

  if (loading && submissions.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#111827' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <p style={{ fontSize: '18px', color: '#9ca3af' }}>Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#f3f4f6' }}>
            📋 Resource Submissions
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9ca3af' }}>
            Manage grant & resource intake requests
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setLocation('/admin')} style={btnStyle('#374151')}>
            ← Dashboard
          </button>
          <button onClick={() => { fetchSubmissions(); fetchStats(); }} style={btnStyle('#06b6d4')}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div style={statsBarStyle}>
          <div style={statCardStyle('#3b82f6')}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>{stats.total_active}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Active</div>
          </div>
          <div style={statCardStyle('#10b981')}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{stats.new_count}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>New</div>
          </div>
          <div style={statCardStyle('#f59e0b')}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{stats.reviewed_count}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Reviewed</div>
          </div>
          <div style={statCardStyle('#8b5cf6')}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>{stats.matched_count}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Matched</div>
          </div>
          <div style={statCardStyle('#ef4444')}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{stats.deleted_count}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Deleted</div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div style={filterBarStyle}>
        <input
          type="text"
          placeholder="Search name, email, phone, location..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={inputStyle}
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={selectStyle}
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="matched">Matched</option>
          <option value="closed">Closed</option>
          <option value="spam">Spam</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#9ca3af', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => { setShowDeleted(e.target.checked); setPage(1); }}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          Show Deleted
        </label>
      </div>

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: '#7f1d1d', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Results count */}
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
        Showing {submissions.length} of {total} submissions
        {showDeleted && ' (including deleted)'}
      </p>

      {/* Table */}
      {submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#1f2937', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>No submissions found</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ backgroundColor: '#111827' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Resources</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => openDetail(sub)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: sub.deleted_at ? '#1a1a2e' : '#1f2937',
                      opacity: sub.deleted_at ? 0.6 : 1,
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = sub.deleted_at ? '#1a1a2e' : '#1f2937'}
                  >
                    <td style={{ ...tdStyle, color: '#6b7280', fontWeight: '600' }}>{sub.id}</td>
                    <td style={{ ...tdStyle, fontWeight: '500', color: '#f3f4f6' }}>
                      {sub.name}
                      {sub.honeypot_triggered && (
                        <span style={{ marginLeft: '6px', fontSize: '11px', color: '#ef4444' }} title="Honeypot triggered">🤖</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: '#93c5fd' }}>{sub.email}</td>
                    <td style={tdStyle}>{sub.location}</td>
                    <td style={tdStyle}>
                      {parseResources(sub.resources).slice(0, 2).map((r, i) => (
                        <span key={i} style={{
                          display: 'inline-block',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          backgroundColor: '#374151',
                          color: '#d1d5db',
                          marginRight: '4px',
                          marginBottom: '2px'
                        }}>
                          {r.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {parseResources(sub.resources).length > 2 && (
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                          +{parseResources(sub.resources).length - 2}
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={sub.status || 'new'} />
                    </td>
                    <td style={{ ...tdStyle, fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      {formatDate(sub.created_at)}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        {sub.deleted_at ? (
                          <button
                            onClick={() => handleRestore(sub.id)}
                            style={{ ...btnStyle('#10b981'), padding: '4px 10px', fontSize: '12px' }}
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <select
                              value={sub.status || 'new'}
                              onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                              disabled={updatingStatus === sub.id}
                              style={{
                                ...selectStyle,
                                padding: '4px 8px',
                                fontSize: '12px',
                                minWidth: '90px'
                              }}
                            >
                              <option value="new">New</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="matched">Matched</option>
                              <option value="closed">Closed</option>
                              <option value="spam">Spam</option>
                            </select>
                            <button
                              onClick={(e) => openDeleteDialog(sub, e)}
                              style={{ ...btnStyle('#ef4444'), padding: '4px 10px', fontSize: '12px' }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ ...btnStyle('#374151'), opacity: page === 1 ? 0.5 : 1 }}
          >
            ← Prev
          </button>
          <span style={{ padding: '8px 16px', color: '#9ca3af', fontSize: '14px' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ ...btnStyle('#374151'), opacity: page === totalPages ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedSubmission && (
        <div style={overlayStyle} onClick={() => setShowDetail(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#f3f4f6' }}>
                  Submission #{selectedSubmission.id}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                  {formatDate(selectedSubmission.created_at)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <StatusBadge status={selectedSubmission.status || 'new'} />
                <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '24px', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', color: '#06b6d4', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Name</div>
                  <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedSubmission.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Email</div>
                  <div style={{ fontSize: '15px', color: '#93c5fd' }}>{selectedSubmission.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Phone</div>
                  <div style={{ fontSize: '15px' }}>{selectedSubmission.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Location</div>
                  <div style={{ fontSize: '15px' }}>{selectedSubmission.location}</div>
                </div>
              </div>
            </div>

            {/* Resources Requested */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', color: '#06b6d4', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resources Requested</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {parseResources(selectedSubmission.resources).map((r, i) => (
                  <span key={i} style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    backgroundColor: '#374151',
                    color: '#d1d5db',
                    border: '1px solid #4b5563'
                  }}>
                    {r.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Household Info */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', color: '#06b6d4', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Household Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Income Level</div>
                  <div style={{ fontSize: '15px' }}>{selectedSubmission.income_level || 'Not specified'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Household Size</div>
                  <div style={{ fontSize: '15px' }}>{selectedSubmission.household_size || 'Not specified'}</div>
                </div>
              </div>
              {selectedSubmission.demographics && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>Demographics</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {parseDemographics(selectedSubmission.demographics).map((d, i) => (
                      <span key={i} style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: '#374151',
                        color: '#d1d5db'
                      }}>
                        {d.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', color: '#06b6d4', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Situation Description</h3>
              <div style={{
                padding: '16px',
                backgroundColor: '#111827',
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#d1d5db',
                border: '1px solid #374151'
              }}>
                {selectedSubmission.description}
              </div>
            </div>

            {/* Audit Trail (if deleted) */}
            {selectedSubmission.deleted_at && (
              <div style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#1a1a2e',
                borderRadius: '8px',
                border: '1px solid #ef4444'
              }}>
                <h3 style={{ fontSize: '14px', color: '#ef4444', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deletion Audit Trail</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>Deleted At: </span>
                    <span style={{ fontSize: '13px', color: '#fca5a5' }}>{formatDate(selectedSubmission.deleted_at)}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>Deleted By: </span>
                    <span style={{ fontSize: '13px', color: '#fca5a5' }}>{selectedSubmission.deleted_by || 'Unknown'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>Reason: </span>
                    <span style={{ fontSize: '13px', color: '#fca5a5' }}>{selectedSubmission.delete_reason || 'No reason provided'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Spam indicator */}
            {selectedSubmission.honeypot_triggered && (
              <div style={{
                marginBottom: '20px',
                padding: '12px 16px',
                backgroundColor: '#7f1d1d',
                borderRadius: '8px',
                border: '1px solid #ef4444',
                fontSize: '13px',
                color: '#fca5a5'
              }}>
                🤖 This submission triggered the honeypot spam filter
                {selectedSubmission.ip_address && (
                  <span style={{ marginLeft: '12px', color: '#9ca3af' }}>IP: {selectedSubmission.ip_address}</span>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #374151' }}>
              {selectedSubmission.deleted_at ? (
                <button onClick={() => { handleRestore(selectedSubmission.id); setShowDetail(false); }} style={btnStyle('#10b981')}>
                  Restore Submission
                </button>
              ) : (
                <>
                  <select
                    value={selectedSubmission.status || 'new'}
                    onChange={(e) => { handleStatusChange(selectedSubmission.id, e.target.value); setSelectedSubmission({ ...selectedSubmission, status: e.target.value }); }}
                    style={selectStyle}
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="matched">Matched</option>
                    <option value="closed">Closed</option>
                    <option value="spam">Spam</option>
                  </select>
                  <button onClick={(e) => { openDeleteDialog(selectedSubmission, e as any); setShowDetail(false); }} style={btnStyle('#ef4444')}>
                    Delete
                  </button>
                </>
              )}
              <button onClick={() => setShowDetail(false)} style={btnStyle('#374151')}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && deleteTarget && (
        <div style={overlayStyle} onClick={() => setShowDeleteDialog(false)}>
          <div style={{ ...modalStyle, maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px', fontSize: '20px', color: '#f3f4f6' }}>
              Confirm Deletion
            </h2>
            <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6', marginBottom: '8px' }}>
              This will remove the submission from <strong>{deleteTarget.name}</strong> ({deleteTarget.email}) from active lists.
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px' }}>
              The record will be soft-deleted and can be restored later.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
                Reason for deletion (optional)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g., Duplicate submission, spam, test entry..."
                style={{
                  ...inputStyle,
                  width: '100%',
                  minHeight: '80px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowDeleteDialog(false); setDeleteReason(''); }} style={btnStyle('#374151')}>
                Cancel
              </button>
              <button onClick={handleDelete} style={btnStyle('#ef4444')}>
                Delete Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

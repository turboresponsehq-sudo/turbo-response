import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, FolderOpen, Calendar, User } from 'lucide-react';
import './AdminCases.css';

export default function AdminCases() {
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '',
    category: '',
    description: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
  });

  // Fetch all cases
  const { data: cases, isLoading, refetch } = trpc.case.list.useQuery();
  
  // Create case mutation
  const createCaseMutation = trpc.case.create.useMutation({
    onSuccess: (data) => {
      refetch();
      setShowCreateModal(false);
      setNewCase({
        title: '',
        category: '',
        description: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
      });
      // Navigate to the new case's file upload page
      setLocation(`/admin/case/${data.caseId}/files`);
    },
  });

  const handleCreateCase = () => {
    if (!newCase.title) {
      alert('Please enter a case title');
      return;
    }
    
    createCaseMutation.mutate(newCase);
  };

  if (isLoading) {
    return (
      <div className="admin-cases-container">
        <div className="admin-cases-loading">Loading cases...</div>
      </div>
    );
  }

  return (
    <div className="admin-cases-container">
      <div className="admin-cases-header">
        <div>
          <h1 className="admin-cases-title">Case File Manager</h1>
          <p className="admin-cases-subtitle">Manage case files and documents</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="create-case-btn">
          <Plus className="btn-icon" />
          New Case
        </Button>
      </div>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Case</h2>
            
            <div className="form-group">
              <label>Case Title *</label>
              <input
                type="text"
                value={newCase.title}
                onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                placeholder="e.g., IRS Tax Dispute 2024"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={newCase.category}
                onChange={(e) => setNewCase({ ...newCase, category: e.target.value })}
              >
                <option value="">Select category...</option>
                <option value="IRS">IRS</option>
                <option value="Debt Collection">Debt Collection</option>
                <option value="Credit Reporting">Credit Reporting</option>
                <option value="Fraud">Fraud</option>
                <option value="Repo">Repo</option>
                <option value="Banking">Banking Reports (EWS/Chex)</option>
                <option value="Unemployment">Unemployment</option>
                <option value="Business">Business Disputes</option>
                <option value="General">General Evidence</option>
              </select>
            </div>

            <div className="form-group">
              <label>Client Name</label>
              <input
                type="text"
                value={newCase.clientName}
                onChange={(e) => setNewCase({ ...newCase, clientName: e.target.value })}
                placeholder="Client name"
              />
            </div>

            <div className="form-group">
              <label>Client Email</label>
              <input
                type="email"
                value={newCase.clientEmail}
                onChange={(e) => setNewCase({ ...newCase, clientEmail: e.target.value })}
                placeholder="client@example.com"
              />
            </div>

            <div className="form-group">
              <label>Client Phone</label>
              <input
                type="tel"
                value={newCase.clientPhone}
                onChange={(e) => setNewCase({ ...newCase, clientPhone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newCase.description}
                onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                placeholder="Brief case description..."
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCase} 
                disabled={createCaseMutation.isPending}
              >
                {createCaseMutation.isPending ? 'Creating...' : 'Create Case'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cases Grid */}
      <div className="cases-grid">
        {cases && cases.length === 0 && (
          <div className="empty-state">
            <FolderOpen className="empty-icon" />
            <h3>No cases yet</h3>
            <p>Create your first case to start uploading documents</p>
          </div>
        )}

        {cases?.map((caseItem) => (
          <Card 
            key={caseItem.id} 
            className="case-card"
            onClick={() => setLocation(`/admin/case/${caseItem.id}/files`)}
          >
            <div className="case-card-header">
              <FolderOpen className="case-icon" />
              <span className={`case-status case-status-${caseItem.status}`}>
                {caseItem.status}
              </span>
            </div>
            
            <h3 className="case-title">{caseItem.title}</h3>
            
            {caseItem.category && (
              <span className="case-category">{caseItem.category}</span>
            )}
            
            {caseItem.clientName && (
              <div className="case-meta">
                <User className="meta-icon" />
                <span>{caseItem.clientName}</span>
              </div>
            )}
            
            <div className="case-meta">
              <Calendar className="meta-icon" />
              <span>{new Date(caseItem.createdAt).toLocaleDateString()}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

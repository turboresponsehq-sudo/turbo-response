import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import './AdminConsumerCases.css';

interface Case {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: string;
  description: string;
  amount: number | null;
  deadline: string | null;
  status: string;
  created_at: string;
}

export default function AdminConsumerCases() {
  const [, setLocation] = useLocation();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCases();
  }, [filter]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/admin/consumer/cases'
        : `/api/admin/consumer/cases?status=${filter}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }
      
      const data = await response.json();
      setCases(data.cases || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'new': 'status-new',
      'under_review': 'status-review',
      'analyzed': 'status-analyzed',
      'letter_generated': 'status-letter',
      'approved': 'status-approved',
      'closed': 'status-closed'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-new'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="admin-consumer-cases">
      <div className="admin-header">
        <h1>⚖️ Consumer Defense Cases</h1>
        <button onClick={() => setLocation('/admin')} className="btn-back">
          ← Back to Admin
        </button>
      </div>

      <div className="filter-bar">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Cases
        </button>
        <button 
          className={filter === 'new' ? 'active' : ''}
          onClick={() => setFilter('new')}
        >
          New
        </button>
        <button 
          className={filter === 'under_review' ? 'active' : ''}
          onClick={() => setFilter('under_review')}
        >
          Under Review
        </button>
        <button 
          className={filter === 'analyzed' ? 'active' : ''}
          onClick={() => setFilter('analyzed')}
        >
          Analyzed
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading cases...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={fetchCases}>Retry</button>
        </div>
      )}

      {!loading && !error && cases.length === 0 && (
        <div className="empty-state">
          <p>📭 No cases found</p>
        </div>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className="cases-table-container">
          <table className="cases-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td>#{caseItem.id}</td>
                  <td>
                    <div className="case-name">
                      <strong>{caseItem.name}</strong>
                      <small>{caseItem.email}</small>
                    </div>
                  </td>
                  <td>
                    <span className="case-type">{caseItem.type}</span>
                  </td>
                  <td>{formatAmount(caseItem.amount)}</td>
                  <td>
                    {caseItem.deadline 
                      ? new Date(caseItem.deadline).toLocaleDateString()
                      : 'N/A'
                    }
                  </td>
                  <td>{getStatusBadge(caseItem.status)}</td>
                  <td>{formatDate(caseItem.created_at)}</td>
                  <td>
                    <button 
                      className="btn-view"
                      onClick={() => setLocation(`/admin/consumer/case/${caseItem.id}`)}
                    >
                      View Case →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="cases-summary">
        <p>Total Cases: <strong>{cases.length}</strong></p>
      </div>
    </div>
  );
}

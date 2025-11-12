import { useEffect, useState } from 'react';
import './AIUsageTracker.css';

interface UsageStats {
  total_runs: number;
  total_tokens: number;
  total_cost: number;
  monthly_cap: number | null;
  cap_remaining: number | null;
  cap_percentage: number | null;
}

export default function AIUsageTracker() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsageStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchUsageStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch(
        'https://turbo-response-backend.onrender.com/api/admin/consumer/usage-stats'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch usage stats');
      }
      
      const data = await response.json();
      setStats(data.stats);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const getCapStatusColor = () => {
    if (!stats?.cap_percentage) return '#06b6d4';
    if (stats.cap_percentage >= 90) return '#ef4444'; // Red
    if (stats.cap_percentage >= 75) return '#f97316'; // Orange
    if (stats.cap_percentage >= 50) return '#fbbf24'; // Yellow
    return '#22c55e'; // Green
  };

  const getCapStatusText = () => {
    if (!stats?.monthly_cap) return 'Unlimited';
    if (!stats.cap_percentage) return 'No usage';
    if (stats.cap_percentage >= 100) return 'Cap Reached!';
    if (stats.cap_percentage >= 90) return 'Near Limit';
    if (stats.cap_percentage >= 75) return 'High Usage';
    return 'Normal';
  };

  if (loading) {
    return (
      <div className="usage-tracker">
        <div className="usage-header">
          <h3>📊 AI Usage This Month</h3>
        </div>
        <div className="usage-loading">
          <div className="spinner-small"></div>
          <p>Loading stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="usage-tracker">
        <div className="usage-header">
          <h3>📊 AI Usage This Month</h3>
        </div>
        <div className="usage-error">
          <p>❌ {error}</p>
          <button onClick={fetchUsageStats} className="btn-retry-small">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="usage-tracker">
      <div className="usage-header">
        <h3>📊 AI Usage This Month</h3>
        <button onClick={fetchUsageStats} className="btn-refresh-small" title="Refresh">
          🔄
        </button>
      </div>

      <div className="usage-stats-grid">
        {/* Total Runs */}
        <div className="usage-stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <div className="stat-label">Total Runs</div>
            <div className="stat-value">{stats.total_runs}</div>
          </div>
        </div>

        {/* Total Cost */}
        <div className="usage-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Estimated Cost</div>
            <div className="stat-value">${stats.total_cost.toFixed(4)}</div>
          </div>
        </div>

        {/* Total Tokens */}
        <div className="usage-stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Total Tokens</div>
            <div className="stat-value">{stats.total_tokens.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Monthly Cap Section */}
      {stats.monthly_cap !== null && (
        <div className="usage-cap-section">
          <div className="cap-header">
            <span className="cap-label">Monthly Cap</span>
            <span 
              className="cap-status"
              style={{ color: getCapStatusColor() }}
            >
              {getCapStatusText()}
            </span>
          </div>
          
          <div className="cap-progress-bar">
            <div 
              className="cap-progress-fill"
              style={{ 
                width: `${Math.min(stats.cap_percentage || 0, 100)}%`,
                background: getCapStatusColor()
              }}
            />
          </div>
          
          <div className="cap-details">
            <span>${stats.total_cost.toFixed(2)} used</span>
            <span>
              {stats.cap_remaining !== null && stats.cap_remaining > 0
                ? `$${stats.cap_remaining.toFixed(2)} remaining`
                : 'Cap reached'}
            </span>
            <span>Cap: ${stats.monthly_cap.toFixed(2)}</span>
          </div>
          
          {stats.cap_percentage && stats.cap_percentage >= 75 && (
            <div className="cap-warning">
              ⚠️ {stats.cap_percentage >= 90 
                ? 'You are approaching your monthly spending limit!' 
                : 'High usage detected this month.'}
            </div>
          )}
        </div>
      )}

      {/* No Cap Message */}
      {stats.monthly_cap === null && (
        <div className="usage-unlimited">
          <p>✨ <strong>Unlimited Usage</strong></p>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.5rem 0 0 0' }}>
            No monthly spending cap is set. You can run unlimited analyses.
          </p>
        </div>
      )}

      {/* Info Footer */}
      <div className="usage-footer">
        <small>
          💡 Costs are estimated at ~$5 per 1M tokens (GPT-4o average)
        </small>
      </div>
    </div>
  );
}

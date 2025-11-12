import { useEffect, useState } from 'react';
import './SpendingCapSettings.css';

export default function SpendingCapSettings() {
  const [currentCap, setCurrentCap] = useState<number | null>(null);
  const [newCap, setNewCap] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCurrentCap();
  }, []);

  const fetchCurrentCap = async () => {
    try {
      const response = await fetch(
        'https://turbo-response-backend.onrender.com/api/admin/consumer/settings/spending-cap'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch spending cap');
      }
      
      const data = await response.json();
      setCurrentCap(data.cap);
      setNewCap(data.cap !== null ? data.cap.toString() : '');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Parse cap value
      let capValue: number | null = null;
      if (newCap.trim() !== '') {
        capValue = parseFloat(newCap);
        if (isNaN(capValue) || capValue < 0) {
          throw new Error('Cap must be a positive number or empty for unlimited');
        }
      }

      const response = await fetch(
        'https://turbo-response-backend.onrender.com/api/admin/consumer/settings/spending-cap',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cap: capValue }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update cap');
      }

      const data = await response.json();
      setCurrentCap(data.cap);
      setSuccess('Spending cap updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCap = async () => {
    setNewCap('');
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch(
        'https://turbo-response-backend.onrender.com/api/admin/consumer/settings/spending-cap',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cap: null }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove cap');
      }

      setCurrentCap(null);
      setSuccess('Spending cap removed - unlimited usage enabled!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove cap');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="spending-cap-settings">
        <div className="settings-header">
          <h3>⚙️ Monthly Spending Cap</h3>
        </div>
        <div className="settings-loading">
          <div className="spinner-small"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spending-cap-settings">
      <div className="settings-header">
        <h3>⚙️ Monthly Spending Cap</h3>
      </div>

      <div className="settings-body">
        <p className="settings-description">
          Set a monthly spending limit for AI analysis runs. When the cap is reached, 
          new analysis requests will be blocked until the next month.
        </p>

        <div className="settings-current">
          <span className="current-label">Current Cap:</span>
          <span className="current-value">
            {currentCap !== null ? `$${currentCap.toFixed(2)}` : 'Unlimited ✨'}
          </span>
        </div>

        <div className="settings-input-group">
          <label htmlFor="cap-input">New Monthly Cap (USD)</label>
          <div className="input-with-button">
            <input
              id="cap-input"
              type="number"
              min="0"
              step="0.01"
              value={newCap}
              onChange={(e) => setNewCap(e.target.value)}
              placeholder="e.g., 30.00 (leave empty for unlimited)"
              className="cap-input"
              disabled={saving}
            />
            <button
              onClick={handleSave}
              disabled={saving || newCap === (currentCap?.toString() || '')}
              className="btn-save-cap"
            >
              {saving ? '⏳ Saving...' : '💾 Save'}
            </button>
          </div>
          <small className="input-hint">
            💡 Recommended: $30-50/month for moderate usage (~6,000-10,000 analyses)
          </small>
        </div>

        {currentCap !== null && (
          <div className="settings-actions">
            <button
              onClick={handleRemoveCap}
              disabled={saving}
              className="btn-remove-cap"
            >
              🗑️ Remove Cap (Enable Unlimited)
            </button>
          </div>
        )}

        {error && (
          <div className="settings-error">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="settings-success">
            ✅ {success}
          </div>
        )}

        <div className="settings-info">
          <h4>📋 How It Works:</h4>
          <ul>
            <li>Cap is checked <strong>before</strong> each AI analysis run</li>
            <li>If spending exceeds the cap, analysis will be blocked</li>
            <li>Cap resets automatically at the start of each month</li>
            <li>Costs are estimated at ~$5 per 1M tokens (GPT-4o)</li>
            <li>Setting cap to $0 will block all analyses</li>
            <li>Leave empty for unlimited usage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

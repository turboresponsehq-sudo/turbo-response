import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import AIUsageTracker from '@/components/AIUsageTracker';
import './AdminConsumerCaseDetail.css';

interface CaseDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: string;
  description: string;
  amount: number | null;
  deadline: string | null;
  status: string;
  created_at: string;
  documents: string[];
  payment_status?: string;
  payment_method?: string;
  payment_confirmed_at?: string;
  payment_verified_at?: string;
  // AI Analysis fields (now part of case object)
  violations: string[];
  laws_cited: string[];
  recommended_actions: string[];
  urgency_level?: string;
  estimated_value: number;
  success_probability: number;
  pricing: {
    amount: number;
    tier: string;
  };
  summary: string;
  analysis_created_at?: string;
}

interface Letter {
  id: number;
  letter_type: string;
  content: string;
  status: string;
  created_at: string;
}

export default function AdminConsumerCaseDetail() {
  const [, params] = useRoute('/admin/consumer/case/:id');
  const [, setLocation] = useLocation();
  
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [error, setError] = useState('');
  
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  
  // Confirmation and cooldown states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(0);

  const caseId = params?.id;

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails();
    }
  }, [caseId]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/consumer/case/${caseId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }
      
      const data = await response.json();
      // Backend now returns everything in case object
      setCaseData(data.case);
      setLetters(data.letters || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  // Handle cooldown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);
  
  // Show confirmation dialog before analysis
  const handleAnalyzeClick = () => {
    setShowConfirmDialog(true);
  };
  
  // Confirm and run analysis
  const confirmAnalysis = () => {
    setShowConfirmDialog(false);
    runAIAnalysis();
  };
  
  const runAIAnalysis = async () => {
    if (!caseId) return;
    
    try {
      setAnalyzing(true);
      setError('');
      
      // Record analysis start time
      const startTime = Date.now();
      
      const response = await fetch(
        `/api/admin/consumer/analyze-case/${caseId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      const data = await response.json();
      
      // Refresh case details to get updated analysis
      await fetchCaseDetails();
      
      // Start 15-second cooldown
      setLastAnalysisTime(Date.now());
      setCooldownSeconds(15);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI analysis failed';
      setError(errorMessage);
      
      // Check if it's a spending cap error
      if (errorMessage.includes('spending cap')) {
        // Don't start cooldown on cap errors
      } else {
        // Start cooldown even on errors to prevent spam
        setCooldownSeconds(10);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!confirm('Confirm that payment has been received and verified?')) {
      return;
    }

    try {
      setVerifyingPayment(true);
      const response = await fetch(
        `/api/payment/verify/${caseId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paid', verified_by: 1 }) // TODO: Get admin ID from auth
        }
      );

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      alert('✅ Payment verified successfully!');
      fetchCaseDetails(); // Refresh case data
    } catch (err) {
      alert('Failed to verify payment: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleMarkNotPaid = async () => {
    if (!confirm('Mark this payment as NOT PAID? This will notify the client.')) {
      return;
    }

    try {
      setVerifyingPayment(true);
      const response = await fetch(
        `/api/payment/verify/${caseId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'unpaid', verified_by: 1 }) // TODO: Get admin ID from auth
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      alert('Payment marked as not paid.');
      fetchCaseDetails(); // Refresh case data
    } catch (err) {
      alert('Failed to update payment status: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setVerifyingPayment(false);
    }
  };

  const generateLetter = async () => {
    if (!caseId) return;
    
    try {
      setGeneratingLetter(true);
      setError('');
      
      const response = await fetch(
        `/api/admin/consumer/generate-letter/${caseId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            letter_type: 'cease_desist'
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Letter generation failed');
      }
      
      const data = await response.json();
      setLetters([data.letter, ...letters]);
      setSelectedLetter(data.letter);
      setShowLetterModal(true);
      
      // Update case status
      if (caseData) {
        setCaseData({ ...caseData, status: 'letter_generated' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Letter generation failed');
    } finally {
      setGeneratingLetter(false);
    }
  };

  const copyLetterToClipboard = () => {
    if (selectedLetter) {
      navigator.clipboard.writeText(selectedLetter.content);
      alert('Letter copied to clipboard!');
    }
  };

  const downloadLetter = () => {
    if (selectedLetter && caseData) {
      const blob = new Blob([selectedLetter.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `letter_case_${caseId}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  const getUrgencyColor = (level: string) => {
    const colors: Record<string, string> = {
      'low': '#22c55e',
      'medium': '#fbbf24',
      'high': '#f97316',
      'critical': '#ef4444'
    };
    return colors[level] || '#94a3b8';
  };

  if (loading) {
    return (
      <div className="admin-case-detail">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error && !caseData) {
    return (
      <div className="admin-case-detail">
        <div className="error-container">
          <p>❌ {error}</p>
          <button onClick={() => setLocation('/admin/consumer/cases')}>
            ← Back to Cases
          </button>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="admin-case-detail">
        <div className="error-container">
          <p>Case not found</p>
          <button onClick={() => setLocation('/admin/consumer/cases')}>
            ← Back to Cases
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-case-detail">
      <div className="detail-header">
        <div>
          <h1>Case #{caseData.id}</h1>
          <p className="case-type-badge">{caseData.type}</p>
        </div>
        <button 
          onClick={() => setLocation('/admin/consumer/cases')} 
          className="btn-back"
        >
          ← Back to Cases
        </button>
      </div>

      {error && (
        <div className="error-banner">
          ❌ {error}
        </div>
      )}

      {/* Case Information */}
      <div className="info-card">
        <h2>📋 Case Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Name:</label>
            <span>{caseData.name}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{caseData.email}</span>
          </div>
          <div className="info-item">
            <label>Phone:</label>
            <span>{caseData.phone}</span>
          </div>
          <div className="info-item">
            <label>Address:</label>
            <span>{caseData.address}</span>
          </div>
          <div className="info-item">
            <label>Case Type:</label>
            <span>{caseData.type}</span>
          </div>
          <div className="info-item">
            <label>Amount:</label>
            <span>{formatCurrency(caseData.amount)}</span>
          </div>
          <div className="info-item">
            <label>Deadline:</label>
            <span>
              {caseData.deadline 
                ? new Date(caseData.deadline).toLocaleDateString()
                : 'N/A'
              }
            </span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span className="status-value">{caseData.status}</span>
          </div>
          <div className="info-item">
            <label>Payment Status:</label>
            <span className={`payment-status payment-${caseData.payment_status || 'unpaid'}`}>
              {caseData.payment_status === 'payment_pending' ? '⏳ Pending Verification' :
               caseData.payment_status === 'paid' ? '✅ Verified' :
               '❌ Unpaid'}
            </span>
          </div>
          {caseData.payment_method && (
            <div className="info-item">
              <label>Payment Method:</label>
              <span>{caseData.payment_method}</span>
            </div>
          )}
          {caseData.payment_confirmed_at && (
            <div className="info-item">
              <label>Payment Confirmed:</label>
              <span>{new Date(caseData.payment_confirmed_at).toLocaleString()}</span>
            </div>
          )}
        </div>
        
        {/* Payment Verification Buttons */}
        {caseData.payment_status === 'payment_pending' && (
          <div className="payment-verification-section">
            <h3>💳 Payment Verification</h3>
            <p>Client has confirmed payment. Please verify the payment was received.</p>
            <div className="verification-buttons">
              <button 
                className="btn btn-success"
                onClick={handleVerifyPayment}
                disabled={verifyingPayment}
              >
                ✅ Mark as Verified
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleMarkNotPaid}
                disabled={verifyingPayment}
              >
                ❌ Mark as Not Paid
              </button>
            </div>
          </div>
        )}
        
        {caseData.payment_verified_at && (
          <div className="payment-verified-notice">
            ✅ Payment verified on {new Date(caseData.payment_verified_at).toLocaleString()}
          </div>
        )}
        
        <div className="description-section">
          <label>Description:</label>
          <p>{caseData.description}</p>
        </div>

        {caseData.documents && caseData.documents.length > 0 && (
          <div className="documents-section">
            <label>📎 Attached Documents ({caseData.documents.length}):</label>
            <div className="documents-list">
              {caseData.documents.map((doc, index) => (
                <a 
                  key={index} 
                  href={doc} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="document-link"
                >
                  📄 Document {index + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Usage Tracker */}
      <AIUsageTracker />

      {/* AI Analysis Section */}
      <div className="analysis-card">
        <div className="card-header">
          <h2>🤖 AI Analysis</h2>
          <button 
            onClick={handleAnalyzeClick}
            disabled={analyzing || cooldownSeconds > 0}
            className="btn-analyze"
          >
            {analyzing ? '⏳ Analyzing...' : 
             cooldownSeconds > 0 ? `⏱️ Cooldown (${cooldownSeconds}s)` :
             '🚀 Run AI Analysis'}
          </button>
        </div>

        {caseData?.violations && caseData.violations.length > 0 ? (
          <div className="analysis-results">
            <div className="analysis-summary">
              <h3>Executive Summary</h3>
              <p>{caseData.summary || 'No summary available'}</p>
            </div>

            <div className="analysis-metrics">
              {caseData.urgency_level && (
                <div className="metric-card">
                  <label>Urgency Level</label>
                  <div 
                    className="metric-value urgency"
                    style={{ color: getUrgencyColor(caseData.urgency_level) }}
                  >
                    {caseData.urgency_level.toUpperCase()}
                  </div>
                </div>
              )}
              <div className="metric-card">
                <label>Success Probability</label>
                <div className="metric-value">
                  {formatPercentage(caseData.success_probability)}
                </div>
              </div>
              <div className="metric-card">
                <label>Estimated Value</label>
                <div className="metric-value">
                  {formatCurrency(caseData.estimated_value)}
                </div>
              </div>
              <div className="metric-card">
                <label>Pricing Suggestion</label>
                <div className="metric-value">
                  {formatCurrency(caseData.pricing?.amount || 0)}
                </div>
              </div>
              {caseData.pricing?.tier && (
                <div className="metric-card">
                  <label>Pricing Tier</label>
                  <div className="metric-value">
                    {caseData.pricing.tier}
                  </div>
                </div>
              )}
            </div>

            <div className="analysis-section">
              <h3>⚠️ Violations Found</h3>
              <ul className="violations-list">
                {caseData.violations.map((violation: string, index: number) => (
                  <li key={index}>{violation}</li>
                ))}
              </ul>
            </div>

            <div className="analysis-section">
              <h3>⚖️ Laws Cited</h3>
              <ul className="laws-list">
                {caseData.laws_cited.map((law: string, index: number) => (
                  <li key={index}>{law}</li>
                ))}
              </ul>
            </div>

            <div className="analysis-section">
              <h3>✅ Recommended Actions</h3>
              <ul className="actions-list">
                {caseData.recommended_actions.map((action: string, index: number) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>

            {caseData.analysis_created_at && (
              <div className="analysis-footer">
                <small>Analysis generated: {new Date(caseData.analysis_created_at).toLocaleString()}</small>
              </div>
            )}
          </div>
        ) : (
          <div className="no-analysis">
            <p>No AI analysis has been run for this case yet.</p>
            <p>Click "Run AI Analysis" to generate a comprehensive analysis.</p>
          </div>
        )}
      </div>

      {/* Letter Generation Section */}
      {caseData?.violations && caseData.violations.length > 0 && (
        <div className="letter-card">
          <div className="card-header">
            <h2>📄 Letter Generation</h2>
            <button 
              onClick={generateLetter}
              disabled={generatingLetter}
              className="btn-generate-letter"
            >
              {generatingLetter ? '⏳ Generating...' : '✍️ Generate Letter'}
            </button>
          </div>

          {letters.length > 0 && (
            <div className="letters-list">
              <h3>Generated Letters ({letters.length})</h3>
              {letters.map((letter) => (
                <div key={letter.id} className="letter-item">
                  <div className="letter-info">
                    <strong>{letter.letter_type.replace('_', ' ').toUpperCase()}</strong>
                    <span className="letter-status">{letter.status}</span>
                    <small>{new Date(letter.created_at).toLocaleString()}</small>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedLetter(letter);
                      setShowLetterModal(true);
                    }}
                    className="btn-view-letter"
                  >
                    View Letter
                  </button>
                </div>
              ))}
            </div>
          )}

          {letters.length === 0 && (
            <div className="no-letters">
              <p>No letters generated yet.</p>
              <p>Click "Generate Letter" to create a legal response letter.</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-overlay" onClick={() => setShowConfirmDialog(false)}>
          <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Confirm AI Analysis</h2>
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="btn-close-modal"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                You are about to run an AI analysis on this case using OpenAI GPT-4.
              </p>
              <p style={{ color: '#495057', marginBottom: '1rem' }}>
                This will:
              </p>
              <ul style={{ color: '#212529', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Analyze violations and applicable laws</li>
                <li>Generate recommendations and success probability</li>
                <li>Consume API tokens (estimated cost: $0.01-0.05)</li>
                <li>Update the case analysis in the database</li>
              </ul>
              <p style={{ color: '#856404', fontWeight: 600 }}>
                ⏱️ After running, there will be a 15-second cooldown before you can run another analysis.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="btn-copy"
                style={{ background: 'rgba(100, 116, 139, 0.2)', border: '1px solid #64748b' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmAnalysis}
                className="btn-download"
              >
                ✅ Confirm & Run Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Letter Modal */}
      {showLetterModal && selectedLetter && (
        <div className="modal-overlay" onClick={() => setShowLetterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 Generated Letter</h2>
              <button 
                onClick={() => setShowLetterModal(false)}
                className="btn-close-modal"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <pre className="letter-content">{selectedLetter.content}</pre>
            </div>
            <div className="modal-footer">
              <button onClick={copyLetterToClipboard} className="btn-copy">
                📋 Copy to Clipboard
              </button>
              <button onClick={downloadLetter} className="btn-download">
                💾 Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

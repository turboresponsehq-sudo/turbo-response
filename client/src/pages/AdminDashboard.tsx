/**
 * Admin Dashboard - Consumer Defense Cases
 * Restored to match authoritative specification
 * Simple case list only - no AI features, no pricing, no analysis
 * PHASE 1: Mobile responsive with proper breakpoints
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://turboresponsehq.ai";

interface CaseItem {
  id: number;
  case_number: string;
  full_name: string;
  email: string;
  phone?: string;
  category: string;
  status: string;
  funnel_stage?: string;
  payment_verified?: boolean;
  unread_messages_count?: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { token, isAuthenticated, clearTokenAndRedirect } = useAdminAuth();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      console.warn('[AdminDashboard] Not authenticated - redirecting to login');
      setLocation("/admin/login");
      return;
    }

    const fetchCases = async () => {
      try {
        console.log('[AdminDashboard] Fetching cases...');
        console.log('API_URL:', API_URL);
        console.log('Token exists:', !!token);
        
        const res = await axios.get(`${API_URL}/api/cases/admin/all`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        console.log('✅ Response status:', res.status);
        console.log('✅ Cases count:', res.data.cases?.length || 0);
        
        // Show all cases (both consumer and business)
        const allCases = res.data.cases || [];
        setCases(allCases);
        
        console.log('📊 Total cases from API:', res.data.cases?.length || 0);
        console.log('📊 All cases loaded successfully');
      } catch (err: any) {
        console.error('[AdminDashboard] Error fetching cases:', err);
        console.error('Error status:', err.response?.status);
        
        // Handle 401 - token expired
        if (err.response?.status === 401) {
          console.warn('[AdminDashboard] 401 Unauthorized - token expired, redirecting');
          clearTokenAndRedirect();
          return;
        }
        
        // Show other errors
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load cases';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [isAuthenticated, token, setLocation, clearTokenAndRedirect]);

  const handleCaseClick = (caseId: number) => {
    setLocation(`/admin/cases/${caseId}`);
  };

  const handleLogout = () => {
    console.log('[AdminDashboard] Logout clicked');
    clearTokenAndRedirect();
  };

  const getFunnelStageColor = (stage: string) => {
    switch (stage) {
      case 'lead':
        return '#3b82f6';
      case 'prospect':
        return '#8b5cf6';
      case 'qualified':
        return '#ec4899';
      case 'proposal':
        return '#f59e0b';
      case 'negotiation':
        return '#10b981';
      case 'closed_won':
        return '#06b6d4';
      case 'closed_lost':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1f2937',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        backgroundColor: '#374151',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#f3f4f6' }}>
          ⚡ Admin Dashboard ({cases.length} cases)
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setLocation('/admin/brain')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🧠 Brain
          </button>
          <button
            onClick={() => setLocation('/admin/resources')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#06b6d4',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📋 Resources
          </button>
          <button
            onClick={() => setLocation('/admin/screenshots')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📸 Screenshot Upload
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0, fontWeight: '500' }}>Error: {error}</p>
        </div>
      )}

      {/* Cases Table */}
      {cases.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          color: '#6b7280'
        }}>
          <p style={{ fontSize: '18px' }}>No cases found</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#374151',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#4b5563',
                borderBottom: '2px solid #6b7280'
              }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#f3f4f6', fontSize: '15px' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#f3f4f6', fontSize: '15px' }}>Case #</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#f3f4f6', fontSize: '15px' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#f3f4f6', fontSize: '15px' }}>Category</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#f3f4f6', fontSize: '15px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  onClick={() => handleCaseClick(caseItem.id)}
                  style={{
                    borderBottom: '1px solid #6b7280',
                    cursor: 'pointer',
                    backgroundColor: '#374151',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                >
                  <td style={{ padding: '12px 16px', color: '#f3f4f6', fontWeight: '500', fontSize: '14px' }}>{caseItem.full_name || 'N/A'}</td>
                  <td style={{ padding: '12px 16px', color: '#60a5fa', fontWeight: '600', fontSize: '14px' }}>#{caseItem.id}</td>
                  <td style={{ padding: '12px 16px', color: '#d1d5db', fontSize: '14px' }}>{caseItem.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                      {caseItem.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#f3f4f6', fontSize: '14px' }}>{caseItem.status || 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

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
      backgroundColor: '#f3f4f6',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          ⚡ Admin Dashboard
        </h1>
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

      {/* Cases List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {cases.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            color: '#6b7280'
          }}>
            <p style={{ fontSize: '18px' }}>No cases found</p>
          </div>
        ) : (
          cases.map((caseItem) => (
            <div
              key={caseItem.id}
              onClick={() => handleCaseClick(caseItem.id)}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid #e5e7eb'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                  {caseItem.full_name}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                  Case #{caseItem.case_number}
                </p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p style={{ margin: '4px 0', fontSize: '13px' }}>
                  <strong>Email:</strong> {caseItem.email}
                </p>
                {caseItem.phone && (
                  <p style={{ margin: '4px 0', fontSize: '13px' }}>
                    <strong>Phone:</strong> {caseItem.phone}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  backgroundColor: '#e0e7ff',
                  color: '#3730a3',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {caseItem.category}
                </span>
              </div>

              {caseItem.funnel_stage && (
                <div style={{
                  padding: '8px',
                  backgroundColor: getFunnelStageColor(caseItem.funnel_stage) + '20',
                  borderLeft: `3px solid ${getFunnelStageColor(caseItem.funnel_stage)}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: getFunnelStageColor(caseItem.funnel_stage)
                }}>
                  Stage: {caseItem.funnel_stage}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

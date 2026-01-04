/**
 * Admin Dashboard - Consumer Defense Cases
 * Updated to use httpOnly cookies for authentication (mobile-friendly)
 * Simple case list only - no AI features, no pricing, no analysis
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";

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
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        console.log('🔍 [AdminDashboard] Fetching cases with cookie-based auth...');
        
        const axiosInstance = axios.create({
          baseURL: API_URL,
          withCredentials: true
        });
        
        const res = await axiosInstance.get('/api/cases/admin/all', {
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Cases loaded:', res.data.cases?.length || 0);
        setCases(res.data.cases || []);
      } catch (err: any) {
        console.error('❌ Error fetching cases:', err);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          setLocation("/admin/login");
          return;
        }
        
        setError("Could not load cases");
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [setLocation]);

  const handleCaseClick = (caseId: number) => {
    setLocation(`/admin/cases/${caseId}`);
  };

  const handleLogout = async () => {
    try {
      const axiosInstance = axios.create({
        baseURL: API_URL,
        withCredentials: true
      });
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem("admin_user");
      setLocation("/admin/login");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <p style={{ color: '#000000' }}>Loading cases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <h2 style={{ color: '#000000' }}>Error Loading Cases</h2>
        <p style={{ color: '#000000' }}>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
        <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Back to Login</button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#ffffff', 
      minHeight: '100vh',
      color: '#000000'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h1 style={{ color: '#000000', margin: 0 }}>Admin Dashboard</h1>
        <button 
          onClick={handleLogout} 
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {cases.length === 0 ? (
        <p style={{ color: '#000000' }}>No cases found.</p>
      ) : (
        <div>
          <p style={{ color: '#000000', marginBottom: '15px' }}>Total cases: {cases.length}</p>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: '#ffffff'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333333' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#000000', fontWeight: 'bold' }}>Case #</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#000000', fontWeight: 'bold' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#000000', fontWeight: 'bold' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#000000', fontWeight: 'bold' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#000000', fontWeight: 'bold' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#000000', fontWeight: 'bold' }}>Funnel Stage</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  onClick={() => handleCaseClick(caseItem.id)}
                  style={{
                    borderBottom: '1px solid #cccccc',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  <td style={{ padding: '12px', color: '#000000' }}>{caseItem.case_number || 'N/A'}</td>
                  <td style={{ padding: '12px', color: '#000000' }}>{caseItem.full_name || 'N/A'}</td>
                  <td style={{ padding: '12px', color: '#000000' }}>{caseItem.email || 'N/A'}</td>
                  <td style={{ padding: '12px', color: '#000000' }}>{caseItem.category || 'N/A'}</td>
                  <td style={{ padding: '12px', color: '#000000' }}>{caseItem.status || 'N/A'}</td>
                  <td style={{ padding: '12px', color: '#000000' }}>{caseItem.funnel_stage || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

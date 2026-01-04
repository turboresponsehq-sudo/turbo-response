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
        console.log('API_URL:', API_URL);
        console.log('Full URL:', `${API_URL}/api/cases/admin/all`);
        
        // Create axios instance with credentials enabled
        // This ensures httpOnly cookies are sent with the request
        const axiosInstance = axios.create({
          baseURL: API_URL,
          withCredentials: true  // CRITICAL: Send cookies with request
        });
        
        const res = await axiosInstance.get('/api/cases/admin/all', {
          headers: { 
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Response status:', res.status);
        console.log('✅ Response data:', res.data);
        console.log('✅ Cases count:', res.data.cases?.length || 0);
        
        setCases(res.data.cases || []);
      } catch (err: any) {
        console.error('❌ [AdminDashboard] Error fetching cases:', err);
        console.error('Error message:', err.message);
        console.error('Error response:', err.response);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        
        // If 401/403, redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('🔄 Redirecting to login...');
          setLocation("/admin/login");
          return;
        }
        
        const errorDetails = `
API URL: ${API_URL}
Status: ${err.response?.status || 'No response'}
Message: ${err.message}
Data: ${JSON.stringify(err.response?.data || {})}`;
        
        // Alert for mobile users to see error
        if (typeof window !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
          alert('Admin Dashboard Error:' + errorDetails);
        }
        
        setError("Could not load cases" + errorDetails);
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
      // Call logout endpoint to clear the httpOnly cookie
      const axiosInstance = axios.create({
        baseURL: API_URL,
        withCredentials: true
      });
      
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear any localStorage data
      localStorage.removeItem("admin_user");
      setLocation("/admin/login");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading cases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Error Loading Cases</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
        <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px' }}>
          Logout
        </button>
      </div>

      {cases.length === 0 ? (
        <p>No cases found.</p>
      ) : (
        <div>
          <p>Total cases: {cases.length}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Case #</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Funnel Stage</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  onClick={() => handleCaseClick(caseItem.id)}
                  style={{
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                >
                  <td style={{ padding: '10px' }}>{caseItem.case_number}</td>
                  <td style={{ padding: '10px' }}>{caseItem.full_name}</td>
                  <td style={{ padding: '10px' }}>{caseItem.email}</td>
                  <td style={{ padding: '10px' }}>{caseItem.category}</td>
                  <td style={{ padding: '10px' }}>{caseItem.status}</td>
                  <td style={{ padding: '10px' }}>{caseItem.funnel_stage || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

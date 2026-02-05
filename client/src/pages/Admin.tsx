import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import AdminDashboard from "./AdminDashboard";
import "./AdminLogin.css";

/**
 * Smart /admin route that shows:
 * - Login page if not authenticated
 * - Dashboard if authenticated as admin
 * - Access denied if authenticated but not admin
 */
export default function Admin() {
  const { user, loading } = useAuth();

  // Loading state
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
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login page
  if (!user) {
    return (
      <div className="admin-login-page">
        {/* Animated Background */}
        <div className="bg-animation">
          <div className="bg-grid"></div>
        </div>

        {/* Login Container */}
        <div className="login-container">
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">⚡</div>
              TURBO RESPONSE
            </div>
            <h1 className="login-title">Admin Dashboard</h1>
            <p className="login-subtitle">🔒 Secure Access Required</p>
          </div>

          <div style={{ marginTop: '2rem', marginBottom: '2rem', textAlign: 'center', color: '#9ca3af' }}>
            <p>Sign in with your Google account to access the admin dashboard.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Only authorized administrators can access this area.
            </p>
          </div>

          <button
            onClick={() => window.location.href = getLoginUrl()}
            className="google-login-button"
          >
            <svg
              style={{ width: '20px', height: '20px', marginRight: '12px' }}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
            <p>✅ OAuth 2.0 Secure Authentication</p>
            <p style={{ marginTop: '0.5rem' }}>
              Your credentials are never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but not admin - show access denied
  if (user.role !== 'admin') {
    return (
      <div className="admin-login-page">
        {/* Animated Background */}
        <div className="bg-animation">
          <div className="bg-grid"></div>
        </div>

        {/* Access Denied Container */}
        <div className="login-container">
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">⚡</div>
              TURBO RESPONSE
            </div>
            <h1 className="login-title">Access Denied</h1>
            <p className="login-subtitle">🔒 Admin Access Required</p>
          </div>

          <div className="error-message">
            You are logged in as <strong>{user.email}</strong>, but you do not have administrator privileges.
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={() => window.location.href = "/"}
              className="google-login-button"
              style={{ background: '#6b7280' }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated as admin - show dashboard
  return <AdminDashboard />;
}

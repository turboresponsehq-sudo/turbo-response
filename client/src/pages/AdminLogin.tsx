import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in by attempting to fetch admin data
    // If the httpOnly cookie is valid, this will succeed
    const checkAuth = async () => {
      try {
        const response = await api.get('/api/auth/me');
        if (response.user) {
          setLocation("/admin");
        }
      } catch (error) {
        // Not logged in, stay on login page
      }
    };
    
    checkAuth();
  }, [setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Authenticate with backend
      // The response will include an httpOnly cookie (admin_session)
      // which will be automatically sent with subsequent requests
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      // Store user info in localStorage (optional, for display purposes)
      // The actual auth token is now in the httpOnly cookie
      if (response.user) {
        localStorage.setItem("admin_user", JSON.stringify(response.user));
      }
      
      setLocation("/admin");
    } catch (error: any) {
      setError(`❌ ${error.message}`);
      setIsLoading(false);
    }
  };

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

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? "Logging in..." : "🔓 Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

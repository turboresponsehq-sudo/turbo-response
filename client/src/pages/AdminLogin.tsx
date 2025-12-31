import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    if (isAuthenticated) {
      setLocation("/admin");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Authenticate with backend
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      // Use auth context to store token and user
      login(response.token, response.user);
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

        <div className="back-link">
          <a href="/">← Back to Homepage</a>
        </div>
      </div>
    </div>
  );
}

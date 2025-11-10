import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in via session validation
  const { data: session } = trpc.adminAuth.validateSession.useQuery();
  
  useEffect(() => {
    if (session && session.valid) {
      setLocation("/admin");
    }
  }, [session, setLocation]);

  const loginMutation = trpc.adminAuth.login.useMutation({
    onSuccess: () => {
      setLocation("/admin");
    },
    onError: (error) => {
      setError("❌ " + (error.message || "Invalid credentials"));
      setIsLoading(false);
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    loginMutation.mutate({ username, password });
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
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="Enter username"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

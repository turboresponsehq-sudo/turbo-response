import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AdminAuthContextType {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  clearTokenAndRedirect: () => void;
  checkAuth: () => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

/**
 * Decode a JWT payload without verifying the signature.
 * Used client-side to check the `exp` claim before making API calls.
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token: string): { exp?: number; [key: string]: any } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Base64url → Base64 → JSON
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/**
 * Returns true if the JWT has an `exp` claim that is in the past.
 * Returns false if the token has no `exp` (treat as non-expiring) or is valid.
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return false;
  // exp is in seconds; Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Initialize from localStorage on mount.
  // On mobile browsers (especially Android Chrome), this useEffect runs
  // asynchronously after the first render. The `isLoading` flag prevents
  // child components from firing API calls before this completes.
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_session');
    const storedUser = localStorage.getItem('admin_user');

    if (storedToken && storedUser) {
      // Check client-side if the token is already expired before even
      // trying to use it. This avoids a round-trip to the server that
      // would return 403 "Invalid or expired token".
      if (isTokenExpired(storedToken)) {
        console.warn('[AdminAuth] Stored token is expired — clearing on init');
        localStorage.removeItem('admin_session');
        localStorage.removeItem('admin_user');
      } else {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log('[AdminAuth] Restored session from localStorage');
        } catch (error) {
          console.error('[AdminAuth] Failed to parse stored user:', error);
          localStorage.removeItem('admin_session');
          localStorage.removeItem('admin_user');
        }
      }
    }

    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: AdminUser) => {
    localStorage.setItem('admin_session', newToken);
    localStorage.setItem('admin_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    console.log('[AdminAuth] Login successful for:', newUser.email);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
    console.log('[AdminAuth] Logout successful');
  }, []);

  const clearTokenAndRedirect = useCallback(() => {
    // Prevent multiple simultaneous redirects
    if (isRedirecting) {
      console.warn('[AdminAuth] Redirect already in progress, ignoring duplicate');
      return;
    }

    setIsRedirecting(true);
    console.warn('[AdminAuth] Token expired or invalid — clearing and redirecting to login');

    logout();

    // Use setTimeout to ensure state updates complete before redirect
    setTimeout(() => {
      setLocation('/admin/login');
      setIsRedirecting(false);
    }, 0);
  }, [logout, setLocation, isRedirecting]);

  const checkAuth = useCallback((): boolean => {
    if (!token || !user) {
      console.warn('[AdminAuth] Not authenticated');
      return false;
    }
    return true;
  }, [token, user]);

  const value: AdminAuthContextType = {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    clearTokenAndRedirect,
    checkAuth,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

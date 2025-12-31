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

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_session');
    const storedUser = localStorage.getItem('admin_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('[AdminAuth] Failed to parse stored user:', error);
        localStorage.removeItem('admin_session');
        localStorage.removeItem('admin_user');
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
    console.warn('[AdminAuth] Token expired or invalid - clearing and redirecting to login');
    
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

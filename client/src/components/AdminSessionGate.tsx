import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { getAdminLoginUrl } from "@/lib/adminLoginRedirect";
import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";

/**
 * Protects routes that use the established Turbo Response administrator JWT
 * session. The API remains the authorization authority for each request.
 */
export function AdminSessionGate({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAdminAuth();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    setLocation(getAdminLoginUrl(window.location.pathname));
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 pt-24 text-center text-slate-300">
        Verifying secure admin session…
      </main>
    );
  }

  return <>{children}</>;
}

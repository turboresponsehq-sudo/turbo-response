import { useAuth } from "@/_core/hooks/useAuth";
import React, { type ReactNode } from "react";

export function OAuthAdminGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth({
    redirectOnUnauthenticated: true,
  });

  if (loading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 pt-24 text-center text-slate-300">
        Verifying secure session…
      </main>
    );
  }

  return <>{children}</>;
}

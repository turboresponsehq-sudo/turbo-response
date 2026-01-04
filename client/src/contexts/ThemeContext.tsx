import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    const isAdminRoute = window.location.pathname.startsWith("/admin");
    
    // FORCE LIGHT MODE on /admin routes - always remove dark class
    if (isAdminRoute) {
      root.classList.remove("dark");
      return;
    }
    
    // For non-admin routes, apply theme normally
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  // Re-run effect when route changes (for SPA navigation)
  useEffect(() => {
    const handleRouteChange = () => {
      const root = document.documentElement;
      const isAdminRoute = window.location.pathname.startsWith("/admin");
      
      if (isAdminRoute) {
        root.classList.remove("dark");
      } else if (theme === "dark") {
        root.classList.add("dark");
      }
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener("popstate", handleRouteChange);
    
    // Initial check
    handleRouteChange();
    
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, [theme]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

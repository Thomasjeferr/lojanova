"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type AdminTheme = "light" | "dark";

const STORAGE_KEY = "admin-ui-theme";
const THEME_EVENT = "admin-ui-theme-change";

function readStoredTheme(): AdminTheme {
  if (typeof window === "undefined") return "light";
  try {
    const s = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
    if (s === "dark" || s === "light") return s;
  } catch {
    /* ignore */
  }
  return "light";
}

function subscribeTheme(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const run = () => onChange();
  window.addEventListener(THEME_EVENT, run);
  window.addEventListener("storage", run);
  return () => {
    window.removeEventListener(THEME_EVENT, run);
    window.removeEventListener("storage", run);
  };
}

function getServerTheme(): AdminTheme {
  return "light";
}

function getClientTheme(): AdminTheme {
  return readStoredTheme();
}

function persistTheme(t: AdminTheme) {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(THEME_EVENT));
  }
}

type AdminThemeContextValue = {
  theme: AdminTheme;
  setTheme: (t: AdminTheme) => void;
  toggleTheme: () => void;
};

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getClientTheme,
    getServerTheme,
  );

  const setTheme = useCallback((t: AdminTheme) => {
    persistTheme(t);
  }, []);

  const toggleTheme = useCallback(() => {
    persistTheme(theme === "light" ? "dark" : "light");
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <AdminThemeContext.Provider value={value}>
      <div className={theme === "dark" ? "dark" : undefined}>{children}</div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return ctx;
}

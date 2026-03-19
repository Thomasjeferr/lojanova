"use client";

import { createContext, useContext, useState, useCallback } from "react";

type AccountLayoutContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const AccountLayoutContext = createContext<AccountLayoutContextValue | null>(null);

export function AccountLayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  return (
    <AccountLayoutContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar }}>
      {children}
    </AccountLayoutContext.Provider>
  );
}

export function useAccountLayout() {
  const ctx = useContext(AccountLayoutContext);
  if (!ctx) throw new Error("useAccountLayout must be used within AccountLayoutProvider");
  return ctx;
}

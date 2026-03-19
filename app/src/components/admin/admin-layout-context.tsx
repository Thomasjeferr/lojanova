"use client";

import { createContext, useContext, useState } from "react";

type AdminLayoutContextType = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarMobileOpen: boolean;
  setSidebarMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AdminLayoutContext = createContext<AdminLayoutContextType | null>(null);

export function AdminLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  return (
    <AdminLayoutContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        sidebarMobileOpen,
        setSidebarMobileOpen,
      }}
    >
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const ctx = useContext(AdminLayoutContext);
  if (!ctx) throw new Error("useAdminLayout must be used within AdminLayoutProvider");
  return ctx;
}

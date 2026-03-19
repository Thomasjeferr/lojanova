"use client";

import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { AdminLayoutProvider, useAdminLayout } from "./admin-layout-context";
import { cn } from "@/lib/utils";
import type { SiteBrandingPublic } from "@/lib/site-branding";

type AdminShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  userEmail?: string;
  branding: SiteBrandingPublic;
};

function AdminShellInner({
  children,
  title,
  subtitle,
  userEmail,
  branding,
}: AdminShellProps) {
  const { sidebarCollapsed } = useAdminLayout();
  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminSidebar branding={branding} />
      <div
        className={cn(
          "transition-[padding] duration-200 max-lg:pl-0",
          sidebarCollapsed ? "pl-[72px]" : "pl-64",
        )}
      >
        <AdminHeader
          title={title}
          subtitle={subtitle}
          userEmail={userEmail}
        />
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AdminShell(props: AdminShellProps) {
  return (
    <AdminLayoutProvider>
      <AdminShellInner {...props} />
    </AdminLayoutProvider>
  );
}

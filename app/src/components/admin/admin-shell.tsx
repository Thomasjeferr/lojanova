"use client";

import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { AdminLayoutProvider, useAdminLayout } from "./admin-layout-context";
import { AdminThemeProvider } from "./admin-theme-context";
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
    <div className="admin-app-shell relative min-h-screen min-h-[100dvh] bg-[#f4f4f6] text-zinc-900 dark:bg-[#020203] dark:text-zinc-100">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-15%,rgba(99,102,241,0.11),transparent_58%)] dark:bg-[radial-gradient(ellipse_95%_65%_at_50%_-12%,rgba(99,102,241,0.2),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(168,85,247,0.06),transparent_50%)] dark:bg-[radial-gradient(ellipse_70%_45%_at_100%_0%,rgba(168,85,247,0.12),transparent_48%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.42] dark:opacity-[0.28]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.045) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />
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
        <main className="min-h-[calc(100vh-4.25rem)] min-h-[calc(100dvh-4.25rem)] p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-8 lg:p-9 lg:pb-10">
          <div className="mx-auto w-full max-w-[1620px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AdminShell(props: AdminShellProps) {
  return (
    <AdminLayoutProvider>
      <AdminThemeProvider>
        <AdminShellInner {...props} />
      </AdminThemeProvider>
    </AdminLayoutProvider>
  );
}

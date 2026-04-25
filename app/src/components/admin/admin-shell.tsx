"use client";

import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { AdminLayoutProvider, useAdminLayout } from "./admin-layout-context";
import { AdminThemeProvider } from "./admin-theme-context";
import { cn } from "@/lib/utils";
import type { SiteBrandingPublic } from "@/lib/site-branding";
import { useMediaQuery } from "@/hooks/use-media-query";

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
  const compactNav = useMediaQuery("(max-width: 1279px)");
  const effectiveCollapsed = sidebarCollapsed || compactNav;

  return (
    <div
      className={cn(
        "admin-design-system admin-app-shell relative min-h-screen min-h-[100dvh]",
        "bg-[var(--bg-base)] text-[var(--text-primary)] antialiased",
      )}
    >
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35] dark:opacity-[0.22]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 55% at 50% -8%, var(--accent-purple-glow), transparent 52%),
            radial-gradient(ellipse 55% 40% at 100% 0%, rgba(167,139,250,0.08), transparent 45%)
          `,
        }}
        aria-hidden
      />
      <AdminSidebar branding={branding} userEmail={userEmail} compactNav={compactNav} />
      <div
        className={cn(
          "transition-[padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] max-lg:pl-0",
          effectiveCollapsed ? "lg:pl-[var(--admin-sidebar-w-collapsed)]" : "lg:pl-[var(--admin-sidebar-w)]",
        )}
      >
        <AdminHeader title={title} subtitle={subtitle} userEmail={userEmail} />
        <main className="min-h-[calc(100dvh-4rem)] px-[var(--space-6)] pb-[max(var(--space-6),env(safe-area-inset-bottom))] pt-[var(--space-6)]">
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

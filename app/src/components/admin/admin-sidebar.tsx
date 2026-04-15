"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Key,
  ShoppingCart,
  Users,
  Settings,
  Mail,
  ChevronLeft,
  ChevronRight,
  Globe2,
} from "lucide-react";
import { useAdminLayout } from "./admin-layout-context";
import { BrandingLogo } from "@/components/branding-logo";
import type { SiteBrandingPublic } from "@/lib/site-branding";
import { normalizeAdminPathname, toAdminPath } from "@/lib/admin-path";

const navItems = [
  { href: toAdminPath(), internalPath: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: toAdminPath("atividade"), internalPath: "/admin/atividade", label: "Atividade global", icon: Globe2 },
  { href: toAdminPath("plans"), internalPath: "/admin/plans", label: "Planos", icon: Package },
  { href: toAdminPath("codes"), internalPath: "/admin/codes", label: "Códigos", icon: Key },
  { href: toAdminPath("orders"), internalPath: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: toAdminPath("customers"), internalPath: "/admin/customers", label: "Clientes", icon: Users },
  { href: toAdminPath("emails"), internalPath: "/admin/emails", label: "E-mails", icon: Mail },
  { href: toAdminPath("settings"), internalPath: "/admin/settings", label: "Configurações", icon: Settings },
];

export function AdminSidebar({ branding }: { branding: SiteBrandingPublic }) {
  const pathname = normalizeAdminPathname(usePathname() ?? "");
  const {
    sidebarCollapsed: collapsed,
    setSidebarCollapsed: setCollapsed,
    sidebarMobileOpen,
    setSidebarMobileOpen,
  } = useAdminLayout();

  return (
    <>
      <div
        id="admin-sidebar-backdrop"
        className={cn(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-200 dark:bg-black/70 lg:hidden",
          sidebarMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarMobileOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-200/65 bg-gradient-to-b from-white/[0.99] to-zinc-50/[0.97] shadow-[6px_0_40px_-18px_rgba(15,23,42,0.18)] backdrop-blur-2xl transition-[width,transform] duration-200 dark:border-zinc-800/80 dark:from-zinc-950/[0.98] dark:to-[#050508] dark:shadow-[8px_0_48px_-12px_rgba(0,0,0,0.85)] lg:translate-x-0",
          "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-px before:bg-gradient-to-b before:from-indigo-500/50 before:via-violet-500/25 before:to-fuchsia-500/15",
          collapsed ? "w-[72px]" : "w-64",
          "max-lg:w-64 max-lg:transition-transform",
          !sidebarMobileOpen && "max-lg:-translate-x-full",
        )}
      >
        <div className="relative flex h-[4.25rem] min-h-[4.25rem] items-center justify-between gap-2 border-b border-zinc-200/60 bg-white/50 px-2 dark:border-zinc-800/80 dark:bg-zinc-950/40 sm:px-4">
          <div
            className={cn(
              "min-w-0 flex-1",
              collapsed && "flex justify-center",
            )}
          >
            {collapsed && branding.logoDataUrl ? (
              <Link href={toAdminPath()} className="block py-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={branding.logoDataUrl}
                  alt={branding.storeDisplayName}
                  className="mx-auto h-8 max-w-[44px] object-contain"
                />
              </Link>
            ) : collapsed ? (
              <span className="sr-only">{branding.storeDisplayName}</span>
            ) : (
              <BrandingLogo
                branding={branding}
                href={toAdminPath()}
                textClassName="text-[1.05rem] font-semibold tracking-[-0.02em]"
                imgClassName="h-8 max-h-9"
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-xl p-2.5 text-zinc-500 transition hover:bg-zinc-100/90 hover:text-zinc-800 dark:text-zinc-500 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 pb-6">
          {navItems.map((item) => {
            const isActive =
              item.internalPath === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.internalPath);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl py-3 pl-3 pr-3 text-[13px] font-semibold tracking-[-0.01em] transition-all duration-200",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/[0.14] via-violet-500/[0.08] to-transparent text-indigo-800 shadow-[0_0_0_1px_rgba(99,102,241,0.12),0_8px_28px_-12px_rgba(99,102,241,0.35)] dark:from-indigo-500/20 dark:via-violet-600/12 dark:to-transparent dark:text-indigo-100 dark:shadow-[0_0_0_1px_rgba(129,140,246,0.2),0_12px_40px_-16px_rgba(79,70,229,0.45)]"
                    : "text-zinc-600 hover:bg-zinc-100/90 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[0.05] dark:hover:text-white",
                  isActive &&
                    !collapsed &&
                    "before:absolute before:left-1 before:top-1/2 before:h-8 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-gradient-to-b before:from-indigo-400 before:to-violet-500 before:shadow-[0_0_12px_rgba(99,102,241,0.6)]",
                )}
              >
                <Icon
                  className={cn(
                    "h-[1.125rem] w-[1.125rem] shrink-0 transition-transform duration-200",
                    !isActive && "opacity-85 group-hover:scale-[1.04]",
                    isActive && "text-indigo-600 dark:text-indigo-300",
                  )}
                  strokeWidth={2}
                />
                {!collapsed && <span className="leading-snug">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

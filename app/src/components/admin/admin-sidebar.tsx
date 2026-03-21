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

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/atividade", label: "Atividade global", icon: Globe2 },
  { href: "/admin/plans", label: "Planos", icon: Package },
  { href: "/admin/codes", label: "Códigos", icon: Key },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/emails", label: "E-mails", icon: Mail },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
];

export function AdminSidebar({ branding }: { branding: SiteBrandingPublic }) {
  const pathname = usePathname();
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
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          sidebarMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarMobileOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-200/80 bg-white shadow-sm transition-[width,transform] duration-200 lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-64",
          "max-lg:w-64 max-lg:transition-transform",
          !sidebarMobileOpen && "max-lg:-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-zinc-100 px-2 sm:px-4">
          <div
            className={cn(
              "min-w-0 flex-1",
              collapsed && "flex justify-center",
            )}
          >
            {collapsed && branding.logoDataUrl ? (
              <Link href="/admin" className="block py-1">
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
                href="/admin"
                textClassName="text-lg font-semibold"
                imgClassName="h-8 max-h-9"
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-lg p-2.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--theme-soft)] text-[var(--theme-primary)]"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

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
import { useMediaQuery } from "@/hooks/use-media-query";

type NavEntry = {
  href: string;
  internalPath: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type NavGroup = { id: string; label: string; items: NavEntry[] };

const navGroups: NavGroup[] = [
  {
    id: "overview",
    label: "Visão geral",
    items: [
      { href: toAdminPath(), internalPath: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      {
        href: toAdminPath("atividade"),
        internalPath: "/admin/atividade",
        label: "Atividade global",
        icon: Globe2,
      },
    ],
  },
  {
    id: "catalog",
    label: "Catálogo",
    items: [
      { href: toAdminPath("plans"), internalPath: "/admin/plans", label: "Planos", icon: Package },
      { href: toAdminPath("codes"), internalPath: "/admin/codes", label: "Códigos", icon: Key },
    ],
  },
  {
    id: "sales",
    label: "Vendas",
    items: [
      { href: toAdminPath("orders"), internalPath: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
      { href: toAdminPath("customers"), internalPath: "/admin/customers", label: "Clientes", icon: Users },
    ],
  },
  {
    id: "system",
    label: "Sistema",
    items: [
      { href: toAdminPath("emails"), internalPath: "/admin/emails", label: "E-mails", icon: Mail },
      { href: toAdminPath("settings"), internalPath: "/admin/settings", label: "Configurações", icon: Settings },
    ],
  },
];

function flattenNavWithStaggerIndex(): Array<NavEntry & { staggerClass: string }> {
  const classes = [
    "admin-nav-stagger-1",
    "admin-nav-stagger-2",
    "admin-nav-stagger-3",
    "admin-nav-stagger-4",
    "admin-nav-stagger-5",
    "admin-nav-stagger-6",
    "admin-nav-stagger-7",
    "admin-nav-stagger-8",
  ];
  let i = 0;
  const out: Array<NavEntry & { staggerClass: string }> = [];
  for (const g of navGroups) {
    for (const item of g.items) {
      out.push({ ...item, staggerClass: classes[Math.min(i, classes.length - 1)]! });
      i += 1;
    }
  }
  return out;
}

function initialsFromEmail(email: string | undefined) {
  if (!email) return "A";
  const head = email.trim().split("@")[0] ?? "A";
  return head.slice(0, 1).toUpperCase();
}

export function AdminSidebar({
  branding,
  userEmail,
  compactNav,
}: {
  branding: SiteBrandingPublic;
  userEmail?: string;
  compactNav: boolean;
}) {
  const pathname = normalizeAdminPathname(usePathname() ?? "");
  const {
    sidebarCollapsed: collapsed,
    setSidebarCollapsed: setCollapsed,
    sidebarMobileOpen,
    setSidebarMobileOpen,
  } = useAdminLayout();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const effectiveCollapsed = collapsed || compactNav;
  const flatStagger = flattenNavWithStaggerIndex();

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
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--border-subtle)]",
          "bg-[linear-gradient(180deg,#0C0F18_0%,#080B12_100%)]",
          "transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0",
          effectiveCollapsed ? "w-[var(--admin-sidebar-w-collapsed)]" : "w-[var(--admin-sidebar-w)]",
          "max-lg:w-[var(--admin-sidebar-w)] max-lg:transition-transform",
          !sidebarMobileOpen && "max-lg:-translate-x-full",
        )}
      >
        <div
          className={cn(
            "relative flex h-16 min-h-16 shrink-0 items-center border-b border-[var(--border-subtle)]",
            effectiveCollapsed ? "justify-center px-2" : "justify-between gap-2 px-5",
          )}
        >
          <div
            className={cn("min-w-0", effectiveCollapsed ? "flex justify-center" : "flex-1")}
            onClick={() => setSidebarMobileOpen(false)}
          >
            {effectiveCollapsed && branding.logoDataUrl ? (
              <Link href={toAdminPath()} className="block py-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={branding.logoDataUrl}
                  alt={branding.storeDisplayName}
                  className="mx-auto h-8 max-w-9 object-contain [filter:drop-shadow(0_0_10px_var(--accent-purple-glow))]"
                />
              </Link>
            ) : effectiveCollapsed ? (
              <span className="sr-only">{branding.storeDisplayName}</span>
            ) : (
              <div className="[filter:drop-shadow(0_0_12px_var(--accent-purple-glow))]">
                <BrandingLogo
                  branding={branding}
                  href={toAdminPath()}
                  textClassName="text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]"
                  imgClassName="h-8 max-h-9"
                />
              </div>
            )}
          </div>
          {isLg && !compactNav ? (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className={cn(
                "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)]",
                "border border-[var(--border-default)] bg-[var(--bg-overlay)] text-[var(--text-secondary)] transition-all duration-150 ease-out",
                "hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]",
              )}
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? (
                <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2} />
              ) : (
                <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2} />
              )}
            </button>
          ) : null}
        </div>

        <nav className="admin-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-2 pt-3">
          {navGroups.map((group) => (
            <div key={group.id}>
              {!effectiveCollapsed ? (
                <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] first:pt-2">
                  {group.label}
                </p>
              ) : (
                <div className="mx-2 my-2 h-px bg-[var(--border-subtle)] first:mt-0" aria-hidden />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    item.internalPath === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.internalPath);
                  const Icon = item.icon;
                  const stagger =
                    flatStagger.find((x) => x.internalPath === item.internalPath)?.staggerClass ??
                    "";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarMobileOpen(false)}
                      className={cn(
                        "admin-anim-slide-in group relative flex h-10 cursor-pointer items-center rounded-[var(--radius-md)] px-3 transition-all duration-150 ease-out",
                        "mx-2 my-0.5",
                        effectiveCollapsed && "mx-1 justify-center px-0",
                        stagger,
                        isActive
                          ? "bg-[var(--accent-purple-dim)] font-semibold text-[var(--accent-purple)] [box-shadow:inset_3px_0_0_0_var(--accent-purple)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          isActive ? "text-[var(--accent-purple)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]",
                        )}
                        strokeWidth={2}
                      />
                      {!effectiveCollapsed ? (
                        <span className="ml-3 text-[13px] font-medium leading-none">{item.label}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto h-16 shrink-0 border-t border-[var(--border-subtle)] px-3">
          <div className={cn("flex h-full items-center gap-3", effectiveCollapsed && "justify-center px-0")}>
            <div className="relative shrink-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-surface-3)] text-sm font-semibold text-[var(--text-primary)] ring-2 ring-[var(--bg-base)]">
                {initialsFromEmail(userEmail)}
              </span>
              <span
                className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#22C55E] ring-2 ring-[var(--bg-base)]"
                aria-hidden
              />
            </div>
            {!effectiveCollapsed ? (
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                  {userEmail?.split("@")[0] ?? "Conta"}
                </p>
                <p className="truncate text-[11px] font-medium text-[var(--text-muted)]">Administrador</p>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}

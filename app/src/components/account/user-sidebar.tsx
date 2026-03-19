"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, KeyRound, ShoppingBag, User, X } from "lucide-react";
import { useAccountLayout } from "./account-layout-context";
import { LogoutButton } from "@/components/logout-button";
import { BrandingLogo } from "@/components/branding-logo";
import type { SiteBrandingPublic } from "@/lib/site-branding";

const navItems = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/access", label: "Meus acessos", icon: KeyRound },
  { href: "/account/orders", label: "Meus pedidos", icon: ShoppingBag },
  { href: "/account/profile", label: "Perfil", icon: User },
];

export function UserSidebar({ branding }: { branding: SiteBrandingPublic }) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAccountLayout();

  return (
    <>
      <div
        role="button"
        tabIndex={-1}
        className={cn(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-zinc-200/80 bg-white shadow-lg transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-4 lg:hidden">
          <BrandingLogo
            branding={branding}
            href="/account"
            textClassName="text-lg font-semibold"
            imgClassName="h-8 max-h-9"
          />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/account"
                ? pathname === "/account"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--theme-soft)] text-[var(--theme-primary)]"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="my-2 border-t border-zinc-100 pt-2">
            <LogoutButton variant="sidebar" />
          </div>
        </nav>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, ChevronDown, ExternalLink, LogOut, Menu, RefreshCw } from "lucide-react";
import { useAdminLayout } from "./admin-layout-context";
import { AdminThemeToggle } from "./admin-theme-toggle";
import { cn } from "@/lib/utils";
import { toAdminPath } from "@/lib/admin-path";

type AdminHeaderProps = {
  title: string;
  subtitle?: string;
  userEmail?: string;
};

function initialsFromEmail(email: string | undefined) {
  if (!email) return "A";
  return email.trim().slice(0, 1).toUpperCase();
}

export function AdminHeader({ title, subtitle, userEmail }: AdminHeaderProps) {
  const router = useRouter();
  const { setSidebarMobileOpen } = useAdminLayout();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/entrar");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-16 min-h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--border-subtle)]",
        "bg-[color-mix(in_srgb,var(--bg-base)_82%,transparent)] px-3 backdrop-blur-[20px] backdrop-saturate-[180%] sm:gap-4 sm:px-6",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarMobileOpen(true)}
          className={cn(
            "flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--radius-md)] lg:hidden",
            "border border-[var(--border-default)] bg-[var(--bg-overlay)] text-[var(--text-secondary)] transition-colors duration-150",
            "hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]",
          )}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-[var(--font-lg)] font-semibold leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
            {title}
          </h2>
          {subtitle ? (
            <p className="truncate text-[var(--font-sm)] leading-snug text-[var(--text-secondary)]">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-2.5">
        <AdminThemeToggle
          className={cn(
            "h-9 w-9 cursor-pointer rounded-full border border-[var(--border-default)] bg-[var(--bg-overlay)] p-0 shadow-none",
            "text-[var(--text-secondary)] hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)]",
          )}
        />
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "hidden cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-2 text-[var(--font-sm)] font-semibold",
            "text-[var(--text-secondary)] transition-all duration-150 sm:inline-flex",
            "hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)]",
          )}
        >
          <ExternalLink className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} />
          Ver site
        </Link>
        <button
          type="button"
          onClick={() => router.refresh()}
          className={cn(
            "hidden cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3.5 py-2 text-[var(--font-sm)] font-semibold text-[var(--text-inverse)] transition sm:inline-flex",
            "bg-[var(--accent-purple)] shadow-[var(--shadow-glow-purple)] hover:brightness-110",
          )}
          aria-label="Atualizar página"
        >
          <RefreshCw className="h-4 w-4 shrink-0 opacity-95" strokeWidth={2} />
          Atualizar
        </button>
        <Link
          href={toAdminPath("orders")}
          className={cn(
            "hidden cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3.5 py-2 text-[var(--font-sm)] font-semibold text-white transition sm:inline-flex",
            "bg-[linear-gradient(135deg,var(--accent-purple),#A78BFA)] shadow-[var(--shadow-glow-purple)]",
            "hover:translate-y-[-1px] hover:brightness-110",
          )}
        >
          <BarChart3 className="h-4 w-4 opacity-95" strokeWidth={2} />
          Ver pedidos
        </Link>

        {userEmail ? (
          <details className="relative hidden sm:block">
            <summary
              className={cn(
                "flex cursor-pointer list-none items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-2)] py-1.5 pl-1.5 pr-2.5",
                "text-[var(--font-sm)] font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)]",
                "[&::-webkit-details-marker]:hidden",
              )}
            >
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-surface-3)] text-xs font-semibold text-[var(--text-primary)]">
                {initialsFromEmail(userEmail)}
                <span
                  className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#22C55E] ring-2 ring-[var(--bg-surface-2)]"
                  aria-hidden
                />
              </span>
              <span className="max-w-[140px] truncate text-[12px] font-medium text-[var(--text-secondary)] lg:max-w-[200px]">
                {userEmail}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)]" strokeWidth={2} aria-hidden />
            </summary>
            <div
              className={cn(
                "absolute right-0 z-[60] mt-2 min-w-[200px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[color-mix(in_srgb,var(--bg-surface-1)_92%,transparent)] p-1 shadow-[var(--shadow-card)] backdrop-blur-xl",
              )}
            >
              <button
                type="button"
                onClick={() => void handleLogout()}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2.5 text-left text-[var(--font-sm)] font-semibold text-[var(--text-primary)] transition-colors",
                  "hover:bg-[var(--bg-overlay)]",
                )}
              >
                <LogOut className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={2} />
                Sair
              </button>
            </div>
          </details>
        ) : (
          <button
            type="button"
            onClick={() => void handleLogout()}
            className={cn(
              "hidden cursor-pointer items-center gap-2 rounded-full border border-[var(--border-default)] px-3 py-2 text-[var(--font-sm)] font-semibold sm:inline-flex",
              "text-[var(--text-secondary)] hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)]",
            )}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        )}
      </div>
    </header>
  );
}

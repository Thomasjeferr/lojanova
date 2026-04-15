"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut, Menu } from "lucide-react";
import { useAdminLayout } from "./admin-layout-context";
import { AdminThemeToggle } from "./admin-theme-toggle";

type AdminHeaderProps = {
  title: string;
  subtitle?: string;
  userEmail?: string;
};

export function AdminHeader({ title, subtitle, userEmail }: AdminHeaderProps) {
  const router = useRouter();
  const { setSidebarMobileOpen } = useAdminLayout();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/entrar");
    router.refresh();
  }

  return (
    <header className="relative sticky top-0 z-20 flex h-[4.25rem] min-h-[4.25rem] items-center justify-between gap-3 border-b border-zinc-200/70 bg-white/[0.88] px-3 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_8px_32px_-20px_rgba(15,23,42,0.12)] backdrop-blur-2xl backdrop-saturate-150 dark:border-zinc-800/70 dark:bg-zinc-950/[0.92] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_12px_40px_-24px_rgba(0,0,0,0.65)] sm:gap-4 sm:px-7">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent dark:via-indigo-400/20"
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarMobileOpen(true)}
          className="rounded-xl p-2.5 text-zinc-600 transition hover:bg-zinc-100/90 dark:text-zinc-300 dark:hover:bg-white/[0.06] lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-[1.125rem] font-semibold leading-tight tracking-[-0.02em] text-zinc-950 dark:text-white sm:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="truncate text-[13px] font-medium leading-snug tracking-tight text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        {userEmail && (
          <span
            className="hidden max-w-[220px] truncate rounded-xl border border-zinc-200/75 bg-gradient-to-b from-white to-zinc-50/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-600 shadow-sm dark:border-zinc-700/80 dark:from-zinc-900/90 dark:to-zinc-950/90 dark:text-zinc-300 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] lg:inline"
            title={userEmail}
          >
            {userEmail}
          </span>
        )}
        <AdminThemeToggle />
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold tracking-tight text-zinc-600 transition hover:border-zinc-200/80 hover:bg-white hover:text-zinc-900 dark:text-zinc-300 dark:hover:border-white/[0.08] dark:hover:bg-white/[0.05] dark:hover:text-white"
        >
          <ExternalLink className="h-4 w-4 shrink-0 opacity-80" />
          <span className="hidden sm:inline">Ver site</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold tracking-tight text-zinc-600 transition hover:border-zinc-200/80 hover:bg-white hover:text-zinc-900 dark:text-zinc-300 dark:hover:border-white/[0.08] dark:hover:bg-white/[0.05] dark:hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}

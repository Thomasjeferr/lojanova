"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut, Menu } from "lucide-react";
import { useAdminLayout } from "./admin-layout-context";

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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-zinc-200/80 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarMobileOpen(true)}
          className="rounded-xl p-2.5 text-zinc-600 hover:bg-zinc-100 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight text-zinc-900">
            {title}
          </h2>
          {subtitle && (
            <p className="truncate text-sm text-zinc-500">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {userEmail && (
          <span
            className="hidden max-w-[160px] truncate pl-2 text-sm text-zinc-500 md:inline"
            title={userEmail}
          >
            {userEmail}
          </span>
        )}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">Ver site</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}

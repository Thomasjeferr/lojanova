"use client";

import { Menu, LogOut } from "lucide-react";
import { useAccountLayout } from "./account-layout-context";
import { LogoutButton } from "@/components/logout-button";

type UserHeaderProps = {
  title: string;
  subtitle?: string;
  userName: string;
  userEmail: string;
};

export function UserHeader({ title, subtitle, userName, userEmail }: UserHeaderProps) {
  const { setSidebarOpen } = useAccountLayout();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-zinc-200/80 bg-white/95 px-4 backdrop-blur sm:h-18 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 sm:text-xl">{title}</h1>
          {subtitle && (
            <p className="text-sm text-zinc-500">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-zinc-900">{userName}</p>
          <p className="text-xs text-zinc-500">{userEmail}</p>
        </div>
        <LogoutButton variant="header">
          <LogOut className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Sair</span>
        </LogoutButton>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toAdminPath } from "@/lib/admin-path";

export function DashboardPageHeader({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "flex flex-col gap-6 border-b border-zinc-200/70 pb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Visão geral
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          Dashboard
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
          Acompanhe vendas, pedidos, estoque e performance da loja em um só lugar.
        </p>
      </div>
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl border-zinc-200/90 bg-white shadow-sm hover:bg-zinc-50"
          onClick={() => router.refresh()}
        >
          <RefreshCw className="h-4 w-4 text-zinc-500" aria-hidden />
          Atualizar
        </Button>
        <Link
          href={toAdminPath("orders")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
        >
          <BarChart3 className="h-4 w-4 opacity-90" aria-hidden />
          Ver pedidos
        </Link>
      </div>
    </header>
  );
}

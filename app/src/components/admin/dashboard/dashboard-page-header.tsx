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
        "relative flex flex-col gap-8 border-b border-zinc-200/65 pb-10 dark:border-zinc-800/70 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -left-4 top-0 h-24 w-40 rounded-full bg-gradient-to-br from-indigo-500/15 via-violet-500/8 to-transparent blur-2xl dark:from-indigo-500/25 dark:via-violet-600/12"
        aria-hidden
      />
      <div className="relative min-w-0 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
          Visão geral
        </p>
        <h1 className="bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-600 bg-clip-text text-[2rem] font-semibold leading-[1.1] tracking-[-0.035em] text-transparent dark:from-white dark:via-zinc-100 dark:to-zinc-500 sm:text-[2.35rem]">
          Dashboard
        </h1>
        <p className="max-w-[26rem] text-[15px] font-medium leading-relaxed tracking-tight text-zinc-600 dark:text-zinc-400">
          Acompanhe vendas, pedidos, estoque e performance da loja em um só lugar.
        </p>
      </div>
      <div className="relative flex flex-shrink-0 flex-wrap items-center gap-2.5 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl border-zinc-200/85 bg-white/90 font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm hover:bg-zinc-50 dark:border-zinc-600/50 dark:bg-zinc-900/80 dark:hover:bg-zinc-800/90"
          onClick={() => router.refresh()}
        >
          <RefreshCw className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
          Atualizar
        </Button>
        <Link
          href={toAdminPath("orders")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold tracking-tight text-white shadow-[0_8px_28px_-10px_rgba(79,70,229,0.55)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:from-indigo-500 dark:to-violet-600 dark:shadow-[0_12px_36px_-12px_rgba(99,102,241,0.55)]"
        >
          <BarChart3 className="h-4 w-4 opacity-90" aria-hidden />
          Ver pedidos
        </Link>
      </div>
    </header>
  );
}

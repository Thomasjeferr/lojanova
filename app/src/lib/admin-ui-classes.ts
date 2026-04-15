import { cn } from "@/lib/utils";

/**
 * Campo padrão do admin (input/select).
 * Use sempre com `theme-focus-input` — cores no escuro vêm de `globals.css` (`.dark .theme-focus-input`).
 */
export const adminFieldClass = cn(
  "theme-focus-input w-full min-w-0 rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition",
  "placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500",
);

/** Barra superior de filtros (pedidos, códigos, etc.) */
export const adminFilterBarClass = cn(
  "flex flex-col gap-3 rounded-[1.125rem] border border-zinc-200/65 bg-white/[0.92] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-24px_rgba(15,23,42,0.1)] backdrop-blur-md",
  "dark:border-zinc-700/45 dark:bg-zinc-900/75 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_20px_48px_-28px_rgba(0,0,0,0.65)]",
  "lg:flex-row lg:flex-wrap lg:items-center",
);

/** Faixa de paginação / contagem */
export const adminTableMetaBarClass = cn(
  "flex flex-col gap-3 rounded-[1.125rem] border border-zinc-200/65 bg-gradient-to-br from-zinc-50/95 to-white/90 px-4 py-3.5 text-sm font-medium shadow-sm",
  "dark:border-zinc-700/40 dark:from-zinc-900/80 dark:to-zinc-950/90 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]",
  "sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
);

/** Botão neutro (Anterior / Próxima) */
export const adminPaginationBtnClass = cn(
  "rounded-xl border border-zinc-200/90 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition",
  "hover:bg-zinc-50 hover:border-zinc-300/90",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
);

/** Link / botão secundário outline no admin */
export const adminOutlineBtnClass = cn(
  "inline-flex items-center justify-center rounded-xl border border-zinc-200/90 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition",
  "hover:bg-zinc-50 hover:border-zinc-300",
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
);

/** Faixa de estatísticas compactas (ex.: clientes) */
export const adminStatsStripClass = cn(
  "flex flex-wrap gap-4 rounded-2xl border border-zinc-200/75 bg-gradient-to-br from-white to-zinc-50/80 px-4 py-3.5 text-sm shadow-sm",
  "dark:border-zinc-800/80 dark:from-zinc-900/70 dark:to-zinc-950/50 dark:shadow-[0_8px_32px_-16px_rgba(0,0,0,0.5)]",
);

/** Banner de ação (sucesso / erro) */
export const adminBannerOkClass = cn(
  "rounded-2xl border px-4 py-3 text-sm shadow-sm",
  "border-emerald-200/90 bg-emerald-50/95 text-emerald-950",
  "dark:border-emerald-500/30 dark:bg-emerald-950/45 dark:text-emerald-100",
);

export const adminBannerErrClass = cn(
  "rounded-2xl border px-4 py-3 text-sm shadow-sm",
  "border-red-200/90 bg-red-50/95 text-red-900",
  "dark:border-red-500/35 dark:bg-red-950/45 dark:text-red-100",
);

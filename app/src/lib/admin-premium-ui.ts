import { cn } from "@/lib/utils";

/** Superfície principal de cards / painéis do admin (SaaS premium) */
export const adminPremiumCard = cn(
  "relative overflow-hidden rounded-[1.25rem] border border-zinc-200/60 bg-white",
  "shadow-[0_1px_2px_rgba(0,0,0,0.05),0_24px_56px_-28px_rgba(15,23,42,0.16)]",
  "dark:border-zinc-600/30 dark:bg-zinc-900/85",
  "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_32px_64px_-36px_rgba(0,0,0,0.88)]",
);

/** Faixa superior em gradiente (acabamento “produto”) */
export const adminPremiumCardAccent = cn(
  "pointer-events-none absolute inset-x-0 top-0 z-[1] h-[3px] bg-gradient-to-r",
  "from-indigo-500/90 via-violet-500/75 to-fuchsia-500/50 opacity-95",
  "dark:from-indigo-400/80 dark:via-violet-400/65 dark:to-fuchsia-500/40",
);

/** Cabeçalho interno de card com seção */
export const adminPremiumCardHeader = cn(
  "relative border-b border-zinc-100/80 bg-gradient-to-br from-zinc-50/98 via-white to-zinc-50/30 px-6 py-5",
  "dark:border-zinc-700/35 dark:from-zinc-900/95 dark:via-zinc-900/75 dark:to-zinc-950/90",
);

/** Título de seção dentro de cards */
export const adminPremiumHeading = cn(
  "text-[0.8125rem] font-semibold tracking-[-0.02em] text-zinc-900",
  "dark:text-zinc-50",
);

/** Subtítulo / meta */
export const adminPremiumSub = cn(
  "mt-1 text-[13px] leading-relaxed tracking-tight text-zinc-500",
  "dark:text-zinc-400",
);

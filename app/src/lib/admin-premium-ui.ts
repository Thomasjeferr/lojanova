import { cn } from "@/lib/utils";

/** Superfície principal de cards / painéis do admin (tokens CSS) */
export const adminPremiumCard = cn(
  "relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-2)]",
  "shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
);

/** Faixa superior em gradiente (acabamento “produto”) */
export const adminPremiumCardAccent = cn(
  "pointer-events-none absolute inset-x-0 top-0 z-[1] h-[2px] bg-gradient-to-r",
  "from-[var(--accent-purple)] via-[#A78BFA] to-[var(--accent-teal)] opacity-95",
);

/** Cabeçalho interno de card com seção */
export const adminPremiumCardHeader = cn(
  "relative border-b border-[var(--border-subtle)] bg-[var(--bg-surface-1)]/40 px-6 py-5",
);

/** Título de seção dentro de cards */
export const adminPremiumHeading = cn(
  "text-[0.8125rem] font-semibold tracking-[-0.02em] text-[var(--text-primary)]",
);

/** Subtítulo / meta */
export const adminPremiumSub = cn(
  "mt-1 text-[13px] leading-relaxed tracking-tight text-[var(--text-secondary)]",
);

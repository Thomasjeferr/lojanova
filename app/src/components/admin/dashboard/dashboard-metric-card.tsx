"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { cn, currencyBRL } from "@/lib/utils";
import {
  Clock,
  DollarSign,
  Layers,
  Package,
  ShoppingCart,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/** Identificadores serializáveis (Server → Client); o componente resolve o ícone Lucide aqui. */
export type DashboardMetricIconId =
  | "dollar-sign"
  | "trending-up"
  | "shopping-cart"
  | "clock"
  | "package"
  | "layers";

const METRIC_ICONS: Record<DashboardMetricIconId, LucideIcon> = {
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  "shopping-cart": ShoppingCart,
  clock: Clock,
  package: Package,
  layers: Layers,
};

export type DashboardMetricAccent = "purple" | "teal" | "blue" | "amber" | "purpleMuted" | "tealMuted";

const stripeByAccent: Record<DashboardMetricAccent, string> = {
  purple: "linear-gradient(90deg, var(--accent-purple), #A78BFA)",
  teal: "linear-gradient(90deg, var(--accent-teal), #34d399)",
  blue: "linear-gradient(90deg, var(--accent-blue), #60a5fa)",
  amber: "linear-gradient(90deg, var(--accent-amber), #fbbf24)",
  purpleMuted: "linear-gradient(90deg, var(--accent-purple), #94a3b8)",
  tealMuted: "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
};

const iconToneByAccent: Record<
  DashboardMetricAccent,
  { wrap: string; icon: string; glow: string }
> = {
  purple: {
    wrap: "bg-[var(--accent-purple-dim)] shadow-[inset_0_0_24px_var(--accent-purple-glow)]",
    icon: "text-[var(--accent-purple)]",
    glow: "",
  },
  teal: {
    wrap: "bg-[var(--accent-teal-dim)] shadow-[inset_0_0_24px_rgba(0,212,161,0.18)]",
    icon: "text-[var(--accent-teal)]",
    glow: "",
  },
  blue: {
    wrap: "bg-[var(--accent-blue-dim)] shadow-[inset_0_0_20px_rgba(59,130,246,0.2)]",
    icon: "text-[var(--accent-blue)]",
    glow: "",
  },
  amber: {
    wrap: "bg-[var(--accent-amber-dim)] shadow-[inset_0_0_20px_rgba(245,158,11,0.18)]",
    icon: "text-[var(--accent-amber)]",
    glow: "",
  },
  purpleMuted: {
    wrap: "bg-[var(--accent-purple-dim)] shadow-[inset_0_0_24px_var(--accent-purple-glow)]",
    icon: "text-[var(--accent-purple)]",
    glow: "",
  },
  tealMuted: {
    wrap: "bg-[var(--accent-teal-dim)] shadow-[inset_0_0_24px_rgba(0,212,161,0.18)]",
    icon: "text-[var(--accent-teal)]",
    glow: "",
  },
};

export type DashboardMetricCountUp =
  | { kind: "cents"; cents: number }
  | { kind: "int"; value: number };

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function useCountUp(target: number, enabled: boolean, durationMs = 1200) {
  const [v, setV] = useState(() => (enabled ? 0 : target));
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      queueMicrotask(() => setV(target));
      return;
    }
    queueMicrotask(() => setV(0));
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(t);
      setV(Math.round(from + (target - from) * eased));
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, enabled, durationMs]);

  return v;
}

function subscribeReducedMotion(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionClient() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServer() {
  return false;
}

type DashboardMetricCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: DashboardMetricIconId;
  accent: DashboardMetricAccent;
  className?: string;
  countUp?: DashboardMetricCountUp;
  trend?: { direction: "up" | "down"; label: string };
};

export function DashboardMetricCard({
  label,
  value,
  hint,
  icon,
  accent,
  className,
  countUp,
  trend,
}: DashboardMetricCardProps) {
  const Icon = METRIC_ICONS[icon];
  const tone = iconToneByAccent[accent];
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionClient,
    getReducedMotionServer,
  );
  const allowMotion = !reducedMotion;

  const targetNumber = countUp?.kind === "cents" ? countUp.cents : countUp?.kind === "int" ? countUp.value : null;
  const animated = useCountUp(
    targetNumber ?? 0,
    Boolean(countUp && targetNumber != null && allowMotion),
  );

  const displayValue = useMemo(() => {
    if (!countUp) return value;
    if (countUp.kind === "cents") return currencyBRL(animated);
    return animated;
  }, [animated, countUp, value]);

  return (
    <div
      className={cn(
        "admin-anim-fade-up group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-6 shadow-[var(--shadow-card)]",
        "transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-hover)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-0.5"
        style={{ background: stripeByAccent[accent] }}
        aria-hidden
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[var(--font-xs)] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {label}
          </p>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-transform duration-200 group-hover:scale-[1.03]",
              tone.wrap,
            )}
          >
            <Icon className={cn("h-5 w-5", tone.icon)} strokeWidth={2} aria-hidden />
          </div>
        </div>
        <div>
          <p className="text-[var(--font-2xl)] font-bold leading-none tracking-[-0.03em] text-[var(--text-primary)] tabular-nums">
            {displayValue}
          </p>
          {hint ? (
            <p className="mt-1 text-[var(--font-sm)] text-[var(--text-secondary)]">{hint}</p>
          ) : null}
          {trend ? (
            <span
              className={cn(
                "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[var(--font-xs)] font-semibold",
                trend.direction === "up"
                  ? "bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]"
                  : "bg-[var(--accent-red-dim)] text-[var(--accent-red)]",
              )}
            >
              {trend.direction === "up" ? "↑" : "↓"}
              {trend.label}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

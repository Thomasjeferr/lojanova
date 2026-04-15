import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type DashboardMetricAccent =
  | "violet"
  | "emerald"
  | "blue"
  | "amber"
  | "slate"
  | "rose";

const accentMap: Record<
  DashboardMetricAccent,
  { iconWrap: string; icon: string; glow: string }
> = {
  violet: {
    iconWrap:
      "bg-gradient-to-br from-violet-500/15 via-violet-500/8 to-transparent ring-1 ring-violet-500/10 dark:from-violet-500/25 dark:via-violet-500/10 dark:ring-violet-500/25",
    icon: "text-violet-600 dark:text-violet-300",
    glow: "from-violet-500/[0.07] to-transparent dark:from-violet-500/15",
  },
  emerald: {
    iconWrap:
      "bg-gradient-to-br from-emerald-500/15 via-emerald-500/8 to-transparent ring-1 ring-emerald-500/10 dark:from-emerald-500/25 dark:via-emerald-500/10 dark:ring-emerald-500/25",
    icon: "text-emerald-600 dark:text-emerald-300",
    glow: "from-emerald-500/[0.07] to-transparent dark:from-emerald-500/15",
  },
  blue: {
    iconWrap:
      "bg-gradient-to-br from-blue-500/15 via-blue-500/8 to-transparent ring-1 ring-blue-500/10 dark:from-blue-500/25 dark:via-blue-500/10 dark:ring-blue-500/25",
    icon: "text-blue-600 dark:text-blue-300",
    glow: "from-blue-500/[0.07] to-transparent dark:from-blue-500/15",
  },
  amber: {
    iconWrap:
      "bg-gradient-to-br from-amber-500/18 via-amber-500/8 to-transparent ring-1 ring-amber-500/12 dark:from-amber-500/25 dark:via-amber-500/10 dark:ring-amber-500/25",
    icon: "text-amber-600 dark:text-amber-300",
    glow: "from-amber-500/[0.07] to-transparent dark:from-amber-500/15",
  },
  slate: {
    iconWrap:
      "bg-gradient-to-br from-zinc-400/20 via-zinc-400/10 to-transparent ring-1 ring-zinc-300/40 dark:from-zinc-500/25 dark:via-zinc-600/15 dark:ring-zinc-600/40",
    icon: "text-zinc-600 dark:text-zinc-300",
    glow: "from-zinc-500/[0.05] to-transparent dark:from-zinc-500/15",
  },
  rose: {
    iconWrap:
      "bg-gradient-to-br from-rose-500/15 via-rose-500/8 to-transparent ring-1 ring-rose-500/10 dark:from-rose-500/25 dark:via-rose-500/10 dark:ring-rose-500/25",
    icon: "text-rose-600 dark:text-rose-300",
    glow: "from-rose-500/[0.06] to-transparent dark:from-rose-500/15",
  },
};

type DashboardMetricCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent: DashboardMetricAccent;
  className?: string;
};

export function DashboardMetricCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  className,
}: DashboardMetricCardProps) {
  const a = accentMap[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[1.25rem] border border-zinc-200/60 bg-white p-6",
        "shadow-[0_1px_2px_rgba(0,0,0,0.05),0_20px_48px_-28px_rgba(15,23,42,0.18)]",
        "transition duration-300 hover:-translate-y-1 hover:border-zinc-300/80 hover:shadow-[0_12px_40px_-20px_rgba(15,23,42,0.2)]",
        "dark:border-zinc-600/35 dark:bg-zinc-900/88",
        "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.055)_inset,0_28px_56px_-32px_rgba(0,0,0,0.82)]",
        "dark:hover:border-zinc-500/40 dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.07)_inset,0_32px_64px_-28px_rgba(0,0,0,0.88)]",
        "sm:p-7",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent opacity-70 dark:via-white/12"
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br opacity-95 blur-3xl transition duration-500 group-hover:opacity-100",
          a.glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            {label}
          </p>
          <p className="text-[1.75rem] font-semibold tracking-[-0.03em] text-zinc-950 tabular-nums dark:text-white sm:text-[2.125rem] sm:leading-[1.05]">
            {value}
          </p>
          {hint ? (
            <p className="text-[13px] font-medium leading-snug tracking-tight text-zinc-500 dark:text-zinc-400">
              {hint}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-[1.03]",
            a.iconWrap,
          )}
        >
          <Icon className={cn("h-6 w-6", a.icon)} strokeWidth={1.75} aria-hidden />
        </div>
      </div>
    </div>
  );
}

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
      "bg-gradient-to-br from-violet-500/15 via-violet-500/8 to-transparent ring-1 ring-violet-500/10",
    icon: "text-violet-600",
    glow: "from-violet-500/[0.07] to-transparent",
  },
  emerald: {
    iconWrap:
      "bg-gradient-to-br from-emerald-500/15 via-emerald-500/8 to-transparent ring-1 ring-emerald-500/10",
    icon: "text-emerald-600",
    glow: "from-emerald-500/[0.07] to-transparent",
  },
  blue: {
    iconWrap:
      "bg-gradient-to-br from-blue-500/15 via-blue-500/8 to-transparent ring-1 ring-blue-500/10",
    icon: "text-blue-600",
    glow: "from-blue-500/[0.07] to-transparent",
  },
  amber: {
    iconWrap:
      "bg-gradient-to-br from-amber-500/18 via-amber-500/8 to-transparent ring-1 ring-amber-500/12",
    icon: "text-amber-600",
    glow: "from-amber-500/[0.07] to-transparent",
  },
  slate: {
    iconWrap:
      "bg-gradient-to-br from-zinc-400/20 via-zinc-400/10 to-transparent ring-1 ring-zinc-300/40",
    icon: "text-zinc-600",
    glow: "from-zinc-500/[0.05] to-transparent",
  },
  rose: {
    iconWrap:
      "bg-gradient-to-br from-rose-500/15 via-rose-500/8 to-transparent ring-1 ring-rose-500/10",
    icon: "text-rose-600",
    glow: "from-rose-500/[0.06] to-transparent",
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
        "group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.06)] transition duration-300 hover:border-zinc-300/90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_40px_-8px_rgba(0,0,0,0.08)] sm:p-7",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-90 blur-2xl transition duration-500 group-hover:opacity-100",
          a.glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            {label}
          </p>
          <p className="text-3xl font-semibold tracking-tight text-zinc-950 tabular-nums sm:text-[2rem] sm:leading-none">
            {value}
          </p>
          {hint ? (
            <p className="text-xs font-medium text-zinc-400">{hint}</p>
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

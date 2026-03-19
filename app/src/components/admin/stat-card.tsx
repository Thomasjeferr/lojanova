import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "muted";
  className?: string;
};

const variantStyles = {
  default: "bg-white border-zinc-200/80",
  success:
    "bg-white border-zinc-200/80 [&_.stat-icon]:bg-emerald-50 [&_.stat-icon]:text-emerald-600",
  warning:
    "bg-white border-zinc-200/80 [&_.stat-icon]:bg-amber-50 [&_.stat-icon]:text-amber-600",
  muted:
    "bg-white border-zinc-100 [&_.stat-icon]:bg-zinc-100 [&_.stat-icon]:text-zinc-500",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "stat-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            variant === "default" && "theme-icon-tile",
            variant === "success" && "bg-emerald-50 text-emerald-600",
            variant === "warning" && "bg-amber-50 text-amber-600",
            variant === "muted" && "bg-zinc-100 text-zinc-500",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

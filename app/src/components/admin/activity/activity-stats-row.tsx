import { Globe2, Clock, Users, Activity } from "lucide-react";
import type { ActivityDashboardSummaryDTO } from "@/lib/activity-admin";
import { countryCodeToFlagEmoji } from "@/lib/country-flag-emoji";
import { formatDateTimePtBr } from "@/lib/brazil-time";
import { cn } from "@/lib/utils";

function lastActivityLabel(
  last: ActivityDashboardSummaryDTO["lastActivity"],
): string {
  if (!last) return "—";
  if (last.type === "purchase" && last.amountCents != null) {
    return "Compra";
  }
  if (last.type === "login") return "Login";
  return "Acesso";
}

type ActivityStatsRowProps = {
  summary: ActivityDashboardSummaryDTO;
  className?: string;
};

export function ActivityStatsRow({ summary, className }: ActivityStatsRowProps) {
  const topFlag = countryCodeToFlagEmoji(summary.topCountryCode);
  const topLabel = summary.topCountryCode
    ? `${topFlag} ${summary.topCountryCode}`
    : "—";

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4",
        className,
      )}
    >
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-none">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          <Activity className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
          Acessos hoje
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-950 dark:text-white">
          {summary.todayCount}
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Eventos registrados (Brasília)
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-none">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          <Globe2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
          País líder (30 dias)
        </div>
        <p className="mt-2 text-xl font-semibold text-zinc-950 dark:text-white">{topLabel}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {summary.topCountryCount > 0
            ? `${summary.topCountryCount} eventos`
            : "Sem dados"}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-none">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          <Clock className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
          Última atividade
        </div>
        <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {lastActivityLabel(summary.lastActivity)}
        </p>
        <p className="mt-1 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
          {summary.lastActivity
            ? formatDateTimePtBr(summary.lastActivity.createdAt)
            : "—"}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-none">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          <Users className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
          Sessões ativas
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-950 dark:text-white">
          {summary.sessionsOnline}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Tokens válidos (estimativa de uso)
        </p>
      </div>
    </div>
  );
}

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
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          <Activity className="h-3.5 w-3.5 text-violet-500" />
          Acessos hoje
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-950">
          {summary.todayCount}
        </p>
        <p className="mt-1 text-xs text-zinc-500">Eventos registrados (Brasília)</p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          <Globe2 className="h-3.5 w-3.5 text-blue-500" />
          País líder (30 dias)
        </div>
        <p className="mt-2 text-xl font-semibold text-zinc-950">{topLabel}</p>
        <p className="mt-1 text-xs text-zinc-500">
          {summary.topCountryCount > 0
            ? `${summary.topCountryCount} eventos`
            : "Sem dados"}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          Última atividade
        </div>
        <p className="mt-2 text-sm font-semibold text-zinc-900">
          {lastActivityLabel(summary.lastActivity)}
        </p>
        <p className="mt-1 text-xs tabular-nums text-zinc-500">
          {summary.lastActivity
            ? formatDateTimePtBr(summary.lastActivity.createdAt)
            : "—"}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          <Users className="h-3.5 w-3.5 text-emerald-500" />
          Sessões ativas
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-950">
          {summary.sessionsOnline}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Tokens válidos (estimativa de uso)
        </p>
      </div>
    </div>
  );
}

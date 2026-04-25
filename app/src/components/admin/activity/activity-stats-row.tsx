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

function MiniStat({
  icon: Icon,
  label,
  children,
  sub,
  accentClass,
}: {
  icon: typeof Activity;
  label: string;
  children: React.ReactNode;
  sub: React.ReactNode;
  accentClass: string;
}) {
  return (
    <div
      className={cn(
        "flex h-16 min-h-16 items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 shadow-[var(--shadow-card)] transition hover:border-[var(--border-strong)] sm:px-4",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface-3)]",
          accentClass,
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[var(--font-xs)] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {label}
        </p>
        <div className="truncate text-sm font-semibold text-[var(--text-primary)]">{children}</div>
        <p className="truncate text-[11px] text-[var(--text-secondary)]">{sub}</p>
      </div>
    </div>
  );
}

export function ActivityStatsRow({ summary, className }: ActivityStatsRowProps) {
  const topFlag = countryCodeToFlagEmoji(summary.topCountryCode);
  const topLabel = summary.topCountryCode ? `${topFlag} ${summary.topCountryCode}` : "—";

  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4", className)}>
      <MiniStat
        icon={Activity}
        label="Acessos hoje"
        accentClass="text-[var(--accent-purple)]"
        sub="Eventos registrados (Brasília)"
      >
        <span className="tabular-nums text-lg font-bold">{summary.todayCount}</span>
      </MiniStat>
      <MiniStat
        icon={Globe2}
        label="País líder (30 dias)"
        accentClass="text-[var(--accent-blue)]"
        sub={
          summary.topCountryCount > 0 ? `${summary.topCountryCount} eventos` : "Sem dados"
        }
      >
        {topLabel}
      </MiniStat>
      <MiniStat
        icon={Clock}
        label="Última atividade"
        accentClass="text-[var(--accent-amber)]"
        sub={
          summary.lastActivity ? formatDateTimePtBr(summary.lastActivity.createdAt) : "—"
        }
      >
        {lastActivityLabel(summary.lastActivity)}
      </MiniStat>
      <MiniStat
        icon={Users}
        label="Sessões ativas"
        accentClass="text-[var(--accent-teal)]"
        sub="Tokens válidos (estimativa)"
      >
        <span className="tabular-nums text-lg font-bold">{summary.sessionsOnline}</span>
      </MiniStat>
    </div>
  );
}

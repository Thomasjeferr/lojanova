import Link from "next/link";
import { Globe2, ChevronRight } from "lucide-react";
import type {
  ActivityDashboardSummaryDTO,
  ActivityMapPointDTO,
  ActivityRecentDTO,
} from "@/lib/activity-admin";
import { ActivityWorldMap } from "./activity-world-map";
import { ActivityRecentFeed } from "./activity-recent-feed";
import { ActivityStatsRow } from "./activity-stats-row";
import { cn } from "@/lib/utils";
import { toAdminPath } from "@/lib/admin-path";

type ActivityGlobalSectionProps = {
  points: ActivityMapPointDTO[];
  summary: ActivityDashboardSummaryDTO;
  initialRecent: ActivityRecentDTO[];
};

export function ActivityGlobalSection({
  points,
  summary,
  initialRecent,
}: ActivityGlobalSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-5 shadow-[var(--shadow-card)] sm:p-7 lg:p-8",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-purple)]/35 to-transparent"
        aria-hidden
      />

      <div className="relative space-y-6 sm:space-y-8">
        <div className="admin-section-head !mb-5 flex flex-col gap-4 sm:!mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="admin-section-head__accent" aria-hidden />
            <div className="min-w-0">
              <p className="mb-2 inline-flex items-center gap-2 text-[var(--font-xs)] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                <span className="admin-pulse-dot" aria-hidden />
                Tempo quase real
              </p>
              <h2 className="admin-section-head__title text-[var(--font-xl)] sm:text-2xl">Atividade global</h2>
              <p className="admin-section-head__sub max-w-2xl text-[var(--font-md)]">
                Origem aproximada de logins, acessos e compras. Abra a visão completa para lista ao vivo e
                filtros avançados.
              </p>
            </div>
          </div>
          <Link
            href={toAdminPath("atividade")}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--font-sm)] font-semibold text-[var(--text-inverse)] sm:self-auto",
              "bg-[linear-gradient(135deg,var(--accent-purple),#A78BFA)] shadow-[var(--shadow-glow-purple)] transition hover:translate-y-[-1px] hover:brightness-110",
            )}
          >
            Mapa completo
            <ChevronRight className="h-4 w-4 opacity-90" strokeWidth={2} />
          </Link>
        </div>

        <ActivityStatsRow summary={summary} />

        <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-stretch lg:gap-6 xl:grid-cols-[1.45fr_1fr] xl:gap-8 2xl:grid-cols-[1.5fr_1fr]">
          <div className="order-1 flex min-h-0 min-w-0 flex-col min-h-[min(44vh,420px)] lg:min-h-[min(58vh,600px)]">
            <ActivityWorldMap points={points} minHeight={400} embedded />
          </div>
          <div className="order-2 flex min-h-0 min-w-0 flex-col">
            <div className="mb-2.5 flex items-center gap-2 sm:mb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-purple-dim)] text-[var(--accent-purple)] ring-1 ring-[var(--border-subtle)]">
                <Globe2 className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              <div>
                <p className="text-[var(--font-xs)] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Feed resumido
                </p>
                <p className="text-[var(--font-sm)] font-semibold text-[var(--text-primary)]">Últimos eventos</p>
              </div>
            </div>
            <div className="min-h-0 min-w-0 flex-1">
              <ActivityRecentFeed initialEvents={initialRecent} pollMs={32000} compact />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

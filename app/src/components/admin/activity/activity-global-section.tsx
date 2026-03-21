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
        "relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-gradient-to-br from-zinc-50/90 via-white to-violet-50/20 p-6 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.12)] sm:p-8",
      )}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />
      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600/80">
              Tempo quase real
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Atividade global
            </h2>
            <p className="mt-1 max-w-xl text-sm text-zinc-500">
              Origem aproximada de logins, acessos e compras. Abra a visão
              completa para lista ao vivo.
            </p>
          </div>
          <Link
            href="/admin/atividade"
            className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/15 transition hover:bg-zinc-800"
          >
            Mapa completo
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <ActivityStatsRow summary={summary} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="min-h-[280px] lg:min-h-[320px]">
            <ActivityWorldMap points={points} minHeight={280} embedded />
          </div>
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <Globe2 className="h-4 w-4 text-violet-500" />
              Feed resumido
            </div>
            <ActivityRecentFeed
              initialEvents={initialRecent}
              pollMs={32000}
              compact
            />
          </div>
        </div>
      </div>
    </section>
  );
}

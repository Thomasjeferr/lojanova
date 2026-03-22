import Link from "next/link";
import { Globe2, ChevronRight, Sparkles } from "lucide-react";
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
        "relative overflow-hidden rounded-3xl border border-zinc-200/75",
        "bg-gradient-to-br from-zinc-50/95 via-white to-violet-50/25",
        "p-5 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.02)]",
        "sm:p-7 lg:p-8",
      )}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-400/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-blue-400/8 blur-3xl" />

      <div className="relative space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 max-w-2xl space-y-2">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600/85">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" aria-hidden />
              Tempo quase real
            </p>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-[1.65rem] lg:leading-tight">
              Atividade global
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-[15px]">
              Origem aproximada de logins, acessos e compras. Abra a visão
              completa para lista ao vivo e filtros avançados.
            </p>
          </div>
          <Link
            href="/admin/atividade"
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl px-4 py-2.5 text-sm font-semibold text-white",
              "bg-zinc-900 shadow-lg shadow-zinc-900/20 transition-all duration-200",
              "hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/25 active:scale-[0.98]",
            )}
          >
            Mapa completo
            <ChevronRight className="h-4 w-4 opacity-90" />
          </Link>
        </div>

        <ActivityStatsRow summary={summary} />

        <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex min-h-0 min-w-0 flex-col">
            <ActivityWorldMap points={points} minHeight={280} embedded />
          </div>
          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="mb-2.5 flex items-center gap-2 sm:mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100/90 text-violet-600 ring-1 ring-violet-200/80">
                <Globe2 className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600/80">
                  Feed resumido
                </p>
                <p className="text-sm font-semibold text-zinc-800">
                  Últimos eventos
                </p>
              </div>
            </div>
            <div className="min-h-0 min-w-0 flex-1">
              <ActivityRecentFeed
                initialEvents={initialRecent}
                pollMs={32000}
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

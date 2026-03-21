import { Suspense } from "react";
import {
  getActivityMapPointsForQuery,
  getActivityRecentForQuery,
  getAnalyticsStatsPayload,
} from "@/lib/activity-analytics";
import { buildDemoActivityFeed } from "@/lib/analytics-demo-feed";
import { parseAnalyticsQueryParams } from "@/lib/analytics-params";
import { ActivityWorkspace } from "@/components/admin/activity/activity-workspace";

type SearchParamsInput = Record<string, string | string[] | undefined>;

function toURLSearchParams(raw: SearchParamsInput): URLSearchParams {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string") u.set(k, v);
    else if (Array.isArray(v) && typeof v[0] === "string") u.set(k, v[0]);
  }
  return u;
}

type PageProps = {
  searchParams?: Promise<SearchParamsInput>;
};

export default async function AdminActivityPage({ searchParams }: PageProps) {
  const raw = searchParams ? await searchParams : {};
  const q = parseAnalyticsQueryParams(toURLSearchParams(raw));

  const [points, events, stats] = await Promise.all([
    getActivityMapPointsForQuery(q),
    getActivityRecentForQuery(q, 20),
    getAnalyticsStatsPayload(q),
  ]);

  const seed = {
    query: q,
    points,
    events,
    demoActivityFeed: buildDemoActivityFeed(),
    stats,
  };

  return (
    <div className="relative space-y-8 pb-8">
      <Suspense
        fallback={
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-12 text-center text-sm text-zinc-500">
            Carregando analytics…
          </div>
        }
      >
        <ActivityWorkspace
          seed={seed}
          showBackLink
          mapMinHeight={460}
        />
      </Suspense>
    </div>
  );
}

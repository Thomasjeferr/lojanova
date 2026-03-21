"use client";

import type { AnalyticsPageSeed } from "@/lib/activity-analytics";
import { AnalyticsDashboard } from "@/components/admin/analytics/analytics-dashboard";

type ActivityWorkspaceProps = {
  seed: AnalyticsPageSeed;
  showBackLink?: boolean;
  mapMinHeight?: number;
};

/**
 * Workspace de atividade / analytics (mapa avançado, feed, KPIs, gráficos).
 */
export function ActivityWorkspace({
  seed,
  showBackLink = false,
  mapMinHeight = 440,
}: ActivityWorkspaceProps) {
  return (
    <AnalyticsDashboard
      seed={seed}
      showBackLink={showBackLink}
      mapMinHeight={mapMinHeight}
    />
  );
}

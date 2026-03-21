import { forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { parseAnalyticsQueryParams } from "@/lib/analytics-params";
import { getActivityRecentForQuery } from "@/lib/activity-analytics";
import {
  ANALYTICS_REALTIME_POLL_MS,
  defaultRealtimeMeta,
} from "@/lib/analytics-realtime";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const q = parseAnalyticsQueryParams(searchParams);
    const rawLimit = searchParams.get("limit");
    const limit = rawLimit
      ? Math.min(40, Math.max(5, Number.parseInt(rawLimit, 10) || 20))
      : 20;
    const events = await getActivityRecentForQuery(q, limit);
    return ok({
      events,
      meta: {
        ...defaultRealtimeMeta(),
        pollIntervalMs: ANALYTICS_REALTIME_POLL_MS,
      },
    });
  } catch {
    return forbidden();
  }
}

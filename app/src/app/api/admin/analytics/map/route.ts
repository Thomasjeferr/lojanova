import { forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { parseAnalyticsQueryParams } from "@/lib/analytics-params";
import { getActivityMapPointsForQuery } from "@/lib/activity-analytics";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const q = parseAnalyticsQueryParams(new URL(request.url).searchParams);
    const points = await getActivityMapPointsForQuery(q);
    return ok({
      points,
      meta: {
        query: q,
        maxSample: 500,
        aggregated: true,
      },
    });
  } catch {
    return forbidden();
  }
}

import { forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { parseAnalyticsQueryParams } from "@/lib/analytics-params";
import { getAnalyticsStatsPayload } from "@/lib/activity-analytics";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const q = parseAnalyticsQueryParams(new URL(request.url).searchParams);
    const payload = await getAnalyticsStatsPayload(q);
    return ok(payload);
  } catch {
    return forbidden();
  }
}

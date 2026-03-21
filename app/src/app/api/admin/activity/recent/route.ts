import { forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { getActivityRecent } from "@/lib/activity-admin";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("limit");
    const limit = raw ? Math.min(80, Math.max(5, Number.parseInt(raw, 10) || 40)) : 40;
    const events = await getActivityRecent(limit);
    return ok({ events });
  } catch {
    return forbidden();
  }
}

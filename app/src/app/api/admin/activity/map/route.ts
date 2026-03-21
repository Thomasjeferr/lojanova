import { forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { getActivityMapPoints } from "@/lib/activity-admin";

export async function GET() {
  try {
    await requireAdmin();
    const points = await getActivityMapPoints();
    return ok({ points });
  } catch {
    return forbidden();
  }
}

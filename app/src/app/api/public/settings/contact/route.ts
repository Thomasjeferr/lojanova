import { ok } from "@/lib/http";
import { getPublicContactSettings } from "@/lib/contact-settings";

export async function GET() {
  const settings = await getPublicContactSettings();
  return ok({ settings });
}


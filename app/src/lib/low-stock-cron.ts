import { prisma } from "@/lib/prisma";
import { sendLowStockAlertEmail } from "@/lib/email";
import { getPublicSiteBaseUrl } from "@/lib/public-site-url";
import { getSiteBranding } from "@/lib/site-branding";

const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_STORE = "Loja Digital";

export type LowStockCronResult = {
  sent: boolean;
  skippedReason?:
    | "disabled"
    | "no_resend"
    | "cooldown"
    | "no_recipient"
    | "no_low_plans"
    | "send_failed"
    | "no_settings_row";
  planCount?: number;
};

export async function runLowStockAlertJob(): Promise<LowStockCronResult> {
  const settings = await prisma.appSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    return { sent: false, skippedReason: "no_settings_row" };
  }

  if (!settings.lowStockAlertEnabled) {
    return { sent: false, skippedReason: "disabled" };
  }

  if (!process.env.RESEND_API_KEY?.trim()) {
    return { sent: false, skippedReason: "no_resend" };
  }

  const threshold = settings.lowStockThreshold;
  const lastSent = settings.lowStockAlertLastSentAt;
  if (lastSent && Date.now() - lastSent.getTime() < COOLDOWN_MS) {
    return { sent: false, skippedReason: "cooldown" };
  }

  const notifyRaw = settings.lowStockNotifyEmail?.trim();
  const fallbackAdmin = process.env.ADMIN_EMAIL?.trim();
  const to = notifyRaw || fallbackAdmin;
  if (!to) {
    return { sent: false, skippedReason: "no_recipient" };
  }

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    select: {
      title: true,
      _count: {
        select: { codes: { where: { status: "available" } } },
      },
    },
  });

  const items = plans
    .filter((p) => p._count.codes <= threshold)
    .map((p) => ({ planTitle: p.title, available: p._count.codes }))
    .sort((a, b) => a.available - b.available);

  if (items.length === 0) {
    return { sent: false, skippedReason: "no_low_plans" };
  }

  let storeName = process.env.EMAIL_STORE_NAME?.trim() || DEFAULT_STORE;
  try {
    const branding = await getSiteBranding();
    if (!process.env.EMAIL_STORE_NAME?.trim() && branding.storeDisplayName) {
      storeName = branding.storeDisplayName;
    }
  } catch {
    /* mantém storeName */
  }

  const appUrl = getPublicSiteBaseUrl();
  const adminCodesUrl = `${appUrl}/admin/codes`;

  const ok = await sendLowStockAlertEmail({
    to,
    storeName,
    threshold,
    adminCodesUrl,
    items,
  });

  if (!ok) {
    return { sent: false, skippedReason: "send_failed" };
  }

  await prisma.appSettings.update({
    where: { id: "default" },
    data: { lowStockAlertLastSentAt: new Date() },
  });

  return { sent: true, planCount: items.length };
}

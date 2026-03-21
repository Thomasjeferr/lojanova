import { createHash } from "node:crypto";

/** Hash estável do IP para agrupar eventos (nunca armazena IP em claro). */
export function hashClientIp(ip: string | null | undefined): string | null {
  if (!ip || ip === "unknown") return null;
  const trimmed = ip.trim();
  if (!trimmed || trimmed.startsWith("127.") || trimmed === "::1") return null;
  const salt =
    process.env.ACTIVITY_IP_SALT ??
    process.env.JWT_SECRET ??
    "dev-activity-ip";
  return createHash("sha256").update(`${salt}:${trimmed}`).digest("hex");
}

export function truncateUserAgent(ua: string | null | undefined): string | null {
  if (!ua?.trim()) return null;
  return ua.trim().slice(0, 512);
}

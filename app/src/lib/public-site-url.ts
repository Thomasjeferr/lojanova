/**
 * Domínio público da loja em produção (instruções de webhook no admin).
 * Usado quando APP_URL aponta para localhost ou está vazio.
 */
export const PRODUCTION_PUBLIC_SITE_URL = "https://iplay5plus.app";

/**
 * URL base pública (sem barra final) para links em SMS, e-mail e cron.
 * Evita `localhost` quando APP_URL não foi definida na Vercel.
 */
export function getPublicSiteBaseUrl(): string {
  const fromEnv = process.env.APP_URL?.trim().replace(/\/+$/, "") ?? "";

  const isNonLocal =
    fromEnv &&
    /^https?:\/\//i.test(fromEnv) &&
    !/localhost/i.test(fromEnv) &&
    !/127\.0\.0\.1/.test(fromEnv);

  if (isNonLocal) return fromEnv;

  if (process.env.NODE_ENV !== "production") {
    return fromEnv || "http://localhost:3000";
  }

  if (process.env.VERCEL_ENV === "preview") {
    const host = process.env.VERCEL_URL?.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    if (host) return `https://${host}`;
  }

  if (process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production") {
    return PRODUCTION_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }

  const vercelHost = process.env.VERCEL_URL?.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  if (vercelHost) return `https://${vercelHost}`;

  return PRODUCTION_PUBLIC_SITE_URL.replace(/\/+$/, "");
}

/**
 * Resolve a URL base para exibir nas instruções do admin (webhooks GGPIX / Woovi).
 * Em desenvolvimento, usa o domínio real de produção para o cliente copiar no painel do gateway.
 */
export function resolvePublicSiteUrlForAdminDocs(appUrlFromEnv: string): string {
  const trimmed = appUrlFromEnv.trim().replace(/\/+$/, "");
  if (
    trimmed &&
    !/localhost/i.test(trimmed) &&
    !/127\.0\.0\.1/.test(trimmed) &&
    trimmed.startsWith("http")
  ) {
    return trimmed;
  }
  return PRODUCTION_PUBLIC_SITE_URL;
}

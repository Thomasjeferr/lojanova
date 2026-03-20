/**
 * Domínio público da loja em produção (instruções de webhook no admin).
 * Usado quando APP_URL aponta para localhost ou está vazio.
 */
export const PRODUCTION_PUBLIC_SITE_URL = "https://iplay5plus.app";

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

const DEFAULT_ADMIN_SEGMENT = "admin";

function cleanSegment(raw: string | undefined): string {
  const t = (raw ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (!t) return DEFAULT_ADMIN_SEGMENT;
  return t.toLowerCase();
}

export function getAdminSegment(): string {
  return cleanSegment(process.env.NEXT_PUBLIC_ADMIN_PATH);
}

export function getAdminBasePath(): string {
  return `/${getAdminSegment()}`;
}

export function toAdminPath(path = ""): string {
  const base = getAdminBasePath();
  const suffix = path.trim().replace(/^\/+/, "");
  return suffix ? `${base}/${suffix}` : base;
}

/** Normaliza a rota secreta para o namespace interno "/admin". */
export function normalizeAdminPathname(pathname: string): string {
  const segment = getAdminSegment();
  const base = `/${segment}`;
  if (segment === DEFAULT_ADMIN_SEGMENT) return pathname;
  if (pathname === base) return `/${DEFAULT_ADMIN_SEGMENT}`;
  if (pathname.startsWith(`${base}/`)) {
    return `/${DEFAULT_ADMIN_SEGMENT}${pathname.slice(base.length)}`;
  }
  return pathname;
}

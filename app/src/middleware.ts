import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DEFAULT_ADMIN_SEGMENT = "admin";

function cleanAdminSegment(raw: string | undefined): string {
  const t = (raw ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (!t) return DEFAULT_ADMIN_SEGMENT;
  return t.toLowerCase();
}

/**
 * Google e outros clientes pedem /favicon.ico por convenção.
 * O favicon dinâmico (marca no admin) é servido em /icon.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/favicon.ico") {
    return NextResponse.rewrite(new URL("/icon", request.url));
  }

  // Rota administrativa privada por env var (default: /admin).
  const adminSegment = cleanAdminSegment(process.env.NEXT_PUBLIC_ADMIN_PATH);
  if (adminSegment !== DEFAULT_ADMIN_SEGMENT) {
    const privateBase = `/${adminSegment}`;
    const isDefaultAdminRoute =
      pathname === `/${DEFAULT_ADMIN_SEGMENT}` ||
      pathname.startsWith(`/${DEFAULT_ADMIN_SEGMENT}/`);
    if (isDefaultAdminRoute) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const isPrivateAdminRoute = pathname === privateBase || pathname.startsWith(`${privateBase}/`);
    if (isPrivateAdminRoute) {
      const rewritten = pathname === privateBase
        ? `/${DEFAULT_ADMIN_SEGMENT}`
        : `/${DEFAULT_ADMIN_SEGMENT}${pathname.slice(privateBase.length)}`;
      return NextResponse.rewrite(new URL(rewritten, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};

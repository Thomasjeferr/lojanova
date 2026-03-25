import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Google e outros clientes pedem /favicon.ico por convenção.
 * O favicon dinâmico (marca no admin) é servido em /icon.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/favicon.ico") {
    return NextResponse.rewrite(new URL("/icon", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/favicon.ico",
};

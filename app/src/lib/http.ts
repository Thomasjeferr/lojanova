import { NextResponse } from "next/server";

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function badRequest(message: string, issues?: unknown) {
  return NextResponse.json({ error: message, issues }, { status: 400 });
}

export function unauthorized(message = "Não autenticado") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Acesso negado") {
  return NextResponse.json({ error: message }, { status: 403 });
}

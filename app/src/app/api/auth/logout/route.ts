import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/auth";

/** Encerra sessão. Apenas POST (evita logout CSRF via GET / link malicioso). */
export async function POST() {
  await clearSessionCookies();
  return NextResponse.json({ ok: true, message: "Sessão encerrada" });
}

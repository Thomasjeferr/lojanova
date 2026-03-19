"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/entrar");
    router.refresh();
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/admin" className="font-semibold text-zinc-800">
          Painel admin
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
            Ver site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}

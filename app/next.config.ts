import type { NextConfig } from "next";

/** Sem `turbopack.root` aqui: na Vercel, `outputFileTracingRoot` e `turbopack.root` precisam coincidir — o default evita o warning e mantém o build alinhado. */
const nextConfig: NextConfig = {};

export default nextConfig;

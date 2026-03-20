import type { NextConfig } from "next";

/**
 * Local: forçamos a raiz do Turbopack para a pasta `app` para evitar
 * resolução errada de dependências quando há múltiplos package-lock no sistema.
 * Vercel: não definimos, pois a plataforma controla `outputFileTracingRoot`.
 */
const nextConfig: NextConfig = process.env.VERCEL
  ? {}
  : {
      turbopack: {
        root: __dirname,
      },
    };

export default nextConfig;

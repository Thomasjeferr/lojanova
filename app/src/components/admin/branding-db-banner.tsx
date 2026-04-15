export function BrandingDbBanner() {
  return (
    <div className="rounded-2xl border border-amber-300/90 bg-gradient-to-br from-amber-50 to-orange-50/40 px-4 py-4 text-sm text-amber-950 shadow-sm dark:border-amber-500/35 dark:from-amber-950/60 dark:to-orange-950/30 dark:text-amber-100">
      <p className="font-semibold">Tabela de identidade visual ainda não existe no banco</p>
      <p className="mt-2 text-amber-900/90 dark:text-amber-200/90">
        Pare o servidor (<code className="rounded bg-amber-200/60 px-1 dark:bg-amber-500/25">npm run dev</code>), abra o
        terminal na pasta <code className="rounded bg-amber-200/60 px-1 dark:bg-amber-500/25">app</code> e execute:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-xl border border-amber-200/50 bg-amber-900/10 p-3 font-mono text-xs dark:border-amber-500/20 dark:bg-black/25">
        npx prisma generate{"\n"}
        npx prisma db push{"\n"}
        npm run prisma:seed
      </pre>
      <p className="mt-2 text-amber-900/90 dark:text-amber-200/90">
        Depois suba o dev de novo. Isso cria a tabela <code className="rounded bg-amber-200/60 px-1 dark:bg-amber-500/25">SiteBranding</code> e o registro inicial.
      </p>
    </div>
  );
}

export function BrandingDbBanner() {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-950">
      <p className="font-semibold">Tabela de identidade visual ainda não existe no banco</p>
      <p className="mt-2 text-amber-900/90">
        Pare o servidor (<code className="rounded bg-amber-200/60 px-1">npm run dev</code>), abra o
        terminal na pasta <code className="rounded bg-amber-200/60 px-1">app</code> e execute:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-amber-900/10 p-3 font-mono text-xs">
        npx prisma generate{"\n"}
        npx prisma db push{"\n"}
        npm run prisma:seed
      </pre>
      <p className="mt-2 text-amber-900/90">
        Depois suba o dev de novo. Isso cria a tabela <code className="rounded bg-amber-200/60 px-1">SiteBranding</code> e o registro inicial.
      </p>
    </div>
  );
}

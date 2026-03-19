# Identidade visual e templates

O admin configura em **Admin → Configurações**:

- **Template visual** — tema laranja ou vermelho (home pública, checkout, área do cliente).
- **Logo, favicon e nome** — marca da loja.

## Templates (`SiteTheme`)

O campo `activeTheme` em `SiteBranding` (`orange` | `red`) define `data-theme` no `<html>` e **todas** as variáveis visuais são injetadas pelo layout a partir de **`src/config/themes.ts`** (fonte única). O ficheiro `src/lib/theme-inline-style.ts` converte o tema em estilo inline; `globals.css` define apenas classes (`.landing-*`, `.theme-*`) que consomem essas variáveis — sem duplicar paletas em CSS.

Após alterar o schema (novo enum ou campo), rode `npx prisma db push`.

# Identidade visual (logo e favicon)

## Banco de dados

O modelo `SiteBranding` (singleton `id = "default"`) precisa existir no PostgreSQL.

1. Pare o servidor de desenvolvimento (`npm run dev`) se aparecer erro `EPERM` ao gerar o Prisma.
2. Na pasta `app/`:

```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

O seed cria o registro padrão com o nome **Loja Nova** (sem imagens).

## Onde a marca aparece

- Favicon e título da aba: `app/layout.tsx` (`generateMetadata`)
- Home: header e rodapé
- Área do cliente (`/account`): menu lateral
- Painel admin: menu lateral
- Página **Entrar**

As imagens são guardadas como **data URL** no banco (PNG, JPG, WebP, GIF; favicon também aceita ICO).

## API

- `GET /api/admin/branding` — leitura (admin)
- `PATCH /api/admin/branding` — atualização (admin), corpo JSON com `logoDataUrl`, `faviconDataUrl` e/ou `storeDisplayName`

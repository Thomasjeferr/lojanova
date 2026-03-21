# Loja Nova - SaaS de Códigos de Ativação

Base full-stack pronta para produção com foco em landing page de alta conversão + checkout em modal + Pix + entrega automática de código.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + componentes estilo shadcn/ui
- Prisma ORM + PostgreSQL (Neon)
- JWT com cookies seguros (httpOnly)
- Zod para validação
- Integração Woovi Pix (com fallback mock)
- Estrutura de e-mail com Resend

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
WOOVI_API_KEY=
WOOVI_WEBHOOK_SECRET=
RESEND_API_KEY=
ADMIN_EMAIL=admin@lojanova.com
# ADMIN_PASSWORD=   # opcional local; na Vercel, obrigatório ao rodar o seed (mín. 8 caracteres)
APP_URL=http://localhost:3000
# CRON_SECRET=       # obrigatório para GET /api/cron/low-stock-alert (Bearer token); ver seção abaixo
```

### Administrador (e-mail e senha via env → banco)

O login do admin usa **sempre** o banco (`User.email` + hash da senha). As variáveis abaixo servem para o **`prisma db seed`** criar/atualizar esse usuário:

| Variável | Uso |
|----------|-----|
| `ADMIN_EMAIL` | E-mail de login do admin (padrão `admin@lojanova.com` se vazio) |
| `ADMIN_PASSWORD` | Senha em texto puro **só no momento do seed**; no banco grava-se apenas o hash |

- **Local:** sem `ADMIN_PASSWORD`, o seed usa `Admin@123` e exibe aviso.
- **Vercel (`VERCEL=1`):** sem `ADMIN_PASSWORD`, o seed **falha** — defina uma senha forte no painel e rode o seed apontando para o `DATABASE_URL` de produção.

Não use o prefixo `NEXT_PUBLIC_` em `ADMIN_PASSWORD`.

**Produção:** após definir as env no projeto, rode (com a URL do Neon de produção no ambiente):

```bash
cd app
npx prisma db seed
```

(Ou configure um comando one-off na máquina CI com as mesmas env.)

## Rodando localmente

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

## Alerta de estoque (e-mail ao admin)

Em **Configurações** do admin: ative o alerta, defina o **limite global** (ex.: 5) e, opcionalmente, o e-mail do destinatário (senão usa `ADMIN_EMAIL`). O job conta códigos `available` por **plano ativo**; se algum plano estiver com quantidade ≤ limite, é enviado um resumo via **Resend** (no máximo **1 e-mail a cada 24 h**).

1. `npx prisma db push` (novas colunas em `AppSettings`).
2. Defina `CRON_SECRET` no ambiente (string longa aleatória).
3. Na **Vercel**, cron em `vercel.json` usa horário **UTC**. O agendamento atual (`0 11 * * *`) corresponde a **08:00 em Brasília** (UTC−3). Ajuste o `schedule` se quiser outro horário.
4. No painel da Vercel, associe o mesmo `CRON_SECRET` ao job de cron se solicitado.
5. Teste local: `curl -H "Authorization: Bearer SEU_SECRET" http://localhost:3000/api/cron/low-stock-alert`

## Rotas principais

- Landing: `/`
- Jurídico / suporte: `/termos`, `/privacidade`, `/contato`
- Área do cliente: `/account`, `/orders`, `/access`
- Admin: `/admin`

## APIs implementadas

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/checkout/create-order`
- `POST /api/checkout/create-pix`
- `POST /api/woovi/webhook`
- `GET /api/me/orders`
- `GET /api/me/access`
- `POST /api/admin/codes/import`
- `GET /api/admin/orders`
- `GET /api/admin/codes`
- `PATCH /api/admin/codes/[id]` (editar: plano / código / usuário-senha; só disponível ou bloqueado)
- `DELETE /api/admin/codes/[id]` (excluir; só sem venda)
- `GET/POST /api/admin/plans`
- `GET/PUT /api/admin/settings/low-stock-alert` (alerta de estoque)
- `GET /api/cron/low-stock-alert` (cron; `Authorization: Bearer CRON_SECRET`)
- `GET /api/public/plans-stock` (contagem de códigos disponíveis por plano — checkout)

## Deploy

- Frontend + backend: Vercel
- Banco: Neon PostgreSQL
- Repositório: GitHub

## SEO (técnico + on-page)

- **Metadata dinâmica** por rota (`generateMetadata`), com `metadataBase` = `APP_URL`.
- **URLs públicas:** `/`, `/planos`, `/comprar-acesso`, `/comprar-iptv`, `/como-funciona-iptv`, `/iptv-e-confiavel` (sitemap + canonical).
- **`/sitemap.xml`** e **`/robots.txt`** — áreas logadas e `/api` bloqueadas para crawlers.
- **JSON-LD:** Organization, WebSite, FAQPage (só na home), Product + Offer por plano.
- **Open Graph:** imagem gerada em **`/opengraph-image`** (OG dinâmico com nome da loja).
- **Áreas privadas** (`/admin`, `/account`, `/entrar`): `noindex`.

Defina **`APP_URL`** em produção com o domínio canônico (ex.: `https://seudominio.com`).

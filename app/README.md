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
ADMIN_EMAIL=
APP_URL=http://localhost:3000
```

## Rodando localmente

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

## Rotas principais

- Landing: `/`
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
- `GET/POST /api/admin/plans`

## Deploy

- Frontend + backend: Vercel
- Banco: Neon PostgreSQL
- Repositório: GitHub

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = "admin@lojanova.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@123";
const MIN_ADMIN_PASSWORD_LEN = 8;

function normalizeAdminEmail(raw: string | undefined): string {
  const v = (raw ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  if (!v.includes("@")) {
    throw new Error("ADMIN_EMAIL inválido.");
  }
  return v;
}

function resolveAdminPassword(): string {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  const onVercel = process.env.VERCEL === "1";

  if (fromEnv) {
    if (fromEnv.length < MIN_ADMIN_PASSWORD_LEN) {
      throw new Error(
        `ADMIN_PASSWORD deve ter ao menos ${MIN_ADMIN_PASSWORD_LEN} caracteres.`,
      );
    }
    return fromEnv;
  }

  if (onVercel) {
    throw new Error(
      "Defina ADMIN_PASSWORD nas Environment Variables do projeto (Vercel) antes de rodar o seed. " +
        "O login do admin continua pelo banco; o seed só grava o hash com essa senha.",
    );
  }

  console.warn(
    "[seed] ADMIN_PASSWORD não definido — usando senha padrão de desenvolvimento. " +
      "Para produção, defina ADMIN_PASSWORD e rode o seed novamente.",
  );
  return DEFAULT_ADMIN_PASSWORD;
}

async function main() {
  await prisma.siteBranding.upsert({
    where: { id: "default" },
    create: { id: "default", storeDisplayName: "Loja Nova" },
    update: {},
  });

  await prisma.plan.upsert({
    where: { slug: "30-dias" },
    update: {},
    create: {
      slug: "30-dias",
      title: "Plano 30 dias",
      durationDays: 30,
      priceCents: 4990,
      benefits: ["Acesso completo", "Ativação instantânea", "Suporte prioritário"],
    },
  });

  await prisma.plan.upsert({
    where: { slug: "90-dias" },
    update: {},
    create: {
      slug: "90-dias",
      title: "Plano 90 dias",
      durationDays: 90,
      priceCents: 11990,
      isFeatured: true,
      benefits: ["Mais vendido", "Acesso completo", "Melhor custo-benefício"],
    },
  });

  await prisma.plan.upsert({
    where: { slug: "1-ano" },
    update: {},
    create: {
      slug: "1-ano",
      title: "Plano 1 ano",
      durationDays: 365,
      priceCents: 34990,
      benefits: ["Economia máxima", "Acesso anual", "Suporte premium"],
    },
  });

  const adminEmail = normalizeAdminEmail(process.env.ADMIN_EMAIL);
  const adminPasswordPlain = resolveAdminPassword();
  const adminPasswordHash = await bcrypt.hash(adminPasswordPlain, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminPasswordHash, isAdmin: true },
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      isAdmin: true,
    },
  });

  const onVercel = process.env.VERCEL === "1";
  if (!onVercel) {
    const clientPassword = await bcrypt.hash("Cliente@123", 12);
    await prisma.user.upsert({
      where: { email: "cliente@teste.com" },
      update: { passwordHash: clientPassword, isAdmin: false },
      create: {
        name: "Cliente Teste",
        email: "cliente@teste.com",
        passwordHash: clientPassword,
        isAdmin: false,
      },
    });
  }

  console.log("Seed concluído: planos + administrador.");
  console.log(`  Admin e-mail: ${adminEmail}`);
  console.log(
    onVercel || process.env.ADMIN_PASSWORD
      ? "  Senha: a definida em ADMIN_PASSWORD (não repetimos aqui)."
      : `  Senha (dev): ${DEFAULT_ADMIN_PASSWORD}`,
  );
  if (!onVercel) {
    console.log("  Cliente teste: cliente@teste.com / Cliente@123");
  }
  console.log(
    "  Observação: o registro público não promove admin; altere e-mail/senha com ADMIN_EMAIL + ADMIN_PASSWORD e rode o seed de novo.",
  );
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

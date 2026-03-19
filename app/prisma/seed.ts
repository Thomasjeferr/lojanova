import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const clientPassword = await bcrypt.hash("Cliente@123", 12);

  await prisma.user.upsert({
    where: { email: "admin@lojanova.com" },
    update: { passwordHash: adminPassword, isAdmin: true },
    create: {
      name: "Administrador",
      email: "admin@lojanova.com",
      passwordHash: adminPassword,
      isAdmin: true,
    },
  });

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

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL !== "admin@lojanova.com") {
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: { passwordHash: adminPassword },
      create: {
        name: "Administrador",
        email: process.env.ADMIN_EMAIL,
        passwordHash: adminPassword,
        isAdmin: true,
      },
    });
  }

  console.log("Seed concluído: planos + usuários de teste.");
  console.log("  Admin: admin@lojanova.com / Admin@123");
  console.log("  Cliente: cliente@teste.com / Cliente@123");
  console.log("  Observação: o registro público não promove admin; use seed ou atualize isAdmin no banco.");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

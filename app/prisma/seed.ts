import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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

  if (process.env.ADMIN_EMAIL) {
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: {},
      create: {
        name: "Administrador",
        email: process.env.ADMIN_EMAIL,
        passwordHash: await bcrypt.hash("Admin@123", 12),
        isAdmin: true,
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

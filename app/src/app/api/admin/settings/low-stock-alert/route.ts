import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { badRequest, forbidden, ok } from "@/lib/http";
import { lowStockAlertSettingsSchema } from "@/lib/validators";

export async function GET() {
  try {
    await requireAdmin();
    const row = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: {
        lowStockAlertEnabled: true,
        lowStockThreshold: true,
        lowStockNotifyEmail: true,
        lowStockAlertLastSentAt: true,
      },
    });
    return ok({
      settings: row
        ? {
            lowStockAlertEnabled: row.lowStockAlertEnabled,
            lowStockThreshold: row.lowStockThreshold,
            lowStockNotifyEmail: row.lowStockNotifyEmail || "",
            lowStockAlertLastSentAt: row.lowStockAlertLastSentAt?.toISOString() ?? null,
          }
        : {
            lowStockAlertEnabled: false,
            lowStockThreshold: 5,
            lowStockNotifyEmail: "",
            lowStockAlertLastSentAt: null,
          },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") {
      return badRequest(
        'Tabela AppSettings inexistente. Rode "npx prisma db push" na pasta app e reinicie o servidor.',
      );
    }
    return forbidden();
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = lowStockAlertSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Dados inválidos", parsed.error.flatten());
    }
    const data = parsed.data;
    const emailTrim = (data.lowStockNotifyEmail ?? "").trim();
    const normalizedEmail = emailTrim ? emailTrim.toLowerCase() : null;

    const row = await prisma.appSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        lowStockAlertEnabled: data.lowStockAlertEnabled,
        lowStockThreshold: data.lowStockThreshold,
        lowStockNotifyEmail: normalizedEmail,
      },
      update: {
        lowStockAlertEnabled: data.lowStockAlertEnabled,
        lowStockThreshold: data.lowStockThreshold,
        lowStockNotifyEmail: normalizedEmail,
      },
    });

    return ok({
      message: "Alerta de estoque salvo.",
      settings: {
        lowStockAlertEnabled: row.lowStockAlertEnabled,
        lowStockThreshold: row.lowStockThreshold,
        lowStockNotifyEmail: row.lowStockNotifyEmail || "",
        lowStockAlertLastSentAt: row.lowStockAlertLastSentAt?.toISOString() ?? null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") {
      return badRequest('Tabela AppSettings inexistente. Rode "npx prisma db push" na pasta app.');
    }
    return forbidden();
  }
}

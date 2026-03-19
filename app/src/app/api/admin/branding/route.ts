import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { badRequest, forbidden, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { siteBrandingPatchSchema } from "@/lib/validators";
import { DEFAULT_LANDING_COPY } from "@/lib/site-branding";

export async function GET() {
  try {
    await requireAdmin();
    const row = await prisma.siteBranding.findUnique({
      where: { id: "default" },
    });
    return ok({
      branding: row ?? {
        id: "default",
        logoDataUrl: null,
        faviconDataUrl: null,
        storeDisplayName: "Loja Nova",
        activeTheme: "orange",
        landingCopy: DEFAULT_LANDING_COPY,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2021" || e.code === "P2022")
    ) {
      return badRequest(
        'Estrutura SiteBranding desatualizada. Rode "npx prisma db push" na pasta app e reinicie o servidor.',
      );
    }
    return forbidden();
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const json = await request.json();
    const parsed = siteBrandingPatchSchema.safeParse(json);
    if (!parsed.success) {
      return badRequest("Dados inválidos", parsed.error.flatten());
    }

    const body = parsed.data;

    const row = await prisma.siteBranding.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        logoDataUrl: body.logoDataUrl ?? null,
        faviconDataUrl: body.faviconDataUrl ?? null,
        storeDisplayName: body.storeDisplayName ?? "Loja Nova",
        activeTheme: body.activeTheme ?? "orange",
        landingCopy: body.landingCopy ?? DEFAULT_LANDING_COPY,
      },
      update: {
        ...(body.logoDataUrl !== undefined ? { logoDataUrl: body.logoDataUrl } : {}),
        ...(body.faviconDataUrl !== undefined ? { faviconDataUrl: body.faviconDataUrl } : {}),
        ...(body.storeDisplayName !== undefined
          ? { storeDisplayName: body.storeDisplayName }
          : {}),
        ...(body.activeTheme !== undefined ? { activeTheme: body.activeTheme } : {}),
        ...(body.landingCopy !== undefined ? { landingCopy: body.landingCopy } : {}),
      },
    });

    revalidatePath("/", "layout");

    return ok({
      message: "Identidade visual atualizada",
      branding: row,
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2021" || e.code === "P2022")
    ) {
      return badRequest(
        'Estrutura SiteBranding desatualizada. Rode "npx prisma db push" na pasta app.',
      );
    }
    return forbidden();
  }
}

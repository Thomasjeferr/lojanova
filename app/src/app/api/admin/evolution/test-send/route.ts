import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { badRequest, forbidden, ok } from "@/lib/http";
import { evolutionTestSendSchema } from "@/lib/validators";
import { brazilPhoneToE164 } from "@/lib/phone-e164";
import { getPublicSiteBaseUrl } from "@/lib/public-site-url";
import {
  evolutionFetchConnectionState,
  evolutionSendText,
  isEvolutionEnvConfigured,
} from "@/lib/evolution-api";
import {
  DEFAULT_EVOLUTION_DELIVERY_TEMPLATE,
  DEFAULT_EVOLUTION_RECOVERY_TEMPLATE,
  renderEvolutionTemplate,
} from "@/lib/evolution-messages";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    if (!isEvolutionEnvConfigured()) {
      return badRequest("Configure EVOLUTION_API_URL e EVOLUTION_API_KEY no ambiente.");
    }

    const parsed = evolutionTestSendSchema.safeParse(await request.json());
    if (!parsed.success) {
      return badRequest("Dados inválidos", parsed.error.flatten());
    }
    const body = parsed.data;

    const e164 = brazilPhoneToE164(body.phone);
    if (!e164) {
      return badRequest("Telefone inválido. Use DDD + número ou com DDI 55.");
    }

    const settings = await prisma.appSettings.findUnique({
      where: { id: "default" },
      select: {
        evolutionInstanceName: true,
        evolutionDeliveryTemplate: true,
        evolutionRecoveryTemplate: true,
      },
    });
    const instanceName = settings?.evolutionInstanceName?.trim();
    if (!instanceName) {
      return badRequest("Crie e pareie uma instância antes de testar o envio.");
    }

    const state = await evolutionFetchConnectionState(instanceName);
    if (state?.toLowerCase() !== "open") {
      return badRequest(
        "WhatsApp não está conectado (estado precisa ser open). Abra o QR e pareie o aparelho.",
      );
    }

    const branding = await prisma.siteBranding.findUnique({
      where: { id: "default" },
      select: { storeDisplayName: true },
    });
    const storeName =
      branding?.storeDisplayName?.trim() ||
      process.env.EMAIL_STORE_NAME?.trim() ||
      "Loja";

    const accountUrl = getPublicSiteBaseUrl();
    const kind = body.kind ?? "delivery";

    let text: string;
    if (kind === "recovery") {
      const raw =
        (body.recoveryTemplate ?? "").trim() ||
        settings?.evolutionRecoveryTemplate?.trim() ||
        DEFAULT_EVOLUTION_RECOVERY_TEMPLATE;
      text = renderEvolutionTemplate(raw, {
        firstName: "Cliente",
        storeName,
        orderNumber: "#9999",
        planName: "Plano de teste",
        accountUrl,
      });
    } else {
      const raw =
        (body.deliveryTemplate ?? "").trim() ||
        settings?.evolutionDeliveryTemplate?.trim() ||
        DEFAULT_EVOLUTION_DELIVERY_TEMPLATE;
      text = renderEvolutionTemplate(raw, {
        firstName: "Cliente",
        storeName,
        planName: "Plano de teste",
        credentialLabel: "Código",
        credentialValue: "TESTE1234567890",
        accountUrl,
      });
    }

    text = `[TESTE LOJA]\n${text}`;

    await evolutionSendText(instanceName, e164.replace(/\D/g, ""), text);

    return ok({
      message: "Mensagem de teste enviada. Verifique o WhatsApp do número informado.",
    });
  } catch (e) {
    if (e instanceof Error && (e.message === "Não autenticado" || e.message === "Acesso negado")) {
      return forbidden();
    }
    if (e instanceof Error && e.message.includes("Evolution sendText")) {
      return badRequest(e.message);
    }
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2021" || e.code === "P2022")
    ) {
      return badRequest('Tabela inexistente. Rode "npx prisma db push" na pasta app.');
    }
    console.error("[admin/evolution/test-send]", e);
    return badRequest(
      e instanceof Error && e.message ? e.message : "Falha ao enviar mensagem de teste.",
    );
  }
}

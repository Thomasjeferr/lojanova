import { requireAdmin } from "@/lib/auth";
import { forbidden, ok, unauthorized } from "@/lib/http";
import { EMAIL_TEMPLATE_IDS, EMAIL_TEMPLATES } from "@/lib/email-templates";

const TEMPLATE_ROWS = [
  {
    key: "activation" as const,
    internalId: EMAIL_TEMPLATE_IDS.activationCodeDelivered,
    ...EMAIL_TEMPLATES[EMAIL_TEMPLATE_IDS.activationCodeDelivered],
    trigger: "Após pagamento Pix confirmado (entrega do código).",
  },
  {
    key: "welcome" as const,
    internalId: EMAIL_TEMPLATE_IDS.welcomeAccount,
    ...EMAIL_TEMPLATES[EMAIL_TEMPLATE_IDS.welcomeAccount],
    trigger: "Após registro de nova conta.",
  },
  {
    key: "password" as const,
    internalId: EMAIL_TEMPLATE_IDS.passwordChanged,
    ...EMAIL_TEMPLATES[EMAIL_TEMPLATE_IDS.passwordChanged],
    trigger: "Após o usuário alterar a senha na área logada.",
  },
];

/** Lista metadados dos templates (admin) + status da configuração Resend */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const resendConfigured = Boolean(process.env.RESEND_API_KEY?.trim());
  const fromConfigured = Boolean(process.env.RESEND_FROM?.trim());

  return ok({
    templates: TEMPLATE_ROWS,
    resendConfigured,
    fromConfigured,
    storeNameFromEnv: Boolean(process.env.EMAIL_STORE_NAME?.trim()),
  });
}

import { Resend } from "resend";
import { getPublicSiteBaseUrl } from "@/lib/public-site-url";
import {
  activationCodeDeliveredTemplate,
  welcomeAccountTemplate,
  passwordChangedTemplate,
  passwordResetRequestedTemplate,
  lowStockAdminTemplate,
  type EmailTemplateId,
} from "@/lib/email-templates";

/** Templates disponíveis para “Enviar teste” no admin */
export type EmailTestTemplateKey = "activation" | "welcome" | "password" | "reset";

const DEFAULT_STORE = "Loja Digital";
const DEFAULT_FROM = "Loja Digital <no-reply@seudominio.com>";

function getResendClient() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

async function sendEmail({
  to,
  templateId,
  subject,
  html,
}: {
  to: string;
  templateId: EmailTemplateId;
  subject: string;
  html: string;
}) {
  const resend = getResendClient();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    // Nunca quebrar fluxo de compra/entrega por falha de e-mail
    console.error(`[email] Falha ao enviar template ${templateId}:`, error);
  }
}

export async function sendActivationEmail({
  to,
  name,
  planName,
  credentialLabel,
  credentialValue,
}: {
  to: string;
  name: string;
  planName: string;
  credentialLabel: string;
  credentialValue: string;
}) {
  const tpl = activationCodeDeliveredTemplate({
    storeName: process.env.EMAIL_STORE_NAME || DEFAULT_STORE,
    name,
    planName,
    credentialLabel,
    credentialValue,
  });
  await sendEmail({
    to,
    templateId: tpl.id,
    subject: tpl.subject,
    html: tpl.html,
  });
}

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const appUrl = getPublicSiteBaseUrl();
  const tpl = welcomeAccountTemplate({
    storeName: process.env.EMAIL_STORE_NAME || DEFAULT_STORE,
    name,
    accountUrl: `${appUrl}/account`,
  });
  await sendEmail({
    to,
    templateId: tpl.id,
    subject: tpl.subject,
    html: tpl.html,
  });
}

export async function sendPasswordChangedEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const appUrl = getPublicSiteBaseUrl();
  const tpl = passwordChangedTemplate({
    storeName: process.env.EMAIL_STORE_NAME || DEFAULT_STORE,
    name,
    changedAt: new Date(),
    accountUrl: `${appUrl}/account/profile`,
  });
  await sendEmail({
    to,
    templateId: tpl.id,
    subject: tpl.subject,
    html: tpl.html,
  });
}

export async function sendPasswordResetRequestedEmail({
  to,
  name,
  resetUrl,
  expiresInMinutes,
}: {
  to: string;
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}) {
  const tpl = passwordResetRequestedTemplate({
    storeName: process.env.EMAIL_STORE_NAME || DEFAULT_STORE,
    name,
    resetUrl,
    expiresInMinutes,
  });
  await sendEmail({
    to,
    templateId: tpl.id,
    subject: tpl.subject,
    html: tpl.html,
  });
}

/** E-mail operacional para o admin; retorna se o Resend aceitou o envio. */
export async function sendLowStockAlertEmail({
  to,
  storeName,
  threshold,
  adminCodesUrl,
  items,
}: {
  to: string;
  storeName: string;
  threshold: number;
  adminCodesUrl: string;
  items: Array<{
    planTitle: string;
    planSlug: string;
    durationDays: number;
    priceCents: number;
    available: number;
  }>;
}): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;
  const tpl = lowStockAdminTemplate({
    storeName,
    threshold,
    adminCodesUrl,
    items,
  });
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to,
      subject: tpl.subject,
      html: tpl.html,
    });
    if (result.error) {
      console.error(
        `[email] low_stock Resend:`,
        result.error.message || result.error.name,
        result.error,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[email] Falha ao enviar template ${tpl.id}:`, error);
    return false;
  }
}

/**
 * Envia um e-mail de teste (dados fictícios) e devolve sucesso ou mensagem de erro.
 * Usado apenas no painel admin para validar Resend + domínio + templates.
 */
export async function sendTestTransactionalEmail(
  template: EmailTestTemplateKey,
  to: string,
): Promise<{ ok: true; messageId?: string } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return { ok: false, error: "RESEND_API_KEY não configurada no servidor." };
  }

  const resend = new Resend(key);
  const from = process.env.RESEND_FROM || DEFAULT_FROM;
  const storeName = process.env.EMAIL_STORE_NAME || DEFAULT_STORE;
  const appUrl = getPublicSiteBaseUrl();

  let subject: string;
  let html: string;

  switch (template) {
    case "activation": {
      const tpl = activationCodeDeliveredTemplate({
        storeName,
        name: "Cliente (e-mail de teste)",
        planName: "Plano demonstração 30 dias",
        credentialLabel: "Código de ativação",
        credentialValue: "AB12CD34EF56GH78",
      });
      subject = `[TESTE] ${tpl.subject}`;
      html = tpl.html;
      break;
    }
    case "welcome": {
      const tpl = welcomeAccountTemplate({
        storeName,
        name: "Cliente (e-mail de teste)",
        accountUrl: `${appUrl}/account`,
      });
      subject = `[TESTE] ${tpl.subject}`;
      html = tpl.html;
      break;
    }
    case "password": {
      const tpl = passwordChangedTemplate({
        storeName,
        name: "Cliente (e-mail de teste)",
        changedAt: new Date(),
        accountUrl: `${appUrl}/account/profile`,
      });
      subject = `[TESTE] ${tpl.subject}`;
      html = tpl.html;
      break;
    }
    case "reset": {
      const tpl = passwordResetRequestedTemplate({
        storeName,
        name: "Cliente (e-mail de teste)",
        resetUrl: `${appUrl}/redefinir-senha?token=token-de-teste`,
        expiresInMinutes: 30,
      });
      subject = `[TESTE] ${tpl.subject}`;
      html = tpl.html;
      break;
    }
    default: {
      const _exhaustive: never = template;
      return { ok: false, error: `Template inválido: ${_exhaustive}` };
    }
  }

  try {
    const result = await resend.emails.send({ from, to, subject, html });
    if (result.error) {
      return {
        ok: false,
        error: result.error.message || `Resend: ${result.error.name || "erro"}`,
      };
    }
    return { ok: true, messageId: result.data?.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao enviar e-mail.";
    return { ok: false, error: msg };
  }
}

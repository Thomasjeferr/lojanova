import { Resend } from "resend";
import {
  activationCodeDeliveredTemplate,
  welcomeAccountTemplate,
  passwordChangedTemplate,
  type EmailTemplateId,
} from "@/lib/email-templates";

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
  code,
}: {
  to: string;
  name: string;
  planName: string;
  code: string;
}) {
  const tpl = activationCodeDeliveredTemplate({
    storeName: process.env.EMAIL_STORE_NAME || DEFAULT_STORE,
    name,
    planName,
    code,
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
  const appUrl = process.env.APP_URL || "http://localhost:3000";
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
  const appUrl = process.env.APP_URL || "http://localhost:3000";
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

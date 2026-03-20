type TemplateInputBase = {
  storeName: string;
};

export const EMAIL_TEMPLATE_IDS = {
  activationCodeDelivered: "activation_code_delivered_v1",
  welcomeAccount: "welcome_account_v1",
  passwordChanged: "password_changed_v1",
  passwordResetRequested: "password_reset_requested_v1",
  lowStockAdmin: "low_stock_admin_v1",
} as const;

export type EmailTemplateId =
  (typeof EMAIL_TEMPLATE_IDS)[keyof typeof EMAIL_TEMPLATE_IDS];

export type ActivationCodeDeliveredInput = TemplateInputBase & {
  name: string;
  planName: string;
  credentialLabel: string;
  credentialValue: string;
};

export type WelcomeAccountInput = TemplateInputBase & {
  name: string;
  accountUrl: string;
};

export type PasswordChangedInput = TemplateInputBase & {
  name: string;
  changedAt: Date;
  accountUrl: string;
};

export type PasswordResetRequestedInput = TemplateInputBase & {
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
};

export type LowStockAdminInput = TemplateInputBase & {
  threshold: number;
  adminCodesUrl: string;
  items: Array<{ planTitle: string; available: number }>;
};

function layout(content: string, storeName: string) {
  return `
  <div style="background:#f6f7fb;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#18181b">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden">
      <div style="padding:20px 24px;border-bottom:1px solid #f0f0f3;background:linear-gradient(180deg,#fff,#fcfcff)">
        <h1 style="margin:0;font-size:18px;line-height:1.3">${storeName}</h1>
      </div>
      <div style="padding:24px">
        ${content}
      </div>
      <div style="padding:16px 24px;border-top:1px solid #f0f0f3;color:#71717a;font-size:12px">
        Este e-mail foi enviado automaticamente por ${storeName}.
      </div>
    </div>
  </div>
  `;
}

type RenderedTemplate = {
  id: EmailTemplateId;
  subject: string;
  html: string;
};

export const EMAIL_TEMPLATES: Record<
  EmailTemplateId,
  { name: string; description: string }
> = {
  [EMAIL_TEMPLATE_IDS.activationCodeDelivered]: {
    name: "Código liberado",
    description: "Enviado após pagamento aprovado com o código de ativação.",
  },
  [EMAIL_TEMPLATE_IDS.welcomeAccount]: {
    name: "Boas-vindas",
    description: "Enviado após criação de conta.",
  },
  [EMAIL_TEMPLATE_IDS.passwordChanged]: {
    name: "Senha alterada",
    description: "Enviado quando o usuário altera a senha.",
  },
  [EMAIL_TEMPLATE_IDS.passwordResetRequested]: {
    name: "Recuperação de senha",
    description: "Enviado quando o usuário solicita redefinição de senha.",
  },
  [EMAIL_TEMPLATE_IDS.lowStockAdmin]: {
    name: "Estoque baixo (admin)",
    description: "Resumo para o administrador quando planos ativos estão com poucos códigos disponíveis.",
  },
};

export function activationCodeDeliveredTemplate(
  input: ActivationCodeDeliveredInput,
): RenderedTemplate {
  const subject = `Seu código de ativação foi liberado - ${input.storeName}`;
  const html = layout(
    `
    <p style="margin:0 0 12px;font-size:15px">Olá, <strong>${input.name}</strong>!</p>
    <p style="margin:0 0 12px;font-size:15px">
      O pagamento do plano <strong>${input.planName}</strong> foi confirmado.
    </p>
    <p style="margin:0 0 10px;font-size:14px;color:#52525b">Sua credencial (${input.credentialLabel}):</p>
    <pre style="margin:0 0 16px;padding:12px 14px;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:10px;font-size:18px;line-height:1.5;font-weight:700;white-space:pre-wrap">${input.credentialValue}</pre>
    <p style="margin:0;font-size:14px;color:#52525b">Guarde esta informação em local seguro.</p>
    `,
    input.storeName,
  );
  return { id: EMAIL_TEMPLATE_IDS.activationCodeDelivered, subject, html };
}

export function welcomeAccountTemplate(input: WelcomeAccountInput): RenderedTemplate {
  const subject = `Conta criada com sucesso - ${input.storeName}`;
  const html = layout(
    `
    <p style="margin:0 0 12px;font-size:15px">Olá, <strong>${input.name}</strong>!</p>
    <p style="margin:0 0 16px;font-size:15px">Sua conta foi criada com sucesso.</p>
    <p style="margin:0 0 20px;font-size:14px;color:#52525b">
      Acesse sua área para acompanhar pedidos e códigos liberados.
    </p>
    <a href="${input.accountUrl}" style="display:inline-block;padding:10px 16px;background:#18181b;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">Ir para minha conta</a>
    `,
    input.storeName,
  );
  return { id: EMAIL_TEMPLATE_IDS.welcomeAccount, subject, html };
}

export function passwordChangedTemplate(input: PasswordChangedInput): RenderedTemplate {
  const subject = `Senha alterada - ${input.storeName}`;
  const changedAt = input.changedAt.toLocaleString("pt-BR");
  const html = layout(
    `
    <p style="margin:0 0 12px;font-size:15px">Olá, <strong>${input.name}</strong>!</p>
    <p style="margin:0 0 12px;font-size:15px">Sua senha foi alterada com sucesso.</p>
    <p style="margin:0 0 18px;font-size:14px;color:#52525b">Data/hora da alteração: <strong>${changedAt}</strong></p>
    <p style="margin:0 0 20px;font-size:14px;color:#52525b">
      Se não foi você, altere a senha imediatamente e entre em contato com o suporte.
    </p>
    <a href="${input.accountUrl}" style="display:inline-block;padding:10px 16px;background:#18181b;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">Revisar minha conta</a>
    `,
    input.storeName,
  );
  return { id: EMAIL_TEMPLATE_IDS.passwordChanged, subject, html };
}

export function passwordResetRequestedTemplate(
  input: PasswordResetRequestedInput,
): RenderedTemplate {
  const subject = `Redefinição de senha - ${input.storeName}`;
  const html = layout(
    `
    <p style="margin:0 0 12px;font-size:15px">Olá, <strong>${input.name}</strong>!</p>
    <p style="margin:0 0 12px;font-size:15px">
      Recebemos uma solicitação para redefinir sua senha.
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#52525b">
      Clique no botão abaixo para criar uma nova senha. Este link expira em <strong>${input.expiresInMinutes} minutos</strong>.
    </p>
    <a href="${input.resetUrl}" style="display:inline-block;padding:10px 16px;background:#18181b;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">Redefinir minha senha</a>
    <p style="margin:18px 0 0;font-size:13px;color:#71717a">
      Se você não pediu essa alteração, ignore este e-mail.
    </p>
    `,
    input.storeName,
  );
  return { id: EMAIL_TEMPLATE_IDS.passwordResetRequested, subject, html };
}

export function lowStockAdminTemplate(input: LowStockAdminInput): RenderedTemplate {
  const subject = `[Estoque] Atenção: códigos abaixo do limite - ${input.storeName}`;
  const rows = input.items
    .map(
      (row) =>
        `<tr><td style="padding:10px 12px;border:1px solid #e4e4e7;font-size:14px">${row.planTitle}</td><td style="padding:10px 12px;border:1px solid #e4e4e7;font-size:14px;text-align:center;font-weight:600">${row.available}</td></tr>`,
    )
    .join("");
  const html = layout(
    `
    <p style="margin:0 0 12px;font-size:15px">Olá,</p>
    <p style="margin:0 0 12px;font-size:15px">
      Alguns <strong>planos ativos</strong> estão com quantidade de códigos <strong>disponíveis</strong> menor ou igual a
      <strong>${input.threshold}</strong> (limite configurado no admin).
    </p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 18px">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px 12px;border:1px solid #e4e4e7;background:#f4f4f5;font-size:13px">Plano</th>
          <th style="text-align:center;padding:10px 12px;border:1px solid #e4e4e7;background:#f4f4f5;font-size:13px">Disponíveis</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin:0 0 16px;font-size:14px;color:#52525b">
      Importe novos códigos em <strong>Códigos</strong> no painel.
    </p>
    <a href="${input.adminCodesUrl}" style="display:inline-block;padding:10px 16px;background:#18181b;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">Abrir códigos no admin</a>
    `,
    input.storeName,
  );
  return { id: EMAIL_TEMPLATE_IDS.lowStockAdmin, subject, html };
}


import { Resend } from "resend";

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
  if (!process.env.RESEND_API_KEY) {
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Loja Digital <no-reply@seudominio.com>",
    to,
    subject: "Seu código de ativação foi liberado",
    html: `
      <h1>Pagamento aprovado</h1>
      <p>Olá, ${name}!</p>
      <p>Seu pagamento do plano <strong>${planName}</strong> foi confirmado.</p>
      <p>Seu código de ativação:</p>
      <pre style="font-size:18px;padding:12px;background:#f5f5f5;border-radius:8px">${code}</pre>
      <p>Guarde este código em local seguro.</p>
    `,
  });
}

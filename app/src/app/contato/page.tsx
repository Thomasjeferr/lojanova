import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Mail, HelpCircle } from "lucide-react";
import { getLandingUserSession } from "@/lib/landing-user-session";
import { getSiteBranding } from "@/lib/site-branding";
import { getPublicContactSettings } from "@/lib/contact-settings";
import { buildPageMetadata } from "@/lib/seo/metadata-builders";
import { LegalPageShell, LegalSection } from "@/components/legal/legal-page-shell";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const b = await getSiteBranding();
  return buildPageMetadata({
    title: "Contato — fale com a loja",
    description: `Entre em contato com ${b.storeDisplayName}: dúvidas sobre pedidos, Pix e credenciais. Somos intermediários digitais — não operamos rede IPTV, mas acompanhamos sua compra até a liberação.`,
    path: "/contato",
    siteName: b.storeDisplayName,
    keywordsExtra: ["contato", "suporte", "WhatsApp"],
    ogImageAlt: `Contato — ${b.storeDisplayName}`,
  });
}

export default async function ContatoPage() {
  const [branding, userSession, contact] = await Promise.all([
    getSiteBranding(),
    getLandingUserSession(),
    getPublicContactSettings(),
  ]);

  return (
    <LegalPageShell
      branding={branding}
      userSession={userSession}
      title="Contato"
      intro={`Quer falar com quem move o caixa — não com um datacenter imaginário? Aqui é o lugar. O ${branding.storeDisplayName} organiza a compra e o pós-venda da credencial; quem “segura o fio” do acesso após a ativação é a cadeia técnica do outro lado. Ainda assim, somos seu primeiro endereço para pedido, pagamento e dúvidas na plataforma.`}
    >
      <LegalSection id="canais" heading="Canais oficiais">
        {contact.whatsappEnabled && contact.whatsappLink ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <MessageCircle className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-zinc-900">WhatsApp</h3>
                <p className="mt-1 text-sm text-zinc-600">
                  Atendimento direto: planos, pagamento, código não apareceu — leve o número do pedido
                  na primeira mensagem para agilizar.
                </p>
                <a
                  href={contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  {contact.whatsappLabel || "Abrir WhatsApp"}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-6 text-sm text-amber-950">
            <p>
              O WhatsApp ainda não está configurado nesta loja. O administrador pode ativá-lo em{" "}
              <strong>Configurações</strong> do painel. Enquanto isso, use a{" "}
              <Link href="/entrar" className="font-medium text-amber-900 underline hover:no-underline">
                área do cliente
              </Link>{" "}
              para ver pedidos e códigos liberados.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
              <Mail className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold text-zinc-900">E-mail e conta</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Recuperação de senha e comprovantes de pedido chegam pelo e-mail cadastrado. Para
                histórico completo, acesse{" "}
                <Link href="/account" className="font-medium text-orange-600 hover:underline">
                  Minha conta
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="o-fazemos" heading="O que podemos — e não podemos — resolver por aqui">
        <p>
          <strong>Podemos:</strong> ajudar com fluxo de compra, status de pagamento Pix, liberação de
          código na sua conta, bloqueios operacionais do pedido e orientação sobre onde inserir a
          credencial no aplicativo indicado.
        </p>
        <p>
          <strong>Não somos:</strong> donos ou operadores de infraestrutura IPTV na internet. Não
          controlamos apagões de catálogo, lista de canais de terceiros nem garantias fora do que foi
          combinado na linha do pedido. Nesses casos, fazemos a ponte com o fornecedor do acesso dentro
          do possível — mas{" "}
          <strong>o sinal não nasce no nosso rack</strong>
          {", "}ele nasce na cadeia que você contratou ao fechar o plano.
        </p>
      </LegalSection>

      <LegalSection id="docs" heading="Documentos relacionados">
        <ul className="flex flex-wrap gap-4 text-sm font-medium">
          <li>
            <Link href="/termos" className="text-orange-600 hover:underline">
              Termos de uso
            </Link>
          </li>
          <li>
            <Link href="/privacidade" className="text-orange-600 hover:underline">
              Privacidade
            </Link>
          </li>
          <li>
            <Link href="/planos" className="inline-flex items-center gap-1 text-orange-600 hover:underline">
              <HelpCircle className="h-4 w-4" aria-hidden />
              Ver planos
            </Link>
          </li>
        </ul>
      </LegalSection>
    </LegalPageShell>
  );
}

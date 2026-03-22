import type { Metadata } from "next";
import Link from "next/link";
import { getLandingUserSession } from "@/lib/landing-user-session";
import { getSiteBranding } from "@/lib/site-branding";
import { buildPageMetadata } from "@/lib/seo/metadata-builders";
import { LegalPageShell, LegalSection } from "@/components/legal/legal-page-shell";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const b = await getSiteBranding();
  return buildPageMetadata({
    title: "Política de privacidade — como tratamos seus dados",
    description: `Política de privacidade de ${b.storeDisplayName}: dados mínimos para venda com Pix, conta e suporte. Sem coleta para operar IPTV — apenas para intermediar o acesso com segurança.`,
    path: "/privacidade",
    siteName: b.storeDisplayName,
    keywordsExtra: ["privacidade", "LGPD", "proteção de dados"],
    ogImageAlt: `Privacidade — ${b.storeDisplayName}`,
  });
}

export default async function PrivacidadePage() {
  const [branding, userSession] = await Promise.all([
    getSiteBranding(),
    getLandingUserSession(),
  ]);
  const name = branding.storeDisplayName;

  return (
    <LegalPageShell
      branding={branding}
      userSession={userSession}
      title="Política de privacidade"
      intro={`O ${name} trata dados como quem carrega caixa forte para um combinado comercial: só o necessário para provar quem comprou, mandar o Pix para o lugar certo e te atender com número de pedido na mão. Nada de “big data” fantástico — e nada disso substitui o fato de que somos vitrine, não donos de rede IPTV.`}
    >
      <LegalSection id="dados" heading="Quais dados coletamos">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Cadastro e pedidos:</strong> nome, e-mail, telefone opcional e dados da transação
            (plano, valores, status de pagamento).
          </li>
          <li>
            <strong>Navegação técnica:</strong> cookies e tokens de sessão para manter você logado com
            segurança e cumprir requisitos do checkout.
          </li>
          <li>
            <strong>Suporte:</strong> histórico de mensagens correlato ao pedido quando você entra em
            contato pelos canais oficiais.
          </li>
        </ul>
        <p>
          <strong>Não coletamos</strong> dados para operar servidores de streaming nem perfilamos seu
          hábito de consumo de mídia fora do necessário ao serviço da loja.
        </p>
      </LegalSection>

      <LegalSection id="finalidade" heading="Por que usamos esses dados">
        <p>
          Finalidades legítimas: executar contrato de compra, emitir credenciais, prevenir fraude,
          cumprir obrigações fiscais quando aplicável, enviar comunicações transacionais (ex.: confirmação
          de pagamento, recuperação de senha) e melhorar estabilidade da plataforma.
        </p>
        <p>
          Marketing agressivo não é peça central. Se um dia houver newsletter, será com base em lei e,
          quando exigido, com opt-in claro.
        </p>
      </LegalSection>

      <LegalSection id="compartilhamento" heading="Com quem compartilhamos">
        <p>
          Fornecedores que tornam a loja possível: por exemplo, hospedagem, gateway de pagamento Pix,
          provedor de e-mail transacional e banco de dados. Eles recebem só o mínimo para cumprir a
          tarefa contratada, em linha com a LGPD.
        </p>
        <p>
          <strong>Não vendemos</strong> sua lista de contatos para terceiros aleatórios.
        </p>
      </LegalSection>

      <LegalSection id="direitos" heading="Seus direitos (LGPD)">
        <p>
          Você pode solicitar acesso, correção, anonimização, portabilidade ou eliminação de dados
          pessoais quando a lei permitir, além de informações sobre tratamento. Encaminhe o pedido pelo{" "}
          <Link href="/contato" className="font-medium text-orange-600 hover:underline">
            contato oficial
          </Link>
          , identificando o e-mail da conta.
        </p>
      </LegalSection>

      <LegalSection id="retencao" heading="Retenção e segurança">
        <p>
          Guardamos registros pelo tempo necessário para suporte, defesa em disputa e obrigações
          legais. Medidas técnicas razoáveis (criptografia na transmissão, senhas hasheadas, segregação
          de ambientes) são aplicadas; nenhum sistema é invulnerável, mas tratamos dados com rigor de
          e-commerce.
        </p>
      </LegalSection>

      <LegalSection id="contato-priv" heading="Lembretes finais">
        <p>
          Ao usar o {name}, você confirma que leu esta política. Continua com dúvida? A mesma equipe que
          responde sobre pedidos pode orientar sobre privacidade no canal de{" "}
          <Link href="/contato" className="font-medium text-orange-600 hover:underline">
            contato
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}

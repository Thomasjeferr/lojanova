import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth";
import { getSiteBranding } from "@/lib/site-branding";
import { buildPageMetadata } from "@/lib/seo/metadata-builders";
import { LegalPageShell, LegalSection } from "@/components/legal/legal-page-shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const b = await getSiteBranding();
  return buildPageMetadata({
    title: "Termos de uso — papel da loja e limites do serviço",
    description: `Termos de uso de ${b.storeDisplayName}: atuamos como ponte entre quem busca acesso e quem oferta o serviço; não operamos servidores IPTV. Leia antes de usar o site.`,
    path: "/termos",
    siteName: b.storeDisplayName,
    keywordsExtra: ["termos de uso", "intermediação", "acesso digital"],
    ogImageAlt: `Termos de uso — ${b.storeDisplayName}`,
  });
}

export default async function TermosPage() {
  const [branding, auth] = await Promise.all([getSiteBranding(), getAuthUser()]);
  const userSession = auth ? { email: auth.email } : null;
  const name = branding.storeDisplayName;

  return (
    <LegalPageShell
      branding={branding}
      userSession={userSession}
      title="Termos de uso"
      intro={`O ${name} existe para simplificar um caminho que muita gente já percorre na internet: encontrar quem oferece credenciais de acesso e fechar a compra com segurança e rastreio. Estes termos deixam transparente o que fazemos — e o que deliberadamente não fazemos.`}
    >
      <LegalSection id="o-que-somos" heading="Somos ponte, não provedor de sinal">
        <p>
          Operamos uma <strong>loja digital de intermediação</strong>: reunimos quem tem interesse em
          renovar ou adquirir acesso com quem detém a capacidade técnica de entregar esse tipo de
          credencial. <strong>Não mantemos farm de servidores IPTV</strong>, não hospedamos playlists
          nem retransmitimos canais. O ecossistema de conteúdo já circula pela rede; nosso papel é{" "}
          <strong>facilitar o encontro comercial</strong> — com checkout, Pix, histórico e suporte
          amarrados ao seu pedido.
        </p>
        <p>
          Pense na gente como o <strong>balcão digital</strong> onde o contrato de compra acontece.
          Quem “abre a torneira” do serviço é a cadeia que está do outro lado da credencial que você
          recebe, não a nossa infraestrutura de streaming.
        </p>
      </LegalSection>

      <LegalSection id="conduta" heading="Uso do site e da conta">
        <p>
          Ao criar conta, navegar ou concluir pedidos, você declara ter capacidade legal para contratar
          no Brasil e concorda em fornecer dados verdadeiros. É vedado usar a plataforma para fraude,
          lavagem de identidade, assédio ao suporte ou tentativas de quebrar sistemas de segurança.
        </p>
        <p>
          Cada código ou usuário/senha é destinado ao <strong>uso conforme as regras do fornecedor</strong>{" "}
          e à legislação aplicável. Você é responsável pelo equipamento, apps e conteúdos que escolhe
          acessar após a liberação.
        </p>
      </LegalSection>

      <LegalSection id="limitacoes" heading="Limitação de responsabilidade">
        <p>
          Facilitamos pagamento, registro e entrega do material de ativação exibido no fluxo de compra.
          <strong> Não garantimos disponibilidade contínua</strong> de serviços operados por terceiros,
          nem nos substituímos a eles em incidentes fora do nosso controle (queda de rede do
          fornecedor, mudança de política, bloqueio regional etc.).
        </p>
        <p>
          Quando algo falhar no relacionamento pós-venda que dependa exclusivamente do fornecedor do
          acesso, atuaremos como canal de comunicação dentro do razoável — mas{" "}
          <strong>não somos tutores da infraestrutura de streaming</strong>.
        </p>
      </LegalSection>

      <LegalSection id="alteracoes" heading="Atualizações e contato">
        <p>
          Podemos ajustar estes termos para refletir novidades legais ou de produto. A data no rodapé
          desta página indica a versão vigente. Dúvidas sobre o sentido jurídico do que leu aqui?
          Fale conosco pela{" "}
          <Link href="/contato" className="font-medium text-orange-600 hover:underline">
            página de contato
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}

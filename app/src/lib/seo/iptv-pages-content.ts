import type { FaqItem } from "@/lib/seo/faq-data";

export type IptvPageId = "comprar-iptv" | "como-funciona-iptv" | "iptv-e-confiavel";

export type IptvPageContent = {
  id: IptvPageId;
  path: string;
  /** Para metadata / OG */
  metaTitle: string;
  metaDescription: string;
  keywordsExtra: string[];
  h1: string;
  lead: string;
  sections: { heading: string; paragraphs: string[]; bulletTitle?: string; bullets?: string[] }[];
  faqs: FaqItem[];
  relatedLinks: { href: string; label: string; description: string }[];
};

const internal = {
  planos: { href: "/planos", label: "Ver planos e preços" },
  comprarAcesso: { href: "/comprar-acesso", label: "Comprar acesso agora" },
  comoFunciona: { href: "/como-funciona-iptv", label: "Como funciona o IPTV aqui" },
  confiavel: { href: "/iptv-e-confiavel", label: "IPTV é confiável?" },
  comprarIptv: { href: "/comprar-iptv", label: "Comprar IPTV com Pix" },
};

export const IPTV_PAGES: Record<IptvPageId, IptvPageContent> = {
  "comprar-iptv": {
    id: "comprar-iptv",
    path: "/comprar-iptv",
    metaTitle: "Comprar IPTV com Pix — ativação imediata e acesso na hora | Liberação automática",
    metaDescription:
      "Quer comprar IPTV com segurança? Pix nacional, iptv ativação imediata após confirmação e código na conta. Acesso IPTV na hora, sem filas — veja planos e ative hoje.",
    keywordsExtra: [
      "comprar iptv",
      "iptv via pix",
      "iptv ativação imediata",
      "acesso iptv na hora",
      "iptv brasil",
      "iplay 5 plus",
      "recarga iplay 5 plus",
      "renovar iplay",
    ],
    h1: "Comprar IPTV com Pix: ativação imediata e acesso na hora",
    lead:
      "Se você está pronto para **comprar IPTV** e quer um fluxo nacional, aqui o pagamento é via **Pix** e a **iptv ativação imediata** acontece assim que o banco confirma — você recebe **acesso IPTV na hora** na sua área do cliente, com código para ativar no app suportado.",
    sections: [
      {
        heading: "Por que comprar IPTV com entrega automática faz diferença",
        paragraphs: [
          "Quando a entrega é automática, você não depende de atendimento manual para liberar o acesso. O processo foi pensado para quem busca rapidez: escolhe o período, paga com Pix e acompanha o status em tempo real.",
          "Esse modelo reduz atrito na conversão e aumenta previsibilidade — você sabe exatamente onde encontrar o código e como reinstalar ou consultar o histórico depois.",
        ],
        bulletTitle: "O que você ganha ao fechar com Pix e liberação automática",
        bullets: [
          "Pagamento **IPTV via Pix** direto com instituição financeira brasileira",
          "**Iptv ativação imediata** após confirmação do pagamento",
          "**Acesso IPTV na hora** registrado na conta, com histórico de pedidos",
          "Fluxo comercial claro: um checkout, um comprovante, um código",
        ],
      },
      {
        heading: "Passo a passo para quem quer comprar IPTV hoje",
        paragraphs: [
          "O caminho é simples: abra os **planos**, selecione o tempo de acesso que faz sentido, faça login ou crie conta, gere o Pix e pague no app do banco. Em seguida, o sistema libera o material de ativação automaticamente.",
          `Se ainda tiver dúvidas sobre o processo, leia também o guia ${internal.comoFunciona.label.toLowerCase()} ou a página sobre ${internal.confiavel.label.toLowerCase()}.`,
        ],
      },
    ],
    faqs: [
      {
        question: "Como comprar IPTV aqui com Pix?",
        answer:
          "Escolha um plano, faça login ou cadastro, gere o QR Code ou copie e cole do Pix e conclua o pagamento no app do seu banco. Assim que houver confirmação, o acesso é liberado automaticamente na sua conta.",
      },
      {
        question: "Quanto tempo leva a iptv ativação imediata?",
        answer:
          "Em geral, é rápido: após a confirmação do Pix pelo banco, a liberação ocorre em instantes. Em picos ou revisões antifraude do banco, pode haver pequena variação — mas o fluxo é o mesmo: confirmou, libera.",
      },
      {
        question: "Consigo acesso IPTV na hora em qualquer horário?",
        answer:
          "Sim. A entrega é automática pelo sistema, então não depende de horário comercial humano para aparecer o código na sua conta — desde que o pagamento seja confirmado.",
      },
      {
        question: "IPTV via Pix é seguro?",
        answer:
          "O Pix é regulado no Brasil e processado entre você e a instituição financeira. A loja não precisa armazenar dados de cartão; você paga com mecanismo nacional amplamente adotado.",
      },
    ],
    relatedLinks: [
      { ...internal.comoFunciona, description: "Fluxo completo do pedido à ativação." },
      { ...internal.confiavel, description: "Transparência antes de decidir." },
      { ...internal.planos, description: "Compare períodos e valores." },
    ],
  },
  "como-funciona-iptv": {
    id: "como-funciona-iptv",
    path: "/como-funciona-iptv",
    metaTitle: "Como funciona IPTV com Pix? Ativação imediata e código na hora (2025)",
    metaDescription:
      "Entenda como funciona IPTV na prática: Pix, iptv ativação imediata e acesso iptv na hora. Guia direto para comprar iptv com entrega automática e suporte quando precisar.",
    keywordsExtra: [
      "como funciona iptv",
      "iptv ativação imediata",
      "iptv via pix",
      "comprar iptv",
      "acesso iptv na hora",
      "iplay 5 plus",
      "recarga iplay 5",
      "renovar iplay 5",
    ],
    h1: "Como funciona IPTV com Pix, ativação imediata e código automático",
    lead:
      "Este guia explica, sem mistério, **como funciona IPTV** no nosso fluxo: você **comprar IPTV** escolhendo um plano, paga com **IPTV via Pix** e recebe **acesso IPTV na hora** com **iptv ativação imediata** após a confirmação bancária — tudo rastreável na sua conta.",
    sections: [
      {
        heading: "Da escolha do plano ao acesso liberado",
        paragraphs: [
          "Primeiro você define quanto tempo de acesso precisa. Em seguida, autentica-se (login ou cadastro rápido) para que o pedido fique vinculado a você. O checkout gera o Pix; ao pagar, o gateway confirma e o backend libera o código.",
          "Esse encadeamento é o que permite **iptv ativação imediata** na maior parte dos casos — o gargalo costuma ser só a confirmação do banco, não a loja.",
        ],
        bulletTitle: "Checklist do cliente (visão prática)",
        bullets: [
          "Conta criada ou login feito antes do pagamento",
          "Pix pago com valor e beneficiário corretos",
          "Código disponível na área do cliente após confirmação",
          "Instalação do app indicado e ativação com o código recebido",
        ],
      },
      {
        heading: "Por que falamos em entrega automática",
        paragraphs: [
          "Automatizar a entrega evita erro humano na copia-colagem de código e escala melhor em campanhas de tráfego orgânico — o visitante que pesquisa **comprar iptv** encontra um funil previsível e medível.",
          `Pronto para avançar? Vá direto para ${internal.comprarIptv.label} ou abra os ${internal.planos.label}.`,
        ],
      },
    ],
    faqs: [
      {
        question: "Preciso de equipamento específico para IPTV?",
        answer:
          "Depende do app e do guia de instalação indicado. Muitos usuários utilizam TV Box, Fire Stick ou smart TV Android; siga o tutorial oficial da loja e as recomendações de segurança ao instalar de fontes confiáveis.",
      },
      {
        question: "Onde vejo o código após iptv ativação imediata?",
        answer:
          "Na área logada, em pedidos ou acessos, conforme o layout da loja. Você pode copiar o código e registrar no aplicativo suportado para começar a usar o período contratado.",
      },
      {
        question: "E se o Pix demorar?",
        answer:
          "Alguns bancos exibem compensação em minutos; outros podem levar mais. O sistema libera assim que o provedor de pagamentos marca como pago — não é necessário enviar comprovante manual na maior parte dos casos.",
      },
    ],
    relatedLinks: [
      { ...internal.comprarIptv, description: "Foco em conversão e meios de pagamento." },
      { ...internal.confiavel, description: "Critérios de confiança e segurança." },
      { ...internal.comprarAcesso, description: "Atalho para fechar o pedido." },
    ],
  },
  "iptv-e-confiavel": {
    id: "iptv-e-confiavel",
    path: "/iptv-e-confiavel",
    metaTitle: "IPTV é confiável? Pix, ativação imediata e sinais de loja séria antes de comprar",
    metaDescription:
      "IPTV é confiável quando há processo claro, iptv via pix nacional e iptv ativação imediata com rastreio na conta. Saiba o que observar antes de comprar iptv e receber acesso iptv na hora com segurança.",
    keywordsExtra: [
      "iptv é confiável",
      "comprar iptv seguro",
      "iptv via pix",
      "acesso iptv na hora",
      "iptv ativação imediata",
      "iplay 5 plus",
      "recarga iplay",
      "renovar acesso",
    ],
    h1: "IPTV é confiável? O que avaliar antes de comprar com Pix",
    lead:
      "A pergunta **IPTV é confiável** depende menos do nome “IPTV” e mais do **processo**: pagamento **IPTV via Pix** transparente, **iptv ativação imediata** com registro na conta, política de suporte e clareza sobre o que está incluso no plano — assim você busca **comprar IPTV** com mais segurança e ainda pode ter **acesso IPTV na hora** quando tudo estiver certo.",
    sections: [
      {
        heading: "Sinais de que vale a pena avançar com a compra",
        paragraphs: [
          "Lojas sérias costumam exibir fluxo de checkout claro, termos ou FAQ, canal de suporte (WhatsApp/e-mail) e histórico de pedidos após login. A entrega automática do código reduz incerteza: você enxerga status sem depender de terceiros.",
          "Desconfie de promessas vagas, ausência de login ou pedidos só via chat sem rastreio. Um funil **comprar iptv** bem feito é auditável — para você e para a operação.",
        ],
        bulletTitle: "Checklist rápido de confiança",
        bullets: [
          "Pagamento com meio nacional reconhecido (Pix)",
          "Conta com histórico após **comprar IPTV**",
          "**Iptv ativação imediata** atrelada à confirmação do pagamento",
          "Suporte com número de pedido e canais oficiais",
        ],
      },
      {
        heading: "Limites legais e uso responsável",
        paragraphs: [
          "Use somente conteúdos para os quais tenha permissão. A loja descreve o serviço de acesso/código; a conformidade com direitos autorais é responsabilidade de cada usuário conforme a legislação aplicável.",
          `Se o objetivo é entender o funil antes de pagar, volte a ${internal.comoFunciona.label} ou veja opções em ${internal.planos.label}.`,
        ],
      },
    ],
    faqs: [
      {
        question: "IPTV é confiável se o pagamento for só Pix?",
        answer:
          "Pix em si é seguro e muito usado no Brasil. O que importa é combinar Pix com rastreio de pedido, comunicação oficial e entrega registrada na conta — isso aumenta confiança na operação.",
      },
      {
        question: "Como saber se terei acesso IPTV na hora?",
        answer:
          "Verifique se o site descreve liberação automática após confirmação e se há área logada para ver o código. Esse modelo costuma coincidir com acesso na hora após o banco confirmar.",
      },
      {
        question: "Posso pedir reembolso se não ativar?",
        answer:
          "Depende da política da loja e do caso concreto. Guarde comprovante, número do pedido e fale com o suporte oficial. Evite resolver apenas com terceiros sem identificação do pedido.",
      },
    ],
    relatedLinks: [
      { ...internal.comprarIptv, description: "Fechar com Pix e liberação automática." },
      { ...internal.comoFunciona, description: "Passo a passo técnico do fluxo." },
      { ...internal.planos, description: "Preços e durações disponíveis." },
    ],
  },
};

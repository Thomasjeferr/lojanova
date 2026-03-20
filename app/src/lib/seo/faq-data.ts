/** Fonte única para FAQ na landing (UI + JSON-LD). */
export type FaqItem = { question: string; answer: string };

export const LANDING_FAQ_ITEMS: FaqItem[] = [
  {
    question: "Quando recebo meu código de ativação e meu acesso?",
    answer:
      "No Brasil, assim que o Pix é confirmado pelo banco, a ativação é imediata: seu código de ativação aparece na conta e pode ser copiado. Você também acessa pelo histórico de pedidos quando quiser.",
  },
  {
    question: "Como recebo o código de ativação após pagar?",
    answer:
      "O fluxo é automático. Após a confirmação do pagamento via Pix, o código é liberado na hora na sua área do cliente — receber acesso na hora, sem fila manual.",
  },
  {
    question: "O pagamento via Pix é seguro e imediato?",
    answer:
      "Sim. O Pix é um meio de pagamento nacional direto com a instituição financeira; não armazenamos dados sensíveis de cartão. A confirmação costuma ser rápida, o que permite ativação rápida do seu plano.",
  },
  {
    question: "É seguro comprar acesso e código de ativação aqui?",
    answer:
      "Sim. Você paga via Pix com proteção do ecossistema bancário brasileiro, recebe comprovante e o código fica registrado na sua conta. Em dúvidas, fale com o suporte com o número do pedido.",
  },
  {
    question: "Posso cancelar ou trocar de plano?",
    answer:
      "Cada plano vale pelo período contratado (compra de acesso avulsa). Não há mensalidade oculta: após o fim, você pode adquirir um novo plano se quiser continuar.",
  },
  {
    question: "E se eu tiver problema com o código de ativação?",
    answer:
      "Entre em contato pelo suporte no rodapé e informe o número do pedido. Nossa equipe verifica e ajuda a resolver o mais rápido possível.",
  },
];

export const SEO_KEYWORDS = [
  "código de ativação",
  "compra de acesso",
  "ativação imediata",
  "acesso via Pix",
  "Pix Brasil",
  "pagamento nacional",
  "receber acesso na hora",
  "ativação rápida",
  "entrega automática",
  "streaming",
  /** Intenção comercial comum (metadados / consistência; Google ignora meta keywords em grande parte). */
  "iplay 5 plus",
  "recarga iplay 5",
  "renovar iplay 5",
  "renovar acesso",
  "recarga iptv",
] as const;

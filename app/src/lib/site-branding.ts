import type { SiteTheme } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { FaqItem } from "@/lib/seo/faq-data";
import { LANDING_FAQ_ITEMS } from "@/lib/seo/faq-data";

export type LandingCopy = {
  heroEyebrow: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroTitleSuffix: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  plansTitle: string;
  plansSubtitle: string;
  planBadgePopular: string;
  planPriceCaption: string;
  planBuyButton: string;
  /** Aviso grande antes de abrir o checkout ao clicar em comprar plano */
  prePurchaseWarningEnabled: boolean;
  prePurchaseWarningTitle: string;
  prePurchaseWarningBody: string;
  prePurchaseWarningConfirmLabel: string;
  prePurchaseWarningBackLabel: string;
  faqTitle: string;
  faqSubtitle: string;
  footerTagline: string;
  fontPreset:
    | "inter"
    | "poppins"
    | "montserrat"
    | "roboto"
    | "lato"
    | "nunito"
    | "opensans"
    | "raleway"
    | "sora"
    | "outfit"
    | "arial";
  fontSizePreset: "sm" | "md" | "lg";
  textPrimaryColor: string;
  textSecondaryColor: string;
  textMutedColor: string;
  downloadAppsTitle: string;
  downloadAppsSubtitle: string;
  downloadAppsButtonLabel: string;
  downloadApp1Name: string;
  downloadApp1Url: string;
  downloadApp1ImageUrl: string;
  downloadApp2Name: string;
  downloadApp2Url: string;
  downloadApp2ImageUrl: string;
  downloadApp3Name: string;
  downloadApp3Url: string;
  downloadApp3ImageUrl: string;

  benefitsTitle: string;
  benefitsSubtitle: string;
  benefit1Title: string;
  benefit1Description: string;
  benefit2Title: string;
  benefit2Description: string;
  benefit3Title: string;
  benefit3Description: string;
  benefit4Title: string;
  benefit4Description: string;

  trustSeoTitle: string;
  trustSeoParagraph1: string;
  trustSeoParagraph2: string;
  trustSeoLink1Label: string;
  trustSeoLink1Href: string;
  trustSeoLink2Label: string;
  trustSeoLink2Href: string;
  trustSeoLink3Label: string;
  trustSeoLink3Href: string;

  howItWorksTitlePrefix: string;
  howItWorksTitleHighlight: string;
  howItWorksTitleSuffix: string;
  howItWorksSubtitle: string;
  howItWorksStep1Title: string;
  howItWorksStep1Description: string;
  howItWorksStep2Title: string;
  howItWorksStep2Description: string;
  howItWorksStep3Title: string;
  howItWorksStep3Description: string;
  howItWorksStep4Title: string;
  howItWorksStep4Description: string;

  downloadInstallationBadge: string;
  downloadHeroTitlePrefix: string;
  downloadHeroTitleHighlight: string;
  downloadHeroTitleSuffix: string;
  downloadFeaturedLabel: string;
  downloadMethod1Badge: string;
  downloadMethod1Title: string;
  downloadMethod1Subtitle: string;
  downloadMethod1Steps: string;
  downloadMethod2Badge: string;
  downloadMethod2Title: string;
  downloadMethod2Subtitle: string;
  downloadMethod2Steps: string;
  downloadPlaceholderHint: string;
  downloadSecurityTip: string;
  downloadAppCardDescription: string;

  faqItems: FaqItem[];
};

export type SiteBrandingPublic = {
  logoDataUrl: string | null;
  faviconDataUrl: string | null;
  storeDisplayName: string;
  activeTheme: SiteTheme;
  landingCopy: LandingCopy;
};

export const DEFAULT_LANDING_COPY: LandingCopy = {
  heroEyebrow: "Pix no Brasil · Entrega automática · Sem mensalidade",
  heroTitlePrefix: "Ative seu acesso em",
  heroTitleHighlight: "minutos",
  heroTitleSuffix: "com entrega automática do código",
  heroSubtitle:
    "Compre acesso com Pix, receba código de ativação na hora e ativação imediata após confirmação — simples, nacional e pensado para conversão.",
  heroPrimaryCta: "Ver planos",
  heroSecondaryCta: "Começar agora",
  plansTitle: "Escolha seu plano",
  plansSubtitle:
    "Pagamento via Pix. Código liberado assim que o pagamento confirma. Sem mensalidade, sem surpresas.",
  planBadgePopular: "Mais popular",
  planPriceCaption: "Pagamento único",
  planBuyButton: "Comprar plano",
  prePurchaseWarningEnabled: false,
  prePurchaseWarningTitle: "Confirme se é o plano certo",
  prePurchaseWarningBody:
    "Antes de continuar, confirme com atenção se este é mesmo o plano que pretende comprar.\n\n" +
    "Se comprou o plano errado, não solicite o MED (contestação no banco). Fale connosco primeiro pelo WhatsApp, no canto inferior direito do site — ajudamos a regularizar a situação.\n\n" +
    "Obrigado por não acionar o MED sem nos contactar antes.",
  prePurchaseWarningConfirmLabel: "Sim, é o plano certo — continuar",
  prePurchaseWarningBackLabel: "Não, voltar",
  faqTitle: "Perguntas frequentes",
  faqSubtitle: "Tire suas dúvidas antes de comprar.",
  footerTagline: "Ativação de acesso via Pix com entrega automática.",
  fontPreset: "arial",
  fontSizePreset: "md",
  textPrimaryColor: "#fafafa",
  textSecondaryColor: "#f0f0ef",
  textMutedColor: "#d4d4d4",
  downloadAppsTitle: "Baixe o app para assistir",
  downloadAppsSubtitle:
    "Escolha um dos apps recomendados e conclua a instalação no seu dispositivo em poucos minutos.",
  downloadAppsButtonLabel: "Baixar app",
  downloadApp1Name: "IPlay 5 Plus",
  downloadApp1Url: "",
  downloadApp1ImageUrl: "",
  downloadApp2Name: "UniTV",
  downloadApp2Url: "",
  downloadApp2ImageUrl: "",
  downloadApp3Name: "",
  downloadApp3Url: "",
  downloadApp3ImageUrl: "",

  benefitsTitle: "Por que escolher nosso serviço de código de ativação no Brasil",
  benefitsSubtitle:
    "Processo pensado para quem quer **comprar acesso** com clareza: Pix nacional, **receber acesso na hora** e suporte quando precisar — transparência de ponta a ponta.",
  benefit1Title: "Ativação imediata e entrega automática",
  benefit1Description:
    "Após a confirmação do Pix no Brasil, seu código de ativação é liberado na hora — ativação rápida, sem filas manuais.",
  benefit2Title: "Acesso via Pix com segurança nacional",
  benefit2Description:
    "Pagamento direto com instituições financeiras brasileiras. Não armazenamos dados sensíveis de cartão.",
  benefit3Title: "Compra de acesso sem mensalidade",
  benefit3Description:
    "Pague uma vez e use pelo período do plano. Sem cobrança recorrente ou surpresa na fatura.",
  benefit4Title: "Suporte dedicado ao cliente",
  benefit4Description:
    "Dúvidas sobre código ou pedido? Nossa equipe apoia você com o número da compra em mãos.",

  trustSeoTitle: "Entrega imediata via Pix e ativação automática no Brasil",
  trustSeoParagraph1:
    "Aqui você faz a **compra de acesso** com pagamento nacional: o **Pix** confirma em instantes e você **recebe acesso na hora** — sem esperar atendimento manual. O fluxo foi pensado para **ativação rápida**: escolha o plano, pague e use seu **código de ativação** assim que o banco validar o Pix.",
  trustSeoParagraph2:
    "Se você busca **ativação imediata** e transparência, este é o caminho: **pagamento seguro** no ecossistema financeiro brasileiro, **entrega automática** do código na sua conta e histórico de pedidos sempre disponível. Ideal para quem quer ativar streaming com método simples e suporte quando precisar.",
  trustSeoLink1Label: "Guia para comprar IPTV com Pix",
  trustSeoLink1Href: "/comprar-iptv",
  trustSeoLink2Label: "Como funciona",
  trustSeoLink2Href: "/como-funciona-iptv",
  trustSeoLink3Label: "IPTV é confiável?",
  trustSeoLink3Href: "/iptv-e-confiavel",

  howItWorksTitlePrefix: "Como funciona a ",
  howItWorksTitleHighlight: "compra",
  howItWorksTitleSuffix: " de acesso e a ativação via Pix",
  howItWorksSubtitle:
    "Em poucos passos você sai do checkout com o **código de ativação** na conta: escolha do plano, login, Pix e **ativação automática** após confirmação.",
  howItWorksStep1Title: "Escolha o plano",
  howItWorksStep1Description: "Selecione o período de acesso que melhor combina com você.",
  howItWorksStep2Title: "Faça login ou crie conta",
  howItWorksStep2Description: "Entre com sua conta ou cadastre-se em poucos segundos.",
  howItWorksStep3Title: "Pague via Pix",
  howItWorksStep3Description: "Gere o QR Code ou copie o código e pague no app do seu banco.",
  howItWorksStep4Title: "Receba automaticamente",
  howItWorksStep4Description:
    "O código de ativação é liberado assim que o pagamento é confirmado.",

  downloadInstallationBadge: "Guia rápido de instalação",
  downloadHeroTitlePrefix: "Baixe o ",
  downloadHeroTitleHighlight: "app",
  downloadHeroTitleSuffix: " para assistir",
  downloadFeaturedLabel: "Recomendado",
  downloadMethod1Badge: "Método 1 · Downloader",
  downloadMethod1Title: "Instalação rápida na TV Box / Android TV",
  downloadMethod1Subtitle: "Fluxo recomendado para instalar com segurança e menos cliques.",
  downloadMethod1Steps: [
    "Abra a Play Store da TV e instale o app Downloader (AFTVnews).",
    "Em Configurações, permita “Instalar apps desconhecidos” para o Downloader.",
    "Toque em “Baixar aplicativo” abaixo e copie o link do app.",
    "No Downloader, cole o link, baixe o APK e confirme em “Instalar”.",
    "Abra o app instalado e faça login com seu acesso.",
  ].join("\n"),
  downloadMethod2Badge: "Método 2 · Chrome",
  downloadMethod2Title: "Instalação pelo navegador",
  downloadMethod2Subtitle:
    "Alternativa para Android TV quando você prefere baixar direto pelo navegador.",
  downloadMethod2Steps: [
    "Abra o Chrome (ou navegador disponível) na TV Android.",
    "Clique em “Baixar aplicativo” para abrir o link oficial.",
    "Baixe o APK e autorize instalação de fonte externa quando solicitado.",
    "Conclua a instalação e abra o app para ativar seu acesso.",
  ].join("\n"),
  downloadPlaceholderHint:
    "Adicione no admin a imagem oficial do app para melhorar a visualização.",
  downloadSecurityTip:
    "Dica de segurança: utilize links oficiais e desative apps desconhecidos após instalar.",
  downloadAppCardDescription:
    "Instale o aplicativo oficial e entre com seus dados para liberar seu acesso com rapidez e segurança.",

  faqItems: [...LANDING_FAQ_ITEMS],
};

function mergeFaqItems(raw: unknown): FaqItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return [...LANDING_FAQ_ITEMS];
  const out: FaqItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const q = typeof row.question === "string" ? row.question.trim() : "";
    const a = typeof row.answer === "string" ? row.answer.trim() : "";
    if (q && a) out.push({ question: q, answer: a });
  }
  return out.length ? out : [...LANDING_FAQ_ITEMS];
}

function mergeLandingCopy(raw: unknown): LandingCopy {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_LANDING_COPY };
  const obj = raw as Record<string, unknown>;
  const merged: LandingCopy = {
    heroEyebrow:
      typeof obj.heroEyebrow === "string" && obj.heroEyebrow.trim()
        ? obj.heroEyebrow
        : DEFAULT_LANDING_COPY.heroEyebrow,
    heroTitlePrefix:
      typeof obj.heroTitlePrefix === "string" && obj.heroTitlePrefix.trim()
        ? obj.heroTitlePrefix
        : DEFAULT_LANDING_COPY.heroTitlePrefix,
    heroTitleHighlight:
      typeof obj.heroTitleHighlight === "string" && obj.heroTitleHighlight.trim()
        ? obj.heroTitleHighlight
        : DEFAULT_LANDING_COPY.heroTitleHighlight,
    heroTitleSuffix:
      typeof obj.heroTitleSuffix === "string" && obj.heroTitleSuffix.trim()
        ? obj.heroTitleSuffix
        : DEFAULT_LANDING_COPY.heroTitleSuffix,
    heroSubtitle:
      typeof obj.heroSubtitle === "string" && obj.heroSubtitle.trim()
        ? obj.heroSubtitle
        : DEFAULT_LANDING_COPY.heroSubtitle,
    heroPrimaryCta:
      typeof obj.heroPrimaryCta === "string" && obj.heroPrimaryCta.trim()
        ? obj.heroPrimaryCta
        : DEFAULT_LANDING_COPY.heroPrimaryCta,
    heroSecondaryCta:
      typeof obj.heroSecondaryCta === "string" && obj.heroSecondaryCta.trim()
        ? obj.heroSecondaryCta
        : DEFAULT_LANDING_COPY.heroSecondaryCta,
    plansTitle:
      typeof obj.plansTitle === "string" && obj.plansTitle.trim()
        ? obj.plansTitle
        : DEFAULT_LANDING_COPY.plansTitle,
    plansSubtitle:
      typeof obj.plansSubtitle === "string" && obj.plansSubtitle.trim()
        ? obj.plansSubtitle
        : DEFAULT_LANDING_COPY.plansSubtitle,
    planBadgePopular:
      typeof obj.planBadgePopular === "string" && obj.planBadgePopular.trim()
        ? obj.planBadgePopular
        : DEFAULT_LANDING_COPY.planBadgePopular,
    planPriceCaption:
      typeof obj.planPriceCaption === "string" && obj.planPriceCaption.trim()
        ? obj.planPriceCaption
        : DEFAULT_LANDING_COPY.planPriceCaption,
    planBuyButton:
      typeof obj.planBuyButton === "string" && obj.planBuyButton.trim()
        ? obj.planBuyButton
        : DEFAULT_LANDING_COPY.planBuyButton,
    prePurchaseWarningEnabled:
      typeof obj.prePurchaseWarningEnabled === "boolean"
        ? obj.prePurchaseWarningEnabled
        : DEFAULT_LANDING_COPY.prePurchaseWarningEnabled,
    prePurchaseWarningTitle:
      typeof obj.prePurchaseWarningTitle === "string" && obj.prePurchaseWarningTitle.trim()
        ? obj.prePurchaseWarningTitle
        : DEFAULT_LANDING_COPY.prePurchaseWarningTitle,
    prePurchaseWarningBody:
      typeof obj.prePurchaseWarningBody === "string" && obj.prePurchaseWarningBody.trim()
        ? obj.prePurchaseWarningBody
        : DEFAULT_LANDING_COPY.prePurchaseWarningBody,
    prePurchaseWarningConfirmLabel:
      typeof obj.prePurchaseWarningConfirmLabel === "string" &&
      obj.prePurchaseWarningConfirmLabel.trim()
        ? obj.prePurchaseWarningConfirmLabel
        : DEFAULT_LANDING_COPY.prePurchaseWarningConfirmLabel,
    prePurchaseWarningBackLabel:
      typeof obj.prePurchaseWarningBackLabel === "string" &&
      obj.prePurchaseWarningBackLabel.trim()
        ? obj.prePurchaseWarningBackLabel
        : DEFAULT_LANDING_COPY.prePurchaseWarningBackLabel,
    faqTitle:
      typeof obj.faqTitle === "string" && obj.faqTitle.trim()
        ? obj.faqTitle
        : DEFAULT_LANDING_COPY.faqTitle,
    faqSubtitle:
      typeof obj.faqSubtitle === "string" && obj.faqSubtitle.trim()
        ? obj.faqSubtitle
        : DEFAULT_LANDING_COPY.faqSubtitle,
    footerTagline:
      typeof obj.footerTagline === "string" && obj.footerTagline.trim()
        ? obj.footerTagline
        : DEFAULT_LANDING_COPY.footerTagline,
    fontPreset:
      typeof obj.fontPreset === "string" &&
      [
        "inter",
        "poppins",
        "montserrat",
        "roboto",
        "lato",
        "nunito",
        "opensans",
        "raleway",
        "sora",
        "outfit",
        "arial",
      ].includes(obj.fontPreset)
        ? (obj.fontPreset as LandingCopy["fontPreset"])
        : DEFAULT_LANDING_COPY.fontPreset,
    fontSizePreset:
      obj.fontSizePreset === "sm" || obj.fontSizePreset === "md" || obj.fontSizePreset === "lg"
        ? obj.fontSizePreset
        : DEFAULT_LANDING_COPY.fontSizePreset,
    textPrimaryColor:
      typeof obj.textPrimaryColor === "string" && /^#([A-Fa-f0-9]{6})$/.test(obj.textPrimaryColor)
        ? obj.textPrimaryColor
        : DEFAULT_LANDING_COPY.textPrimaryColor,
    textSecondaryColor:
      typeof obj.textSecondaryColor === "string" &&
      /^#([A-Fa-f0-9]{6})$/.test(obj.textSecondaryColor)
        ? obj.textSecondaryColor
        : DEFAULT_LANDING_COPY.textSecondaryColor,
    textMutedColor:
      typeof obj.textMutedColor === "string" && /^#([A-Fa-f0-9]{6})$/.test(obj.textMutedColor)
        ? obj.textMutedColor
        : DEFAULT_LANDING_COPY.textMutedColor,
    downloadAppsTitle:
      typeof obj.downloadAppsTitle === "string" && obj.downloadAppsTitle.trim()
        ? obj.downloadAppsTitle
        : DEFAULT_LANDING_COPY.downloadAppsTitle,
    downloadAppsSubtitle:
      typeof obj.downloadAppsSubtitle === "string" && obj.downloadAppsSubtitle.trim()
        ? obj.downloadAppsSubtitle
        : DEFAULT_LANDING_COPY.downloadAppsSubtitle,
    downloadAppsButtonLabel:
      typeof obj.downloadAppsButtonLabel === "string" && obj.downloadAppsButtonLabel.trim()
        ? obj.downloadAppsButtonLabel
        : DEFAULT_LANDING_COPY.downloadAppsButtonLabel,
    downloadApp1Name:
      typeof obj.downloadApp1Name === "string" && obj.downloadApp1Name.trim()
        ? obj.downloadApp1Name
        : DEFAULT_LANDING_COPY.downloadApp1Name,
    downloadApp1Url:
      typeof obj.downloadApp1Url === "string"
        ? obj.downloadApp1Url
        : DEFAULT_LANDING_COPY.downloadApp1Url,
    downloadApp1ImageUrl:
      typeof obj.downloadApp1ImageUrl === "string"
        ? obj.downloadApp1ImageUrl
        : DEFAULT_LANDING_COPY.downloadApp1ImageUrl,
    downloadApp2Name:
      typeof obj.downloadApp2Name === "string" && obj.downloadApp2Name.trim()
        ? obj.downloadApp2Name
        : DEFAULT_LANDING_COPY.downloadApp2Name,
    downloadApp2Url:
      typeof obj.downloadApp2Url === "string"
        ? obj.downloadApp2Url
        : DEFAULT_LANDING_COPY.downloadApp2Url,
    downloadApp2ImageUrl:
      typeof obj.downloadApp2ImageUrl === "string"
        ? obj.downloadApp2ImageUrl
        : DEFAULT_LANDING_COPY.downloadApp2ImageUrl,
    downloadApp3Name:
      typeof obj.downloadApp3Name === "string"
        ? obj.downloadApp3Name
        : DEFAULT_LANDING_COPY.downloadApp3Name,
    downloadApp3Url:
      typeof obj.downloadApp3Url === "string"
        ? obj.downloadApp3Url
        : DEFAULT_LANDING_COPY.downloadApp3Url,
    downloadApp3ImageUrl:
      typeof obj.downloadApp3ImageUrl === "string"
        ? obj.downloadApp3ImageUrl
        : DEFAULT_LANDING_COPY.downloadApp3ImageUrl,

    benefitsTitle:
      typeof obj.benefitsTitle === "string" && obj.benefitsTitle.trim()
        ? obj.benefitsTitle
        : DEFAULT_LANDING_COPY.benefitsTitle,
    benefitsSubtitle:
      typeof obj.benefitsSubtitle === "string" && obj.benefitsSubtitle.trim()
        ? obj.benefitsSubtitle
        : DEFAULT_LANDING_COPY.benefitsSubtitle,
    benefit1Title:
      typeof obj.benefit1Title === "string" && obj.benefit1Title.trim()
        ? obj.benefit1Title
        : DEFAULT_LANDING_COPY.benefit1Title,
    benefit1Description:
      typeof obj.benefit1Description === "string" && obj.benefit1Description.trim()
        ? obj.benefit1Description
        : DEFAULT_LANDING_COPY.benefit1Description,
    benefit2Title:
      typeof obj.benefit2Title === "string" && obj.benefit2Title.trim()
        ? obj.benefit2Title
        : DEFAULT_LANDING_COPY.benefit2Title,
    benefit2Description:
      typeof obj.benefit2Description === "string" && obj.benefit2Description.trim()
        ? obj.benefit2Description
        : DEFAULT_LANDING_COPY.benefit2Description,
    benefit3Title:
      typeof obj.benefit3Title === "string" && obj.benefit3Title.trim()
        ? obj.benefit3Title
        : DEFAULT_LANDING_COPY.benefit3Title,
    benefit3Description:
      typeof obj.benefit3Description === "string" && obj.benefit3Description.trim()
        ? obj.benefit3Description
        : DEFAULT_LANDING_COPY.benefit3Description,
    benefit4Title:
      typeof obj.benefit4Title === "string" && obj.benefit4Title.trim()
        ? obj.benefit4Title
        : DEFAULT_LANDING_COPY.benefit4Title,
    benefit4Description:
      typeof obj.benefit4Description === "string" && obj.benefit4Description.trim()
        ? obj.benefit4Description
        : DEFAULT_LANDING_COPY.benefit4Description,

    trustSeoTitle:
      typeof obj.trustSeoTitle === "string" && obj.trustSeoTitle.trim()
        ? obj.trustSeoTitle
        : DEFAULT_LANDING_COPY.trustSeoTitle,
    trustSeoParagraph1:
      typeof obj.trustSeoParagraph1 === "string" && obj.trustSeoParagraph1.trim()
        ? obj.trustSeoParagraph1
        : DEFAULT_LANDING_COPY.trustSeoParagraph1,
    trustSeoParagraph2:
      typeof obj.trustSeoParagraph2 === "string" && obj.trustSeoParagraph2.trim()
        ? obj.trustSeoParagraph2
        : DEFAULT_LANDING_COPY.trustSeoParagraph2,
    trustSeoLink1Label:
      typeof obj.trustSeoLink1Label === "string" && obj.trustSeoLink1Label.trim()
        ? obj.trustSeoLink1Label
        : DEFAULT_LANDING_COPY.trustSeoLink1Label,
    trustSeoLink1Href:
      typeof obj.trustSeoLink1Href === "string" && obj.trustSeoLink1Href.trim()
        ? obj.trustSeoLink1Href
        : DEFAULT_LANDING_COPY.trustSeoLink1Href,
    trustSeoLink2Label:
      typeof obj.trustSeoLink2Label === "string" && obj.trustSeoLink2Label.trim()
        ? obj.trustSeoLink2Label
        : DEFAULT_LANDING_COPY.trustSeoLink2Label,
    trustSeoLink2Href:
      typeof obj.trustSeoLink2Href === "string" && obj.trustSeoLink2Href.trim()
        ? obj.trustSeoLink2Href
        : DEFAULT_LANDING_COPY.trustSeoLink2Href,
    trustSeoLink3Label:
      typeof obj.trustSeoLink3Label === "string" && obj.trustSeoLink3Label.trim()
        ? obj.trustSeoLink3Label
        : DEFAULT_LANDING_COPY.trustSeoLink3Label,
    trustSeoLink3Href:
      typeof obj.trustSeoLink3Href === "string" && obj.trustSeoLink3Href.trim()
        ? obj.trustSeoLink3Href
        : DEFAULT_LANDING_COPY.trustSeoLink3Href,

    howItWorksTitlePrefix:
      typeof obj.howItWorksTitlePrefix === "string" && obj.howItWorksTitlePrefix.trim()
        ? obj.howItWorksTitlePrefix
        : DEFAULT_LANDING_COPY.howItWorksTitlePrefix,
    howItWorksTitleHighlight:
      typeof obj.howItWorksTitleHighlight === "string" && obj.howItWorksTitleHighlight.trim()
        ? obj.howItWorksTitleHighlight
        : DEFAULT_LANDING_COPY.howItWorksTitleHighlight,
    howItWorksTitleSuffix:
      typeof obj.howItWorksTitleSuffix === "string" && obj.howItWorksTitleSuffix.trim()
        ? obj.howItWorksTitleSuffix
        : DEFAULT_LANDING_COPY.howItWorksTitleSuffix,
    howItWorksSubtitle:
      typeof obj.howItWorksSubtitle === "string" && obj.howItWorksSubtitle.trim()
        ? obj.howItWorksSubtitle
        : DEFAULT_LANDING_COPY.howItWorksSubtitle,
    howItWorksStep1Title:
      typeof obj.howItWorksStep1Title === "string" && obj.howItWorksStep1Title.trim()
        ? obj.howItWorksStep1Title
        : DEFAULT_LANDING_COPY.howItWorksStep1Title,
    howItWorksStep1Description:
      typeof obj.howItWorksStep1Description === "string" && obj.howItWorksStep1Description.trim()
        ? obj.howItWorksStep1Description
        : DEFAULT_LANDING_COPY.howItWorksStep1Description,
    howItWorksStep2Title:
      typeof obj.howItWorksStep2Title === "string" && obj.howItWorksStep2Title.trim()
        ? obj.howItWorksStep2Title
        : DEFAULT_LANDING_COPY.howItWorksStep2Title,
    howItWorksStep2Description:
      typeof obj.howItWorksStep2Description === "string" && obj.howItWorksStep2Description.trim()
        ? obj.howItWorksStep2Description
        : DEFAULT_LANDING_COPY.howItWorksStep2Description,
    howItWorksStep3Title:
      typeof obj.howItWorksStep3Title === "string" && obj.howItWorksStep3Title.trim()
        ? obj.howItWorksStep3Title
        : DEFAULT_LANDING_COPY.howItWorksStep3Title,
    howItWorksStep3Description:
      typeof obj.howItWorksStep3Description === "string" && obj.howItWorksStep3Description.trim()
        ? obj.howItWorksStep3Description
        : DEFAULT_LANDING_COPY.howItWorksStep3Description,
    howItWorksStep4Title:
      typeof obj.howItWorksStep4Title === "string" && obj.howItWorksStep4Title.trim()
        ? obj.howItWorksStep4Title
        : DEFAULT_LANDING_COPY.howItWorksStep4Title,
    howItWorksStep4Description:
      typeof obj.howItWorksStep4Description === "string" && obj.howItWorksStep4Description.trim()
        ? obj.howItWorksStep4Description
        : DEFAULT_LANDING_COPY.howItWorksStep4Description,

    downloadInstallationBadge:
      typeof obj.downloadInstallationBadge === "string" && obj.downloadInstallationBadge.trim()
        ? obj.downloadInstallationBadge
        : DEFAULT_LANDING_COPY.downloadInstallationBadge,
    downloadHeroTitlePrefix:
      typeof obj.downloadHeroTitlePrefix === "string" && obj.downloadHeroTitlePrefix.trim()
        ? obj.downloadHeroTitlePrefix
        : DEFAULT_LANDING_COPY.downloadHeroTitlePrefix,
    downloadHeroTitleHighlight:
      typeof obj.downloadHeroTitleHighlight === "string" && obj.downloadHeroTitleHighlight.trim()
        ? obj.downloadHeroTitleHighlight
        : DEFAULT_LANDING_COPY.downloadHeroTitleHighlight,
    downloadHeroTitleSuffix:
      typeof obj.downloadHeroTitleSuffix === "string" && obj.downloadHeroTitleSuffix.trim()
        ? obj.downloadHeroTitleSuffix
        : DEFAULT_LANDING_COPY.downloadHeroTitleSuffix,
    downloadFeaturedLabel:
      typeof obj.downloadFeaturedLabel === "string" && obj.downloadFeaturedLabel.trim()
        ? obj.downloadFeaturedLabel
        : DEFAULT_LANDING_COPY.downloadFeaturedLabel,
    downloadMethod1Badge:
      typeof obj.downloadMethod1Badge === "string" && obj.downloadMethod1Badge.trim()
        ? obj.downloadMethod1Badge
        : DEFAULT_LANDING_COPY.downloadMethod1Badge,
    downloadMethod1Title:
      typeof obj.downloadMethod1Title === "string" && obj.downloadMethod1Title.trim()
        ? obj.downloadMethod1Title
        : DEFAULT_LANDING_COPY.downloadMethod1Title,
    downloadMethod1Subtitle:
      typeof obj.downloadMethod1Subtitle === "string" && obj.downloadMethod1Subtitle.trim()
        ? obj.downloadMethod1Subtitle
        : DEFAULT_LANDING_COPY.downloadMethod1Subtitle,
    downloadMethod1Steps:
      typeof obj.downloadMethod1Steps === "string" && obj.downloadMethod1Steps.trim()
        ? obj.downloadMethod1Steps
        : DEFAULT_LANDING_COPY.downloadMethod1Steps,
    downloadMethod2Badge:
      typeof obj.downloadMethod2Badge === "string" && obj.downloadMethod2Badge.trim()
        ? obj.downloadMethod2Badge
        : DEFAULT_LANDING_COPY.downloadMethod2Badge,
    downloadMethod2Title:
      typeof obj.downloadMethod2Title === "string" && obj.downloadMethod2Title.trim()
        ? obj.downloadMethod2Title
        : DEFAULT_LANDING_COPY.downloadMethod2Title,
    downloadMethod2Subtitle:
      typeof obj.downloadMethod2Subtitle === "string" && obj.downloadMethod2Subtitle.trim()
        ? obj.downloadMethod2Subtitle
        : DEFAULT_LANDING_COPY.downloadMethod2Subtitle,
    downloadMethod2Steps:
      typeof obj.downloadMethod2Steps === "string" && obj.downloadMethod2Steps.trim()
        ? obj.downloadMethod2Steps
        : DEFAULT_LANDING_COPY.downloadMethod2Steps,
    downloadPlaceholderHint:
      typeof obj.downloadPlaceholderHint === "string" && obj.downloadPlaceholderHint.trim()
        ? obj.downloadPlaceholderHint
        : DEFAULT_LANDING_COPY.downloadPlaceholderHint,
    downloadSecurityTip:
      typeof obj.downloadSecurityTip === "string" && obj.downloadSecurityTip.trim()
        ? obj.downloadSecurityTip
        : DEFAULT_LANDING_COPY.downloadSecurityTip,
    downloadAppCardDescription:
      typeof obj.downloadAppCardDescription === "string" && obj.downloadAppCardDescription.trim()
        ? obj.downloadAppCardDescription
        : DEFAULT_LANDING_COPY.downloadAppCardDescription,

    faqItems: mergeFaqItems(obj.faqItems),
  };

  const composedDownloadTitle = `${merged.downloadHeroTitlePrefix}${merged.downloadHeroTitleHighlight}${merged.downloadHeroTitleSuffix}`.trim();
  if (composedDownloadTitle) {
    merged.downloadAppsTitle = composedDownloadTitle;
  }

  return merged;
}

/** FAQ da landing (sempre preenchido após merge). */
export function getLandingFaqItems(copy: LandingCopy): FaqItem[] {
  return copy.faqItems.length > 0 ? copy.faqItems : [...LANDING_FAQ_ITEMS];
}

const FALLBACK: SiteBrandingPublic = {
  logoDataUrl: null,
  faviconDataUrl: null,
  storeDisplayName: "Loja Nova",
  activeTheme: "orange",
  landingCopy: { ...DEFAULT_LANDING_COPY },
};

export async function getSiteBranding(): Promise<SiteBrandingPublic> {
  noStore();
  try {
    const row = await prisma.siteBranding.findUnique({
      where: { id: "default" },
      select: {
        logoDataUrl: true,
        faviconDataUrl: true,
        storeDisplayName: true,
        activeTheme: true,
        landingCopy: true,
      },
    });
    if (!row) return { ...FALLBACK };
    return {
      logoDataUrl: row.logoDataUrl,
      faviconDataUrl: row.faviconDataUrl,
      storeDisplayName: row.storeDisplayName || FALLBACK.storeDisplayName,
      activeTheme: row.activeTheme,
      landingCopy: mergeLandingCopy(row.landingCopy),
    };
  } catch {
    return { ...FALLBACK };
  }
}

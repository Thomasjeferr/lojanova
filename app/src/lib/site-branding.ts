import type { SiteTheme } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

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
    | "outfit";
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
};

export type SiteBrandingPublic = {
  logoDataUrl: string | null;
  faviconDataUrl: string | null;
  storeDisplayName: string;
  activeTheme: SiteTheme;
  landingCopy: LandingCopy;
};

export const DEFAULT_LANDING_COPY: LandingCopy = {
  heroEyebrow: "Pix · Entrega automática · Sem mensalidade",
  heroTitlePrefix: "Ative seu acesso em",
  heroTitleHighlight: "minutos",
  heroTitleSuffix: "sem complicação",
  heroSubtitle:
    "Códigos de ativação com pagamento via Pix e liberação na hora. Experiência pensada para quem valoriza clareza, velocidade e confiança.",
  heroPrimaryCta: "Ver planos",
  heroSecondaryCta: "Começar agora",
  plansTitle: "Escolha seu plano",
  plansSubtitle:
    "Pagamento via Pix. Código liberado assim que o pagamento confirma. Sem mensalidade, sem surpresas.",
  planBadgePopular: "Mais popular",
  planPriceCaption: "Pagamento único",
  planBuyButton: "Comprar plano",
  faqTitle: "Perguntas frequentes",
  faqSubtitle: "Tire suas dúvidas antes de comprar.",
  footerTagline: "Ativação de acesso via Pix com entrega automática.",
  fontPreset: "inter",
  fontSizePreset: "md",
  textPrimaryColor: "#18181b",
  textSecondaryColor: "#3f3f46",
  textMutedColor: "#71717a",
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
};

function mergeLandingCopy(raw: unknown): LandingCopy {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_LANDING_COPY };
  const obj = raw as Record<string, unknown>;
  return {
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
  };
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

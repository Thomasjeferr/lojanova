import type { Metadata } from "next";
import { env } from "@/lib/env";
import { SEO_KEYWORDS } from "./faq-data";

const KEYWORDS_JOINED = [...SEO_KEYWORDS].join(", ");

export function seoMetadataBase(): Pick<Metadata, "metadataBase"> {
  try {
    return { metadataBase: new URL(env.APP_URL) };
  } catch {
    return { metadataBase: new URL("http://localhost:3000") };
  }
}

export function buildCanonical(pathname: string): string {
  const origin = env.APP_URL.replace(/\/+$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${path === "//" ? "/" : path}`;
}

type BuildPageMetaInput = {
  title: string;
  description: string;
  path: string;
  siteName: string;
  /** Palavras-chave extra (opcional); sempre inclui o conjunto base. */
  keywordsExtra?: string[];
  ogImageAlt?: string;
  index?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  siteName,
  keywordsExtra = [],
  ogImageAlt,
  index = true,
}: BuildPageMetaInput): Metadata {
  const canonical = buildCanonical(path);
  const keywords = [...new Set([...keywordsExtra, ...SEO_KEYWORDS])].join(", ");
  const robots = index
    ? ({ index: true, follow: true } as const)
    : ({ index: false, follow: false } as const);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: canonical,
      siteName,
      title,
      description,
      ...(ogImageAlt
        ? { images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: ogImageAlt }] }
        : { images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteName }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export function defaultSiteTitle(storeDisplayName: string): string {
  return `Ativação imediata via Pix | ${storeDisplayName} — código de ativação na hora`;
}

export function defaultSiteDescription(storeDisplayName: string): string {
  const s = `Compre acesso com Pix no Brasil em ${storeDisplayName}. Código de ativação, entrega automática e ativação rápida após confirmação — simples e seguro.`;
  return s.length <= 160 ? s : `${s.slice(0, 157).trim()}…`;
}

export { KEYWORDS_JOINED };

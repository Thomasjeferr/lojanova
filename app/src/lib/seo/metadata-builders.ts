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

/** Limita comprimento para snippet (~155–160 caracteres). */
export function clipMetaDescription(text: string, max = 158): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1)).trim()}…`;
}

export function defaultSiteTitle(storeDisplayName: string): string {
  return `${storeDisplayName} · Pix, recarga e renovar — código na hora`;
}

export function defaultSiteDescription(storeDisplayName: string): string {
  return clipMetaDescription(
    `Recarga e renovação de acesso em ${storeDisplayName}: Pix no Brasil, código de ativação e liberação automática após confirmação — simples e seguro.`,
  );
}

export { KEYWORDS_JOINED };

import type { SiteBrandingPublic } from "@/lib/site-branding";
import type { FaqItem } from "@/lib/seo/faq-data";
import { buildCanonical } from "@/lib/seo/metadata-builders";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function IptvGuideJsonLd({
  branding,
  pageUrlPath,
  pageTitle,
  faqs,
  productName = "Acesso digital IPTV com código de ativação",
}: {
  branding: SiteBrandingPublic;
  pageUrlPath: string;
  pageTitle: string;
  faqs: FaqItem[];
  productName?: string;
}) {
  const origin = buildCanonical("/").replace(/\/$/, "");
  const pageUrl = buildCanonical(pageUrlPath);
  const name = branding.storeDisplayName;

  const organization: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: origin,
    description:
      branding.landingCopy.footerTagline ||
      `${name}: IPTV via Pix, ativação imediata e entrega automática no Brasil.`,
    areaServed: { "@type": "Country", name: "Brasil" },
  };
  if (branding.logoDataUrl?.startsWith("http")) {
    organization.logo = branding.logoDataUrl;
  }

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${productName} — ${name}`,
    description:
      "Compra de acesso IPTV com pagamento via Pix, iptv ativação imediata após confirmação e código na conta. Entrega automática no Brasil.",
    brand: { "@type": "Brand", name },
    category: "Digital goods",
    offers: {
      "@type": "Offer",
      url: buildCanonical("/planos"),
      priceCurrency: "BRL",
      availability: "https://schema.org/OnlineOnly",
      seller: { "@type": "Organization", name, url: origin },
      description: "Planos com períodos variados; consulte valores na página de planos.",
    },
  };

  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    url: pageUrl,
    isPartOf: { "@type": "WebSite", url: origin, name },
    inLanguage: "pt-BR",
    about: product,
    publisher: { "@type": "Organization", name, url: origin },
  };

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={faq} />
      <JsonLd data={product} />
      <JsonLd data={webpage} />
    </>
  );
}

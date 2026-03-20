import type { SiteBrandingPublic } from "@/lib/site-branding";
import { LANDING_FAQ_ITEMS } from "@/lib/seo/faq-data";
import { buildCanonical } from "@/lib/seo/metadata-builders";

type PlanForSchema = {
  id: string;
  title: string;
  durationDays: number;
  priceCents: number;
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LandingJsonLd({
  branding,
  plans,
  /** Evita FAQPage duplicado em URLs secundárias; use só na home. */
  includeFaq = true,
}: {
  branding: SiteBrandingPublic;
  plans: PlanForSchema[];
  includeFaq?: boolean;
}) {
  const origin = buildCanonical("/").replace(/\/$/, "");
  const name = branding.storeDisplayName;

  const organization: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: origin,
    description: branding.landingCopy.footerTagline || defaultOrgDescription(name),
    areaServed: {
      "@type": "Country",
      name: "Brasil",
    },
  };
  if (branding.logoDataUrl?.startsWith("http")) {
    organization.logo = branding.logoDataUrl;
  }

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: origin,
    description: branding.landingCopy.footerTagline || defaultOrgDescription(name),
    inLanguage: "pt-BR",
    publisher: { "@type": "Organization", name, url: origin },
    potentialAction: {
      "@type": "ReadAction",
      target: [
        `${origin}/planos`,
        `${origin}/comprar-acesso`,
        `${origin}/comprar-iptv`,
        `${origin}/como-funciona-iptv`,
        `${origin}/iptv-e-confiavel`,
        `${origin}/termos`,
        `${origin}/privacidade`,
        `${origin}/contato`,
      ],
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: LANDING_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const productSchemas = plans.map((p) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.title} — ${name}`,
    description: `Acesso digital por ${p.durationDays} dias. Código de ativação com pagamento via Pix e entrega automática no Brasil.`,
    category: "Digital goods",
    sku: p.id,
    productID: p.id,
    url: `${origin}/planos`,
    brand: { "@type": "Brand", name },
    offers: {
      "@type": "Offer",
      url: `${origin}/planos`,
      priceCurrency: "BRL",
      price: (p.priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name, url: origin },
    },
  }));

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      {includeFaq ? <JsonLd data={faq} /> : null}
      {productSchemas.map((data, i) => (
        <JsonLd key={plans[i]?.id ?? i} data={data} />
      ))}
    </>
  );
}

function defaultOrgDescription(storeName: string) {
  return `${storeName}: compra de acesso, código de ativação e Pix com liberação automática no Brasil.`;
}

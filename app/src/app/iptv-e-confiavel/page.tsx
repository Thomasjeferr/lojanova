import type { Metadata } from "next";
import { getLandingUserSession } from "@/lib/landing-user-session";
import { getSiteBranding } from "@/lib/site-branding";
import { IPTV_PAGES } from "@/lib/seo/iptv-pages-content";
import { buildPageMetadata } from "@/lib/seo/metadata-builders";
import { IptvGuideJsonLd } from "@/components/seo/iptv-guide-json-ld";
import { IptvGuideShell, IptvArticle } from "@/components/marketing/iptv-guide-shell";

export const dynamic = "force-dynamic";

const content = IPTV_PAGES["iptv-e-confiavel"];

export async function generateMetadata(): Promise<Metadata> {
  const b = await getSiteBranding();
  return buildPageMetadata({
    title: content.metaTitle,
    description: content.metaDescription,
    path: content.path,
    siteName: b.storeDisplayName,
    keywordsExtra: content.keywordsExtra,
    ogImageAlt: `${b.storeDisplayName} — IPTV é confiável`,
  });
}

export default async function IptvEConfiavelPage() {
  const [branding, userSession] = await Promise.all([
    getSiteBranding(),
    getLandingUserSession(),
  ]);

  return (
    <>
      <IptvGuideJsonLd
        branding={branding}
        pageUrlPath={content.path}
        pageTitle={content.h1}
        faqs={content.faqs}
      />
      <IptvGuideShell branding={branding} userSession={userSession}>
        <IptvArticle content={content} />
      </IptvGuideShell>
    </>
  );
}

import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth";
import { getSiteBranding } from "@/lib/site-branding";
import { IPTV_PAGES } from "@/lib/seo/iptv-pages-content";
import { buildPageMetadata } from "@/lib/seo/metadata-builders";
import { IptvGuideJsonLd } from "@/components/seo/iptv-guide-json-ld";
import { IptvGuideShell, IptvArticle } from "@/components/marketing/iptv-guide-shell";

export const dynamic = "force-dynamic";

const content = IPTV_PAGES["como-funciona-iptv"];

export async function generateMetadata(): Promise<Metadata> {
  const b = await getSiteBranding();
  return buildPageMetadata({
    title: content.metaTitle,
    description: content.metaDescription,
    path: content.path,
    siteName: b.storeDisplayName,
    keywordsExtra: content.keywordsExtra,
    ogImageAlt: `${b.storeDisplayName} — como funciona IPTV`,
  });
}

export default async function ComoFuncionaIptvPage() {
  const [branding, auth] = await Promise.all([getSiteBranding(), getAuthUser()]);
  const userSession = auth ? { email: auth.email } : null;

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

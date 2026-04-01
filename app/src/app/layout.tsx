import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Poppins,
  Montserrat,
  Roboto,
  Lato,
  Nunito,
  Open_Sans,
  Raleway,
  Sora,
  Outfit,
} from "next/font/google";
import { getSiteBranding } from "@/lib/site-branding";
import { themeStyleForHtml } from "@/lib/theme-inline-style";
import {
  buildCanonical,
  buildFaviconUrl,
  defaultSiteDescription,
  KEYWORDS_JOINED,
  seoMetadataBase,
} from "@/lib/seo/metadata-builders";
import { TrackingCapture } from "@/components/tracking-capture";
import "./globals.css";

/** Tema vem da BD; o layout raiz não pode ficar em cache estático senão data-theme fica desatualizado. */
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700", "900"] });
const lato = Lato({ variable: "--font-lato", subsets: ["latin"], weight: ["400", "700", "900"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const openSans = Open_Sans({ variable: "--font-opensans", subsets: ["latin"] });
const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const b = await getSiteBranding();
  const description = defaultSiteDescription(b.storeDisplayName);
  const ogUrl = buildCanonical("/");

  return {
    ...seoMetadataBase(),
    title: {
      default: `${b.storeDisplayName} · Pix, recarga e código na hora`,
      template: `%s | ${b.storeDisplayName}`,
    },
    description,
    keywords: KEYWORDS_JOINED,
    applicationName: b.storeDisplayName,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: ogUrl,
      siteName: b.storeDisplayName,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${b.storeDisplayName} · Pix e código na hora`,
      description,
    },
    /**
     * Um único rel=icon canónico: /favicon.ico (middleware → /icon). Evita dois hrefs com o mesmo
     * recurso e confusão no índice. ?v= muda quando o favicon na BD muda (cache bust).
     * Google ignora favicon em data: no admin; o que conta é este URL absoluto.
     */
    icons: {
      icon: [{ url: buildFaviconUrl(b.faviconDataUrl) }],
      apple: [{ url: buildFaviconUrl(b.faviconDataUrl) }],
    },
    verification: {
      google: "cFStNsiqykp_0UbvNvIdM9HcNBMtboTIuUEqN8BXu7s",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getSiteBranding();
  return (
    <html
      lang="pt-BR"
      data-theme={branding.activeTheme}
      data-font-preset={branding.landingCopy.fontPreset}
      data-font-size={branding.landingCopy.fontSizePreset}
      style={themeStyleForHtml(branding.activeTheme)}
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${montserrat.variable} ${roboto.variable} ${lato.variable} ${nunito.variable} ${openSans.variable} ${raleway.variable} ${sora.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TrackingCapture />
        {children}
      </body>
    </html>
  );
}

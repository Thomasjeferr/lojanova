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
  const titleBase = `${b.storeDisplayName} - Códigos de Ativação`;
  return {
    title: titleBase,
    description: "Plataforma SaaS para venda de códigos com entrega automática",
    ...(b.faviconDataUrl
      ? {
          icons: {
            icon: [{ url: b.faviconDataUrl }],
            apple: [{ url: b.faviconDataUrl }],
          },
        }
      : {}),
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

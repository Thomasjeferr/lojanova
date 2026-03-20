import { ImageResponse } from "next/og";
import { getSiteBranding } from "@/lib/site-branding";

export const runtime = "nodejs";
export const alt = "Código de ativação e acesso via Pix";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const b = await getSiteBranding();
  const title = b.storeDisplayName;
  const subtitle = "Código de ativação · Pix · Entrega automática no Brasil";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #18181b 0%, #27272a 45%, #3f3f46 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 900,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 600,
              color: "#f97316",
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
            }}
          >
            Ativação imediata
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 64,
              fontWeight: 800,
              color: "#fafafa",
              lineHeight: 1.1,
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 500,
              color: "#a1a1aa",
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    ),
    { ...size },
  );
}

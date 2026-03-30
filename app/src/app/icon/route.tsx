import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { getSiteBranding } from "@/lib/site-branding";

export const dynamic = "force-dynamic";

function parseDataUrl(dataUrl: string): { contentType: string; buffer: Buffer } | null {
  const match = /^data:(image\/[\w.+-]+);base64,(.+)$/i.exec(dataUrl.trim());
  if (!match) return null;
  try {
    return {
      contentType: match[1]!.toLowerCase(),
      buffer: Buffer.from(match[2]!, "base64"),
    };
  } catch {
    return null;
  }
}

/**
 * Favicon servido em URL real (/icon) para crawlers (ex.: Google) — data: no <head> costuma ser ignorado.
 */
export async function GET() {
  const b = await getSiteBranding();
  if (b.faviconDataUrl) {
    const parsed = parseDataUrl(b.faviconDataUrl);
    if (parsed && parsed.buffer.length > 0) {
      return new NextResponse(new Uint8Array(parsed.buffer), {
        headers: {
          "Content-Type": parsed.contentType,
          // Crawlers (Google) voltam pouco; cache longo reduz carga e ajuda consistência no índice.
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        },
      });
    }
  }

  const letter = b.storeDisplayName.trim().charAt(0).toUpperCase() || "?";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ea580c, #b91c1c)",
          color: "#fff",
          fontSize: 44,
          fontWeight: 800,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {letter}
      </div>
    ),
    { width: 64, height: 64 },
  );
}

import type { CSSProperties } from "react";
import type { SiteTheme } from "@prisma/client";
import { getThemeCssVars } from "@/config/themes";

/**
 * Converte o mapa de tema em estilo inline do <html> (custom properties).
 * Única ponte entre config/themes.ts e o runtime — sem ifs nos componentes.
 */
export function themeStyleForHtml(theme: SiteTheme): CSSProperties {
  const flat = getThemeCssVars(theme);
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(flat)) {
    style[`--${key}`] = value;
  }
  return style as CSSProperties;
}

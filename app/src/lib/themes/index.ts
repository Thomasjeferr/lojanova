import type { SiteTheme } from "@prisma/client";
import {
  THEME_META,
  THEME_IDS as THEME_IDS_ORDER,
  isValidThemeId as configIsValidThemeId,
  getThemeCssVars,
} from "@/config/themes";

export type ThemeId = SiteTheme;

export const THEME_IDS: ThemeId[] = [...THEME_IDS_ORDER];

export const THEME_DEFINITIONS: Record<
  ThemeId,
  {
    id: ThemeId;
    label: string;
    tagline: string;
    previewGradient: string;
    accentHex: string;
    previewCtaGradient: string;
    surface: "light" | "dark";
  }
> = {
  orange: { id: "orange", ...THEME_META.orange },
  red: { id: "red", ...THEME_META.red },
};

export { getThemeCssVars };

export function isValidThemeId(value: string): value is ThemeId {
  return configIsValidThemeId(value);
}

export function getThemeDefinition(id: ThemeId) {
  return THEME_DEFINITIONS[id];
}

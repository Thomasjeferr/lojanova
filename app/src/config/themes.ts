/**
 * Sistema de tema white-label — fonte única de verdade.
 * Todas as variáveis CSS são injetadas no <html> via layout (sem ifs nos componentes).
 */
import type { SiteTheme } from "@prisma/client";

export type ThemeId = SiteTheme;

/** Metadados para admin / previews (UI) */
export const THEME_META: Record<
  ThemeId,
  {
    label: string;
    tagline: string;
    previewGradient: string;
    accentHex: string;
    previewCtaGradient: string;
    /** Landing: claro ou escuro (documentação / futuros usos) */
    surface: "light" | "dark";
  }
> = {
  orange: {
    label: "Laranja premium",
    tagline: "Luz quente, profundidade e conversão — identidade SaaS luminosa.",
    previewGradient:
      "linear-gradient(155deg, #ffffff 0%, #fff7ed 22%, #ffedd5 48%, #fdba74 72%, #ea580c 100%)",
    accentHex: "#ea580c",
    previewCtaGradient:
      "linear-gradient(125deg, #fef08a 0%, #fb923c 42%, #ea580c 100%)",
    surface: "light",
  },
  red: {
    label: "Vermelho premium",
    tagline: "Noite carmesim — contraste editorial, produto high-ticket.",
    previewGradient:
      "linear-gradient(145deg, #0c0a0a 0%, #1f0a12 35%, #450a0a 55%, #9f1239 78%, #fb7185 100%)",
    accentHex: "#f43f5e",
    previewCtaGradient:
      "linear-gradient(135deg, #fb7185 0%, #e11d48 50%, #881337 100%)",
    surface: "dark",
  },
};

/**
 * Mapa flat: nome da variável CSS (sem --) → valor.
 * O layout prefixa com `--` ao aplicar no style do <html>.
 */
export const THEME_CSS_VARS: Record<ThemeId, Record<string, string>> = {
  orange: {
    /* ——— Marca / UI global (checkout, conta, admin) ——— */
    "theme-primary": "#d97706",
    "theme-primary-hover": "#b45309",
    "theme-primary-muted": "#fffbeb",
    "theme-primary-foreground": "#78350f",
    "theme-gradient-from": "#fde68a",
    "theme-gradient-via": "#fbbf24",
    "theme-gradient-to": "#ea580c",
    "theme-text-gradient-end": "#422006",
    "theme-btn-gradient":
      "linear-gradient(135deg, #fde047 0%, #f59e0b 42%, #d97706 88%, #b45309 100%)",
    "theme-btn-gradient-hover":
      "linear-gradient(135deg, #fef08a 0%, #f59e0b 35%, #ea580c 70%, #92400e 100%)",
    "theme-badge-gradient":
      "linear-gradient(135deg, #fcd34d 0%, #f59e0b 45%, #d97706 100%)",
    "theme-glow-a": "rgba(253, 186, 116, 0.42)",
    "theme-glow-b": "rgba(251, 146, 60, 0.28)",
    "theme-glow-c": "rgba(249, 115, 22, 0.14)",
    "theme-glow-ambient": "rgba(255, 237, 213, 0.72)",
    "theme-featured-border": "#f59e0b",
    "theme-featured-ring": "rgba(245, 158, 11, 0.45)",
    "theme-featured-shadow": "rgba(180, 83, 9, 0.22)",
    "theme-btn-shadow":
      "0 16px 48px -12px rgba(217, 119, 6, 0.5), 0 8px 20px -10px rgba(146, 64, 14, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.38)",
    "theme-btn-shadow-hover":
      "0 26px 64px -14px rgba(217, 119, 6, 0.55), 0 12px 28px -12px rgba(120, 53, 15, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.48)",
    "theme-badge-shadow":
      "0 12px 32px -8px rgba(217, 119, 6, 0.5), 0 4px 14px -4px rgba(146, 64, 14, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.42)",
    "theme-icon-bg": "#fffbeb",
    "theme-icon-fg": "#b45309",
    "theme-icon-tile-bg":
      "linear-gradient(145deg, #fffbeb 0%, #fef3c7 55%, #fde68a 100%)",
    "theme-icon-tile-border": "rgba(245, 158, 11, 0.25)",
    "theme-icon-tile-shadow":
      "0 6px 18px -6px rgba(217, 119, 6, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.88)",
    "theme-check-bg": "#ecfdf5",
    "theme-check-fg": "#059669",
    "theme-soft": "#fffbeb",
    "theme-soft-2": "#fef3c7",
    "theme-link": "#d97706",
    "theme-link-hover": "#b45309",
    "theme-ring": "#fbbf24",
    "theme-header-cta-bg":
      "linear-gradient(135deg, #fde047 0%, #f59e0b 38%, #ea580c 88%, #c2410c 100%)",
    "theme-header-cta-hover":
      "linear-gradient(135deg, #fef08a 0%, #fb923c 35%, #ea580c 65%, #9a3412 100%)",
    "theme-header-cta-shadow": "rgba(234, 88, 12, 0.42)",
    "theme-step-badge":
      "linear-gradient(145deg, #1c1917 0%, #44403c 45%, #57534e 100%)",
    "theme-success": "#059669",
    "theme-success-bg": "#ecfdf5",
    "theme-price-accent": "#c2410c",

    /* ——— Landing (fundo, tipografia, cartões) ——— */
    "landing-shell-bg":
      "linear-gradient(165deg, #ffffff 0%, #fffdfb 14%, #fff7ed 32%, #ffedd5 52%, #fff7ed 68%, #faf8f5 86%, #f5f2ed 100%)",
    "landing-mesh-overlay":
      "conic-gradient(from 200deg at 50% -30%, rgba(251, 191, 36, 0.14) 0deg, transparent 55deg, rgba(249, 115, 22, 0.08) 120deg, transparent 200deg, rgba(254, 215, 170, 0.12) 280deg, transparent 360deg), radial-gradient(ellipse 90% 55% at 50% 0%, rgba(255, 237, 213, 0.55) 0%, transparent 58%)",
    "landing-grid-line": "rgba(234, 88, 12, 0.055)",
    "landing-grid-opacity": "0.9",
    "landing-blob-a":
      "radial-gradient(circle at 30% 30%, rgba(254, 215, 170, 0.85) 0%, rgba(251, 191, 36, 0.35) 38%, rgba(249, 115, 22, 0.08) 62%, transparent 78%)",
    "landing-blob-b":
      "radial-gradient(circle at 70% 40%, rgba(253, 186, 116, 0.55) 0%, rgba(251, 146, 60, 0.22) 45%, transparent 68%)",
    "landing-blob-c":
      "radial-gradient(circle at 20% 80%, rgba(255, 247, 237, 0.9) 0%, rgba(255, 237, 213, 0.45) 40%, transparent 70%)",
    "landing-hero-fade":
      "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 252, 248, 0.45) 28%, rgba(255, 247, 237, 0.82) 55%, rgba(250, 248, 245, 0.96) 100%)",
    "landing-title-glow":
      "radial-gradient(ellipse 90% 120% at 50% 45%, rgba(251, 191, 36, 0.42) 0%, rgba(249, 115, 22, 0.18) 42%, rgba(234, 88, 12, 0.06) 58%, transparent 75%)",
    "landing-vignette":
      "radial-gradient(ellipse 100% 75% at 50% -8%, rgba(255, 255, 255, 0.5) 0%, transparent 42%), radial-gradient(ellipse 90% 60% at 50% 100%, transparent 40%, rgba(120, 53, 15, 0.035) 100%)",
    "landing-noise-opacity": "0.032",
    "landing-hero-pill-bg": "rgba(255, 255, 255, 0.52)",
    "landing-hero-pill-border": "rgba(251, 191, 36, 0.35)",
    "landing-hero-pill-shadow":
      "0 8px 32px -6px rgba(251, 146, 60, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.75)",
    "landing-text-primary": "#18181b",
    "landing-text-secondary": "#3f3f46",
    "landing-text-muted": "#71717a",
    "landing-text-subtle": "#a1a1aa",
    "landing-border": "rgba(24, 24, 27, 0.1)",
    "landing-border-strong": "rgba(24, 24, 27, 0.14)",
    "landing-section-alt-bg":
      "linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 250, 245, 0.88) 100%)",
    "landing-section-alt-border": "rgba(234, 88, 12, 0.07)",
    "landing-card-bg":
      "linear-gradient(165deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 252, 248, 0.88) 100%)",
    "landing-card-bg-solid": "#ffffff",
    "landing-card-border": "rgba(24, 24, 27, 0.07)",
    "landing-card-border-hover": "rgba(245, 158, 11, 0.42)",
    "landing-card-inset-shine":
      "inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(251, 191, 36, 0.07)",
    "landing-card-shadow":
      "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 16px 36px -12px rgba(234, 88, 12, 0.1), 0 8px 16px -8px rgba(24, 24, 27, 0.06)",
    "landing-card-shadow-hover":
      "0 24px 48px -14px rgba(217, 119, 6, 0.22), 0 12px 28px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(251, 191, 36, 0.12)",
    "landing-card-border-gradient":
      "linear-gradient(135deg, #fde68a 0%, #f59e0b 22%, #fb923c 48%, #ea580c 72%, #fcd34d 100%)",
    "landing-card-featured-inner-bg":
      "linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(255, 251, 245, 0.94) 100%)",
    "landing-card-featured-shell-shadow":
      "0 28px 64px -18px rgba(234, 88, 12, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.5) inset, 0 0 60px -20px rgba(245, 158, 11, 0.35)",
    "landing-card-featured-glow":
      "0 0 100px -24px rgba(245, 158, 11, 0.5), 0 0 48px -14px rgba(234, 88, 12, 0.3)",
    "landing-faq-item-bg":
      "linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 252, 248, 0.82) 100%)",
    "landing-header-bg-scrolled": "rgba(255, 252, 248, 0.78)",
    "landing-header-border": "rgba(234, 88, 12, 0.08)",
    "landing-header-text": "#18181b",
    "landing-header-link": "#52525b",
    "landing-header-link-hover-bg": "rgba(24, 24, 27, 0.05)",
    "landing-header-link-hover-text": "#18181b",
    "landing-logo-text": "#18181b",
    "landing-btn-secondary-bg": "rgba(255, 255, 255, 0.68)",
    "landing-btn-secondary-border": "rgba(234, 88, 12, 0.14)",
    "landing-btn-secondary-text": "#27272a",
    "landing-btn-secondary-hover-bg": "rgba(255, 255, 255, 0.92)",
    "landing-btn-secondary-hover-border": "rgba(249, 115, 22, 0.45)",
    "landing-footer-bg":
      "linear-gradient(180deg, #18181b 0%, #0c0a0a 55%, #09090b 100%)",
    "landing-footer-text": "#a1a1aa",
    "landing-footer-heading": "#fafafa",
    "landing-footer-border": "rgba(255, 255, 255, 0.08)",
    "landing-faq-divider": "rgba(24, 24, 27, 0.08)",
    "landing-plan-secondary-fg": "#fafaf9",
    "landing-plan-secondary-btn":
      "linear-gradient(165deg, #57534e 0%, #292524 38%, #1c1917 100%)",
    "landing-plan-secondary-btn-hover":
      "linear-gradient(165deg, #78716c 0%, #44403c 42%, #292524 100%)",
    "landing-plan-secondary-shadow":
      "0 10px 32px -8px rgba(28, 25, 23, 0.45), 0 0 0 1px rgba(251, 191, 36, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
    "landing-reveal-from": "translateY(20px)",
  },
  red: {
    "theme-primary": "#f43f5e",
    "theme-primary-hover": "#e11d48",
    "theme-primary-muted": "#fff1f2",
    "theme-primary-foreground": "#881337",
    "theme-gradient-from": "#fda4af",
    "theme-gradient-via": "#fb7185",
    "theme-gradient-to": "#f43f5e",
    "theme-text-gradient-end": "#fff1f2",
    "theme-btn-gradient":
      "linear-gradient(135deg, #fda4af 0%, #fb7185 32%, #e11d48 68%, #9f1239 100%)",
    "theme-btn-gradient-hover":
      "linear-gradient(135deg, #fecdd3 0%, #f43f5e 38%, #be123c 72%, #881337 100%)",
    "theme-badge-gradient":
      "linear-gradient(135deg, #fb7185 0%, #e11d48 48%, #881337 100%)",
    "theme-glow-a": "rgba(244, 63, 94, 0.45)",
    "theme-glow-b": "rgba(225, 29, 72, 0.28)",
    "theme-glow-c": "rgba(190, 18, 60, 0.2)",
    "theme-glow-ambient": "rgba(136, 19, 55, 0.35)",
    "theme-featured-border": "#fb7185",
    "theme-featured-ring": "rgba(244, 63, 94, 0.5)",
    "theme-featured-shadow": "rgba(225, 29, 72, 0.35)",
    "theme-btn-shadow":
      "0 16px 48px -12px rgba(225, 29, 72, 0.55), 0 8px 22px -10px rgba(88, 28, 35, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.28)",
    "theme-btn-shadow-hover":
      "0 28px 72px -14px rgba(244, 63, 94, 0.5), 0 14px 32px -12px rgba(67, 10, 24, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.38)",
    "theme-badge-shadow":
      "0 14px 36px -8px rgba(225, 29, 72, 0.55), 0 6px 16px -6px rgba(88, 28, 35, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.32)",
    "theme-icon-bg": "#fff1f2",
    "theme-icon-fg": "#be123c",
    "theme-icon-tile-bg":
      "linear-gradient(145deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)",
    "theme-icon-tile-border": "rgba(244, 63, 94, 0.22)",
    "theme-icon-tile-shadow":
      "0 6px 18px -8px rgba(225, 29, 72, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    "theme-check-bg": "#ecfdf5",
    "theme-check-fg": "#059669",
    "theme-soft": "#fff1f2",
    "theme-soft-2": "#ffe4e6",
    "theme-link": "#fb7185",
    "theme-link-hover": "#fda4af",
    "theme-ring": "#fb7185",
    "theme-header-cta-bg":
      "linear-gradient(135deg, #fda4af 0%, #e11d48 50%, #881337 100%)",
    "theme-header-cta-hover":
      "linear-gradient(135deg, #fecdd3 0%, #f43f5e 45%, #be123c 100%)",
    "theme-header-cta-shadow": "rgba(225, 29, 72, 0.45)",
    "theme-step-badge":
      "linear-gradient(145deg, #2a0a12 0%, #881337 42%, #e11d48 100%)",
    "theme-success": "#059669",
    "theme-success-bg": "#ecfdf5",
    "theme-price-accent": "#fda4af",

    "landing-shell-bg":
      "linear-gradient(180deg, #080606 0%, #120a0e 28%, #1a0c12 55%, #0f0608 100%)",
    "landing-grid-line": "rgba(244, 63, 94, 0.09)",
    "landing-grid-opacity": "1",
    "landing-blob-a":
      "radial-gradient(circle, rgba(225, 29, 72, 0.55) 0%, rgba(136, 19, 55, 0.25) 45%, transparent 68%)",
    "landing-blob-b":
      "radial-gradient(circle, rgba(244, 63, 94, 0.35) 0%, rgba(190, 18, 60, 0.15) 50%, transparent 72%)",
    "landing-blob-c":
      "radial-gradient(circle, rgba(251, 113, 133, 0.22) 0%, transparent 62%)",
    "landing-hero-fade":
      "linear-gradient(180deg, rgba(8, 6, 6, 0.15) 0%, rgba(18, 10, 14, 0.82) 50%, rgba(15, 6, 8, 0.95) 100%)",
    "landing-title-glow":
      "radial-gradient(ellipse 75% 100% at 50% 40%, rgba(244, 63, 94, 0.42) 0%, rgba(190, 18, 60, 0.15) 50%, transparent 72%)",
    "landing-vignette":
      "radial-gradient(ellipse 90% 65% at 50% -5%, rgba(251, 113, 133, 0.12) 0%, transparent 55%)",
    "landing-noise-opacity": "0.055",
    "landing-mesh-overlay":
      "conic-gradient(from 220deg at 50% -25%, rgba(244, 63, 94, 0.14) 0deg, transparent 55deg, rgba(136, 19, 55, 0.18) 130deg, transparent 210deg, rgba(251, 113, 133, 0.1) 290deg, transparent 360deg), radial-gradient(ellipse 85% 50% at 50% 0%, rgba(190, 18, 60, 0.28) 0%, transparent 56%)",
    "landing-hero-pill-bg": "rgba(24, 24, 27, 0.5)",
    "landing-hero-pill-border": "rgba(244, 63, 94, 0.32)",
    "landing-hero-pill-shadow":
      "0 8px 32px -8px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.07)",
    "landing-text-primary": "#fafaf9",
    "landing-text-secondary": "#e7e5e4",
    "landing-text-muted": "#a8a29e",
    "landing-text-subtle": "#78716c",
    "landing-border": "rgba(255, 255, 255, 0.08)",
    "landing-border-strong": "rgba(255, 255, 255, 0.12)",
    "landing-section-alt-bg": "rgba(255, 255, 255, 0.03)",
    "landing-section-alt-border": "rgba(255, 255, 255, 0.06)",
    "landing-card-bg":
      "linear-gradient(165deg, rgba(39, 39, 42, 0.55) 0%, rgba(28, 28, 31, 0.48) 100%)",
    "landing-card-bg-solid": "rgba(24, 24, 27, 0.72)",
    "landing-card-border": "rgba(255, 255, 255, 0.1)",
    "landing-card-border-hover": "rgba(244, 63, 94, 0.45)",
    "landing-card-inset-shine":
      "inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(244, 63, 94, 0.08)",
    "landing-card-shadow":
      "0 10px 36px -10px rgba(0, 0, 0, 0.55), 0 0 40px -16px rgba(225, 29, 72, 0.12)",
    "landing-card-shadow-hover":
      "0 28px 56px -14px rgba(225, 29, 72, 0.28), 0 14px 32px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(251, 113, 133, 0.15)",
    "landing-card-border-gradient":
      "linear-gradient(135deg, #fda4af 0%, #e11d48 42%, #881337 72%, #fb7185 100%)",
    "landing-card-featured-inner-bg":
      "linear-gradient(180deg, rgba(39, 39, 42, 0.94) 0%, rgba(24, 24, 27, 0.9) 100%)",
    "landing-card-featured-shell-shadow":
      "0 28px 64px -16px rgba(225, 29, 72, 0.38), 0 0 72px -20px rgba(244, 63, 94, 0.3)",
    "landing-card-featured-glow":
      "0 0 100px -24px rgba(244, 63, 94, 0.55), 0 0 48px -12px rgba(225, 29, 72, 0.35)",
    "landing-faq-item-bg":
      "linear-gradient(180deg, rgba(39, 39, 42, 0.78) 0%, rgba(28, 28, 31, 0.7) 100%)",
    "landing-header-bg-scrolled": "rgba(12, 10, 10, 0.75)",
    "landing-header-border": "rgba(255, 255, 255, 0.08)",
    "landing-header-text": "#fafaf9",
    "landing-header-link": "#d6d3d1",
    "landing-header-link-hover-bg": "rgba(255, 255, 255, 0.06)",
    "landing-header-link-hover-text": "#fafaf9",
    "landing-logo-text": "#fafaf9",
    "landing-btn-secondary-bg": "rgba(255, 255, 255, 0.05)",
    "landing-btn-secondary-border": "rgba(255, 255, 255, 0.14)",
    "landing-btn-secondary-text": "#fafaf9",
    "landing-btn-secondary-hover-bg": "rgba(255, 255, 255, 0.1)",
    "landing-btn-secondary-hover-border": "rgba(251, 113, 133, 0.45)",
    "landing-footer-bg":
      "linear-gradient(180deg, #050403 0%, #0c0a0a 50%, #000000 100%)",
    "landing-footer-text": "#a8a29e",
    "landing-footer-heading": "#fafaf9",
    "landing-footer-border": "rgba(255, 255, 255, 0.06)",
    "landing-faq-divider": "rgba(255, 255, 255, 0.08)",
    "landing-plan-secondary-fg": "#fafaf9",
    "landing-plan-secondary-btn":
      "linear-gradient(165deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)",
    "landing-plan-secondary-btn-hover":
      "linear-gradient(165deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 100%)",
    "landing-plan-secondary-shadow":
      "0 12px 36px -8px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(251, 113, 133, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    "landing-reveal-from": "translateY(24px)",
  },
};

export const THEME_IDS: ThemeId[] = ["orange", "red"];

export function getThemeCssVars(theme: ThemeId): Record<string, string> {
  return THEME_CSS_VARS[theme] ?? THEME_CSS_VARS.orange;
}

export function isValidThemeId(value: string): value is ThemeId {
  return THEME_IDS.includes(value as ThemeId);
}

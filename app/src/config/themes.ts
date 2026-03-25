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
    "theme-gradient-via": "#fb923c",
    "theme-gradient-to": "#ea580c",
    "theme-text-gradient-end": "#991b1b",
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
      "radial-gradient(ellipse 95% 60% at 18% 22%, rgba(251, 146, 60, 0.14) 0%, transparent 52%), radial-gradient(ellipse 80% 55% at 88% 12%, rgba(220, 38, 38, 0.1) 0%, transparent 48%), radial-gradient(ellipse 110% 70% at 100% -5%, rgba(220, 38, 38, 0.11) 0%, transparent 52%), radial-gradient(ellipse 90% 60% at -5% 105%, rgba(234, 88, 12, 0.14) 0%, transparent 55%), radial-gradient(ellipse 55% 40% at 50% 115%, rgba(251, 146, 60, 0.09) 0%, transparent 62%), linear-gradient(176deg, #fdfcfb 0%, #fff8f2 16%, #ffefe4 34%, #ffe8d9 52%, #faf3ed 76%, #f2eae3 100%)",
    "landing-aurora-gradient":
      "conic-gradient(from 135deg at 50% 45%, rgba(251, 146, 60, 0.42) 0deg, rgba(253, 186, 116, 0.16) 45deg, transparent 110deg, rgba(220, 38, 38, 0.2) 200deg, transparent 280deg, rgba(249, 115, 22, 0.28) 330deg, transparent 360deg)",
    "landing-aurora-opacity": "0.3",
    "landing-aurora-blend": "soft-light",
    "landing-premium-field-bg":
      "radial-gradient(ellipse 130% 85% at 50% -25%, rgba(251, 146, 60, 0.2) 0%, transparent 52%), radial-gradient(ellipse 75% 55% at 6% 45%, rgba(234, 88, 12, 0.11) 0%, transparent 46%), radial-gradient(ellipse 80% 58% at 96% 32%, rgba(220, 38, 38, 0.13) 0%, transparent 48%), linear-gradient(168deg, rgba(255, 253, 250, 0.5) 0%, transparent 38%, transparent 62%, rgba(254, 215, 170, 0.08) 100%)",
    "landing-premium-field-opacity": "0.88",
    "landing-premium-field-blend": "soft-light",
    "landing-shimmer-beams-opacity": "0.42",
    "landing-shimmer-beams-blend": "soft-light",
    "landing-global-readability-fade":
      "linear-gradient(180deg, transparent 0%, transparent 58%, rgba(255, 250, 245, 0.36) 86%, rgba(250, 245, 240, 0.55) 100%)",
    "landing-inset-glass-bg": "rgba(255, 255, 255, 0.34)",
    "landing-neural-layer-opacity": "0.64",
    "landing-neural-blend": "normal",
    "landing-neural-grad-a": "rgba(217, 119, 6, 0.72)",
    "landing-neural-grad-b": "rgba(251, 146, 60, 0.4)",
    "landing-neural-grad-c": "rgba(185, 28, 28, 0.58)",
    "landing-neural-pulse-a": "rgba(255, 250, 245, 0)",
    "landing-neural-pulse-mid": "rgba(253, 186, 116, 0.9)",
    "landing-neural-pulse-b": "rgba(249, 115, 22, 0)",
    "landing-neural-node-fill": "rgba(255, 255, 255, 0.65)",
    "landing-neural-hub-fill": "rgba(255, 253, 250, 0.92)",
    "landing-mesh-overlay":
      "conic-gradient(from 195deg at 48% -28%, rgba(251, 191, 36, 0.22) 0deg, transparent 52deg, rgba(220, 38, 38, 0.1) 118deg, transparent 195deg, rgba(249, 115, 22, 0.14) 268deg, transparent 360deg), radial-gradient(ellipse 95% 58% at 50% 0%, rgba(255, 237, 213, 0.58) 0%, transparent 58%)",
    "landing-grid-line": "rgba(234, 88, 12, 0.1)",
    "landing-grid-opacity": "0.95",
    "landing-blob-a":
      "radial-gradient(circle at 32% 28%, rgba(254, 215, 170, 0.88) 0%, rgba(251, 191, 36, 0.38) 36%, rgba(249, 115, 22, 0.1) 58%, transparent 76%)",
    "landing-blob-b":
      "radial-gradient(circle at 72% 38%, rgba(252, 165, 165, 0.22) 0%, rgba(253, 186, 116, 0.48) 38%, rgba(234, 88, 12, 0.14) 55%, transparent 70%)",
    "landing-blob-c":
      "radial-gradient(circle at 18% 78%, rgba(255, 247, 237, 0.92) 0%, rgba(255, 228, 220, 0.38) 42%, rgba(254, 202, 202, 0.08) 62%, transparent 74%)",
    "landing-hero-fade":
      "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 252, 248, 0.45) 28%, rgba(255, 247, 237, 0.82) 55%, rgba(250, 248, 245, 0.96) 100%)",
    "landing-title-glow":
      "radial-gradient(ellipse 90% 120% at 50% 45%, rgba(251, 191, 36, 0.42) 0%, rgba(249, 115, 22, 0.18) 42%, rgba(234, 88, 12, 0.06) 58%, transparent 75%)",
    "landing-vignette":
      "radial-gradient(ellipse 100% 72% at 50% -10%, rgba(255, 255, 255, 0.55) 0%, transparent 44%), radial-gradient(ellipse 92% 58% at 50% 102%, transparent 38%, rgba(120, 53, 15, 0.045) 100%), radial-gradient(ellipse 50% 35% at 85% 50%, transparent 40%, rgba(185, 28, 28, 0.025) 100%)",
    "landing-noise-opacity": "0.038",
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
      "linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 252, 248, 0.16) 48%, rgba(255, 248, 242, 0.2) 100%)",
    "landing-section-alt-border": "rgba(234, 88, 12, 0.09)",
    "landing-card-bg":
      "linear-gradient(168deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 253, 250, 0.28) 45%, rgba(255, 250, 245, 0.34) 100%)",
    "landing-card-bg-solid": "#ffffff",
    "landing-card-border": "rgba(234, 88, 12, 0.16)",
    "landing-card-border-hover": "rgba(245, 158, 11, 0.48)",
    "landing-card-inset-shine":
      "inset 0 1px 0 rgba(255, 255, 255, 0.92), inset 0 -1px 0 rgba(251, 191, 36, 0.1)",
    "landing-card-shadow":
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 20px 44px -14px rgba(234, 88, 12, 0.14), 0 10px 22px -10px rgba(24, 24, 27, 0.07), 0 0 0 1px rgba(255, 255, 255, 0.4) inset",
    "landing-card-shadow-hover":
      "0 28px 56px -16px rgba(217, 119, 6, 0.28), 0 14px 32px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(251, 191, 36, 0.18), 0 0 80px -24px rgba(220, 38, 38, 0.08)",
    "landing-card-border-gradient":
      "linear-gradient(135deg, #fde68a 0%, #f59e0b 22%, #fb923c 48%, #ea580c 72%, #fcd34d 100%)",
    "landing-card-featured-inner-bg":
      "linear-gradient(180deg, rgba(255, 255, 255, 0.52) 0%, rgba(255, 251, 245, 0.44) 100%)",
    "landing-card-featured-shell-shadow":
      "0 28px 64px -18px rgba(234, 88, 12, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.5) inset, 0 0 60px -20px rgba(245, 158, 11, 0.35)",
    "landing-card-featured-glow":
      "0 0 100px -24px rgba(245, 158, 11, 0.5), 0 0 48px -14px rgba(234, 88, 12, 0.3)",
    "landing-faq-item-bg":
      "linear-gradient(180deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 252, 248, 0.32) 100%)",
    "landing-header-bg-scrolled": "rgba(255, 252, 248, 0.78)",
    "landing-header-border": "rgba(234, 88, 12, 0.08)",
    "landing-header-text": "#18181b",
    "landing-header-link": "#52525b",
    "landing-header-link-hover-bg": "rgba(24, 24, 27, 0.05)",
    "landing-header-link-hover-text": "#18181b",
    "landing-logo-text": "#18181b",
    "landing-btn-secondary-bg": "rgba(255, 255, 255, 0.42)",
    "landing-btn-secondary-border": "rgba(234, 88, 12, 0.14)",
    "landing-btn-secondary-text": "#27272a",
    "landing-btn-secondary-hover-bg": "rgba(255, 255, 255, 0.62)",
    "landing-btn-secondary-hover-border": "rgba(249, 115, 22, 0.45)",
    "landing-footer-bg":
      "linear-gradient(180deg, rgba(15, 14, 13, 0.9) 0%, rgba(8, 7, 8, 0.94) 52%, rgba(4, 4, 5, 0.96) 100%)",
    "landing-footer-atmosphere":
      "radial-gradient(ellipse 95% 55% at 50% 0%, rgba(251, 146, 60, 0.14) 0%, transparent 52%), linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 42%), repeating-linear-gradient(92deg, transparent 0, transparent 52px, rgba(255, 255, 255, 0.028) 52px, rgba(255, 255, 255, 0.028) 53px)",
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
      "radial-gradient(ellipse 90% 58% at 22% 18%, rgba(244, 63, 94, 0.22) 0%, transparent 50%), radial-gradient(ellipse 85% 55% at 92% 8%, rgba(190, 18, 60, 0.28) 0%, transparent 52%), radial-gradient(ellipse 100% 65% at 50% -8%, rgba(251, 113, 133, 0.22) 0%, transparent 55%), radial-gradient(ellipse 80% 50% at 100% 100%, rgba(190, 18, 60, 0.26) 0%, transparent 58%), linear-gradient(185deg, #050304 0%, #0d0709 20%, #150a0f 46%, #11080d 70%, #060405 100%)",
    "landing-aurora-gradient":
      "conic-gradient(from 200deg at 50% 40%, rgba(244, 63, 94, 0.48) 0deg, transparent 70deg, rgba(136, 19, 55, 0.42) 160deg, transparent 250deg, rgba(251, 113, 133, 0.32) 320deg, transparent 360deg)",
    "landing-aurora-opacity": "0.34",
    "landing-aurora-blend": "screen",
    "landing-premium-field-bg":
      "radial-gradient(ellipse 120% 80% at 50% -22%, rgba(244, 63, 94, 0.18) 0%, transparent 50%), radial-gradient(ellipse 70% 50% at 8% 48%, rgba(190, 18, 60, 0.14) 0%, transparent 46%), radial-gradient(ellipse 75% 52% at 94% 28%, rgba(251, 113, 133, 0.12) 0%, transparent 48%), linear-gradient(175deg, rgba(255, 255, 255, 0.03) 0%, transparent 45%)",
    "landing-premium-field-opacity": "0.78",
    "landing-premium-field-blend": "screen",
    "landing-shimmer-beams-opacity": "0.32",
    "landing-shimmer-beams-blend": "overlay",
    "landing-global-readability-fade":
      "linear-gradient(180deg, transparent 0%, transparent 48%, rgba(8, 6, 6, 0.42) 90%, rgba(4, 3, 3, 0.78) 100%)",
    "landing-inset-glass-bg": "rgba(24, 24, 27, 0.42)",
    "landing-neural-layer-opacity": "0.68",
    "landing-neural-blend": "screen",
    "landing-neural-grad-a": "rgba(251, 113, 133, 0.55)",
    "landing-neural-grad-b": "rgba(244, 63, 94, 0.28)",
    "landing-neural-grad-c": "rgba(253, 164, 175, 0.45)",
    "landing-neural-pulse-a": "rgba(255, 241, 242, 0)",
    "landing-neural-pulse-mid": "rgba(254, 205, 211, 0.88)",
    "landing-neural-pulse-b": "rgba(251, 113, 133, 0)",
    "landing-neural-node-fill": "rgba(255, 255, 255, 0.38)",
    "landing-neural-hub-fill": "rgba(255, 241, 242, 0.85)",
    "landing-grid-line": "rgba(244, 63, 94, 0.14)",
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
      "conic-gradient(from 220deg at 50% -25%, rgba(244, 63, 94, 0.2) 0deg, transparent 55deg, rgba(136, 19, 55, 0.24) 130deg, transparent 210deg, rgba(251, 113, 133, 0.14) 290deg, transparent 360deg), radial-gradient(ellipse 85% 50% at 50% 0%, rgba(190, 18, 60, 0.34) 0%, transparent 54%)",
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
    "landing-section-alt-bg":
      "linear-gradient(180deg, rgba(255, 255, 255, 0.045) 0%, rgba(255, 255, 255, 0.02) 100%)",
    "landing-section-alt-border": "rgba(255, 255, 255, 0.06)",
    "landing-card-bg":
      "linear-gradient(165deg, rgba(39, 39, 42, 0.36) 0%, rgba(28, 28, 31, 0.3) 100%)",
    "landing-card-bg-solid": "rgba(24, 24, 27, 0.72)",
    "landing-card-border": "rgba(244, 63, 94, 0.2)",
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
      "linear-gradient(180deg, rgba(39, 39, 42, 0.52) 0%, rgba(24, 24, 27, 0.44) 100%)",
    "landing-card-featured-shell-shadow":
      "0 28px 64px -16px rgba(225, 29, 72, 0.38), 0 0 72px -20px rgba(244, 63, 94, 0.3)",
    "landing-card-featured-glow":
      "0 0 100px -24px rgba(244, 63, 94, 0.55), 0 0 48px -12px rgba(225, 29, 72, 0.35)",
    "landing-faq-item-bg":
      "linear-gradient(180deg, rgba(39, 39, 42, 0.42) 0%, rgba(28, 28, 31, 0.36) 100%)",
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
      "linear-gradient(180deg, rgba(5, 4, 3, 0.92) 0%, rgba(8, 6, 6, 0.96) 50%, rgba(0, 0, 0, 0.97) 100%)",
    "landing-footer-atmosphere":
      "radial-gradient(ellipse 95% 50% at 50% 0%, rgba(244, 63, 94, 0.12) 0%, transparent 50%), linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 40%), repeating-linear-gradient(88deg, transparent 0, transparent 48px, rgba(255, 255, 255, 0.02) 48px, rgba(255, 255, 255, 0.02) 49px)",
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

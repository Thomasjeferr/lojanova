/**
 * URL do estilo vector (MapLibre) para o mapa de atividade.
 * Podes definir:
 * - NEXT_PUBLIC_MAPLIBRE_STYLE_URL — qualquer estilo (MapTiler, Stadia, etc.)
 * - NEXT_PUBLIC_MAPTILER_KEY — atalho para o tema dark da MapTiler
 * Sem variáveis: fallbacks públicos (Carto / OSM attribution no próprio estilo)
 */
const CARTO_DARK = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const CARTO_LIGHT = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export function getMaplibreStyleUrl(
  options: { lightBasemap?: boolean } = {},
): string {
  const fromEnv = process.env.NEXT_PUBLIC_MAPLIBRE_STYLE_URL?.trim();
  if (fromEnv) return fromEnv;

  const tiler = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();
  if (tiler) {
    return `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${encodeURIComponent(
      tiler,
    )}`;
  }

  return options.lightBasemap ? CARTO_LIGHT : CARTO_DARK;
}

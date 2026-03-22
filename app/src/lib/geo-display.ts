/**
 * Decodifica cidade/país quando vêm com encode URI (ex.: `x-vercel-ip-city`: "Est%C3%A2ncia%20Velha").
 * Mantém o texto original se não for encoding válido ou se `decodeURIComponent` falhar.
 */
export function decodeGeoDisplayPart(value: string | null | undefined): string | null {
  if (value == null) return null;
  const t = value.trim();
  if (!t) return null;
  try {
    return decodeURIComponent(t.replace(/\+/g, " "));
  } catch {
    return t;
  }
}
